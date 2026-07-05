# SafeBites Backend — Plan 1: İskelet + DB + Auth (email/şifre + JWT) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Çalışan bir Spring Boot API kurmak — kullanıcı kaydı/girişi email+şifre ile yapılır, giriş bir JWT döndürür, korumalı uçlar token'sız isteği reddeder.

**Architecture:** `backend/` altında bağımsız bir Spring Boot 3 uygulaması. Katmanlar: web (controller + DTO) → auth (servis) → user (JPA entity + repository) → security (JWT üretimi/doğrulaması + Spring Security filtresi). Veri PostgreSQL'de; testler hızlı olması için H2 in-memory üzerinde koşar.

**Tech Stack:** Java 21, Spring Boot 3.4.x, Maven (mvnw wrapper), Spring Web, Spring Data JPA, Spring Security, PostgreSQL (dev), H2 (test), jjwt 0.12.x, BCrypt, JUnit 5 + MockMvc.

## Global Constraints

- Java sürümü: **21** (LTS).
- Spring Boot: **3.4.x**.
- Kök Java paketi: **`com.safebites`**.
- Backend dizini: repo kökünde **`backend/`** (monorepo).
- Tüm API uçları **`/api`** ile başlar.
- JWT imza algoritması: **HS256**; gizli anahtar ve son kullanma süresi **property/env var** olarak okunur, koda gömülmez.
- Şifreler **BCrypt** ile hash'lenir; düz şifre asla saklanmaz/loglanmaz.
- Her task kendi testiyle biter ve sonunda **commit** edilir.
- Bu plan çalışırken çalışma dizini `backend/`'dir (aksi belirtilmedikçe komutlar oradan çalışır).

---

## Dosya Yapısı (Plan 1 sonunda)

```
backend/
├── pom.xml
├── mvnw, mvnw.cmd, .mvn/…            (Initializr/IntelliJ üretir)
├── src/main/java/com/safebites/
│   ├── SafeBitesApplication.java     (giriş noktası)
│   ├── web/
│   │   ├── PingController.java        (sağlık ucu)
│   │   ├── AuthController.java        (register/login/me)
│   │   └── dto/
│   │       ├── RegisterRequest.java
│   │       ├── LoginRequest.java
│   │       ├── AuthResponse.java
│   │       └── MeResponse.java
│   ├── auth/AuthService.java          (kayıt/giriş iş kuralları)
│   ├── user/
│   │   ├── User.java                  (JPA entity)
│   │   └── UserRepository.java
│   ├── security/
│   │   ├── SecurityConfig.java        (filter chain + PasswordEncoder)
│   │   ├── JwtService.java            (token üret/doğrula)
│   │   └── JwtAuthFilter.java         (gelen token'ı doğrula)
│   └── error/
│       ├── EmailAlreadyUsedException.java
│       ├── InvalidCredentialsException.java
│       └── ApiExceptionHandler.java   (hataları HTTP koduna çevirir)
├── src/main/resources/application.properties      (Postgres, dev)
└── src/test/
    ├── resources/application.properties           (H2, test)
    └── java/com/safebites/
        ├── web/PingControllerTest.java
        ├── user/UserRepositoryTest.java
        ├── security/JwtServiceTest.java
        ├── auth/RegisterEndpointTest.java
        └── auth/LoginEndpointTest.java
```

---

## Task 1: Proje iskeleti + sağlık ucu (`/api/ping`)

**Deliverable:** `./mvnw spring-boot:run` uygulamayı ayağa kaldırır; `GET /api/ping` → `200` ve `{"status":"ok"}`.

**Files:**
- Create: `backend/` (Spring Initializr / IntelliJ ile), `backend/pom.xml`, `backend/src/main/java/com/safebites/SafeBitesApplication.java`
- Create: `backend/src/main/java/com/safebites/web/PingController.java`
- Create: `backend/src/main/resources/application.properties`
- Test: `backend/src/test/java/com/safebites/web/PingControllerTest.java`

