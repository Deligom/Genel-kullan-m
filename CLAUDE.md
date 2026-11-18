# CLAUDE.md — Fiş Dikte

## Ne bu?
Muhasebe fişlerini sesli okuyup Türkçe metne çeviren, iPhone Safari'de çalışan tek sayfalık PWA.
Metin kopyalanıp analiz için Claude'a verilir. GitHub Pages'te statik olarak yayınlanır; sunucu, derleme, bağımlılık yok.

## Dosyalar
| Dosya | Görev |
|---|---|
| `index.html` | Arayüz + tüm uygulama mantığı (ses tanıma, komutlar, tekrar engelleme, uyarı, kopyalama, ayarlar) |
| `tr-sayi.js` | Türkçe yazıyla sayı → rakam (`TrSayi.convert`). Tarayıcıda `window.TrSayi`, Node'da `module.exports` |
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
- Sayı dönüştürme **varsayılan kapalı** (ham metni bozmamak için); sadece yeni dikteye uygulanır.

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
