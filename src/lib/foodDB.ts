// Base de datos nutricional - valores por 100g (o porcion estandar)
// Fuentes: USDA FoodData Central, tabla de composicion alimentos argentinos

export interface AlimentoBase {
  nombre: string;
  porcionDefault: string;
  cal: number;
  prot: number;
  carb: number;
  grasa: number;
  // Si tiene factor, los valores son por la porcionDefault
  // Si no, son por 100g y se ajustan
}

const alimentosDB: AlimentoBase[] = [
  // Carnes
  { nombre: 'Pechuga de pollo', porcionDefault: '100g', cal: 165, prot: 31, carb: 0, grasa: 4 },
  { nombre: 'Pollo entero', porcionDefault: '100g', cal: 200, prot: 25, carb: 0, grasa: 11 },
  { nombre: 'Carne vacuna magra', porcionDefault: '100g', cal: 160, prot: 26, carb: 0, grasa: 6 },
  { nombre: 'Bife de lomo', porcionDefault: '100g', cal: 180, prot: 27, carb: 0, grasa: 8 },
  { nombre: 'Carne picada magra', porcionDefault: '100g', cal: 175, prot: 22, carb: 0, grasa: 9 },
  { nombre: 'Cerdo magro', porcionDefault: '100g', cal: 150, prot: 27, carb: 0, grasa: 4 },
  { nombre: 'Bondiola de cerdo', porcionDefault: '100g', cal: 200, prot: 22, carb: 0, grasa: 12 },
  { nombre: 'Pavita', porcionDefault: '100g', cal: 140, prot: 29, carb: 0, grasa: 2 },
  { nombre: 'Conejo', porcionDefault: '100g', cal: 130, prot: 26, carb: 0, grasa: 3 },

  // Pescados
  { nombre: 'Salmon', porcionDefault: '100g', cal: 195, prot: 22, carb: 0, grasa: 12 },
  { nombre: 'Atun fresco', porcionDefault: '100g', cal: 145, prot: 23, carb: 0, grasa: 5 },
  { nombre: 'Atun en agua', porcionDefault: '100g', cal: 110, prot: 25, carb: 0, grasa: 1 },
  { nombre: 'Atun en aceite', porcionDefault: '100g', cal: 200, prot: 25, carb: 0, grasa: 11 },
  { nombre: 'Merluza', porcionDefault: '100g', cal: 90, prot: 18, carb: 0, grasa: 2 },
  { nombre: 'Trucha', porcionDefault: '100g', cal: 150, prot: 21, carb: 0, grasa: 7 },
  { nombre: 'Sardinas', porcionDefault: '100g', cal: 165, prot: 24, carb: 0, grasa: 8 },
  { nombre: 'Caballa', porcionDefault: '100g', cal: 200, prot: 19, carb: 0, grasa: 14 },
  { nombre: 'Surubi', porcionDefault: '100g', cal: 110, prot: 20, carb: 0, grasa: 3 },
  { nombre: 'Langostinos', porcionDefault: '100g', cal: 100, prot: 21, carb: 1, grasa: 1 },

  // Huevos y lacteos
  { nombre: 'Huevo entero', porcionDefault: '1 unidad', cal: 70, prot: 6, carb: 1, grasa: 5 },
  { nombre: 'Clara de huevo', porcionDefault: '1 clara', cal: 17, prot: 4, carb: 0, grasa: 0 },
  { nombre: 'Yema de huevo', porcionDefault: '1 yema', cal: 55, prot: 3, carb: 1, grasa: 5 },
  { nombre: 'Leche descremada', porcionDefault: '200ml', cal: 70, prot: 7, carb: 10, grasa: 1 },
  { nombre: 'Leche entera', porcionDefault: '200ml', cal: 130, prot: 7, carb: 10, grasa: 7 },
  { nombre: 'Yogur natural', porcionDefault: '200g', cal: 120, prot: 8, carb: 12, grasa: 5 },
  { nombre: 'Yogur griego', porcionDefault: '200g', cal: 130, prot: 20, carb: 6, grasa: 3 },
  { nombre: 'Yogur descremado', porcionDefault: '200g', cal: 80, prot: 8, carb: 12, grasa: 0 },
  { nombre: 'Queso cottage', porcionDefault: '100g', cal: 95, prot: 12, carb: 3, grasa: 4 },
  { nombre: 'Ricota descremada', porcionDefault: '100g', cal: 80, prot: 10, carb: 4, grasa: 2 },
  { nombre: 'Queso port salut', porcionDefault: '100g', cal: 280, prot: 22, carb: 1, grasa: 21 },
  { nombre: 'Queso cremoso', porcionDefault: '100g', cal: 290, prot: 18, carb: 2, grasa: 24 },
  { nombre: 'Queso untable light', porcionDefault: '100g', cal: 150, prot: 12, carb: 4, grasa: 10 },
  { nombre: 'Mozzarella', porcionDefault: '100g', cal: 280, prot: 22, carb: 2, grasa: 20 },
  { nombre: 'Caseina', porcionDefault: '1 scoop (30g)', cal: 120, prot: 24, carb: 4, grasa: 1 },
  { nombre: 'Whey protein', porcionDefault: '1 scoop (30g)', cal: 120, prot: 24, carb: 3, grasa: 1 },

  // Cereales y granos
  { nombre: 'Avena', porcionDefault: '50g secos', cal: 190, prot: 7, carb: 33, grasa: 3 },
  { nombre: 'Arroz blanco cocido', porcionDefault: '150g', cal: 195, prot: 4, carb: 42, grasa: 0 },
  { nombre: 'Arroz integral cocido', porcionDefault: '150g', cal: 170, prot: 4, carb: 36, grasa: 1 },
  { nombre: 'Quinoa cocida', porcionDefault: '150g', cal: 180, prot: 6, carb: 30, grasa: 3 },
  { nombre: 'Fideos cocidos', porcionDefault: '150g', cal: 195, prot: 7, carb: 38, grasa: 1 },
  { nombre: 'Fideos integrales cocidos', porcionDefault: '150g', cal: 175, prot: 6, carb: 34, grasa: 1 },
  { nombre: 'Cous cous cocido', porcionDefault: '150g', cal: 170, prot: 6, carb: 33, grasa: 0 },
  { nombre: 'Polenta cocida', porcionDefault: '200g', cal: 150, prot: 4, carb: 32, grasa: 1 },
  { nombre: 'Pan integral', porcionDefault: '2 rebanadas', cal: 160, prot: 8, carb: 28, grasa: 2 },
  { nombre: 'Pan blanco', porcionDefault: '2 rebanadas', cal: 180, prot: 6, carb: 34, grasa: 2 },
  { nombre: 'Pan de centeno', porcionDefault: '2 rebanadas', cal: 160, prot: 6, carb: 30, grasa: 2 },
  { nombre: 'Tortilla de maiz', porcionDefault: '1 unidad', cal: 60, prot: 2, carb: 12, grasa: 1 },
  { nombre: 'Wrap integral', porcionDefault: '1 unidad', cal: 130, prot: 4, carb: 24, grasa: 3 },
  { nombre: 'Galletas de arroz', porcionDefault: '4 unidades', cal: 140, prot: 3, carb: 30, grasa: 1 },

  // Tuberculos y feculas
  { nombre: 'Papa hervida', porcionDefault: '200g', cal: 170, prot: 4, carb: 38, grasa: 0 },
  { nombre: 'Batata asada', porcionDefault: '200g', cal: 180, prot: 2, carb: 42, grasa: 0 },
  { nombre: 'Mandioca', porcionDefault: '150g', cal: 200, prot: 2, carb: 48, grasa: 0 },
  { nombre: 'Calabaza', porcionDefault: '250g', cal: 110, prot: 2, carb: 26, grasa: 0 },
  { nombre: 'Choclo', porcionDefault: '1 unidad', cal: 130, prot: 4, carb: 28, grasa: 2 },

  // Legumbres
  { nombre: 'Lentejas cocidas', porcionDefault: '150g', cal: 170, prot: 13, carb: 28, grasa: 1 },
  { nombre: 'Garbanzos cocidos', porcionDefault: '150g', cal: 240, prot: 13, carb: 36, grasa: 4 },
  { nombre: 'Porotos negros cocidos', porcionDefault: '150g', cal: 200, prot: 13, carb: 36, grasa: 1 },
  { nombre: 'Tofu firme', porcionDefault: '100g', cal: 120, prot: 14, carb: 2, grasa: 7 },
  { nombre: 'Tempeh', porcionDefault: '100g', cal: 190, prot: 19, carb: 9, grasa: 8 },
  { nombre: 'Seitan', porcionDefault: '100g', cal: 120, prot: 25, carb: 4, grasa: 1 },

  // Verduras
  { nombre: 'Brocoli al vapor', porcionDefault: '150g', cal: 50, prot: 4, carb: 8, grasa: 0 },
  { nombre: 'Coliflor', porcionDefault: '150g', cal: 38, prot: 3, carb: 6, grasa: 0 },
  { nombre: 'Espinaca', porcionDefault: '100g', cal: 23, prot: 3, carb: 2, grasa: 0 },
  { nombre: 'Lechuga', porcionDefault: '100g', cal: 15, prot: 1, carb: 3, grasa: 0 },
  { nombre: 'Tomate', porcionDefault: '100g', cal: 18, prot: 1, carb: 4, grasa: 0 },
  { nombre: 'Zanahoria', porcionDefault: '100g', cal: 41, prot: 1, carb: 10, grasa: 0 },
  { nombre: 'Pepino', porcionDefault: '100g', cal: 16, prot: 1, carb: 4, grasa: 0 },
  { nombre: 'Zucchini', porcionDefault: '150g', cal: 25, prot: 2, carb: 5, grasa: 0 },
  { nombre: 'Berenjena', porcionDefault: '150g', cal: 38, prot: 1, carb: 9, grasa: 0 },
  { nombre: 'Pimiento morron', porcionDefault: '100g', cal: 31, prot: 1, carb: 6, grasa: 0 },
  { nombre: 'Cebolla', porcionDefault: '100g', cal: 40, prot: 1, carb: 9, grasa: 0 },
  { nombre: 'Esparragos', porcionDefault: '150g', cal: 30, prot: 3, carb: 5, grasa: 0 },
  { nombre: 'Chauchas', porcionDefault: '150g', cal: 47, prot: 3, carb: 9, grasa: 0 },
  { nombre: 'Repollo', porcionDefault: '150g', cal: 38, prot: 2, carb: 8, grasa: 0 },
  { nombre: 'Remolacha', porcionDefault: '150g', cal: 65, prot: 2, carb: 14, grasa: 0 },
  { nombre: 'Ensalada mixta', porcionDefault: '200g', cal: 30, prot: 2, carb: 6, grasa: 0 },

  // Frutas
  { nombre: 'Banana', porcionDefault: '1 unidad', cal: 105, prot: 1, carb: 27, grasa: 0 },
  { nombre: 'Manzana', porcionDefault: '1 unidad', cal: 95, prot: 0, carb: 25, grasa: 0 },
  { nombre: 'Pera', porcionDefault: '1 unidad', cal: 100, prot: 1, carb: 26, grasa: 0 },
  { nombre: 'Naranja', porcionDefault: '1 unidad', cal: 65, prot: 1, carb: 16, grasa: 0 },
  { nombre: 'Mandarina', porcionDefault: '1 unidad', cal: 47, prot: 1, carb: 12, grasa: 0 },
  { nombre: 'Kiwi', porcionDefault: '1 unidad', cal: 42, prot: 1, carb: 10, grasa: 0 },
  { nombre: 'Frutilla', porcionDefault: '150g', cal: 48, prot: 1, carb: 12, grasa: 0 },
  { nombre: 'Arandanos', porcionDefault: '100g', cal: 57, prot: 1, carb: 14, grasa: 0 },
  { nombre: 'Uvas', porcionDefault: '100g', cal: 67, prot: 1, carb: 17, grasa: 0 },
  { nombre: 'Durazno', porcionDefault: '1 unidad', cal: 40, prot: 1, carb: 10, grasa: 0 },
  { nombre: 'Mango', porcionDefault: '1/2 unidad', cal: 100, prot: 1, carb: 25, grasa: 0 },
  { nombre: 'Sandia', porcionDefault: '300g', cal: 90, prot: 2, carb: 22, grasa: 0 },
  { nombre: 'Melon', porcionDefault: '300g', cal: 100, prot: 2, carb: 24, grasa: 0 },
  { nombre: 'Anana', porcionDefault: '150g', cal: 75, prot: 1, carb: 20, grasa: 0 },
  { nombre: 'Palta', porcionDefault: '1/2 unidad', cal: 160, prot: 2, carb: 9, grasa: 15 },

  // Frutos secos y semillas
  { nombre: 'Almendras', porcionDefault: '15g', cal: 90, prot: 3, carb: 3, grasa: 8 },
  { nombre: 'Nueces', porcionDefault: '15g', cal: 100, prot: 2, carb: 2, grasa: 10 },
  { nombre: 'Mani tostado', porcionDefault: '15g', cal: 85, prot: 4, carb: 2, grasa: 7 },
  { nombre: 'Castanas de caju', porcionDefault: '15g', cal: 85, prot: 3, carb: 5, grasa: 7 },
  { nombre: 'Pistachos', porcionDefault: '15g', cal: 85, prot: 3, carb: 4, grasa: 7 },
  { nombre: 'Avellanas', porcionDefault: '15g', cal: 95, prot: 2, carb: 2, grasa: 9 },
  { nombre: 'Semillas de girasol', porcionDefault: '15g', cal: 85, prot: 3, carb: 3, grasa: 7 },
  { nombre: 'Semillas de calabaza', porcionDefault: '15g', cal: 85, prot: 4, carb: 2, grasa: 7 },
  { nombre: 'Semillas de chia', porcionDefault: '15g', cal: 70, prot: 3, carb: 5, grasa: 5 },
  { nombre: 'Semillas de lino', porcionDefault: '15g', cal: 75, prot: 3, carb: 4, grasa: 6 },
  { nombre: 'Mantequilla de mani', porcionDefault: '15g', cal: 90, prot: 4, carb: 3, grasa: 8 },
  { nombre: 'Mantequilla de almendras', porcionDefault: '15g', cal: 95, prot: 3, carb: 3, grasa: 8 },

  // Aceites y grasas
  { nombre: 'Aceite de oliva', porcionDefault: '10ml', cal: 88, prot: 0, carb: 0, grasa: 10 },
  { nombre: 'Aceite de coco', porcionDefault: '10ml', cal: 90, prot: 0, carb: 0, grasa: 10 },
  { nombre: 'Aceite de girasol', porcionDefault: '10ml', cal: 88, prot: 0, carb: 0, grasa: 10 },
  { nombre: 'Manteca', porcionDefault: '10g', cal: 72, prot: 0, carb: 0, grasa: 8 },

  // Bebidas y otros
  { nombre: 'Miel', porcionDefault: '15g', cal: 45, prot: 0, carb: 12, grasa: 0 },
  { nombre: 'Mermelada light', porcionDefault: '15g', cal: 25, prot: 0, carb: 6, grasa: 0 },
  { nombre: 'Hummus', porcionDefault: '50g', cal: 85, prot: 4, carb: 7, grasa: 5 },
  { nombre: 'Granola sin azucar', porcionDefault: '60g', cal: 280, prot: 8, carb: 45, grasa: 8 },
];

function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function buscarAlimentos(query: string, limite = 8): AlimentoBase[] {
  const q = normalizar(query);
  if (q.length < 2) return [];
  return alimentosDB
    .filter(a => normalizar(a.nombre).includes(q))
    .slice(0, limite);
}

export function buscarAlimentoExacto(nombre: string): AlimentoBase | null {
  const q = normalizar(nombre);
  return alimentosDB.find(a => normalizar(a.nombre) === q) || null;
}
