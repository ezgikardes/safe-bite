# SafeBites Backend — Tasarım Dokümanı (Spec)

**Tarih:** 2026-07-04
**Proje:** SafeBites (React + TypeScript + Vite food-safety uygulaması)
**Durum:** Onaylandı — implementasyon planına hazır

---

## 1. Amaç ve Bağlam

SafeBites şu an kullanıcı verilerini (favori ürünler ve kişisel tetikleyici/trigger malzemeler) **tarayıcının `localStorage`'ında** tutuyor. Bu, verinin cihaza bağlı kalması ve kullanıcı hesabı olmaması anlamına geliyor.

**Hedef:** Gerçek bir backend eklemek — yani:
- Kullanıcı **kaydı ve girişi (auth)**,
- Her kullanıcının **trigger** ve **favori ürünlerini** bir veritabanında, hesabına bağlı olarak saklamak.

**Kişisel hedefler (bu tasarımı yönlendiren):**
- **Öğrenme + çalışan ürün dengesi** — hem gerçek çalışan bir şey, hem de ne olduğunu anlayarak ilerlemek.
- **CV değeri** — işverene gösterilebilecek gerçek bir full-stack proje.
- Geliştiricinin mevcut **Java / Spring Boot / SQL** bilgisini kullanmak.

---

## 2. Seçilen Stack ve Gerekçe

**Spring Boot (Java) REST API + PostgreSQL + mevcut React (Vite) frontend.** Hepsi tek repo (monorepo).

**Gerekçe:**
- Geliştiricinin bildiği Java/Spring Boot/SQL'i kullanır → sıfırdan öğrenme değil, uygulama.
- React ↔ kendi API'n ↔ Postgres **entegrasyonunu** bizzat öğretir (gerçek dünyada en yaygın mimari).
- Güçlü, gösterilebilir bir full-stack portfolyo parçası çıkar.

**Değerlendirilip elenen alternatifler:**
- **Supabase / BaaS:** En az kodla en hızlı sonuç verirdi, ama backend'i geliştiricinin yerine yazdığı için Java/Spring bilgisini kullanmaz ve öğrenme/CV katkısı düşük olurdu.
- **Next.js'e taşımak:** Sadece "framework katmanı"nı (Katman 2) değiştirir; auth+DB yine ayrıca kurulurdu. Java'da zaten bilinen backend'i yeni bir JS ekosisteminde tekrar öğrenmek olurdu — şu an en düşük kaldıraç.

---

## 3. Mimari

```
[ React (Vite) frontend ]  ──HTTP / JSON──►  [ Spring Boot API ]  ──JPA / SQL──►  [ PostgreSQL ]
   frontend/ klasörü                            backend/ klasörü                    users
   - auth token'ı saklar                        - Spring Security + JWT             triggers
   - her istekte gönderir                       - iş kuralları                      favorites
```

- **Frontend (istemci):** Kullanıcı arayüzü. Hassas hiçbir karar burada verilmez; sadece API'den ister.
- **Backend (sunucu):** Auth, yetkilendirme ve tüm iş kuralları burada. Verinin sahibi kim, kim ne görebilir → backend karar verir.
- **Database:** Kalıcı veri. Kullanıcılar ve onlara bağlı trigger/favori kayıtları.

---

## 4. Repo Yapısı — Monorepo

```
safe-bites/
├── frontend/        ← mevcut React (Vite) uygulaması buraya taşınır
├── backend/         ← yeni Spring Boot API
└── docs/            ← tasarım/plan dokümanları (mevcut)
```

- Tek GitHub linki = tüm full-stack proje (CV için ideal).
- Mevcut React kodu kök dizinden `frontend/` altına taşınır.
- Deploy sırasında her servise "base directory" belirtilir (Netlify/Vercel/Render bunu destekler).

---

## 5. Veri Modeli (PostgreSQL)

