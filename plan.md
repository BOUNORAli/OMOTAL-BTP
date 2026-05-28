# plan.md

## 1) Objectives
- Remplacer les fichiers Excel par une app web centralisée **multi-chantiers**, en **français** et devise **MAD**, avec **RBAC**.
- Livrer une V1 stable (déjà réalisée) couvrant **MVP P0+P1** :
  - Auth/JWT + rôles, Chantiers
  - Caisse (transactions + workflow validation seuil directeur)
  - Gasoil (entrées/sorties + stock théorique + validations)
  - Personnel + pointage mensuel + paie + avances (et écritures caisse auto)
  - Engins + pointage mensuel + paiements (et écritures caisse auto)
  - Dashboards global + chantier, Validations centralisées, Alertes
  - Exports Excel + **Import Excel** (preview → mapping → commit)
  - Mobile Pointeur (Ayoub) + navigation mobile
- Étendre ensuite vers **Production & Rendements**, **Matières/Fournisseurs**, **BQ & Rentabilité** (choix utilisateur : *tous*), avec **responsive global** (mobile + desktop pour tout le monde).
- Maintenir une base technique saine : **FastAPI async + MongoDB (Motor)**, **React CRA** + Tailwind/shadcn, tests E2E continus.

## 2) Implementation Steps (Phases)

### Phase 1 — Core POC (isolation): Excel Import/Export + validation (core workflow)
> Objectif: prouver la migration Excel (upload → preview → mapping minimal → import) + export.

**Statut : ✅ Complétée et intégrée** (le POC est désormais une fonctionnalité produit).
- Endpoints preview/commit + export xlsx implémentés.
- Page Import/Export (UI) intégrée.

**User stories (Phase 1)**
1. Admin charge un Excel et voit un **aperçu** et les colonnes détectées.
2. Admin voit les **erreurs par ligne** avant import.
3. Admin mappe une colonne Excel vers un champ.
4. Admin lance l’import et reçoit un rapport.
5. Admin exporte un module en Excel.

---

### Phase 2 — V1 App Development (MVP fonctionnel end-to-end)
**Statut : ✅ Complétée** (backend + frontend + seed demo + mobile pointeur).

**2.1 Foundations (Backend + DB)**
- FastAPI structure routers/services/models, CORS, logging.
- MongoDB collections + indexes.
- Auth JWT email/password + bcrypt.
- Seed demo : Ali, Boubker, Ayoub, Comptable, Chef, Mécano + chantiers/employés/engins.
- RBAC/permissions côté API + menus filtrés côté UI.

**2.2 MVP Modules (Backend APIs)**
- Chantiers CRUD + affectation utilisateurs.
- Caisse : transactions + filtres + summary + validation seuil directeur.
- Gasoil : entrées/sorties + stock théorique + validations.
- Personnel : registre + pointage + calcul paie + avances (→ transaction caisse auto).
- Engins : registre + pointage + calcul coûts + paiements (→ transaction caisse auto).
- Validations : agrégation des éléments SOUMIS.
- Alertes : règles MVP (stock bas, paiements en attente, anomalies).
- Exports Excel + Import Excel.

**2.3 Frontend V1 (React CRA)**
- Layout : sidebar, topbar avec sélecteur chantier, états UX.
- Pages : Dashboard global + Chantier, Chantiers, Caisse, Gasoil, Personnel, Engins, Validations, Alertes, Excel, Admin.
- Mobile : layout dédié pointeur + sortie gasoil rapide + pointage engins + historique.

**User stories (Phase 2)**
1. Ali crée/consulte chantiers.
2. Ayoub (mobile) saisit sortie gasoil rapide.
3. Comptable saisit transactions + voit solde.
4. Chef valide/rejette les saisies SOUMIS.
5. Directeur valide paiements > seuil.
6. Comptable saisit pointage personnel → paie calculée.
7. Ali importe un Excel historique.

**Fin Phase 2 : ✅ tests E2E**
- Tests E2E réalisés (0 bug critique, couverture ~96%).

---

### Phase 3 — Production & Rendements + Matières/Fournisseurs + BQ & Rentabilité + Responsive global
> Nouvelle priorité (choix utilisateur) : **implémenter les 3 domaines** et rendre **toute l’app responsive** (mobile + desktop pour tous les rôles).

#### 3.1 Responsive global (toutes les pages)
- Revue UI/UX :
  - Tables : scroll horizontal, colonnes clés sticky si possible, densité adaptative.
  - KPIs : grilles 1–2 colonnes sur mobile, 4 sur desktop.
  - Dialogs/forms : plein écran sur mobile, stepper si nécessaire.
  - Navigation : sidebar → drawer mobile, conserver topbar, optimiser layouts.
