export type TipoEspacio = 'Vivienda' | 'Gastronomico' | 'Hospedaje';
export type NombreEtapa = 'Anteproyecto' | 'Proyecto Ejecutivo' | 'Direccion de Obra';
export type EstadoEtapa = 'Pendiente' | 'Entregada' | 'Cobrada';

export interface ConfigEtapa {
  nombre: NombreEtapa;
  porcentaje: number;
  incluye: string[];
  plazo: string;
}

export interface EtapaProyecto {
  id: string;
  nombre: NombreEtapa;
  estado: EstadoEtapa;
  honorarioCalculado: number;
  anticipoAsociado: number;
  pagoPendiente: number;
  tareasCompletadas: string[];
  fechaEntrega?: string;
  fechaCobro?: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  cliente: string;
  tipoEspacio: TipoEspacio;
  superficie: number;
  presupuestoObra: number;
  honorarioTotal: number;
  anticipo: number;
  anticipoCobrado: boolean;
  etapas: EtapaProyecto[];
  fechaCreacion: string;
  historialCambios: string[];
}
