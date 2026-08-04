# Faz 2 — Dilim 1: Backend Trigger Uçları Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giriş yapmış kullanıcının kişisel trigger'larını veritabanında tutan, JWT ile korunan bir REST API kurmak (`GET`/`POST`/`DELETE /api/triggers`).

**Architecture:** Plan 1'deki auth deseninin aynısı: `Trigger` JPA entity + `TriggerRepository` → `TriggerService` (iş kuralları) → `TriggerController` (uçlar) + DTO'lar. Kullanıcı kimliği JWT'den `@AuthenticationPrincipal Long userId` ile gelir. Testler H2 (repository) ve `@SpringBootTest` (uçlar) üzerinde koşar.

**Tech Stack:** Java 17, Spring Boot 3.5.16, Spring Web, Spring Data JPA, Spring Security (mevcut), PostgreSQL (dev), H2 (test), JUnit 5 + MockMvc.

## Global Constraints

- Java sürümü: **17**. Spring Boot: **3.5.16**. Kök paket: **`com.safebites`**.
- Çalışma dizini bu plan boyunca **`backend/`**'dir (komutlar oradan çalışır).
- Tüm uçlar **`/api`** ile başlar; trigger uçları `/api/triggers`.
- Trigger uçları **JWT ister** — `SecurityConfig`'teki `anyRequest().authenticated()` bunları zaten kapsar; **güvenlik yapılandırması değişmez**.
- `value` **trim'lenip küçük harfe** çevrilerek saklanır; `@NotBlank` doğrulaması.
- Bir kullanıcı aynı `value`'yu iki kez ekleyemez (`(user_id, value)` benzersiz).
- `DELETE` yalnızca isteği yapan kullanıcının satırını siler; aksi halde `404`.
- Her task kendi testiyle biter ve sonunda **commit** edilir.

---

## Dosya Yapısı (Dilim 1 sonunda)

```
backend/src/main/java/com/safebites/
├── trigger/
│   ├── Trigger.java              (JPA entity)
│   ├── TriggerRepository.java
│   └── TriggerService.java       (list/add/delete iş kuralları)
├── web/
│   ├── TriggerController.java    (GET/POST/DELETE)
│   └── dto/
│       ├── TriggerRequest.java   (gelen: value)
│       └── TriggerResponse.java  (giden: id, value)
└── error/
    ├── TriggerAlreadyExistsException.java   (→ 409)
    ├── TriggerNotFoundException.java         (→ 404)
    └── ApiExceptionHandler.java              (mevcut — 2 handler eklenir)

backend/src/test/java/com/safebites/
├── trigger/TriggerRepositoryTest.java
└── web/TriggerEndpointTest.java
```

---

## Task 1: `Trigger` entity + repository

**Deliverable:** `triggers` tablosunu tanımlayan entity ve repository; H2 üzerinde koşan bir test kaydeder, kullanıcıya göre bulur, sahiplik ve benzersizlik metotlarını doğrular.

**Files:**
- Create: `backend/src/main/java/com/safebites/trigger/Trigger.java`
- Create: `backend/src/main/java/com/safebites/trigger/TriggerRepository.java`
- Test: `backend/src/test/java/com/safebites/trigger/TriggerRepositoryTest.java`

