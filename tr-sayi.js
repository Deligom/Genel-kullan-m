/* tr-sayi.js — Türkçe yazıyla söylenen sayıları rakama çevirir.
 * "bin iki yüz elli virgül yetmiş beş"      -> "1.250,75"
 * "iki yüz on beş lira elli kuruş"          -> "215,50 TL"
 * "kdv yüzde yirmi"                         -> "kdv %20"
 * "fiş no sıfır beş üç iki"                 -> "fiş no 0532"
 * "tarih 01092026" / "sıfır bir sıfır dokuz iki bin yirmi altı" -> "01.09.2026"
 * "altı çarpı iki yüz yirmi dokuz bin üç yüz yetmiş dört" -> "6 × 229 = 1374" (çarpım tutmazsa [KONTROL] ekler)
 * "sıfır beş ka te beş yüz yirmi plakası"   -> "05 KT 520 plakası"
 * Binlik nokta sadece kuruşlu/TL tutarlarda konur (1374 adet -> 1374).
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

  const MONTHS = { 'ocak': 1, 'şubat': 2, 'mart': 3, 'nisan': 4, 'mayıs': 5, 'haziran': 6, 'temmuz': 7, 'ağustos': 8, 'eylül': 9, 'ekim': 10, 'kasım': 11, 'aralık': 12 };
  // Türkçe harf okunuşları (plaka için)
  const LETTERS = { 'a': 'A', 'be': 'B', 'ce': 'C', 'çe': 'Ç', 'de': 'D', 'e': 'E', 'fe': 'F', 'ge': 'G', 'he': 'H', 'ı': 'I', 'i': 'İ',
    'je': 'J', 'ka': 'K', 'le': 'L', 'me': 'M', 'ne': 'N', 'o': 'O', 'ö': 'Ö', 'pe': 'P', 're': 'R', 'se': 'S', 'şe': 'Ş', 'te': 'T',
    'u': 'U', 'ü': 'Ü', 've': 'V', 'ye': 'Y', 'ze': 'Z' };
  const MULT = ['çarpı', 'carpi', 'kere', 'x', '×', '*'];
  const BIR_OK = ['virgül', 'lira', 'kuruş', 'tl', 'adet', 'kg', 'gr', 'lt', 'tane', 'palet', 'ton', 'paket'];
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

    items = fisStages(items, text);

    const isW = (it, k) => it && it.t === 'w' && it.key === k && !it.post;
    const isWany = (it, k) => it && it.t === 'w' && it.key === k;
    const numStr = it => it.seq != null ? it.seq : (it.digitStr || String(it.val));
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
      if (a.t === 'raw') { out.push({ s: a.s, post: a.post || '' }); continue; }
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
          const keep = !(nx && nx.t === 'w' && BIR_OK.includes(nx.key));
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

  // ---- Sevk fişi aşamaları: tarih, plaka, çarpım ----
  const digitsOf = it => it.seq != null ? it.seq : (it.digitStr != null ? it.digitStr : (it.words ? null : String(it.val)));
  const pad2 = n => (n < 10 ? '0' : '') + n;
  function validDate(d, m, y) { return d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100; }
  function dateFrom8(s) {
    if (!/^\d{8}$/.test(s)) return null;
    const d = +s.slice(0, 2), m = +s.slice(2, 4), y = +s.slice(4);
    return validDate(d, m, y) ? s.slice(0, 2) + '.' + s.slice(2, 4) + '.' + s.slice(4) : null;
  }
  // Tek bir sayı olarak okunabiliyorsa değerini döndür
  function parseOne(words) {
    const it = tokenize(words.join(' '));
    return it.length === 1 && it[0].t === 'num' && !it[0].post ? it[0].val : null;
  }
  function plateLetters(it, loose) {
    if (!it || it.t !== 'w') return null;
    const core = it.s.replace(/[.,;:!?]+$/, '');
    if (LETTERS[it.key] && it.key.length <= 2) return LETTERS[it.key];
    if (/^[A-ZÇĞİÖŞÜ]{1,3}$/u.test(core)) return core;
    if (loose && /^[a-zçğıöşü]{1,3}$/u.test(core)) return core.toLocaleUpperCase('tr-TR');
    return null;
  }
  function fisStages(items, text) {
    const hasPlaka = /plaka/i.test(text);
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const a = items[i], b = items[i + 1], c = items[i + 2];
      // TARİH: 8 haneli "01092026"
      if (a.t === 'num' && digitsOf(a) && dateFrom8(digitsOf(a))) { out.push({ t: 'raw', s: dateFrom8(digitsOf(a)), post: a.post }); continue; }
      // TARİH: "0109" + "2026"
      if (a.t === 'num' && !a.post && b && b.t === 'num' && /^\d{4}$/.test(digitsOf(a) || '') && b.val >= 1900 && b.val <= 2100) {
        const d = digitsOf(a); const r = dateFrom8(d + b.val);
        if (r) { out.push({ t: 'raw', s: r, post: b.post }); i += 1; continue; }
      }
      // TARİH: "bir eylül iki bin yirmi altı"
      if (a.t === 'num' && !a.post && b && b.t === 'w' && MONTHS[b.key.replace(/[.,]$/, '')] && c && c.t === 'num' && validDate(a.val, MONTHS[b.key.replace(/[.,]$/, '')], c.val)) {
        out.push({ t: 'raw', s: pad2(a.val) + '.' + pad2(MONTHS[b.key.replace(/[.,]$/, '')]) + '.' + c.val, post: c.post }); i += 2; continue;
      }
      // PLAKA: il kodu (01-81) + 1-3 harf + 1-4 hane
      if (a.t === 'num' && !a.post && a.val >= 1 && a.val <= 81) {
        const ilStr = digitsOf(a);
        const il = ilStr && ilStr.length === 2 ? ilStr : (a.words ? pad2(a.val) : null);
        if (il) {
          let j = i + 1, let_ = '';
          while (j < items.length && let_.length < 3) {
            const L = plateLetters(items[j], hasPlaka); if (!L) break;
            let_ += L; j++; if (items[j - 1].post) break;
          }
          const n = items[j];
          if (let_ && let_.length <= 3 && n && n.t === 'num' && n.val >= 1 && n.val <= 9999 && !items[j - 1].post) {
            out.push({ t: 'raw', s: il + ' ' + let_ + ' ' + (digitsOf(n) || String(n.val)), post: n.post }); i = j; continue;
          }
        }
      }
      // ÇARPIM: A çarpı B [C]  — "229 1374" tek sayı gibi okunduysa böl
      if (a.t === 'num' && !a.post && b && b.t === 'w' && MULT.includes(b.key) && !b.post && c && c.t === 'num') {
        const A = a.val; let B = c.val, C = null, used = 2;
        const d = items[i + 3];
        if (!c.post && d && d.t === 'num') { C = d.val; used = 3; }
        else if (c.rawWords && c.rawWords.length >= 2) {
          for (let k = 1; k < c.rawWords.length; k++) {
            const b1 = parseOne(c.rawWords.slice(0, k)), c1 = parseOne(c.rawWords.slice(k));
            if (b1 != null && c1 != null && A * b1 === c1) { B = b1; C = c1; break; }
          }
        } else if (c.digitStr && c.digitStr.length >= 3) {
          for (let k = 1; k < c.digitStr.length; k++) {
            const b1 = +c.digitStr.slice(0, k), c1 = +c.digitStr.slice(k);
            if (c.digitStr[k] !== '0' && A * b1 === c1) { B = b1; C = c1; break; }
          }
        }
        let s = A + ' × ' + B + (C != null ? ' = ' + C : '');
        if (C != null && A * B !== C) s += ' [KONTROL: ' + A + '×' + B + '=' + (A * B) + ']';
        out.push({ t: 'raw', s, post: (used === 3 ? items[i + 3] : c).post }); i += used; continue;
      }
      out.push(a);
    }
    return out;
  }

  // Alanları satıra böl: "şirket ..." -> "\nşirket: ...", "05 KT 520 plakası" -> "\nplaka: 05 KT 520"
  const DEFAULT_FIELDS = 'şirket, firma, müşteri, tarih, palet, ürün, plaka, şoför, irsaliye, fiş no';
  function fieldify(text, fieldWords) {
    const esc = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const kws = (fieldWords == null ? DEFAULT_FIELDS : fieldWords).split(',').map(w => w.trim()).filter(Boolean);
    let s = ' ' + text + ' ';
    const plates = [];
    s = s.replace(/(\d{2} [A-ZÇĞİÖŞÜ]{1,3} \d{1,4}) plaka(?:sı|lı)?(?![\p{L}\p{N}])/gu, (m, p) => { plates.push(p); return '\u0001' + (plates.length - 1) + '\u0001'; });
    for (const kw of kws) {
      // önünde sayı varsa ("6 palet") alan değil, miktardır
      const re = new RegExp('(?<![\\p{L}\\p{N}])(?<!(?:^|\\s)\\d+ )(' + esc(kw) + ')(?:s?[ıiuü])?(?![\\p{L}\\p{N}:])\\s*:?\\s*', 'giu');
      s = s.replace(re, (m, k) => '\n' + lower(k) + ': ');
    }
    s = s.replace(/\u0001(\d+)\u0001/g, (m, k) => '\nplaka: ' + plates[+k]);
    return s.replace(/[ \t]*\n[ \t]*/g, '\n').replace(/\n{2,}/g, '\n').replace(/^ +| +$/g, '').replace(/: (?=\n|$)/g, ':');
  }

  const api = { convert, fmtInt, fieldify, DEFAULT_FIELDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TrSayi = api;
})(typeof window !== 'undefined' ? window : globalThis);
