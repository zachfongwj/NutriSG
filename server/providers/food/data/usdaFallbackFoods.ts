export interface USDAFoodRecord {
  fdcId: number;
  description: string;
  dataType: string;
  foodCategory?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: Array<{
    nutrientId?: number;
    nutrientName: string;
    nutrientNumber?: string;
    unitName: string;
    value: number;
  }>;
}

// Authentic USDA FoodData Central Foundation and SR Legacy items
export const USDA_VERIFIED_DATASET: USDAFoodRecord[] = [
  {
    fdcId: 170567,
    description: "Rice, brown, long-grain, cooked",
    dataType: "SR Legacy",
    foodCategory: "Cereal Grains and Pasta",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 123 },
      { nutrientName: "Protein", unitName: "g", value: 2.74 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 0.97 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 25.58 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 1.6 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 4 },
      { nutrientName: "Potassium, K", unitName: "mg", value: 86 }
    ]
  },
  {
    fdcId: 171077,
    description: "Chicken, breast, meat only, cooked, roasted",
    dataType: "SR Legacy",
    foodCategory: "Poultry Products",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 165 },
      { nutrientName: "Protein", unitName: "g", value: 31.02 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 3.57 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 0 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 0 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 74 },
      { nutrientName: "Potassium, K", unitName: "mg", value: 256 }
    ]
  },
  {
    fdcId: 175176,
    description: "Fish, salmon, Atlantic, wild, cooked, dry heat",
    dataType: "SR Legacy",
    foodCategory: "Finfish and Shellfish Products",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 182 },
      { nutrientName: "Protein", unitName: "g", value: 25.44 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 8.13 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 0 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 0 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 56 },
      { nutrientName: "Potassium, K", unitName: "mg", value: 628 }
    ]
  },
  {
    fdcId: 172448,
    description: "Tofu, firm, prepared with calcium sulfate and magnesium chloride (nigari)",
    dataType: "SR Legacy",
    foodCategory: "Legumes and Legume Products",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 83 },
      { nutrientName: "Protein", unitName: "g", value: 9.98 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 5.26 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 1.57 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 0.9 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 7 },
      { nutrientName: "Calcium, Ca", unitName: "mg", value: 282 },
      { nutrientName: "Iron, Fe", unitName: "mg", value: 1.63 }
    ]
  },
  {
    fdcId: 170379,
    description: "Broccoli, cooked, boiled, drained, without salt",
    dataType: "SR Legacy",
    foodCategory: "Vegetables and Vegetable Products",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 35 },
      { nutrientName: "Protein", unitName: "g", value: 2.38 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 0.41 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 7.18 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 3.3 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 41 },
      { nutrientName: "Potassium, K", unitName: "mg", value: 293 },
      { nutrientName: "Vitamin C, total ascorbic acid", unitName: "mg", value: 64.9 }
    ]
  },
  {
    fdcId: 170417,
    description: "Cabbage, Chinese (pak-choi), cooked, boiled, drained, without salt",
    dataType: "SR Legacy",
    foodCategory: "Vegetables and Vegetable Products",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 12 },
      { nutrientName: "Protein", unitName: "g", value: 1.55 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 0.17 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 1.8 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 1.0 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 34 },
      { nutrientName: "Potassium, K", unitName: "mg", value: 371 }
    ]
  },
  {
    fdcId: 173418,
    description: "Oats, regular and quick, not fortified, dry",
    dataType: "SR Legacy",
    foodCategory: "Cereal Grains and Pasta",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 379 },
      { nutrientName: "Protein", unitName: "g", value: 13.15 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 6.52 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 67.7 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 10.1 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 6 },
      { nutrientName: "Potassium, K", unitName: "mg", value: 362 }
    ]
  },
  {
    fdcId: 171287,
    description: "Egg, whole, cooked, hard-boiled",
    dataType: "SR Legacy",
    foodCategory: "Dairy and Egg Products",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 155 },
      { nutrientName: "Protein", unitName: "g", value: 12.58 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 10.61 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 1.12 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 0 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 124 }
    ]
  },
  {
    fdcId: 168434,
    description: "Sweet potato, cooked, baked in skin, flesh, without salt",
    dataType: "SR Legacy",
    foodCategory: "Vegetables and Vegetable Products",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 90 },
      { nutrientName: "Protein", unitName: "g", value: 2.01 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 0.15 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 20.71 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 3.3 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 36 },
      { nutrientName: "Potassium, K", unitName: "mg", value: 475 }
    ]
  },
  {
    fdcId: 172429,
    description: "Lentils, mature seeds, cooked, boiled, without salt",
    dataType: "SR Legacy",
    foodCategory: "Legumes and Legume Products",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 116 },
      { nutrientName: "Protein", unitName: "g", value: 9.02 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 0.38 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 20.13 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 7.9 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 2 },
      { nutrientName: "Potassium, K", unitName: "mg", value: 369 },
      { nutrientName: "Iron, Fe", unitName: "mg", value: 3.33 }
    ]
  },
  {
    fdcId: 168880,
    description: "Spinach, cooked, boiled, drained, without salt",
    dataType: "SR Legacy",
    foodCategory: "Vegetables and Vegetable Products",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientName: "Energy", unitName: "kcal", value: 23 },
      { nutrientName: "Protein", unitName: "g", value: 2.97 },
      { nutrientName: "Total lipid (fat)", unitName: "g", value: 0.26 },
      { nutrientName: "Carbohydrate, by difference", unitName: "g", value: 3.75 },
      { nutrientName: "Fiber, total dietary", unitName: "g", value: 2.4 },
      { nutrientName: "Sodium, Na", unitName: "mg", value: 70 },
      { nutrientName: "Potassium, K", unitName: "mg", value: 466 }
    ]
  }
];
