package com.bookstore.service;

import com.bookstore.domain.AuthResult;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.JwtTokenProvider;
import com.bookstore.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            RefreshTokenService refreshTokenService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResult register(String email, String password, String firstName, String lastName) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .role(Role.USER)
                .build();

        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = refreshTokenService.createForUser(user).getToken();
        return new AuthResult(accessToken, refreshToken, jwtTokenProvider.getJwtExpirationSeconds(), user);
    }

    public AuthResult login(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        password));

        String accessToken = jwtTokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();
        String refreshToken = refreshTokenService.createForUser(user).getToken();

        return new AuthResult(accessToken, refreshToken, jwtTokenProvider.getJwtExpirationSeconds(), user);
    }

    public AuthResult refresh(String refreshToken) {
        var rotated = refreshTokenService.rotate(refreshToken);
        User user = rotated.getUser();
        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String newRefreshToken = rotated.getToken();
        return new AuthResult(accessToken, newRefreshToken, jwtTokenProvider.getJwtExpirationSeconds(), user);
    }
}
