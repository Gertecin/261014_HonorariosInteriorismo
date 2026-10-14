import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Button from '../components/ui/Button'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Proyecto } from '../types'
import { generarDatosEjemplo } from '../data/seed'

export default function Dashboard() {
  const [proyectos] = useLocalStorage<Proyecto[]>(
    'bianchi-proyectos',
    generarDatosEjemplo()
  )

  const calcularSaldoPendiente = (proyecto: Proyecto): number => {
    const cobrado = (proyecto.anticipoCobrado ? proyecto.anticipo : 0) +
      proyecto.etapas.reduce((sum, e) => e.estaCobrado ? sum + e.pagoAsociado : 0, 0)
    return proyecto.honorarioTotal - cobrado
  }

  const formatearMoneda = (monto: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto)
  }

  return (
    <div className="pb-8">
      <Header />
      
      <main className="max-w-md mx-auto px-4 mt-6">
        <Link to="/nuevo">
          <Button fullWidth>
            + NUEVO PROYECTO
          </Button>
        </Link>

        <div className="mt-8">
          <h2 className="font-futura text-lg text-bianchi-cemento-dark mb-4">
            PROYECTOS ACTIVOS
          </h2>

          {proyectos.length === 0 ? (
            <div className="card text-center py-8">
              <p className="font-inter text-bianchi-cemento">
                No hay proyectos activos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proyectos.map(proyecto => {
                const saldo = calcularSaldoPendiente(proyecto)
                const etapasEntregadas = proyecto.etapas.filter(e => e.estado === 'Entregada').length
                const totalEtapas = proyecto.etapas.length

                return (
                  <Link 
                    key={proyecto.id} 
                    to={`/proyecto/${proyecto.id}`}
                    className="card block hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-futura text-base text-bianchi-cemento-dark">
                      {proyecto.nombre}
                    </h3>
                    <p className="font-inter text-sm text-bianchi-cemento mt-1">
                      {proyecto.cliente}
                    </p>

                    <div className="border-t border-bianchi-cemento-light my-3 pt-3">
                      <p className="font-inter text-xs text-bianchi-cemento uppercase tracking-wide">
                        Saldo Pendiente
                      </p>
                      <p className="font-futura text-2xl text-bianchi-terracota mt-1">
                        {formatearMoneda(saldo)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-1">
                        {Array.from({ length: totalEtapas }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < etapasEntregadas
                                ? 'bg-bianchi-terracota'
                                : 'bg-bianchi-cemento-light'
                            }`}
                          />
                        ))}
                      </div>

                      <span className={`text-xs font-inter px-2 py-1 rounded ${
                        etapasEntregadas === totalEtapas
                          ? 'bg-bianchi-cemento-light text-bianchi-cemento-dark'
                          : 'bg-bianchi-terracota/10 text-bianchi-terracota'
                      }`}>
                        {etapasEntregadas === totalEtapas ? 'Finalizado' : 'En curso'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
