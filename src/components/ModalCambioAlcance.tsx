import { useState } from 'react';
import Button from './ui/Button';
import { Proyecto } from '../types';

interface ModalCambioAlcanceProps {
  proyecto: Proyecto;
  onClose: () => void;
  onConfirm: (nuevaSuperficie: number, nuevoPresupuesto: number) => void;
  formatearMoneda: (monto: number) => string;
}

export default function ModalCambioAlcance({
  proyecto,
  onClose,
  onConfirm,
  formatearMoneda,
}: ModalCambioAlcanceProps) {
  const [nuevaSuperficie, setNuevaSuperficie] = useState(proyecto.superficie.toString());
  const [nuevoPresupuesto, setNuevoPresupuesto] = useState(proyecto.presupuestoObra.toString());

  const etapasCobradas = proyecto.etapas.filter(e => e.estado === 'Cobrada');
  const etapasNoCobradas = proyecto.etapas.filter(e => e.estado !== 'Cobrada');
  const totalCobrado = etapasCobradas.reduce((sum, e) => sum + e.honorarioCalculado, 0) +
    (proyecto.anticipoCobrado ? proyecto.anticipo : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = parseFloat(nuevaSuperficie);
    const pres = parseFloat(nuevoPresupuesto);
    if (sup <= 0 || pres <= 0) {
      alert('Los valores deben ser mayores a cero');
      return;
    }
    onConfirm(sup, pres);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-bianchi-cemento-light shadow-lg animate-fade-in-up">
        <h3 className="font-futura text-lg text-bianchi-cemento-dark mb-2">
          Cambio de Alcance
        </h3>
        <p className="font-inter text-sm text-bianchi-cemento mb-4">
          Modificá los valores para recalcular. Las etapas ya cobradas mantienen su honorario. El anticipo a cuenta ya pagado no se modifica.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-inter text-sm font-medium text-bianchi-cemento-dark mb-2">
              Superficie actual: {proyecto.superficie} m²
            </label>
            <input
              type="number"
              value={nuevaSuperficie}
              onChange={(e) => setNuevaSuperficie(e.target.value)}
              min="1"
              className="w-full px-4 py-3 border border-bianchi-cemento-light rounded-lg font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block font-inter text-sm font-medium text-bianchi-cemento-dark mb-2">
              Presupuesto actual: {formatearMoneda(proyecto.presupuestoObra)}
            </label>
            <input
              type="number"
              value={nuevoPresupuesto}
              onChange={(e) => setNuevoPresupuesto(e.target.value)}
              min="1"
              className="w-full px-4 py-3 border border-bianchi-cemento-light rounded-lg font-inter text-bianchi-cemento-dark focus:outline-none focus:ring-2 focus:ring-bianchi-terracota transition-all duration-200"
              required
            />
          </div>

          <div className="bg-bianchi-cemento-light/20 border border-bianchi-cemento-light rounded-lg p-4">
            <p className="font-inter text-xs text-bianchi-cemento uppercase tracking-wide mb-2">
              Estado actual
            </p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-inter text-sm text-bianchi-cemento">Total cobrado (no se toca):</span>
                <span className="font-inter text-sm text-green-600 font-medium">
                  {formatearMoneda(totalCobrado)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-inter text-sm text-bianchi-cemento">Etapas cobradas:</span>
                <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">
                  {etapasCobradas.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-inter text-sm text-bianchi-cemento">Etapas a recalcular:</span>
                <span className="font-inter text-sm text-bianchi-cemento-dark font-medium">
                  {etapasNoCobradas.length}
                </span>
              </div>
              {etapasNoCobradas.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {etapasNoCobradas.map(e => (
                    <span key={e.id} className="text-xs font-inter px-2 py-1 bg-bianchi-cemento-light rounded">
                      {e.nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button type="submit" fullWidth>
              Aplicar Cambio de Alcance
            </Button>
            <Button variant="secondary" fullWidth onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
