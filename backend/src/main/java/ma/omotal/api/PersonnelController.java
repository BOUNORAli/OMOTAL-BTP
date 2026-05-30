package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.List;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.EmployeeEntity;
import ma.omotal.domain.PersonnelTimesheetEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.EmployeeRepository;
import ma.omotal.repository.PersonnelAdvanceRepository;
import ma.omotal.repository.PersonnelTimesheetRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
  private final AuditService audit;

  public PersonnelController(
      EmployeeRepository employees,
      PersonnelTimesheetRepository timesheets,
      PersonnelAdvanceRepository advances,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit
  ) {
    this.employees = employees;
    this.timesheets = timesheets;
    this.advances = advances;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
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

  @PostMapping("/employees")
  public CoreDtos.EmployeeDto createEmployee(@Valid @RequestBody CoreDtos.CreateEmployeeRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    accessPolicy.requireChantier(user, request.chantierId());

    var item = new EmployeeEntity();
    item.setFirstName(request.firstName());
    item.setLastName(request.lastName());
    item.setPosition(request.position());
    item.setChantierId(request.chantierId());
    item.setRemunerationType(request.remunerationType());
    item.setMonthlySalary(request.monthlySalary());
    item.setDailySalary(request.dailySalary());
    item.setHourlySalary(request.hourlySalary());
    item.setActive(true);
    var saved = employees.save(item);
    audit.record(user.getId(), "personnel", "create_employee", "Employee", saved.getId(), saved.getFirstName() + " " + saved.getLastName());
    return Mapper.employee(saved);
  }

  @PostMapping("/timesheets")
  public CoreDtos.PersonnelTimesheetDto createTimesheet(@Valid @RequestBody CoreDtos.CreatePersonnelTimesheetRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE, Role.RESPONSABLE_CHANTIER);
    accessPolicy.requireChantier(user, request.chantierId());

    var employee = employees.findById(request.employeeId()).orElseThrow();
    accessPolicy.requireChantier(user, employee.getChantierId());

    var item = new PersonnelTimesheetEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setEmployeeId(request.employeeId());
    item.setHoursWorked(request.hoursWorked());
    item.setDayType(request.dayType());
    item.setAppliedRemunerationType(employee.getRemunerationType());
    item.setAppliedHourlyRate(employee.getHourlySalary());
    item.setAppliedDailyRate(employee.getDailySalary());
    item.setAppliedMonthlySalary(employee.getMonthlySalary());
    item.setStatus(request.submit() ? OperationStatus.VALIDE : OperationStatus.BROUILLON);
    var saved = timesheets.save(item);
    audit.record(user.getId(), "personnel", "create_timesheet", "PersonnelTimesheet", saved.getId(), saved.getDate().toString());
    return Mapper.personnelTimesheet(saved);
  }

  public record PersonnelPayload(
      List<CoreDtos.EmployeeDto> employees,
      List<CoreDtos.PersonnelTimesheetDto> timesheets,
      List<CoreDtos.PersonnelAdvanceDto> advances
  ) {
  }
}
