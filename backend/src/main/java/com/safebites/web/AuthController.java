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
