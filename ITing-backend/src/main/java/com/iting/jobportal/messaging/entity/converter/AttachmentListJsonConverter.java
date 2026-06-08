package com.iting.jobportal.messaging.entity.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.messaging.dto.AttachmentDto;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.List;

/** Lưu danh sách attachment dưới dạng JSON text trong cột messages.attachments. */
@Converter
public class AttachmentListJsonConverter
    implements AttributeConverter<List<AttachmentDto>, String> {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(List<AttachmentDto> attribute) {
    if (attribute == null || attribute.isEmpty()) return null;
    try {
      return MAPPER.writeValueAsString(attribute);
    } catch (Exception e) {
      return null;
    }
  }

  @Override
  public List<AttachmentDto> convertToEntityAttribute(String dbData) {
    if (dbData == null || dbData.isBlank()) return null;
    try {
      return MAPPER.readValue(dbData, new TypeReference<List<AttachmentDto>>() {});
    } catch (Exception e) {
      return null;
    }
  }
}
