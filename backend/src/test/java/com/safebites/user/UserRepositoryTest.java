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
