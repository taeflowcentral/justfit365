// Comprime una imagen redimensionando y reduciendo calidad
// Devuelve un base64 mucho mas chico que el original
export function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // Si no es imagen (ej: video), devolverlo tal cual
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No se pudo crear canvas')); return; }
        ctx.drawImage(img, 0, 0, width, height);

        // Comprimir a JPEG con calidad reducida
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Calcular tamaño en KB de un base64
export function base64SizeKB(base64: string): number {
  const base64Length = base64.length - (base64.indexOf(',') + 1);
  const padding = (base64.charAt(base64.length - 2) === '=') ? 2 : ((base64.charAt(base64.length - 1) === '=') ? 1 : 0);
  return Math.round((base64Length * 0.75 - padding) / 1024);
}
