package ma.omotal.api;

import java.util.List;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.repository.EquipmentRepository;
import ma.omotal.repository.EquipmentTimesheetRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/engins")
public class EnginsController {
  private final EquipmentRepository equipment;
  private final EquipmentTimesheetRepository timesheets;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;

  public EnginsController(
      EquipmentRepository equipment,
      EquipmentTimesheetRepository timesheets,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy
  ) {
    this.equipment = equipment;
    this.timesheets = timesheets;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
  }

  @GetMapping
  public EquipmentPayload list() {
    var user = currentUser.currentUser();
    var ids = accessPolicy.authorizedChantierIds(user);
    var equipmentData = ids.isEmpty() ? equipment.findAll() : equipment.findByChantierIdIn(ids);
    var timesheetData = ids.isEmpty() ? timesheets.findAll() : timesheets.findByChantierIdIn(ids);
    return new EquipmentPayload(
        equipmentData.stream().map(Mapper::equipment).toList(),
        timesheetData.stream().map(Mapper::equipmentTimesheet).toList()
    );
  }

  public record EquipmentPayload(List<CoreDtos.EquipmentDto> equipment, List<CoreDtos.EquipmentTimesheetDto> timesheets) {
  }
}
