# CLAUDE.md — Fiş Dikte

## Ne bu?
Tuğla satışında gönderilen **tırın sevk fişlerini** sesli okuyup Türkçe metne çeviren, iPhone Safari'de çalışan tek sayfalık PWA.
Metin kopyalanıp analiz için Claude'a verilir. GitHub Pages'te statik olarak yayınlanır; sunucu, derleme, bağımlılık yok.

## Fiş tipi
Market fişi değil, tuğla sevk fişi. Tipik okuma:
`şirket mümin kısalık tarih 01092026 palet petek yığma 6 çarpı 229 1374 adet 05 kt 520 plakası`
Sayı çevirme + alan bölme açıkken çıktı:
```
şirket: mümin kısalık
tarih: 01.09.2026
palet: petek yığma 6 × 229 = 1374 adet
plaka: 05 KT 520
```
Alanlar: şirket/müşteri, tarih (GGAAYYYY), palet tipi (petek, yığma…), palet × adet = toplam adet, plaka (il kodu + harf + numara).

## Dosyalar
| Dosya | Görev |
|---|---|
| `index.html` | Arayüz + tüm uygulama mantığı (ses tanıma, komutlar, tekrar engelleme, uyarı, kopyalama, ayarlar) |
| `tr-sayi.js` | `TrSayi.convert`: yazıyla sayı → rakam, tarih, plaka, çarpım kontrolü. `TrSayi.fieldify`: alanları satıra böler. Tarayıcıda `window.TrSayi`, Node'da `module.exports` |
| `sw.js` | Service worker: sayfa ağ-önce, diğer dosyalar önbellek-önce. **Her yayında `CACHE` sürümünü artır** |
| `manifest.json` | PWA tanımı (Türkçe ad, standalone, koyu tema, ikonlar) |
| `icons/` | apple-touch-icon (180), 192, 512, maskable 512, favicon 32 |
| `tests/tr-sayi.test.js` | Sayı dönüştürücü birim testleri (`node tests/tr-sayi.test.js`) |
| `tests/ios-sim.test.js` | Sahte SpeechRecognition ile iOS davranışlarının Playwright testi |

## Kurallar
- **Derleme adımı yok.** Düz HTML/CSS/JS kalsın; framework, npm paketi ekleme.
- Arayüz metinleri ve hata mesajları **Türkçe**.
- Göreli yollar kullan (`./`, `sw.js`) — site `/<repo>/` alt yolunda yayınlanıyor.
- `localStorage` anahtarları: `fis-dikte-v1` (metin + fiş sayısı), `fis-dikte-ayar-v1` (ayarlar). Biçim değişirse göç kodu yaz, kullanıcının metnini silme.
- Sürüm değişince üç yeri birlikte güncelle: `index.html` içindeki `APP_VER`, `sw.js` içindeki `CACHE`, ROADMAP'teki değişiklik kaydı.
- Sayı dönüştürme ve alan bölme **varsayılan kapalı** (ham metni bozmamak için); sadece yeni dikteye uygulanır.
- Binlik nokta sadece kuruşlu/TL tutarlarda (adetler `1374` kalır, fişte öyle yazıyor).
- "A çarpı N" de N iki sayıya bölünebiliyorsa (`229 1374`, ya da yazıyla "iki yüz yirmi dokuz bin üç yüz yetmiş dört") A×B=C tutan bölme seçilir; C tutmazsa `[KONTROL: …]` eklenir — bu etiketi asla sessizce düzeltme, analizde işaret olarak kullanılıyor.
- Önünde düz sayı olan alan kelimesi ("6 palet") alan başlığı sayılmaz.

## iOS ses tanıma — bilinen tuzaklar (kodda karşılıkları)
- `continuous=true` güvenilmez; sessizlikte `onend` gelir → `onend`'de 250 ms sonra **yeni bir** `SpeechRecognition` örneğiyle yeniden başlat.
- Kullanıcı hareketi olmadan `start()` reddedilebilir (`not-allowed`/`service-not-allowed` veya `onstart` hiç gelmez) → tam ekran kırmızı uyarı + bip, dokununca devam. Dokunuşla başlatılmışken gelen `not-allowed` gerçek izin reddidir → kalıcı Türkçe hata.
- Aynı final sonuç tekrar gelir / sonuçlar birikir → (1) indeks bazlı `committed` haritası, (2) son finalle karşılaştırma: aynı metin 1,5 sn içinde atlanır, birikmiş önek 5 sn içinde kırpılır. Ayarlardan kapatılabilir.
- Son parça bazen final olmadan oturum kapanır → `onend`'de bekleyen interim yazılır.
- `navigator.vibrate` yok → AudioContext ilk "Başla" dokunuşunda açılır, uyarıda bip çalınır (sessiz mod açıksa duyulmaz).
- Türkçe harflerde regex `\b` çalışmaz → komut regex'i `(?<![\p{L}\p{N}])…(?![\p{L}\p{N}])` kullanır.
- Ana ekrandan (standalone) açılınca bazı iOS sürümlerinde `webkitSpeechRecognition` yok → sayfa uyarı gösterip Safari'de açma bağlantısı verir.

## Test
```bash
node tests/tr-sayi.test.js
python3 -m http.server 8765        # ayrı terminal
node tests/ios-sim.test.js         # Playwright gerekir
```
Gerçek doğrulama sadece iPhone'da yapılabilir (README › iPhone'da test). Ayarlar › Tanılama günlüğü olay sırasını gösterir; "Günlüğü kopyala" ile hata raporu alınır.

## Yayın
`main` dalına push → GitHub Pages (Settings › Pages › Deploy from branch › main / root) birkaç dakikada yayınlar.
