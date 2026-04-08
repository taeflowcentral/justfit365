import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon, Camera, Save, Trash2, StickyNote, Ruler,
  Weight, Calendar, Target, Activity, Fingerprint, Mail, Phone
} from 'lucide-react';

export default function Perfil() {
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(user?.foto || '');

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: '',
    telefono: '',
    notas: user?.notas || '',
    edad: user?.perfil?.edad?.toString() || '',
    peso: user?.perfil?.peso?.toString() || '',
    altura: user?.perfil?.altura?.toString() || '',
    objetivo: user?.perfil?.objetivo || 'Hipertrofia',
    nivelActividad: user?.perfil?.nivelActividad || 'Intermedio',
  });

  useEffect(() => {
    setFotoPreview(user?.foto || '');
  }, [user?.foto]);

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe superar los 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setFotoPreview('');
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateUser({
      nombre: form.nombre,
      apellido: form.apellido,
      foto: fotoPreview || undefined,
      notas: form.notas || undefined,
      perfil: {
        edad: parseInt(form.edad) || 0,
        peso: parseFloat(form.peso) || 0,
        altura: parseInt(form.altura) || 0,
        objetivo: form.objetivo,
        nivelActividad: form.nivelActividad,
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tmb = form.peso && form.altura && form.edad
    ? Math.round(10 * parseFloat(form.peso) + 6.25 * parseInt(form.altura) - 5 * parseInt(form.edad) + 5)
    : 0;
  const factores: Record<string, number> = { 'Sedentario': 1.2, 'Principiante': 1.375, 'Intermedio': 1.55, 'Avanzado': 1.725, 'Elite': 1.9 };
  const tdee = tmb ? Math.round(tmb * (factores[form.nivelActividad] || 1.55)) : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <UserIcon className="w-7 h-7 text-electric" /> Mi Perfil
        </h1>
        <p className="text-white/40 text-sm mt-1">Configur&aacute; tu informaci&oacute;n personal y par&aacute;metros f&iacute;sicos</p>
      </div>

      {/* Foto de perfil */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Camera className="w-4 h-4 text-electric" /> Foto de Perfil
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-dark-700 border-2 border-dark-border flex items-center justify-center">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <UserIcon className="w-10 h-10 text-white/10 mx-auto" />
                  <span className="text-white/15 text-[10px] block mt-1">Sin foto</span>
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-opacity">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-electric/10 border border-electric/20 rounded-xl text-electric text-sm font-medium cursor-pointer hover:bg-electric/20 transition-colors">
              <Camera className="w-4 h-4" /> Subir foto
              <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
            </label>
            {fotoPreview && (
              <button onClick={removeFoto} className="flex items-center gap-2 px-4 py-2.5 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium hover:bg-danger/20 transition-colors">
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            )}
            <p className="text-white/20 text-xs">JPG, PNG. M&aacute;x 2MB.</p>
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-purple-400" /> Datos Personales
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Apellido</label>
            <input
              type="text"
              value={form.apellido}
              onChange={e => handleChange('apellido', e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">DNI</label>
            <div className="flex items-center px-4 py-3 bg-black/40 border border-dark-border rounded-xl text-white/30 text-sm">
              <Fingerprint className="w-4 h-4 mr-2 text-white/15" />
              {user?.dni}
              <span className="ml-auto text-[10px] text-white/15 uppercase">No editable</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="tucorreo@email.com"
                className="w-full pl-10 pr-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30"
              />
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Tel&eacute;fono</label>
            <div className="relative max-w-xs">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
              <input
                type="tel"
                value={form.telefono}
                onChange={e => handleChange('telefono', e.target.value)}
                placeholder="221-456-7890"
                className="w-full pl-10 pr-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Parámetros físicos */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Par&aacute;metros F&iacute;sicos
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Edad
            </label>
            <div className="relative">
              <input
                type="number"
                min="14"
                max="99"
                value={form.edad}
                onChange={e => handleChange('edad', e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">a&ntilde;os</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Weight className="w-3 h-3" /> Peso
            </label>
            <div className="relative">
              <input
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={form.peso}
                onChange={e => handleChange('peso', e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">kg</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Ruler className="w-3 h-3" /> Altura
            </label>
            <div className="relative">
              <input
                type="number"
                min="100"
                max="250"
                value={form.altura}
                onChange={e => handleChange('altura', e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">cm</span>
            </div>
          </div>
          <div className="col-span-2 lg:col-span-3">
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Target className="w-3 h-3" /> Objetivos (pod&eacute;s elegir varios)
            </label>
            <div className="flex flex-wrap gap-2">
              {['Hipertrofia', 'Tonificacion', 'Perdida de grasa', 'Fuerza', 'Resistencia', 'Salud general', 'Rendimiento deportivo'].map(obj => {
                const seleccionados = form.objetivo.split(', ').filter(Boolean);
                const activo = seleccionados.includes(obj);
                return (
                  <button key={obj} type="button" onClick={() => {
                    let nuevos: string[];
                    if (activo) {
                      nuevos = seleccionados.filter(o => o !== obj);
                    } else {
                      nuevos = [...seleccionados, obj];
                    }
                    if (nuevos.length === 0) nuevos = [obj];
                    handleChange('objetivo', nuevos.join(', '));
                  }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activo
                        ? 'bg-electric/15 text-electric border border-electric/30'
                        : 'bg-black/40 text-white/40 border border-dark-border hover:border-white/20 hover:text-white/60'
                    }`}>
                    {obj === 'Perdida de grasa' ? 'P\u00e9rdida de grasa' : obj === 'Tonificacion' ? 'Tonificaci\u00f3n' : obj}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Nivel de Actividad
            </label>
            <select
              value={form.nivelActividad}
              onChange={e => handleChange('nivelActividad', e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none"
            >
              <option value="Sedentario">Sedentario</option>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
          {/* TMB/TDEE calculados */}
          <div className="bg-electric/5 border border-electric/10 rounded-xl p-3 flex flex-col justify-center">
            <p className="text-white/30 text-[10px] uppercase tracking-wider">C&aacute;lculo autom&aacute;tico</p>
            <p className="text-white text-sm font-bold mt-1">TMB: {tmb || '---'} kcal</p>
            <p className="text-electric text-sm font-bold">TDEE: {tdee || '---'} kcal</p>
          </div>
        </div>
      </div>

      {/* Notas personales */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-amber-400" /> Notas Personales
        </h3>
        <p className="text-white/30 text-xs mb-3">Lesiones, alergias alimentarias, medicaci&oacute;n, preferencias, o cualquier dato relevante para tu entrenamiento.</p>
        <textarea
          value={form.notas}
          onChange={e => handleChange('notas', e.target.value)}
          rows={5}
          placeholder="Ej: Tengo una lesi&oacute;n en el hombro derecho, evitar press militar pesado. Soy intolerante a la lactosa. Tomo medicaci&oacute;n para tiroides..."
          className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30 resize-none leading-relaxed"
        />
        <p className="text-white/15 text-xs mt-2 text-right">{form.notas.length} caracteres</p>
      </div>

      {/* Guardar */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
          saved
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-gradient-to-r from-electric to-neon text-black shadow-lg shadow-electric/20 hover:shadow-electric/40 hover:scale-[1.01]'
        }`}
      >
        <Save className="w-4 h-4" />
        {saved ? 'Perfil guardado correctamente' : 'Guardar Cambios'}
      </button>
    </div>
  );
}
