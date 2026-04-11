// Helper para aislar datos en localStorage por usuario (DNI)
// Cada usuario tiene sus propios datos, evitando que compartan entre cuentas en el mismo navegador

function getCurrentDni(): string {
  try {
    const saved = localStorage.getItem('jf365_current_user') || localStorage.getItem('bc_user');
    if (!saved) return 'anon';
    const user = JSON.parse(saved);
    return user?.dni || 'anon';
  } catch {
    return 'anon';
  }
}

export function userKey(baseKey: string): string {
  return `${baseKey}__${getCurrentDni()}`;
}

export function getUserItem(baseKey: string): string | null {
  return localStorage.getItem(userKey(baseKey));
}

export function setUserItem(baseKey: string, value: string): void {
  localStorage.setItem(userKey(baseKey), value);
}

export function removeUserItem(baseKey: string): void {
  localStorage.removeItem(userKey(baseKey));
}
