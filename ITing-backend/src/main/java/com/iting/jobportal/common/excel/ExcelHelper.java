package com.iting.jobportal.common.excel;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class ExcelHelper {

  /** Xuất dữ liệu ra Excel định dạng XSPF (xlsx). */
  public static <T> ByteArrayInputStream dataToExcel(
      List<T> items, String[] headers, String sheetName, BiConsumer<T, Row> rowMapper) {
    Workbook workbook = new XSSFWorkbook();
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    try {
      Sheet sheet = workbook.createSheet(sheetName);

      // Header row
      Row headerRow = sheet.createRow(0);
      CellStyle headerCellStyle = workbook.createCellStyle();
      headerCellStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
      headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

      Font font = workbook.createFont();
      font.setBold(true);
      headerCellStyle.setFont(font);

      for (int col = 0; col < headers.length; col++) {
        Cell cell = headerRow.createCell(col);
        cell.setCellValue(headers[col]);
        cell.setCellStyle(headerCellStyle);
      }

      // Data rows
      int rowIdx = 1;
      for (T item : items) {
        Row row = sheet.createRow(rowIdx++);
        rowMapper.accept(item, row);
      }

      // Auto-size columns
      for (int i = 0; i < headers.length; i++) {
        try {
          sheet.autoSizeColumn(i);
        } catch (Exception e) {
          // Ignore auto-size errors
        }
      }

      workbook.write(out);
      return new ByteArrayInputStream(out.toByteArray());
    } catch (IOException e) {
      throw new RuntimeException("fail to export data to Excel file: " + e.getMessage());
    } finally {
      try {
        workbook.close();
        out.close();
      } catch (IOException e) {
        // Ignore close errors
      }
    }
  }

  /** Đọc dữ liệu từ file Excel. */
  public static <T> List<T> excelToData(InputStream is, Function<Row, T> rowMapper) {
    try (Workbook workbook = new XSSFWorkbook(is)) {
      Sheet sheet = workbook.getSheetAt(0);
      List<T> items = new ArrayList<>();

      for (int i = 1; i <= sheet.getLastRowNum(); i++) {
        Row row = sheet.getRow(i);
        if (row == null) continue;
        T item = rowMapper.apply(row);
        if (item != null) {
          items.add(item);
        }
      }
      return items;
    } catch (IOException e) {
      throw new RuntimeException("fail to parse Excel file: " + e.getMessage());
    }
  }

  /** Tạo file mẫu Excel chỉ có header. */
  public static ByteArrayInputStream createTemplate(String[] headers, String sheetName) {
    return dataToExcel(new ArrayList<>(), headers, sheetName, (item, row) -> {});
  }
}
