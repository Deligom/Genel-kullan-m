// iOS Safari davranışlarını taklit eden sahte SpeechRecognition ile uçtan uca test.
// Çalıştır: python3 -m http.server 8765   (ayrı terminalde)   sonra   node tests/ios-sim.test.js
const { chromium } = require('playwright');
const URL = process.env.URL || 'http://localhost:8765/';
const FAKE = `
window.__recs=[]; window.__allowAuto=true; addEventListener('click',()=>{window.__lastClick=Date.now();},true);
class FakeSR { constructor(){ this.lang=''; window.__recs.push(this); }
  start(){ const self=this; this.gesture = Date.now()-(window.__lastClick||0) < 150;
    setTimeout(()=>{ if(!self.gesture && !window.__allowAuto){ self.onerror&&self.onerror({error:'not-allowed'}); self.onend&&self.onend(); return; }
      self.onstart&&self.onstart(); },20); }
  stop(){ setTimeout(()=>this.onend&&this.onend(),10); } abort(){}
  emit(list, idx){ idx=idx||0; const pad=[]; while(pad.length+list.length<=idx) pad.push(['',true]); list=pad.concat(list); const results=list.map(([t,f])=>{ const a=[{transcript:t}]; a.isFinal=f; return a; });
    this.onresult&&this.onresult({resultIndex:idx||0, results}); }
  end(){ this.onend&&this.onend(); } }
window.webkitSpeechRecognition=FakeSR; window.SpeechRecognition=FakeSR;`;

(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(FAKE);
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  const val = () => p.$eval('#txt', t => t.value);
  const st = () => p.$eval('#stxt', e => e.textContent);
  const emit = (l, i) => p.evaluate(([l, i]) => window.__recs[window.__recs.length - 1].emit(l, i), [l, i]);
  let fail = 0;
  const eq = (n, a, e) => { if (a !== e) { fail++; console.log('FAIL', n, JSON.stringify(a), 'beklenen', JSON.stringify(e)); } else console.log('ok  ', n); };

  await p.click('#mic'); await p.waitForTimeout(60);
  eq('dinliyor', await st(), 'Dinliyor…');
  await emit([['ekmek on beş lira', true]], 0);
  await emit([['ekmek on beş lira', true]], 0);
  eq('aynı indeks tekrarı', await val(), 'ekmek on beş lira');
  await emit([['ekmek on beş lira', true], ['ekmek on beş lira', true]], 1);
  eq('yeni indeks aynı metin', await val(), 'ekmek on beş lira');
  await emit([['ekmek on beş lira', true], ['ekmek on beş lira süt yirmi', true]], 1);
  eq('birikmiş sonuç', await val(), 'ekmek on beş lira süt yirmi');
  await emit([['yeni fiş toplam okunmuyor yeni satır', true]], 2);
  eq('komutlar', await val(), 'ekmek on beş lira süt yirmi\n\n=== FİŞ 1 ===\ntoplam [OKUNMUYOR]\n');

  await emit([['kdv yüzde yirmi', false]], 3);
  const n1 = await p.evaluate(() => window.__recs.length);
  await p.evaluate(() => window.__recs[window.__recs.length - 1].end()); await p.waitForTimeout(400);
  eq('interim onend', await val(), 'ekmek on beş lira süt yirmi\n\n=== FİŞ 1 ===\ntoplam [OKUNMUYOR]\nkdv yüzde yirmi');
  eq('otomatik yeniden başladı', await p.evaluate(() => window.__recs.length), n1 + 1);
  eq('tekrar dinliyor', await st(), 'Dinliyor…');

  await p.evaluate(() => { window.__fd.settings.num = true; });
  await emit([['bin iki yüz elli virgül yetmiş beş', true]], 0);
  eq('sayı', (await val()).split(' ').pop(), '1.250,75');

  await p.evaluate(() => { window.__allowAuto = false; window.__recs[window.__recs.length - 1].end(); });
  await p.waitForTimeout(500);
  eq('kırmızı uyarı', await p.$eval('#alert', e => e.classList.contains('show')), true);
  await p.click('#alert'); await p.waitForTimeout(80);
  eq('dokununca kapandı', await p.$eval('#alert', e => e.classList.contains('show')), false);
  eq('dokununca dinliyor', await st(), 'Dinliyor…');

  await p.click('#fis');
  await emit([['simit beş', true]], 1); await p.waitForTimeout(250);
  eq('fiş listesi', (await p.$$eval('#fsel option', o => o.map(x => x.textContent))).join('|'), 'Başlıksız|Fiş 1|Fiş 2');
  eq('fiş 2 metni', await p.evaluate(() => window.__fd.blocks()[2].text), '=== FİŞ 2 ===\nsimit 5');

  await p.click('#mic'); await p.waitForTimeout(80);
  eq('durdu', await st(), 'Hazır');

  await p.evaluate(() => { window.webkitSpeechRecognition.prototype.start = function () { setTimeout(() => { this.onerror({ error: 'not-allowed' }); this.onend(); }, 10); }; });
  await p.click('#mic'); await p.waitForTimeout(100);
  eq('izin hatası Türkçe', (await p.$eval('#err', e => e.textContent)).includes('Mikrofon izni reddedildi'), true);
  eq('kalıcı kayıt', await p.evaluate(() => JSON.parse(localStorage.getItem('fis-dikte-v1')).n), 2);
  eq('SW kayıtlı', await p.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())), true);

  if (process.env.SHOT) { await p.setViewportSize({ width: 440, height: 956 }); await p.screenshot({ path: process.env.SHOT }); }
  eq('sayfa hatası yok', errs.join(';'), '');
  await b.close(); console.log(fail ? fail + ' HATA' : 'hepsi geçti'); process.exit(fail ? 1 : 0);
})();
