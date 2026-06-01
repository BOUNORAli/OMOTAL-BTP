package ma.omotal.api;

import java.util.ArrayList;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.enums.Role;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/imports")
public class ImportController {
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public ImportController(CurrentUserService currentUser, AccessPolicy accessPolicy, AuditService audit) {
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
  }

  @PostMapping("/preview")
  public CoreDtos.ImportPreviewDto preview(@RequestParam("file") MultipartFile file) throws Exception {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    var headers = new ArrayList<String>();
    var rows = new ArrayList<java.util.List<String>>();
    var errors = new ArrayList<String>();
    var formatter = new DataFormatter();

    try (var workbook = WorkbookFactory.create(file.getInputStream())) {
      var sheet = workbook.getSheetAt(0);
      var headerRow = sheet.getRow(sheet.getFirstRowNum());
      if (headerRow == null) {
        errors.add("Le fichier ne contient pas de ligne d'en-tete.");
      } else {
        for (var cell : headerRow) {
          headers.add(formatter.formatCellValue(cell));
        }
      }
      var maxRow = Math.min(sheet.getLastRowNum(), sheet.getFirstRowNum() + 10);
      for (int i = sheet.getFirstRowNum() + 1; i <= maxRow; i++) {
        var row = sheet.getRow(i);
        if (row == null) {
          continue;
        }
        var values = new ArrayList<String>();
        for (int j = 0; j < headers.size(); j++) {
          values.add(formatter.formatCellValue(row.getCell(j)));
        }
        rows.add(values);
      }
      audit.record(user.getId(), "imports", "preview", "ImportFile", user.getId(), file.getOriginalFilename());
      return new CoreDtos.ImportPreviewDto(file.getOriginalFilename(), sheet.getSheetName(), headers, rows, errors);
    }
  }
}
