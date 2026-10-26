import type { Language } from './translations';
const ids=['partner','lover','fiance','family','mother','father','son','daughter','sibling','relative','friend','business','boss','subordinate','employee','other'];
const labels:Record<Language,string[]>={
 ja:['パートナー','恋人','婚約者','ファミリー','母親','父親','息子','娘','きょうだい','親戚','友人','仕事仲間','上司','部下','従業員','その他'],
 en:['Partner','Lover','Fiancé(e)','Family','Mother','Father','Son','Daughter','Sibling','Relative','Friend','Colleague','Boss','Subordinate','Employee','Other'],
 'zh-CN':['伴侣','恋人','未婚伴侣','成员','母亲','父亲','儿子','女儿','兄弟姐妹','亲戚','朋友','同事','上司','下属','员工','其他'],
 'zh-TW':['伴侶','戀人','未婚伴侶','成員','母親','父親','兒子','女兒','手足','親戚','朋友','同事','上司','下屬','員工','其他'],
 ko:['파트너','연인','약혼자','패밀리','어머니','아버지','아들','딸','형제자매','친척','친구','동료','상사','부하','직원','기타'],
 es:['Pareja','Novio/a','Prometido/a','Familia','Madre','Padre','Hijo','Hija','Hermano/a','Pariente','Amistad','Colega','Jefe/a','Subordinado/a','Empleado/a','Otro'],
 fr:['Partenaire','Amoureux/se','Fiancé(e)','Famille','Mère','Père','Fils','Fille','Frère/Sœur','Parent(e)','Ami·e','Collègue','Supérieur(e)','Subordonné(e)','Employé·e','Autre'],
};
export const familyRelationshipCopy = Object.fromEntries(Object.entries(labels).map(([language,values])=>[language,Object.fromEntries(ids.map((id,i)=>[id,values[i] ?? '—']))])) as Record<Language,Record<string,string>>;