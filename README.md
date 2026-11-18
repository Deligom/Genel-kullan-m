# Fiş Dikte

Tuğla tırlarının sevk fişlerini sesli oku, sayfa Türkçe olarak yazıya döksün; sonra kopyalayıp Claude'a ver.
iPhone Safari için hazırlanmış, ana ekrana eklenebilen bir PWA.

## iPhone'da kurulum
1. Safari'de yayın adresini aç (ör. `https://<kullanıcı>.github.io/fis-dikte/`).
2. İlk "🎙 Başla"da mikrofon ve ses tanıma iznini **İzin Ver**.
   Her seferinde sormasın diye: adres çubuğundaki **aA › Web Sitesi Ayarları › Mikrofon › İzin Ver**.
3. Ana ekrana ekle: **Paylaş › Ana Ekrana Ekle**.
4. Ön koşullar: Ayarlar › Genel › Klavye › **Dikteyi Etkinleştir** açık, klavyelerde **Türkçe** var, Siri açık.

## iPhone'da test (5 dakika)
Önce **Safari sekmesinde**, sonra **ana ekran simgesinden** aynı adımları dene:

| # | Ne yap | Beklenen |
|---|---|---|
| 1 | Başla'ya bas, "palet petek yığma" de | Metin bir kez yazılır (iki kez değil) |
| 2 | 5–10 sn sus, sonra tekrar konuş | Durum "Yeniden başlatılıyor…" → "Dinliyor…", konuşma yazılır. Olmazsa ekran kırmızı yanıp söner + bip; dokununca devam etmeli |
| 3 | "yeni fiş", "yeni satır", "okunmuyor", "sil son" de | Başlık / alt satır / [OKUNMUYOR] / son parça silinir |
| 4 | Ayarlar › **Sayıları rakama çevir** ve **Alanları satıra böl**'ü aç. "şirket mümin kısalık tarih sıfır bir sıfır dokuz iki bin yirmi altı palet petek yığma altı çarpı iki yüz yirmi dokuz bin üç yüz yetmiş dört adet sıfır beş ka te beş yüz yirmi plakası" de | Dört satır: `şirket: mümin kısalık` / `tarih: 01.09.2026` / `palet: petek yığma 6 × 229 = 1374 adet` / `plaka: 05 KT 520` |
| 5 | İki fiş oluştur, listeden "Fiş 1" seç, "Bu fişi kopyala", Notlar'a yapıştır | Sadece Fiş 1 gelir |
| 6 | Uçak modunu aç, sayfayı kapatıp yeniden aç | Arayüz ve metin açılır; Başla'da Türkçe "internet yok" hatası |
| 7 | Ayarlar › Sesi test et (sessiz mod kapalı) | Bip duyulur |

Bir şey ters giderse: **Ayarlar › Günlüğü kopyala** ve çıktıyı Claude'a yapıştır.

## Geliştirme
Bkz. [CLAUDE.md](CLAUDE.md) ve [ROADMAP.md](ROADMAP.md).
