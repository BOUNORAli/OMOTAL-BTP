package ma.omotal.api;

import java.util.List;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.repository.EmployeeRepository;
import ma.omotal.repository.PersonnelAdvanceRepository;
import ma.omotal.repository.PersonnelTimesheetRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/personnel")
public class PersonnelController {
  private final EmployeeRepository employees;
  private final PersonnelTimesheetRepository timesheets;
  private final PersonnelAdvanceRepository advances;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;

  public PersonnelController(
      EmployeeRepository employees,
      PersonnelTimesheetRepository timesheets,
      PersonnelAdvanceRepository advances,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy
  ) {
    this.employees = employees;
    this.timesheets = timesheets;
    this.advances = advances;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
  }

  @GetMapping
  public PersonnelPayload list() {
    var user = currentUser.currentUser();
    var ids = accessPolicy.authorizedChantierIds(user);
    var employeeData = ids.isEmpty() ? employees.findAll() : employees.findByChantierIdIn(ids);
    var timesheetData = ids.isEmpty() ? timesheets.findAll() : timesheets.findByChantierIdIn(ids);
    var advanceData = ids.isEmpty() ? advances.findAll() : advances.findByChantierIdIn(ids);
    return new PersonnelPayload(
        employeeData.stream().map(Mapper::employee).toList(),
        timesheetData.stream().map(Mapper::personnelTimesheet).toList(),
        advanceData.stream().map(Mapper::personnelAdvance).toList()
    );
  }

  public record PersonnelPayload(
      List<CoreDtos.EmployeeDto> employees,
      List<CoreDtos.PersonnelTimesheetDto> timesheets,
      List<CoreDtos.PersonnelAdvanceDto> advances
  ) {
  }
}
