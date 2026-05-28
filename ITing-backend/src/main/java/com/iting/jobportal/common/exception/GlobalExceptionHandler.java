package com.iting.jobportal.common.exception;

import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import com.iting.jobportal.payment.service.CreditService;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  /** Insufficient credits → 402 Payment Required. FE handle để hiện CTA "Nạp credits". */
  @ExceptionHandler(CreditService.InsufficientCreditException.class)
  public ResponseEntity<Map<String, String>> handleInsufficientCredits(
      CreditService.InsufficientCreditException ex) {
    Map<String, String> body = new HashMap<>();
    body.put("error", ex.getMessage() != null ? ex.getMessage() : "Không đủ credits");
    body.put("code", "INSUFFICIENT_CREDITS");
    return new ResponseEntity<>(body, HttpStatus.PAYMENT_REQUIRED);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleValidationExceptions(
      MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult()
        .getAllErrors()
        .forEach(
            (error) -> {
              String fieldName = ((FieldError) error).getField();
              String errorMessage = error.getDefaultMessage();
              errors.put(fieldName, errorMessage);
            });
    return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleResourceNotFound(ResourceNotFoundException ex) {
    Map<String, String> body = new HashMap<>();
    body.put("error", ex.getMessage() != null ? ex.getMessage() : "Resource not found");
    return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> handleIllegalArgumentException(
      IllegalArgumentException ex) {
    Map<String, String> body = new HashMap<>();
    body.put("error", ex.getMessage() != null ? ex.getMessage() : "Invalid argument");
    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> handleResponseStatusException(
      ResponseStatusException ex) {
    Map<String, String> body = new HashMap<>();
    body.put("error", ex.getReason() != null ? ex.getReason() : ex.getMessage());
    return new ResponseEntity<>(body, ex.getStatusCode());
  }

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
    Map<String, String> body = new HashMap<>();
    body.put("error", ex.getMessage() != null ? ex.getMessage() : "Internal Server Error");
    return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, String>> handleException(Exception ex) {
    Map<String, String> body = new HashMap<>();
    body.put("error", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
    return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
