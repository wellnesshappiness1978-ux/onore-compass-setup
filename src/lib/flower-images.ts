import flower01 from '@/assets/flower-01.jpg';
import flower02 from '@/assets/flower-02.jpg';
import flower03 from '@/assets/flower-03.jpg';
import flower04 from '@/assets/flower-04.jpg';
import flower05 from '@/assets/flower-05.jpg';
import flower06 from '@/assets/flower-06.jpg';
import flower07 from '@/assets/flower-07.jpg';
import flower08 from '@/assets/flower-08.jpg';
import flower09 from '@/assets/flower-09.jpg';
import flower10 from '@/assets/flower-10.jpg';
import flower11 from '@/assets/flower-11.jpg';
import flower12 from '@/assets/flower-12.jpg';

/** Month-aligned lucky flower photos (index 0 = January … 11 = December), matched to the monthly flower list. */
export const flowerImages = [flower01, flower02, flower03, flower04, flower05, flower06, flower07, flower08, flower09, flower10, flower11, flower12] as const;

/** Photo for the flower of a given 1-based month; falls back to January for out-of-range input. */
export function flowerImageForMonth(month: number): string {
  return flowerImages[((month - 1) % 12 + 12) % 12]!;
}
