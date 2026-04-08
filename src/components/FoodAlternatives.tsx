import { ArrowLeftRight, X } from 'lucide-react';

const alternativas: Record<string, { nombre: string; porcion: string; cal: number; prot: number; carb: number; grasa: number }[]> = {
  'avena': [
    { nombre: 'Granola sin az\u00facar', porcion: '60g', cal: 280, prot: 8, carb: 45, grasa: 8 },
    { nombre: 'Pan integral tostado', porcion: '2 rebanadas', cal: 180, prot: 8, carb: 30, grasa: 2 },
    { nombre: 'Quinoa cocida', porcion: '150g', cal: 180, prot: 6, carb: 30, grasa: 3 },
    { nombre: 'Cereales integrales', porcion: '50g', cal: 190, prot: 5, carb: 38, grasa: 2 },
  ],
  'pollo': [
    { nombre: 'Pavo/Pavita', porcion: '200g', cal: 280, prot: 58, carb: 0, grasa: 4 },
    { nombre: 'At\u00fan en agua', porcion: '2 latas (160g)', cal: 200, prot: 48, carb: 0, grasa: 2 },
    { nombre: 'Merluza al horno', porcion: '250g', cal: 220, prot: 50, carb: 0, grasa: 2 },
    { nombre: 'Tofu firme', porcion: '250g', cal: 300, prot: 36, carb: 4, grasa: 16 },
    { nombre: 'Cerdo magro (lomo)', porcion: '200g', cal: 300, prot: 54, carb: 0, grasa: 8 },
  ],
  'arroz': [
    { nombre: 'Fideos integrales', porcion: '150g cocidos', cal: 175, prot: 6, carb: 34, grasa: 1 },
    { nombre: 'Batata asada', porcion: '200g', cal: 180, prot: 2, carb: 42, grasa: 0 },
    { nombre: 'Quinoa cocida', porcion: '150g', cal: 180, prot: 6, carb: 30, grasa: 3 },
    { nombre: 'Papa hervida', porcion: '200g', cal: 170, prot: 4, carb: 38, grasa: 0 },
    { nombre: 'Cous cous', porcion: '150g cocido', cal: 170, prot: 6, carb: 33, grasa: 0 },
  ],
  'banana': [
    { nombre: 'Manzana', porcion: '1 grande', cal: 95, prot: 0, carb: 25, grasa: 0 },
    { nombre: 'Pera', porcion: '1 mediana', cal: 100, prot: 1, carb: 26, grasa: 0 },
    { nombre: 'Naranja', porcion: '1 grande', cal: 85, prot: 1, carb: 21, grasa: 0 },
    { nombre: 'Durazno', porcion: '2 medianos', cal: 80, prot: 2, carb: 19, grasa: 0 },
  ],
  'salm\u00f3n': [
    { nombre: 'Trucha', porcion: '180g', cal: 300, prot: 38, carb: 0, grasa: 16 },
    { nombre: 'Caballa', porcion: '180g', cal: 340, prot: 36, carb: 0, grasa: 22 },
    { nombre: 'At\u00fan fresco', porcion: '180g', cal: 260, prot: 42, carb: 0, grasa: 10 },
    { nombre: 'Sardinas', porcion: '150g', cal: 250, prot: 30, carb: 0, grasa: 14 },
    { nombre: 'Pechuga de pollo + omega-3', porcion: '200g pollo + 2 c\u00e1ps omega', cal: 340, prot: 62, carb: 0, grasa: 9 },
  ],
  'huevo': [
    { nombre: 'Claras de huevo', porcion: '6 claras', cal: 100, prot: 22, carb: 0, grasa: 0 },
    { nombre: 'Queso cottage', porcion: '150g', cal: 145, prot: 18, carb: 5, grasa: 5 },
    { nombre: 'Yogur griego', porcion: '200g', cal: 130, prot: 20, carb: 6, grasa: 3 },
  ],
  'man\u00ed': [
    { nombre: 'Mantequilla de almendras', porcion: '15g', cal: 95, prot: 3, carb: 3, grasa: 8 },
    { nombre: 'Palta/Aguacate', porcion: '50g', cal: 80, prot: 1, carb: 4, grasa: 7 },
    { nombre: 'Semillas de ch\u00eda', porcion: '15g', cal: 70, prot: 3, carb: 5, grasa: 5 },
    { nombre: 'Tahini', porcion: '15g', cal: 90, prot: 3, carb: 3, grasa: 8 },
  ],
  'batata': [
    { nombre: 'Calabaza asada', porcion: '250g', cal: 110, prot: 2, carb: 26, grasa: 0 },
    { nombre: 'Arroz integral', porcion: '150g cocido', cal: 170, prot: 4, carb: 36, grasa: 1 },
    { nombre: 'Choclo', porcion: '1 unidad grande', cal: 130, prot: 4, carb: 28, grasa: 2 },
    { nombre: 'Papa hervida', porcion: '200g', cal: 170, prot: 4, carb: 38, grasa: 0 },
  ],
  'br\u00f3coli': [
    { nombre: 'Espinaca salteada', porcion: '200g', cal: 46, prot: 6, carb: 4, grasa: 1 },
    { nombre: 'Coliflor al vapor', porcion: '200g', cal: 50, prot: 4, carb: 8, grasa: 0 },
    { nombre: 'Zucchini/Zapallito', porcion: '200g', cal: 34, prot: 2, carb: 6, grasa: 0 },
    { nombre: 'Espárragos', porcion: '200g', cal: 40, prot: 4, carb: 6, grasa: 0 },
  ],
  'whey': [
    { nombre: 'Case\u00edna', porcion: '1 scoop (30g)', cal: 120, prot: 24, carb: 4, grasa: 1 },
    { nombre: 'Prote\u00edna vegana (arvejas)', porcion: '1 scoop (35g)', cal: 125, prot: 22, carb: 4, grasa: 2 },
    { nombre: 'Yogur griego + claras', porcion: '150g yogur + 3 claras', cal: 140, prot: 26, carb: 5, grasa: 2 },
    { nombre: 'Queso cottage', porcion: '200g', cal: 190, prot: 24, carb: 6, grasa: 7 },
  ],
  'case\u00edna': [
    { nombre: 'Yogur griego', porcion: '200g', cal: 130, prot: 20, carb: 6, grasa: 3 },
    { nombre: 'Queso cottage', porcion: '200g', cal: 190, prot: 24, carb: 6, grasa: 7 },
    { nombre: 'Leche descremada', porcion: '400ml', cal: 140, prot: 14, carb: 20, grasa: 1 },
  ],
  'almendra': [
    { nombre: 'Nueces', porcion: '15g', cal: 100, prot: 2, carb: 2, grasa: 10 },
    { nombre: 'Castañas de caj\u00fa', porcion: '15g', cal: 85, prot: 3, carb: 5, grasa: 7 },
    { nombre: 'Semillas de calabaza', porcion: '15g', cal: 85, prot: 4, carb: 2, grasa: 7 },
    { nombre: 'Pistachos', porcion: '15g', cal: 85, prot: 3, carb: 4, grasa: 7 },
  ],
  'ensalada': [
    { nombre: 'Verduras salteadas', porcion: '200g', cal: 100, prot: 3, carb: 12, grasa: 5 },
    { nombre: 'Sopa de verduras', porcion: '300ml', cal: 90, prot: 3, carb: 14, grasa: 2 },
    { nombre: 'Tomate cherry + r\u00facula + queso', porcion: '200g', cal: 120, prot: 6, carb: 8, grasa: 7 },
  ],
  'leche': [
    { nombre: 'Leche de almendras', porcion: '200ml', cal: 30, prot: 1, carb: 1, grasa: 3 },
    { nombre: 'Leche de soja', porcion: '200ml', cal: 80, prot: 7, carb: 4, grasa: 4 },
    { nombre: 'Leche de avena', porcion: '200ml', cal: 90, prot: 2, carb: 14, grasa: 3 },
    { nombre: 'Yogur natural', porcion: '200ml', cal: 120, prot: 8, carb: 10, grasa: 5 },
  ],
  'tostada': [
    { nombre: 'Galletas de arroz', porcion: '4 unidades', cal: 140, prot: 3, carb: 30, grasa: 1 },
    { nombre: 'Wrap integral', porcion: '1 unidad', cal: 130, prot: 4, carb: 24, grasa: 3 },
    { nombre: 'Crackers integrales', porcion: '6 unidades', cal: 120, prot: 3, carb: 22, grasa: 3 },
  ],
};

