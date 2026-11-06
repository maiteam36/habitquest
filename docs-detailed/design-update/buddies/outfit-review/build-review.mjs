/** Actual Buddy component renderings; local source PNGs stand in for the identical immutable S3 bytes. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../..');
const app=path.join(root,'frontend');
const catalog=path.resolve(root,'../hq-buddies-catalog');
const require=createRequire(path.join(app,'package.json'));
const ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{chromium}=require('@playwright/test');
const cache=new Map();
function load(p){
  if(cache.has(p))return cache.get(p);
  if(p.endsWith('.json'))return JSON.parse(fs.readFileSync(p));
  const compiled=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText;
  const module={exports:{}};cache.set(p,module.exports);
  vm.runInNewContext(compiled,{module,exports:module.exports,require:id=>{if(!id.startsWith('.'))return require(id);const stem=path.resolve(path.dirname(p),id);const target=[stem,stem+'.ts',stem+'.tsx'].find(file=>fs.existsSync(file));if(!target)throw new Error(id);return load(target);}});
  return module.exports;
}
const Buddy=load(path.join(app,'src/components/Buddy.tsx')).default;
const records=JSON.parse(fs.readFileSync(path.join(app,'src/data/buddyCatalog.json'))).buddies;
const accessories=['party-hat','crown','shades','bow','wizard','flower','headphones','halo'];
const render=(record,view,item,size)=>renderToStaticMarkup(React.createElement(Buddy,{buddy:'fox',selectionMode:'catalog',catalogBuddyId:record.id,catalogVersion:'0.1.0',representation:view,accessory:item,size}));
const css=`*{box-sizing:border-box}body{margin:0;font:12px Arial;background:#f6f3fb;color:#302543}h1{font-size:21px;margin:20px 18px 5px}p{margin:0 18px 16px;color:#776a83}.grid{display:grid;grid-template-columns:repeat(8,224px)}article{background:white;border:1px solid #e5dced;padding:10px;min-height:250px;text-align:center}h2{font-size:12px;margin:0 0 12px}.stage{height:208px;display:flex;align-items:center;justify-content:center}.portrait .stage{height:145px}.small{height:69px;display:flex;gap:22px;align-items:center;justify-content:center}.small:after{content:'48 / 64 px';font-size:9px;color:#887e91}a{color:#5a3fc6}`;
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'});
try{
const page=await browser.newPage({viewport:{width:1792,height:2100},deviceScaleFactor:1});
await page.route('https://habbit-quest-assets.s3.us-east-1.amazonaws.com/buddies/**', route => {
 const [id,file] = new URL(route.request().url()).pathname.split('/').slice(-2);
 return route.fulfill({status:200,contentType:'image/png',body:fs.readFileSync(path.join(catalog,'art/images',id,file))});
});
for(const mode of ['portrait','full','full-preview'])for(let group=0;group<4;group++){
 const view=mode==='portrait'?'portrait':'full';
 const size=mode==='portrait'?128:mode==='full'?208:144;
 const subset=records.slice(group*6,group*6+6);const name=`${mode}-${group+1}`;
 const html=`<!doctype html><html><head><meta charset="utf-8"><title>HabitQuest outfits ${name}</title><style>${css}</style></head><body class="${view}"><h1>${view==='portrait'?'Portraits: 128px fitting view + actual 48px / 64px sizes':`Full artwork: ${size}px selected-preview size`} · ${group+1}/4</h1><p>Actual production Buddy component · catalog/art 0.1.0 · existing PNGs + SVG wearables · every equipped accessory retained</p><main class="grid">${subset.flatMap(r=>accessories.map(item=>`<article><h2>${r.name} · ${item}</h2><div class="stage">${render(r,view,item,size)}</div>${view==='portrait'?`<div class="small">${render(r,view,item,48)}${render(r,view,item,64)}</div>`:''}</article>`)).join('')}</main></body></html>`;
 fs.writeFileSync(path.join(here,name+'.html'),html);
 await page.goto('file://'+path.join(here,name+'.html'));
 await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()));});
 const height=await page.evaluate(()=>Math.ceil(document.querySelector('main').getBoundingClientRect().bottom)+20);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:path.join(here,name+'.png'),clip:{x:0,y:0,width:1792,height}});console.log(`Rendered ${name}: ${subset.length*8} combinations`);
}
const index=`<!doctype html><html><head><meta charset="utf-8"><title>Buddy outfit visual review</title><style>${css}</style></head><body><h1>Buddy outfit visual review</h1><p>24 characters × 8 original accessories × 2 independently fitted representations = 384 combinations.</p><ul>${['portrait','full','full-preview'].flatMap(v=>[1,2,3,4].map(n=>`<li><a href="${v}-${n}.html">${v} group ${n}</a> · <a href="${v}-${n}.png">contact sheet</a></li>`)).join('')}</ul></body></html>`;fs.writeFileSync(path.join(here,'index.html'),index);
}finally{await browser.close();}
