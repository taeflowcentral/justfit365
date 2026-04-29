import { useState } from 'react';
import { Users, Plus, Search, Dumbbell, Utensils, Trash2, User, Phone, Target, Activity, MessageCircle, Printer, Mail, History, Save, Clock, TrendingUp, ArrowDown, ArrowUp, Minus, CheckCircle, AlertTriangle, Weight, Ruler, Calendar, Zap, Camera } from 'lucide-react';
import { getUserItem, setUserItem } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { buscarAlimentos, analizarComida } from '../lib/foodDB';
import { printContent } from '../components/ShareButtons';

// Plantillas de ejercicios por objetivo
const DISCIPLINAS = ['Push', 'Pull', 'Piernas', 'Upper', 'Lower', 'Full Body', 'Cardio', 'HIIT', 'Funcional', 'Running', 'Caminata Activa', 'Yoga', 'Spinning', 'Ciclismo'];

const plantillasRutina: Record<string, ClienteRutina[]> = {
  'Push': [
    { id: 0, nombre: 'Press Banca con Barra', series: 4, reps: '8-10', descanso: '90', peso: '', musculo: 'Pecho', notas: '' },
    { id: 0, nombre: 'Press Inclinado Mancuernas', series: 3, reps: '10-12', descanso: '75', peso: '', musculo: 'Pecho superior', notas: '' },
    { id: 0, nombre: 'Press Militar con Barra', series: 4, reps: '8-10', descanso: '90', peso: '', musculo: 'Hombros', notas: '' },
    { id: 0, nombre: 'Elevaciones Laterales', series: 4, reps: '12-15', descanso: '60', peso: '', musculo: 'Hombros', notas: '' },
    { id: 0, nombre: 'Fondos en Paralelas', series: 3, reps: '10-12', descanso: '75', peso: '', musculo: 'Pecho / Triceps', notas: '' },
    { id: 0, nombre: 'Extension Triceps Polea', series: 3, reps: '12-15', descanso: '60', peso: '', musculo: 'Triceps', notas: '' },
  ],
  'Pull': [
    { id: 0, nombre: 'Dominadas', series: 4, reps: '8-10', descanso: '90', peso: 'Corporal', musculo: 'Espalda', notas: '' },
    { id: 0, nombre: 'Remo con Barra', series: 4, reps: '8-10', descanso: '90', peso: '', musculo: 'Espalda', notas: '' },
    { id: 0, nombre: 'Remo Mancuerna a 1 Brazo', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Espalda', notas: '' },
    { id: 0, nombre: 'Pull Down Polea', series: 3, reps: '10-12', descanso: '75', peso: '', musculo: 'Espalda', notas: '' },
    { id: 0, nombre: 'Curl Biceps con Barra', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Biceps', notas: '' },
    { id: 0, nombre: 'Face Pull', series: 3, reps: '15-20', descanso: '45', peso: '', musculo: 'Hombro posterior', notas: '' },
  ],
  'Piernas': [
    { id: 0, nombre: 'Sentadilla con Barra', series: 4, reps: '6-8', descanso: '120', peso: '', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Prensa de Piernas', series: 4, reps: '10-12', descanso: '90', peso: '', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Peso Muerto Rumano', series: 4, reps: '8-10', descanso: '90', peso: '', musculo: 'Isquiotibiales', notas: '' },
    { id: 0, nombre: 'Zancadas con Mancuernas', series: 3, reps: '12 c/lado', descanso: '60', peso: '', musculo: 'Gluteos', notas: '' },
    { id: 0, nombre: 'Extension de Piernas', series: 3, reps: '12-15', descanso: '60', peso: '', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Curl Femoral', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Isquiotibiales', notas: '' },
    { id: 0, nombre: 'Elevacion de Pantorrillas', series: 4, reps: '15-20', descanso: '45', peso: '', musculo: 'Pantorrillas', notas: '' },
  ],
  'Upper': [
    { id: 0, nombre: 'Press Banca con Barra', series: 4, reps: '6-8', descanso: '90', peso: '', musculo: 'Pecho', notas: '' },
    { id: 0, nombre: 'Dominadas', series: 4, reps: '8-10', descanso: '90', peso: 'Corporal', musculo: 'Espalda', notas: '' },
    { id: 0, nombre: 'Press Militar', series: 3, reps: '8-10', descanso: '75', peso: '', musculo: 'Hombros', notas: '' },
    { id: 0, nombre: 'Remo con Barra', series: 3, reps: '10-12', descanso: '75', peso: '', musculo: 'Espalda', notas: '' },
    { id: 0, nombre: 'Curl Biceps', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Biceps', notas: '' },
    { id: 0, nombre: 'Extension Triceps', series: 3, reps: '12-15', descanso: '60', peso: '', musculo: 'Triceps', notas: '' },
  ],
  'Lower': [
    { id: 0, nombre: 'Sentadilla con Barra', series: 4, reps: '8-10', descanso: '90', peso: '', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Peso Muerto Rumano', series: 4, reps: '8-10', descanso: '90', peso: '', musculo: 'Isquiotibiales', notas: '' },
    { id: 0, nombre: 'Hip Thrust', series: 4, reps: '10-12', descanso: '75', peso: '', musculo: 'Gluteos', notas: '' },
    { id: 0, nombre: 'Sentadilla Bulgara', series: 3, reps: '10 c/lado', descanso: '60', peso: '', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Curl Femoral', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Isquiotibiales', notas: '' },
    { id: 0, nombre: 'Elevacion de Pantorrillas', series: 4, reps: '15-20', descanso: '45', peso: '', musculo: 'Pantorrillas', notas: '' },
  ],
  'Full Body': [
    { id: 0, nombre: 'Sentadilla con Barra', series: 3, reps: '8-10', descanso: '90', peso: '', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Press Banca', series: 3, reps: '8-10', descanso: '90', peso: '', musculo: 'Pecho', notas: '' },
    { id: 0, nombre: 'Remo con Barra', series: 3, reps: '10-12', descanso: '75', peso: '', musculo: 'Espalda', notas: '' },
    { id: 0, nombre: 'Press Militar', series: 3, reps: '10-12', descanso: '75', peso: '', musculo: 'Hombros', notas: '' },
    { id: 0, nombre: 'Peso Muerto Rumano', series: 3, reps: '8-10', descanso: '75', peso: '', musculo: 'Isquiotibiales', notas: '' },
    { id: 0, nombre: 'Plancha', series: 3, reps: '45 seg', descanso: '30', peso: 'Corporal', musculo: 'Core', notas: '' },
  ],
  'Cardio': [
    { id: 0, nombre: 'Cinta - Trote', series: 1, reps: '20 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: 'Ritmo moderado' },
    { id: 0, nombre: 'Bicicleta Estatica', series: 1, reps: '15 min', descanso: '0', peso: '-', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Eliptico', series: 1, reps: '15 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: '' },
    { id: 0, nombre: 'Remo ergometro', series: 1, reps: '10 min', descanso: '0', peso: '-', musculo: 'Espalda', notas: '' },
    { id: 0, nombre: 'Saltar la soga', series: 5, reps: '2 min', descanso: '30', peso: '-', musculo: 'Pantorrillas', notas: '' },
  ],
  'HIIT': [
    { id: 0, nombre: 'Burpees', series: 5, reps: '10', descanso: '30', peso: '-', musculo: 'Full Body', notas: 'Maxima intensidad' },
    { id: 0, nombre: 'Mountain Climbers', series: 5, reps: '20', descanso: '30', peso: '-', musculo: 'Core', notas: '' },
    { id: 0, nombre: 'Jumping Squats', series: 5, reps: '15', descanso: '30', peso: '-', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Sprint en Cinta', series: 8, reps: '30 seg', descanso: '30', peso: '-', musculo: 'Full Body', notas: '30s sprint / 30s descanso' },
    { id: 0, nombre: 'Box Jumps', series: 4, reps: '10', descanso: '30', peso: '-', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Plancha con toque de hombro', series: 4, reps: '20', descanso: '30', peso: '-', musculo: 'Core', notas: '' },
  ],
  'Funcional': [
    { id: 0, nombre: 'Kettlebell Swing', series: 4, reps: '15', descanso: '60', peso: '', musculo: 'Gluteos', notas: '' },
    { id: 0, nombre: 'Turkish Get Up', series: 3, reps: '3 c/lado', descanso: '60', peso: '', musculo: 'Full Body', notas: '' },
    { id: 0, nombre: 'Farmer Walk', series: 3, reps: '40 metros', descanso: '60', peso: '', musculo: 'Core', notas: '' },
    { id: 0, nombre: 'Battle Ropes', series: 4, reps: '30 seg', descanso: '30', peso: '-', musculo: 'Full Body', notas: '' },
    { id: 0, nombre: 'Clean and Press Kettlebell', series: 4, reps: '8 c/lado', descanso: '60', peso: '', musculo: 'Full Body', notas: '' },
    { id: 0, nombre: 'Goblet Squat', series: 3, reps: '12', descanso: '60', peso: '', musculo: 'Cuadriceps', notas: '' },
  ],
  'Running': [
    { id: 0, nombre: 'Calentamiento caminata', series: 1, reps: '5 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: '' },
    { id: 0, nombre: 'Trote continuo', series: 1, reps: '25 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: 'Ritmo constante' },
    { id: 0, nombre: 'Intervalos de velocidad', series: 6, reps: '1 min rapido / 1 min trote', descanso: '0', peso: '-', musculo: 'Full Body', notas: '' },
    { id: 0, nombre: 'Vuelta a la calma', series: 1, reps: '5 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: '' },
  ],
  'Caminata Activa': [
    { id: 0, nombre: 'Caminata rapida', series: 1, reps: '30 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: 'Ritmo 6-7 km/h' },
    { id: 0, nombre: 'Caminata con inclinacion', series: 4, reps: '5 min subida', descanso: '2 min', peso: '-', musculo: 'Gluteos', notas: '' },
    { id: 0, nombre: 'Power Walking', series: 1, reps: '15 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: '' },
    { id: 0, nombre: 'Elongacion final', series: 1, reps: '5 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: '' },
  ],
  'Yoga': [
    { id: 0, nombre: 'Saludo al sol', series: 5, reps: '1 ciclo', descanso: '15', peso: '-', musculo: 'Full Body', notas: '' },
    { id: 0, nombre: 'Guerrero I y II', series: 3, reps: '30 seg c/lado', descanso: '10', peso: '-', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Plancha a Perro boca abajo', series: 4, reps: '30 seg c/u', descanso: '10', peso: '-', musculo: 'Core', notas: '' },
    { id: 0, nombre: 'Postura del arbol', series: 2, reps: '30 seg c/lado', descanso: '10', peso: '-', musculo: 'Core', notas: '' },
    { id: 0, nombre: 'Torsion espinal sentado', series: 2, reps: '30 seg c/lado', descanso: '10', peso: '-', musculo: 'Espalda', notas: '' },
    { id: 0, nombre: 'Savasana', series: 1, reps: '5 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: 'Relajacion' },
  ],
  'Spinning': [
    { id: 0, nombre: 'Calentamiento suave', series: 1, reps: '5 min', descanso: '0', peso: '-', musculo: 'Cuadriceps', notas: 'Resistencia baja' },
    { id: 0, nombre: 'Subidas de resistencia', series: 5, reps: '3 min alta / 2 min baja', descanso: '0', peso: '-', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Sprint en llano', series: 6, reps: '30 seg sprint / 30 seg suave', descanso: '0', peso: '-', musculo: 'Full Body', notas: '' },
    { id: 0, nombre: 'Pedaleo sentado sostenido', series: 1, reps: '10 min', descanso: '0', peso: '-', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Vuelta a la calma', series: 1, reps: '5 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: '' },
  ],
  'Ciclismo': [
    { id: 0, nombre: 'Rodaje suave', series: 1, reps: '10 min', descanso: '0', peso: '-', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Intervalos de fuerza', series: 5, reps: '3 min fuerte / 2 min suave', descanso: '0', peso: '-', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Tempo sostenido', series: 1, reps: '20 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: '' },
    { id: 0, nombre: 'Sprints cortos', series: 4, reps: '20 seg sprint / 40 seg suave', descanso: '0', peso: '-', musculo: 'Cuadriceps', notas: '' },
    { id: 0, nombre: 'Vuelta a la calma', series: 1, reps: '10 min', descanso: '0', peso: '-', musculo: 'Full Body', notas: '' },
  ],
};

// Generar plan nutricional automatico
function generarNutricionCliente(peso: number, objetivo: string): ClienteComida[] {
  const esDeficit = objetivo.toLowerCase().includes('grasa') || objetivo.toLowerCase().includes('perdida');
  const esMasa = objetivo.toLowerCase().includes('hipertrofia') || objetivo.toLowerCase().includes('fuerza');
  const protPorComida = Math.round((peso * (esDeficit ? 2.2 : esMasa ? 2.0 : 1.6)) / 5);

  return [
    { id: Date.now(), nombre: 'Desayuno', hora: '07:30', items: [
      { id: Date.now()+1, alimento: 'Avena con leche', porcion: '80g + 200ml', cal: esDeficit ? 250 : 320, prot: 14, carb: esDeficit ? 35 : 52, grasa: 6 },
      { id: Date.now()+2, alimento: 'Huevos revueltos', porcion: '2 unidades', cal: 140, prot: 12, carb: 2, grasa: 10 },
      { id: Date.now()+3, alimento: 'Banana', porcion: '1 unidad', cal: 105, prot: 1, carb: 27, grasa: 0 },
    ]},
    { id: Date.now()+10, nombre: 'Media Manana', hora: '10:30', items: [
      { id: Date.now()+11, alimento: 'Yogur griego', porcion: '1 pote (200g)', cal: 130, prot: 20, carb: 6, grasa: 3 },
      { id: Date.now()+12, alimento: 'Nueces', porcion: '15g', cal: 100, prot: 2, carb: 2, grasa: 10 },
    ]},
    { id: Date.now()+20, nombre: 'Almuerzo', hora: '13:00', items: [
      { id: Date.now()+21, alimento: 'Pechuga de pollo', porcion: `${protPorComida * 4}g`, cal: Math.round(protPorComida * 5.5), prot: protPorComida, carb: 0, grasa: Math.round(protPorComida * 0.13) },
      { id: Date.now()+22, alimento: esMasa ? 'Arroz integral' : 'Ensalada mixta', porcion: esMasa ? '150g' : '200g', cal: esMasa ? 170 : 30, prot: esMasa ? 4 : 2, carb: esMasa ? 36 : 6, grasa: esMasa ? 1 : 0 },
      { id: Date.now()+23, alimento: 'Brocoli al vapor', porcion: '150g', cal: 50, prot: 4, carb: 8, grasa: 0 },
    ]},
    { id: Date.now()+30, nombre: 'Merienda', hora: '16:30', items: [
      { id: Date.now()+31, alimento: 'Whey protein', porcion: '1 scoop (30g)', cal: 120, prot: 24, carb: 3, grasa: 1 },
      { id: Date.now()+32, alimento: esMasa ? 'Banana' : 'Arandanos', porcion: esMasa ? '1 unidad' : '100g', cal: esMasa ? 105 : 57, prot: 1, carb: esMasa ? 27 : 14, grasa: 0 },
    ]},
    { id: Date.now()+40, nombre: 'Cena', hora: '20:30', items: [
      { id: Date.now()+41, alimento: esDeficit ? 'Merluza al horno' : 'Salmon al horno', porcion: '200g', cal: esDeficit ? 180 : 390, prot: esDeficit ? 36 : 44, carb: 0, grasa: esDeficit ? 4 : 24 },
      { id: Date.now()+42, alimento: 'Batata asada', porcion: '200g', cal: 180, prot: 2, carb: 42, grasa: 0 },
      { id: Date.now()+43, alimento: 'Ensalada de rucula y parmesano', porcion: '1 plato', cal: 160, prot: 10, carb: 4, grasa: 12 },
    ]},
  ];
}

interface ClienteRutina {
  id: number;
  nombre: string;
  series: number;
  reps: string;
  descanso: string;
  peso: string;
  musculo: string;
  notas: string;
}

interface ClienteComida {
  id: number;
  nombre: string;
  hora: string;
  items: { id: number; alimento: string; porcion: string; cal: number; prot: number; carb: number; grasa: number }[];
}

interface HistorialEntry {
  id: number;
  fecha: string;
  tipo: 'rutina' | 'nutricion';
  datos: ClienteRutina[] | ClienteComida[];
  nota: string;
}

interface PesoEntry { fecha: string; peso: number }

interface Cliente {
  id: number;
  nombre: string;
  dni: string;
  direccion: string;
  telefono: string;
  email: string;
  contactoEmergencia: string;
  telefonoEmergencia: string;
  objetivo: string;
  nivel: string;
  peso: number;
  altura: number;
  edad: number;
  pesoMeta: number;
  fechaMeta: string;
  pesoHistorial: PesoEntry[];
  nivelActividad: string;
  enfermedades: string[];
  declaraBuenaSalud: boolean;
  esMayorDeEdad: boolean;
  foto: string;
  rutina: ClienteRutina[];
  nutricion: ClienteComida[];
  notas: string;
  historial: HistorialEntry[];
}

const CLIENTES_KEY = 'bc_gym_clientes';

export default function GymClientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = getUserItem(CLIENTES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((c: Cliente) => ({ ...c, email: c.email || '', dni: c.dni || '', direccion: c.direccion || '', contactoEmergencia: c.contactoEmergencia || '', telefonoEmergencia: c.telefonoEmergencia || '', enfermedades: c.enfermedades || [], declaraBuenaSalud: c.declaraBuenaSalud ?? false, esMayorDeEdad: c.esMayorDeEdad ?? true, foto: c.foto || '', historial: c.historial || [], pesoMeta: c.pesoMeta || 0, fechaMeta: c.fechaMeta || '', pesoHistorial: c.pesoHistorial || [], nivelActividad: c.nivelActividad || 'Intermedio' }));
    }
    return [];
  });
  const [busqueda, setBusqueda] = useState('');
  const [clienteActivo, setClienteActivo] = useState<number | null>(null);
  const [tab, setTab] = useState<'rutina' | 'nutricion' | 'perfil' | 'historial'>('rutina');
  const [showAddCliente, setShowAddCliente] = useState(false);
  const [showAddEj, setShowAddEj] = useState(false);
  const [showAddComida, setShowAddComida] = useState(false);
  const [showAddAlimento, setShowAddAlimento] = useState<number | null>(null);
  const [showDisciplinas, setShowDisciplinas] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', dni: '', direccion: '', telefono: '', email: '', contactoEmergencia: '', telefonoEmergencia: '', objetivo: [] as string[], nivel: 'Principiante', peso: '', altura: '', edad: '', pesoMeta: '', enfermedades: [] as string[], declaraBuenaSalud: false, esMayorDeEdad: false });
  const [nuevoEj, setNuevoEj] = useState({ nombre: '', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Pecho', notas: '' });
  const [nuevaComida, setNuevaComida] = useState({ nombre: '', hora: '12:00' });
  const [nuevoAlimento, setNuevoAlimento] = useState({ alimento: '', porcion: '', cal: 0, prot: 0, carb: 0, grasa: 0 });

  const guardar = (c: Cliente[]) => { setClientes(c); setUserItem(CLIENTES_KEY, JSON.stringify(c)); };

  const cliente = clientes.find(c => c.id === clienteActivo);
  const filtrados = clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const updateCliente = (id: number, data: Partial<Cliente>) => {
    guardar(clientes.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const addCliente = () => {
    if (!nuevoCliente.nombre.trim()) return;
    const nuevo: Cliente = {
      id: Date.now(), nombre: nuevoCliente.nombre, dni: nuevoCliente.dni, direccion: nuevoCliente.direccion,
      telefono: nuevoCliente.telefono, email: nuevoCliente.email,
      contactoEmergencia: nuevoCliente.contactoEmergencia, telefonoEmergencia: nuevoCliente.telefonoEmergencia,
      objetivo: nuevoCliente.objetivo.join(', '), nivel: nuevoCliente.nivel,
      peso: parseFloat(nuevoCliente.peso) || 70, altura: parseInt(nuevoCliente.altura) || 170, edad: parseInt(nuevoCliente.edad) || 25,
      pesoMeta: parseFloat(nuevoCliente.pesoMeta) || 0, fechaMeta: '', pesoHistorial: [], nivelActividad: nuevoCliente.nivel,
      enfermedades: nuevoCliente.enfermedades, declaraBuenaSalud: nuevoCliente.declaraBuenaSalud, esMayorDeEdad: nuevoCliente.esMayorDeEdad, foto: '',
      notas: '', rutina: [], nutricion: [], historial: [],
    };
    guardar([...clientes, nuevo]);
    setNuevoCliente({ nombre: '', dni: '', direccion: '', telefono: '', email: '', contactoEmergencia: '', telefonoEmergencia: '', objetivo: [], nivel: 'Principiante', peso: '', altura: '', edad: '', pesoMeta: '', enfermedades: [], declaraBuenaSalud: false, esMayorDeEdad: false });
    setShowAddCliente(false);
    setClienteActivo(nuevo.id);
  };

  const deleteCliente = (id: number) => {
    guardar(clientes.filter(c => c.id !== id));
    if (clienteActivo === id) setClienteActivo(null);
  };

  // Rutina
  const addEjercicioCliente = () => {
    if (!cliente || !nuevoEj.nombre.trim()) return;
    const ej: ClienteRutina = { id: Date.now(), ...nuevoEj };
    updateCliente(cliente.id, { rutina: [...cliente.rutina, ej] });
    setNuevoEj({ nombre: '', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Pecho', notas: '' });
    setShowAddEj(false);
  };

  const deleteEjCliente = (ejId: number) => {
    if (!cliente) return;
    updateCliente(cliente.id, { rutina: cliente.rutina.filter(e => e.id !== ejId) });
  };

  // Nutricion
  const addComidaCliente = () => {
    if (!cliente || !nuevaComida.nombre.trim()) return;
    const comida: ClienteComida = { id: Date.now(), nombre: nuevaComida.nombre, hora: nuevaComida.hora, items: [] };
    updateCliente(cliente.id, { nutricion: [...cliente.nutricion, comida] });
    setNuevaComida({ nombre: '', hora: '12:00' });
    setShowAddComida(false);
  };

  const addItemComida = (comidaId: number) => {
    if (!cliente || !nuevoAlimento.alimento.trim()) return;
    const nutricion = cliente.nutricion.map(c => c.id === comidaId ? { ...c, items: [...c.items, { id: Date.now(), ...nuevoAlimento }] } : c);
    updateCliente(cliente.id, { nutricion });
    setNuevoAlimento({ alimento: '', porcion: '', cal: 0, prot: 0, carb: 0, grasa: 0 });
    setShowAddAlimento(null);
  };

  const deleteItemComida = (comidaId: number, itemId: number) => {
    if (!cliente) return;
    const nutricion = cliente.nutricion.map(c => c.id === comidaId ? { ...c, items: c.items.filter(it => it.id !== itemId) } : c);
    updateCliente(cliente.id, { nutricion });
  };

  const deleteComidaCliente = (comidaId: number) => {
    if (!cliente) return;
    updateCliente(cliente.id, { nutricion: cliente.nutricion.filter(c => c.id !== comidaId) });
  };

  // Guardar en historial
  const guardarEnHistorial = (tipo: 'rutina' | 'nutricion') => {
    if (!cliente) return;
    const entry: HistorialEntry = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString('es-AR'),
      tipo,
      datos: tipo === 'rutina' ? [...cliente.rutina] : [...cliente.nutricion],
      nota: `${tipo === 'rutina' ? 'Rutina' : 'Plan nutricional'} guardado`,
    };
    updateCliente(cliente.id, { historial: [...(cliente.historial || []), entry] });
  };

  // Generar texto para compartir
  const generarTexto = (tipo: 'rutina' | 'nutricion'): string => {
    if (!cliente) return '';
    const gym = user?.gimnasioNombre || 'JustFit365';
    let text = `*${gym} - ${cliente.nombre}*\n\n`;
    if (tipo === 'rutina') {
      text += '*Rutina de Entrenamiento:*\n';
      cliente.rutina.forEach((e, i) => {
        text += `${i + 1}. *${e.nombre}* (${e.musculo})\n   ${e.series}x${e.reps} | ${e.peso}kg | Desc: ${e.descanso}s\n`;
        if (e.notas) text += `   \u2192 ${e.notas}\n`;
      });
    } else {
      text += '*Plan Nutricional:*\n';
      let totalCal = 0;
      cliente.nutricion.forEach(c => {
        const comidaCal = c.items.reduce((a, it) => a + it.cal, 0);
        totalCal += comidaCal;
        text += `\n*${c.nombre}* (${c.hora}) - ${comidaCal} kcal\n`;
        c.items.forEach(it => { text += `  \u2022 ${it.alimento} (${it.porcion}) - ${it.cal}cal | ${it.prot}gP | ${it.carb}gC | ${it.grasa}gG\n`; });
      });
      text += `\n*Total:* ${totalCal} kcal`;
    }
    text += `\n\n_Generado por ${gym} + JustFit365_`;
    return text;
  };

  // WhatsApp
  const enviarWhatsApp = (tipo: 'rutina' | 'nutricion') => {
    if (!cliente) return;
    const text = generarTexto(tipo);
    const tel = cliente.telefono.replace(/\D/g, '');
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Email
  const enviarEmail = (tipo: 'rutina' | 'nutricion') => {
    if (!cliente) return;
    const gym = user?.gimnasioNombre || 'JustFit365';
    const subject = `${gym} - ${tipo === 'rutina' ? 'Rutina' : 'Plan Nutricional'} - ${cliente.nombre}`;
    const body = generarTexto(tipo).replace(/\*/g, '');
    const mailto = `mailto:${cliente.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  // Imprimir
  const imprimir = (tipo: 'rutina' | 'nutricion') => {
    if (!cliente) return;
    const gym = user?.gimnasioNombre || 'JustFit365';
    let html = `<p class="subtitle">${gym} - ${cliente.nombre} | ${cliente.objetivo} | ${cliente.peso}kg | ${cliente.edad} a\u00f1os</p>`;

    if (tipo === 'rutina') {
      html += '<table><tr><th>#</th><th>Ejercicio</th><th>M\u00fasculo</th><th>Series</th><th>Reps</th><th>Peso</th><th>Desc.</th><th>Notas</th></tr>';
      cliente.rutina.forEach((e, i) => {
        html += `<tr><td>${i + 1}</td><td>${e.nombre}</td><td>${e.musculo}</td><td>${e.series}</td><td>${e.reps}</td><td>${e.peso}kg</td><td>${e.descanso}s</td><td>${e.notas || '-'}</td></tr>`;
      });
      html += '</table>';
    } else {
      cliente.nutricion.forEach(c => {
        const cal = c.items.reduce((a, it) => a + it.cal, 0);
        html += `<h2>${c.nombre} (${c.hora}) - ${cal} kcal</h2>`;
        html += '<table><tr><th>Alimento</th><th>Porci\u00f3n</th><th>Cal</th><th>Prot</th><th>Carb</th><th>Grasa</th></tr>';
        c.items.forEach(it => { html += `<tr><td>${it.alimento}</td><td>${it.porcion}</td><td>${it.cal}</td><td>${it.prot}g</td><td>${it.carb}g</td><td>${it.grasa}g</td></tr>`; });
        html += '</table>';
      });
      const total = cliente.nutricion.reduce((a, c) => a + c.items.reduce((b, it) => b + it.cal, 0), 0);
      html += `<div class="note"><strong>Total:</strong> ${total} kcal</div>`;
    }
    html += `<p style="margin-top:20px;font-size:11px;color:#888">Fecha: ${new Date().toLocaleDateString('es-AR')} | ${gym} + JustFit365</p>`;
    printContent(`${tipo === 'rutina' ? 'Rutina' : 'Plan Nutricional'} - ${cliente.nombre}`, html);
  };

  // Vista lista
  if (!clienteActivo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Users className="w-7 h-7 text-electric" /> Mis Clientes
            </h1>
            <p className="text-white/50 text-sm mt-1">{clientes.length} clientes registrados</p>
          </div>
          <button onClick={() => setShowAddCliente(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-electric to-neon text-black rounded-xl text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-electric/20">
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cliente..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/30" />
        </div>

        {clientes.length === 0 && (
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Sin clientes</h3>
            <p className="text-white/40 text-sm mb-4">Agreg&aacute; tu primer cliente para crear rutinas y planes nutricionales.</p>
            <button onClick={() => setShowAddCliente(true)} className="px-6 py-3 bg-gradient-to-r from-electric to-neon text-black rounded-xl text-sm font-bold">
              <Plus className="w-4 h-4 inline mr-1" /> Agregar Cliente
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrados.map(c => (
            <div key={c.id} className="bg-dark-800 border border-dark-border rounded-2xl p-5 hover:border-electric/20 transition-all cursor-pointer" onClick={() => { setClienteActivo(c.id); setTab('rutina'); }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    {c.foto ? <img src={c.foto} alt={c.nombre} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-electric to-neon flex items-center justify-center text-black text-sm font-black">{c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>}
                  </div>
                  <div>
                    <p className="text-white font-bold">{c.nombre}</p>
                    <p className="text-white/40 text-xs">{c.objetivo?.split(',')[0] || '-'} &middot; {c.nivel}{c.dni ? ` \u00b7 DNI ${c.dni}` : ''}</p>
                  </div>
                </div>
                <button onClick={(ev) => { ev.stopPropagation(); deleteCliente(c.id); }} className="p-1.5 text-white/15 hover:text-danger transition-colors rounded-lg hover:bg-white/5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {c.rutina.length} ej.</span>
                <span className="flex items-center gap-1"><Utensils className="w-3 h-3" /> {c.nutricion.length} comidas</span>
                <span>{c.peso}kg &middot; {c.altura}cm &middot; {c.edad}a</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal nuevo cliente */}
        {showAddCliente && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAddCliente(false)}>
            <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2"><Plus className="w-5 h-5 text-electric" /> Nuevo Cliente</h2>
              <div className="space-y-4">
                {/* Datos personales */}
                <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold border-b border-dark-border pb-1">Datos Personales</p>
                <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Nombre completo *</label>
                  <input type="text" value={nuevoCliente.nombre} onChange={e => setNuevoCliente(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre y Apellido" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">DNI</label>
                    <input type="text" value={nuevoCliente.dni} onChange={e => setNuevoCliente(p => ({ ...p, dni: e.target.value.replace(/\D/g, '') }))} placeholder="30123456" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Edad</label>
                    <input type="number" value={nuevoCliente.edad} onChange={e => setNuevoCliente(p => ({ ...p, edad: e.target.value }))} placeholder="25" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                </div>
                <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Direcci&oacute;n</label>
                  <input type="text" value={nuevoCliente.direccion} onChange={e => setNuevoCliente(p => ({ ...p, direccion: e.target.value }))} placeholder="Calle 123, Ciudad" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Tel&eacute;fono (WhatsApp)</label>
                    <input type="tel" value={nuevoCliente.telefono} onChange={e => setNuevoCliente(p => ({ ...p, telefono: e.target.value }))} placeholder="5492211234567" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Email</label>
                    <input type="email" value={nuevoCliente.email} onChange={e => setNuevoCliente(p => ({ ...p, email: e.target.value }))} placeholder="cliente@email.com" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                </div>

                {/* Contacto de emergencia */}
                <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold border-b border-dark-border pb-1 pt-2">Contacto de Emergencia</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Nombre</label>
                    <input type="text" value={nuevoCliente.contactoEmergencia} onChange={e => setNuevoCliente(p => ({ ...p, contactoEmergencia: e.target.value }))} placeholder="Familiar o amigo" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Tel&eacute;fono</label>
                    <input type="tel" value={nuevoCliente.telefonoEmergencia} onChange={e => setNuevoCliente(p => ({ ...p, telefonoEmergencia: e.target.value }))} placeholder="5492211234567" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                </div>

                {/* Datos fisicos */}
                <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold border-b border-dark-border pb-1 pt-2">Datos F&iacute;sicos y Objetivos</p>
                <div className="grid grid-cols-4 gap-3">
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Peso (kg)</label>
                    <input type="number" value={nuevoCliente.peso} onChange={e => setNuevoCliente(p => ({ ...p, peso: e.target.value }))} placeholder="75" className="w-full px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Altura (cm)</label>
                    <input type="number" value={nuevoCliente.altura} onChange={e => setNuevoCliente(p => ({ ...p, altura: e.target.value }))} placeholder="170" className="w-full px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Peso meta</label>
                    <input type="number" value={nuevoCliente.pesoMeta} onChange={e => setNuevoCliente(p => ({ ...p, pesoMeta: e.target.value }))} placeholder="70" className="w-full px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Nivel</label>
                    <select value={nuevoCliente.nivel} onChange={e => setNuevoCliente(p => ({ ...p, nivel: e.target.value }))} className="w-full px-2 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                      {['Sedentario', 'Principiante', 'Intermedio', 'Avanzado', 'Elite'].map(n => <option key={n} value={n} className="bg-dark-800">{n}</option>)}
                    </select></div>
                </div>

                {/* Objetivos multiples */}
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Objetivos (pod&eacute;s elegir varios)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Hipertrofia', 'Tonificacion', 'Perdida de grasa', 'Fuerza', 'Resistencia', 'Salud general', 'Rendimiento deportivo', 'Rehabilitacion'].map(obj => {
                      const activo = nuevoCliente.objetivo.includes(obj);
                      return (
                        <button key={obj} type="button" onClick={() => {
                          setNuevoCliente(p => ({
                            ...p,
                            objetivo: activo ? p.objetivo.filter(o => o !== obj) : [...p.objetivo, obj],
                          }));
                        }}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                            activo ? 'bg-electric/15 text-electric border border-electric/30' : 'bg-black/40 text-white/40 border border-dark-border hover:text-white/60'
                          }`}>
                          {obj === 'Perdida de grasa' ? 'P\u00e9rdida de grasa' : obj === 'Tonificacion' ? 'Tonificaci\u00f3n' : obj === 'Rehabilitacion' ? 'Rehabilitaci\u00f3n' : obj}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Condiciones preexistentes */}
                <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold border-b border-dark-border pb-1 pt-2">Condiciones Preexistentes</p>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {['Hipotiroidismo', 'Hipertiroidismo', 'Hashimoto', 'Diabetes tipo 1', 'Diabetes tipo 2', 'Hipertension arterial', 'Asma', 'EPOC', 'Enfermedad celiaca', 'Intolerancia a la lactosa', 'Alergia al gluten', 'SOP', 'Endometriosis', 'Artritis reumatoide', 'Osteoporosis', 'Osteoartritis', 'Fibromialgia', 'Lupus', 'Crohn', 'Colitis ulcerosa', 'Sindrome intestino irritable', 'Reflujo gastroesofagico', 'Insuficiencia renal', 'Higado graso', 'Anemia ferropenica', 'Arritmia cardiaca', 'Insuficiencia cardiaca', 'Cardiopatia isquemica', 'Epilepsia', 'Esclerosis multiple', 'Parkinson', 'Depresion clinica', 'Ansiedad generalizada', 'Hernia de disco', 'Escoliosis', 'Tendinitis cronica', 'Tunel carpiano', 'Psoriasis', 'Apnea del sueno', 'Hiperlipidemia', 'Gota', 'Angioedema', 'Angioedema hereditario', 'Embarazo', 'Sobrepeso/Obesidad', 'Addison', 'Cushing', 'Dermatitis atopica'].map(enf => {
                    const activo = nuevoCliente.enfermedades.includes(enf);
                    return (
                      <button key={enf} type="button" onClick={() => {
                        setNuevoCliente(p => ({
                          ...p,
                          enfermedades: activo ? p.enfermedades.filter(e => e !== enf) : [...p.enfermedades, enf],
                        }));
                      }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                          activo ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-black/30 text-white/30 border border-dark-border hover:text-white/50'
                        }`}>
                        {enf}
                      </button>
                    );
                  })}
                </div>

                {/* Declaraciones */}
                <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold border-b border-dark-border pb-1 pt-2">Declaraciones</p>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={nuevoCliente.esMayorDeEdad} onChange={e => setNuevoCliente(p => ({ ...p, esMayorDeEdad: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded border-dark-border bg-black/60 text-electric focus:ring-electric/30" />
                  <span className="text-white/60 text-xs leading-relaxed group-hover:text-white/80">Declaro ser <strong className="text-white">mayor de 18 a&ntilde;os</strong> o contar con autorizaci&oacute;n de un tutor legal.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={nuevoCliente.declaraBuenaSalud} onChange={e => setNuevoCliente(p => ({ ...p, declaraBuenaSalud: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded border-dark-border bg-black/60 text-electric focus:ring-electric/30" />
                  <span className="text-white/60 text-xs leading-relaxed group-hover:text-white/80">Declaro gozar de <strong className="text-white">buena salud</strong> y estar en condiciones f&iacute;sicas para realizar actividad deportiva. Cualquier condici&oacute;n fue informada arriba.</span>
                </label>

                <div className="flex gap-3 pt-3">
                  <button onClick={() => setShowAddCliente(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                  <button onClick={addCliente} disabled={!nuevoCliente.nombre.trim() || !nuevoCliente.declaraBuenaSalud || !nuevoCliente.esMayorDeEdad}
                    className="flex-1 py-3 bg-gradient-to-r from-electric to-neon text-black rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Crear Cliente</button>
                </div>
                {(!nuevoCliente.declaraBuenaSalud || !nuevoCliente.esMayorDeEdad) && nuevoCliente.nombre.trim() && (
                  <p className="text-amber-400/70 text-[10px] text-center">Ambas declaraciones son obligatorias para registrar al cliente.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista detalle
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setClienteActivo(null)} className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0">
              {cliente!.foto ? <img src={cliente!.foto} alt={cliente!.nombre} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-electric to-neon flex items-center justify-center text-black font-black">{cliente!.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{cliente!.nombre}</h1>
              <p className="text-white/40 text-xs">{cliente!.objetivo} &middot; {cliente!.nivel} &middot; {cliente!.peso}kg &middot; {cliente!.edad}a</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl border border-dark-border">
        {[
          { key: 'rutina' as const, label: 'Rutina', icon: Dumbbell },
          { key: 'nutricion' as const, label: 'Nutrici\u00f3n', icon: Utensils },
          { key: 'perfil' as const, label: 'Datos', icon: User },
          { key: 'historial' as const, label: 'Historial', icon: History },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === t.key ? 'bg-electric/15 text-electric' : 'text-white/30 hover:text-white/50'
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Rutina */}
      {tab === 'rutina' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-white/50 text-sm">{cliente!.rutina.length} ejercicios</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { guardarEnHistorial('rutina'); }} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-medium hover:bg-amber-500/20 transition-all" title="Guardar en historial">
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
              <button onClick={() => imprimir('rutina')} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-dark-border text-white/50 rounded-xl text-xs font-medium hover:bg-white/10 transition-all">
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
              <button onClick={() => enviarWhatsApp('rutina')} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-all">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button onClick={() => enviarEmail('rutina')} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-500/20 transition-all">
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button onClick={() => setShowDisciplinas(!showDisciplinas)} className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/15 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/25 transition-all">
                <Zap className="w-3.5 h-3.5" /> Generar Rutina
              </button>
              <button onClick={() => setShowAddEj(true)} className="flex items-center gap-1.5 px-3 py-2 bg-electric/15 border border-electric/20 text-electric rounded-xl text-xs font-bold hover:bg-electric/25 transition-all">
                <Plus className="w-3.5 h-3.5" /> Ejercicio
              </button>
            </div>
          </div>

          {/* Selector de disciplina */}
          {showDisciplinas && (
            <div className="bg-dark-800 border border-purple-500/20 rounded-2xl p-4">
              <p className="text-white font-bold text-sm mb-3">Elegir disciplina:</p>
              <div className="flex flex-wrap gap-2">
                {DISCIPLINAS.map(d => (
                  <button key={d} onClick={() => {
                    const plantilla = plantillasRutina[d] || [];
                    const ejs = plantilla.map(e => ({ ...e, id: Date.now() + Math.random() * 10000 }));
                    updateCliente(cliente!.id, { rutina: ejs });
                    setShowDisciplinas(false);
                  }} className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/25 transition-all">
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-white/30 text-[10px] mt-2">Reemplaza la rutina actual con los ejercicios de la disciplina elegida. Podes editar o agregar ejercicios despues.</p>
            </div>
          )}

          {cliente!.rutina.length === 0 && !showDisciplinas ? (
            <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
              <Dumbbell className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">Sin ejercicios. Usa "Generar Rutina" para elegir una disciplina.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cliente!.rutina.map((e, i) => (
                <div key={e.id} className="bg-dark-800 border border-dark-border rounded-xl p-4 flex items-center justify-between hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-purple-500/15 text-purple-400 rounded-lg flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{e.nombre}</p>
                      <p className="text-white/40 text-xs">{e.musculo} &middot; {e.series}x{e.reps} &middot; {e.peso}kg &middot; {e.descanso}s</p>
                      {e.notas && <p className="text-electric/50 text-xs mt-0.5">{e.notas}</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteEjCliente(e.id)} className="p-1.5 text-white/15 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Nutricion */}
      {tab === 'nutricion' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-white/50 text-sm">{cliente!.nutricion.length} comidas</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { guardarEnHistorial('nutricion'); }} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-medium hover:bg-amber-500/20 transition-all">
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
              <button onClick={() => imprimir('nutricion')} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-dark-border text-white/50 rounded-xl text-xs font-medium hover:bg-white/10 transition-all">
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
              <button onClick={() => enviarWhatsApp('nutricion')} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-all">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button onClick={() => enviarEmail('nutricion')} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-500/20 transition-all">
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button onClick={() => {
                const plan = generarNutricionCliente(cliente!.peso, cliente!.objetivo || 'Hipertrofia');
                updateCliente(cliente!.id, { nutricion: plan });
              }} className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/15 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/25 transition-all">
                <Zap className="w-3.5 h-3.5" /> Generar Plan
              </button>
              <button onClick={() => setShowAddComida(true)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/25 transition-all">
                <Plus className="w-3.5 h-3.5" /> Comida
              </button>
            </div>
          </div>

          {cliente!.nutricion.length === 0 ? (
            <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
              <Utensils className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">Sin plan nutricional. Agreg&aacute; comidas para este cliente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cliente!.nutricion.map(c => (
                <div key={c.id} className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border/50">
                    <div>
                      <p className="text-white font-bold text-sm">{c.nombre}</p>
                      <p className="text-white/40 text-xs">{c.hora} hs &middot; {c.items.reduce((a, it) => a + it.cal, 0)} kcal</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setShowAddAlimento(c.id)} className="p-1.5 text-white/20 hover:text-emerald-400 transition-colors"><Plus className="w-4 h-4" /></button>
                      <button onClick={() => deleteComidaCliente(c.id)} className="p-1.5 text-white/15 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {c.items.length > 0 && (
                    <div className="divide-y divide-dark-border/30">
                      {c.items.map(it => (
                        <div key={it.id} className="px-4 py-2 text-sm flex items-center justify-between">
                          <div>
                            <p className="text-white/80">{it.alimento} <span className="text-white/30">({it.porcion})</span></p>
                            <p className="text-[11px] text-white/40">{it.cal}cal &middot; {it.prot}gP &middot; {it.carb}gC &middot; {it.grasa}gG</p>
                          </div>
                          <button onClick={() => deleteItemComida(c.id, it.id)} className="p-1 text-white/10 hover:text-danger transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Indicadores nutricionales */}
                  {c.items.length > 0 && (() => {
                    const analisis = analizarComida(c.items);
                    const esSnack = c.nombre.toLowerCase().includes('merienda') || c.nombre.toLowerCase().includes('media');
                    if (esSnack) return null;
                    return (
                      <div className="px-4 py-2 border-t border-dark-border/30 bg-black/20 flex flex-wrap gap-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${analisis.tieneProteina ? 'bg-electric/10 text-electric border border-electric/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {analisis.tieneProteina ? '\u2713' : '!'} Prot
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${analisis.tieneCarbo ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {analisis.tieneCarbo ? '\u2713' : '!'} Carbo
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${analisis.tieneVegetal ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {analisis.tieneVegetal ? '\u2713' : '!'} Vegetal
                        </span>
                      </div>
                    );
                  })()}
                </div>
              ))}
              {/* Totales */}
              <div className="bg-dark-800 border border-electric/10 rounded-xl p-3 flex items-center justify-between">
                <span className="text-white/50 text-xs font-bold uppercase">Total del d&iacute;a</span>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="text-orange-400">{cliente!.nutricion.reduce((a, c) => a + c.items.reduce((b, it) => b + it.cal, 0), 0)} kcal</span>
                  <span className="text-electric">{cliente!.nutricion.reduce((a, c) => a + c.items.reduce((b, it) => b + it.prot, 0), 0)}g P</span>
                  <span className="text-amber-400">{cliente!.nutricion.reduce((a, c) => a + c.items.reduce((b, it) => b + it.carb, 0), 0)}g C</span>
                  <span className="text-pink-400">{cliente!.nutricion.reduce((a, c) => a + c.items.reduce((b, it) => b + it.grasa, 0), 0)}g G</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Perfil */}
      {tab === 'perfil' && (() => {
        const c = cliente!;
        const tmb = Math.round(10 * c.peso + 6.25 * c.altura - 5 * c.edad + 5);
        const factores: Record<string, number> = { 'Sedentario': 1.2, 'Principiante': 1.375, 'Intermedio': 1.55, 'Avanzado': 1.725, 'Elite': 1.9 };
        const tdee = Math.round(tmb * (factores[c.nivelActividad || c.nivel] || 1.55));
        const kgRestantes = c.pesoMeta > 0 ? Math.abs(c.peso - c.pesoMeta) : 0;
        const quiereBajar = c.pesoMeta > 0 && c.peso > c.pesoMeta;
        const quiereSubir = c.pesoMeta > 0 && c.peso < c.pesoMeta; void quiereSubir;
        const diasRestantes = c.fechaMeta ? Math.max(0, Math.round((new Date(c.fechaMeta).getTime() - Date.now()) / 86400000)) : 0;
        const semanasRestantes = Math.max(1, Math.round(diasRestantes / 7));
        const kgPorSemana = kgRestantes > 0 ? kgRestantes / semanasRestantes : 0;

        return (
        <div className="space-y-4">
          {/* Foto de perfil */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Camera className="w-4 h-4 text-electric" /> Foto de Perfil</h3>
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-dark-700 border-2 border-dark-border flex items-center justify-center">
                  {c.foto ? (
                    <img src={c.foto} alt={c.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <User className="w-8 h-8 text-white/10 mx-auto" />
                      <span className="text-white/15 text-[9px] block mt-1">Sin foto</span>
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) { alert('La imagen no debe superar los 2MB'); return; }
                    const reader = new FileReader();
                    reader.onloadend = () => updateCliente(c.id, { foto: reader.result as string });
                    reader.readAsDataURL(file);
                  }} />
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-electric/10 border border-electric/20 rounded-xl text-electric text-xs font-medium cursor-pointer hover:bg-electric/20 transition-colors">
                  <Camera className="w-3.5 h-3.5" /> Subir foto
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) { alert('La imagen no debe superar los 2MB'); return; }
                    const reader = new FileReader();
                    reader.onloadend = () => updateCliente(c.id, { foto: reader.result as string });
                    reader.readAsDataURL(file);
                  }} />
                </label>
                {c.foto && (
                  <button onClick={() => updateCliente(c.id, { foto: '' })} className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs font-medium hover:bg-danger/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                )}
                <p className="text-white/20 text-[10px]">JPG, PNG. Max 2MB.</p>
              </div>
            </div>
          </div>

          {/* Datos editables */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-electric" /> Datos del cliente</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1"><Weight className="w-3 h-3" /> Peso</label>
                <div className="relative">
                  <input type="number" min="30" max="300" step="0.1" value={c.peso} onChange={e => updateCliente(c.id, { peso: parseFloat(e.target.value) || c.peso })}
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 text-[10px]">kg</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1"><Ruler className="w-3 h-3" /> Altura</label>
                <div className="relative">
                  <input type="number" min="100" max="250" value={c.altura} onChange={e => updateCliente(c.id, { altura: parseInt(e.target.value) || c.altura })}
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 text-[10px]">cm</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Edad</label>
                <div className="relative">
                  <input type="number" min="14" max="99" value={c.edad} onChange={e => updateCliente(c.id, { edad: parseInt(e.target.value) || c.edad })}
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 text-[10px]">a&ntilde;os</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Objetivo</label>
                <select value={c.objetivo} onChange={e => updateCliente(c.id, { objetivo: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                  {['Hipertrofia', 'Tonificacion', 'Perdida de grasa', 'Fuerza', 'Resistencia', 'Salud general', 'Rendimiento deportivo', 'Rehabilitacion'].map(o => <option key={o} value={o} className="bg-dark-800">{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Nivel de actividad</label>
                <select value={c.nivelActividad || c.nivel} onChange={e => updateCliente(c.id, { nivelActividad: e.target.value, nivel: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                  {['Sedentario', 'Principiante', 'Intermedio', 'Avanzado', 'Elite'].map(n => <option key={n} value={n} className="bg-dark-800">{n}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">DNI</label>
                <input type="text" value={c.dni || ''} onChange={e => updateCliente(c.id, { dni: e.target.value.replace(/\D/g, '') })} placeholder="30123456"
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Direcci&oacute;n</label>
                <input type="text" value={c.direccion || ''} onChange={e => updateCliente(c.id, { direccion: e.target.value })} placeholder="Calle 123, Ciudad"
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1"><Phone className="w-3 h-3 inline mr-1" />Tel&eacute;fono</label>
                <input type="tel" value={c.telefono} onChange={e => updateCliente(c.id, { telefono: e.target.value })} placeholder="5492211234567"
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1"><Mail className="w-3 h-3 inline mr-1" />Email</label>
                <input type="email" value={c.email} onChange={e => updateCliente(c.id, { email: e.target.value })} placeholder="cliente@email.com"
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
            </div>
          </div>

          {/* Contacto de emergencia */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Phone className="w-4 h-4 text-red-400" /> Contacto de Emergencia</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Nombre</label>
                <input type="text" value={c.contactoEmergencia || ''} onChange={e => updateCliente(c.id, { contactoEmergencia: e.target.value })} placeholder="Familiar o amigo"
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Tel&eacute;fono</label>
                <input type="tel" value={c.telefonoEmergencia || ''} onChange={e => updateCliente(c.id, { telefonoEmergencia: e.target.value })} placeholder="5492211234567"
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
            </div>
          </div>

          {/* Condiciones preexistentes */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Condiciones Preexistentes</h3>
            <p className="text-white/30 text-[10px] mb-3">Toc&aacute; para agregar/quitar condiciones.</p>
            {(c.enfermedades || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {c.enfermedades.map(enf => (
                  <button key={enf} onClick={() => updateCliente(c.id, { enfermedades: c.enfermedades.filter(e => e !== enf) })}
                    className="flex items-center gap-1 px-2 py-1 bg-red-500/15 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-medium hover:bg-red-500/25 transition-colors">
                    {enf} <Trash2 className="w-2.5 h-2.5" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
              {['Hipotiroidismo', 'Hipertiroidismo', 'Hashimoto', 'Diabetes tipo 1', 'Diabetes tipo 2', 'Hipertension arterial', 'Asma', 'EPOC', 'Enfermedad celiaca', 'Intolerancia a la lactosa', 'Alergia al gluten', 'SOP', 'Endometriosis', 'Artritis reumatoide', 'Osteoporosis', 'Osteoartritis', 'Fibromialgia', 'Lupus', 'Crohn', 'Colitis ulcerosa', 'Sindrome intestino irritable', 'Reflujo gastroesofagico', 'Insuficiencia renal', 'Higado graso', 'Anemia ferropenica', 'Arritmia cardiaca', 'Insuficiencia cardiaca', 'Cardiopatia isquemica', 'Epilepsia', 'Esclerosis multiple', 'Parkinson', 'Depresion clinica', 'Ansiedad generalizada', 'Hernia de disco', 'Escoliosis', 'Tendinitis cronica', 'Tunel carpiano', 'Psoriasis', 'Apnea del sueno', 'Hiperlipidemia', 'Gota', 'Angioedema', 'Angioedema hereditario', 'Embarazo', 'Sobrepeso/Obesidad', 'Addison', 'Cushing', 'Dermatitis atopica'].filter(e => !(c.enfermedades || []).includes(e)).map(enf => (
                <button key={enf} onClick={() => updateCliente(c.id, { enfermedades: [...(c.enfermedades || []), enf] })}
                  className="px-2 py-1 bg-black/30 text-white/30 border border-dark-border rounded-lg text-[10px] hover:text-amber-400 hover:border-amber-500/20 transition-colors">
                  {enf}
                </button>
              ))}
            </div>
          </div>

          {/* Declaraciones */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Declaraciones</h3>
            <div className="space-y-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${c.esMayorDeEdad ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                {c.esMayorDeEdad ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {c.esMayorDeEdad ? 'Mayor de edad verificado' : 'No declar\u00f3 mayor\u00eda de edad'}
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${c.declaraBuenaSalud ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                {c.declaraBuenaSalud ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {c.declaraBuenaSalud ? 'Declaraci\u00f3n de buena salud firmada' : 'Sin declaraci\u00f3n de buena salud'}
              </div>
            </div>
          </div>

          {/* TMB/TDEE */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Perfil Metab&oacute;lico</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/40 border border-dark-border rounded-xl p-3 text-center">
                <p className="text-white/50 text-[10px] uppercase tracking-wider">TMB</p>
                <p className="text-white font-black text-lg">{tmb}</p>
                <p className="text-white/30 text-[10px]">kcal</p>
              </div>
              <div className="bg-black/40 border border-electric/10 rounded-xl p-3 text-center">
                <p className="text-white/50 text-[10px] uppercase tracking-wider">TDEE</p>
                <p className="text-electric font-black text-lg">{tdee}</p>
                <p className="text-white/30 text-[10px]">kcal</p>
              </div>
              <div className="bg-black/40 border border-dark-border rounded-xl p-3 text-center">
                <p className="text-white/50 text-[10px] uppercase tracking-wider">IMC</p>
                <p className="text-white font-black text-lg">{(c.peso / ((c.altura / 100) ** 2)).toFixed(1)}</p>
                <p className="text-white/30 text-[10px]">kg/m&sup2;</p>
              </div>
            </div>
          </div>

          {/* Meta de peso */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-neon" /> Meta de Peso</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Peso deseado</label>
                <div className="relative">
                  <input type="number" min="30" max="250" step="0.5" value={c.pesoMeta || ''} onChange={e => updateCliente(c.id, { pesoMeta: parseFloat(e.target.value) || 0 })} placeholder={c.peso.toString()}
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 text-[10px]">kg</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Fecha objetivo</label>
                <input type="date" value={c.fechaMeta} onChange={e => updateCliente(c.id, { fechaMeta: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
            </div>

            {c.pesoMeta > 0 && kgRestantes > 0.1 && (
              <>
                {/* Actual / Meta / Faltan */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-black/40 rounded-xl p-2.5 text-center border border-dark-border">
                    <p className="text-white/50 text-[10px] uppercase">Actual</p>
                    <p className="text-white font-black text-lg">{c.peso}</p>
                    <p className="text-white/30 text-[10px]">kg</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-2.5 text-center border border-electric/15">
                    <p className="text-white/50 text-[10px] uppercase">Meta</p>
                    <p className="text-electric font-black text-lg">{c.pesoMeta}</p>
                    <p className="text-white/30 text-[10px]">kg</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-2.5 text-center border border-dark-border">
                    <p className="text-white/50 text-[10px] uppercase">Faltan</p>
                    <p className={`font-black text-lg ${quiereBajar ? 'text-red-400' : 'text-emerald-400'}`}>{kgRestantes.toFixed(1)}</p>
                    <p className="text-white/30 text-[10px] flex items-center justify-center gap-0.5">kg {quiereBajar ? <ArrowDown className="w-2.5 h-2.5" /> : <ArrowUp className="w-2.5 h-2.5" />}</p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mb-3">
                  <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-electric to-neon rounded-full transition-all" style={{ width: `${Math.max(5, Math.min(95, 50))}%` }} />
                  </div>
                </div>

                {/* Analisis del ritmo */}
                {c.fechaMeta && diasRestantes > 0 && (
                  <div className={`rounded-xl p-3 border ${
                    kgPorSemana <= 1.0 && kgPorSemana >= 0.1 ? 'bg-emerald-500/10 border-emerald-500/20'
                    : kgPorSemana > 1.0 ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-amber-500/10 border-amber-500/20'
                  }`}>
                    <div className="flex items-start gap-2">
                      {kgPorSemana <= 1.0 && kgPorSemana >= 0.1 ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        : kgPorSemana > 1.0 ? <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        : <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                      <div>
                        <p className={`font-bold text-xs ${
                          kgPorSemana <= 1.0 && kgPorSemana >= 0.1 ? 'text-emerald-400'
                          : kgPorSemana > 1.0 ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {kgPorSemana <= 1.0 && kgPorSemana >= 0.1 ? 'Ritmo saludable' : kgPorSemana > 1.0 ? 'Ritmo agresivo' : 'Ritmo lento'}
                        </p>
                        <p className="text-white/50 text-[11px] mt-0.5">
                          Necesita {quiereBajar ? 'bajar' : 'subir'} <strong className="text-white/70">{kgPorSemana.toFixed(2)} kg/semana</strong> en {semanasRestantes} semanas ({diasRestantes} d&iacute;as).
                          {kgPorSemana > 1.0 && <span className="text-red-400"> Recomendado: m&aacute;x 1 kg/sem.</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {c.pesoMeta > 0 && kgRestantes <= 0.1 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <p className="text-emerald-400 font-bold text-sm">En su peso objetivo.</p>
              </div>
            )}
          </div>

          {/* Registrar peso (evolucion) */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-electric" /> Evoluci&oacute;n de Peso</h3>
            <div className="flex gap-2 mb-3">
              <input type="number" step="0.1" min="30" max="300" placeholder="Peso actual"
                id={`peso-input-${c.id}`}
                className="flex-1 px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              <button onClick={() => {
                const input = document.getElementById(`peso-input-${c.id}`) as HTMLInputElement;
                const val = parseFloat(input?.value);
                if (!val || val < 30) return;
                const fecha = new Date().toLocaleDateString('es-AR');
                const hist = [...(c.pesoHistorial || []), { fecha, peso: val }].slice(-20);
                updateCliente(c.id, { peso: val, pesoHistorial: hist });
                if (input) input.value = '';
              }} className="px-4 py-2.5 bg-electric/15 border border-electric/20 text-electric rounded-xl text-xs font-bold hover:bg-electric/25 transition-all flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Registrar
              </button>
            </div>

            {(c.pesoHistorial || []).length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {[...(c.pesoHistorial || [])].reverse().map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2">
                    <span className="text-white/40 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {p.fecha}</span>
                    <span className="text-white font-bold text-sm">{p.peso} kg</span>
                    {i < (c.pesoHistorial || []).length - 1 && (() => {
                      const prev = [...(c.pesoHistorial || [])].reverse()[i + 1];
                      const diff = p.peso - prev.peso;
                      if (Math.abs(diff) < 0.05) return <Minus className="w-3 h-3 text-white/20" />;
                      return diff < 0
                        ? <ArrowDown className="w-3 h-3 text-emerald-400" />
                        : <ArrowUp className="w-3 h-3 text-red-400" />;
                    })()}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-xs text-center py-3">Sin registros. Registr&aacute; el peso del cliente para ver la evoluci&oacute;n.</p>
            )}
          </div>

          {/* Notas */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-2">Notas del entrenador</h3>
            <textarea value={c.notas} onChange={e => updateCliente(c.id, { notas: e.target.value })} rows={4} placeholder="Lesiones, restricciones, observaciones..."
              className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30 resize-none" />
          </div>
        </div>
        );
      })()}

      {/* Tab Historial */}
      {tab === 'historial' && (
        <div className="space-y-4">
          {(!cliente!.historial || cliente!.historial.length === 0) ? (
            <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
              <History className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">Sin historial. Us&aacute; el bot&oacute;n "Guardar" en Rutina o Nutrici&oacute;n para crear una entrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...(cliente!.historial || [])].reverse().map(h => (
                <div key={h.id} className="bg-dark-800 border border-dark-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {h.tipo === 'rutina' ? <Dumbbell className="w-4 h-4 text-purple-400" /> : <Utensils className="w-4 h-4 text-emerald-400" />}
                      <span className={`text-xs font-bold uppercase ${h.tipo === 'rutina' ? 'text-purple-400' : 'text-emerald-400'}`}>{h.tipo === 'rutina' ? 'Rutina' : 'Nutrici\u00f3n'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/30 text-xs">
                      <Clock className="w-3 h-3" /> {h.fecha}
                    </div>
                  </div>
                  {h.tipo === 'rutina' ? (
                    <div className="space-y-1">
                      {(h.datos as ClienteRutina[]).map((e, i) => (
                        <p key={i} className="text-white/60 text-xs">{i + 1}. {e.nombre} ({e.musculo}) - {e.series}x{e.reps} {e.peso}kg</p>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {(h.datos as ClienteComida[]).map((c, i) => (
                        <p key={i} className="text-white/60 text-xs">{c.nombre} ({c.hora}) - {c.items.reduce((a, it) => a + it.cal, 0)} kcal</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal agregar ejercicio */}
      {showAddEj && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAddEj(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-4"><Plus className="w-5 h-5 text-purple-400 inline mr-2" />Agregar Ejercicio</h2>
            <div className="space-y-3">
              <input type="text" value={nuevoEj.nombre} onChange={e => setNuevoEj(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre del ejercicio"
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              <div className="grid grid-cols-2 gap-3">
                <select value={nuevoEj.musculo} onChange={e => setNuevoEj(p => ({ ...p, musculo: e.target.value }))} className="px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                  {['Pecho', 'Espalda', 'Hombro anterior', 'Hombro lateral', 'B\u00edceps', 'Tr\u00edceps', 'Cu\u00e1driceps', 'Isquiotibiales', 'Gl\u00fateos', 'Pantorrillas', 'Core', 'Full Body'].map(g => <option key={g} value={g} className="bg-dark-800">{g}</option>)}
                </select>
                <input type="text" value={nuevoEj.peso} onChange={e => setNuevoEj(p => ({ ...p, peso: e.target.value }))} placeholder="Peso (kg)" className="px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-[10px] text-white/30 mb-0.5">Series</label>
                <input type="number" min="1" value={nuevoEj.series} onChange={e => setNuevoEj(p => ({ ...p, series: parseInt(e.target.value) || 1 }))} className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                <div><label className="block text-[10px] text-white/30 mb-0.5">Reps</label>
                <input type="text" value={nuevoEj.reps} onChange={e => setNuevoEj(p => ({ ...p, reps: e.target.value }))} placeholder="10-12" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                <div><label className="block text-[10px] text-white/30 mb-0.5">Desc (s)</label>
                <input type="text" value={nuevoEj.descanso} onChange={e => setNuevoEj(p => ({ ...p, descanso: e.target.value }))} placeholder="60" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
              </div>
              <input type="text" value={nuevoEj.notas} onChange={e => setNuevoEj(p => ({ ...p, notas: e.target.value }))} placeholder="Notas (opcional)" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddEj(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                <button onClick={addEjercicioCliente} disabled={!nuevoEj.nombre.trim()} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar comida */}
      {showAddComida && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAddComida(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-4"><Plus className="w-5 h-5 text-emerald-400 inline mr-2" />Nueva Comida</h2>
            <div className="space-y-3">
              <input type="text" value={nuevaComida.nombre} onChange={e => setNuevaComida(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Desayuno, Almuerzo, Merienda"
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              <input type="time" value={nuevaComida.hora} onChange={e => setNuevaComida(p => ({ ...p, hora: e.target.value }))}
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddComida(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                <button onClick={addComidaCliente} disabled={!nuevaComida.nombre.trim()} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-black rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Crear</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar alimento a comida */}
      {showAddAlimento !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAddAlimento(null)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> Agregar Alimento</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Buscar alimento</label>
                <div className="relative">
                  <input type="text" value={nuevoAlimento.alimento}
                    onChange={e => setNuevoAlimento(p => ({ ...p, alimento: e.target.value }))}
                    placeholder="Ej: Pollo, Bife, Huevo, Avena..."
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  {nuevoAlimento.alimento.length >= 2 && buscarAlimentos(nuevoAlimento.alimento).length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-border rounded-xl shadow-2xl max-h-60 overflow-y-auto z-10">
                      {buscarAlimentos(nuevoAlimento.alimento).map((a, i) => (
                        <button key={i} type="button"
                          onClick={() => setNuevoAlimento({ alimento: a.nombre, porcion: a.porcionDefault, cal: a.cal, prot: a.prot, carb: a.carb, grasa: a.grasa })}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-500/10 transition-colors border-b border-dark-border/30 last:border-0">
                          <p className="text-white text-sm">{a.nombre}</p>
                          <p className="text-white/40 text-[10px]">{a.porcionDefault} &middot; {a.cal} cal &middot; {a.prot}g P</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Porci&oacute;n</label>
                <input type="text" value={nuevoAlimento.porcion} onChange={e => setNuevoAlimento(p => ({ ...p, porcion: e.target.value }))} placeholder="Ej: 200g, 1 unidad"
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { field: 'cal' as const, label: 'Cal', color: 'text-orange-400' },
                  { field: 'prot' as const, label: 'g P', color: 'text-electric' },
                  { field: 'carb' as const, label: 'g C', color: 'text-amber-400' },
                  { field: 'grasa' as const, label: 'g G', color: 'text-pink-400' },
                ].map(f => (
                  <div key={f.field}>
                    <label className={`block text-[10px] ${f.color} uppercase tracking-wider mb-1`}>{f.label}</label>
                    <input type="number" min="0" value={nuevoAlimento[f.field] || ''} onChange={e => setNuevoAlimento(p => ({ ...p, [f.field]: parseInt(e.target.value) || 0 }))}
                      className="w-full px-2 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-[10px] text-center">Los valores se completan al elegir un alimento de la lista.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddAlimento(null)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                <button onClick={() => addItemComida(showAddAlimento)} disabled={!nuevoAlimento.alimento.trim()} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-black rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
