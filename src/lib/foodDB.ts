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
  tags?: string; // tags de busqueda extra
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
  { nombre: 'Nueces de Brasil', porcionDefault: '1 unidad', cal: 33, prot: 1, carb: 1, grasa: 3, unidad: 'unidad' },

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
  { nombre: 'Mate', porcionDefault: '1 termo', cal: 5, prot: 0, carb: 1, grasa: 0, unidad: 'termo' },
  { nombre: 'Leche de coco', porcionDefault: '200ml', cal: 45, prot: 0, carb: 1, grasa: 5 },

  // Sopas y guisos
  { nombre: 'Sopa de verduras', porcionDefault: '1 plato (300ml)', cal: 80, prot: 3, carb: 14, grasa: 1, unidad: 'plato' },
  { nombre: 'Sopa de verduras con pollo', porcionDefault: '1 plato (300ml)', cal: 150, prot: 15, carb: 14, grasa: 4, unidad: 'plato' },
  { nombre: 'Sopa de verduras con carne vacuna', porcionDefault: '1 plato (300ml)', cal: 170, prot: 16, carb: 14, grasa: 6, unidad: 'plato' },
  { nombre: 'Sopa crema de calabaza', porcionDefault: '1 plato (300ml)', cal: 120, prot: 3, carb: 18, grasa: 4, unidad: 'plato' },
  { nombre: 'Sopa crema de zapallo y jengibre', porcionDefault: '1 plato (300ml)', cal: 110, prot: 3, carb: 16, grasa: 4, unidad: 'plato' },
  { nombre: 'Caldo de huesos', porcionDefault: '1 taza (250ml)', cal: 40, prot: 8, carb: 1, grasa: 1, unidad: 'taza' },
  { nombre: 'Guiso de lentejas', porcionDefault: '1 plato (350g)', cal: 320, prot: 18, carb: 42, grasa: 8, unidad: 'plato' },
  { nombre: 'Guiso de garbanzos', porcionDefault: '1 plato (350g)', cal: 340, prot: 16, carb: 44, grasa: 10, unidad: 'plato' },
  { nombre: 'Puchero', porcionDefault: '1 plato (400g)', cal: 350, prot: 25, carb: 30, grasa: 12, unidad: 'plato' },
  { nombre: 'Locro', porcionDefault: '1 plato (350g)', cal: 380, prot: 20, carb: 40, grasa: 14, unidad: 'plato' },

  // Combinaciones desayuno/merienda
  { nombre: 'Ensalada de frutas', porcionDefault: '1 bowl (250g)', cal: 130, prot: 2, carb: 32, grasa: 0, unidad: 'bowl' },
  { nombre: 'Ensalada de frutas con yogur', porcionDefault: '1 bowl (300g)', cal: 190, prot: 10, carb: 34, grasa: 3, unidad: 'bowl' },
  { nombre: 'Yogur con granola', porcionDefault: '1 bowl (260g)', cal: 300, prot: 16, carb: 42, grasa: 8, unidad: 'bowl' },
  { nombre: 'Yogur con granola y frutas', porcionDefault: '1 bowl (300g)', cal: 330, prot: 16, carb: 48, grasa: 8, unidad: 'bowl' },
  { nombre: 'Yogur con arandanos y nueces', porcionDefault: '1 bowl (250g)', cal: 250, prot: 18, carb: 22, grasa: 12, unidad: 'bowl' },
  { nombre: 'Acai bowl', porcionDefault: '1 bowl (300g)', cal: 340, prot: 6, carb: 52, grasa: 12, unidad: 'bowl' },
  { nombre: 'Smoothie de banana y whey', porcionDefault: '1 vaso (350ml)', cal: 250, prot: 26, carb: 32, grasa: 3, unidad: 'vaso' },
  { nombre: 'Smoothie verde (espinaca banana)', porcionDefault: '1 vaso (350ml)', cal: 180, prot: 5, carb: 38, grasa: 2, unidad: 'vaso' },
  { nombre: 'Smoothie de frutillas y yogur', porcionDefault: '1 vaso (350ml)', cal: 200, prot: 12, carb: 30, grasa: 4, unidad: 'vaso' },
  { nombre: 'Overnight oats (avena remojada)', porcionDefault: '1 bowl (250g)', cal: 320, prot: 14, carb: 48, grasa: 8, unidad: 'bowl' },
  { nombre: 'Tostadas integrales con palta y huevo', porcionDefault: '2 unidades', cal: 340, prot: 16, carb: 28, grasa: 18, unidad: 'porcion' },
  { nombre: 'Tostadas con queso crema y salmon', porcionDefault: '2 unidades', cal: 280, prot: 18, carb: 24, grasa: 12, unidad: 'porcion' },
  { nombre: 'Pancakes proteicos', porcionDefault: '3 unidades', cal: 280, prot: 24, carb: 30, grasa: 6, unidad: 'porcion' },
  { nombre: 'Budín proteico', porcionDefault: '1 porcion (100g)', cal: 180, prot: 16, carb: 20, grasa: 4, unidad: 'porcion' },

  // Comidas preparadas comunes
  { nombre: 'Tarta de verduras', porcionDefault: '1 porcion', cal: 280, prot: 10, carb: 24, grasa: 16, unidad: 'porcion' },
  { nombre: 'Tarta de atun', porcionDefault: '1 porcion', cal: 300, prot: 16, carb: 24, grasa: 14, unidad: 'porcion' },
  { nombre: 'Empanada de carne', porcionDefault: '1 unidad', cal: 280, prot: 12, carb: 26, grasa: 14, unidad: 'unidad' },
  { nombre: 'Empanada de pollo', porcionDefault: '1 unidad', cal: 250, prot: 13, carb: 26, grasa: 10, unidad: 'unidad' },
  { nombre: 'Empanada de verdura', porcionDefault: '1 unidad', cal: 220, prot: 8, carb: 26, grasa: 10, unidad: 'unidad' },
  { nombre: 'Revuelto de huevos con verduras', porcionDefault: '1 porcion (200g)', cal: 200, prot: 14, carb: 6, grasa: 14, unidad: 'porcion' },
  { nombre: 'Omelette de espinaca y queso', porcionDefault: '1 unidad', cal: 250, prot: 18, carb: 3, grasa: 18, unidad: 'unidad' },
  { nombre: 'Wok de pollo y verduras', porcionDefault: '1 plato (350g)', cal: 320, prot: 28, carb: 20, grasa: 14, unidad: 'plato' },
  { nombre: 'Wok de carne y verduras', porcionDefault: '1 plato (350g)', cal: 350, prot: 26, carb: 20, grasa: 18, unidad: 'plato' },
  { nombre: 'Ensalada Caesar con pollo', porcionDefault: '1 plato (300g)', cal: 350, prot: 30, carb: 12, grasa: 20, unidad: 'plato' },
  { nombre: 'Ensalada de atun y huevo', porcionDefault: '1 plato (300g)', cal: 280, prot: 28, carb: 8, grasa: 16, unidad: 'plato' },
  { nombre: 'Bowl de arroz con pollo y verduras', porcionDefault: '1 bowl (400g)', cal: 420, prot: 32, carb: 48, grasa: 10, unidad: 'bowl' },
  { nombre: 'Bowl de quinoa con salmon', porcionDefault: '1 bowl (350g)', cal: 450, prot: 30, carb: 38, grasa: 18, unidad: 'bowl' },

  // Ensaladas y guarniciones
  { nombre: 'Ensalada de zanahoria y huevo', porcionDefault: '1 plato (250g)', cal: 180, prot: 10, carb: 14, grasa: 10, unidad: 'plato' },
  { nombre: 'Ensalada de rucula y parmesano', porcionDefault: '1 plato (200g)', cal: 160, prot: 10, carb: 4, grasa: 12, unidad: 'plato' },
  { nombre: 'Ensalada de rucula, tomate y parmesano', porcionDefault: '1 plato (250g)', cal: 180, prot: 11, carb: 6, grasa: 13, unidad: 'plato' },
  { nombre: 'Chauchas con huevo', porcionDefault: '1 plato (250g)', cal: 170, prot: 12, carb: 12, grasa: 8, unidad: 'plato' },
  { nombre: 'Remolacha con huevo', porcionDefault: '1 plato (250g)', cal: 185, prot: 10, carb: 18, grasa: 8, unidad: 'plato' },
  { nombre: 'Wok de verduras', porcionDefault: '1 plato (300g)', cal: 150, prot: 5, carb: 18, grasa: 7, unidad: 'plato' },
  { nombre: 'Wok de verduras con salsa soja', porcionDefault: '1 plato (300g)', cal: 170, prot: 6, carb: 20, grasa: 7, unidad: 'plato' },
  { nombre: 'Ensalada de espinaca y huevo', porcionDefault: '1 plato (250g)', cal: 165, prot: 12, carb: 5, grasa: 11, unidad: 'plato' },
  { nombre: 'Ensalada de quinoa y verduras', porcionDefault: '1 plato (300g)', cal: 280, prot: 10, carb: 38, grasa: 9, unidad: 'plato' },
  { nombre: 'Ensalada de lentejas', porcionDefault: '1 plato (300g)', cal: 260, prot: 16, carb: 34, grasa: 6, unidad: 'plato' },

  // Pescados preparados
  { nombre: 'Merluza al horno', porcionDefault: '1 filet (200g)', cal: 180, prot: 36, carb: 0, grasa: 4, unidad: 'filet' },
  { nombre: 'Merluza a la plancha', porcionDefault: '1 filet (200g)', cal: 175, prot: 36, carb: 0, grasa: 3, unidad: 'filet' },
  { nombre: 'Salmon al horno', porcionDefault: '1 filet (200g)', cal: 390, prot: 44, carb: 0, grasa: 24, unidad: 'filet' },
  { nombre: 'Salmon a la plancha', porcionDefault: '1 filet (200g)', cal: 380, prot: 44, carb: 0, grasa: 22, unidad: 'filet' },
  { nombre: 'Atun a la plancha', porcionDefault: '1 filet (200g)', cal: 290, prot: 46, carb: 0, grasa: 10, unidad: 'filet' },
  { nombre: 'Trucha al horno', porcionDefault: '1 filet (200g)', cal: 300, prot: 42, carb: 0, grasa: 14, unidad: 'filet' },
  { nombre: 'Lenguado a la plancha', porcionDefault: '1 filet (200g)', cal: 170, prot: 36, carb: 0, grasa: 2, unidad: 'filet' },
  { nombre: 'Cazuela de mariscos', porcionDefault: '1 plato (350g)', cal: 280, prot: 30, carb: 12, grasa: 12, unidad: 'plato' },
  { nombre: 'Ceviche de pescado', porcionDefault: '1 porcion (200g)', cal: 150, prot: 24, carb: 8, grasa: 3, unidad: 'porcion' },

  // Snacks y permitidos
  { nombre: 'Chocolate 70% cacao', porcionDefault: '1 barra (25g)', cal: 140, prot: 2, carb: 12, grasa: 10, unidad: 'barra', tags: 'snack permitido postre dulce' },
  { nombre: 'Chocolate 85% cacao', porcionDefault: '1 barra (25g)', cal: 145, prot: 3, carb: 8, grasa: 12, unidad: 'barra', tags: 'snack permitido postre dulce' },
  { nombre: 'Alfajor tradicional', porcionDefault: '1 unidad', cal: 280, prot: 4, carb: 38, grasa: 13, unidad: 'unidad', tags: 'snack permitido postre dulce' },
  { nombre: 'Alfajor de arroz', porcionDefault: '1 unidad', cal: 110, prot: 1, carb: 18, grasa: 4, unidad: 'unidad', tags: 'snack permitido postre dulce light' },
  { nombre: 'Flan casero', porcionDefault: '1 porcion', cal: 200, prot: 6, carb: 28, grasa: 7, unidad: 'porcion', tags: 'snack permitido postre dulce' },
  { nombre: 'Flan con dulce de leche', porcionDefault: '1 porcion', cal: 280, prot: 7, carb: 42, grasa: 9, unidad: 'porcion', tags: 'snack permitido postre dulce' },
  { nombre: 'Brownie', porcionDefault: '1 porcion (60g)', cal: 250, prot: 3, carb: 30, grasa: 14, unidad: 'porcion', tags: 'snack permitido postre dulce' },
  { nombre: 'Brownie proteico', porcionDefault: '1 porcion (60g)', cal: 180, prot: 12, carb: 18, grasa: 8, unidad: 'porcion', tags: 'snack permitido postre dulce proteico' },
  { nombre: 'Pizza (1 porcion)', porcionDefault: '1 porcion', cal: 270, prot: 12, carb: 30, grasa: 12, unidad: 'porcion', tags: 'snack permitido comida rapida' },
  { nombre: 'Pizza integral (1 porcion)', porcionDefault: '1 porcion', cal: 230, prot: 13, carb: 26, grasa: 8, unidad: 'porcion', tags: 'snack permitido comida rapida' },
  { nombre: 'Hamburguesa completa', porcionDefault: '1 unidad', cal: 450, prot: 28, carb: 34, grasa: 22, unidad: 'unidad', tags: 'permitido comida rapida' },
  { nombre: 'Hamburguesa sin pan', porcionDefault: '1 unidad', cal: 300, prot: 26, carb: 4, grasa: 20, unidad: 'unidad', tags: 'permitido comida rapida low carb' },
  { nombre: 'Hamburguesa con ensalada (sin fritas)', porcionDefault: '1 unidad', cal: 380, prot: 28, carb: 20, grasa: 22, unidad: 'unidad', tags: 'permitido comida rapida' },
  { nombre: 'Helado artesanal', porcionDefault: '1 bocha', cal: 130, prot: 2, carb: 16, grasa: 7, unidad: 'bocha', tags: 'snack permitido postre dulce' },
  { nombre: 'Helado proteico', porcionDefault: '1 pote (150g)', cal: 160, prot: 15, carb: 18, grasa: 3, unidad: 'pote', tags: 'snack permitido postre dulce proteico' },
  { nombre: 'Galletitas de avena caseras', porcionDefault: '1 unidad', cal: 80, prot: 2, carb: 12, grasa: 3, unidad: 'unidad', tags: 'snack permitido galleta' },
  { nombre: 'Chips de batata al horno', porcionDefault: '1 porcion (100g)', cal: 120, prot: 1, carb: 28, grasa: 1, unidad: 'porcion', tags: 'snack permitido' },
  { nombre: 'Palomitas de maiz (sin manteca)', porcionDefault: '1 porcion (30g)', cal: 110, prot: 3, carb: 20, grasa: 2, unidad: 'porcion', tags: 'snack permitido pochoclo' },
  { nombre: 'Mix de frutos secos y chocolate', porcionDefault: '1 punado (30g)', cal: 160, prot: 4, carb: 12, grasa: 11, unidad: 'punado', tags: 'snack permitido trail mix' },

  // Bebidas permitidas
  { nombre: 'Cerveza (lata 354ml)', porcionDefault: '1 lata', cal: 150, prot: 1, carb: 13, grasa: 0, unidad: 'lata', tags: 'bebida permitido alcohol' },
  { nombre: 'Cerveza light (lata 354ml)', porcionDefault: '1 lata', cal: 100, prot: 1, carb: 6, grasa: 0, unidad: 'lata', tags: 'bebida permitido alcohol light' },
  { nombre: 'Vino tinto (copa 150ml)', porcionDefault: '1 copa', cal: 125, prot: 0, carb: 4, grasa: 0, unidad: 'copa', tags: 'bebida permitido alcohol' },
  { nombre: 'Vino blanco (copa 150ml)', porcionDefault: '1 copa', cal: 120, prot: 0, carb: 4, grasa: 0, unidad: 'copa', tags: 'bebida permitido alcohol' },
  { nombre: 'Gaseosa Zero (lata 354ml)', porcionDefault: '1 lata', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'lata', tags: 'bebida permitido zero sin azucar' },
  { nombre: 'Gaseosa comun (lata 354ml)', porcionDefault: '1 lata', cal: 140, prot: 0, carb: 39, grasa: 0, unidad: 'lata', tags: 'bebida' },
  { nombre: 'Agua saborizada zero', porcionDefault: '1 botella (500ml)', cal: 5, prot: 0, carb: 1, grasa: 0, unidad: 'botella', tags: 'bebida permitido zero sin azucar' },
  { nombre: 'Jugo natural de naranja', porcionDefault: '1 vaso (250ml)', cal: 110, prot: 2, carb: 26, grasa: 0, unidad: 'vaso', tags: 'bebida jugo natural' },
  { nombre: 'Limonada casera sin azucar', porcionDefault: '1 vaso (250ml)', cal: 10, prot: 0, carb: 3, grasa: 0, unidad: 'vaso', tags: 'bebida permitido sin azucar' },
  { nombre: 'Fernet con gaseosa', porcionDefault: '1 vaso', cal: 200, prot: 0, carb: 20, grasa: 0, unidad: 'vaso', tags: 'bebida alcohol' },
  { nombre: 'Fernet con gaseosa zero', porcionDefault: '1 vaso', cal: 100, prot: 0, carb: 0, grasa: 0, unidad: 'vaso', tags: 'bebida permitido alcohol zero' },

  // Comidas internacionales - Estados Unidos
  { nombre: 'Pancakes americanos', porcionDefault: '3 unidades', cal: 350, prot: 8, carb: 50, grasa: 12, unidad: 'porcion', tags: 'usa estados unidos desayuno' },
  { nombre: 'Hot dog clasico', porcionDefault: '1 unidad', cal: 290, prot: 11, carb: 20, grasa: 18, unidad: 'unidad', tags: 'usa estados unidos snack' },
  { nombre: 'Mac and cheese', porcionDefault: '1 plato (250g)', cal: 420, prot: 16, carb: 50, grasa: 18, unidad: 'plato', tags: 'usa estados unidos' },
  { nombre: 'Buffalo wings', porcionDefault: '6 unidades', cal: 480, prot: 30, carb: 4, grasa: 36, unidad: 'porcion', tags: 'usa estados unidos snack' },
  { nombre: 'Bagel con queso crema', porcionDefault: '1 unidad', cal: 380, prot: 12, carb: 55, grasa: 12, unidad: 'unidad', tags: 'usa estados unidos desayuno' },
  { nombre: 'Cheesecake', porcionDefault: '1 porcion', cal: 380, prot: 6, carb: 30, grasa: 27, unidad: 'porcion', tags: 'usa postre dulce snack' },
  { nombre: 'Donut glaseado', porcionDefault: '1 unidad', cal: 270, prot: 3, carb: 31, grasa: 15, unidad: 'unidad', tags: 'usa snack postre dulce' },

  // Comidas internacionales - Brasil
  { nombre: 'Acai bowl tradicional', porcionDefault: '1 bowl (300g)', cal: 320, prot: 5, carb: 50, grasa: 12, unidad: 'bowl', tags: 'brasil desayuno' },
  { nombre: 'Pao de queijo', porcionDefault: '3 unidades', cal: 240, prot: 8, carb: 22, grasa: 14, unidad: 'porcion', tags: 'brasil desayuno snack' },
  { nombre: 'Feijoada', porcionDefault: '1 plato (300g)', cal: 480, prot: 28, carb: 38, grasa: 22, unidad: 'plato', tags: 'brasil tradicional' },
  { nombre: 'Brigadeiro', porcionDefault: '1 unidad', cal: 80, prot: 1, carb: 12, grasa: 3, unidad: 'unidad', tags: 'brasil postre dulce snack' },
  { nombre: 'Moqueca de pescado', porcionDefault: '1 plato (300g)', cal: 380, prot: 32, carb: 8, grasa: 24, unidad: 'plato', tags: 'brasil pescado' },
  { nombre: 'Coxinha', porcionDefault: '1 unidad', cal: 220, prot: 8, carb: 22, grasa: 11, unidad: 'unidad', tags: 'brasil snack' },
  { nombre: 'Caipirinha', porcionDefault: '1 vaso', cal: 240, prot: 0, carb: 28, grasa: 0, unidad: 'vaso', tags: 'brasil bebida alcohol' },

  // Comidas internacionales - Alemania
  { nombre: 'Bratwurst (salchicha alemana)', porcionDefault: '1 unidad', cal: 290, prot: 14, carb: 2, grasa: 25, unidad: 'unidad', tags: 'alemania' },
  { nombre: 'Pretzel', porcionDefault: '1 unidad (90g)', cal: 280, prot: 8, carb: 56, grasa: 3, unidad: 'unidad', tags: 'alemania snack' },
  { nombre: 'Sauerkraut (chucrut)', porcionDefault: '100g', cal: 20, prot: 1, carb: 4, grasa: 0, unidad: 'porcion', tags: 'alemania vegetal fermentado probiotico' },
  { nombre: 'Schnitzel de pollo', porcionDefault: '1 porcion (200g)', cal: 380, prot: 32, carb: 18, grasa: 18, unidad: 'porcion', tags: 'alemania pollo' },
  { nombre: 'Strudel de manzana', porcionDefault: '1 porcion', cal: 320, prot: 4, carb: 50, grasa: 12, unidad: 'porcion', tags: 'alemania postre dulce' },

  // Comidas internacionales - Corea
  { nombre: 'Kimchi', porcionDefault: '50g', cal: 15, prot: 1, carb: 3, grasa: 0, unidad: 'porcion', tags: 'corea fermentado vegetal probiotico' },
  { nombre: 'Bibimbap', porcionDefault: '1 bowl (400g)', cal: 560, prot: 26, carb: 78, grasa: 16, unidad: 'bowl', tags: 'corea' },
  { nombre: 'Bulgogi (carne marinada)', porcionDefault: '150g', cal: 320, prot: 28, carb: 14, grasa: 16, unidad: 'porcion', tags: 'corea carne' },
  { nombre: 'Ramen coreano picante', porcionDefault: '1 plato (400g)', cal: 500, prot: 14, carb: 70, grasa: 18, unidad: 'plato', tags: 'corea sopa' },
  { nombre: 'Mandu (dumplings)', porcionDefault: '5 unidades', cal: 280, prot: 14, carb: 32, grasa: 10, unidad: 'porcion', tags: 'corea' },
  { nombre: 'Tofu agrio picante', porcionDefault: '1 plato (200g)', cal: 220, prot: 18, carb: 8, grasa: 14, unidad: 'plato', tags: 'corea vegetariano' },

  // Comidas internacionales - Rusia
  { nombre: 'Borscht (sopa de remolacha)', porcionDefault: '1 plato (300ml)', cal: 180, prot: 8, carb: 22, grasa: 6, unidad: 'plato', tags: 'rusia sopa' },
  { nombre: 'Pelmeni', porcionDefault: '10 unidades', cal: 380, prot: 16, carb: 48, grasa: 12, unidad: 'porcion', tags: 'rusia' },
  { nombre: 'Blini con caviar', porcionDefault: '3 unidades', cal: 240, prot: 12, carb: 24, grasa: 10, unidad: 'porcion', tags: 'rusia desayuno' },
  { nombre: 'Stroganoff', porcionDefault: '1 plato (300g)', cal: 480, prot: 28, carb: 22, grasa: 30, unidad: 'plato', tags: 'rusia carne' },
  { nombre: 'Solyanka (sopa)', porcionDefault: '1 plato (300ml)', cal: 220, prot: 14, carb: 14, grasa: 12, unidad: 'plato', tags: 'rusia sopa' },

  // Comidas internacionales - Francia
  { nombre: 'Croissant', porcionDefault: '1 unidad', cal: 260, prot: 5, carb: 26, grasa: 14, unidad: 'unidad', tags: 'francia desayuno snack' },
  { nombre: 'Baguette con manteca', porcionDefault: '2 rebanadas', cal: 220, prot: 6, carb: 32, grasa: 8, unidad: 'porcion', tags: 'francia desayuno' },
  { nombre: 'Quiche Lorraine', porcionDefault: '1 porcion', cal: 380, prot: 14, carb: 22, grasa: 26, unidad: 'porcion', tags: 'francia' },
  { nombre: 'Ratatouille', porcionDefault: '1 plato (250g)', cal: 180, prot: 4, carb: 28, grasa: 6, unidad: 'plato', tags: 'francia vegetal vegetariano' },
  { nombre: 'Coq au vin', porcionDefault: '1 plato (300g)', cal: 480, prot: 38, carb: 12, grasa: 28, unidad: 'plato', tags: 'francia pollo' },
  { nombre: 'Crepe dulce', porcionDefault: '1 unidad', cal: 220, prot: 6, carb: 30, grasa: 8, unidad: 'unidad', tags: 'francia postre dulce' },
  { nombre: 'Macaron', porcionDefault: '1 unidad', cal: 100, prot: 1, carb: 14, grasa: 4, unidad: 'unidad', tags: 'francia postre dulce snack' },

  // Comidas internacionales - Italia
  { nombre: 'Pasta carbonara', porcionDefault: '1 plato (300g)', cal: 580, prot: 22, carb: 70, grasa: 22, unidad: 'plato', tags: 'italia pasta' },
  { nombre: 'Pizza margherita', porcionDefault: '1 porcion', cal: 280, prot: 12, carb: 36, grasa: 10, unidad: 'porcion', tags: 'italia pizza' },
  { nombre: 'Risotto', porcionDefault: '1 plato (250g)', cal: 420, prot: 12, carb: 60, grasa: 14, unidad: 'plato', tags: 'italia' },
  { nombre: 'Tiramisu', porcionDefault: '1 porcion', cal: 360, prot: 6, carb: 30, grasa: 24, unidad: 'porcion', tags: 'italia postre dulce' },
  { nombre: 'Bruschetta', porcionDefault: '2 unidades', cal: 180, prot: 6, carb: 24, grasa: 7, unidad: 'porcion', tags: 'italia snack' },
  { nombre: 'Lasagna', porcionDefault: '1 porcion (250g)', cal: 480, prot: 24, carb: 38, grasa: 25, unidad: 'porcion', tags: 'italia pasta' },
  { nombre: 'Gnocchi al pesto', porcionDefault: '1 plato (250g)', cal: 480, prot: 12, carb: 65, grasa: 18, unidad: 'plato', tags: 'italia pasta' },
  { nombre: 'Panna cotta', porcionDefault: '1 porcion', cal: 280, prot: 4, carb: 25, grasa: 18, unidad: 'porcion', tags: 'italia postre dulce' },
  { nombre: 'Caprese', porcionDefault: '1 plato (200g)', cal: 280, prot: 14, carb: 6, grasa: 22, unidad: 'plato', tags: 'italia ensalada vegetariano' },
  { nombre: 'Espresso', porcionDefault: '1 taza', cal: 5, prot: 0, carb: 0, grasa: 0, unidad: 'taza', tags: 'italia bebida cafe' },

  // Comidas internacionales - Mexico (cocina latinoamericana popular)
  { nombre: 'Tacos al pastor', porcionDefault: '3 unidades', cal: 420, prot: 22, carb: 30, grasa: 22, unidad: 'porcion', tags: 'mexico latino' },
  { nombre: 'Guacamole', porcionDefault: '50g', cal: 80, prot: 1, carb: 5, grasa: 7, unidad: 'porcion', tags: 'mexico vegetal salsa' },
  { nombre: 'Quesadilla', porcionDefault: '1 unidad', cal: 320, prot: 14, carb: 28, grasa: 18, unidad: 'unidad', tags: 'mexico' },
  { nombre: 'Burrito de pollo', porcionDefault: '1 unidad', cal: 580, prot: 32, carb: 60, grasa: 22, unidad: 'unidad', tags: 'mexico pollo' },

  // Comidas internacionales - Asiaticas (otras)
  { nombre: 'Sushi (8 piezas)', porcionDefault: '1 porcion', cal: 320, prot: 16, carb: 56, grasa: 4, unidad: 'porcion', tags: 'japon asia pescado' },
  { nombre: 'Wok chow mein', porcionDefault: '1 plato (300g)', cal: 380, prot: 14, carb: 50, grasa: 14, unidad: 'plato', tags: 'china asia' },
  { nombre: 'Pad thai', porcionDefault: '1 plato (300g)', cal: 460, prot: 20, carb: 60, grasa: 16, unidad: 'plato', tags: 'tailandia asia' },
  { nombre: 'Curry de pollo', porcionDefault: '1 plato (300g)', cal: 420, prot: 28, carb: 24, grasa: 22, unidad: 'plato', tags: 'india asia pollo' },

  // Sin TACC (sin gluten) y veganos
  { nombre: 'Pizza de harina de garbanzos (1 porcion)', porcionDefault: '1 porcion', cal: 230, prot: 11, carb: 26, grasa: 9, unidad: 'porcion', tags: 'sin tacc sin gluten celiaco vegano alta proteina pizza' },
  { nombre: 'Pizza de coliflor (1 porcion)', porcionDefault: '1 porcion', cal: 180, prot: 9, carb: 14, grasa: 10, unidad: 'porcion', tags: 'sin tacc sin gluten celiaco low carb pizza' },
  { nombre: 'Pizza vegana margarita', porcionDefault: '1 porcion', cal: 240, prot: 8, carb: 32, grasa: 9, unidad: 'porcion', tags: 'vegano pizza' },
  { nombre: 'Tarta de zapallo y queso vegano', porcionDefault: '1 porcion', cal: 220, prot: 8, carb: 22, grasa: 12, unidad: 'porcion', tags: 'vegano sin tacc' },
  { nombre: 'Pan de masa madre sin TACC', porcionDefault: '2 rebanadas', cal: 140, prot: 4, carb: 28, grasa: 1, unidad: 'porcion', tags: 'sin tacc sin gluten celiaco pan' },
  { nombre: 'Pan de almendras', porcionDefault: '2 rebanadas', cal: 200, prot: 8, carb: 8, grasa: 16, unidad: 'porcion', tags: 'sin tacc sin gluten celiaco low carb keto pan' },
  { nombre: 'Pasta sin TACC (arroz/maiz)', porcionDefault: '150g cocida', cal: 200, prot: 4, carb: 42, grasa: 1, unidad: 'plato', tags: 'sin tacc sin gluten celiaco pasta' },
  { nombre: 'Fideos de zucchini', porcionDefault: '200g', cal: 35, prot: 2, carb: 7, grasa: 0, unidad: 'plato', tags: 'sin tacc sin gluten low carb keto vegano' },
  { nombre: 'Fideos de lentejas', porcionDefault: '150g cocida', cal: 180, prot: 14, carb: 28, grasa: 1, unidad: 'plato', tags: 'sin tacc sin gluten alta proteina vegano legumbres' },
  { nombre: 'Tofu revuelto vegano', porcionDefault: '1 plato (200g)', cal: 220, prot: 22, carb: 6, grasa: 12, unidad: 'plato', tags: 'vegano sin tacc proteico desayuno' },
  { nombre: 'Hamburguesa de lentejas', porcionDefault: '1 unidad', cal: 220, prot: 12, carb: 28, grasa: 6, unidad: 'unidad', tags: 'vegano sin tacc legumbres' },
  { nombre: 'Hamburguesa de garbanzos', porcionDefault: '1 unidad', cal: 240, prot: 11, carb: 30, grasa: 8, unidad: 'unidad', tags: 'vegano sin tacc legumbres' },
  { nombre: 'Hamburguesa de quinoa y vegetales', porcionDefault: '1 unidad', cal: 200, prot: 8, carb: 26, grasa: 7, unidad: 'unidad', tags: 'vegano sin tacc' },
  { nombre: 'Milanesa de seitan', porcionDefault: '1 unidad', cal: 250, prot: 22, carb: 18, grasa: 9, unidad: 'unidad', tags: 'vegano alta proteina' },
  { nombre: 'Milanesa de tofu sin TACC', porcionDefault: '1 unidad', cal: 230, prot: 18, carb: 14, grasa: 10, unidad: 'unidad', tags: 'vegano sin tacc sin gluten' },
  { nombre: 'Pancakes sin TACC y vegan', porcionDefault: '3 unidades', cal: 280, prot: 8, carb: 42, grasa: 8, unidad: 'porcion', tags: 'sin tacc sin gluten vegano desayuno' },
  { nombre: 'Pancakes de banana y avena (sin TACC)', porcionDefault: '3 unidades', cal: 250, prot: 8, carb: 44, grasa: 4, unidad: 'porcion', tags: 'sin tacc sin gluten desayuno' },
  { nombre: 'Yogur de coco vegano', porcionDefault: '1 pote (200g)', cal: 130, prot: 2, carb: 12, grasa: 8, unidad: 'pote', tags: 'vegano sin tacc sin lactosa' },
  { nombre: 'Yogur de almendras', porcionDefault: '1 pote (200g)', cal: 90, prot: 4, carb: 8, grasa: 5, unidad: 'pote', tags: 'vegano sin tacc sin lactosa' },
  { nombre: 'Queso vegano (anacardos)', porcionDefault: '50g', cal: 180, prot: 6, carb: 6, grasa: 14, unidad: 'porcion', tags: 'vegano sin lactosa' },
  { nombre: 'Mayonesa vegana', porcionDefault: '1 cda (15g)', cal: 70, prot: 0, carb: 1, grasa: 7, unidad: 'cda', tags: 'vegano sin tacc' },
  { nombre: 'Bebida de almendras', porcionDefault: '200ml', cal: 30, prot: 1, carb: 1, grasa: 3, unidad: 'vaso', tags: 'vegano sin tacc sin lactosa' },
  { nombre: 'Bebida de avena', porcionDefault: '200ml', cal: 80, prot: 2, carb: 14, grasa: 2, unidad: 'vaso', tags: 'vegano sin lactosa' },
  { nombre: 'Bebida de arroz', porcionDefault: '200ml', cal: 100, prot: 0, carb: 22, grasa: 2, unidad: 'vaso', tags: 'vegano sin tacc sin lactosa' },
  { nombre: 'Bebida de soja sin azucar', porcionDefault: '200ml', cal: 60, prot: 6, carb: 2, grasa: 3, unidad: 'vaso', tags: 'vegano sin tacc sin lactosa proteica' },
  { nombre: 'Galletas sin TACC', porcionDefault: '4 unidades', cal: 130, prot: 2, carb: 22, grasa: 4, unidad: 'porcion', tags: 'sin tacc sin gluten celiaco snack' },
  { nombre: 'Brownie sin TACC vegan', porcionDefault: '1 porcion', cal: 220, prot: 4, carb: 28, grasa: 12, unidad: 'porcion', tags: 'sin tacc sin gluten vegano postre' },
  { nombre: 'Cookies de avena y banana', porcionDefault: '2 unidades', cal: 120, prot: 3, carb: 22, grasa: 3, unidad: 'porcion', tags: 'vegano sin lactosa snack' },
  { nombre: 'Granola sin TACC', porcionDefault: '60g', cal: 270, prot: 7, carb: 42, grasa: 9, unidad: 'porcion', tags: 'sin tacc sin gluten desayuno' },
  { nombre: 'Avena sin TACC certificada', porcionDefault: '50g secos', cal: 190, prot: 7, carb: 33, grasa: 3, unidad: 'porcion', tags: 'sin tacc sin gluten celiaco desayuno' },
  { nombre: 'Buddha bowl vegano', porcionDefault: '1 bowl (400g)', cal: 480, prot: 18, carb: 60, grasa: 18, unidad: 'bowl', tags: 'vegano sin tacc' },
  { nombre: 'Curry vegano de garbanzos', porcionDefault: '1 plato (300g)', cal: 380, prot: 14, carb: 48, grasa: 14, unidad: 'plato', tags: 'vegano sin tacc legumbres' },
  { nombre: 'Wok vegano de tofu y verduras', porcionDefault: '1 plato (300g)', cal: 320, prot: 18, carb: 24, grasa: 16, unidad: 'plato', tags: 'vegano sin tacc proteico' },
  { nombre: 'Falafel (4 unidades)', porcionDefault: '4 unidades', cal: 280, prot: 11, carb: 32, grasa: 12, unidad: 'porcion', tags: 'vegano sin lactosa legumbres' },
  { nombre: 'Hummus con vegetales', porcionDefault: '1 plato (200g)', cal: 220, prot: 9, carb: 22, grasa: 12, unidad: 'plato', tags: 'vegano sin tacc snack' },
  { nombre: 'Empanada vegana de verdura', porcionDefault: '1 unidad', cal: 200, prot: 6, carb: 26, grasa: 8, unidad: 'unidad', tags: 'vegano sin lactosa' },
  { nombre: 'Empanada sin TACC de carne', porcionDefault: '1 unidad', cal: 270, prot: 12, carb: 24, grasa: 14, unidad: 'unidad', tags: 'sin tacc sin gluten celiaco' },
  { nombre: 'Helado vegano', porcionDefault: '1 bocha', cal: 130, prot: 2, carb: 18, grasa: 5, unidad: 'bocha', tags: 'vegano sin lactosa postre' },
  { nombre: 'Chocolate vegano 70%', porcionDefault: '1 barra (25g)', cal: 145, prot: 2, carb: 12, grasa: 11, unidad: 'barra', tags: 'vegano sin tacc postre snack' },
  { nombre: 'Barrita proteica vegana', porcionDefault: '1 unidad (60g)', cal: 220, prot: 18, carb: 24, grasa: 9, unidad: 'unidad', tags: 'vegano sin tacc snack proteico' },
  { nombre: 'Tempeh marinado', porcionDefault: '100g', cal: 195, prot: 19, carb: 9, grasa: 8, unidad: 'porcion', tags: 'vegano sin tacc proteico' },

  // Suplementos deportivos
  { nombre: 'Creatina monohidratada', porcionDefault: '1 scoop (5g)', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'scoop' },
  { nombre: 'Whey protein concentrado', porcionDefault: '1 scoop (30g)', cal: 120, prot: 24, carb: 3, grasa: 1, unidad: 'scoop' },
  { nombre: 'Whey protein isolado', porcionDefault: '1 scoop (30g)', cal: 110, prot: 27, carb: 1, grasa: 0, unidad: 'scoop' },
  { nombre: 'Caseina', porcionDefault: '1 scoop (30g)', cal: 120, prot: 24, carb: 4, grasa: 1, unidad: 'scoop' },
  { nombre: 'Proteina vegana (arveja/arroz)', porcionDefault: '1 scoop (30g)', cal: 110, prot: 22, carb: 4, grasa: 2, unidad: 'scoop' },
  { nombre: 'Colageno hidrolizado', porcionDefault: '1 scoop (10g)', cal: 36, prot: 9, carb: 0, grasa: 0, unidad: 'scoop' },
  { nombre: 'Omega 3 (capsula)', porcionDefault: '1 capsula', cal: 10, prot: 0, carb: 0, grasa: 1, unidad: 'capsula' },
  { nombre: 'Magnesio bisglicinato', porcionDefault: '1 capsula', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'capsula' },
  { nombre: 'Magnesio citrato', porcionDefault: '1 capsula', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'capsula' },
  { nombre: 'Vitamina D3 (gota)', porcionDefault: '1 gota', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'gota' },
  { nombre: 'Vitamina C (500mg)', porcionDefault: '1 comprimido', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'comprimido' },
  { nombre: 'Zinc picolinato', porcionDefault: '1 capsula', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'capsula' },
  { nombre: 'Complejo B', porcionDefault: '1 comprimido', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'comprimido' },
  { nombre: 'Multivitaminico', porcionDefault: '1 comprimido', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'comprimido' },
  { nombre: 'Pre entreno (cafeina + beta alanina)', porcionDefault: '1 scoop (10g)', cal: 10, prot: 0, carb: 2, grasa: 0, unidad: 'scoop' },
  { nombre: 'BCAA en polvo', porcionDefault: '1 scoop (10g)', cal: 40, prot: 10, carb: 0, grasa: 0, unidad: 'scoop' },
  { nombre: 'Glutamina', porcionDefault: '1 scoop (5g)', cal: 20, prot: 5, carb: 0, grasa: 0, unidad: 'scoop' },
  { nombre: 'L-Carnitina liquida', porcionDefault: '1 dosis (15ml)', cal: 5, prot: 0, carb: 1, grasa: 0, unidad: 'dosis' },
  { nombre: 'Cafeina anhidra (200mg)', porcionDefault: '1 capsula', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'capsula' },
  { nombre: 'Barrita proteica', porcionDefault: '1 unidad (60g)', cal: 220, prot: 20, carb: 22, grasa: 8, unidad: 'unidad', tags: 'snack permitido barra protein bar' },
  { nombre: 'Barrita proteica low carb', porcionDefault: '1 unidad (50g)', cal: 170, prot: 20, carb: 8, grasa: 7, unidad: 'unidad', tags: 'snack permitido barra protein bar low carb' },
  { nombre: 'Barrita de cereal', porcionDefault: '1 unidad (25g)', cal: 100, prot: 2, carb: 18, grasa: 3, unidad: 'unidad', tags: 'snack permitido barra cereal' },
  { nombre: 'Gainer (ganador de peso)', porcionDefault: '1 scoop (80g)', cal: 350, prot: 25, carb: 55, grasa: 4, unidad: 'scoop' },
  { nombre: 'Electrolitos en polvo', porcionDefault: '1 sobre', cal: 10, prot: 0, carb: 2, grasa: 0, unidad: 'sobre' },
  { nombre: 'Proteina en agua (iso clear)', porcionDefault: '1 scoop (25g)', cal: 90, prot: 20, carb: 1, grasa: 0, unidad: 'scoop' },
  { nombre: 'Manteca de mani proteica', porcionDefault: '1 cda (15g)', cal: 60, prot: 6, carb: 3, grasa: 4, unidad: 'cda' },
  { nombre: 'Probiotico (capsula)', porcionDefault: '1 capsula', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'capsula' },
  { nombre: 'Ashwagandha', porcionDefault: '1 capsula', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'capsula' },
  { nombre: 'Melatonina (1mg)', porcionDefault: '1 comprimido', cal: 0, prot: 0, carb: 0, grasa: 0, unidad: 'comprimido' },
];

