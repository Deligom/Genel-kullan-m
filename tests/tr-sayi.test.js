// node tests/tr-sayi.test.js
const { convert, fieldify } = require('../tr-sayi.js');
const cases = [
  ['bin iki yüz elli virgül yetmiş beş', '1.250,75'],
  ['toplam iki yüz on beş lira elli kuruş', 'toplam 215,50 TL'],
  ['kdv yüzde yirmi', 'kdv %20'],
  ['kdv yüzde on sekiz', 'kdv %18'],
  ['bir fiş', 'bir fiş'],
  ['fiş no sıfır beş üç iki', 'fiş no 0532'],
  ['üç bin', '3000'],
  ['elli beş', '55'],
  ['yüz', '100'],
  ['iki milyon üç yüz bin', '2300000'],
  ['250 virgül 75', '250,75'],
  ['1250 virgül 75', '1.250,75'],
  ['on iki adet', '12 adet'],
  ['Bin iki yüz.', '1200.'],
  ['elma virgül armut', 'elma, armut'],
  ['bin dokuz yüz doksan dokuz', '1999'],
  ['yüz beş', '105'],
  ['iki yüz yüz', '200 100'],
  ['bir lira', '1 lira'],
  ['bir virgül beş', '1,5'],
  ['otuz iki virgül sıfır beş', '32,05'],
  ['elli kuruş', '0,50 TL'],
  ['tarih 18.11.2026', 'tarih 18.11.2026'],
  ['ekmek 15 lira', 'ekmek 15 lira'],
  ['yirmi bin beş yüz', '20500'],
  ['bin', '1000'],
  ['dört yüz elli virgül yirmi lira', '450,20 TL'],
  ['250 bin', '250000'],
  ['', ''],
  // --- tuğla sevk fişi ---
  ['şirket mümin kısalık tarih 01092026 palet petek yığma 6 çarpı 229 1374 adet 05 kt 520 plakası',
   'şirket mümin kısalık tarih 01.09.2026 palet petek yığma 6 × 229 = 1374 adet 05 KT 520 plakası'],
  ['tarih sıfır bir sıfır dokuz iki bin yirmi altı', 'tarih 01.09.2026'],
  ['tarih bir eylül iki bin yirmi altı', 'tarih 01.09.2026'],
  ['altı çarpı iki yüz yirmi dokuz bin üç yüz yetmiş dört adet', '6 × 229 = 1374 adet'],
  ['6 çarpı 229 1370 adet', '6 × 229 = 1370 [KONTROL: 6×229=1374] adet'],
  ['6 x 229', '6 × 229'],
  ['sekiz kere iki yüz', '8 × 200'],
  ['sıfır beş ka te beş yüz yirmi', '05 KT 520'],
  ['otuz dört a be bin iki yüz otuz dört plaka', '34 AB 1234 plaka'],
  ['05 KT 520', '05 KT 520'],
  ['bir palet', '1 palet'],
  ['altı palet', '6 palet'],
  ['bin üç yüz yetmiş dört adet', '1374 adet'],
  ['5 kt 520', '5 kt 520'],
];
const fcases = [
  ['şirket mümin kısalık tarih 01.09.2026 palet petek yığma 6 × 229 = 1374 adet 05 KT 520 plakası',
   'şirket: mümin kısalık\ntarih: 01.09.2026\npalet: petek yığma 6 × 229 = 1374 adet\nplaka: 05 KT 520'],
  ['tarih 01.09.2026 6 palet petek', 'tarih: 01.09.2026 6 palet petek'],
  ['Şirket Mümin Kısalık. Tarih 01.09.2026.', 'şirket: Mümin Kısalık.\ntarih: 01.09.2026.'],
  ['şirketi mümin plakası 05 KT 520', 'şirket: mümin\nplaka: 05 KT 520'],
  ['tarih', 'tarih:'],
];
let fail = 0;
for (const [i, e] of cases) {
  const g = convert(i);
  if (g !== e) { fail++; console.log('FAIL', JSON.stringify(i), '=>', JSON.stringify(g), 'beklenen', JSON.stringify(e)); }
}
for (const [i, e] of fcases) {
  const g = fieldify(i).replace(/^\n/, '');
  if (g !== e) { fail++; console.log('FAIL alan', JSON.stringify(i), '=>', JSON.stringify(g), 'beklenen', JSON.stringify(e)); }
}
const total = cases.length + fcases.length;
console.log(total - fail + '/' + total + ' geçti');
process.exit(fail ? 1 : 0);
