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
  unidad?: string; // unidad contable (ej: "unidad", "scoop", "rebanada")
}

const alimentosDB: AlimentoBase[] = [
  // Carne vacuna - cortes
  { nombre: 'Bife de lomo', porcionDefault: '100g', cal: 180, prot: 27, carb: 0, grasa: 8 },
  { nombre: 'Bife de chorizo', porcionDefault: '100g', cal: 220, prot: 25, carb: 0, grasa: 13 },
  { nombre: 'Bife angosto (New York)', porcionDefault: '100g', cal: 200, prot: 26, carb: 0, grasa: 10 },
  { nombre: 'Bife ancho (Rib eye)', porcionDefault: '100g', cal: 250, prot: 24, carb: 0, grasa: 17 },
  { nombre: 'Churrasco', porcionDefault: '100g', cal: 190, prot: 26, carb: 0, grasa: 9 },
  { nombre: 'Entraña', porcionDefault: '100g', cal: 210, prot: 24, carb: 0, grasa: 12 },
  { nombre: 'Vacio', porcionDefault: '100g', cal: 230, prot: 23, carb: 0, grasa: 15 },
  { nombre: 'Asado de tira', porcionDefault: '100g', cal: 260, prot: 22, carb: 0, grasa: 19 },
  { nombre: 'Colita de cuadril', porcionDefault: '100g', cal: 170, prot: 27, carb: 0, grasa: 7 },
  { nombre: 'Cuadril', porcionDefault: '100g', cal: 175, prot: 27, carb: 0, grasa: 7 },
  { nombre: 'Nalga', porcionDefault: '100g', cal: 155, prot: 28, carb: 0, grasa: 5 },
  { nombre: 'Peceto', porcionDefault: '100g', cal: 145, prot: 28, carb: 0, grasa: 4 },
  { nombre: 'Paleta', porcionDefault: '100g', cal: 185, prot: 25, carb: 0, grasa: 9 },
  { nombre: 'Roast beef', porcionDefault: '100g', cal: 165, prot: 27, carb: 0, grasa: 6 },
  { nombre: 'Tapa de asado', porcionDefault: '100g', cal: 240, prot: 23, carb: 0, grasa: 16 },
  { nombre: 'Matambre vacuno', porcionDefault: '100g', cal: 220, prot: 24, carb: 0, grasa: 14 },
  { nombre: 'Carne vacuna magra', porcionDefault: '100g', cal: 160, prot: 26, carb: 0, grasa: 6 },
  { nombre: 'Carne picada magra', porcionDefault: '100g', cal: 175, prot: 22, carb: 0, grasa: 9 },
  { nombre: 'Carne picada comun', porcionDefault: '100g', cal: 230, prot: 20, carb: 0, grasa: 16 },
  { nombre: 'Osobuco', porcionDefault: '100g', cal: 190, prot: 24, carb: 0, grasa: 10 },
  { nombre: 'Mondongo', porcionDefault: '100g', cal: 100, prot: 14, carb: 0, grasa: 4 },
  { nombre: 'Lengua vacuna', porcionDefault: '100g', cal: 225, prot: 16, carb: 0, grasa: 18 },

  // Achuras y visceras
  { nombre: 'Higado vacuno', porcionDefault: '100g', cal: 135, prot: 20, carb: 4, grasa: 4 },
  { nombre: 'Bife de higado', porcionDefault: '100g', cal: 135, prot: 20, carb: 4, grasa: 4 },
  { nombre: 'Riñon vacuno', porcionDefault: '100g', cal: 100, prot: 17, carb: 0, grasa: 3 },
  { nombre: 'Chinchulín', porcionDefault: '100g', cal: 180, prot: 16, carb: 0, grasa: 13 },
  { nombre: 'Molleja', porcionDefault: '100g', cal: 240, prot: 13, carb: 0, grasa: 20 },
  { nombre: 'Chorizo criollo', porcionDefault: '1 unidad', cal: 300, prot: 15, carb: 1, grasa: 26, unidad: 'unidad' },
  { nombre: 'Morcilla', porcionDefault: '1 unidad', cal: 280, prot: 11, carb: 3, grasa: 25, unidad: 'unidad' },

  // Carne de cerdo - cortes
  { nombre: 'Cerdo magro (lomo)', porcionDefault: '100g', cal: 150, prot: 27, carb: 0, grasa: 4 },
  { nombre: 'Solomillo de cerdo', porcionDefault: '100g', cal: 143, prot: 26, carb: 0, grasa: 4 },
  { nombre: 'Bondiola de cerdo', porcionDefault: '100g', cal: 200, prot: 22, carb: 0, grasa: 12 },
  { nombre: 'Costilla de cerdo', porcionDefault: '100g', cal: 280, prot: 20, carb: 0, grasa: 22 },
  { nombre: 'Matambre de cerdo', porcionDefault: '100g', cal: 210, prot: 23, carb: 0, grasa: 13 },
  { nombre: 'Carré de cerdo', porcionDefault: '100g', cal: 190, prot: 25, carb: 0, grasa: 10 },
  { nombre: 'Pechito de cerdo', porcionDefault: '100g', cal: 270, prot: 19, carb: 0, grasa: 21 },
  { nombre: 'Jamon cocido', porcionDefault: '2 fetas', cal: 60, prot: 10, carb: 1, grasa: 2, unidad: 'feta' },
  { nombre: 'Jamon crudo', porcionDefault: '2 fetas', cal: 90, prot: 12, carb: 0, grasa: 5, unidad: 'feta' },
  { nombre: 'Panceta', porcionDefault: '100g', cal: 400, prot: 12, carb: 0, grasa: 40 },
  { nombre: 'Salchicha parrillera', porcionDefault: '1 unidad', cal: 250, prot: 12, carb: 2, grasa: 22, unidad: 'unidad' },

  // Cordero
  { nombre: 'Cordero (pierna)', porcionDefault: '100g', cal: 200, prot: 25, carb: 0, grasa: 11 },
  { nombre: 'Cordero (costillar)', porcionDefault: '100g', cal: 260, prot: 22, carb: 0, grasa: 19 },

  // Pollo y aves
  { nombre: 'Pechuga de pollo', porcionDefault: '100g', cal: 165, prot: 31, carb: 0, grasa: 4 },
  { nombre: 'Pollo entero', porcionDefault: '100g', cal: 200, prot: 25, carb: 0, grasa: 11 },
  { nombre: 'Pata muslo de pollo', porcionDefault: '100g', cal: 210, prot: 22, carb: 0, grasa: 13 },
  { nombre: 'Alita de pollo', porcionDefault: '100g', cal: 230, prot: 19, carb: 0, grasa: 17 },
  { nombre: 'Pollo sin piel', porcionDefault: '100g', cal: 165, prot: 31, carb: 0, grasa: 4 },
  { nombre: 'Milanesa de pollo', porcionDefault: '1 unidad', cal: 280, prot: 22, carb: 18, grasa: 14, unidad: 'unidad' },
  { nombre: 'Milanesa de carne', porcionDefault: '1 unidad', cal: 310, prot: 24, carb: 20, grasa: 16, unidad: 'unidad' },
  { nombre: 'Hamburguesa casera', porcionDefault: '1 unidad', cal: 250, prot: 20, carb: 2, grasa: 18, unidad: 'unidad' },
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
  { nombre: 'Pejerrey', porcionDefault: '100g', cal: 95, prot: 19, carb: 0, grasa: 2 },
  { nombre: 'Dorado', porcionDefault: '100g', cal: 120, prot: 21, carb: 0, grasa: 4 },
  { nombre: 'Lenguado', porcionDefault: '100g', cal: 85, prot: 18, carb: 0, grasa: 1 },
  { nombre: 'Langostinos', porcionDefault: '100g', cal: 100, prot: 21, carb: 1, grasa: 1 },
  { nombre: 'Camarones', porcionDefault: '100g', cal: 85, prot: 20, carb: 0, grasa: 1 },
  { nombre: 'Mejillones', porcionDefault: '100g', cal: 86, prot: 12, carb: 4, grasa: 2 },
  { nombre: 'Pulpo', porcionDefault: '100g', cal: 82, prot: 15, carb: 2, grasa: 1 },
  { nombre: 'Calamar', porcionDefault: '100g', cal: 92, prot: 16, carb: 3, grasa: 1 },

  // Huevos y lacteos
  { nombre: 'Huevo entero', porcionDefault: '1 unidad', cal: 70, prot: 6, carb: 1, grasa: 5, unidad: 'unidad' },
  { nombre: 'Clara de huevo', porcionDefault: '1 clara', cal: 17, prot: 4, carb: 0, grasa: 0, unidad: 'clara' },
  { nombre: 'Yema de huevo', porcionDefault: '1 yema', cal: 55, prot: 3, carb: 1, grasa: 5, unidad: 'yema' },
  { nombre: 'Leche descremada', porcionDefault: '200ml', cal: 70, prot: 7, carb: 10, grasa: 1 },
  { nombre: 'Leche entera', porcionDefault: '200ml', cal: 130, prot: 7, carb: 10, grasa: 7 },
  { nombre: 'Yogur natural', porcionDefault: '200g', cal: 120, prot: 8, carb: 12, grasa: 5 },
  { nombre: 'Yogur griego', porcionDefault: '1 pote (200g)', cal: 130, prot: 20, carb: 6, grasa: 3, unidad: 'pote' },
  { nombre: 'Yogur descremado', porcionDefault: '200g', cal: 80, prot: 8, carb: 12, grasa: 0 },
  { nombre: 'Queso cottage', porcionDefault: '100g', cal: 95, prot: 12, carb: 3, grasa: 4 },
  { nombre: 'Ricota descremada', porcionDefault: '100g', cal: 80, prot: 10, carb: 4, grasa: 2 },
  { nombre: 'Queso port salut', porcionDefault: '100g', cal: 280, prot: 22, carb: 1, grasa: 21 },
  { nombre: 'Queso cremoso', porcionDefault: '100g', cal: 290, prot: 18, carb: 2, grasa: 24 },
  { nombre: 'Queso untable light', porcionDefault: '100g', cal: 150, prot: 12, carb: 4, grasa: 10 },
  { nombre: 'Mozzarella', porcionDefault: '100g', cal: 280, prot: 22, carb: 2, grasa: 20 },
  { nombre: 'Caseina', porcionDefault: '1 scoop (30g)', cal: 120, prot: 24, carb: 4, grasa: 1, unidad: 'scoop' },
  { nombre: 'Whey protein', porcionDefault: '1 scoop (30g)', cal: 120, prot: 24, carb: 3, grasa: 1, unidad: 'scoop' },
  { nombre: 'Colageno hidrolizado', porcionDefault: '1 scoop (10g)', cal: 36, prot: 9, carb: 0, grasa: 0, unidad: 'scoop' },

  // Cereales y granos
  { nombre: 'Avena', porcionDefault: '50g secos', cal: 190, prot: 7, carb: 33, grasa: 3 },
  { nombre: 'Arroz blanco cocido', porcionDefault: '150g', cal: 195, prot: 4, carb: 42, grasa: 0 },
  { nombre: 'Arroz integral cocido', porcionDefault: '150g', cal: 170, prot: 4, carb: 36, grasa: 1 },
  { nombre: 'Quinoa cocida', porcionDefault: '150g', cal: 180, prot: 6, carb: 30, grasa: 3 },
  { nombre: 'Fideos cocidos', porcionDefault: '150g', cal: 195, prot: 7, carb: 38, grasa: 1 },
  { nombre: 'Fideos integrales cocidos', porcionDefault: '150g', cal: 175, prot: 6, carb: 34, grasa: 1 },
  { nombre: 'Cous cous cocido', porcionDefault: '150g', cal: 170, prot: 6, carb: 33, grasa: 0 },
  { nombre: 'Polenta cocida', porcionDefault: '200g', cal: 150, prot: 4, carb: 32, grasa: 1 },
  { nombre: 'Pan integral', porcionDefault: '1 rebanada', cal: 80, prot: 4, carb: 14, grasa: 1, unidad: 'rebanada' },
  { nombre: 'Pan blanco', porcionDefault: '2 rebanadas', cal: 180, prot: 6, carb: 34, grasa: 2 },
  { nombre: 'Pan de centeno', porcionDefault: '2 rebanadas', cal: 160, prot: 6, carb: 30, grasa: 2 },
  { nombre: 'Tortilla de maiz', porcionDefault: '1 unidad', cal: 60, prot: 2, carb: 12, grasa: 1, unidad: 'unidad' },
  { nombre: 'Wrap integral', porcionDefault: '1 unidad', cal: 130, prot: 4, carb: 24, grasa: 3, unidad: 'unidad' },
  { nombre: 'Galletas de arroz', porcionDefault: '1 unidad', cal: 35, prot: 1, carb: 8, grasa: 0, unidad: 'unidad' },

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
  { nombre: 'Banana', porcionDefault: '1 unidad', cal: 105, prot: 1, carb: 27, grasa: 0, unidad: 'unidad' },
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
  { nombre: 'Palta', porcionDefault: '1/2 unidad', cal: 160, prot: 2, carb: 9, grasa: 15, unidad: 'mitad' },

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
  { nombre: 'Canela de Ceilon', porcionDefault: '1 cdta (3g)', cal: 6, prot: 0, carb: 2, grasa: 0, unidad: 'cdta' },
  { nombre: 'Arandanos secos', porcionDefault: '30g', cal: 90, prot: 0, carb: 22, grasa: 0 },
  { nombre: 'Crema de mani', porcionDefault: '15g', cal: 90, prot: 4, carb: 3, grasa: 8, unidad: 'cda' },
  { nombre: 'Dulce de batata', porcionDefault: '30g', cal: 70, prot: 0, carb: 17, grasa: 0 },
  { nombre: 'Queso crema light', porcionDefault: '30g', cal: 50, prot: 3, carb: 2, grasa: 4 },
  { nombre: 'Leche de almendras', porcionDefault: '200ml', cal: 30, prot: 1, carb: 1, grasa: 3 },
  { nombre: 'Cafe solo', porcionDefault: '1 taza', cal: 2, prot: 0, carb: 0, grasa: 0, unidad: 'taza' },
  { nombre: 'Te verde', porcionDefault: '1 taza', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'taza' },
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