function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function buscarAlimentos(query: string, limite = 8): AlimentoBase[] {
  const q = normalizar(query);
  if (q.length < 2) return [];
  return alimentosDB
    .filter(a => normalizar(a.nombre).includes(q) || (a.tags && normalizar(a.tags).includes(q)))
    .slice(0, limite);
}

export function buscarAlimentoExacto(nombre: string): AlimentoBase | null {
  const q = normalizar(nombre);
  return alimentosDB.find(a => normalizar(a.nombre) === q) || null;
}

export type CategoriaNutricional = 'proteina' | 'carbo' | 'vegetal' | 'grasa' | 'suplemento' | 'otro';

const PALABRAS_PROTEINA = ['pollo', 'pechuga', 'carne', 'bife', 'lomo', 'chorizo', 'churrasco', 'vacuno', 'vacuna', 'cerdo', 'bondiola', 'salmon', 'atun', 'merluza', 'trucha', 'surubi', 'pescado', 'huevo', 'clara', 'whey', 'protein', 'caseina', 'yogur griego', 'cottage', 'tofu', 'tempeh', 'seitan', 'langostino', 'camaron', 'pulpo', 'calamar', 'pavita', 'conejo', 'cordero', 'higado', 'rinon', 'hamburguesa', 'milanesa', 'jamon', 'nalga', 'peceto', 'cuadril', 'paleta', 'osobuco', 'gainer', 'barrita proteica', 'iso clear', 'vegana'];
const PALABRAS_CARBO = ['arroz', 'avena', 'pan ', 'fideos', 'pasta', 'papa', 'batata', 'quinoa', 'polenta', 'tortilla', 'wrap', 'galleta', 'banana', 'manzana', 'fruta', 'granola', 'cous cous', 'mandioca', 'choclo', 'miel', 'mermelada', 'barrita de cereal', 'dulce'];
const PALABRAS_VEGETAL = ['brocoli', 'coliflor', 'espinaca', 'lechuga', 'tomate', 'zanahoria', 'pepino', 'zucchini', 'berenjena', 'pimiento', 'cebolla', 'esparrago', 'chaucha', 'repollo', 'remolacha', 'ensalada', 'calabaza', 'arandano', 'frutilla', 'kiwi', 'naranja', 'pera', 'mandarina', 'vegetal', 'verdura'];
const PALABRAS_SUPLEMENTO = ['creatina', 'omega', 'magnesio', 'vitamina', 'zinc', 'complejo b', 'multivitaminico', 'pre entreno', 'bcaa', 'glutamina', 'carnitina', 'cafeina', 'colageno', 'probiotico', 'ashwagandha', 'melatonina', 'electrolito'];

