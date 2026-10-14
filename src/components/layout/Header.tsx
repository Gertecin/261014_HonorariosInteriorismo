import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white border-b border-bianchi-cemento-light px-4 py-4">
      <div className="max-w-md mx-auto">
        <Link to="/" className="block">
          <h1 className="font-futura text-xl text-bianchi-cemento-dark">
            ESTUDIO BIANCHI
          </h1>
          <p className="font-inter text-sm text-bianchi-cemento mt-1">
            Gestión de Honorarios
          </p>
        </Link>
      </div>
    </header>
  )
}
