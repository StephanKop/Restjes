export enum Allergen {
  Gluten = "gluten",
  Crustaceans = "crustaceans",
  Eggs = "eggs",
  Fish = "fish",
  Peanuts = "peanuts",
  Soybeans = "soybeans",
  Milk = "milk",
  Nuts = "nuts",
  Celery = "celery",
  Mustard = "mustard",
  Sesame = "sesame",
  Sulphites = "sulphites",
  Lupin = "lupin",
  Molluscs = "molluscs",
}

export enum DishStatus {
  Available = "available",
  Reserved = "reserved",
  Sold = "sold",
  Expired = "expired",
}

export type DishIngredient = {
  id: string;
  dish_id: string;
  name: string;
};

export type DishAllergy = {
  id: string;
  dish_id: string;
  allergen: Allergen;
};

export type Dish = {
  id: string;
  merchant_id: string;
  title: string;
  description: string | null;
  original_price: number;
  discount_price: number;
  image_url: string | null;
  status: DishStatus;
  pickup_from: string;
  pickup_until: string;
  portions_total: number;
  portions_remaining: number;
  created_at: string;
  updated_at: string;
};

export type DishWithDetails = Dish & {
  ingredients: DishIngredient[];
  allergies: DishAllergy[];
  merchant_name: string;
  merchant_avatar_url: string | null;
};
