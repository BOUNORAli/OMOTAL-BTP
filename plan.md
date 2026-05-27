# plan.md

## 1) Objectives
- Remplacer les fichiers Excel par une app web centralisée (FR, MAD), multi-chantiers, mobile-friendly.
- Livrer un **MVP P0+P1** stable: Auth/RBAC, Chantiers, Caisse, Gasoil, Personnel+Pointage+Paie, Engins+Pointage, Dashboards, Validations, Alertes, Exports Excel, **Import Excel (migration)**.
- Mettre en place une base technique saine: FastAPI async + MongoDB (Motor), React CRA, Tailwind/shadcn.

## 2) Implementation Steps (Phases)

### Phase 1 — Core POC (isolation): Excel Import/Export + validation (core workflow)
> Objectif: prouver la migration Excel (upload → preview → mapping minimal → import) + export, car c’est le point le plus risqué pour l’adoption.
- Websearch ciblée: bonnes pratiques **pandas/openpyxl** (types, dates Excel, perf), validation schéma, gestion erreurs par ligne.
- Backend POC (FastAPI):
  - Endpoint `/import/preview` : upload fichier, détecter feuilles, lire 20–50 lignes, inférer colonnes, retourner erreurs (types manquants, formats dates/nombres).
  - Endpoint `/import/commit` : import idempotent (hash fichier + mapping), upsert, rapport (créés/mis à jour/ignorés).
  - Endpoint `/export/{module}` : générer un xlsx minimal.
- Dataset de test: 2 fichiers Excel “historiques” (1 propre, 1 avec erreurs) + cas dates/virgules décimales.
- Validation POC: importer Personnel/Engins/Transactions (3 mini-schémas) et exporter, vérifier round-trip.

**User stories (Phase 1)**
1. En tant qu’Admin, je charge un Excel et je vois un **aperçu** et les colonnes détectées.
2. En tant qu’Admin, je vois les **erreurs par ligne** avant d’importer.
3. En tant qu’Admin, je peux **mapper** une colonne Excel vers un champ cible.
4. En tant qu’Admin, je lance l’import et je reçois un **rapport** (créés/MAJ/erreurs).
5. En tant qu’Admin, j’exporte un module en Excel pour comparer avec l’existant.

---

### Phase 2 — V1 App Development (MVP fonctionnel end-to-end)
**2.1 Foundations (Backend + DB)**
- FastAPI project structure (routers/services/models), config env, CORS, logging.
- MongoDB collections + indexes (tenant=chantier_id, month keys, unique constraints).
- Auth JWT email/password + bcrypt, refresh strategy simple, seed demo users.
- RBAC: roles/permissions, dependency-based guards côté API.
- Core entities: Chantiers, Users assignments (visibilité par chantier).

**2.2 MVP Modules (Backend APIs)**
- Chantiers CRUD + affectation utilisateurs.
- Caisse: transactions (in/out), modes, catégories, pièces jointes (optionnel v1: URL/placeholder), **workflow validation** (seuil directeur).
- Gasoil: entrées, sorties (engin obligatoire), stock théorique par chantier, alertes stock bas.
- Personnel: registre, pointage mensuel, avances, reliquats, calcul paie, validation.
- Engins: registre, pointage mensuel, coût location, paiements, validation.
- Validations: agrégation “à valider” par rôle (chef/directeur/comptable).
- Alertes: règles MVP (stock bas, transaction > seuil, mois non pointé, anomalies simples).
- Exports Excel par module (filtres mois/chantier).
- Intégrer le POC Import Excel dans l’app (pages + endpoints finalisés).

**2.3 Frontend V1 (React CRA)**
- Setup: React Router, Axios instance (token), Tailwind + shadcn/ui.
- Layout: Sidebar filtrée par rôle, Topbar (sélecteur chantier, notifications), MobileBottomNav.
- Pages: Login (quick select demo users), Dashboard global + chantier (KPIs + Recharts).
- CRUD UI: Chantiers, Caisse, Gasoil, Personnel, Engins.
- Pages workflow: Validations, Alertes.
- Pages Excel: Exports + Import (upload → preview → mapping → commit).
- Etats UX: loading/empty/error, toasts, formulaires React Hook Form + Zod.

**User stories (Phase 2)**
1. En tant qu’Ali (Super Admin), je crée un chantier et j’affecte Ayoub/chef/comptable.
2. En tant qu’Ayoub (mobile), je saisis une **sortie gasoil rapide** liée à un engin.
3. En tant que Comptable, je saisis des transactions caisse et je vois le **solde** par mode.
4. En tant que Chef de chantier, je consulte “Validations” et je valide/rejette les saisies.
5. En tant que Directeur, je valide les paiements au-dessus du seuil et je vois l’historique.
6. En tant que Comptable, je remplis le pointage mensuel personnel et le système calcule la **paie due**.
7. En tant qu’Ali, j’importe un Excel historique (preview → erreurs → import) et je retrouve les données.

**Fin Phase 2: 1 round de tests E2E**
- Parcours: login par rôles, création chantier, gasoil entrée/sortie, caisse, pointage, validations, exports/imports.

---

### Phase 3 — Stabilisation + features production-friendly
- Verrouillage de période (mois) + permissions.
- Audit log MVP (actions critiques: validations, suppression, import).
- Documents/Justificatifs (upload simple local/S3-ready abstraction).
- Amélioration alertes (seuils configurables par chantier, règles manquants).
- Performances: pagination, indexes, agrégations Mongo.
- UI polish mobile (Ayoub) + accessibilité.

**User stories (Phase 3)**
1. En tant qu’Admin, je verrouille un mois pour empêcher les modifications.
2. En tant que Comptable, j’attache un justificatif à une transaction et je le retrouve.
3. En tant que Directeur, je consulte l’audit des validations d’un mois.
4. En tant que Chef, je reçois une alerte “pointage manquant” et je la résous.
5. En tant qu’Ayoub, je travaille sur mobile avec des écrans plus rapides et adaptés.

**Fin Phase 3: 1 round de tests E2E**

---

### Phase 4 — Post-MVP (P2+P3 du PRD)
- Production & rendements (terrain, m³/m²), matières/fournisseurs, sous-traitance/ETP, transport.
- Entretien engins, BQ & rentabilité, PDF reports.

**User stories (Phase 4)**
1. En tant qu’Ayoub, je saisis une production (voie/tronçon) avec calcul auto m³/m².
2. En tant que Chef, je vois les rendements par jour/engin.
3. En tant que Comptable, je gère fournisseurs + échéances + paiements partiels.
4. En tant que Direction, je vois la rentabilité chantier (BQ vs réalisé).
5. En tant qu’Admin, j’exporte un PDF mensuel chantier.

## 3) Next Actions
- Confirmer les 2–3 formats Excel réels à importer (onglets/colonnes) + fournir 1 exemple anonymisé.
- Démarrer Phase 1: implémenter endpoints preview/commit + export minimal + scripts de test.
- Après validation POC Import/Export: lancer Phase 2 (fondations + modules + UI V1) et faire un test E2E.

## 4) Success Criteria
- Import Excel: preview fiable, erreurs actionnables, import idempotent, rapport clair.
- RBAC: accès correctement restreint (Ayoub ≠ caisse/paie), testé sur API + UI.
- Flux complets MVP: gasoil (entrée→stock→sortie), caisse (saisie→validation), paie (pointage→calcul→validation), engins (pointage→coût→paiement).
- Dashboards affichent KPIs cohérents (par chantier + global) et alertes pertinentes.
- Exports Excel utilisables (filtres mois/chantier) pour contrôle comptable.
- 0 régression après chaque phase (tests E2E passants).