package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "import_batches")
public class ImportBatchEntity extends BaseEntity {
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private String fileName;
  @Column(nullable = false)
  private String workbookRole;
  @Column(nullable = false)
  private String status;
  @Column(nullable = false)
  private int totalSheets;
  @Column(nullable = false)
  private int totalRows;
  @Column(nullable = false)
  private int validRows;
  @Column(nullable = false)
  private int warningRows;
  @Column(nullable = false)
  private int blockedRows;
  private OffsetDateTime committedAt;
  @Column(nullable = false)
  private UUID createdByUserId;

  public UUID getChantierId() { return chantierId; }
  public void setChantierId(UUID chantierId) { this.chantierId = chantierId; }
  public String getFileName() { return fileName; }
  public void setFileName(String fileName) { this.fileName = fileName; }
  public String getWorkbookRole() { return workbookRole; }
  public void setWorkbookRole(String workbookRole) { this.workbookRole = workbookRole; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public int getTotalSheets() { return totalSheets; }
  public void setTotalSheets(int totalSheets) { this.totalSheets = totalSheets; }
  public int getTotalRows() { return totalRows; }
  public void setTotalRows(int totalRows) { this.totalRows = totalRows; }
  public int getValidRows() { return validRows; }
  public void setValidRows(int validRows) { this.validRows = validRows; }
  public int getWarningRows() { return warningRows; }
  public void setWarningRows(int warningRows) { this.warningRows = warningRows; }
  public int getBlockedRows() { return blockedRows; }
  public void setBlockedRows(int blockedRows) { this.blockedRows = blockedRows; }
  public OffsetDateTime getCommittedAt() { return committedAt; }
  public void setCommittedAt(OffsetDateTime committedAt) { this.committedAt = committedAt; }
  public UUID getCreatedByUserId() { return createdByUserId; }
  public void setCreatedByUserId(UUID createdByUserId) { this.createdByUserId = createdByUserId; }
}
