package com.iting.jobportal.common.config;

import org.springframework.beans.propertyeditors.StringTrimmerEditor;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.InitBinder;

/**
 * Global controller advice that trims all String parameters from query-string, form-data, and path
 * variables.
 *
 * <p>Empty strings → null (second param = true). Complements {@link StringTrimModule} which handles
 * JSON bodies.
 */
@ControllerAdvice
public class StringTrimAdvice {

  @InitBinder
  public void initBinder(WebDataBinder binder) {
    // true = convert empty strings to null
    binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
  }
}