function findAlternatives(alimentoNombre: string): { nombre: string; porcion: string; cal: number; prot: number; carb: number; grasa: number }[] | null {
  const lower = alimentoNombre.toLowerCase();
  for (const [key, alts] of Object.entries(alternativas)) {
    if (lower.includes(key)) return alts;
  }
  return null;
}

export default function FoodAlternatives({ alimento, onSelect, onClose }: {
  alimento: string;
  onSelect: (alt: { nombre: string; porcion: string; cal: number; prot: number; carb: number; grasa: number }) => void;
  onClose: () => void;
}) {
  const alts = findAlternatives(alimento);

  if (!alts) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-emerald-400" /> Alternativas
            </h3>
            <p className="text-white/30 text-xs mt-0.5">Reemplazar: <strong className="text-white/50">{alimento}</strong></p>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-dark-border/30">
          {alts.map((alt, i) => (
            <button key={i} onClick={() => { onSelect(alt); onClose(); }}
              className="w-full px-5 py-3 text-left hover:bg-emerald-500/5 transition-colors">
              <p className="text-white text-sm font-medium">{alt.nombre}</p>
              <div className="flex items-center gap-2 text-[11px] mt-0.5">
                <span className="text-white/30">{alt.porcion}</span>
                <span className="text-white/10">|</span>
                <span className="text-orange-400/60">{alt.cal}cal</span>
                <span className="text-electric/60">{alt.prot}gP</span>
                <span className="text-amber-400/60">{alt.carb}gC</span>
                <span className="text-pink-400/60">{alt.grasa}gG</span>
              </div>
            </button>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-dark-border">
          <p className="text-white/15 text-[10px] text-center">Click en una alternativa para reemplazar el alimento</p>
        </div>
      </div>
    </div>
  );
}

export { findAlternatives };
