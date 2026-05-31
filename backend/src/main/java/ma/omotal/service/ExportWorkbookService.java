package ma.omotal.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.ChantierEntity;
import ma.omotal.domain.EmployeeEntity;
import ma.omotal.domain.EquipmentEntity;
import ma.omotal.domain.EquipmentTimesheetEntity;
import ma.omotal.domain.GasoilEntryEntity;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.PersonnelTimesheetEntity;
import ma.omotal.domain.enums.TransactionType;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class ExportWorkbookService {
  public byte[] caisse(
      ExportMetadata metadata,
      List<CaisseTransactionEntity> items
  ) {
    try (var workbook = new XSSFWorkbook()) {
      var styles = styles(workbook);
      var sheet = startSheet(workbook, styles, metadata, "Caisse");
      var rowIndex = writeHeaders(sheet, styles, 8,
          "Date", "Type", "Categorie", "Description", "Mode", "Debit MAD", "Credit MAD", "Statut", "Justificatif");
      var dataStart = rowIndex + 1;

      for (var item : items) {
        var row = sheet.createRow(++rowIndex);
        date(row, 0, item.getDate(), styles.date);
        text(row, 1, item.getType().name(), styles.body);
        text(row, 2, item.getCategory().name(), styles.body);
        text(row, 3, item.getDescription(), styles.body);
        text(row, 4, item.getPaymentMode().name(), styles.body);
        money(row, 5, item.getType() == TransactionType.DEBIT ? item.getAmount() : BigDecimal.ZERO, styles.money);
        money(row, 6, item.getType() == TransactionType.CREDIT ? item.getAmount() : BigDecimal.ZERO, styles.money);
        text(row, 7, item.getStatus().name(), styles.body);
        text(row, 8, item.isHasDocument() ? "Oui" : "Non", styles.body);
      }

      writeTotals(sheet, styles, ++rowIndex, dataStart, rowIndex - 1, Map.of(5, "Total debit", 6, "Total credit"));
      autosize(sheet, 9);
      return bytes(workbook);
    } catch (IOException exception) {
      throw new IllegalStateException("Generation Excel impossible.", exception);
    }
  }

  public byte[] gasoil(
      ExportMetadata metadata,
      List<GasoilEntryEntity> entries,
      List<GasoilExitEntity> exits
  ) {
    try (var workbook = new XSSFWorkbook()) {
      var styles = styles(workbook);
      var sheet = startSheet(workbook, styles, metadata, "Gasoil");
      var rowIndex = writeHeaders(sheet, styles, 8,
          "Type", "Date", "Bon", "Litres entree", "Litres sortie", "PU MAD", "Montant MAD", "Affectation / Responsable", "Statut", "Justificatif");
      var dataStart = rowIndex + 1;

      for (var item : entries) {
        var row = sheet.createRow(++rowIndex);
        text(row, 0, "ENTREE", styles.body);
        date(row, 1, item.getDate(), styles.date);
        text(row, 2, item.getReceiptNumber(), styles.body);
        decimal(row, 3, item.getLiters(), styles.decimal);
        decimal(row, 4, BigDecimal.ZERO, styles.decimal);
        money(row, 5, item.getUnitPrice(), styles.money);
        money(row, 6, item.getLiters().multiply(item.getUnitPrice()), styles.money);
        text(row, 7, "", styles.body);
        text(row, 8, item.getStatus().name(), styles.body);
        text(row, 9, item.isHasDocument() ? "Oui" : "Non", styles.body);
      }

      for (var item : exits) {
        var row = sheet.createRow(++rowIndex);
        text(row, 0, "SORTIE", styles.body);
        date(row, 1, item.getDate(), styles.date);
        text(row, 2, item.getExitNumber(), styles.body);
        decimal(row, 3, BigDecimal.ZERO, styles.decimal);
        decimal(row, 4, item.getLiters(), styles.decimal);
        money(row, 5, item.getUnitPrice(), styles.money);
        money(row, 6, item.getLiters().multiply(item.getUnitPrice()), styles.money);
        text(row, 7, item.getAllocation() + " / " + item.getResponsible(), styles.body);
        text(row, 8, item.getStatus().name(), styles.body);
        text(row, 9, item.isHasDocument() ? "Oui" : "Non", styles.body);
      }

      writeTotals(sheet, styles, ++rowIndex, dataStart, rowIndex - 1,
          Map.of(3, "Total entrees L", 4, "Total sorties L", 6, "Total MAD"));
      autosize(sheet, 10);
      return bytes(workbook);
    } catch (IOException exception) {
      throw new IllegalStateException("Generation Excel impossible.", exception);
    }
  }

  public byte[] personnel(
      ExportMetadata metadata,
      List<PersonnelTimesheetEntity> timesheets,
      Map<UUID, EmployeeEntity> employees
  ) {
    try (var workbook = new XSSFWorkbook()) {
      var styles = styles(workbook);
      var sheet = startSheet(workbook, styles, metadata, "Pointage personnel");
      var rowIndex = writeHeaders(sheet, styles, 8,
          "Date", "Employe", "Heures", "Type journee", "Remuneration", "Montant du MAD", "Statut");
      var dataStart = rowIndex + 1;

      for (var item : timesheets) {
        var employee = employees.get(item.getEmployeeId());
        var row = sheet.createRow(++rowIndex);
        date(row, 0, item.getDate(), styles.date);
        text(row, 1, employee == null ? item.getEmployeeId().toString() : employee.getFirstName() + " " + employee.getLastName(), styles.body);
        decimal(row, 2, item.getHoursWorked(), styles.decimal);
        text(row, 3, item.getDayType().name(), styles.body);
        text(row, 4, item.getAppliedRemunerationType().name(), styles.body);
        money(row, 5, CalculationService.calculatePersonnelDue(item), styles.money);
        text(row, 6, item.getStatus().name(), styles.body);
      }

      writeTotals(sheet, styles, ++rowIndex, dataStart, rowIndex - 1,
          Map.of(2, "Total heures", 5, "Total du MAD"));
      autosize(sheet, 7);
      return bytes(workbook);
    } catch (IOException exception) {
      throw new IllegalStateException("Generation Excel impossible.", exception);
    }
  }

  public byte[] engins(
      ExportMetadata metadata,
      List<EquipmentTimesheetEntity> timesheets,
      Map<UUID, EquipmentEntity> equipment
  ) {
    try (var workbook = new XSSFWorkbook()) {
      var styles = styles(workbook);
      var sheet = startSheet(workbook, styles, metadata, "Pointage engins");
      var rowIndex = writeHeaders(sheet, styles, 8,
          "Date", "Engin", "Chauffeur", "Mode", "Heures", "Jours", "Activite", "Cout MAD", "Statut");
      var dataStart = rowIndex + 1;

      for (var item : timesheets) {
        var machine = equipment.get(item.getEquipmentId());
        var row = sheet.createRow(++rowIndex);
        date(row, 0, item.getDate(), styles.date);
        text(row, 1, machine == null ? item.getEquipmentId().toString() : machine.getDesignation(), styles.body);
        text(row, 2, item.getDriver(), styles.body);
        text(row, 3, item.getAppliedBillingMode().name(), styles.body);
        decimal(row, 4, item.getHoursWorked(), styles.decimal);
        decimal(row, 5, item.getDaysBilled(), styles.decimal);
        text(row, 6, item.getActivityType(), styles.body);
        money(row, 7, CalculationService.calculateEquipmentCost(item), styles.money);
        text(row, 8, item.getStatus().name(), styles.body);
      }

      writeTotals(sheet, styles, ++rowIndex, dataStart, rowIndex - 1,
          Map.of(4, "Total heures", 5, "Total jours", 7, "Total cout MAD"));
      autosize(sheet, 9);
      return bytes(workbook);
    } catch (IOException exception) {
      throw new IllegalStateException("Generation Excel impossible.", exception);
    }
  }

  public byte[] dashboard(ExportMetadata metadata, CoreDtos.DashboardSummaryDto summary) {
    try (var workbook = new XSSFWorkbook()) {
      var styles = styles(workbook);
      var sheet = startSheet(workbook, styles, metadata, "Dashboard chantier");
      var rowIndex = writeHeaders(sheet, styles, 8, "Indicateur", "Valeur");

      kpi(sheet.createRow(++rowIndex), "Solde caisse MAD", summary.cashBalance(), styles);
      kpi(sheet.createRow(++rowIndex), "Caisse credits MAD", summary.cashCredit(), styles);
      kpi(sheet.createRow(++rowIndex), "Caisse debits MAD", summary.cashDebit(), styles);
      kpi(sheet.createRow(++rowIndex), "Stock gasoil L", summary.gasoilStockLiters(), styles);
      kpi(sheet.createRow(++rowIndex), "Gasoil entre L", summary.gasoilInputLiters(), styles);
      kpi(sheet.createRow(++rowIndex), "Gasoil sorti L", summary.gasoilOutputLiters(), styles);
      kpi(sheet.createRow(++rowIndex), "Personnel du MAD", summary.personnelDue(), styles);
      kpi(sheet.createRow(++rowIndex), "Avances personnel MAD", summary.personnelAdvances(), styles);
      kpi(sheet.createRow(++rowIndex), "Cout engins MAD", summary.equipmentCost(), styles);
      kpi(sheet.createRow(++rowIndex), "Validations en attente", BigDecimal.valueOf(summary.pendingValidations()), styles);

      rowIndex += 2;
      rowIndex = writeHeaders(sheet, styles, rowIndex, "Alerte", "Module", "Severite", "Description");
      for (var alert : summary.alerts()) {
        var row = sheet.createRow(++rowIndex);
        text(row, 0, alert.title(), styles.body);
        text(row, 1, alert.module(), styles.body);
        text(row, 2, alert.severity(), styles.body);
        text(row, 3, alert.description(), styles.body);
      }

      autosize(sheet, 4);
      return bytes(workbook);
    } catch (IOException exception) {
      throw new IllegalStateException("Generation Excel impossible.", exception);
    }
  }

  private Sheet startSheet(Workbook workbook, Styles styles, ExportMetadata metadata, String sheetName) {
    var sheet = workbook.createSheet(sheetName);
    sheet.setDisplayGridlines(false);
    var title = sheet.createRow(0);
    title.setHeightInPoints(24);
    text(title, 0, metadata.title(), styles.title);
    sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 8));

    metadata(sheet.createRow(2), "Chantier", metadata.chantier().getName(), styles);
    metadata(sheet.createRow(3), "Code chantier", metadata.chantier().getCode(), styles);
    metadata(sheet.createRow(4), "Periode", period(metadata.from(), metadata.to()), styles);
    metadata(sheet.createRow(5), "Genere par", metadata.generatedBy(), styles);
    metadata(sheet.createRow(6), "Date generation", OffsetDateTime.now().toString(), styles);
    metadata(sheet.createRow(7), "Filtre", metadata.onlyValidated() ? "Operations validees uniquement" : "Toutes les operations", styles);
    return sheet;
  }

  private int writeHeaders(Sheet sheet, Styles styles, int rowIndex, String... headers) {
    var row = sheet.createRow(rowIndex);
    row.setHeightInPoints(20);
    for (var index = 0; index < headers.length; index++) {
      text(row, index, headers[index], styles.header);
    }
    return rowIndex;
  }

  private void writeTotals(Sheet sheet, Styles styles, int rowIndex, int dataStart, int dataEnd, Map<Integer, String> totals) {
    var row = sheet.createRow(rowIndex);
    text(row, 0, "Totaux", styles.total);
    for (var entry : totals.entrySet()) {
      var cell = row.createCell(entry.getKey());
      if (dataEnd >= dataStart) {
        var column = columnName(entry.getKey());
        cell.setCellFormula("SUM(" + column + (dataStart + 1) + ":" + column + (dataEnd + 1) + ")");
      } else {
        cell.setCellValue(0);
      }
      cell.setCellStyle(styles.totalNumber);
    }
  }

  private void metadata(Row row, String label, String value, Styles styles) {
    text(row, 0, label, styles.metaLabel);
    text(row, 1, value, styles.metaValue);
  }

  private void kpi(Row row, String label, BigDecimal value, Styles styles) {
    text(row, 0, label, styles.body);
    decimal(row, 1, value, styles.money);
  }

  private void text(Row row, int column, String value, CellStyle style) {
    var cell = row.createCell(column);
    cell.setCellValue(value == null ? "" : value);
    cell.setCellStyle(style);
  }

  private void date(Row row, int column, LocalDate value, CellStyle style) {
    var cell = row.createCell(column);
    if (value != null) {
      cell.setCellValue(value);
    }
    cell.setCellStyle(style);
  }

  private void decimal(Row row, int column, BigDecimal value, CellStyle style) {
    var cell = row.createCell(column);
    cell.setCellValue(value == null ? 0 : value.doubleValue());
    cell.setCellStyle(style);
  }

  private void money(Row row, int column, BigDecimal value, CellStyle style) {
    decimal(row, column, value, style);
  }

  private void autosize(Sheet sheet, int columns) {
    for (var index = 0; index < columns; index++) {
      sheet.autoSizeColumn(index);
      sheet.setColumnWidth(index, Math.min(Math.max(sheet.getColumnWidth(index), 2800), 9000));
    }
  }

  private byte[] bytes(Workbook workbook) throws IOException {
    try (var output = new ByteArrayOutputStream()) {
      workbook.write(output);
      return output.toByteArray();
    }
  }

  private String period(LocalDate from, LocalDate to) {
    if (from == null && to == null) {
      return "Toutes periodes";
    }
    if (from == null) {
      return "Jusqu'au " + to;
    }
    if (to == null) {
      return "Depuis le " + from;
    }
    return from + " au " + to;
  }

  private String columnName(int zeroBasedColumn) {
    var column = zeroBasedColumn + 1;
    var name = new StringBuilder();
    while (column > 0) {
      var remainder = (column - 1) % 26;
      name.insert(0, (char) ('A' + remainder));
      column = (column - 1) / 26;
    }
    return name.toString();
  }

  private Styles styles(Workbook workbook) {
    var titleFont = font(workbook, IndexedColors.DARK_BLUE, true, 16);
    var headerFont = font(workbook, IndexedColors.WHITE, true, 11);
    var strongFont = font(workbook, IndexedColors.DARK_BLUE, true, 11);
    var bodyFont = font(workbook, IndexedColors.BLACK, false, 10);

    var title = workbook.createCellStyle();
    title.setFont(titleFont);
    title.setVerticalAlignment(VerticalAlignment.CENTER);

    var header = bordered(workbook);
    header.setFont(headerFont);
    header.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
    header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    header.setAlignment(HorizontalAlignment.CENTER);

    var body = bordered(workbook);
    body.setFont(bodyFont);

    var metaLabel = workbook.createCellStyle();
    metaLabel.setFont(strongFont);

    var metaValue = workbook.createCellStyle();
    metaValue.setFont(bodyFont);

    var date = bordered(workbook);
    date.setFont(bodyFont);
    date.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("yyyy-mm-dd"));

    var decimal = bordered(workbook);
    decimal.setFont(bodyFont);
    decimal.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("#,##0.00"));

    var money = bordered(workbook);
    money.setFont(bodyFont);
    money.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("#,##0.00"));

    var total = bordered(workbook);
    total.setFont(strongFont);
    total.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
    total.setFillPattern(FillPatternType.SOLID_FOREGROUND);

    var totalNumber = bordered(workbook);
    totalNumber.setFont(strongFont);
    totalNumber.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("#,##0.00"));
    totalNumber.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
    totalNumber.setFillPattern(FillPatternType.SOLID_FOREGROUND);

    return new Styles(title, header, body, metaLabel, metaValue, date, decimal, money, total, totalNumber);
  }

  private Font font(Workbook workbook, IndexedColors color, boolean bold, int size) {
    var font = workbook.createFont();
    font.setColor(color.getIndex());
    font.setBold(bold);
    font.setFontHeightInPoints((short) size);
    return font;
  }

  private CellStyle bordered(Workbook workbook) {
    var style = workbook.createCellStyle();
    style.setBorderTop(BorderStyle.THIN);
    style.setBorderRight(BorderStyle.THIN);
    style.setBorderBottom(BorderStyle.THIN);
    style.setBorderLeft(BorderStyle.THIN);
    style.setWrapText(true);
    style.setVerticalAlignment(VerticalAlignment.CENTER);
    return style;
  }

  public record ExportMetadata(
      String title,
      ChantierEntity chantier,
      LocalDate from,
      LocalDate to,
      String generatedBy,
      boolean onlyValidated
  ) {
  }

  private record Styles(
      CellStyle title,
      CellStyle header,
      CellStyle body,
      CellStyle metaLabel,
      CellStyle metaValue,
      CellStyle date,
      CellStyle decimal,
      CellStyle money,
      CellStyle total,
      CellStyle totalNumber
  ) {
  }
}