**Interfaces:**
- Produces: `GET /api/ping` → JSON `{"status":"ok"}` (sonraki task'ler bunu "app ayakta mı" kontrolü için kullanabilir).

- [ ] **Step 1: Projeyi oluştur (scaffold)**

IntelliJ → **New Project → Spring Boot** (veya https://start.spring.io) ile şu ayarları seç:
- Project: **Maven**, Language: **Java**, Java: **21**, Spring Boot: **3.4.x**
- Group: `com.safebites`, Artifact: `backend`, Package name: `com.safebites`
- Dependencies: **Spring Web** (şimdilik yalnızca bu)
- Konum: repo kökünde `backend/` klasörü olacak şekilde.

Bu, `pom.xml`, `mvnw` wrapper ve `SafeBitesApplication.java`'yı üretir. Üretilen `SafeBitesApplication.java` şöyle olmalı:

```java
package com.safebites;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SafeBitesApplication {
    public static void main(String[] args) {
        SpringApplication.run(SafeBitesApplication.class, args);
    }
}
```

- [ ] **Step 2: Failing test yaz**

`backend/src/test/java/com/safebites/web/PingControllerTest.java`:

```java
package com.safebites.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PingController.class)
class PingControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void ping_returnsOkStatus() throws Exception {
        mockMvc.perform(get("/api/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }
}
```

- [ ] **Step 3: Testin başarısız olduğunu doğrula**

Run: `./mvnw test -Dtest=PingControllerTest`
Expected: FAIL — `PingController` derlenmez (henüz yok).

- [ ] **Step 4: Minimal implementasyon**

`backend/src/main/java/com/safebites/web/PingController.java`:

```java
package com.safebites.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PingController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("status", "ok");
    }
}
```

- [ ] **Step 5: Testin geçtiğini doğrula**

Run: `./mvnw test -Dtest=PingControllerTest`
Expected: PASS.

- [ ] **Step 6: Uygulamayı elle çalıştırıp doğrula**

Run: `./mvnw spring-boot:run` (ayrı terminalde) sonra `curl http://localhost:8080/api/ping`
Expected: `{"status":"ok"}`. Sonra sunucuyu durdur (Ctrl+C).

- [ ] **Step 7: Commit**

```bash
git add backend
git commit -m "feat(backend): scaffold Spring Boot app with /api/ping health endpoint"
```

---

## Task 2: Veritabanı + `User` entity + repository

**Deliverable:** Postgres bağlantısı yapılandırılır; `User` entity ve `UserRepository` çalışır; H2 üzerinde koşan bir repository testi kullanıcıyı kaydedip email'e göre bulur.

**Files:**
- Modify: `backend/pom.xml` (JPA, PostgreSQL, H2 bağımlılıkları)
- Modify: `backend/src/main/resources/application.properties` (Postgres datasource)
- Create: `backend/src/test/resources/application.properties` (H2, test)
- Create: `backend/src/main/java/com/safebites/user/User.java`
- Create: `backend/src/main/java/com/safebites/user/UserRepository.java`
- Test: `backend/src/test/java/com/safebites/user/UserRepositoryTest.java`

**Interfaces:**
- Produces: `User` entity — alanlar: `Long id`, `String email`, `String passwordHash`, `String googleId`, `Instant createdAt`. Getter/setter'lar mevcut.
- Produces: `UserRepository extends JpaRepository<User, Long>` — metotlar: `Optional<User> findByEmail(String email)`, `boolean existsByEmail(String email)`.

- [ ] **Step 1: Bağımlılıkları ekle**

`backend/pom.xml` içindeki `<dependencies>` bloğuna ekle:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

- [ ] **Step 2: Yerel Postgres'i hazırla (dev)**

Docker en kolayı (IntelliJ Database aracı ya da Postgres.app da olur):

Run: `docker run --name safebites-pg -e POSTGRES_PASSWORD=safebites -e POSTGRES_USER=safebites -e POSTGRES_DB=safebites -p 5432:5432 -d postgres:16`
Expected: bir container id yazar; `docker ps` içinde `safebites-pg` görünür.

- [ ] **Step 3: application.properties (dev = Postgres) yaz**

`backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/safebites
spring.datasource.username=safebites
spring.datasource.password=safebites
spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false
```

- [ ] **Step 4: Test için H2 properties yaz**

`backend/src/test/resources/application.properties`:

```properties
spring.datasource.url=jdbc:h2:mem:safebites;MODE=PostgreSQL;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.open-in-view=false
```

- [ ] **Step 5: Failing test yaz**

`backend/src/test/java/com/safebites/user/UserRepositoryTest.java`:

```java
package com.safebites.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    UserRepository userRepository;

    @Test
    void savesAndFindsUserByEmail() {
        User user = new User();
        user.setEmail("ezgi@example.com");
        user.setPasswordHash("hashed");
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("ezgi@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getId()).isNotNull();
        assertThat(userRepository.existsByEmail("ezgi@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("yok@example.com")).isFalse();
    }
}
```

- [ ] **Step 6: Testin başarısız olduğunu doğrula**

Run: `./mvnw test -Dtest=UserRepositoryTest`
Expected: FAIL — `User` / `UserRepository` derlenmez (henüz yok).

- [ ] **Step 7: `User` entity'sini yaz**

`backend/src/main/java/com/safebites/user/User.java`:

```java
package com.safebites.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
```

- [ ] **Step 8: `UserRepository`'yi yaz**

`backend/src/main/java/com/safebites/user/UserRepository.java`:

```java
package com.safebites.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

- [ ] **Step 9: Testin geçtiğini doğrula**

Run: `./mvnw test -Dtest=UserRepositoryTest`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add backend
git commit -m "feat(backend): add User entity, repository and DB config"
```

---

## Task 3: Auth temeli — PasswordEncoder + JwtService + Spring Security

**Deliverable:** `JwtService` bir kullanıcı id'si için token üretir ve doğrular (unit test); `PasswordEncoder` bean'i (BCrypt) mevcut; Spring Security stateless yapılandırılır — `/api/ping`, `/api/auth/register`, `/api/auth/login` açık, gerisi korumalı; gelen `Authorization: Bearer` token'ını doğrulayan filtre devrede.

**Files:**
- Modify: `backend/pom.xml` (Spring Security + jjwt)
- Modify: `backend/src/main/resources/application.properties` ve `backend/src/test/resources/application.properties` (JWT property'leri)
- Create: `backend/src/main/java/com/safebites/security/JwtService.java`
- Create: `backend/src/main/java/com/safebites/security/JwtAuthFilter.java`
- Create: `backend/src/main/java/com/safebites/security/SecurityConfig.java`
- Test: `backend/src/test/java/com/safebites/security/JwtServiceTest.java`

**Interfaces:**
- Produces: `JwtService.generateToken(Long userId)` → `String`; `JwtService.validateAndGetUserId(String token)` → `Long` (geçersiz token'da exception fırlatır).
- Produces: `PasswordEncoder` bean (BCrypt) — `AuthService` bunu tüketir.
- Produces: `JwtAuthFilter` geçerli token'daki `userId`'yi (`Long`) `SecurityContext` principal'ı olarak koyar — controller'lar `@AuthenticationPrincipal Long userId` ile okur.

- [ ] **Step 1: Bağımlılıkları ekle**

`backend/pom.xml` `<dependencies>` içine:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

- [ ] **Step 2: JWT property'lerini ekle**

`backend/src/main/resources/application.properties` sonuna:

```properties
app.jwt.secret=${JWT_SECRET:dev-only-secret-please-change-this-to-a-64-char-random-string-000}
app.jwt.expiration-ms=604800000
```
(604800000 ms = 7 gün. Gizli anahtar en az 32 karakter olmalı — HS256 için.)

`backend/src/test/resources/application.properties` sonuna:

```properties
app.jwt.secret=test-secret-that-is-at-least-thirty-two-characters-long-000000
app.jwt.expiration-ms=604800000
```

- [ ] **Step 3: Failing test yaz**

`backend/src/test/java/com/safebites/security/JwtServiceTest.java`:

```java
package com.safebites.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private final JwtService jwtService =
            new JwtService("test-secret-that-is-at-least-thirty-two-characters-long-000000", 604800000L);

    @Test
    void generatesTokenAndReadsBackUserId() {
        String token = jwtService.generateToken(42L);

        Long userId = jwtService.validateAndGetUserId(token);

        assertThat(userId).isEqualTo(42L);
    }

    @Test
    void rejectsTamperedToken() {
        String token = jwtService.generateToken(42L) + "tampered";

        assertThatThrownBy(() -> jwtService.validateAndGetUserId(token))
                .isInstanceOf(Exception.class);
    }
}
```

- [ ] **Step 4: Testin başarısız olduğunu doğrula**

Run: `./mvnw test -Dtest=JwtServiceTest`
Expected: FAIL — `JwtService` derlenmez.

- [ ] **Step 5: `JwtService`'i yaz**

`backend/src/main/java/com/safebites/security/JwtService.java`:

```java
package com.safebites.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    public Long validateAndGetUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return Long.valueOf(claims.getSubject());
    }
}
```

- [ ] **Step 6: Testin geçtiğini doğrula**

Run: `./mvnw test -Dtest=JwtServiceTest`
Expected: PASS.

- [ ] **Step 7: `JwtAuthFilter`'ı yaz**

`backend/src/main/java/com/safebites/security/JwtAuthFilter.java`:

```java
package com.safebites.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Long userId = jwtService.validateAndGetUserId(token);
                var authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ignored) {
                // Geçersiz token → kimliksiz devam et, korumalı uç 401 döner.
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

- [ ] **Step 8: `SecurityConfig`'i yaz**

`backend/src/main/java/com/safebites/security/SecurityConfig.java`:

```java
package com.safebites.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/ping", "/api/auth/register", "/api/auth/login")
                        .permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

- [ ] **Step 9: Derlenip mevcut testlerin geçtiğini doğrula**

Run: `./mvnw test`
Expected: PASS — `PingControllerTest`, `UserRepositoryTest`, `JwtServiceTest` geçer. (Not: `PingControllerTest` bir `@WebMvcTest` slice testi; Spring Security'yi yüklemez, o yüzden 401 vermez.)

- [ ] **Step 10: Commit**

```bash
git add backend
git commit -m "feat(backend): add JWT service, auth filter and stateless security config"
```

---

## Task 4: Kayıt ucu — `POST /api/auth/register`

**Deliverable:** `POST /api/auth/register` yeni kullanıcıyı BCrypt ile hash'lenmiş şifreyle oluşturur ve `201` döner; email zaten varsa `409` döner; geçersiz gövde (kısa şifre / bozuk email) `400` döner.

**Files:**
- Create: `backend/src/main/java/com/safebites/web/dto/RegisterRequest.java`
- Create: `backend/src/main/java/com/safebites/auth/AuthService.java`
- Create: `backend/src/main/java/com/safebites/error/EmailAlreadyUsedException.java`
- Create: `backend/src/main/java/com/safebites/error/ApiExceptionHandler.java`
- Create: `backend/src/main/java/com/safebites/web/AuthController.java`
- Modify: `backend/pom.xml` (validation starter)
- Test: `backend/src/test/java/com/safebites/auth/RegisterEndpointTest.java`

**Interfaces:**
- Produces: `RegisterRequest` record — `String email`, `String password`.
- Produces: `AuthService.register(String email, String rawPassword)` → `User` (email varsa `EmailAlreadyUsedException`).
- Produces: `AuthController` — `POST /api/auth/register` (bu task), `POST /api/auth/login` ve `GET /api/auth/me` (Task 5'te eklenecek).

- [ ] **Step 1: Validation bağımlılığını ekle**

`backend/pom.xml` `<dependencies>` içine:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

- [ ] **Step 2: Failing test yaz**

`backend/src/test/java/com/safebites/auth/RegisterEndpointTest.java`:

```java
package com.safebites.auth;

import com.safebites.user.User;
import com.safebites.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RegisterEndpointTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;

    @Test
    void register_createsUserWithHashedPassword() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"new@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isCreated());

        Optional<User> saved = userRepository.findByEmail("new@example.com");
        assertThat(saved).isPresent();
        assertThat(saved.get().getPasswordHash()).isNotNull();
        assertThat(saved.get().getPasswordHash()).isNotEqualTo("password123"); // hash'lenmiş
    }

    @Test
    void register_duplicateEmail_returns409() throws Exception {
        String body = "{\"email\":\"dupe@example.com\",\"password\":\"password123\"}";
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON).content(body));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void register_shortPassword_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"x@example.com\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest());
    }
}
```

- [ ] **Step 3: Testin başarısız olduğunu doğrula**

Run: `./mvnw test -Dtest=RegisterEndpointTest`
Expected: FAIL — `AuthController`/`AuthService`/`RegisterRequest` derlenmez.

- [ ] **Step 4: `RegisterRequest` DTO'sunu yaz**

`backend/src/main/java/com/safebites/web/dto/RegisterRequest.java`:

```java
package com.safebites.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8) String password) {
}
```

- [ ] **Step 5: `EmailAlreadyUsedException`'ı yaz**

`backend/src/main/java/com/safebites/error/EmailAlreadyUsedException.java`:

```java
package com.safebites.error;

public class EmailAlreadyUsedException extends RuntimeException {
    public EmailAlreadyUsedException(String email) {
        super("Email already in use: " + email);
    }
}
```

- [ ] **Step 6: `AuthService`'i yaz (register)**

`backend/src/main/java/com/safebites/auth/AuthService.java`:

```java
package com.safebites.auth;

import com.safebites.error.EmailAlreadyUsedException;
import com.safebites.user.User;
import com.safebites.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException(email);
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }
}
```

- [ ] **Step 7: `ApiExceptionHandler`'ı yaz**

`backend/src/main/java/com/safebites/error/ApiExceptionHandler.java`:

```java
package com.safebites.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<Map<String, String>> handleEmailUsed(EmailAlreadyUsedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }
}
```
(Validation hataları — `@Valid` başarısızlığı — Spring tarafından otomatik `400` döner; ek kod gerekmez.)

- [ ] **Step 8: `AuthController`'ı yaz (register)**

`backend/src/main/java/com/safebites/web/AuthController.java`:

```java
package com.safebites.web;

import com.safebites.auth.AuthService;
import com.safebites.web.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request.email(), request.password());
    }
}
```

- [ ] **Step 9: Testin geçtiğini doğrula**

Run: `./mvnw test -Dtest=RegisterEndpointTest`
Expected: PASS (üç test de).

- [ ] **Step 10: Commit**

```bash
git add backend
git commit -m "feat(backend): add register endpoint with password hashing and validation"
```

---

## Task 5: Giriş ucu + korumalı `/me`

**Deliverable:** `POST /api/auth/login` doğru kimlikte `200` + `{ "token": "..." }` döner, yanlış kimlikte `401`; `GET /api/auth/me` token'sız `401`, geçerli token'la `200` + `{ "id":..., "email":... }` döner. Bu, auth döngüsünü uçtan uca kapatır.

**Files:**
- Create: `backend/src/main/java/com/safebites/web/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/safebites/web/dto/AuthResponse.java`
- Create: `backend/src/main/java/com/safebites/web/dto/MeResponse.java`
- Create: `backend/src/main/java/com/safebites/error/InvalidCredentialsException.java`
- Modify: `backend/src/main/java/com/safebites/auth/AuthService.java` (login metodu)
- Modify: `backend/src/main/java/com/safebites/error/ApiExceptionHandler.java` (401 handler)
- Modify: `backend/src/main/java/com/safebites/web/AuthController.java` (login + me)
- Test: `backend/src/test/java/com/safebites/auth/LoginEndpointTest.java`

**Interfaces:**
- Consumes: `JwtService.generateToken(Long)` (Task 3), `UserRepository.findByEmail` (Task 2), `PasswordEncoder` (Task 3), `AuthController` (Task 4).
- Produces: `LoginRequest(String email, String password)`, `AuthResponse(String token)`, `MeResponse(Long id, String email)`.
- Produces: `AuthService.login(String email, String rawPassword)` → `String token` (hatalıysa `InvalidCredentialsException`).

- [ ] **Step 1: Failing test yaz**

`backend/src/test/java/com/safebites/auth/LoginEndpointTest.java`:

```java
package com.safebites.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LoginEndpointTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @BeforeEach
    void registerUser() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"login@example.com\",\"password\":\"password123\"}"));
    }

    @Test
    void login_validCredentials_returnsToken() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"login@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"login@example.com\",\"password\":\"wrongpass1\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withToken_returnsCurrentUser() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"login@example.com\",\"password\":\"password123\"}"))
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String token = json.get("token").asText();

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("login@example.com"));
    }
}
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `./mvnw test -Dtest=LoginEndpointTest`
Expected: FAIL — login/me uçları ve DTO'lar yok.

- [ ] **Step 3: DTO'ları yaz**

`backend/src/main/java/com/safebites/web/dto/LoginRequest.java`:

```java
package com.safebites.web.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank String email, @NotBlank String password) {
}
```

`backend/src/main/java/com/safebites/web/dto/AuthResponse.java`:

```java
package com.safebites.web.dto;

public record AuthResponse(String token) {
}
```

`backend/src/main/java/com/safebites/web/dto/MeResponse.java`:

```java
package com.safebites.web.dto;

public record MeResponse(Long id, String email) {
}
```

- [ ] **Step 4: `InvalidCredentialsException`'ı yaz**

`backend/src/main/java/com/safebites/error/InvalidCredentialsException.java`:

```java
package com.safebites.error;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}
```

- [ ] **Step 5: `AuthService`'e `login` ekle**

`backend/src/main/java/com/safebites/auth/AuthService.java` — `JwtService` bağımlılığını ekle ve `login` metodunu ekle. Dosyanın tamamı:

```java
package com.safebites.auth;

import com.safebites.error.EmailAlreadyUsedException;
import com.safebites.error.InvalidCredentialsException;
import com.safebites.security.JwtService;
import com.safebites.user.User;
import com.safebites.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User register(String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException(email);
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    public String login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return jwtService.generateToken(user.getId());
    }
}
```

- [ ] **Step 6: `ApiExceptionHandler`'a 401 ekle**

`backend/src/main/java/com/safebites/error/ApiExceptionHandler.java` — yeni handler ekle. Dosyanın tamamı:

```java
package com.safebites.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<Map<String, String>> handleEmailUsed(EmailAlreadyUsedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", ex.getMessage()));
    }
}
```

- [ ] **Step 7: `AuthController`'a `login` + `me` ekle**

`backend/src/main/java/com/safebites/web/AuthController.java` — dosyanın tamamı:

```java
package com.safebites.web;

import com.safebites.auth.AuthService;
import com.safebites.user.User;
import com.safebites.user.UserRepository;
import com.safebites.web.dto.AuthResponse;
import com.safebites.web.dto.LoginRequest;
import com.safebites.web.dto.MeResponse;
import com.safebites.web.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request.email(), request.password());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request.email(), request.password());
        return new AuthResponse(token);
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return new MeResponse(user.getId(), user.getEmail());
    }
}
```

- [ ] **Step 8: Testin geçtiğini doğrula**

Run: `./mvnw test -Dtest=LoginEndpointTest`
Expected: PASS (dört test de).

- [ ] **Step 9: Tüm test paketini çalıştır**

Run: `./mvnw test`
Expected: PASS — beş test sınıfı (Ping, UserRepository, JwtService, Register, Login) yeşil.

- [ ] **Step 10: Uçtan uca elle doğrula (opsiyonel ama önerilir)**

`./mvnw spring-boot:run` (Postgres ayakta olmalı) ve IntelliJ HTTP Client / curl ile:
```bash
curl -s -X POST localhost:8080/api/auth/register -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"password123"}' -w '\n%{http_code}\n'
# 201 bekleniyor
TOKEN=$(curl -s -X POST localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"password123"}' | sed 's/.*"token":"//;s/".*//')
curl -s localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN"
# {"id":1,"email":"a@b.com"} bekleniyor
```
Sonra sunucuyu durdur.

- [ ] **Step 11: Commit**

```bash
git add backend
git commit -m "feat(backend): add login endpoint returning JWT and protected /me endpoint"
```

---

## Self-Review (yazan tarafından tamamlandı)

**Spec kapsamı (Plan 1 dilimi):**
- Spec §4 monorepo `backend/` → Task 1 (proje `backend/`'de).
- Spec §5 `users` tablosu (id, email, password_hash, google_id, created_at) → Task 2 `User` entity (birebir alanlar).
- Spec §6 Aşama 1: kayıt (BCrypt) → Task 4; giriş (JWT) → Task 5; Spring Security public/protected ayrımı + JWT filtresi → Task 3.
- Spec §7 uçlar: `POST /api/auth/register` → Task 4; `POST /api/auth/login` → Task 5. (Triggers/favorites uçları Plan 2'de — kapsam dışı.)
- Spec §12: JWT secret env var'dan (`${JWT_SECRET:...}`) → Task 3 Step 2. Düz şifre saklanmaz → Task 4 (hash testi).
- Kapsam dışı bırakılanlar (Plan 2+): Google OAuth (§6 Aşama 2), triggers/favorites (§5, §7), frontend (§8), deploy (§9 Task 7), CORS ince ayarı — Plan 1'de `cors(Customizer.withDefaults())` iskeleti var, tam CORS Plan 2'de frontend bağlanınca yapılandırılır.

**Placeholder taraması:** TBD/TODO yok; her kod adımı tam içerik veriyor.

**Tip tutarlılığı:** `JwtService.generateToken(Long)`/`validateAndGetUserId(String)→Long`, `AuthService.register(String,String)→User`/`login(String,String)→String`, DTO record'ları (`RegisterRequest`, `LoginRequest`, `AuthResponse`, `MeResponse`), `UserRepository.findByEmail`/`existsByEmail` — task'ler arasında adlar ve imzalar tutarlı. `@AuthenticationPrincipal Long userId` ↔ `JwtAuthFilter`'ın principal olarak `Long userId` koyması eşleşiyor.

**Not (bilinçli karar):** Testler H2 üzerinde koşar (hız + Docker gerektirmez). Plan 1'de yalnızca `users` tablosu olduğu için H2 yeterli. Plan 2'de `favorites.product_data` **JSONB** geldiğinde test veritabanı stratejisi Testcontainers (gerçek Postgres) olarak yeniden değerlendirilecek.
