import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white border-b border-bianchi-cemento-light">
      <div className="max-w-md mx-auto px-4 py-4">
        <Link to="/" className="block">
          <h1 className="font-futura text-xl text-bianchi-cemento-dark tracking-wide">
            ESTUDIO BIANCHI
          </h1>
          <p className="font-inter text-sm text-bianchi-cemento mt-1">
            Gestión de Honorarios
          </p>
        </Link>
        <div className="mt-3 h-0.5 bg-gradient-to-r from-bianchi-terracota via-bianchi-terracota-light to-transparent"></div>
      </div>
    </header>
  )
}
