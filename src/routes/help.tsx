import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import HelpFAQ from '@/components/HelpFAQ';
import { storedLanguage, supportCopy } from '@/lib/support-copy';
import type { Language } from '@/lib/translations';
import { Button } from '@/components/ui/button';
export const Route=createFileRoute('/help')({head:()=>({meta:[{title:'よくある質問 | アゴルメンの羅針盤'},{name:'description',content:'アカウント、プラン、決済・解約、占いの仕様を確認できるヘルプ。'},{property:'og:title',content:'よくある質問 | アゴルメンの羅針盤'},{property:'og:description',content:'アカウント・プラン・決済・占いについてのFAQ。'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:HelpPage});
function HelpPage(){const [language,setLanguage]=useState<Language>('ja');useEffect(()=>setLanguage(storedLanguage()),[]);return <main className="mx-auto max-w-3xl px-5 py-12"><Button asChild variant="ghost"><Link to="/app">{supportCopy[language].back}</Link></Button><div className="mt-6"><HelpFAQ language={language}/></div><Button asChild variant="outline" className="mt-6"><Link to="/support">{supportCopy[language].title}</Link></Button></main>;}