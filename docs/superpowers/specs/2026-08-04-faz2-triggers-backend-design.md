# Faz 2 — Dilim 1: Backend Trigger Uçları (Tasarım)

**Amaç:** Giriş yapmış kullanıcının kişisel trigger malzemelerini veritabanında tutan, JWT ile korunan bir REST API kurmak. Curl ile uçtan uca test edilir. (Frontend girişi ve entegrasyon sonraki iki dilim — kapsam dışı.)

**Yol haritasındaki yeri:** Faz 2'nin ilk dilimi (bkz. ana tasarım spec §9). Plan 1'deki auth deseninin (controller → service → repository) üzerine biner.

## Veri modeli

Yeni `triggers` tablosu:

| sütun | tip | kural |
| ----- | --- | ----- |
| `id` | Long | PK, otomatik |
| `user_id` | Long | FK → `users.id`, null olamaz |
| `value` | String | trigger metni, null olamaz, **küçük harfe çevrilerek** saklanır |

Benzersizlik: `(user_id, value)` çifti benzersiz → aynı kullanıcı aynı trigger'ı iki kez ekleyemez.

## Katmanlar (Plan 1 auth deseniyle aynı)

- `Trigger` — JPA entity (`id`, `userId`, `value`).
- `TriggerRepository extends JpaRepository<Trigger, Long>` — metotlar:
  - `List<Trigger> findByUserId(Long userId)`
  - `boolean existsByUserIdAndValue(Long userId, String value)`
  - `Optional<Trigger> findByIdAndUserId(Long id, Long userId)` (sahiplik kontrolü için)
- `TriggerService` — iş kuralları: listele, ekle (küçük harf + tekrar kontrolü), sil (sahiplik kontrolü).
- `TriggerController` — uçlar.
- DTO'lar: `TriggerRequest(String value)`, `TriggerResponse(Long id, String value)`.
- Hatalar: mevcut `ApiExceptionHandler`'a eklenir.

## Uçlar

Hepsi **JWT ister**; kullanıcı `@AuthenticationPrincipal Long userId` ile token'dan gelir. Kimse başkasının trigger'ına erişemez.

| Uç | Gövde | Başarılı | Hata |
| --- | ----- | -------- | ---- |
| `GET /api/triggers` | — | `200` → `[{id, value}]` (sadece kendi trigger'ları) | token yok → `401` |
| `POST /api/triggers` | `{ "value": "lemon" }` | `201` → `{id, value}` | boş value → `400`; zaten var → `409`; token yok → `401` |
| `DELETE /api/triggers/{id}` | — | `204` (içerik yok) | yok/başkasının → `404`; token yok → `401` |

Notlar:
- `value` `POST`'ta küçük harfe çevrilip trim'lenir; `@NotBlank` doğrulaması.
- `DELETE` yalnızca isteği yapan kullanıcının sahip olduğu satırı siler; başka kullanıcının id'si verilse bile `404` döner (bilgi sızdırmamak için).
- Güvenlik yapılandırması: `/api/triggers/**` zaten `anyRequest().authenticated()` kuralına girer (Plan 1 `SecurityConfig`), ek public kural gerekmez.

## Testler

- `TriggerRepositoryTest` (H2): kaydet → `findByUserId` → `existsByUserIdAndValue` → `findByIdAndUserId`.
- `TriggerEndpointTest` (`@SpringBootTest`): önce register+login ile token al, sonra
  - ekle → `201`, listede görünür
  - aynı value tekrar → `409`
  - boş value → `400`
  - token'sız istek → `401`
  - sil → `204`, listeden kalkar
  - başka kullanıcının trigger'ını silememe → `404`

## Kapsam dışı (sonraki dilimler)

- **Dilim 2:** Frontend giriş/kayıt ekranı + token saklama + isteklere token ekleme + CORS ayarı.
- **Dilim 3:** Frontend trigger'larını localStorage yerine bu uçlara bağlamak (`TriggerProvider` içi değişir, arayüz aynı kalır).

## Çıktı (Deliverable)

Bu dilim bitince: gerçek Postgres'te `curl` ile "giriş yap → trigger ekle → listele → sil" akışı çalışır; tüm testler yeşil; commit'li. Çalışan ara durum.
