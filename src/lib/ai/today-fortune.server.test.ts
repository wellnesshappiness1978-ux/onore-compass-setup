import { beforeEach,expect,it,vi } from 'vitest';
const mocks=vi.hoisted(()=>({stream:vi.fn()}));
vi.mock('@lovable.dev/ai-gateway',()=>({streamResponse:mocks.stream}));
import { runReading } from './today-fortune.server';
import { todayFortuneRequestSchema } from '../today-fortune';
import { recipesForElement } from '../lucky-recipes';
import { dayElement } from '../team-analysis';
const day=new Date().toISOString().slice(0,10);
const input=()=>todayFortuneRequestSchema.parse({day,language:'ja',subject:{kind:'self',key:'self',label:'you'},members:[{nameKanji:'',nameKana:'',nameRomaji:'',birthDate:'1990-05-05',birthTime:'',birthTimeUnknown:true,birthPlace:'',birthCity:'',bloodType:'',siblingOrder:''}]});
beforeEach(()=>vi.clearAllMocks());
it('streams five exact birth/date selections with no automatic retries and preserves progressive fields',async()=>{
 const guidance={action:'a',reason:'r',benefit:'b',target_name:'n',description:'d'};
 const value={headline:'今日',insight:'診断',dynamics:'対話',actions:['行動'],caution:'注意',decision:{advance:'a',protect:'p',reason:'r'},shopping:guidance,maintenance:guidance,monthly:{flower:guidance,action:guidance,item:guidance,outlook:'o'},luckyColor:{name:'blue',hex:'#0088CC',reason:'r',usage:'u'},luckyWord:{word:'w',message:'m'},foods:recipesForElement(dayElement(day),day,'1990-05-05').map(r=>({recipeId:r.id,name:'ignored',why:'理由',servings:'2人前',ingredients:[{item:'食材',amount:'100g'}],seasonings:[],steps:[{text:'加熱',tip:''}]}))};
 mocks.stream.mockResolvedValue((async function*(){yield {type:'response.output_text.delta',delta:JSON.stringify(value)};yield {type:'response.completed'};})());
 const partial=vi.fn();const output=await runReading(input(),partial);
 expect(output.foods.map(f=>f.recipeId)).toEqual(value.foods.map(f=>f.recipeId));expect(partial).toHaveBeenCalled();
 expect(mocks.stream.mock.calls[0]?.[1]).toMatchObject({maxRetries:0});
 expect(mocks.stream.mock.calls[0]?.[0].model).toBe('openai/gpt-6-astra');
});
it('a terminal stream failure stops after one call',async()=>{
 mocks.stream.mockResolvedValue((async function*(){throw new Error('offline');yield;} )());
 await expect(runReading(input())).rejects.toThrow('offline');expect(mocks.stream).toHaveBeenCalledTimes(1);
});