import { ConfigEtapa, TipoEspacio } from './types';

export const MINIMO_POR_M2_TOTAL = 12000;

export const CONFIG_ETAPAS: Record<TipoEspacio, ConfigEtapa[]> = {
  Vivienda: [
    { nombre: 'Anteproyecto', porcentaje: 2, incluye: ['Planta de distribución', 'Moodboard', 'Dos vistas 3D'], plazo: '3 semanas' },
    { nombre: 'Proyecto Ejecutivo', porcentaje: 4, incluye: ['Planos de detalle', 'Planillas de terminaciones', 'Mobiliario a medida'], plazo: '6 semanas' },
    { nombre: 'Direccion de Obra', porcentaje: 4, incluye: ['Visitas semanales', 'Acta Semanal'], plazo: 'Según obra' },
  ],
  Gastronomico: [
    { nombre: 'Anteproyecto', porcentaje: 2.5, incluye: ['Planta de distribución', 'Moodboard', 'Dos vistas 3D'], plazo: '3 semanas' },
    { nombre: 'Proyecto Ejecutivo', porcentaje: 5, incluye: ['Planos de detalle', 'Planillas de terminaciones', 'Mobiliario a medida'], plazo: '6 semanas' },
    { nombre: 'Direccion de Obra', porcentaje: 4.5, incluye: ['Visitas semanales', 'Acta Semanal'], plazo: 'Según obra' },
  ],
  Hospedaje: [
    { nombre: 'Anteproyecto', porcentaje: 2.5, incluye: ['Planta de distribución', 'Moodboard', 'Dos vistas 3D'], plazo: '3 semanas' },
    { nombre: 'Proyecto Ejecutivo', porcentaje: 5, incluye: ['Planos de detalle', 'Planillas de terminaciones', 'Mobiliario a medida'], plazo: '6 semanas' },
    { nombre: 'Direccion de Obra', porcentaje: 5, incluye: ['Visitas semanales', 'Acta Semanal'], plazo: 'Según obra' },
  ],
};
