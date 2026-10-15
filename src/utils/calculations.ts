import { CONFIG_ETAPAS, MINIMO_POR_M2_TOTAL } from '../constants';
import { Proyecto, TipoEspacio, EtapaProyecto } from '../types';

export const calcularPropuesta = (
  tipoEspacio: TipoEspacio,
  superficie: number,
  presupuestoObra: number,
  porcentajeAnticipo: number = 30
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
      anticipoAsociado: 0,
      pagoPendiente: 0,
      tareasCompletadas: [],
    });
  });

  const anticipo = honorarioTotal * (porcentajeAnticipo / 100);

  etapasCalculadas.forEach(etapa => {
    etapa.anticipoAsociado = etapa.honorarioCalculado * (anticipo / honorarioTotal);
    etapa.pagoPendiente = etapa.honorarioCalculado - etapa.anticipoAsociado;
  });

  return { honorarioTotal, anticipo, etapas: etapasCalculadas };
};

export const aplicarCambioAlcance = (
  proyectoActual: Proyecto,
  nuevaSuperficie: number,
  nuevoPresupuestoObra: number
): Proyecto => {
  const config = CONFIG_ETAPAS[proyectoActual.tipoEspacio];
  const sumaPorcentajes = config.reduce((sum, etapa) => sum + etapa.porcentaje, 0);

  let nuevoHonorarioTotal = 0;
  const nuevasEtapas: EtapaProyecto[] = [];

  // Calcular porcentaje de anticipo original (por si no está cobrado)
  const porcentajeAnticipoOriginal = proyectoActual.honorarioTotal > 0 
    ? (proyectoActual.anticipo / proyectoActual.honorarioTotal) * 100 
    : 30;

  proyectoActual.etapas.forEach((etapaVieja) => {
    const configEtapa = config.find(e => e.nombre === etapaVieja.nombre);
    if (!configEtapa) return;

    // Si la etapa está cobrada, mantener todo intacto
    if (etapaVieja.estado === 'Cobrada') {
      nuevoHonorarioTotal += etapaVieja.honorarioCalculado;
      nuevasEtapas.push(etapaVieja);
      return;
    }

    // Recalcular honorario de la etapa
    const honorarioPorPorcentaje = nuevoPresupuestoObra * (configEtapa.porcentaje / 100);
    const pesoEtapa = configEtapa.porcentaje / sumaPorcentajes;
    const honorarioPorMinimo = nuevaSuperficie * MINIMO_POR_M2_TOTAL * pesoEtapa;
    const nuevoHonorario = Math.max(honorarioPorPorcentaje, honorarioPorMinimo);

    nuevoHonorarioTotal += nuevoHonorario;

    // Si el anticipo ya está cobrado, mantener el anticipoAsociado original
    // Si no está cobrado, recalcularlo con el nuevo honorario
    const nuevoAnticipoAsociado = proyectoActual.anticipoCobrado 
      ? etapaVieja.anticipoAsociado 
      : nuevoHonorario * (porcentajeAnticipoOriginal / 100);

    nuevasEtapas.push({
      ...etapaVieja,
      honorarioCalculado: nuevoHonorario,
      anticipoAsociado: nuevoAnticipoAsociado,
      pagoPendiente: nuevoHonorario - nuevoAnticipoAsociado,
    });
  });

  // Recalcular anticipo total si no está cobrado
  const nuevoAnticipo = proyectoActual.anticipoCobrado 
    ? proyectoActual.anticipo 
    : nuevoHonorarioTotal * (porcentajeAnticipoOriginal / 100);

  return {
    ...proyectoActual,
    superficie: nuevaSuperficie,
    presupuestoObra: nuevoPresupuestoObra,
    honorarioTotal: nuevoHonorarioTotal,
    anticipo: nuevoAnticipo,
    etapas: nuevasEtapas,
    historialCambios: [
      ...proyectoActual.historialCambios,
      `Cambio de alcance: Superficie ${nuevaSuperficie}m², Presupuesto $${nuevoPresupuestoObra.toLocaleString()}`
    ]
  };
};

export const calcularSaldoPendiente = (proyecto: Proyecto): number => {
  const anticipoPendiente = proyecto.anticipoCobrado ? 0 : proyecto.anticipo;
  const etapasPendientes = proyecto.etapas
    .filter(e => e.estado !== 'Cobrada')
    .reduce((sum, e) => sum + e.pagoPendiente, 0);
  return anticipoPendiente + etapasPendientes;
};

export const calcularTotalCobrado = (proyecto: Proyecto): number => {
  const anticipoCobrado = proyecto.anticipoCobrado ? proyecto.anticipo : 0;
  const etapasCobradas = proyecto.etapas
    .filter(e => e.estado === 'Cobrada')
    .reduce((sum, e) => sum + e.honorarioCalculado, 0);
  return anticipoCobrado + etapasCobradas;
};
