import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import Button from '../components/ui/Button'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Proyecto } from '../types'
import { CONFIG_ETAPAS } from '../constants'
import { generarDatosEjemplo } from '../data/seed'
import { aplicarCambioAlcance, calcularSaldoPendiente, calcularTotalCobrado } from '../utils/calculations'
import ModalCambioAlcance from '../components/ModalCambioAlcance'

export default function DetalleProyecto() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [proyectos, setProyectos] = useLocalStorage<Proyecto[]>(
    'bianchi-proyectos',
    generarDatosEjemplo()
  )
  const [showModalCambioAlcance, setShowModalCambioAlcance] = useState(false)

  const proyecto = proyectos.find(p => p.id === id)

  if (!proyecto) {
    return (
      <div className="pb-8 min-h-screen bg-bianchi-cemento-light">
        <Header />
        <main className="max-w-md mx-auto px-4 mt-6">
          <h1 className="font-futura text-2xl text-bianchi-cemento-dark mb-6">
            Proyecto no encontrado
          </h1>
          <Button onClick={() => navigate('/')}>
            Volver al Dashboard
          </Button>
        </main>
      </div>
    )
  }

  const formatearMoneda = (monto: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto)
  }

  const formatearFecha = (fecha?: string): string => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleMarcarEntregada = (etapaId: string) => {
    const updatedProyectos = proyectos.map(p => {
      if (p.id === proyecto.id) {
        return {
          ...p,
          etapas: p.etapas.map(e => 
            e.id === etapaId ? { 
              ...e, 
              estado: 'Entregada' as const,
              fechaEntrega: new Date().toISOString().split('T')[0]
            } : e
          ),
          historialCambios: [
            ...p.historialCambios,
            `Etapa entregada: ${p.etapas.find(e => e.id === etapaId)?.nombre} - ${new Date().toLocaleDateString('es-AR')}`
          ]
        }
      }
      return p
    })
    setProyectos(updatedProyectos)
  }

  const handleMarcarCobrado = (etapaId: string) => {
    const updatedProyectos = proyectos.map(p => {
      if (p.id === proyecto.id) {
        return {
          ...p,
          etapas: p.etapas.map(e => 
            e.id === etapaId ? { 
              ...e, 
              estado: 'Cobrada' as const,
              fechaCobro: new Date().toISOString().split('T')[0]
            } : e
          ),
          historialCambios: [
            ...p.historialCambios,
            `Pago cobrado: ${p.etapas.find(e => e.id === etapaId)?.nombre} - ${new Date().toLocaleDateString('es-AR')}`
          ]
        }
      }
      return p
    })
    setProyectos(updatedProyectos)
  }

  const handleCobrarAnticipo = () => {
    const updatedProyectos = proyectos.map(p => {
      if (p.id === proyecto.id) {
        return {
          ...p,
          anticipoCobrado: true,
          historialCambios: [
            ...p.historialCambios,
            `Anticipo cobrado - ${new Date().toLocaleDateString('es-AR')}`
          ]
        }
      }
      return p
    })
    setProyectos(updatedProyectos)
  }

  const handleAplicarCambioAlcance = (nuevaSuperficie: number, nuevoPresupuesto: number) => {
    const proyectoActualizado = aplicarCambioAlcance(proyecto, nuevaSuperficie, nuevoPresupuesto)
    const updatedProyectos = proyectos.map(p => 
      p.id === proyecto.id ? proyectoActualizado : p
    )
    setProyectos(updatedProyectos)
    setShowModalCambioAlcance(false)
  }

  const handleToggleTarea = (etapaId: string, tarea: string) => {
    const updatedProyectos = proyectos.map(p => {
      if (p.id === proyecto.id) {
        return {
          ...p,
          etapas: p.etapas.map(e => {
            if (e.id === etapaId) {
              const tareasActuales = e.tareasCompletadas || []
              const nuevasTareas = tareasActuales.includes(tarea)
                ? tareasActuales.filter(t => t !== tarea)
                : [...tareasActuales, tarea]
              return { ...e, tareasCompletadas: nuevasTareas }
            }
            return e
          })
        }
      }
      return p
    })
    setProyectos(updatedProyectos)
  }

  const getEtapaConfig = (nombreEtapa: string) => {
    const config = CONFIG_ETAPAS[proyecto.tipoEspacio as keyof typeof CONFIG_ETAPAS]
    if (config) {
      return config.find(e => e.nombre === nombreEtapa)
    }
    return null
  }

  const puedeActivarTareas = (etapaIndex: number): boolean => {
    if (etapaIndex === 0) {
      return proyecto.anticipoCobrado
    }
    if (etapaIndex === 1) {
      return proyecto.etapas[0].estado === 'Cobrada'
    }
    if (etapaIndex === 2) {
      return proyecto.etapas[1].estado === 'Cobrada'
    }
    return false
  }

  const todasTareasCompletas = (etapa: typeof proyecto.etapas[0], config: ReturnType<typeof getEtapaConfig>): boolean => {
    if (!config) return false
    const tareasCompletadas = etapa.tareasCompletadas || []
    return config.incluye.every(tarea => tareasCompletadas.includes(tarea))
  }

  const puedeEntregar = (etapa: typeof proyecto.etapas[0], index: number): boolean => {
    if (etapa.estado !== 'Pendiente') return false
    if (!puedeActivarTareas(index)) return false
    const config = getEtapaConfig(etapa.nombre)
    return config ? todasTareasCompletas(etapa, config) : false
  }

  const puedeCobrar = (etapa: typeof proyecto.etapas[0]): boolean => {
    return etapa.estado === 'Entregada'
  }

  const handleResetearProyecto = () => {
    navigate('/nuevo', { 
      state: { 
        proyectoEditar: {
          id: proyecto.id,
          nombre: proyecto.nombre,
          cliente: proyecto.cliente,
          tipoEspacio: proyecto.tipoEspacio,
          superficie: proyecto.superficie,
          presupuestoObra: proyecto.presupuestoObra
        }
      }
    })
  }

  const saldoPendiente = calcularSaldoPendiente(proyecto)
  const totalCobrado = calcularTotalCobrado(proyecto)

  return (
    <div className="pb-8 min-h-screen bg-bianchi-cemento-light">
      <Header />

      <main className="max-w-md mx-auto px-4 mt-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="font-inter text-sm text-bianchi-terracota mb-2 hover:underline"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="font-futura text-2xl text-bianchi-cemento-dark mb-2">
            {proyecto.nombre}
          </h1>
          <p className="font-inter text-bianchi-cemento">
            {proyecto.cliente}
          </p>
        </div>

        {/* Resumen Financiero */}
        <div className="card mb-6">
          <h2 className="font-futura text-base text-bianchi-cemento-dark mb-4">
            Resumen Financiero
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-inter text-sm text-bianchi-cemento font-bold">Honorario Total</span>
              <span className="font-futura text-lg text-bianchi-cemento-dark font-bold">
                {formatearMoneda(proyecto.honorarioTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-inter text-sm text-bianchi-cemento">Total Cobrado</span>
              <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">
                {formatearMoneda(totalCobrado)}
              </span>
            </div>
            <div className="border-t border-bianchi-cemento-light pt-3">
              <div className="flex justify-between items-center">
                <span className="font-inter text-sm font-medium text-bianchi-cemento-dark">Saldo Pendiente</span>
                <span className="font-futura text-lg text-bianchi-terracota font-semibold">
                  {formatearMoneda(saldoPendiente)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Proyecto */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-3">
            <h2 className="font-futura text-base text-bianchi-cemento-dark">
              Información del Proyecto
            </h2>
            <button
              onClick={() => setShowModalCambioAlcance(true)}
              className="bg-bianchi-terracota text-white font-inter text-xs px-3 py-2 rounded-lg hover:bg-bianchi-terracota-light transition-colors"
            >
              ✎ Cambiar Alcance
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-inter text-sm text-bianchi-cemento">Tipo de Espacio:</span>
              <span className="font-inter text-sm text-bianchi-cemento-dark">{proyecto.tipoEspacio}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-inter text-sm text-bianchi-cemento">Superficie:</span>
              <span className="font-inter text-sm text-bianchi-cemento-dark">{proyecto.superficie} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="font-inter text-sm text-bianchi-cemento">Presupuesto de Obra:</span>
              <span className="font-inter text-sm text-bianchi-cemento-dark">{formatearMoneda(proyecto.presupuestoObra)}</span>
            </div>
          </div>
        </div>

        {/* Anticipo */}
        <div className="card mb-6">
          <h2 className="font-futura text-base text-bianchi-cemento-dark mb-3">
            Anticipo (30%)
          </h2>
          <div className="flex justify-between items-center mb-3">
            <span className="font-inter text-sm text-bianchi-cemento">Total Anticipo:</span>
            <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">
              {formatearMoneda(proyecto.anticipo)}
            </span>
          </div>
          {!proyecto.anticipoCobrado ? (
            <Button 
              variant="secondary" 
              fullWidth
              onClick={() => {
                if (confirm('¿Confirmás que se cobró el anticipo?')) {
                  handleCobrarAnticipo()
                }
              }}
            >
              Marcar Anticipo como Cobrado
            </Button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <span className="font-inter text-sm text-green-700 font-medium">
                ✓ Anticipo Cobrado
              </span>
            </div>
          )}
        </div>

        {/* ETAPAS */}
        <div className="mb-6">
          <h2 className="font-futura text-lg text-bianchi-cemento-dark mb-4 border-b-2 border-bianchi-terracota pb-2">
            ETAPAS
          </h2>

          <div className="space-y-4">
            {proyecto.etapas.map((etapa, index) => {
              const config = getEtapaConfig(etapa.nombre)
              const puedeEntregarEtapa = puedeEntregar(etapa, index)
              const puedeCobrarEtapa = puedeCobrar(etapa)
              const puedeActivarTareasEtapa = puedeActivarTareas(index)

              return (
                <div key={etapa.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-futura text-base text-bianchi-cemento-dark">
                      {etapa.nombre}
                    </h3>
                    <span className={`text-xs font-inter px-2 py-1 rounded ${
                      etapa.estado === 'Cobrada'
                        ? 'bg-black text-white'
                        : etapa.estado === 'Entregada'
                        ? 'bg-bianchi-terracota text-white'
                        : 'bg-bianchi-cemento-light text-bianchi-cemento'
                    }`}>
                      {etapa.estado}
                    </span>
                  </div>

                  {config && (
                    <>
                      <div className="mb-3">
                        <span className="font-inter text-xs text-bianchi-cemento uppercase tracking-wide">Plazo estimado:</span>
                        <p className="font-inter text-sm text-bianchi-cemento-dark">{config.plazo}</p>
                      </div>
                      <div className="mb-4">
                        <span className="font-inter text-xs text-bianchi-cemento uppercase tracking-wide">Entregables:</span>
                        <ul className="mt-2 space-y-2">
                          {config.incluye.map((tarea, idx) => {
                            const estaCompletada = (etapa.tareasCompletadas || []).includes(tarea)
                            return (
                              <li key={idx} className="flex items-start">
                                <input
                                  type="checkbox"
                                  checked={estaCompletada}
                                  onChange={() => handleToggleTarea(etapa.id, tarea)}
                                  disabled={!puedeActivarTareasEtapa || etapa.estado !== 'Pendiente'}
                                  className="mt-0.5 mr-2 w-4 h-4 text-bianchi-terracota border-bianchi-cemento-light rounded focus:ring-bianchi-terracota disabled:opacity-30 cursor-pointer"
                                />
                                <span className={`font-inter text-sm ${
                                  estaCompletada ? 'text-bianchi-cemento-dark line-through' : 'text-bianchi-cemento-dark'
                                }`}>
                                  {tarea}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                        
                        {!puedeActivarTareasEtapa && etapa.estado === 'Pendiente' && (
                          <p className="font-inter text-xs text-bianchi-cemento mt-2 italic">
                            ⏳ {index === 0 ? 'Esperando cobro del anticipo' : 'Esperando cobro de etapa anterior'}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="border-t border-bianchi-cemento-light pt-3 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">Honorario de etapa:</span>
                      <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">
                        {formatearMoneda(etapa.honorarioCalculado)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">Anticipo recibido al encargo:</span>
                      <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">
                        {formatearMoneda(etapa.anticipoAsociado)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">Pago pendiente:</span>
                      <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">
                        {formatearMoneda(etapa.pagoPendiente)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarcarEntregada(etapa.id)}
                      disabled={!puedeEntregarEtapa}
                      className={`flex-1 py-3 px-4 rounded-lg font-inter text-sm font-medium transition-colors ${
                        puedeEntregarEtapa
                          ? 'btn-terracota-solid'
                          : 'btn-terracota-soft cursor-not-allowed'
                      }`}
                    >
                      {etapa.estado === 'Pendiente' ? 'Entregar' : '✓ Entregado'}
                    </button>

                    <button
                      onClick={() => handleMarcarCobrado(etapa.id)}
                      disabled={!puedeCobrarEtapa}
                      className={`flex-1 py-3 px-4 rounded-lg font-inter text-sm font-medium transition-colors ${
                        puedeCobrarEtapa
                          ? 'btn-terracota-solid'
                          : 'btn-terracota-soft cursor-not-allowed'
                      }`}
                    >
                      {etapa.estado === 'Cobrada' ? '✓ Cobrado' : 'Cobrar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Historial de Etapas - Formato tabla */}
        <div className="card mb-6">
          <h2 className="font-futura text-base text-bianchi-cemento-dark mb-4">
            Historial de Etapas
          </h2>
          <div className="grid grid-cols-3 gap-2 text-xs font-inter text-bianchi-cemento uppercase tracking-wide mb-3 pb-2 border-b border-bianchi-cemento-light">
            <div></div>
            <div className="text-center">Fecha entrega</div>
            <div className="text-center">Fecha cobro</div>
          </div>
          <div className="space-y-3">
            {proyecto.etapas.map((etapa) => (
              <div key={etapa.id} className="grid grid-cols-3 gap-2 items-center">
                <div className={`font-inter text-sm ${
                  etapa.estado === 'Cobrada'
                    ? 'text-bianchi-cemento-dark font-bold'
                    : etapa.estado === 'Entregada'
                    ? 'text-bianchi-cemento-dark font-semibold'
                    : 'text-bianchi-cemento'
                }`}>
                  {etapa.nombre}
                </div>
                <div className={`text-center font-inter text-sm ${
                  etapa.estado === 'Cobrada' || etapa.estado === 'Entregada'
                    ? 'text-bianchi-cemento-dark font-semibold'
                    : 'text-bianchi-cemento'
                }`}>
                  {etapa.fechaEntrega ? formatearFecha(etapa.fechaEntrega) : '-'}
                </div>
                <div className={`text-center font-inter text-sm ${
                  etapa.estado === 'Cobrada'
                    ? 'text-bianchi-cemento-dark font-bold'
                    : 'text-bianchi-cemento'
                }`}>
                  {etapa.fechaCobro ? formatearFecha(etapa.fechaCobro) : '-'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Resetear Proyecto */}
        <div className="mb-4">
          <Button variant="secondary" fullWidth onClick={handleResetearProyecto}>
            ⟲ Resetear Proyecto (abrir formulario)
          </Button>
        </div>

        <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
          Volver al Dashboard
        </Button>
      </main>

      {showModalCambioAlcance && (
        <ModalCambioAlcance
          proyecto={proyecto}
          onClose={() => setShowModalCambioAlcance(false)}
          onConfirm={handleAplicarCambioAlcance}
          formatearMoneda={formatearMoneda}
        />
      )}
    </div>
  )
}
