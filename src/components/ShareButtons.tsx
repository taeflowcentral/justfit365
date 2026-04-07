import { Printer, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  onPrint: () => void;
  onWhatsApp: () => void;
}

export default function ShareButtons({ onPrint, onWhatsApp }: ShareButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onPrint}
        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-dark-border text-white/50 rounded-xl text-xs font-medium hover:bg-white/10 hover:text-white transition-all"
        title="Imprimir">
        <Printer className="w-3.5 h-3.5" /> Imprimir
      </button>
      <button onClick={onWhatsApp}
        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-all"
        title="Enviar por WhatsApp">
        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
      </button>
    </div>
  );
}

export function generateRutinaText(ejercicios: { nombre: string; series: number; reps: string; peso: string; descanso: string; musculo: string; notas: string }[], semana: { dia: string; tipo: string }[]): string {
  let text = '*JUSTFIT365 - Mi Rutina*\n\n';
  text += '*Planificaci\u00f3n Semanal:*\n';
  semana.forEach(d => { text += `${d.dia}: ${d.tipo}\n`; });
  text += '\n*Ejercicios:*\n';
  ejercicios.forEach((e, i) => {
    text += `\n${i + 1}. *${e.nombre}* (${e.musculo})\n`;
    text += `   ${e.series} series x ${e.reps} reps | ${e.peso} kg | Descanso: ${e.descanso}s\n`;
    if (e.notas) text += `   Nota: ${e.notas}\n`;
  });
  return text;
}

export function generateNutricionText(comidas: { nombre: string; hora: string; items: { alimento: string; porcion: string; cal: number; prot: number; carb: number; grasa: number }[] }[], calObjetivo: number): string {
  let text = '*JUSTFIT365 - Mi Plan Nutricional*\n\n';
  text += `*Objetivo cal\u00f3rico:* ${calObjetivo} kcal\n\n`;
  comidas.forEach(c => {
    const comidaCal = c.items.reduce((a, it) => a + it.cal, 0);
    text += `*${c.nombre}* (${c.hora} hs) - ${comidaCal} kcal\n`;
    c.items.forEach(item => {
      text += `  \u2022 ${item.alimento} (${item.porcion})\n`;
      text += `    ${item.cal} cal | ${item.prot}g P | ${item.carb}g C | ${item.grasa}g G\n`;
    });
    text += '\n';
  });
  const totalCal = comidas.reduce((a, c) => a + c.items.reduce((b, it) => b + it.cal, 0), 0);
  const totalProt = comidas.reduce((a, c) => a + c.items.reduce((b, it) => b + it.prot, 0), 0);
  text += `*Totales:* ${totalCal} kcal | ${totalProt}g Prote\u00edna`;
  return text;
}

export function printContent(title: string, htmlContent: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 30px; color: #1a1a1a; font-size: 13px; }
      h1 { font-size: 22px; margin-bottom: 5px; letter-spacing: -0.5px; }
      h1 span { color: #0099ff; }
      .subtitle { color: #666; font-size: 12px; margin-bottom: 20px; }
      h2 { font-size: 15px; margin: 18px 0 8px; padding-bottom: 5px; border-bottom: 2px solid #0099ff; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      th { background: #f0f4f8; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; border-bottom: 2px solid #ddd; }
      td { padding: 7px 10px; border-bottom: 1px solid #eee; }
      .meal-header { background: #f8fafc; font-weight: bold; }
      .macros { color: #666; font-size: 11px; }
      .macros span { margin-right: 10px; }
      .note { background: #f0f9ff; border-left: 3px solid #0099ff; padding: 8px 12px; margin: 5px 0; font-size: 12px; color: #555; }
      .footer { margin-top: 25px; padding-top: 10px; border-top: 1px solid #ddd; color: #999; font-size: 10px; text-align: center; }
      .semana { display: flex; gap: 5px; margin: 10px 0; }
      .dia { flex: 1; text-align: center; padding: 6px; background: #f0f4f8; border-radius: 6px; font-size: 11px; }
      .dia-activo { background: #e0f2fe; border: 1px solid #0099ff; }
      @media print { body { padding: 15px; } }
    </style></head><body>
    <h1>Just<span>Fit</span>365</h1>
    ${htmlContent}
    <div class="footer">JustFit365 - Fitness & Nutrici\u00f3n Inteligente | Generado el ${new Date().toLocaleDateString('es-AR')}</div>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

export function shareWhatsApp(text: string) {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}
