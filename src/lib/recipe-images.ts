import staple from "@/assets/recipe-staple.jpg.asset.json";
import main from "@/assets/recipe-main.jpg.asset.json";
import side from "@/assets/recipe-side.jpg.asset.json";
import soup from "@/assets/recipe-soup.jpg.asset.json";
import sweet from "@/assets/recipe-sweet.jpg.asset.json";

/** Five spiritual food photographs; recipe slots cycle through them by index. */
export const RECIPE_IMAGES = [staple.url, main.url, side.url, soup.url, sweet.url] as const;
export const recipeImage = (index: number) => RECIPE_IMAGES[((index % RECIPE_IMAGES.length) + RECIPE_IMAGES.length) % RECIPE_IMAGES.length];
