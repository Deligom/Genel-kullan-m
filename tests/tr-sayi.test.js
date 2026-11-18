// node tests/tr-sayi.test.js
const { convert } = require('../tr-sayi.js');
const cases = [
  ['bin iki yüz elli virgül yetmiş beş', '1.250,75'],
  ['toplam iki yüz on beş lira elli kuruş', 'toplam 215,50 TL'],
  ['kdv yüzde yirmi', 'kdv %20'],
  ['kdv yüzde on sekiz', 'kdv %18'],
  ['bir fiş', 'bir fiş'],
  ['fiş no sıfır beş üç iki', 'fiş no 0532'],
  ['üç bin', '3.000'],
  ['elli beş', '55'],
  ['yüz', '100'],
  ['iki milyon üç yüz bin', '2.300.000'],
  ['250 virgül 75', '250,75'],
  ['1250 virgül 75', '1.250,75'],
  ['on iki adet', '12 adet'],
  ['Bin iki yüz.', '1.200.'],
  ['elma virgül armut', 'elma, armut'],
  ['bin dokuz yüz doksan dokuz', '1.999'],
  ['yüz beş', '105'],
  ['iki yüz yüz', '200 100'],
  ['bir lira', '1 lira'],
  ['bir virgül beş', '1,5'],
  ['otuz iki virgül sıfır beş', '32,05'],
  ['elli kuruş', '0,50 TL'],
  ['tarih 18.11.2026', 'tarih 18.11.2026'],
  ['ekmek 15 lira', 'ekmek 15 lira'],
  ['yirmi bin beş yüz', '20.500'],
  ['bin', '1.000'],
  ['dört yüz elli virgül yirmi lira', '450,20 TL'],
  ['250 bin', '250.000'],
  ['', ''],
];
let fail = 0;
for (const [i, e] of cases) {
  const g = convert(i);
  if (g !== e) { fail++; console.log('FAIL', JSON.stringify(i), '=>', JSON.stringify(g), 'beklenen', JSON.stringify(e)); }
}
console.log(cases.length - fail + '/' + cases.length + ' geçti');
process.exit(fail ? 1 : 0);