export function clasificarAlimento(nombre: string): CategoriaNutricional {
  const n = normalizar(nombre);
  if (PALABRAS_SUPLEMENTO.some(p => n.includes(p))) return 'suplemento';
  if (PALABRAS_PROTEINA.some(p => n.includes(p))) return 'proteina';
  if (PALABRAS_VEGETAL.some(p => n.includes(p))) return 'vegetal';
  if (PALABRAS_CARBO.some(p => n.includes(p))) return 'carbo';
  if (n.includes('aceite') || n.includes('manteca') || n.includes('almendra') || n.includes('nuez') || n.includes('mani') || n.includes('palta') || n.includes('semilla')) return 'grasa';
  return 'otro';
}

export function analizarComida(items: { alimento: string; prot: number; carb: number }[]): { tieneProteina: boolean; tieneCarbo: boolean; tieneVegetal: boolean } {
  let tieneProteina = false;
  let tieneCarbo = false;
  let tieneVegetal = false;
  for (const it of items) {
    const cat = clasificarAlimento(it.alimento);
    if (cat === 'proteina' || it.prot >= 15) tieneProteina = true;
    if (cat === 'carbo' || it.carb >= 20) tieneCarbo = true;
    if (cat === 'vegetal') tieneVegetal = true;
  }
  return { tieneProteina, tieneCarbo, tieneVegetal };
}