Üç tablo. **Kendi domain verisi normalize** (veri tekrar etmeyecek şekilde ilişkili tablolara bölünmüş; her bilgi tek yerde durur, tablolar `user_id` gibi foreign key'lerle bağlanır), **dış API snapshot'ı JSONB**.

### `users`
| Sütun | Tip | Not |
|-------|-----|-----|
| `id` | BIGINT (PK, auto) | |
| `email` | VARCHAR, **UNIQUE**, NOT NULL | |
| `password_hash` | VARCHAR, **NULL olabilir** | Sadece-Google kullanıcısında boş |
| `google_id` | VARCHAR, **NULL olabilir**, UNIQUE | Email/şifre kullanıcısında boş |
| `created_at` | TIMESTAMP | |

### `triggers`
| Sütun | Tip | Not |
|-------|-----|-----|
| `id` | BIGINT (PK, auto) | |
| `user_id` | BIGINT (FK → users.id), NOT NULL | |
| `name` | VARCHAR, NOT NULL | Tetikleyici malzeme metni |
| `created_at` | TIMESTAMP | |

**Kısıt:** `UNIQUE (user_id, name)` — aynı kullanıcı aynı trigger'ı iki kez ekleyemez.

### `favorites`
| Sütun | Tip | Not |
|-------|-----|-----|
| `id` | BIGINT (PK, auto) | |
| `user_id` | BIGINT (FK → users.id), NOT NULL | |
| `code` | VARCHAR, NOT NULL | Ürün barkodu |
| `product_data` | **JSONB**, NOT NULL | Ürünün tamamı (frontend `Product` tipiyle birebir) |
| `created_at` | TIMESTAMP | |

**Kısıt:** `UNIQUE (user_id, code)` — aynı ürün bir kullanıcıda bir kez.

**Neden `product_data` JSONB?** Ürün verisi dışarıdan (Open Food Facts) gelen, şeması bize ait olmayan, onlarca opsiyonel alanı olan ve **bütün olarak gösterilen** bir snapshot. İçine sorgu atmıyoruz. Bu, JSONB'nin doğru olduğu klasik durum; frontend'in elindeki `Product` nesnesi olduğu gibi saklanıp geri döndürülür (frontend'de dönüşüm gerekmez). Java tarafında `@JdbcTypeCode(SqlTypes.JSON)` ile eşlenir.

> Kabul edilen ödün: Ürün OFF'ta güncellenirse saklanan kopya "donmuş" kalır. Hobi/portfolyo projesi için kabul edilebilir.

---

## 6. Auth Tasarımı

İki aşamalı. **Önce email+şifre+JWT çalışır hâle gelir; sonra Google eklenir.**

### Aşama 1 — Email + Şifre + JWT
- **Kayıt (`POST /api/auth/register`):** Email + şifre alınır. Şifre **BCrypt** ile hash'lenip `password_hash`'e yazılır. Düz şifre asla saklanmaz.
- **Giriş (`POST /api/auth/login`):** Email + şifre doğrulanır. Başarılıysa içinde `user_id` bulunan, bir gizli anahtarla imzalanmış bir **JWT** üretilip döndürülür.
- **Token kullanımı:** Frontend token'ı saklar ve korumalı isteklerde `Authorization: Bearer <token>` başlığında gönderir.
- **Spring Security:** `register` ve `login` herkese açık; diğer tüm `/api/**` uçları korumalıdır. Gelen token'ı doğrulayan bir JWT filtresi, isteği ilgili kullanıcıya bağlar.
- **Basit kurallar:** Şifre en az 8 karakter. JWT gizli anahtarı ve son kullanma süresi (örn. 7 gün) ortam değişkeninden (env var) okunur.

### Aşama 2 — Google ile Giriş (OAuth2)
- Google ile giriş, aynı `users` tablosuna `google_id` üzerinden bağlanır.
- **Hesap eşleştirme kuralı:** Bir Google girişinin email'i mevcut bir email/şifre hesabıyla eşleşiyorsa, o kullanıcıya `google_id` eklenir (yeni/duplike hesap açılmaz).
- Aşama 1 uçtan uca çalıştıktan **sonra** eklenir.

---

## 7. API Uçları (Endpoints)

| Metot & Yol | Erişim | Açıklama |
|-------------|--------|----------|
| `POST /api/auth/register` | Açık | Kayıt |
| `POST /api/auth/login` | Açık | Giriş → JWT döner |
| `GET /api/triggers` | Korumalı | Kullanıcının trigger'ları |
| `POST /api/triggers` | Korumalı | Trigger ekle |
| `DELETE /api/triggers/{id}` | Korumalı | Trigger sil |
| `GET /api/favorites` | Korumalı | Kullanıcının favorileri |
| `POST /api/favorites` | Korumalı | Favori ekle (gövdede tüm `Product`) |
| `DELETE /api/favorites/{code}` | Korumalı | Barkoda göre favori sil |

*(Google OAuth uçları Aşama 2'de eklenir.)*

Tüm korumalı uçlar yalnızca **token'daki kullanıcının kendi** verisiyle çalışır.

---

## 8. Frontend Değişiklikleri

- **`TriggerProvider` ve `FavoritesProvider`:** `localStorage` çağrıları yerine API çağrıları (fetch). Veri artık sunucudan gelir.
- **Auth katmanı (yeni):** Auth context + token saklama; **Login** ve **Register** sayfaları; her isteğe token ekleyen bir yardımcı (fetch wrapper).
- **Korumalı route'lar:** Giriş yapılmadıysa kullanıcı login sayfasına yönlendirilir.
- **Yapılandırma:** API base URL (dev/prod) bir ortam değişkeninden okunur.
- **CORS:** Frontend ve backend farklı adreslerde olduğu için backend'de CORS ayarlanır.

---

## 9. Görev Sırası (Implementation Tasks)

Bağımlılık zinciri gözetilerek, her adım test edilebilir bir çıktı verir:

1. **Backend iskeleti** — Spring Boot projesi (Web, Security, JPA, PostgreSQL driver, validation, JWT lib). Tek "hello" endpoint çalışır.
2. **Veritabanı + veri modeli** — Postgres bağlantısı; `users`, `triggers`, `favorites` tabloları (Entity + JPA repository).
3. **Auth** — (a) email+şifre+JWT (kayıt, giriş, Spring Security, JWT filtresi); (b) çalışınca Google OAuth2.
4. **Triggers API + frontend** — CRUD uçları + React `MyTriggers` sayfasının API'ye bağlanması. İlk uçtan uca dikey dilim.
5. **Favorites API + frontend** — Aynı desen; `product_data` JSONB.
6. **Frontend cila** — Auth context, login/register sayfaları, korumalı route'lar, hata/yükleniyor durumları.

**Opsiyonel 7. adım — Deploy:** Backend → Render/Railway, Postgres → Neon/Supabase Postgres, frontend → Netlify/Vercel. Env değişkenleri (API URL, JWT secret, DB bağlantısı).

**Sıra gerekçesi:** DB olmadan kullanıcı saklanamaz; auth olmadan "bu veri kimin?" denemez; trigger (sadece string) auth'u en basit şekilde test eder; frontend en sonda, backend Postman'le test edilmişken bağlanır.

---

## 10. Kapsam Dışı (Non-Goals / YAGNI)

Bu sürümde **yapılmayacaklar:**
- Şifre sıfırlama e-postası / "şifremi unuttum" akışı.
- Email doğrulama.
- Admin paneli, roller/yetki seviyeleri.
- `localStorage`'daki mevcut verinin otomatik taşınması — v1 temiz başlar.
- Üretim deploy'u zorunlu değil (opsiyonel 7. adım).

**Değişmeyen:** Open Food Facts entegrasyonu (arama/ürün detayı) mevcut hâliyle kalır.

---

## 11. Karar Günlüğü

| Karar | Seçim | Gerekçe |
|-------|-------|---------|
| Genel yön | Kendi backend (BaaS değil) | Java/SQL bilgisini kullan, entegrasyonu öğren, CV değeri |
| Framework (Katman 2) | Spring Boot | Bilinen stack; Next.js taşıması gereksiz detour |
| Veritabanı | PostgreSQL | SQL biliniyor; JSONB desteği |
| Auth | Email+şifre+JWT, sonra Google OAuth2 | Sade+öğretici başlangıç; Google sonradan |
| Favori ürün saklama | Ürünün tümü, JSONB | Dış API snapshot'ı, bütün gösterilir |
| Kendi domain verisi | Normalize tablolar (users/triggers/favorites) | Sahip olunan, ilişkili veri |
| Repo | Monorepo (`frontend/` + `backend/`) | Tek link, tek kişi yönetimi kolay |

---

## 12. Açık Noktalar / Riskler

- **JWT gizli anahtarı** ve DB bağlantı bilgileri asla repo'ya konmaz; ortam değişkeni (env var) olarak tutulur.
- **Aşama 2 (Google):** Aynı email ile hem şifre hem Google hesabı çakışması, §6'daki eşleştirme kuralıyla çözülür.
- **CORS ve API base URL** dev/prod'da farklı olacağı için yapılandırılabilir tutulur.
