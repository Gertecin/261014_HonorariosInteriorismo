import Header from '../components/layout/Header'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function NuevoProyecto() {
  const navigate = useNavigate()

  return (
    <div>
      <Header />
      <main className="max-w-md mx-auto px-4 mt-6">
        <h1 className="font-futura text-2xl text-bianchi-cemento-dark mb-6">
          Nuevo Proyecto
        </h1>
        <p className="font-inter text-bianchi-cemento mb-8">
          (Formulario de creación - Fase 3)
        </p>
        <Button onClick={() => navigate('/')}>
          Volver al Dashboard
        </Button>
      </main>
    </div>
  )
}
