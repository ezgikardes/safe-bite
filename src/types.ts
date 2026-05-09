export type NutrientLevel = "low" | "moderate" | "high";

export type Product = {
  code: string;
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  ingredients_text_de?: string;
  ingredients_tags?: string[];
  image_front_url?: string;
  nutrient_levels?: {
    fat: NutrientLevel;
    salt: NutrientLevel;
    "saturated-fat": NutrientLevel;
    sugars: NutrientLevel;
  };
};
