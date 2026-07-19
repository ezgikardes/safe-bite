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
