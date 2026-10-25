import dish0 from "@/assets/dish-spinach-tuna.jpg";
import dish1 from "@/assets/dish-komatsuna-miso.jpg";
import dish2 from "@/assets/dish-lemon-chicken.jpg";
import dish3 from "@/assets/dish-sesame-broccoli.jpg";
import dish4 from "@/assets/dish-cucumber-pickle.jpg";
import dish5 from "@/assets/dish-tomato-egg.jpg";
import dish6 from "@/assets/dish-stuffed-pepper.jpg";
import dish7 from "@/assets/dish-champuru.jpg";
import dish8 from "@/assets/dish-carrot-egg.jpg";
import dish9 from "@/assets/dish-strawberry-yogurt.jpg";
import dish10 from "@/assets/dish-pumpkin.jpg";
import dish11 from "@/assets/dish-sweet-rice.jpg";
import dish12 from "@/assets/dish-pork-soup.jpg";
import dish13 from "@/assets/dish-nikujaga.jpg";
import dish14 from "@/assets/dish-corn-fritters.jpg";
import dish15 from "@/assets/dish-yellowtail-daikon.jpg";
import dish16 from "@/assets/dish-whitefish.jpg";
import dish17 from "@/assets/dish-lotus.jpg";
import dish18 from "@/assets/dish-pork-daikon.jpg";
import dish19 from "@/assets/dish-napa-tofu.jpg";
import dish20 from "@/assets/dish-wakame-miso.jpg";
import dish21 from "@/assets/dish-salmon-foil.jpg";
import dish22 from "@/assets/dish-hijiki-beans.jpg";
import dish23 from "@/assets/dish-nameko-daikon.jpg";
import dish24 from "@/assets/dish-clam-miso.jpg";
import dish25 from "@/assets/dish-matcha-latte.jpg";
import dish26 from "@/assets/dish-mint-lemon-water.jpg";
import dish27 from "@/assets/dish-hibiscus-tea.jpg";
import dish28 from "@/assets/dish-hojicha-latte.jpg";
import dish29 from "@/assets/dish-yuzu-ginger.jpg";
import dish30 from "@/assets/dish-blueberry-smoothie.jpg";
import dish31 from "@/assets/dish-matcha-warabimochi.jpg";
import dish32 from "@/assets/dish-apple-compote.jpg";
import dish33 from "@/assets/dish-kinako-shiratama.jpg";
import dish34 from "@/assets/dish-peach-jelly.jpg";
import dish35 from "@/assets/dish-sesame-pudding.jpg";
import dish36 from "@/assets/dish-broccoli-tofu.jpg";
import dish37 from "@/assets/dish-pepper-carrot.jpg";
import dish38 from "@/assets/dish-pumpkin-sweetpotato.jpg";
import dish39 from "@/assets/dish-napa-mushroom.jpg";
import dish40 from "@/assets/dish-salmon-cabbage-foil.jpg";

/** Each photograph depicts exactly this catalogue recipe, independent of position or language. */
export const RECIPE_IMAGES: Record<string, string> = {
  "spinach-tuna": dish0,
  "komatsuna-miso": dish1,
  "lemon-chicken": dish2,
  "sesame-broccoli": dish3,
  "cucumber-pickle": dish4,
  "tomato-egg": dish5,
  "stuffed-pepper": dish6,
  "champuru": dish7,
  "carrot-egg": dish8,
  "strawberry-yogurt": dish9,
  "pumpkin": dish10,
  "sweet-rice": dish11,
  "pork-soup": dish12,
  "nikujaga": dish13,
  "corn-fritters": dish14,
  "yellowtail-daikon": dish15,
  "whitefish": dish16,
  "lotus": dish17,
  "pork-daikon": dish18,
  "napa-tofu": dish19,
  "wakame-miso": dish20,
  "salmon-foil": dish21,
  "hijiki-beans": dish22,
  "nameko-daikon": dish23,
  "clam-miso": dish24,
  "matcha-latte": dish25,
  "mint-lemon-water": dish26,
  "hibiscus-tea": dish27,
  "hojicha-latte": dish28,
  "yuzu-ginger": dish29,
  "blueberry-smoothie": dish30,
  "matcha-warabimochi": dish31,
  "apple-compote": dish32,
  "kinako-shiratama": dish33,
  "peach-jelly": dish34,
  "sesame-pudding": dish35,
  "broccoli-tofu": dish36,
  "pepper-carrot": dish37,
  "pumpkin-sweetpotato": dish38,
  "napa-mushroom": dish39,
  "salmon-cabbage-foil": dish40,
};
export const recipeImage = (id: string | undefined) => id ? RECIPE_IMAGES[id] : undefined;
