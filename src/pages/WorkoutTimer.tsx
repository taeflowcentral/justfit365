import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';

type TimerMode = 'stopwatch' | 'countdown' | 'tabata' | 'emom' | 'fortime';

// Sonidos generados con Web Audio API
function playBeep(frequency = 800, duration = 200, volume = 0.5) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch { /* ignore */ }
}

function playCountdown() { playBeep(600, 150, 0.3); }
function playGo() { playBeep(1000, 400, 0.6); }
function playRest() { playBeep(400, 300, 0.4); }
function playFinish() {
  playBeep(1000, 200, 0.6);
  setTimeout(() => playBeep(1200, 200, 0.6), 250);
  setTimeout(() => playBeep(1500, 400, 0.7), 500);
}

function formatTime(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function WorkoutTimer() {
  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [sound, setSound] = useState(true);

  // Config countdown
  const [countdownMin, setCountdownMin] = useState(1);
  const [countdownSec, setCountdownSec] = useState(0);

  // Config tabata
  const [tabataWork, setTabataWork] = useState(20);
  const [tabataRest, setTabataRest] = useState(10);
  const [tabataRounds, setTabataRounds] = useState(8);
  const [tabataCurrentRound, setTabataCurrentRound] = useState(1);
  const [tabataPhase, setTabataPhase] = useState<'work' | 'rest'>('work');

  // Config EMOM
  const [emomMinutes, setEmomMinutes] = useState(10);
  const [emomCurrentMin, setEmomCurrentMin] = useState(1);

  // Config For Time
  const [forTimeMin, setForTimeMin] = useState(20);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBeepRef = useRef(0);

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    stop();
    setTime(0);
    setTabataCurrentRound(1);
    setTabataPhase('work');
    setEmomCurrentMin(1);
  }, [stop]);

  // Tick principal
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Logica por modo
  useEffect(() => {
    if (!running) return;

    if (mode === 'countdown') {
      const total = countdownMin * 60 + countdownSec;
      const remaining = total - time;
      if (remaining <= 3 && remaining > 0 && sound && lastBeepRef.current !== remaining) {
        lastBeepRef.current = remaining;
        playCountdown();
      }
      if (remaining <= 0) {
        if (sound) playFinish();
        stop();
      }
    }

    if (mode === 'tabata') {
      const phaseTime = tabataPhase === 'work' ? tabataWork : tabataRest;
      const elapsed = time;
      let totalElapsed = 0;
      let round = 1;
      let phase: 'work' | 'rest' = 'work';

      // Calcular round y phase actual
      for (let r = 1; r <= tabataRounds; r++) {
        if (totalElapsed + tabataWork > elapsed) { round = r; phase = 'work'; break; }
        totalElapsed += tabataWork;
        if (totalElapsed + tabataRest > elapsed) { round = r; phase = 'rest'; break; }
        totalElapsed += tabataRest;
        if (r === tabataRounds) { stop(); if (sound) playFinish(); return; }
      }

      if (round !== tabataCurrentRound || phase !== tabataPhase) {
        setTabataCurrentRound(round);
        setTabataPhase(phase);
        if (sound) { phase === 'work' ? playGo() : playRest(); }
      }

      // Countdown beeps en ultimos 3 seg de cada fase
      const phaseElapsed = elapsed - totalElapsed + (phase === 'work' ? 0 : tabataWork);
      const actualPhaseTime = phase === 'work' ? tabataWork : tabataRest;
      const phaseRemaining = actualPhaseTime - (elapsed - (totalElapsed - (phase === 'rest' ? tabataWork : 0)));
      if (phaseRemaining <= 3 && phaseRemaining > 0 && sound && lastBeepRef.current !== elapsed) {
        lastBeepRef.current = elapsed;
        playCountdown();
      }
      void phaseElapsed; void phaseTime;
    }

    if (mode === 'emom') {
      const currentMin = Math.floor(time / 60) + 1;
      if (currentMin !== emomCurrentMin && currentMin <= emomMinutes) {
        setEmomCurrentMin(currentMin);
        if (sound) playGo();
      }
      if (time >= emomMinutes * 60) { stop(); if (sound) playFinish(); }
      // Beep en ultimos 3 seg de cada minuto
      const secInMin = time % 60;
      if (secInMin >= 57 && sound && lastBeepRef.current !== time) {
        lastBeepRef.current = time;
        playCountdown();
      }
    }

    if (mode === 'fortime') {
      if (time >= forTimeMin * 60) { stop(); if (sound) playFinish(); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, running]);

  const getDisplay = () => {
    if (mode === 'countdown') {
      const total = countdownMin * 60 + countdownSec;
      return formatTime(Math.max(0, total - time));
    }
    if (mode === 'tabata') {
      // Mostrar tiempo restante de la fase actual
      let totalElapsed = 0;
      for (let r = 1; r <= tabataRounds; r++) {
        if (totalElapsed + tabataWork > time) return formatTime(tabataWork - (time - totalElapsed));
        totalElapsed += tabataWork;
        if (totalElapsed + tabataRest > time) return formatTime(tabataRest - (time - totalElapsed));
        totalElapsed += tabataRest;
      }
      return '00:00';
    }
    if (mode === 'emom') {
      const secInMin = time % 60;
      return formatTime(60 - secInMin);
    }
    if (mode === 'fortime') {
      return formatTime(Math.max(0, forTimeMin * 60 - time));
    }
    return formatTime(time);
  };

  const modes: { key: TimerMode; label: string; desc: string }[] = [
    { key: 'stopwatch', label: 'Cronometro', desc: 'Cuenta hacia arriba' },
    { key: 'countdown', label: 'Cuenta Regresiva', desc: 'Tiempo definido' },
    { key: 'tabata', label: 'Tabata', desc: 'Trabajo / Descanso' },
    { key: 'emom', label: 'EMOM', desc: 'Cada minuto' },
    { key: 'fortime', label: 'For Time', desc: 'Tiempo limite' },
  ];

  const phaseColor = mode === 'tabata' && running
    ? tabataPhase === 'work' ? 'text-emerald-400' : 'text-amber-400'
    : 'text-white';

  const phaseBg = mode === 'tabata' && running
    ? tabataPhase === 'work' ? 'from-emerald-500/5 to-transparent' : 'from-amber-500/5 to-transparent'
    : 'from-transparent to-transparent';

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <Timer className="w-7 h-7 text-electric" /> Workout Timer
        </h1>
        <p className="text-white/50 text-sm mt-1">Cronometro para tu entrenamiento</p>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-1.5 bg-dark-800 p-1.5 rounded-xl border border-dark-border overflow-x-auto">
        {modes.map(m => (
          <button key={m.key} onClick={() => { if (!running) { setMode(m.key); reset(); } }}
            className={`flex-1 min-w-[70px] text-center py-2 rounded-lg text-xs font-bold transition-all ${
              mode === m.key ? 'bg-electric/15 text-electric' : 'text-white/30 hover:text-white/50'
            } ${running ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Display principal */}
      <div className={`bg-gradient-to-b ${phaseBg} bg-dark-800 border border-dark-border rounded-3xl p-8 text-center relative`}>
        {/* Fase tabata */}
        {mode === 'tabata' && running && (
          <div className={`text-sm font-black uppercase tracking-widest mb-2 ${tabataPhase === 'work' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {tabataPhase === 'work' ? 'TRABAJO' : 'DESCANSO'}
          </div>
        )}

        {/* EMOM minuto actual */}
        {mode === 'emom' && running && (
          <div className="text-sm font-black uppercase tracking-widest mb-2 text-electric">
            MINUTO {emomCurrentMin} de {emomMinutes}
          </div>
        )}

        {/* Tiempo grande */}
        <p className={`text-7xl sm:text-8xl font-black tracking-tight leading-none ${phaseColor} transition-colors`}>
          {getDisplay()}
        </p>

        {/* Info extra */}
        {mode === 'stopwatch' && <p className="text-white/20 text-xs mt-3 uppercase tracking-wider">Cronometro</p>}
        {mode === 'tabata' && (
          <p className="text-white/30 text-sm mt-3">
            Ronda <strong className="text-white/60">{tabataCurrentRound}</strong> de {tabataRounds}
          </p>
        )}
        {mode === 'fortime' && running && (
          <p className="text-white/30 text-sm mt-3">Tiempo transcurrido: {formatTime(time)}</p>
        )}
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={reset}
          className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-dark-border text-white/50 hover:text-white rounded-2xl flex items-center justify-center transition-all">
          <RotateCcw className="w-6 h-6" />
        </button>
        <button onClick={() => {
          if (running) { stop(); }
          else { setRunning(true); if (sound && time === 0) playGo(); }
        }}
          className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-lg ${
            running
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
              : 'bg-electric hover:bg-electric/80 text-black shadow-electric/30'
          }`}>
          {running ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
        <button onClick={() => setSound(!sound)}
          className={`w-14 h-14 bg-white/5 hover:bg-white/10 border border-dark-border rounded-2xl flex items-center justify-center transition-all ${sound ? 'text-electric' : 'text-white/20'}`}>
          {sound ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      {/* Configuracion del modo */}
      {!running && (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-white/40" /> Configuracion
          </h3>

          {mode === 'countdown' && (
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">Minutos</label>
                <input type="number" min="0" max="99" value={countdownMin} onChange={e => setCountdownMin(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-2xl text-center font-black focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
              <span className="text-white/20 text-3xl font-black mt-4">:</span>
              <div className="text-center">
                <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">Segundos</label>
                <input type="number" min="0" max="59" value={countdownSec} onChange={e => setCountdownSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-20 px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-2xl text-center font-black focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
            </div>
          )}

          {mode === 'tabata' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <label className="block text-emerald-400 text-[10px] uppercase tracking-wider mb-1">Trabajo (seg)</label>
                  <input type="number" min="5" max="120" value={tabataWork} onChange={e => setTabataWork(Math.max(5, parseInt(e.target.value) || 20))}
                    className="w-full px-3 py-3 bg-black/60 border border-emerald-500/20 rounded-xl text-white text-xl text-center font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div className="text-center">
                  <label className="block text-amber-400 text-[10px] uppercase tracking-wider mb-1">Descanso (seg)</label>
                  <input type="number" min="0" max="120" value={tabataRest} onChange={e => setTabataRest(Math.max(0, parseInt(e.target.value) || 10))}
                    className="w-full px-3 py-3 bg-black/60 border border-amber-500/20 rounded-xl text-white text-xl text-center font-black focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
                <div className="text-center">
                  <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">Rondas</label>
                  <input type="number" min="1" max="50" value={tabataRounds} onChange={e => setTabataRounds(Math.max(1, parseInt(e.target.value) || 8))}
                    className="w-full px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-xl text-center font-black focus:outline-none focus:ring-2 focus:ring-electric/30" />
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <p className="text-white/40 text-xs">Tiempo total: <strong className="text-white/70">{formatTime(tabataRounds * (tabataWork + tabataRest))}</strong></p>
              </div>
              {/* Presets */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Tabata clasico', w: 20, r: 10, rounds: 8 },
                  { label: '30/30', w: 30, r: 30, rounds: 10 },
                  { label: '40/20', w: 40, r: 20, rounds: 8 },
                  { label: '45/15', w: 45, r: 15, rounds: 6 },
                  { label: '60/30', w: 60, r: 30, rounds: 5 },
                ].map(p => (
                  <button key={p.label} onClick={() => { setTabataWork(p.w); setTabataRest(p.r); setTabataRounds(p.rounds); }}
                    className="px-3 py-1.5 bg-white/5 border border-dark-border rounded-lg text-white/40 text-[10px] font-bold hover:text-electric hover:border-electric/20 transition-all">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'emom' && (
            <div className="text-center">
              <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">Minutos totales</label>
              <input type="number" min="1" max="60" value={emomMinutes} onChange={e => setEmomMinutes(Math.max(1, parseInt(e.target.value) || 10))}
                className="w-24 px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-2xl text-center font-black focus:outline-none focus:ring-2 focus:ring-electric/30" />
              <p className="text-white/30 text-xs mt-2">Suena al inicio de cada minuto. Completa tu serie y descansa lo que quede.</p>
            </div>
          )}

          {mode === 'fortime' && (
            <div className="text-center">
              <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">Tiempo limite (min)</label>
              <input type="number" min="1" max="60" value={forTimeMin} onChange={e => setForTimeMin(Math.max(1, parseInt(e.target.value) || 20))}
                className="w-24 px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-2xl text-center font-black focus:outline-none focus:ring-2 focus:ring-electric/30" />
              <p className="text-white/30 text-xs mt-2">Completa el WOD lo mas rapido posible dentro del tiempo limite.</p>
            </div>
          )}

          {mode === 'stopwatch' && (
            <p className="text-white/30 text-xs text-center">Cronometro simple. Presiona Play para iniciar.</p>
          )}
        </div>
      )}

      {/* Descripcion del modo */}
      <div className="bg-electric/5 border border-electric/10 rounded-xl p-3">
        <p className="text-white/50 text-xs leading-relaxed">
          {mode === 'stopwatch' && 'Cronometro sin limite. Ideal para medir tiempos de series, descansos o entrenamientos completos.'}
          {mode === 'countdown' && 'Cuenta regresiva con alarma. Usalo para descansos entre series, planchas o cualquier ejercicio cronometrado.'}
          {mode === 'tabata' && 'Intervalos de alta intensidad. Alterna entre trabajo y descanso con sonidos automaticos. El clasico es 20seg trabajo / 10seg descanso x 8 rondas.'}
          {mode === 'emom' && 'Every Minute On the Minute. Suena al inicio de cada minuto. Completa tus reps y descansa hasta el proximo minuto.'}
          {mode === 'fortime' && 'Completa tu rutina lo mas rapido posible. El timer cuenta hacia abajo desde el limite. Ideal para WODs de CrossFit.'}
        </p>
      </div>
    </div>
  );
}
