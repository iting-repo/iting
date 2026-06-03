package com.iting.jobportal.common.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StringDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import java.io.IOException;
import org.springframework.stereotype.Component;

/**
 * Jackson module that automatically trims and normalizes all incoming JSON string values:
 *
 * <ul>
 *   <li>Leading/trailing whitespace removed
 *   <li>Consecutive internal whitespace collapsed to single space
 *   <li>Blank strings converted to null
 * </ul>
 *
 * Applies globally to every {@code @RequestBody} DTO without annotation changes.
 */
@Component
public class StringTrimModule extends SimpleModule {

  public StringTrimModule() {
    addDeserializer(String.class, new TrimStringDeserializer());
  }

  private static class TrimStringDeserializer extends StringDeserializer {

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
      String value = super.deserialize(p, ctxt);
      return normalize(value);
    }

    /** Trim, collapse whitespace, and convert blank to null. */
    private String normalize(String value) {
      if (value == null) {
        return null;
      }
      // Trim leading/trailing
      String trimmed = value.trim();
      if (trimmed.isEmpty()) {
        return null;
      }
      // Collapse multiple whitespace to single space
      return trimmed.replaceAll("\\s+", " ");
    }
  }
}
