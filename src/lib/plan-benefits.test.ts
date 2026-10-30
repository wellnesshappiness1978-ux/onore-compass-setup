import { describe, expect, it } from 'vitest';
import { hasDeepCompatibility } from './plan-benefits';
describe('VIP-only deep compatibility',()=>{
 it.each(['free','standard',null,'unknown'])('%s cannot access detailed report',p=>{expect(hasDeepCompatibility(p)).toBe(false);});
 it.each(['vip','family','Family Premium','ファミリープレミアム'])('%s can access detailed report',p=>{expect(hasDeepCompatibility(p)).toBe(true);});
});