**Interfaces:**
- Produces: `Trigger` entity — alanlar `Long id`, `Long userId`, `String value` (getter/setter'lı).
- Produces: `TriggerRepository extends JpaRepository<Trigger, Long>` — `List<Trigger> findByUserId(Long)`, `boolean existsByUserIdAndValue(Long, String)`, `Optional<Trigger> findByIdAndUserId(Long, Long)`.

- [ ] **Step 1: Failing test yaz**

`backend/src/test/java/com/safebites/trigger/TriggerRepositoryTest.java`:

```java
package com.safebites.trigger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TriggerRepositoryTest {

    @Autowired
    TriggerRepository triggerRepository;

    @Test
    void savesAndQueriesByUserAndOwnership() {
        Trigger trigger = new Trigger();
        trigger.setUserId(1L);
        trigger.setValue("lemon");
        triggerRepository.save(trigger);

        assertThat(triggerRepository.findByUserId(1L)).hasSize(1);
        assertThat(triggerRepository.findByUserId(2L)).isEmpty();
        assertThat(triggerRepository.existsByUserIdAndValue(1L, "lemon")).isTrue();
        assertThat(triggerRepository.existsByUserIdAndValue(2L, "lemon")).isFalse();
        assertThat(triggerRepository.findByIdAndUserId(trigger.getId(), 1L)).isPresent();
        assertThat(triggerRepository.findByIdAndUserId(trigger.getId(), 2L)).isEmpty();
    }
}
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `./mvnw test -Dtest=TriggerRepositoryTest`
Expected: FAIL — `Trigger` / `TriggerRepository` derlenmez.

- [ ] **Step 3: `Trigger` entity'sini yaz**

`backend/src/main/java/com/safebites/trigger/Trigger.java`:

```java
package com.safebites.trigger;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "triggers",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "value"}))
public class Trigger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String value;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
```

- [ ] **Step 4: `TriggerRepository`'yi yaz**

`backend/src/main/java/com/safebites/trigger/TriggerRepository.java`:

```java
package com.safebites.trigger;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TriggerRepository extends JpaRepository<Trigger, Long> {
    List<Trigger> findByUserId(Long userId);
    boolean existsByUserIdAndValue(Long userId, String value);
    Optional<Trigger> findByIdAndUserId(Long id, Long userId);
}
```

- [ ] **Step 5: Testin geçtiğini doğrula**

Run: `./mvnw test -Dtest=TriggerRepositoryTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend
git commit -m "feat(backend): add Trigger entity and repository"
```

---

## Task 2: Listeleme + ekleme uçları (`GET` / `POST /api/triggers`)

**Deliverable:** `POST /api/triggers` yeni trigger ekler (`201`, value küçük harfe çevrilir), aynı value tekrar gelirse `409`, boş value `400`; `GET /api/triggers` kullanıcının kendi trigger'larını döndürür; token'sız istek `401`.

**Files:**
- Create: `backend/src/main/java/com/safebites/web/dto/TriggerRequest.java`
- Create: `backend/src/main/java/com/safebites/web/dto/TriggerResponse.java`
- Create: `backend/src/main/java/com/safebites/error/TriggerAlreadyExistsException.java`
- Create: `backend/src/main/java/com/safebites/trigger/TriggerService.java`
- Create: `backend/src/main/java/com/safebites/web/TriggerController.java`
- Modify: `backend/src/main/java/com/safebites/error/ApiExceptionHandler.java` (409 handler ekle)
- Test: `backend/src/test/java/com/safebites/web/TriggerEndpointTest.java`

**Interfaces:**
- Consumes: `JwtService`/`JwtAuthFilter` (Plan 1) → `@AuthenticationPrincipal Long userId`; `TriggerRepository` (Task 1).
- Produces: `TriggerRequest(String value)`, `TriggerResponse(Long id, String value)`.
- Produces: `TriggerService.list(Long userId)` → `List<Trigger>`; `TriggerService.add(Long userId, String rawValue)` → `Trigger` (tekrarda `TriggerAlreadyExistsException`).
- Produces: `TriggerController` — `GET /api/triggers`, `POST /api/triggers` (bu task); `DELETE /api/triggers/{id}` (Task 3).

- [ ] **Step 1: Failing test yaz**

`backend/src/test/java/com/safebites/web/TriggerEndpointTest.java`:

```java
package com.safebites.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TriggerEndpointTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void registerAndLogin() throws Exception {
        // Her test için benzersiz kullanıcı → trigger listesi boş başlar (izolasyon)
        String email = "trig-" + System.nanoTime() + "@example.com";
        String creds = "{\"email\":\"" + email + "\",\"password\":\"password123\"}";
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON).content(creds));
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(creds))
                .andReturn();
        token = objectMapper.readTree(res.getResponse().getContentAsString())
                .get("token").asText();
    }

    @Test
    void add_lowercasesAndList_returnsIt() throws Exception {
        mockMvc.perform(post("/api/triggers")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":\"Lemon\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.value").value("lemon"));

        mockMvc.perform(get("/api/triggers").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].value").value("lemon"));
    }

    @Test
    void add_duplicate_returns409() throws Exception {
        String body = "{\"value\":\"coffee\"}";
        mockMvc.perform(post("/api/triggers").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(body));
        mockMvc.perform(post("/api/triggers").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void add_blankValue_returns400() throws Exception {
        mockMvc.perform(post("/api/triggers").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"value\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void list_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/triggers"))
                .andExpect(status().isUnauthorized());
    }
}
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `./mvnw test -Dtest=TriggerEndpointTest`
Expected: FAIL — `TriggerController`/`TriggerService`/DTO'lar derlenmez.

