export type CategoryType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string; // Sesuai nama kolom di database
  category: CategoryType;
  description?: string; // Opsional, jaga-jaga jika null
}
