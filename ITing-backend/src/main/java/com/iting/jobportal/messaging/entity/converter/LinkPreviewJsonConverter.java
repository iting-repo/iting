package com.iting.jobportal.messaging.entity.converter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.messaging.dto.LinkPreviewDto;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Lưu link preview dưới dạng JSON text trong cột messages.link_preview. */
@Converter
public class LinkPreviewJsonConverter implements AttributeConverter<LinkPreviewDto, String> {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(LinkPreviewDto attribute) {
    if (attribute == null) return null;
    try {
      return MAPPER.writeValueAsString(attribute);
    } catch (Exception e) {
      return null;
    }
  }

  @Override
  public LinkPreviewDto convertToEntityAttribute(String dbData) {
    if (dbData == null || dbData.isBlank()) return null;
    try {
      return MAPPER.readValue(dbData, LinkPreviewDto.class);
    } catch (Exception e) {
      return null;
    }
  }
}