- [ ] **Step 3: DTO'ları yaz**

`backend/src/main/java/com/safebites/web/dto/TriggerRequest.java`:

```java
package com.safebites.web.dto;

import jakarta.validation.constraints.NotBlank;

public record TriggerRequest(@NotBlank String value) {
}
```

`backend/src/main/java/com/safebites/web/dto/TriggerResponse.java`:

```java
package com.safebites.web.dto;

public record TriggerResponse(Long id, String value) {
}
```

- [ ] **Step 4: `TriggerAlreadyExistsException`'ı yaz**

`backend/src/main/java/com/safebites/error/TriggerAlreadyExistsException.java`:

```java
package com.safebites.error;

public class TriggerAlreadyExistsException extends RuntimeException {
    public TriggerAlreadyExistsException(String value) {
        super("Trigger already exists: " + value);
    }
}
```

- [ ] **Step 5: `TriggerService`'i yaz (list + add)**

`backend/src/main/java/com/safebites/trigger/TriggerService.java`:

```java
package com.safebites.trigger;

import com.safebites.error.TriggerAlreadyExistsException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TriggerService {

    private final TriggerRepository triggerRepository;

    public TriggerService(TriggerRepository triggerRepository) {
        this.triggerRepository = triggerRepository;
    }

    public List<Trigger> list(Long userId) {
        return triggerRepository.findByUserId(userId);
    }

    public Trigger add(Long userId, String rawValue) {
        String value = rawValue.trim().toLowerCase();
        if (triggerRepository.existsByUserIdAndValue(userId, value)) {
            throw new TriggerAlreadyExistsException(value);
        }
        Trigger trigger = new Trigger();
        trigger.setUserId(userId);
        trigger.setValue(value);
        return triggerRepository.save(trigger);
    }
}
```

- [ ] **Step 6: `ApiExceptionHandler`'a 409 handler ekle**

