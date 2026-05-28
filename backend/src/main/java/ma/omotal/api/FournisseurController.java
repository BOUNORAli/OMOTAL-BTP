package ma.omotal.api;

import java.util.List;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.repository.SupplierRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/fournisseurs")
public class FournisseurController {
  private final SupplierRepository suppliers;

  public FournisseurController(SupplierRepository suppliers) {
    this.suppliers = suppliers;
  }

  @GetMapping
  public List<CoreDtos.SupplierDto> list() {
    return suppliers.findByActiveTrueOrderByNameAsc().stream().map(Mapper::supplier).toList();
  }
}
