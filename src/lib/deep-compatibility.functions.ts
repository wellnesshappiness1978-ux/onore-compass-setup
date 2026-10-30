import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { getMyMembership } from './membership.functions';
import { hasDeepCompatibility } from './plan-benefits';
import { partnerSchema } from './compatibility-analysis';
import { readingProfileSchema } from './profile-reading-context';
import { z } from 'zod';

export const deepReportSchema = z.object({ values: z.string().min(80).max(3500), communication: z.string().min(80).max(3500), romance: z.string().min(80).max(3500), longTerm: z.string().min(80).max(3500) });
export type DeepReport = z.infer<typeof deepReportSchema>;
export const generateDeepCompatibility = createServerFn({ method:'POST' }).middleware([requireSupabaseAuth])
 .inputValidator((input: unknown)=>z.object({owner:readingProfileSchema,partner:partnerSchema,language:z.enum(['ja','en','zh-CN','zh-TW','ko','es','fr']),relationship:z.string().max(60),concern:z.string().max(80)}).parse(input))
 .handler(async({data})=>{
   const plan=await getMyMembership();
   if(!hasDeepCompatibility(plan)) return {ok:false as const,locked:true};
   try {
     const { generateDeepReport }=await import('./ai/deep-compatibility.server');
     return {ok:true as const,report:await generateDeepReport(getRequest(),data)};
   } catch { return {ok:false as const,locked:false}; }
 });