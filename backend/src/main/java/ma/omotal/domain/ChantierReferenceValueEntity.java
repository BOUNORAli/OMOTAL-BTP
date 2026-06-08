package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "chantier_reference_values")
public class ChantierReferenceValueEntity extends BaseEntity {
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private String category;
  @Column(name = "reference_value", nullable = false)
  private String value;
  @Column(nullable = false)
  private String normalizedValue;
  private String aliasOfValue;
  @Column(nullable = false)
  private boolean active = true;
  @Column(nullable = false)
  private int sortOrder = 0;

  public UUID getChantierId() { return chantierId; }
  public void setChantierId(UUID chantierId) { this.chantierId = chantierId; }
  public String getCategory() { return category; }
  public void setCategory(String category) { this.category = category; }
  public String getValue() { return value; }
  public void setValue(String value) { this.value = value; }
  public String getNormalizedValue() { return normalizedValue; }
  public void setNormalizedValue(String normalizedValue) { this.normalizedValue = normalizedValue; }
  public String getAliasOfValue() { return aliasOfValue; }
  public void setAliasOfValue(String aliasOfValue) { this.aliasOfValue = aliasOfValue; }
  public boolean isActive() { return active; }
  public void setActive(boolean active) { this.active = active; }
  public int getSortOrder() { return sortOrder; }
  public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
