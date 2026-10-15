import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import Button from '../components/ui/Button'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Proyecto, TipoEspacio, NombreEtapa, EtapaProyecto } from '../types'
import { MINIMO_POR_M2_TOTAL } from '../constants'
import { generarDatosEjemplo } from '../data/seed'

interface EtapaPreview {
  nombre: NombreEtapa;
  porcentaje: number;
  honorarioCalculado: number;
  anticipoAsociado: number;
  pagoPendiente: number;
}

interface PreviewData {
  honorarioTotal: number;
  anticipo: number;
  valorM2: number;
  etapas: EtapaPreview[];
}

const PORCENTAJES_DEFAULT: Record<string, Record<NombreEtapa, number>> = {
  Vivienda: { 'Anteproyecto': 2, 'Proyecto Ejecutivo': 4, 'Direccion de Obra': 4 },
  Gastronomico: { 'Anteproyecto': 2.5, 'Proyecto Ejecutivo': 5, 'Direccion de Obra': 4.5 },
  Hospedaje: { 'Anteproyecto': 2.5, 'Proyecto Ejecutivo': 5, 'Direccion de Obra': 5 },
};

export default function NuevoProyecto() {
  const navigate = useNavigate()
  const location = useLocation()
  const proyectoEditar = (location.state as any)?.proyectoEditar

  const [proyectos, setProyectos] = useLocalStorage<Proyecto[]>(
    'bianchi-proyectos',
    generarDatosEjemplo()
  )

  const [formData, setFormData] = useState({
    nombre: proyectoEditar?.nombre || '',
    cliente: proyectoEditar?.cliente || '',
    superficie: proyectoEditar?.superficie?.toString() || '',
    presupuestoObra: proyectoEditar?.presupuestoObra?.toString() || '',
    porcentajeAnticipo: '30',
    tipoEspacio: (proyectoEditar?.tipoEspacio || 'Vivienda') as TipoEspacio | 'Otro',
    tipoEspacioPersonalizado: '',
  })

  const [porcentajes, setPorcentajes] = useState<Record<NombreEtapa, number>>(() => {
    if (proyectoEditar) {
      return { 'Anteproyecto': 2, 'Proyecto Ejecutivo': 4, 'Direccion de Obra': 4 };
    }
    const tipo = formData.tipoEspacio as TipoEspacio;
    return PORCENTAJES_DEFAULT[tipo] || { 'Anteproyecto': 2, 'Proyecto Ejecutivo': 4, 'Direccion de Obra': 4 };
  })

  const [valorM2, setValorM2] = useState<string>('')
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [modoCalculo, setModoCalculo] = useState<'porcentajes' | 'valorM2'>('porcentajes')
  const [usuarioModificoM2, setUsuarioModificoM2] = useState(false)

  useEffect(() => {
    const superficie = parseFloat(formData.superficie) || 0;
    const presupuestoObra = parseFloat(formData.presupuestoObra) || 0;
    const porcentajeAnticipo = parseFloat(formData.porcentajeAnticipo) || 30;

    if (superficie > 0) {
      let honorarioTotal = 0;
      const etapasCalculadas: EtapaPreview[] = [];
      const nombresEtapas: NombreEtapa[] = ['Anteproyecto', 'Proyecto Ejecutivo', 'Direccion de Obra'];

      if (modoCalculo === 'porcentajes' && presupuestoObra > 0) {
        const sumaPorcentajes = Object.values(porcentajes).reduce((sum, p) => sum + p, 0);
        if (sumaPorcentajes === 0) { setPreview(null); setShowPreview(false); return; }

        nombresEtapas.forEach((nombre) => {
          const porcentaje = porcentajes[nombre];
          const honorarioPorPorcentaje = presupuestoObra * (porcentaje / 100);
          const pesoEtapa = porcentaje / sumaPorcentajes;
          const honorarioPorMinimo = superficie * MINIMO_POR_M2_TOTAL * pesoEtapa;
          const honorarioEtapa = Math.max(honorarioPorPorcentaje, honorarioPorMinimo);
          honorarioTotal += honorarioEtapa;
          etapasCalculadas.push({ nombre, porcentaje, honorarioCalculado: honorarioEtapa, anticipoAsociado: 0, pagoPendiente: 0 });
        });

        const anticipo = honorarioTotal * (porcentajeAnticipo / 100);
        const valorM2Calculado = honorarioTotal / superficie;
        etapasCalculadas.forEach(etapa => {
          etapa.anticipoAsociado = etapa.honorarioCalculado * (anticipo / honorarioTotal);
          etapa.pagoPendiente = etapa.honorarioCalculado - etapa.anticipoAsociado;
        });

        setPreview({ honorarioTotal, anticipo, valorM2: valorM2Calculado, etapas: etapasCalculadas });
        
        if (!usuarioModificoM2) {
          setValorM2(valorM2Calculado.toFixed(0));
        }
        setShowPreview(true);
      } else if (modoCalculo === 'valorM2') {
        const valorM2Usar = parseFloat(valorM2) || 0;
        if (valorM2Usar <= 0) { setPreview(null); setShowPreview(false); return; }

        honorarioTotal = superficie * valorM2Usar;
        const sumaPorcentajes = Object.values(porcentajes).reduce((sum, p) => sum + p, 0);

        if (sumaPorcentajes > 0) {
          nombresEtapas.forEach((nombre) => {
            const proporcion = porcentajes[nombre] / sumaPorcentajes;
            const honorarioEtapa = honorarioTotal * proporcion;
            etapasCalculadas.push({ nombre, porcentaje: porcentajes[nombre], honorarioCalculado: honorarioEtapa, anticipoAsociado: 0, pagoPendiente: 0 });
          });
        }

        const anticipo = honorarioTotal * (porcentajeAnticipo / 100);
        etapasCalculadas.forEach(etapa => {
          etapa.anticipoAsociado = etapa.honorarioCalculado * (anticipo / honorarioTotal);
          etapa.pagoPendiente = etapa.honorarioCalculado - etapa.anticipoAsociado;
        });

        setPreview({ honorarioTotal, anticipo, valorM2: valorM2Usar, etapas: etapasCalculadas });
        setShowPreview(true);
      }
    } else {
      setPreview(null);
      setShowPreview(false);
    }
  }, [formData, porcentajes, valorM2, modoCalculo, usuarioModificoM2]);

  useEffect(() => {
    if (proyectoEditar) return;
    if (formData.tipoEspacio !== 'Otro' && formData.tipoEspacio in PORCENTAJES_DEFAULT) {
      setPorcentajes(PORCENTAJES_DEFAULT[formData.tipoEspacio as TipoEspacio]);
    }
  }, [formData.tipoEspacio, proyectoEditar]);

  const handleValorM2Change = (valor: string) => {
    setValorM2(valor);
    setUsuarioModificoM2(true);
    setModoCalculo('valorM2');
  };

  const handlePresupuestoChange = (valor: string) => {
    setFormData({ ...formData, presupuestoObra: valor });
    setUsuarioModificoM2(false);
    setModoCalculo('porcentajes');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const superficie = parseFloat(formData.superficie);
    const presupuestoObra = parseFloat(formData.presupuestoObra) || 0;
    const porcentajeAnticipo = parseFloat(formData.porcentajeAnticipo) || 30;

    if (!formData.nombre || !formData.cliente || superficie <= 0) {
      alert('Por favor completá todos los campos correctamente'); return;
    }
    if (formData.tipoEspacio === 'Otro' && !formData.tipoEspacioPersonalizado) {
      alert('Por favor especificá el tipo de espacio personalizado'); return;
    }

    let honorarioTotalFinal = 0;
    const etapasFinales: EtapaProyecto[] = [];
    const nombresEtapas: NombreEtapa[] = ['Anteproyecto', 'Proyecto Ejecutivo', 'Direccion de Obra'];

    if (modoCalculo === 'porcentajes') {
      if (presupuestoObra <= 0) {
        alert('Ingresá el presupuesto de obra o modificá el valor $/m²'); return;
      }
      const sumaPorcentajes = Object.values(porcentajes).reduce((sum, p) => sum + p, 0);
      if (sumaPorcentajes === 0) { alert('Los porcentajes deben ser mayores a cero'); return; }

      nombresEtapas.forEach((nombre, index) => {
        const porcentaje = porcentajes[nombre];
        const honorarioPorPorcentaje = presupuestoObra * (porcentaje / 100);
        const pesoEtapa = porcentaje / sumaPorcentajes;
        const honorarioPorMinimo = superficie * MINIMO_POR_M2_TOTAL * pesoEtapa;
        const honorarioEtapa = Math.max(honorarioPorPorcentaje, honorarioPorMinimo);
        honorarioTotalFinal += honorarioEtapa;
        etapasFinales.push({ id: `etapa-${index}`, nombre, estado: 'Pendiente' as const, honorarioCalculado: honorarioEtapa, anticipoAsociado: 0, pagoPendiente: 0, tareasCompletadas: [] });
      });
    } else {
      const valorM2Usar = parseFloat(valorM2) || 0;
      if (valorM2Usar <= 0) { alert('El valor por m² debe ser mayor a cero'); return; }

      honorarioTotalFinal = superficie * valorM2Usar;
      const sumaPorcentajes = Object.values(porcentajes).reduce((sum, p) => sum + p, 0);

      if (sumaPorcentajes > 0) {
        nombresEtapas.forEach((nombre, index) => {
          const proporcion = porcentajes[nombre] / sumaPorcentajes;
          const honorarioEtapa = honorarioTotalFinal * proporcion;
          etapasFinales.push({ id: `etapa-${index}`, nombre, estado: 'Pendiente' as const, honorarioCalculado: honorarioEtapa, anticipoAsociado: 0, pagoPendiente: 0, tareasCompletadas: [] });
        });
      }
    }

    const anticipoFinal = honorarioTotalFinal * (porcentajeAnticipo / 100);
    etapasFinales.forEach(etapa => {
      etapa.anticipoAsociado = etapa.honorarioCalculado * (anticipoFinal / honorarioTotalFinal);
      etapa.pagoPendiente = etapa.honorarioCalculado - etapa.anticipoAsociado;
    });

    const tipoEspacioFinal = formData.tipoEspacio === 'Otro' ? formData.tipoEspacioPersonalizado as TipoEspacio : formData.tipoEspacio as TipoEspacio;

    if (proyectoEditar) {
      const updatedProyectos = proyectos.map(p => {
        if (p.id === proyectoEditar.id) {
          return { ...p, nombre: formData.nombre, cliente: formData.cliente, tipoEspacio: tipoEspacioFinal, superficie, presupuestoObra, honorarioTotal: honorarioTotalFinal, anticipo: anticipoFinal, anticipoCobrado: false, etapas: etapasFinales, historialCambios: [...p.historialCambios, `Proyecto reeditado - ${new Date().toLocaleDateString('es-AR')}`] };
        }
        return p;
      });
      setProyectos(updatedProyectos);
      navigate(`/proyecto/${proyectoEditar.id}`);
    } else {
      const nuevoProyecto: Proyecto = { id: `proj-${Date.now()}`, nombre: formData.nombre, cliente: formData.cliente, tipoEspacio: tipoEspacioFinal, superficie, presupuestoObra, honorarioTotal: honorarioTotalFinal, anticipo: anticipoFinal, anticipoCobrado: false, etapas: etapasFinales, fechaCreacion: new Date().toISOString(), historialCambios: ['Proyecto creado'] };
      setProyectos([...proyectos, nuevoProyecto]);
      navigate('/');
    }
  };

  const formatearMoneda = (monto: number): string => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(monto);
  };

  const handlePorcentajeChange = (etapa: NombreEtapa, valor: string) => {
    setPorcentajes(prev => ({ ...prev, [etapa]: parseFloat(valor) || 0 }));
  };

  const sumaPorcentajes = Object.values(porcentajes).reduce((sum, p) => sum + p, 0);

  return (
    <div className="pb-8 min-h-screen bg-bianchi-cemento-light">
      <Header />
      <main className="max-w-md mx-auto px-4 mt-6">
        <h1 className="font-futura text-2xl text-bianchi-cemento-dark mb-6 animate-fade-in-up">
          {proyectoEditar ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-fade-in-up stagger-1" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <label className="block font-inter text-sm font-medium text-bianchi-cemento-dark mb-2">Nombre del Proyecto</label>
            <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Reforma Casa a Hostal" className="w-full px-4 py-3 border border-bianchi-cemento-light rounded-lg font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota bg-white transition-all duration-200" required />
          </div>

          <div className="animate-fade-in-up stagger-2" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <label className="block font-inter text-sm font-medium text-bianchi-cemento-dark mb-2">Cliente</label>
            <input type="text" value={formData.cliente} onChange={(e) => setFormData({ ...formData, cliente: e.target.value })} placeholder="Ej: Inversiones del Sur S.A." className="w-full px-4 py-3 border border-bianchi-cemento-light rounded-lg font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota bg-white transition-all duration-200" required />
          </div>

          <div className="animate-fade-in-up stagger-3" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <label className="block font-inter text-sm font-medium text-bianchi-cemento-dark mb-2">Tipo de Espacio</label>
            <select value={formData.tipoEspacio} onChange={(e) => setFormData({ ...formData, tipoEspacio: e.target.value as TipoEspacio | 'Otro' })} className="w-full px-4 py-3 border border-bianchi-cemento-light rounded-lg font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota bg-white">
              <option value="Vivienda">Vivienda</option>
              <option value="Gastronomico">Gastronómico</option>
              <option value="Hospedaje">Hospedaje</option>
              <option value="Otro">Otro (personalizado)</option>
            </select>
          </div>

          {formData.tipoEspacio === 'Otro' && (
            <div className="animate-fade-in-up">
              <label className="block font-inter text-sm font-medium text-bianchi-cemento-dark mb-2">Especificar Tipo de Espacio</label>
              <input type="text" value={formData.tipoEspacioPersonalizado} onChange={(e) => setFormData({ ...formData, tipoEspacioPersonalizado: e.target.value })} placeholder="Ej: Oficina Corporativa" className="w-full px-4 py-3 border border-bianchi-cemento-light rounded-lg font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota bg-white" required />
            </div>
          )}

          <div className="animate-fade-in-up stagger-4" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <label className="block font-inter text-sm font-medium text-bianchi-cemento-dark mb-2">Superficie (m²)</label>
            <input type="number" value={formData.superficie} onChange={(e) => setFormData({ ...formData, superficie: e.target.value })} placeholder="Ej: 250" min="1" className="w-full px-4 py-3 border border-bianchi-cemento-light rounded-lg font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota bg-white transition-all duration-200" required />
          </div>

          <div className="animate-fade-in-up stagger-5" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <label className="block font-inter text-sm font-medium text-bianchi-cemento-dark mb-2">Presupuesto Estimado de Obra ($)</label>
            <input 
              type="number" 
              value={formData.presupuestoObra} 
              onChange={(e) => handlePresupuestoChange(e.target.value)} 
              placeholder="Ej: 80000000" 
              min="1" 
              disabled={modoCalculo === 'valorM2'}
              className="w-full px-4 py-3 border border-bianchi-cemento-light rounded-lg font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota bg-white transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" 
              required={modoCalculo === 'porcentajes'}
            />
            {modoCalculo === 'valorM2' && (
              <p className="font-inter text-xs text-bianchi-cemento mt-1 italic">
                Deshabilitado: el cálculo se basa en el valor $/m²
              </p>
            )}
          </div>

          <div className="card bg-bianchi-cemento-light/20 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '0.3s' }}>
            <h3 className="font-futura text-sm text-bianchi-cemento-dark mb-3">Porcentajes por Etapa (%)</h3>
            <p className="font-inter text-xs text-bianchi-cemento mb-3">Editá los porcentajes para ajustar los honorarios de cada etapa</p>
            <div className="space-y-3">
              <div>
                <label className="block font-inter text-xs text-bianchi-cemento mb-1">Anteproyecto</label>
                <input type="number" step="0.1" value={porcentajes['Anteproyecto']} onChange={(e) => handlePorcentajeChange('Anteproyecto', e.target.value)} className="w-full px-3 py-2 border border-bianchi-cemento-light rounded font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota bg-white transition-all duration-200" />
              </div>
              <div>
                <label className="block font-inter text-xs text-bianchi-cemento mb-1">Proyecto Ejecutivo</label>
                <input type="number" step="0.1" value={porcentajes['Proyecto Ejecutivo']} onChange={(e) => handlePorcentajeChange('Proyecto Ejecutivo', e.target.value)} className="w-full px-3 py-2 border border-bianchi-cemento-light rounded font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota bg-white transition-all duration-200" />
              </div>
              <div>
                <label className="block font-inter text-xs text-bianchi-cemento mb-1">Dirección de Obra</label>
                <input type="number" step="0.1" value={porcentajes['Direccion de Obra']} onChange={(e) => handlePorcentajeChange('Direccion de Obra', e.target.value)} className="w-full px-3 py-2 border border-bianchi-cemento-light rounded font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota bg-white transition-all duration-200" />
              </div>
              <div className="pt-2 border-t border-bianchi-cemento-light">
                <div className="flex justify-between">
                  <span className="font-inter text-xs text-bianchi-cemento">Suma total:</span>
                  <span className="font-inter text-xs text-bianchi-cemento-dark font-medium">{sumaPorcentajes.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {preview && (
            <div className="card bg-white border border-bianchi-cemento-light animate-slide-down">
              <label className="block font-inter text-sm font-medium text-bianchi-cemento-dark mb-2">Honorario por m² ($)</label>
              <p className="font-inter text-xs text-bianchi-cemento mb-2">
                {modoCalculo === 'valorM2' 
                  ? 'Modificá este valor para calcular los honorarios (el presupuesto se deshabilita)'
                  : 'Valor calculado automáticamente. Modificalo para usar $/m² como referencia'}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-inter text-lg text-bianchi-cemento-dark font-bold">$</span>
                <input
                  type="number"
                  value={valorM2}
                  onChange={(e) => handleValorM2Change(e.target.value)}
                  step="100"
                  className="flex-1 px-4 py-3 border-2 border-bianchi-cemento rounded-lg font-futura text-xl text-bianchi-cemento-dark font-bold focus:outline-none focus:ring-2 focus:ring-bianchi-cemento bg-white transition-all duration-200"
                />
                <span className="font-inter text-sm text-bianchi-cemento">/m²</span>
              </div>
            </div>
          )}

          <div className="animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '0.4s' }}>
            <label className="block font-inter text-sm font-medium text-bianchi-cemento-dark mb-2">Porcentaje de Anticipo (%)</label>
            <input type="number" value={formData.porcentajeAnticipo} onChange={(e) => setFormData({ ...formData, porcentajeAnticipo: e.target.value })} placeholder="30" min="0" max="100" step="1" className="w-full px-4 py-3 border border-bianchi-cemento-light rounded-lg font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota bg-white transition-all duration-200" required />
          </div>

          {preview && (
            <div className="card bg-white border border-bianchi-cemento-light animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '0.5s' }}>
              <h3 className="font-futura text-base text-bianchi-cemento-dark mb-3">Resumen de Honorarios</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-inter text-sm text-bianchi-cemento">Honorario Total</span>
                  <span className="font-futura text-lg text-bianchi-cemento-dark font-bold">{formatearMoneda(preview.honorarioTotal)}</span>
                </div>
                <div className="border-t border-bianchi-cemento-light pt-3">
                  <p className="font-inter text-xs text-bianchi-cemento uppercase tracking-wide mb-2">Desglose por Etapa</p>
                  {preview.etapas.map((etapa, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-inter text-sm text-bianchi-cemento-dark">{etapa.nombre} ({etapa.porcentaje.toFixed(1)}%)</span>
                        <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">{formatearMoneda(etapa.honorarioCalculado)}</span>
                      </div>
                      <div className="flex justify-between items-center pl-4">
                        <span className="font-inter text-xs text-bianchi-cemento">Anticipo a cuenta:</span>
                        <span className="font-inter text-xs text-bianchi-cemento">{formatearMoneda(etapa.anticipoAsociado)}</span>
                      </div>
                      <div className="flex justify-between items-center pl-4">
                        <span className="font-inter text-xs text-bianchi-cemento">Pago al entregar:</span>
                        <span className="font-inter text-xs text-bianchi-cemento-dark font-medium">{formatearMoneda(etapa.pagoPendiente)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-bianchi-cemento-light pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">Anticipo total ({formData.porcentajeAnticipo}%)</span>
                    <span className="font-inter text-sm text-bianchi-cemento-dark font-bold">{formatearMoneda(preview.anticipo)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '0.6s' }}>
            <Button type="submit" fullWidth>{proyectoEditar ? 'Guardar Cambios' : 'Generar Propuesta'}</Button>
            <Button variant="secondary" fullWidth onClick={() => navigate(proyectoEditar ? `/proyecto/${proyectoEditar.id}` : '/')}>Cancelar</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
