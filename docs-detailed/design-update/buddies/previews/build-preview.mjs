/** Review-only compositions. Never imported by the app; reads existing PNG/SVG art. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(here, '../../../../frontend');
const catalog = path.resolve(here, '../../../../../hq-buddies-catalog');
const require = createRequire(path.join(app, 'package.json'));
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { chromium } = require('@playwright/test');

// Reuse the current component's exact faces and accessory vectors, without editing it.
const source = fs.readFileSync(path.join(app, 'src/components/Buddy.tsx'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const component = { exports: {} };
vm.runInNewContext(compiled, { require, module: component, exports: component.exports });
const Buddy = component.exports.default;
const old = (buddy, accessory, size = 128) => renderToStaticMarkup(React.createElement(Buddy, { buddy, accessory, size }));
const accessory = (buddy, item) => {
  const base = old(buddy, undefined, 64), worn = old(buddy, item, 64);
  const prefix = base.slice(0, -'</svg>'.length);
  if (!worn.startsWith(prefix)) throw new Error('Original SVG structure changed');
  return worn.slice(prefix.length, -'</svg>'.length);
};
const image = (id, view) => `data:image/png;base64,${fs.readFileSync(path.join(catalog, 'art/images', id, `${view === 'portrait' ? 'icon' : 'image'}.png`)).toString('base64')}`;
const compose = (id, view, item, legacy, fit, size) => {
  const canvas = view === 'portrait' ? 128 : 768;
  const layers = fit ? `<g transform="rotate(${fit.angle} ${fit.cx} ${fit.cy})"><g transform="translate(${fit.x} ${fit.y}) scale(${fit.sx} ${fit.sy ?? fit.sx})">${accessory(legacy, item)}</g></g>` : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${canvas} ${canvas}" role="img" aria-label="${id} ${view}, ${item || 'no accessory'}, draft placement" overflow="visible"><image href="${image(id, view)}" width="${canvas}" height="${canvas}"/>${layers}</svg>`;
};

// Deliberate review placements, not production-ready registration or support claims.
const rows = [
  { title: 'Golden crown', name: 'Bear → Pippin', legacy: 'bear', id: 'pippin-bear', item: 'crown',
    portrait: { cx: 62, cy: 24, angle: -12, x: 12.4, y: 2.3, sx: 1.55 },
    full: { cx: 375, cy: 125, angle: -18, x: 215, y: 55, sx: 5 },
    note: 'Headwear needs a seat between the ears, not at the highest pixel.' },
  { title: 'Cool shades', name: 'Fox → Ember', legacy: 'fox', id: 'ember-fox', item: 'shades',
    portrait: { cx: 70, cy: 63, angle: -7, x: 9.56, y: 1.61, sx: 1.8889 },
    full: { cx: 502, cy: 277, angle: -6.34, x: 246, y: 17, sx: 8 },
    note: 'The portrait and full image have different head positions and scale.' },
  { title: 'Headphones · unresolved example', name: 'Owl → Dot', legacy: 'owl', id: 'dot-bot', item: 'headphones',
    portrait: { cx: 66, cy: 70, angle: 9, x: -7.6, y: 14.75, sx: 2.3, sy: 1.7 },
    full: { cx: 380, cy: 282, angle: 18, x: 149.6, y: 103.25, sx: 7.2, sy: 5.5 },
    note: 'Dot already has ear modules and an antenna. Duplicating headphones needs a different fit/design.', caution: true },
];

const css = `
*{box-sizing:border-box}body{margin:0;background:#f8f5ff;color:#292044;font-family:Arial,sans-serif}main{max-width:1360px;margin:auto;padding:32px 40px 38px}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#7659aa}h1{font-size:29px;letter-spacing:-.7px;margin:8px 0 10px}p{line-height:1.5;margin:0;color:#6b607e;font-size:13px}
.intro{display:flex;align-items:center;justify-content:space-between;gap:28px}.note{max-width:370px;background:#fff;border:1px solid #dfd5ed;border-radius:13px;padding:13px 15px;font-size:12px;line-height:1.55;color:#625470}
.columns,.row{display:grid;grid-template-columns:230px 1fr 1fr 1fr;gap:14px}.columns{margin:25px 0 9px;color:#79698f;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px}.columns>div:not(:first-child){text-align:center}
.row{margin:0 0 13px;align-items:stretch}.context{padding:28px 6px 20px 0;display:flex;flex-direction:column;justify-content:center;gap:10px}.context h2{font-size:18px;margin:0;line-height:1.25}.context b{font-size:12px;color:#76668b}.context p{font-size:12px;line-height:1.55}
.stage{min-height:230px;border:1px solid #e5dcec;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;position:relative;padding:13px;box-shadow:0 2px 6px #3a245407}.stage svg{flex-shrink:0}.caution .stage{border-color:#e3c6a0;background:#fffdfa}.stage-label{position:absolute;bottom:10px;font-size:10px;color:#80718b}.caution .stage-label{color:#936126}
.foot{display:flex;gap:20px;padding-top:7px;font-size:11px;color:#82738d;line-height:1.6}.foot span{flex:1}
.options{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:25px}.option{background:#fff;border:1px solid #dfd5ed;border-radius:20px;padding:24px}.option h2{margin:0;font-size:19px}.option .visual{height:215px;display:flex;align-items:center;justify-content:center;position:relative}.option .visual>div{position:relative}.badge{position:absolute;right:-8px;bottom:1px;background:#fff7d4;border:2px solid #e6c34f;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px #5b402325}.badge svg{width:35px;height:35px}.status{display:inline-block;background:#eee7fa;color:#6a4895;border-radius:999px;font-size:11px;padding:5px 9px;margin-top:14px}
.sizes{margin-top:22px;background:#fff;border:1px solid #dfd5ed;border-radius:16px;padding:19px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px}.sizes>div{display:flex;gap:22px;align-items:center}.mini{display:flex;align-items:center;gap:9px;color:#6d5d7e;font-size:11px}
`;
const shell = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`;
const alignment = shell('Buddy outfit alignment — review only', `<main>
  <div class="intro"><div><div class="eyebrow">HabitQuest · artwork fitting review</div><h1>Same accessories. Different character geometry.</h1><p>Original app vectors compared with existing catalog PNGs and illustrative accessory placements.</p></div><div class="note"><b>Review-only preview</b><br>Original outfits are unchanged. New placements are manual drafts, not final compatibility. No app integration or image regeneration.</div></div>
  <div class="columns"><div>Accessory / character</div><div>Original buddy · current rendering</div><div>New portrait · draft fit</div><div>New full-body · independent draft fit</div></div>
  ${rows.map(row => `<section class="row ${row.caution ? 'caution' : ''}"><div class="context"><h2>${row.title}</h2><b>${row.name}</b><p>${row.note}</p></div><div class="stage">${old(row.legacy, row.item)}<span class="stage-label">Actual current component</span></div><div class="stage">${compose(row.id,'portrait',row.item,row.legacy,row.portrait,128)}<span class="stage-label">${row.caution ? 'Existing hardware conflicts with overlay' : '128px portrait · manually placed'}</span></div><div class="stage">${compose(row.id,'full',row.item,row.legacy,row.full,208)}<span class="stage-label">${row.caution ? 'Needs character-specific adaptation' : '768px source · independently placed'}</span></div></section>`).join('')}
  <div class="foot"><span><b>Ready to reuse:</b> existing base images, existing accessory IDs and vectors, inventory, equipped state and reward rules.</span><span><b>Still to validate:</b> per-view anchors, head tilt, accessory layering, robot hardware, all eight accessories and small avatar sizes.</span></div>
</main>`);

const pippin = rows[0];
const badge = `<span class="badge" aria-label="Equipped golden crown"><svg viewBox="14 -2 36 22">${accessory('bear','crown')}</svg></span>`;
const comparison = shell('Buddy badge versus fitted accessory — review only', `<main>
  <div class="eyebrow">HabitQuest · outfit behavior clarification</div><h1>Equipped-item badge versus actually wearing the item</h1><p>Both examples use the same existing Pippin portrait and the same Golden crown accessory.</p>
  <div class="options"><section class="option"><h2>A. Equipped-item badge</h2><div class="visual"><div>${compose(pippin.id,'portrait',null,'bear',null,128)}${badge}</div></div><p><b>Equipped: Golden crown.</b> The badge identifies the active item beside the portrait. The character itself is not wearing it.</p><span class="status">Preserves inventory and state; changes dress-up presentation</span></section>
  <section class="option"><h2>B. Fitted accessory overlay</h2><div class="visual">${compose(pippin.id,'portrait','crown','bear',pippin.portrait,128)}</div><p><b>Pippin wears the Golden crown.</b> The PNG stays as the base; a positioned SVG accessory is drawn over it.</p><span class="status">Recommended direction to retain visual dress-up</span></section></div>
  <div class="sizes"><div><div><b style="font-size:13px">Small-avatar review</b><p style="font-size:11px">Draft fits at actual 48px and 64px display sizes.</p></div></div><div>${[48,64].map(size=>`<div class="mini">${old('bear','crown',size)}<span>Original<br>${size}px</span></div><div class="mini">${compose(pippin.id,'portrait','crown','bear',pippin.portrait,size)}<span>Catalog<br>${size}px</span></div>`).join('')}</div></div>
  <div class="foot"><span><b>Always a buddy:</b> new children receive a local age-based default; changing accessories or removing one never removes the character.</span><span><b>Implementation is pending:</b> anchor metadata and full visual QA are needed before enabling dress-up on catalog characters.</span></div>
</main>`);

fs.writeFileSync(path.join(here,'alignment.html'), alignment);
fs.writeFileSync(path.join(here,'badge-versus-overlay.html'), comparison);
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1150 }, deviceScaleFactor: 1 });
  for (const name of ['alignment','badge-versus-overlay']) {
    await page.goto(`file://${path.join(here,`${name}.html`)}`);
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
    await page.locator('main').screenshot({ path: path.join(here,`${name}.png`) });
    console.log(`Saved ${name}.png`);
  }
} finally { await browser.close(); }
