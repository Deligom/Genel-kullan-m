/* tr-sayi.js — Türkçe yazıyla söylenen sayıları rakama çevirir.
 * "bin iki yüz elli virgül yetmiş beş"      -> "1.250,75"
 * "iki yüz on beş lira elli kuruş"          -> "215,50 TL"
 * "kdv yüzde yirmi"                         -> "kdv %20"
 * "fiş no sıfır beş üç iki"                 -> "fiş no 0532"
 * Tek başına "bir" kelime olarak kalır ("bir fiş" bozulmaz).
 * Tarayıcıda window.TrSayi, Node'da module.exports.
 */
(function (root) {
  'use strict';
  const UNITS = { 'sıfır': 0, 'bir': 1, 'iki': 2, 'üç': 3, 'dört': 4, 'beş': 5, 'altı': 6, 'yedi': 7, 'sekiz': 8, 'dokuz': 9 };
  const TENS = { 'on': 10, 'yirmi': 20, 'otuz': 30, 'kırk': 40, 'elli': 50, 'altmış': 60, 'yetmiş': 70, 'seksen': 80, 'doksan': 90 };
  const BIG = { 'bin': 1e3, 'milyon': 1e6, 'milyar': 1e9 };
  // Tanıyıcının bazen Türkçe karakterleri düşürmesine karşı
  const ALIAS = { 'sifir': 'sıfır', 'uc': 'üç', 'dort': 'dört', 'bes': 'beş', 'alti': 'altı', 'kirk': 'kırk',
    'altmis': 'altmış', 'yetmis': 'yetmiş', 'yuz': 'yüz', 'virgul': 'virgül', 'yuzde': 'yüzde', 'kurus': 'kuruş' };

  const lower = s => s.toLocaleLowerCase('tr-TR');
  const fmtInt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  function splitTok(raw) {
    const m = raw.match(/^([("'“‘]*)(.*?)([.,;:!?)"'”’]*)$/u);
    const core = m[2];
    let key = lower(core);
    if (ALIAS[key]) key = ALIAS[key];
    return { raw, pre: m[1], core, key, post: m[3] };
  }

  function classify(tok) {
    const k = tok.key;
    if (k === 'sıfır') return { cls: 'z', val: 0 };
    if (k in UNITS) return { cls: 'u', val: UNITS[k] };
    if (k in TENS) return { cls: 't', val: TENS[k] };
    if (k === 'yüz') return { cls: 'h', val: 100 };
    if (k in BIG) return { cls: 'k', val: BIG[k] };
    if (/^\d+$/.test(tok.core)) return { cls: 'd', val: parseInt(tok.core, 10), digits: tok.core };
    if (/^\d{1,3}(\.\d{3})+$/.test(tok.core)) return { cls: 'd', val: parseInt(tok.core.replace(/\./g, ''), 10), digits: tok.core.replace(/\./g, '') };
    return null;
  }

  // Ham kelimeleri { t:'num' | 'w' } öğelerine dönüştür
  function tokenize(text) {
    const toks = text.trim().split(/\s+/).filter(Boolean).map(splitTok);
    const items = [];
    let st = null; // açık sayı durumu

    function close() {
      if (!st) return;
      items.push({
        t: 'num', val: st.total + st.current, words: st.words, n: st.toks.length,
        digitStr: st.digitStr, single: st.toks.length === 1 && (st.first === 'u' || st.first === 'z'),
        rawWords: st.toks.map(x => x.core), post: st.post, pre: st.pre
      });
      st = null;
    }
    function allowed(c) {
      if (!st) return true;
      const L = st.last;
      if (L === 'z') return false;
      if (L === 'd') return c.cls === 'k' && st.current < 1000 && (st.lastBig == null || c.val < st.lastBig);
      switch (c.cls) {
        case 'z': case 'd': return false;
        case 'u': return L !== 'u' && st.current % 10 === 0;
        case 't': return (L === 'h' || L === 'k') && st.current % 100 === 0;
        case 'h': return L === 'k' || (L === 'u' && st.current < 10);
        case 'k': return st.lastBig == null || c.val < st.lastBig;
      }
      return false;
    }
    function add(c, tok) {
      if (!st) st = { total: 0, current: 0, last: null, lastBig: null, words: false, toks: [], first: c.cls, pre: tok.pre, post: '' };
      st.toks.push(tok);
      if (c.cls !== 'd') st.words = true;
      switch (c.cls) {
        case 'z': case 'u': case 't': st.current += c.val; break;
        case 'd': st.current = c.val; st.digitStr = c.digits; break;
        case 'h': st.current = (st.current || 1) * 100; break;
        case 'k': st.total += (st.current || 1) * c.val; st.current = 0; st.lastBig = c.val; st.digitStr = null; break;
      }
      st.last = c.cls;
    }

    for (const tok of toks) {
      const c = classify(tok);
      if (c && !tok.pre) {
        if (!allowed(c)) close();
        add(c, tok);
        if (tok.post) { st.post = tok.post; close(); }
      } else {
        close();
        items.push({ t: 'w', s: tok.raw, key: tok.key, post: tok.post });
      }
    }
    close();
    return items;
  }

  function convert(text) {
    if (!text || !text.trim()) return text;
    let items = tokenize(text);

    // 1) Rakam rakam söylenenler: "sıfır beş üç iki" -> 0532
    const merged = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.t === 'num' && it.single && !it.post) {
        let j = i, s = '';
        while (j < items.length && items[j].t === 'num' && items[j].single) {
          s += String(items[j].val);
          if (items[j].post) { j++; break; }
          j++;
        }
        if (j - i >= 2) {
          merged.push({ t: 'num', val: parseInt(s, 10), seq: s, words: true, post: items[j - 1].post, pre: it.pre });
          i = j - 1; continue;
        }
      }
      merged.push(it);
    }
    items = merged;

    const isW = (it, k) => it && it.t === 'w' && it.key === k && !it.post;
    const isWany = (it, k) => it && it.t === 'w' && it.key === k;
    const numStr = it => it.seq != null ? it.seq : (it.words || it.val >= 10000 ? fmtInt(it.val) : (it.digitStr || String(it.val)));
    const decStr = it => it.seq != null ? it.seq : String(it.val);
    const pad2 = n => (n < 10 ? '0' : '') + n;

    // 2) virgül / lira-kuruş / yüzde birleştirme
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      // yüzde X -> %X
      if (isW(a, 'yüzde') && items[i + 1] && items[i + 1].t === 'num') {
        const b = items[i + 1];
        if (isWany(items[i + 2], 'virgül') && !b.post && items[i + 3] && items[i + 3].t === 'num') {
          const c = items[i + 3];
          out.push({ s: '%' + numStr(b) + ',' + decStr(c), post: c.post }); i += 3; continue;
        }
        out.push({ s: '%' + numStr(b), post: b.post }); i += 1; continue;
      }
      if (a.t === 'num' && !a.post) {
        const b = items[i + 1], c = items[i + 2], d = items[i + 3];
        // X virgül Y
        if (isW(b, 'virgül') && c && c.t === 'num') {
          const s = fmtInt(a.val) + ',' + decStr(c);
          if (!c.post && isWany(d, 'lira')) { out.push({ s: s + ' TL', post: d.post }); i += 3; continue; }
          out.push({ s, post: c.post }); i += 2; continue;
        }
        // X lira Y kuruş
        if (isW(b, 'lira') && c && c.t === 'num' && !c.post && isWany(d, 'kuruş')) {
          out.push({ s: fmtInt(a.val) + ',' + pad2(c.val % 100) + ' TL', post: d.post }); i += 3; continue;
        }
        // Y kuruş (tek başına)
        if (isWany(b, 'kuruş') && a.val < 100 && !(out.length && /TL$/.test(out[out.length - 1].s))) {
          out.push({ s: '0,' + pad2(a.val) + ' TL', post: b.post }); i += 1; continue;
        }
      }
      if (a.t === 'num') {
        // tek başına "bir" kelime olarak kalsın
        if (a.n === 1 && a.single && a.val === 1 && a.words && a.seq == null) {
          const nx = items[i + 1];
          const keep = !(nx && nx.t === 'w' && ['virgül', 'lira', 'kuruş', 'tl', 'adet', 'kg', 'gr', 'lt', 'tane'].includes(nx.key));
          if (keep) { out.push({ s: (a.pre || '') + a.rawWords[0], post: a.post }); continue; }
        }
        out.push({ s: (a.pre || '') + numStr(a), post: a.post });
        continue;
      }
      // kalan "virgül" -> önceki kelimeye ","
      if (isWany(a, 'virgül')) {
        if (out.length) { const p = out[out.length - 1]; p.post = (p.post || '') + ','; }
        else out.push({ s: ',', post: '' });
        if (a.post) out[out.length - 1].post += a.post;
        continue;
      }
      out.push({ s: a.s, post: '' });
    }
    return out.map(o => o.s + (o.post || '')).join(' ').replace(/,,+/g, ',');
  }

  const api = { convert, fmtInt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TrSayi = api;
})(typeof window !== 'undefined' ? window : globalThis);
