package com.iting.jobportal.job.controller;

import com.iting.jobportal.auth.security.AuthUser; // principal bạn set trong JwtAuthFilter
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

  @Override
  public boolean supportsParameter(MethodParameter parameter) {
    return (parameter.hasParameterAnnotation(CurrentUser.class)
            || parameter.hasParameterAnnotation(
                com.iting.jobportal.user.controller.CurrentUser.class))
        && (Long.class.isAssignableFrom(parameter.getParameterType())
            || String.class.isAssignableFrom(parameter.getParameterType()));
  }

  @Override
  public Object resolveArgument(
      MethodParameter parameter,
      ModelAndViewContainer mavContainer,
      NativeWebRequest webRequest,
      WebDataBinderFactory binderFactory) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || auth.getPrincipal() == null) return null;

    Object principal = auth.getPrincipal();
    if (!(principal instanceof AuthUser)) {
      return null;
    }

    AuthUser user = (AuthUser) principal;
    if (Long.class.isAssignableFrom(parameter.getParameterType())) {
      return user.getId();
    }
    if (String.class.isAssignableFrom(parameter.getParameterType())) {
      return user.getUsername();
    }
    return null;
  }
}
