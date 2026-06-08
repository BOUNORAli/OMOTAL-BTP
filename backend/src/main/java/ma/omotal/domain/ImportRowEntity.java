package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "import_rows")
public class ImportRowEntity extends BaseEntity {
  @Column(nullable = false)
  private UUID batchId;
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private String sheetName;
  @Column(nullable = false)
  private String module;
  @Column(nullable = false)
  private int sourceRowNumber;
  @Column(nullable = false)
  private String rowStatus;
  @Column(nullable = false)
  private String severity;
  @Column(columnDefinition = "text")
  private String errors;
  @Column(columnDefinition = "text")
  private String rawValues;
  private String detectedKey;
  private String importedTargetType;
  private UUID importedTargetId;

  public UUID getBatchId() { return batchId; }
  public void setBatchId(UUID batchId) { this.batchId = batchId; }
  public UUID getChantierId() { return chantierId; }
  public void setChantierId(UUID chantierId) { this.chantierId = chantierId; }
  public String getSheetName() { return sheetName; }
  public void setSheetName(String sheetName) { this.sheetName = sheetName; }
  public String getModule() { return module; }
  public void setModule(String module) { this.module = module; }
  public int getSourceRowNumber() { return sourceRowNumber; }
  public void setSourceRowNumber(int sourceRowNumber) { this.sourceRowNumber = sourceRowNumber; }
  public String getRowStatus() { return rowStatus; }
  public void setRowStatus(String rowStatus) { this.rowStatus = rowStatus; }
  public String getSeverity() { return severity; }
  public void setSeverity(String severity) { this.severity = severity; }
  public String getErrors() { return errors; }
  public void setErrors(String errors) { this.errors = errors; }
  public String getRawValues() { return rawValues; }
  public void setRawValues(String rawValues) { this.rawValues = rawValues; }
  public String getDetectedKey() { return detectedKey; }
  public void setDetectedKey(String detectedKey) { this.detectedKey = detectedKey; }
  public String getImportedTargetType() { return importedTargetType; }
  public void setImportedTargetType(String importedTargetType) { this.importedTargetType = importedTargetType; }
  public UUID getImportedTargetId() { return importedTargetId; }
  public void setImportedTargetId(UUID importedTargetId) { this.importedTargetId = importedTargetId; }
}
