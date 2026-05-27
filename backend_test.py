"""
OMOTAL TRAVAUX - Backend API Test Suite
Tests all critical endpoints with role-based access control
"""
import requests
import sys
import json
from datetime import datetime, timedelta

BASE_URL = "https://site-ops-hub-4.preview.emergentagent.com/api"

class OMOTALTester:
    def __init__(self):
        self.tokens = {}
        self.test_data = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, msg, status="INFO"):
        prefix = {
            "PASS": "✅",
            "FAIL": "❌",
            "INFO": "🔍",
            "WARN": "⚠️"
        }.get(status, "ℹ️")
        print(f"{prefix} {msg}")

    def test(self, name, method, endpoint, expected_status, token=None, data=None, params=None):
        """Run a single API test"""
        url = f"{BASE_URL}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        self.log(f"Testing {name}...", "INFO")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"PASS - {name} (Status: {response.status_code})", "PASS")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"FAIL - {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"Response: {response.text[:200]}", "WARN")
                self.failed_tests.append({
                    "name": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            self.log(f"FAIL - {name} - Error: {str(e)}", "FAIL")
            self.failed_tests.append({
                "name": name,
                "error": str(e)
            })
            return False, {}

    def login(self, email, password):
        """Login and store token"""
        success, response = self.test(
            f"Login as {email}",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.tokens[email] = response['access_token']
            self.test_data[f"{email}_user"] = response.get('user', {})
            return True
        return False

    def run_auth_tests(self):
        """Test authentication endpoints"""
        self.log("\n=== AUTH TESTS ===", "INFO")
        
        # Test demo users endpoint
        self.test("Get demo users", "GET", "auth/demo-users", 200)
        
        # Test valid login for all demo users
        demo_users = [
            "ali@omotal.ma",
            "boubker@omotal.ma",
            "ayoub@omotal.ma",
            "comptable@omotal.ma",
            "chef@omotal.ma",
            "mecano@omotal.ma"
        ]
        
        for email in demo_users:
            if not self.login(email, "omotal123"):
                self.log(f"Failed to login {email}", "FAIL")
                return False
        
        # Test invalid login
        self.test("Login with invalid credentials", "POST", "auth/login", 401,
                 data={"email": "wrong@test.com", "password": "wrong"})
        
        # Test /me endpoint
        ali_token = self.tokens.get("ali@omotal.ma")
        success, me_data = self.test("Get current user (Ali)", "GET", "auth/me", 200, token=ali_token)
        if success and 'permissions' in me_data:
            self.log(f"Ali has {len(me_data.get('permissions', []))} permissions", "INFO")
        
        return True

    def run_chantiers_tests(self):
        """Test chantiers endpoints"""
        self.log("\n=== CHANTIERS TESTS ===", "INFO")
        
        ali_token = self.tokens.get("ali@omotal.ma")
        ayoub_token = self.tokens.get("ayoub@omotal.ma")
        
        # Test list chantiers (Ali sees all, Ayoub sees only assigned)
        success, ali_chantiers = self.test("List chantiers (Ali - SUPER_ADMIN)", "GET", "chantiers", 200, token=ali_token)
        success2, ayoub_chantiers = self.test("List chantiers (Ayoub - POINTEUR)", "GET", "chantiers", 200, token=ayoub_token)
        
        if success and success2:
            self.log(f"Ali sees {len(ali_chantiers)} chantiers, Ayoub sees {len(ayoub_chantiers)} chantiers", "INFO")
            if len(ali_chantiers) > len(ayoub_chantiers):
                self.log("Role-based filtering working correctly", "PASS")
                self.tests_passed += 1
            self.test_data['chantiers'] = ali_chantiers
            if ali_chantiers:
                self.test_data['chantier_id'] = ali_chantiers[0]['id']
        
        # Test create chantier (Ali can, Ayoub cannot)
        new_chantier = {
            "name": f"Test Chantier {datetime.now().strftime('%H%M%S')}",
            "code": f"TEST-{datetime.now().strftime('%H%M%S')}",
            "status": "EN_COURS",
            "localisation": "Test Location"
        }
        success, created = self.test("Create chantier (Ali)", "POST", "chantiers", 200, token=ali_token, data=new_chantier)
        if success:
            self.test_data['test_chantier_id'] = created.get('id')
        
        # Test permission enforcement - POINTEUR cannot create chantier
        self.test("Create chantier (Ayoub - should fail 403)", "POST", "chantiers", 403, token=ayoub_token, data=new_chantier)

    def run_caisse_tests(self):
        """Test caisse/transactions endpoints"""
        self.log("\n=== CAISSE TESTS ===", "INFO")
        
        comptable_token = self.tokens.get("comptable@omotal.ma")
        boubker_token = self.tokens.get("boubker@omotal.ma")
        ayoub_token = self.tokens.get("ayoub@omotal.ma")
        chantier_id = self.test_data.get('chantier_id')
        
        if not chantier_id:
            self.log("No chantier_id available, skipping caisse tests", "WARN")
            return
        
        # Test list transactions
        self.test("List transactions", "GET", "caisse", 200, token=comptable_token)
        
        # Test get summary
        self.test("Get caisse summary", "GET", "caisse/summary", 200, token=comptable_token, params={"chantier_id": chantier_id})
        
        # Test create low amount transaction (auto-validated)
        low_txn = {
            "chantier_id": chantier_id,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "type": "DEBIT",
            "amount": 5000,
            "payment_mode": "ESPECES_OMOTAL",
            "category": "divers",
            "description": "Test transaction low amount"
        }
        success, low_result = self.test("Create low amount transaction", "POST", "caisse", 200, token=comptable_token, data=low_txn)
        if success and low_result.get('status') == 'VALIDE':
            self.log("Low amount transaction auto-validated", "PASS")
            self.tests_passed += 1
        
        # Test create high amount transaction (needs approval)
        high_txn = {
            "chantier_id": chantier_id,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "type": "DEBIT",
            "amount": 15000,
            "payment_mode": "BANQUE_OMOTAL",
            "category": "location_engins",
            "description": "Test high payment - needs approval"
        }
        success, high_result = self.test("Create high amount transaction (≥10000)", "POST", "caisse", 200, token=comptable_token, data=high_txn)
        if success:
            if high_result.get('status') == 'SOUMIS' and high_result.get('needs_approval'):
                self.log("High amount transaction requires approval (SOUMIS status)", "PASS")
                self.tests_passed += 1
                txn_id = high_result.get('id')
                
                # Test validation by DIRECTEUR
                if txn_id:
                    validate_payload = {"status": "VALIDE"}
                    self.test("Validate high payment (Boubker - DIRECTEUR)", "POST", f"caisse/{txn_id}/status", 200, token=boubker_token, data=validate_payload)
        
        # Test permission enforcement - POINTEUR cannot create transaction
        self.test("Create transaction (Ayoub - should fail 403)", "POST", "caisse", 403, token=ayoub_token, data=low_txn)

    def run_gasoil_tests(self):
        """Test gasoil endpoints"""
        self.log("\n=== GASOIL TESTS ===", "INFO")
        
        comptable_token = self.tokens.get("comptable@omotal.ma")
        ayoub_token = self.tokens.get("ayoub@omotal.ma")
        chef_token = self.tokens.get("chef@omotal.ma")
        chantier_id = self.test_data.get('chantier_id')
        
        if not chantier_id:
            self.log("No chantier_id available, skipping gasoil tests", "WARN")
            return
        
        # Get engins first
        success, engins = self.test("List engins", "GET", "engins", 200, token=comptable_token, params={"chantier_id": chantier_id})
        if success and engins:
            self.test_data['engin_id'] = engins[0]['id']
        
        # Test create gasoil entree
        entree = {
            "chantier_id": chantier_id,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "fournisseur": "Station Test",
            "litres": 500,
            "unit_price": 13.5,
            "br_number": f"BR-TEST-{datetime.now().strftime('%H%M%S')}"
        }
        success, entree_result = self.test("Create gasoil entree", "POST", "gasoil/entrees", 200, token=comptable_token, data=entree)
        if success and entree_result.get('total_amount'):
            expected_total = 500 * 13.5
            actual_total = entree_result.get('total_amount')
            if abs(actual_total - expected_total) < 0.01:
                self.log(f"Total amount computed correctly: {actual_total} MAD", "PASS")
                self.tests_passed += 1
        
        # Test get stock
        success, stock = self.test("Get gasoil stock", "GET", "gasoil/stock", 200, token=comptable_token, params={"chantier_id": chantier_id})
        if success:
            self.log(f"Stock théorique: {stock.get('stock_theorique', 0)} L", "INFO")
        
        # Test create sortie by POINTEUR (should be SOUMIS)
        engin_id = self.test_data.get('engin_id')
        if engin_id:
            sortie = {
                "chantier_id": chantier_id,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "engin_id": engin_id,
                "litres": 50,
                "affectation": "PRODUCTION"
            }
            success, sortie_result = self.test("Create gasoil sortie (Ayoub - POINTEUR)", "POST", "gasoil/sorties", 200, token=ayoub_token, data=sortie)
            if success and sortie_result.get('status') == 'SOUMIS':
                self.log("Sortie created with SOUMIS status (needs validation)", "PASS")
                self.tests_passed += 1
                sortie_id = sortie_result.get('id')
                
                # Test validation by RESPONSABLE_CHANTIER
                if sortie_id:
                    validate_payload = {"status": "VALIDE"}
                    self.test("Validate sortie (Chef - RESPONSABLE_CHANTIER)", "POST", f"gasoil/sorties/{sortie_id}/status", 200, token=chef_token, data=validate_payload)

    def run_personnel_tests(self):
        """Test personnel endpoints"""
        self.log("\n=== PERSONNEL TESTS ===", "INFO")
        
        comptable_token = self.tokens.get("comptable@omotal.ma")
        chantier_id = self.test_data.get('chantier_id')
        
        if not chantier_id:
            self.log("No chantier_id available, skipping personnel tests", "WARN")
            return
        
        # Test create employee
        employee = {
            "name": f"Test Employee {datetime.now().strftime('%H%M%S')}",
            "poste": "Ouvrier",
            "chantier_id": chantier_id,
            "remuneration_type": "JOUR",
            "salaire_journalier": 200.0
        }
        success, emp_result = self.test("Create employee", "POST", "personnel/employees", 200, token=comptable_token, data=employee)
        if success:
            employee_id = emp_result.get('id')
            self.test_data['employee_id'] = employee_id
            
            # Test create pointage
            pointage = {
                "employee_id": employee_id,
                "chantier_id": chantier_id,
                "year": 2026,
                "month": 8,
                "entries": [
                    {"day": 1, "hours": 9, "day_type": "NORMAL"},
                    {"day": 2, "hours": 9, "day_type": "NORMAL"},
                    {"day": 3, "hours": 9, "day_type": "NORMAL"},
                    {"day": 4, "hours": 9, "day_type": "NORMAL"},
                    {"day": 5, "hours": 9, "day_type": "NORMAL"}
                ]
            }
            success, pointage_result = self.test("Create personnel pointage", "POST", "personnel/pointage", 200, token=comptable_token, data=pointage)
            if success:
                total_days = pointage_result.get('total_days', 0)
                salaire_du = pointage_result.get('salaire_du', 0)
                expected_salaire = 5 * 200.0  # 5 days * 200 MAD
                if abs(salaire_du - expected_salaire) < 0.01:
                    self.log(f"Salary computed correctly: {salaire_du} MAD for {total_days} days", "PASS")
                    self.tests_passed += 1
            
            # Test create avance (should auto-create transaction)
            avance = {
                "employee_id": employee_id,
                "chantier_id": chantier_id,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "amount": 500.0,
                "payment_mode": "ESPECES_OMOTAL",
                "motif": "Avance test"
            }
            success, avance_result = self.test("Create avance (auto-creates transaction)", "POST", "personnel/avances", 200, token=comptable_token, data=avance)
            if success:
                self.log("Avance created successfully", "PASS")

    def run_engins_tests(self):
        """Test engins endpoints"""
        self.log("\n=== ENGINS TESTS ===", "INFO")
        
        comptable_token = self.tokens.get("comptable@omotal.ma")
        chantier_id = self.test_data.get('chantier_id')
        
        if not chantier_id:
            self.log("No chantier_id available, skipping engins tests", "WARN")
            return
        
        # Get existing engin
        success, engins = self.test("List engins", "GET", "engins", 200, token=comptable_token, params={"chantier_id": chantier_id})
        if success and engins:
            engin_id = engins[0]['id']
            engin = engins[0]
            
            # Test create engin pointage
            pointage = {
                "engin_id": engin_id,
                "chantier_id": chantier_id,
                "year": 2026,
                "month": 8,
                "entries": [
                    {"day": 1, "hours": 8, "days_count": 1},
                    {"day": 2, "hours": 8, "days_count": 1},
                    {"day": 3, "hours": 8, "days_count": 1}
                ]
            }
            success, pointage_result = self.test("Create engin pointage", "POST", "engins/pointage", 200, token=comptable_token, data=pointage)
            if success:
                montant_du = pointage_result.get('montant_du', 0)
                mode = engin.get('facturation_mode')
                if mode == 'HEURE':
                    expected = 24 * engin.get('tarif_horaire', 0)
                elif mode == 'JOUR':
                    expected = 3 * engin.get('tarif_journalier', 0)
                else:
                    expected = 0
                self.log(f"Montant dû computed: {montant_du} MAD (mode: {mode})", "INFO")
            
            # Test create paiement (should auto-create transaction)
            paiement = {
                "engin_id": engin_id,
                "chantier_id": chantier_id,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "amount": 5000.0,
                "payment_mode": "BANQUE_OMOTAL",
                "period_ref": "2026-08"
            }
            success, paiement_result = self.test("Create engin paiement (auto-creates transaction)", "POST", "engins/paiements", 200, token=comptable_token, data=paiement)

    def run_dashboard_tests(self):
        """Test dashboard endpoints"""
        self.log("\n=== DASHBOARD TESTS ===", "INFO")
        
        ali_token = self.tokens.get("ali@omotal.ma")
        chantier_id = self.test_data.get('chantier_id')
        
        # Test global dashboard
        success, global_dash = self.test("Get global dashboard", "GET", "dashboard/global", 200, token=ali_token)
        if success:
            kpis = global_dash.get('kpis', {})
            self.log(f"Global KPIs: {kpis.get('active_chantiers')} active chantiers, {kpis.get('stock_gasoil_total')} L gasoil", "INFO")
            if 'chantier_cards' in global_dash:
                self.log(f"Chantier cards: {len(global_dash['chantier_cards'])}", "INFO")
        
        # Test chantier dashboard
        if chantier_id:
            success, chantier_dash = self.test("Get chantier dashboard", "GET", f"dashboard/chantier/{chantier_id}", 200, token=ali_token)
            if success:
                self.log(f"Chantier dashboard loaded with caisse, gasoil, engins, personnel data", "INFO")

    def run_validations_tests(self):
        """Test validations endpoint"""
        self.log("\n=== VALIDATIONS TESTS ===", "INFO")
        
        ali_token = self.tokens.get("ali@omotal.ma")
        
        success, pending = self.test("Get pending validations", "GET", "validations/pending", 200, token=ali_token)
        if success:
            items = pending.get('items', [])
            self.log(f"Pending validations: {len(items)} items", "INFO")
            for item in items[:3]:
                self.log(f"  - {item.get('type')}: {item.get('summary', '')[:60]}", "INFO")

    def run_alerts_tests(self):
        """Test alerts endpoint"""
        self.log("\n=== ALERTS TESTS ===", "INFO")
        
        ali_token = self.tokens.get("ali@omotal.ma")
        
        success, alerts = self.test("Get alerts", "GET", "alertes", 200, token=ali_token)
        if success:
            items = alerts.get('items', [])
            self.log(f"Alerts generated: {len(items)} items", "INFO")
            for alert in items[:3]:
                self.log(f"  - [{alert.get('severity')}] {alert.get('title')}", "INFO")

    def run_excel_tests(self):
        """Test Excel export endpoints"""
        self.log("\n=== EXCEL TESTS ===", "INFO")
        
        comptable_token = self.tokens.get("comptable@omotal.ma")
        chantier_id = self.test_data.get('chantier_id')
        
        # Test export transactions
        success, _ = self.test("Export transactions to Excel", "GET", "excel/export/transactions", 200, token=comptable_token, params={"chantier_id": chantier_id})
        
        # Test export gasoil
        success, _ = self.test("Export gasoil to Excel", "GET", "excel/export/gasoil", 200, token=comptable_token, params={"chantier_id": chantier_id})

    def print_summary(self):
        """Print test summary"""
        self.log("\n" + "="*60, "INFO")
        self.log(f"TESTS COMPLETED: {self.tests_passed}/{self.tests_run} passed", "INFO")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"SUCCESS RATE: {success_rate:.1f}%", "INFO")
        
        if self.failed_tests:
            self.log(f"\n{len(self.failed_tests)} FAILED TESTS:", "FAIL")
            for fail in self.failed_tests[:10]:
                self.log(f"  - {fail.get('name')}: {fail.get('error', '')} {fail.get('response', '')[:100]}", "FAIL")
        
        return 0 if self.tests_passed == self.tests_run else 1


def main():
    tester = OMOTALTester()
    
    try:
        # Run all test suites
        tester.run_auth_tests()
        tester.run_chantiers_tests()
        tester.run_caisse_tests()
        tester.run_gasoil_tests()
        tester.run_personnel_tests()
        tester.run_engins_tests()
        tester.run_dashboard_tests()
        tester.run_validations_tests()
        tester.run_alerts_tests()
        tester.run_excel_tests()
        
    except Exception as e:
        tester.log(f"Fatal error during testing: {str(e)}", "FAIL")
        import traceback
        traceback.print_exc()
    
    return tester.print_summary()


if __name__ == "__main__":
    sys.exit(main())