`backend/src/main/java/com/safebites/error/ApiExceptionHandler.java` — sınıfın içine yeni bir `@ExceptionHandler` metodu ekle (mevcut `EmailAlreadyUsedException` ve `InvalidCredentialsException` handler'larının yanına):

```java
    @ExceptionHandler(TriggerAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleTriggerExists(TriggerAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }
```

(Import'lar zaten mevcut: `HttpStatus`, `ResponseEntity`, `ExceptionHandler`, `Map`.)

- [ ] **Step 7: `TriggerController`'ı yaz (list + add)**

`backend/src/main/java/com/safebites/web/TriggerController.java`:

```java
package com.safebites.web;

import com.safebites.trigger.Trigger;
import com.safebites.trigger.TriggerService;
import com.safebites.web.dto.TriggerRequest;
import com.safebites.web.dto.TriggerResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/triggers")
public class TriggerController {

    private final TriggerService triggerService;

    public TriggerController(TriggerService triggerService) {
        this.triggerService = triggerService;
    }

    @GetMapping
    public List<TriggerResponse> list(@AuthenticationPrincipal Long userId) {
        return triggerService.list(userId).stream()
                .map(t -> new TriggerResponse(t.getId(), t.getValue()))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TriggerResponse add(@AuthenticationPrincipal Long userId,
                               @Valid @RequestBody TriggerRequest request) {
        Trigger trigger = triggerService.add(userId, request.value());
        return new TriggerResponse(trigger.getId(), trigger.getValue());
    }
}
```

- [ ] **Step 8: Testin geçtiğini doğrula**

Run: `./mvnw test -Dtest=TriggerEndpointTest`
Expected: PASS (dört test de).

- [ ] **Step 9: Commit**

```bash
git add backend
git commit -m "feat(backend): add list and create trigger endpoints"
```

---

## Task 3: Silme ucu (`DELETE /api/triggers/{id}`)

**Deliverable:** `DELETE /api/triggers/{id}` kullanıcının kendi trigger'ını siler (`204`); trigger yoksa ya da başka kullanıcıya aitse `404`; token'sız `401`.

**Files:**
- Create: `backend/src/main/java/com/safebites/error/TriggerNotFoundException.java`
- Modify: `backend/src/main/java/com/safebites/trigger/TriggerService.java` (delete metodu)
- Modify: `backend/src/main/java/com/safebites/error/ApiExceptionHandler.java` (404 handler)
- Modify: `backend/src/main/java/com/safebites/web/TriggerController.java` (delete ucu)
- Test: `backend/src/test/java/com/safebites/web/TriggerEndpointTest.java` (silme testleri ekle)

**Interfaces:**
- Consumes: `TriggerRepository.findByIdAndUserId` (Task 1).
- Produces: `TriggerService.delete(Long userId, Long triggerId)` → `void` (yoksa/başkasınınsa `TriggerNotFoundException`).

- [ ] **Step 1: Failing test ekle**

`backend/src/test/java/com/safebites/web/TriggerEndpointTest.java` — sınıfın içine iki yeni test metodu ekle. (Üstteki import'lara ek olarak `delete` ve `MvcResult`/`jsonPath` zaten var; yeni gereken: `org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete` import'unu ekle.)

Dosyanın import bloğuna ekle:
```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
```

Sınıfın içine ekle:
```java
    @Test
    void delete_ownTrigger_removesIt() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/triggers")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":\"garlic\"}"))
                .andReturn();
        long id = objectMapper.readTree(created.getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(delete("/api/triggers/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/triggers").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void delete_nonexistent_returns404() throws Exception {
        mockMvc.perform(delete("/api/triggers/999999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `./mvnw test -Dtest=TriggerEndpointTest`
Expected: FAIL — `delete` ucu ve `TriggerService.delete` yok.

- [ ] **Step 3: `TriggerNotFoundException`'ı yaz**

`backend/src/main/java/com/safebites/error/TriggerNotFoundException.java`:

```java
package com.safebites.error;

public class TriggerNotFoundException extends RuntimeException {
    public TriggerNotFoundException(Long id) {
        super("Trigger not found: " + id);
    }
}
```

- [ ] **Step 4: `TriggerService`'e `delete` ekle**

`backend/src/main/java/com/safebites/trigger/TriggerService.java` — `import` ekle ve metodu ekle:

```java
import com.safebites.error.TriggerNotFoundException;
```

Sınıfın içine (add metodunun altına):

```java
    public void delete(Long userId, Long triggerId) {
        Trigger trigger = triggerRepository.findByIdAndUserId(triggerId, userId)
                .orElseThrow(() -> new TriggerNotFoundException(triggerId));
        triggerRepository.delete(trigger);
    }
```

- [ ] **Step 5: `ApiExceptionHandler`'a 404 handler ekle**

`backend/src/main/java/com/safebites/error/ApiExceptionHandler.java` — yeni metod ekle:

```java
    @ExceptionHandler(TriggerNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleTriggerNotFound(TriggerNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }
```

- [ ] **Step 6: `TriggerController`'a `delete` ucu ekle**

`backend/src/main/java/com/safebites/web/TriggerController.java` — import'lara ekle:

```java
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
```

Sınıfın içine (add metodunun altına):

```java
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        triggerService.delete(userId, id);
    }
```

- [ ] **Step 7: Testin geçtiğini doğrula**

Run: `./mvnw test -Dtest=TriggerEndpointTest`
Expected: PASS (altı test de).

- [ ] **Step 8: Tüm test paketini çalıştır**

Run: `./mvnw test`
Expected: PASS — Plan 1 testleri (Ping, UserRepository, JwtService, Register, Login) + yeni trigger testleri (TriggerRepository, TriggerEndpoint) yeşil.

- [ ] **Step 9: Uçtan uca elle doğrula (opsiyonel ama önerilir)**

Postgres ayakta ve uygulama çalışırken (`./mvnw spring-boot:run`):
```bash
BASE=http://localhost:8080/api
# giriş yapıp token al (kullanıcı Plan 1'de oluşturulmuş olabilir; yoksa önce register)
TOKEN=$(curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"ezgi@example.com","password":"password123"}' | sed 's/.*"token":"//;s/".*//')
curl -s -X POST $BASE/triggers -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"value":"Lemon"}' -w '\n%{http_code}\n'   # 201, value "lemon"
curl -s $BASE/triggers -H "Authorization: Bearer $TOKEN"                             # [{"id":..,"value":"lemon"}]
curl -s -X DELETE $BASE/triggers/1 -H "Authorization: Bearer $TOKEN" -w '%{http_code}\n'  # 204
curl -s $BASE/triggers                                                               # 401 (token yok)
```

- [ ] **Step 10: Commit**

```bash
git add backend
git commit -m "feat(backend): add delete trigger endpoint with ownership check"
```

---

## Self-Review (yazan tarafından tamamlandı)

**Spec kapsamı:**
- Veri modeli (`triggers`: id, user_id, value; `(user_id,value)` benzersiz; küçük harf) → Task 1 (entity) + Task 2 Step 5 (küçük harf/trim, add).
- `GET /api/triggers` → Task 2. `POST` (201/409/400) → Task 2. `DELETE /{id}` (204/404) → Task 3. Token'sız 401 → Task 2 (list) testinde doğrulanır; `SecurityConfig` değişmez (Global Constraints).
- Katmanlar (entity/repo/service/controller/DTO/exception) → Task 1–3.
- Testler (repository + uç senaryoları) → Task 1 ve Task 2/3 test blokları.

**Placeholder taraması:** TBD/TODO yok; her kod adımı tam içerik veriyor.

**Tip tutarlılığı:** `TriggerService.list(Long)→List<Trigger>`, `add(Long,String)→Trigger`, `delete(Long,Long)→void`; `TriggerRepository.findByUserId`/`existsByUserIdAndValue`/`findByIdAndUserId`; DTO `TriggerRequest(String value)`/`TriggerResponse(Long id,String value)`; `@AuthenticationPrincipal Long userId` ↔ Plan 1 `JwtAuthFilter`'ın principal olarak `Long` koyması eşleşiyor. Adlar task'ler arasında tutarlı.

**Not (bilinçli karar):** `Trigger` entity `userId`'yi düz `Long` olarak tutar (JPA `@ManyToOne User` ilişkisi kurmaz) — Plan 1 filtresi zaten `Long userId` sağladığı için bu yeterli ve daha basit. İlişkisel bütünlük `user_id` FK kolonuyla veritabanı düzeyinde korunur.