- Tests visuels : mobile (360–430px), tablette, desktop.

#### 3.2 Module Production & Rendements (terrain)
**Backend**
- `/api/voies` : référentiel voies/tranches/tronçons par chantier.
- `/api/production` : CRUD productions terrain.
- Calculs : m³/m² automatiques selon type de travail (configurable), rendements m³/h, synthèses.
- Agrégations : par jour/voie/engin/équipe.

**Frontend**
- `ProductionPage` :
  - Saisie **mobile-first** (pointeur/chef) : chantier → voie/tranche/tronçon → engin → type travail → dimensions → calcul auto.
  - Synthèse : jour/semaine/mois, rendements, top engins.
- Mobile : ajouter **Production** dans la bottom-nav Pointeur.

**User stories**
1. Pointeur/chef saisit production (voie/tranche/tronçon, engin, dimensions) → calc m³/m² auto.
2. Chef visualise synthèse production et rendements m³/h.

#### 3.3 Module Matières / Fournisseurs
**Backend**
- `/api/fournisseurs` : CRUD fournisseurs + situation.
- `/api/matieres` : achats matières (HT/TVA/TTC), pièces, échéances.
- Paiements partiels : enregistrement, reste à payer, statut (à payer / payé).

**Frontend**
- `MatieresPage` :
  - Achats matières (table + formulaire), filtres, échéances.
  - Fiche fournisseur : achats, paiements, solde, restants.
  - Situation fournisseurs consolidée.

**User stories**
1. Comptable saisit achat matière (fournisseur, échéance, HT/TVA/TTC).
2. Comptable saisit paiements partiels, suit reste à payer.
3. Direction/Comptable voit situation fournisseur consolidée.

#### 3.4 Module BQ & Rentabilité
**Backend**
- `/api/bq` : articles BQ (quantité marché, PU, prix de revient prévisionnel), réalisé.
- Calculs : avancement (réalisé/marché), coûts réels vs prévus, marge.
- Permissions : **marge visible uniquement Directeur/SuperAdmin**.

**Frontend**
- `BQPage` :
  - Saisie articles BQ + réalisé.
  - Avancement et comparaisons.
  - Vue rentabilité (protégée par permissions).

**User stories**
1. Directeur/Admin saisit BQ (articles, quantités, PU, PR prévu).
2. Suivi avancement BQ (réalisé vs marché).
3. Comparaison coût réel vs prévu → marge réelle (Directeur/SuperAdmin uniquement).

**Fin Phase 3 : tests E2E + responsive**
- Parcours : saisie production mobile → synthèses, achats matières → paiements → situation fournisseur, BQ → avancement → rentabilité.
- Vérifier responsive complet sur pages clés.

---

### Phase 4 — Stabilisation + features production-friendly
- Verrouillage de période (mois) + permissions.
- Audit log (validations, suppressions, imports, modifications sensibles).
- Documents/Justificatifs : upload (local/S3-ready abstraction), lien depuis caisse/gasoil/matières.
- Alertes avancées : seuils configurables par chantier, règles “manquants/anomalies”, résolution.
- Performances : pagination, indexes, agrégations Mongo optimisées.
- PWA (optionnel) : cache minimal + offline-friendly sur formulaires terrain.

**User stories (Phase 4)**
1. Admin verrouille un mois (empêche modifications).
2. Comptable attache justificatif à transaction/achat.
3. Directeur consulte audit des validations.
4. Chef résout alertes (pointage manquant, stock bas, échéances).

## 3) Next Actions
- Collecter 2–3 formats Excel réels (anonymisés) pour améliorer le mapping suggéré.
- Lancer Phase 3 par le **socle responsive global** (audit de chaque page), puis implémenter :
  1) Production & Rendements (mobile-first),
  2) Matières/Fournisseurs,
  3) BQ & Rentabilité.
- Définir précisément les règles de calcul (m³/m² par type de travail, rendements, structure voies/tranches/tronçons).

## 4) Success Criteria
- **Responsive complet** : toutes les pages utilisables sur mobile et desktop (tables scrollables, formulaires adaptés).
- Production : saisie terrain rapide + rendements cohérents (m³/m², m³/h).
- Matières/Fournisseurs : suivi échéances, paiements partiels, situations fiables.
- BQ : avancement + marge réelle correcte, visibilité limitée aux rôles autorisés.
- Import/Export : toujours utilisable pour contrôle comptable.
- RBAC : accès strict (pointeur ≠ caisse/paie/marge).
- 0 régression après chaque phase (tests E2E passants).
