package com.iting.jobportal.common.converter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import org.junit.jupiter.api.Test;

class StringListConverterTest {

  private final StringListConverter converter = new StringListConverter();

  @Test
  void convertToDatabaseColumn_withNullOrEmptyList_shouldReturnEmptyJsonArray() {
    assertEquals("[]", converter.convertToDatabaseColumn(null));
    assertEquals("[]", converter.convertToDatabaseColumn(List.of()));
  }

  @Test
  void convertToDatabaseColumn_withValues_shouldSerializeJson() {
    String result = converter.convertToDatabaseColumn(List.of("java", "spring"));

    assertEquals("[\"java\",\"spring\"]", result);
  }

  @Test
  void convertToEntityAttribute_withBlankInput_shouldReturnEmptyList() {
    assertIterableEquals(List.of(), converter.convertToEntityAttribute(null));
    assertIterableEquals(List.of(), converter.convertToEntityAttribute(" "));
  }

  @Test
  void convertToEntityAttribute_withJson_shouldDeserializeValues() {
    List<String> result = converter.convertToEntityAttribute("[\"java\",\"spring\"]");

    assertIterableEquals(List.of("java", "spring"), result);
  }

  @Test
  void convertToEntityAttribute_withInvalidJson_shouldThrowRuntimeException() {
    assertThrows(RuntimeException.class, () -> converter.convertToEntityAttribute("not-json"));
  }
}
