import { Proyecto } from '../types';
import { calcularPropuesta } from '../utils/calculations';

export const generarDatosEjemplo = (): Proyecto[] => {
  const base = calcularPropuesta('Hospedaje', 250, 80000000);
  
  const proyectoEjemplo: Proyecto = {
    id: 'proj-001',
    nombre: 'Reforma Casa a Hostal (8 Habitaciones)',
    cliente: 'Inversiones del Sur S.A.',
    tipoEspacio: 'Hospedaje',
    superficie: 250,
    presupuestoObra: 80000000,
    honorarioTotal: base.honorarioTotal,
    anticipo: base.anticipo,
    anticipoCobrado: true,
    fechaCreacion: new Date().toISOString(),
    historialCambios: ['Inicio de proyecto'],
    etapas: base.etapas.map(etapa => {
      if (etapa.nombre === 'Anteproyecto') {
        return { ...etapa, estado: 'Entregada', estaCobrado: true };
      }
      if (etapa.nombre === 'Proyecto Ejecutivo') {
        return { ...etapa, estado: 'Entregada', estaCobrado: false };
      }
      return etapa;
    })
  };

  return [proyectoEjemplo];
};
