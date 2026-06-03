package com.iting.jobportal.config;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

  private final JwtTokenUtil jwtTokenUtil;

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(
        new ChannelInterceptor() {
          @Override
          public Message<?> preSend(Message<?> message, MessageChannel channel) {
            StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
            if (accessor == null) {
              return message;
            }

            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
              List<String> authorization = accessor.getNativeHeader("Authorization");
              if (authorization == null || authorization.isEmpty()) {
                return message;
              }

              String token = authorization.get(0);
              if (token.startsWith("Bearer ")) {
                token = token.substring(7);
              }

              if (!jwtTokenUtil.validateToken(token)) {
                return message;
              }

              Claims claims = jwtTokenUtil.getClaims(token);
              Long userId = ((Number) claims.get("id")).longValue();
              String role = (String) claims.get("role");
              UsernamePasswordAuthenticationToken auth =
                  new UsernamePasswordAuthenticationToken(
                      userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
              accessor.setUser(auth);
            }

            return message;
          }
        });
  }
}
