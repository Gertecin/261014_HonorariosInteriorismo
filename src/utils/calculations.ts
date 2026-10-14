import { CONFIG_ETAPAS, MINIMO_POR_M2_TOTAL } from '../constants';
import { Proyecto, TipoEspacio, EtapaProyecto } from '../types';

export const calcularPropuesta = (
  tipoEspacio: TipoEspacio,
  superficie: number,
  presupuestoObra: number
): { honorarioTotal: number; anticipo: number; etapas: EtapaProyecto[] } => {
  const config = CONFIG_ETAPAS[tipoEspacio];
  const sumaPorcentajes = config.reduce((sum, etapa) => sum + etapa.porcentaje, 0);
  
  let honorarioTotal = 0;
  const etapasCalculadas: EtapaProyecto[] = [];

  config.forEach((etapaConfig, index) => {
    const honorarioPorPorcentaje = presupuestoObra * (etapaConfig.porcentaje / 100);
    const pesoEtapa = etapaConfig.porcentaje / sumaPorcentajes;
    const honorarioPorMinimo = superficie * MINIMO_POR_M2_TOTAL * pesoEtapa;
    
    const honorarioEtapa = Math.max(honorarioPorPorcentaje, honorarioPorMinimo);
    honorarioTotal += honorarioEtapa;

    etapasCalculadas.push({
      id: `etapa-${index}`,
      nombre: etapaConfig.nombre,
      estado: 'Pendiente',
      honorarioCalculado: honorarioEtapa,
      pagoAsociado: 0,
      estaCobrado: false,
    });
  });

  const anticipo = honorarioTotal * 0.30;
  const saldoRestante = honorarioTotal - anticipo;

  etapasCalculadas.forEach(etapa => {
    const proporcion = etapa.honorarioCalculado / honorarioTotal;
    etapa.pagoAsociado = saldoRestante * proporcion;
  });

  return { honorarioTotal, anticipo, etapas: etapasCalculadas };
};

export const aplicarCambioAlcance = (
  proyectoActual: Proyecto,
  nuevaSuperficie: number,
  nuevoPresupuestoObra: number
): Proyecto => {
  const { honorarioTotal: nuevoTotal, etapas: nuevasEtapasRaw } = calcularPropuesta(
    proyectoActual.tipoEspacio,
    nuevaSuperficie,
    nuevoPresupuestoObra
  );

  const montoYaCobrado = (proyectoActual.anticipoCobrado ? proyectoActual.anticipo : 0) + 
    proyectoActual.etapas.reduce((sum, e) => e.estaCobrado ? sum + e.pagoAsociado : 0, 0);

  const nuevoSaldoPendiente = nuevoTotal - montoYaCobrado;

  const etapasNoCobradas = nuevasEtapasRaw.filter(e => {
    const etapaVieja = proyectoActual.etapas.find(ve => ve.nombre === e.nombre);
    return !etapaVieja?.estaCobrado;
  });

  const sumaHonorariosNoCobrados = etapasNoCobradas.reduce((sum, e) => sum + e.honorarioCalculado, 0);

  const etapasFinales = proyectoActual.etapas.map(etapaVieja => {
    if (etapaVieja.estaCobrado) {
      return etapaVieja;
    }
    
    const etapaNuevaRaw = nuevasEtapasRaw.find(e => e.nombre === etapaVieja.nombre)!;
    const proporcion = sumaHonorariosNoCobrados > 0 ? etapaNuevaRaw.honorarioCalculado / sumaHonorariosNoCobrados : 0;
    
    return {
      ...etapaVieja,
      honorarioCalculado: etapaNuevaRaw.honorarioCalculado,
      pagoAsociado: nuevoSaldoPendiente * proporcion,
    };
  });

  return {
    ...proyectoActual,
    superficie: nuevaSuperficie,
    presupuestoObra: nuevoPresupuestoObra,
    honorarioTotal: nuevoTotal,
    etapas: etapasFinales,
    historialCambios: [
      ...proyectoActual.historialCambios,
      `Cambio de alcance: Superficie ${nuevaSuperficie}m², Presupuesto $${nuevoPresupuestoObra.toLocaleString()}`
    ]
  };
};
