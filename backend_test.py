"""Backend API tests for OMOTAL TRAVAUX Phase 3 features.
Tests Production, Matières/Fournisseurs, and BQ modules.
"""
import requests
import sys
from datetime import datetime, timedelta

BASE_URL = "https://site-ops-hub-4.preview.emergentagent.com/api"

class Phase3Tester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tokens = {}
        self.test_data = {}
        
    def log(self, msg, status="INFO"):
        prefix = {"INFO": "ℹ️", "PASS": "✅", "FAIL": "❌", "WARN": "⚠️"}
        print(f"{prefix.get(status, 'ℹ️')} {msg}")
    
    def test(self, name, method, endpoint, expected_status, data=None, token=None, check_field=None):
        """Run a single API test."""
        url = f"{BASE_URL}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        self.tests_run += 1
        self.log(f"Testing {name}...", "INFO")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                result = response.json() if response.text else {}
                if check_field and check_field not in result:
                    self.log(f"PASS but missing field '{check_field}' - Status: {response.status_code}", "WARN")
                    return False, result
                self.log(f"PASS - Status: {response.status_code}", "PASS")
                return True, result
            else:
                self.log(f"FAIL - Expected {expected_status}, got {response.status_code}", "FAIL")
                if response.text:
                    self.log(f"Response: {response.text[:200]}", "INFO")
                return False, {}
        except Exception as e:
            self.log(f"FAIL - Error: {str(e)}", "FAIL")
            return False, {}
    
    def login(self, email, password, role_name):
        """Login and store token."""
        self.log(f"\n=== Logging in as {role_name} ({email}) ===", "INFO")
        success, response = self.test(
            f"Login {role_name}",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.tokens[role_name] = response['access_token']
            return True
        return False
    
    def test_production_module(self):
        """Test Production & Rendements module."""
        self.log("\n\n========== TESTING PRODUCTION MODULE ==========", "INFO")
        
        token = self.tokens.get('SUPER_ADMIN')
        if not token:
            self.log("No SUPER_ADMIN token, skipping production tests", "WARN")
            return
        
        # 1. List productions
        success, prods = self.test("GET /production", "GET", "production", 200, token=token)
        
        # 2. Get production summary
        success, summary = self.test("GET /production/summary", "GET", "production/summary", 200, token=token)
        if success:
            # Check summary structure
            if 'by_unit' in summary and 'by_engin' in summary and 'by_work_type' in summary and 'by_voie' in summary:
                self.log("Summary structure correct (by_unit, by_engin, by_work_type, by_voie)", "PASS")
                self.tests_passed += 1
            else:
                self.log("Summary missing required fields", "FAIL")
            self.tests_run += 1
            
            # Check rendement in by_engin
            if summary.get('by_engin') and len(summary['by_engin']) > 0:
                if 'rendement' in summary['by_engin'][0]:
                    self.log("Rendement field present in by_engin", "PASS")
                    self.tests_passed += 1
                else:
                    self.log("Rendement field missing in by_engin", "FAIL")
                self.tests_run += 1
        
        # 3. List voies
        success, voies = self.test("GET /production/voies", "GET", "production/voies", 200, token=token)
        
        # 4. Create voie
        voie_data = {
            "chantier_id": "test_chantier",
            "name": f"Voie Test {datetime.now().strftime('%H%M%S')}",
            "description": "Test voie"
        }
        success, voie = self.test("POST /production/voies", "POST", "production/voies", 200, data=voie_data, token=token)
        if success:
            self.test_data['voie_id'] = voie.get('id')
        
        # 5. Create production with auto-computed quantity (M3)
        prod_data = {
            "chantier_id": "test_chantier",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "voie": "Voie 1",
            "work_type": "DECAPAGE",
            "unit": "M3",
            "length": 10.0,
            "width": 5.0,
            "depth": 2.0,
            "hours": 8.0
        }
        success, prod = self.test("POST /production (M3 auto-compute)", "POST", "production", 200, data=prod_data, token=token)
        if success:
            self.test_data['production_id'] = prod.get('id')
            # Check auto-computed quantity (10*5*2 = 100)
            if prod.get('quantity') == 100.0:
                self.log("Quantity auto-computed correctly for M3 (10*5*2=100)", "PASS")
                self.tests_passed += 1
            else:
                self.log(f"Quantity auto-compute FAIL: expected 100, got {prod.get('quantity')}", "FAIL")
            self.tests_run += 1
            
            # Check rendement (100/8 = 12.5)
            if prod.get('rendement') == 12.5:
                self.log("Rendement computed correctly (100/8=12.5)", "PASS")
                self.tests_passed += 1
            else:
                self.log(f"Rendement compute FAIL: expected 12.5, got {prod.get('rendement')}", "FAIL")
            self.tests_run += 1
            
            # Check status is SOUMIS
            if prod.get('status') == 'SOUMIS':
                self.log("Production created with SOUMIS status", "PASS")
                self.tests_passed += 1
            else:
                self.log(f"Status FAIL: expected SOUMIS, got {prod.get('status')}", "FAIL")
            self.tests_run += 1
        
        # 6. Create production with M2 unit
        prod_m2_data = {
            "chantier_id": "test_chantier",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "work_type": "REGLAGE",
            "unit": "M2",
            "length": 20.0,
            "width": 3.0
        }
        success, prod_m2 = self.test("POST /production (M2 auto-compute)", "POST", "production", 200, data=prod_m2_data, token=token)
        if success:
            # Check auto-computed quantity (20*3 = 60)
            if prod_m2.get('quantity') == 60.0:
                self.log("Quantity auto-computed correctly for M2 (20*3=60)", "PASS")
                self.tests_passed += 1
            else:
                self.log(f"M2 auto-compute FAIL: expected 60, got {prod_m2.get('quantity')}", "FAIL")
            self.tests_run += 1
        
        # 7. Test POINTEUR creates SOUMIS
        pointeur_token = self.tokens.get('POINTEUR')
        if pointeur_token:
            prod_pointeur = {
                "chantier_id": "test_chantier",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "work_type": "DEBLAI",
                "unit": "M3",
                "quantity": 50
            }
            success, prod_p = self.test("POST /production as POINTEUR", "POST", "production", 200, data=prod_pointeur, token=pointeur_token)
            if success and prod_p.get('status') == 'SOUMIS':
                self.log("POINTEUR creates production with SOUMIS status", "PASS")
                self.tests_passed += 1
                self.test_data['production_pointeur_id'] = prod_p.get('id')
            else:
                self.log("POINTEUR production status check FAIL", "FAIL")
            self.tests_run += 1
        
        # 8. Test RESPONSABLE_CHANTIER validates production
        chef_token = self.tokens.get('RESPONSABLE_CHANTIER')
        if chef_token and self.test_data.get('production_pointeur_id'):
            success, validated = self.test(
                "POST /production/{id}/status as RESPONSABLE_CHANTIER",
                "POST",
                f"production/{self.test_data['production_pointeur_id']}/status",
                200,
                data={"status": "VALIDE"},
                token=chef_token
            )
            if success and validated.get('status') == 'VALIDE':
                self.log("RESPONSABLE_CHANTIER validates production successfully", "PASS")
                self.tests_passed += 1
            else:
                self.log("Production validation FAIL", "FAIL")
            self.tests_run += 1
    
    def test_matieres_module(self):
        """Test Matières & Fournisseurs module."""
        self.log("\n\n========== TESTING MATIERES MODULE ==========", "INFO")
        
        token = self.tokens.get('SUPER_ADMIN')
        comptable_token = self.tokens.get('COMPTABLE')
        
        # 1. List fournisseurs
        success, fournisseurs = self.test("GET /matieres/fournisseurs", "GET", "matieres/fournisseurs", 200, token=token)
        
        # 2. Create fournisseur (COMPTABLE)
        if comptable_token:
            fournisseur_data = {
                "name": f"Fournisseur Test {datetime.now().strftime('%H%M%S')}",
                "type": "MATIERE",
                "contact": "Test Contact",
                "phone": "0612345678",
                "ice": "123456789"
            }
            success, fournisseur = self.test(
                "POST /matieres/fournisseurs as COMPTABLE",
                "POST",
                "matieres/fournisseurs",
                200,
                data=fournisseur_data,
                token=comptable_token
            )
            if success:
                self.test_data['fournisseur_id'] = fournisseur.get('id')
        
        # 3. Create achat with auto-computed totals
        if comptable_token and self.test_data.get('fournisseur_id'):
            achat_data = {
                "chantier_id": "test_chantier",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "fournisseur_id": self.test_data['fournisseur_id'],
                "designation": "Ciment test",
                "unit": "T",
                "quantity": 10,
                "unit_price": 1000,
                "transport_ht": 500,
                "tva_rate": 20
            }
            success, achat = self.test(
                "POST /matieres/achats",
                "POST",
                "matieres/achats",
                200,
                data=achat_data,
                token=comptable_token
            )
            if success:
                self.test_data['achat_id'] = achat.get('id')
                
                # Check computed totals
                # total_ht = qty*pu + transport = 10*1000 + 500 = 10500
                # total_tva = total_ht * tva_rate / 100 = 10500 * 20 / 100 = 2100
                # total_ttc = total_ht + total_tva = 10500 + 2100 = 12600
                expected_ht = 10500
                expected_tva = 2100
                expected_ttc = 12600
                
                if achat.get('total_ht') == expected_ht:
                    self.log(f"total_ht computed correctly ({expected_ht})", "PASS")
                    self.tests_passed += 1
                else:
                    self.log(f"total_ht FAIL: expected {expected_ht}, got {achat.get('total_ht')}", "FAIL")
                self.tests_run += 1
                
                if achat.get('total_tva') == expected_tva:
                    self.log(f"total_tva computed correctly ({expected_tva})", "PASS")
                    self.tests_passed += 1
                else:
                    self.log(f"total_tva FAIL: expected {expected_tva}, got {achat.get('total_tva')}", "FAIL")
                self.tests_run += 1
                
                if achat.get('total_ttc') == expected_ttc:
                    self.log(f"total_ttc computed correctly ({expected_ttc})", "PASS")
                    self.tests_passed += 1
                else:
                    self.log(f"total_ttc FAIL: expected {expected_ttc}, got {achat.get('total_ttc')}", "FAIL")
                self.tests_run += 1
                
                # Check initial payment status
                if achat.get('payment_status') == 'NON_PAYE' and achat.get('montant_paye') == 0 and achat.get('montant_restant') == expected_ttc:
                    self.log("Initial payment status correct (NON_PAYE, montant_paye=0, montant_restant=total_ttc)", "PASS")
                    self.tests_passed += 1
                else:
                    self.log("Initial payment status FAIL", "FAIL")
                self.tests_run += 1
        
        # 4. Create partial payment
        if comptable_token and self.test_data.get('achat_id'):
            paiement_data = {
                "achat_id": self.test_data['achat_id'],
                "date": datetime.now().strftime("%Y-%m-%d"),
                "amount": 5000,
                "payment_mode": "BANQUE_OMOTAL"
            }
            success, paiement = self.test(
                "POST /matieres/paiements (partial)",
                "POST",
                "matieres/paiements",
                200,
                data=paiement_data,
                token=comptable_token
            )
            if success:
                self.test_data['paiement_id'] = paiement.get('id')
                
                # Check achat updated
                success2, achat_updated = self.test(
                    "GET /matieres/achats (check payment update)",
                    "GET",
                    "matieres/achats",
                    200,
                    token=comptable_token
                )
                if success2:
                    achat_obj = next((a for a in achat_updated if a['id'] == self.test_data['achat_id']), None)
                    if achat_obj:
                        if achat_obj.get('payment_status') == 'PARTIEL':
                            self.log("Payment status updated to PARTIEL", "PASS")
                            self.tests_passed += 1
                        else:
                            self.log(f"Payment status FAIL: expected PARTIEL, got {achat_obj.get('payment_status')}", "FAIL")
                        self.tests_run += 1
                        
                        if achat_obj.get('montant_paye') == 5000:
                            self.log("montant_paye updated correctly (5000)", "PASS")
                            self.tests_passed += 1
                        else:
                            self.log(f"montant_paye FAIL: expected 5000, got {achat_obj.get('montant_paye')}", "FAIL")
                        self.tests_run += 1
                        
                        if achat_obj.get('montant_restant') == 7600:
                            self.log("montant_restant updated correctly (7600)", "PASS")
                            self.tests_passed += 1
                        else:
                            self.log(f"montant_restant FAIL: expected 7600, got {achat_obj.get('montant_restant')}", "FAIL")
                        self.tests_run += 1
        
        # 5. Complete payment
        if comptable_token and self.test_data.get('achat_id'):
            paiement_final = {
                "achat_id": self.test_data['achat_id'],
                "date": datetime.now().strftime("%Y-%m-%d"),
                "amount": 7600,
                "payment_mode": "BANQUE_OMOTAL"
            }
            success, paiement2 = self.test(
                "POST /matieres/paiements (complete)",
                "POST",
                "matieres/paiements",
                200,
                data=paiement_final,
                token=comptable_token
            )
            if success:
                # Check achat status is PAYE
                success2, achat_updated = self.test(
                    "GET /matieres/achats (check PAYE status)",
                    "GET",
                    "matieres/achats",
                    200,
                    token=comptable_token
                )
                if success2:
                    achat_obj = next((a for a in achat_updated if a['id'] == self.test_data['achat_id']), None)
                    if achat_obj and achat_obj.get('payment_status') == 'PAYE':
                        self.log("Payment status updated to PAYE after full payment", "PASS")
                        self.tests_passed += 1
                    else:
                        self.log("Payment status FAIL: expected PAYE", "FAIL")
                    self.tests_run += 1
        
        # 6. Get situations
        success, situations = self.test("GET /matieres/situations", "GET", "matieres/situations", 200, token=token)
        if success and len(situations) > 0:
            # Check structure
            if 'total_ttc' in situations[0] and 'total_paye' in situations[0] and 'total_restant' in situations[0]:
                self.log("Situations structure correct (total_ttc, total_paye, total_restant)", "PASS")
                self.tests_passed += 1
            else:
                self.log("Situations structure FAIL", "FAIL")
            self.tests_run += 1
        
        # 7. Get situation detail
        if self.test_data.get('fournisseur_id'):
            success, situation = self.test(
                "GET /matieres/situation/{fournisseur_id}",
                "GET",
                f"matieres/situation/{self.test_data['fournisseur_id']}",
                200,
                token=token
            )
            if success:
                if 'fournisseur' in situation and 'achats' in situation and 'paiements' in situation:
                    self.log("Situation detail structure correct", "PASS")
                    self.tests_passed += 1
                else:
                    self.log("Situation detail structure FAIL", "FAIL")
                self.tests_run += 1
    
    def test_bq_module(self):
        """Test BQ & Rentabilité module."""
        self.log("\n\n========== TESTING BQ MODULE ==========", "INFO")
        
        token = self.tokens.get('SUPER_ADMIN')
        directeur_token = self.tokens.get('DIRECTEUR')
        comptable_token = self.tokens.get('COMPTABLE')
        
        # 1. List articles
        success, articles = self.test("GET /bq/articles", "GET", "bq/articles", 200, token=token)
        
        # 2. Create article with auto-computed marge
        article_data = {
            "chantier_id": "test_chantier",
            "numero": f"TEST-{datetime.now().strftime('%H%M%S')}",
            "designation": "Article test BQ",
            "unit": "M3",
            "quantity_marche": 1000,
            "pu_marche_ht": 500,
            "pr_main_oeuvre": 100000,
            "pr_materiaux": 150000,
            "pr_engins": 80000,
            "pr_sous_traitance": 50000,
            "frais_generaux": 20000
        }
        success, article = self.test("POST /bq/articles", "POST", "bq/articles", 200, data=article_data, token=token)
        if success:
            self.test_data['article_id'] = article.get('id')
            
            # Check computed fields
            # montant_marche_ht = qty * pu = 1000 * 500 = 500000
            # pr_total = 100000 + 150000 + 80000 + 50000 + 20000 = 400000
            # marge_prevue = montant_marche_ht - pr_total = 500000 - 400000 = 100000
            expected_montant = 500000
            expected_pr_total = 400000
            expected_marge = 100000
            
            if article.get('montant_marche_ht') == expected_montant:
                self.log(f"montant_marche_ht computed correctly ({expected_montant})", "PASS")
                self.tests_passed += 1
            else:
                self.log(f"montant_marche_ht FAIL: expected {expected_montant}, got {article.get('montant_marche_ht')}", "FAIL")
            self.tests_run += 1
            
            if article.get('pr_total') == expected_pr_total:
                self.log(f"pr_total computed correctly ({expected_pr_total})", "PASS")
                self.tests_passed += 1
            else:
                self.log(f"pr_total FAIL: expected {expected_pr_total}, got {article.get('pr_total')}", "FAIL")
            self.tests_run += 1
            
            if article.get('marge_prevue') == expected_marge:
                self.log(f"marge_prevue computed correctly ({expected_marge})", "PASS")
                self.tests_passed += 1
            else:
                self.log(f"marge_prevue FAIL: expected {expected_marge}, got {article.get('marge_prevue')}", "FAIL")
            self.tests_run += 1
        
        # 3. Update article with quantity_realisee and cout_reel
        if self.test_data.get('article_id'):
            update_data = {
                "quantity_realisee": 500,
                "cout_reel": 180000
            }
            success, updated = self.test(
                "PATCH /bq/articles/{id}",
                "PATCH",
                f"bq/articles/{self.test_data['article_id']}",
                200,
                data=update_data,
                token=token
            )
            if success:
                # Check recomputed fields
                # avancement = (500 / 1000) * 100 = 50%
                # montant_realise = 500 * 500 = 250000
                # marge_reelle = montant_realise - cout_reel = 250000 - 180000 = 70000
                # taux_marge_reel = (70000 / 250000) * 100 = 28%
                expected_avancement = 50.0
                expected_montant_realise = 250000
                expected_marge_reelle = 70000
                expected_taux = 28.0
                
                if updated.get('avancement') == expected_avancement:
                    self.log(f"avancement computed correctly ({expected_avancement}%)", "PASS")
                    self.tests_passed += 1
                else:
                    self.log(f"avancement FAIL: expected {expected_avancement}, got {updated.get('avancement')}", "FAIL")
                self.tests_run += 1
                
                if updated.get('montant_realise') == expected_montant_realise:
                    self.log(f"montant_realise computed correctly ({expected_montant_realise})", "PASS")
                    self.tests_passed += 1
                else:
                    self.log(f"montant_realise FAIL: expected {expected_montant_realise}, got {updated.get('montant_realise')}", "FAIL")
                self.tests_run += 1
                
                if updated.get('marge_reelle') == expected_marge_reelle:
                    self.log(f"marge_reelle computed correctly ({expected_marge_reelle})", "PASS")
                    self.tests_passed += 1
                else:
                    self.log(f"marge_reelle FAIL: expected {expected_marge_reelle}, got {updated.get('marge_reelle')}", "FAIL")
                self.tests_run += 1
                
                if updated.get('taux_marge_reel') == expected_taux:
                    self.log(f"taux_marge_reel computed correctly ({expected_taux}%)", "PASS")
                    self.tests_passed += 1
                else:
                    self.log(f"taux_marge_reel FAIL: expected {expected_taux}, got {updated.get('taux_marge_reel')}", "FAIL")
                self.tests_run += 1
        
        # 4. Test BQ summary permission check
        # SUPER_ADMIN should see marge_reelle
        success, summary_admin = self.test("GET /bq/summary as SUPER_ADMIN", "GET", "bq/summary", 200, token=token)
        if success:
            if 'marge_reelle' in summary_admin:
                self.log("SUPER_ADMIN can see marge_reelle in summary", "PASS")
                self.tests_passed += 1
            else:
                self.log("SUPER_ADMIN cannot see marge_reelle - FAIL", "FAIL")
            self.tests_run += 1
        
        # DIRECTEUR should see marge_reelle
        if directeur_token:
            success, summary_dir = self.test("GET /bq/summary as DIRECTEUR", "GET", "bq/summary", 200, token=directeur_token)
            if success:
                if 'marge_reelle' in summary_dir:
                    self.log("DIRECTEUR can see marge_reelle in summary", "PASS")
                    self.tests_passed += 1
                else:
                    self.log("DIRECTEUR cannot see marge_reelle - FAIL", "FAIL")
                self.tests_run += 1
        
        # COMPTABLE should NOT see marge_reelle
        if comptable_token:
            success, summary_compta = self.test("GET /bq/summary as COMPTABLE", "GET", "bq/summary", 200, token=comptable_token)
            if success:
                if 'marge_reelle' not in summary_compta:
                    self.log("COMPTABLE correctly cannot see marge_reelle in summary", "PASS")
                    self.tests_passed += 1
                else:
                    self.log("COMPTABLE can see marge_reelle - PERMISSION FAIL", "FAIL")
                self.tests_run += 1
    
    def run_all_tests(self):
        """Run all Phase 3 tests."""
        self.log("\n" + "="*60, "INFO")
        self.log("OMOTAL TRAVAUX - Phase 3 Backend Tests", "INFO")
        self.log("="*60 + "\n", "INFO")
        
        # Login all users
        users = [
            ("ali@omotal.ma", "omotal123", "SUPER_ADMIN"),
            ("boubker@omotal.ma", "omotal123", "DIRECTEUR"),
            ("ayoub@omotal.ma", "omotal123", "POINTEUR"),
            ("comptable@omotal.ma", "omotal123", "COMPTABLE"),
            ("chef@omotal.ma", "omotal123", "RESPONSABLE_CHANTIER"),
        ]
        
        for email, password, role in users:
            if not self.login(email, password, role):
                self.log(f"Failed to login {role}, some tests will be skipped", "WARN")
        
        # Run module tests
        self.test_production_module()
        self.test_matieres_module()
        self.test_bq_module()
        
        # Print summary
        self.log("\n" + "="*60, "INFO")
        self.log(f"TESTS COMPLETED: {self.tests_passed}/{self.tests_run} passed", "INFO")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"Success Rate: {success_rate:.1f}%", "INFO")
        self.log("="*60 + "\n", "INFO")
        
        return 0 if self.tests_passed == self.tests_run else 1

if __name__ == "__main__":
    tester = Phase3Tester()
    sys.exit(tester.run_all_tests())
