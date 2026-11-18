# ROADMAP — Fiş Dikte

## Durum
**v1.0.0** — PWA + iOS sağlamlaştırma tamam, sahte tanıyıcıyla testler geçiyor. **iPhone'da gerçek test bekliyor.**

## Yapıldı (v1.0.0)
- [x] Tek dosyalık `fis-dikte-offline.html` → GitHub Pages'e uygun PWA (manifest, apple-touch-icon, apple meta'ları, service worker ile çevrimdışı açılış)
- [x] iOS: `onend`'de her seferinde yeni tanıyıcı örneğiyle otomatik yeniden başlatma
- [x] iOS: otomatik başlatma reddedilince / `onstart` gelmeyince / art arda hızlı kapanmada tam ekran kırmızı uyarı, tek dokunuşla devam
- [x] iOS: tekrar eden ve birikmiş final sonuçların engellenmesi (indeks + son metin karşılaştırması), ayardan aç/kapa
- [x] iOS: final olmadan kapanan son parçanın kaybolmaması
- [x] Titreşim yerine AudioContext bip (ilk dokunuşta açılır), "Sesi test et" butonu
- [x] Türkçe hata mesajları: not-allowed, service-not-allowed, network, audio-capture, language-not-supported
- [x] Türkçe sayı → rakam (virgül, lira/kuruş, yüzde, rakam rakam okuma), ayardan aç/kapa, varsayılan kapalı
- [x] "okunmuyor" komutu ve butonu → `[OKUNMUYOR]`
- [x] "Fiş fiş kopyala": açılır listeden seçilen fişi kopyala; imleç hangi fişteyse liste ona geçer
- [x] Tanılama günlüğü + "Günlüğü kopyala"
- [x] Türkçe karakterlerde çalışmayan `\b` komut regex hatası düzeltildi ("yeni fiş" eskiden algılanmıyordu)
- [x] Safe-area (çentik / ana ekran çubuğu) boşlukları

## Sıradaki (iPhone testinden sonra önceliklendir)
- [ ] iPhone 17 Pro Max'te gerçek test sonuçlarını buraya işle (README'deki kontrol listesi)
- [ ] Tekrar engelleme eşikleri (1,5 sn / 5 sn) gerçek kullanıma göre ayarlanmalı; aynı tutarı art arda okurken kayıp var mı?
- [ ] Ana ekran (standalone) modunda ses tanıma çalışmıyorsa: README'de "Safari sekmesinden kullan" diye netleştir
- [ ] Sessiz modda bip duyulmuyor → `navigator.audioSession.type` denemesi (ses tanımayı bozmadığı doğrulanmalı)
- [ ] Sayılar: yıl gibi 4 haneli sayılar "2.026" olur → "tarih" kelimesinden sonra binlik ayırıcı koyma
- [ ] Sayılar: "nokta" → "." ve tarih okuma ("on sekiz on bir iki bin yirmi altı" → 18.11.2026)
- [ ] "Claude için kopyala": metnin başına analiz talimatı ekleyerek kopyalama
- [ ] Fiş başına satır/tutar toplamı kontrolü (okunan TOPLAM ile kalemlerin toplamı tutuyor mu)
- [ ] Metni .txt olarak paylaş (Web Share API)

## Fikirler (belki)
- Fotoğrafı sayfada yanında gösterme (fiş görüntüsüne bakarken okumak için)
- Birden fazla oturum / geçmiş arşivi

## Değişiklik kaydı
- **1.0.0** (2026-11-18) — İlk PWA sürümü.
