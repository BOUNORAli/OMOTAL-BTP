package ma.omotal;

import static org.assertj.core.api.Assertions.assertThat;

import ma.omotal.repository.ChantierRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class SchemaSmokeTest {
  @Autowired
  private ChantierRepository chantiers;

  @Test
  void contextStartsWithFlywaySchema() {
    assertThat(chantiers.count()).isZero();
  }
}
