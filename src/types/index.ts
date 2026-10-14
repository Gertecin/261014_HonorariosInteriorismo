export type TipoEspacio = 'Vivienda' | 'Gastronomico' | 'Hospedaje';
export type NombreEtapa = 'Anteproyecto' | 'Proyecto Ejecutivo' | 'Direccion de Obra';
export type EstadoEtapa = 'Pendiente' | 'Entregada';
export type EstadoPago = 'Pendiente' | 'Cobrado';

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
  pagoAsociado: number;
  estaCobrado: boolean;
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
