// Helper para aislar datos en localStorage por usuario (DNI)
// Cada usuario tiene sus propios datos, evitando que compartan entre cuentas en el mismo navegador

function getCurrentDni(): string {
  try {
    const user = JSON.parse(localStorage.getItem('bc_user') || 'null');
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
