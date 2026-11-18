# ROADMAP — Fiş Dikte

## Durum
**v1.1.0** — Tuğla sevk fişine uyarlandı. PWA + iOS sağlamlaştırma tamam, sahte tanıyıcıyla testler geçiyor. **iPhone'da gerçek test bekliyor.**

## Yapıldı (v1.1.0) — tuğla sevk fişi
- [x] Tarih: "01092026", "sıfır bir sıfır dokuz iki bin yirmi altı", "bir eylül iki bin yirmi altı" → 01.09.2026
- [x] Palet: "6 çarpı 229 1374" → `6 × 229 = 1374`; yazıyla "iki yüz yirmi dokuz bin üç yüz yetmiş dört" 229374 sanılmaz, çarpıma göre bölünür; tutmazsa `[KONTROL: 6×229=1374]`
- [x] Plaka: "05 kt 520 plakası", "sıfır beş ka te beş yüz yirmi" → 05 KT 520
- [x] Binlik nokta sadece kuruşlu tutarlarda (1374 adet)
- [x] "Alanları satıra böl" ayarı + düzenlenebilir alan kelimeleri (şirket, tarih, palet, plaka …)

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
- [ ] iPhone tanıyıcısı "01092026"yı nasıl veriyor? (tek sayı / "01 09 2026" / yazıyla) — günlükten bakıp kuralları ayarla
- [ ] Plaka ile "plakası" ayrı cümlelere bölünürse (araya duraksama) küçük harfli "kt" plaka sayılmıyor → önceki parçaya bakan kural
- [ ] Tarih: "on sekiz on bir iki bin yirmi altı" (gün ay yıl yazıyla) → 18.11.2026
- [ ] Palet tipleri sözlüğü (petek, yığma, …) — tanıyıcının yanlış duyduğu kelimeleri düzeltme
- [ ] "Claude için kopyala": fişleri tablo halinde analiz ettirecek hazır talimatla kopyalama
- [ ] "Claude için kopyala": metnin başına analiz talimatı ekleyerek kopyalama
- [ ] Gün sonu özeti: şirket bazında toplam palet / adet
- [ ] Metni .txt olarak paylaş (Web Share API)

## Fikirler (belki)
- Fotoğrafı sayfada yanında gösterme (fiş görüntüsüne bakarken okumak için)
- Birden fazla oturum / geçmiş arşivi

## Değişiklik kaydı
- **1.1.0** (2026-11-18) — Tuğla sevk fişi: tarih, plaka, palet çarpımı kontrolü, alanları satıra böl.
- **1.0.0** (2026-11-18) — İlk PWA sürümü.
