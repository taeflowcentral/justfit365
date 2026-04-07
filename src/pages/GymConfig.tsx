import { useState } from 'react';
import { Settings, Upload, Building2, Users, CreditCard, Save, Palette, Globe, Image } from 'lucide-react';

export default function GymConfig() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [gymName, setGymName] = useState('Iron Gym');
  const [accentColor, setAccentColor] = useState('#0099ff');
  const [saved, setSaved] = useState(false);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <Settings className="w-7 h-7 text-electric" /> Configuraci&oacute;n del Gimnasio
        </h1>
        <p className="text-white/40 text-sm mt-1">Personaliz&aacute; la experiencia para tus miembros (White Label)</p>
      </div>

      {/* Logo Upload */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Image className="w-4 h-4 text-electric" /> Logo del Partner
        </h3>
        <p className="text-white/40 text-sm mb-4">Este logo se mostrar&aacute; junto al de JustFit365 en la interfaz de tus miembros.</p>

        <div className="flex items-start gap-6">
          <div className="w-32 h-32 bg-black/60 border-2 border-dashed border-dark-border rounded-2xl flex items-center justify-center overflow-hidden hover:border-electric/30 transition-colors">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="text-center">
                <Building2 className="w-8 h-8 text-white/10 mx-auto mb-1" />
                <span className="text-white/20 text-[10px]">Sin logo</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <label className="flex items-center gap-2 px-4 py-3 bg-electric/10 border border-electric/20 rounded-xl text-electric text-sm font-medium cursor-pointer hover:bg-electric/20 transition-colors">
              <Upload className="w-4 h-4" />
              Subir Logo
              <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            </label>
            <p className="text-white/20 text-xs">Formatos: PNG, JPG, SVG. M&aacute;x 2MB. Recomendado: 512x512px.</p>

            {/* Preview */}
            {logoPreview && (
              <div className="bg-black/40 border border-dark-border rounded-xl p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Vista previa del header</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-electric to-neon rounded-lg flex items-center justify-center">
                    <span className="text-black font-black text-xs">BC</span>
                  </div>
                  <span className="text-white/20 text-lg">+</span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5">
                    <img src={logoPreview} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-white/50 text-sm font-medium">{gymName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Datos del gimnasio */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400" /> Datos del Gimnasio
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Nombre</label>
            <input
              type="text"
              value={gymName}
              onChange={e => setGymName(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Direcci&oacute;n</label>
            <input
              type="text"
              defaultValue="Av. 7 N\u00b0 1234, La Plata"
              className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Tel&eacute;fono</label>
            <input
              type="text"
              defaultValue="0221-456-7890"
              className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              defaultValue="info@irongym.com"
              className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-pink-400" /> Branding
        </h3>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Color de acento</label>
            <div className="flex items-center gap-3">
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0" />
              <span className="text-white/50 text-sm font-mono">{accentColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Dominio personalizado</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-black/60 border border-dark-border rounded-xl">
              <Globe className="w-4 h-4 text-white/20" />
              <input type="text" placeholder="migimnasio.justfit365.com" className="bg-transparent text-white text-sm focus:outline-none flex-1 placeholder-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Suscripci\u00f3n Gym */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" /> Plan del Gimnasio
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-700 border border-dark-border rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-white/20 mx-auto mb-2" />
            <p className="text-2xl font-black text-white">47</p>
            <p className="text-white/30 text-xs">Miembros activos</p>
          </div>
          <div className="bg-dark-700 border border-dark-border rounded-xl p-4 text-center">
            <CreditCard className="w-6 h-6 text-emerald-400/50 mx-auto mb-2" />
            <p className="text-2xl font-black text-emerald-400">PRO</p>
            <p className="text-white/30 text-xs">Plan actual</p>
          </div>
          <div className="bg-dark-700 border border-dark-border rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-white">100</p>
            <p className="text-white/30 text-xs">L\u00edmite miembros</p>
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
          saved
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-gradient-to-r from-electric to-neon text-black shadow-lg shadow-electric/20 hover:shadow-electric/40 hover:scale-[1.01]'
        }`}
      >
        <Save className="w-4 h-4" />
        {saved ? 'Guardado correctamente' : 'Guardar Cambios'}
      </button>
    </div>
  );
}
