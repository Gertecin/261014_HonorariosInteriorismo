import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Button from '../components/ui/Button'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Proyecto } from '../types'
import { generarDatosEjemplo } from '../data/seed'
import { calcularSaldoPendiente, calcularTotalCobrado } from '../utils/calculations'

export default function Dashboard() {
  const [proyectos, setProyectos] = useLocalStorage<Proyecto[]>(
    'bianchi-proyectos',
    generarDatosEjemplo()
  )

  const formatearMoneda = (monto: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto)
  }

  const handleEliminarProyecto = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      setProyectos(proyectos.filter(p => p.id !== id))
    }
  }

  const handleReiniciarTareas = (id: string) => {
    if (confirm('¿Reiniciar tareas y estados de entrega/cobro? Los datos financieros se mantendrán.')) {
      setProyectos(proyectos.map(p => {
        if (p.id === id) {
          return {
            ...p,
            anticipoCobrado: false,
            etapas: p.etapas.map(e => ({
              ...e,
              estado: 'Pendiente' as const,
              tareasCompletadas: [],
              fechaEntrega: undefined,
              fechaCobro: undefined
            })),
            historialCambios: [...p.historialCambios, `Tareas y estados reiniciados - ${new Date().toLocaleDateString('es-AR')}`]
          }
        }
        return p
      }))
    }
  }

  return (
    <div className="pb-8 min-h-screen bg-bianchi-cemento-light">
      <Header />
      
      <main className="max-w-md mx-auto px-4 mt-6">
        <Link to="/nuevo" className="block animate-fade-in-up">
          <Button fullWidth>
            + NUEVO PROYECTO
          </Button>
        </Link>

        <div className="mt-8">
          <h2 className="font-futura text-lg text-bianchi-cemento-dark mb-4">
            PROYECTOS ACTIVOS
          </h2>

          {proyectos.length === 0 ? (
            <div className="card text-center py-12 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bianchi-cemento-light/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-bianchi-cemento" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="font-inter text-bianchi-cemento-dark font-medium mb-1">
                No hay proyectos activos
              </p>
              <p className="font-inter text-sm text-bianchi-cemento">
                Creá tu primer proyecto para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proyectos.map((proyecto, index) => {
                const saldo = calcularSaldoPendiente(proyecto)
                const totalCobrado = calcularTotalCobrado(proyecto)
                const porcentajeCobrado = proyecto.honorarioTotal > 0 
                  ? (totalCobrado / proyecto.honorarioTotal) * 100 
                  : 0
                const etapasAvanzadas = proyecto.etapas.filter(e => e.estado === 'Entregada' || e.estado === 'Cobrada').length
                const totalEtapas = proyecto.etapas.length

                return (
                  <div 
                    key={proyecto.id} 
                    className={`card animate-fade-in-up opacity-0 stagger-${Math.min(index + 1, 5)}`}
                    style={{ opacity: 0, animationFillMode: 'forwards' }}
                  >
                    <Link to={`/proyecto/${proyecto.id}`} className="block">
                      <h3 className="font-futura text-base text-bianchi-cemento-dark mb-1">
                        {proyecto.nombre}
                      </h3>
                      <p className="font-inter text-sm text-bianchi-cemento mb-3">
                        {proyecto.cliente}
                      </p>

                      <div className="border-t border-bianchi-cemento-light pt-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">Total Honorarios</span>
                          <span className="font-futura text-lg text-bianchi-cemento-dark font-bold">
                            {formatearMoneda(proyecto.honorarioTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-inter text-sm text-bianchi-cemento font-bold">Total Pendiente</span>
                          <span className="font-futura text-lg text-bianchi-cemento font-bold">
                            {formatearMoneda(saldo)}
                          </span>
                        </div>
                      </div>

                      {/* Barra de progreso financiero */}
                      <div className="mt-4 pt-3 border-t border-bianchi-cemento-light">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-inter text-xs text-bianchi-cemento uppercase tracking-wide">Avance de cobro</span>
                          <span className="font-inter text-xs text-bianchi-cemento-dark font-medium">
                            {porcentajeCobrado.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-bianchi-cemento-light rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-bianchi-terracota to-bianchi-terracota-light rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${porcentajeCobrado}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-bianchi-cemento-light">
                        <div className="flex gap-1">
                          {Array.from({ length: totalEtapas }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                i < etapasAvanzadas
                                  ? 'bg-bianchi-terracota'
                                  : 'bg-bianchi-cemento-light border border-bianchi-cemento'
                              }`}
                            />
                          ))}
                        </div>

                        <span className={`text-xs font-inter px-2 py-1 rounded transition-colors ${
                          etapasAvanzadas === totalEtapas
                            ? 'bg-bianchi-cemento-light text-bianchi-cemento-dark border border-bianchi-cemento'
                            : 'bg-bianchi-terracota/10 text-bianchi-terracota'
                        }`}>
                          {etapasAvanzadas === totalEtapas ? 'Finalizado' : 'En curso'}
                        </span>
                      </div>
                    </Link>

                    <div className="border-t border-bianchi-cemento-light mt-4 pt-3 flex gap-2">
                      <button
                        onClick={(e) => { e.preventDefault(); handleReiniciarTareas(proyecto.id); }}
                        className="flex-1 text-xs font-inter text-bianchi-cemento-dark bg-bianchi-cemento-light/50 py-2 px-1 rounded hover:bg-bianchi-cemento-light transition-all duration-200 active:scale-95 border border-bianchi-cemento-light"
                      >
                        ↺ Tareas
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); handleEliminarProyecto(proyecto.id); }}
                        className="flex-1 text-xs font-inter text-red-600 bg-red-50 py-2 px-1 rounded hover:bg-red-100 transition-all duration-200 active:scale-95 border border-red-100"
                      >
                         Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
