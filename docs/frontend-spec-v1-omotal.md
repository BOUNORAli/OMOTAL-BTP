# Spécification Frontend v1 — Application de Gestion de Chantiers OMOTAL TRAVAUX

## 1. Objectif du frontend

Le frontend doit être la première version visible de l'application OMOTAL. Il doit permettre de valider l'expérience utilisateur, les écrans, les rôles, les workflows et les tableaux de bord avant de connecter définitivement le backend.

Le but n'est pas de créer une simple interface jolie. Le but est de créer une interface métier claire, rapide, fiable et adaptée aux utilisateurs réels : Ali, Boubker, Ayoub, le comptable, le responsable chantier et les autres profils.

Le frontend doit être pensé comme une application professionnelle de gestion chantier, utilisable au bureau et sur téléphone.

---

## 2. Philosophie produit frontend

L'application doit respecter cinq principes :

1. Simplicité terrain : Ayoub doit pouvoir saisir ses données en quelques minutes depuis mobile.
2. Clarté direction : Ali et Boubker doivent comprendre l'état d'un chantier en quelques secondes.
3. Fiabilité métier : les écrans doivent empêcher les erreurs de saisie autant que possible.
4. Séparation des rôles : chaque utilisateur voit uniquement ce qui le concerne.
5. Évolutivité : le frontend doit être prêt pour ajouter d'autres modules sans être refait.

---

## 3. Stack frontend recommandée

Stack recommandée pour créer le frontend d'abord : Next.js + TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query, Zustand, Recharts, Lucide React, date-fns, PWA à prévoir pour mobile terrain.

Pourquoi : création rapide d'une interface moderne, TypeScript réduit les erreurs, Tailwind + shadcn donnent un rendu professionnel, React Hook Form + Zod sont essentiels pour les nombreux formulaires métier, TanStack Query facilite les mocks puis l'API réelle, Next.js structure routes/layouts proprement.

---

## 4. Stratégie frontend-first

Comme le backend n'est pas encore finalisé, développer avec une couche de données simulée :

```text
Page / Component
  ↓
Hook métier : useChantiers(), useGasoil(), useTransactions()
  ↓
Service API : chantierService, gasoilService, caisseService
  ↓
Mock adapter au début
  ↓
Backend réel plus tard
```

Principe : les composants ne codent jamais directement les données. Les services retournent des mocks au début puis des appels API plus tard, sans changer les écrans.

---

## 5. Identité visuelle

Style général : professionnel, moderne, sobre, dense mais lisible, orienté données, adapté chantier/BTP sans excès décoratif.

Couleurs : bleu foncé pour confiance/direction/gestion, orange chantier pour actions/alertes/terrain, gris clair pour fonds, vert pour validé/payé/positif, rouge pour alerte/rejet/stock négatif/retard, jaune/orange pour attention/en attente/échéance proche.

Règles : limiter les couleurs dans les tableaux, réserver les couleurs fortes aux statuts/alertes/indicateurs, garder les saisies simples.

Typographie : sans-serif moderne, hiérarchie claire, chiffres importants en gras, tableaux compacts mais lisibles.

Composants : cartes arrondies, ombres légères, espacement régulier, boutons grands sur mobile, tables compactes desktop.

---

## 6. Layout global

### 6.1 Desktop

Structure : topbar avec logo, chantier sélectionné, recherche, notifications ; sidebar navigation/modules/rôle user ; contenu principal.

Topbar : logo OMOTAL, sélecteur chantier, recherche globale, notifications, profil, aide/raccourcis.

Sidebar : Tableau de bord, Chantiers, Caisse, Gasoil, Personnel, Engins, Production, Matières & Fournisseurs, Sous-traitance / ETP, Transport, Entretien, BQ & Rentabilité, Rapports, Administration. La sidebar affiche uniquement les modules autorisés selon rôle.

### 6.2 Mobile

Structure : top mobile chantier + date, contenu principal en cartes simples/gros boutons, bottom navigation.

Bottom navigation pour Ayoub : Accueil, Production, Gasoil, Engins, Historique. Les autres rôles peuvent avoir une navigation différente.

---

## 7. Gestion des rôles frontend

Rôles : Super Admin, Directeur, Responsable chantier, Pointeur chantier, Comptable, Responsable matériel, Lecture seule.

Chaque route, menu, bouton et champ sensible doit être contrôlé par permission. La sécurité réelle doit aussi être côté backend.

Exemples : Ayoub ne voit ni caisse, ni salaires, ni rentabilité ; le comptable voit caisse/personnel/fournisseurs/ETP ; le directeur voit dashboards, finance, rentabilité mais ne saisit pas la production ; le responsable chantier valide production, gasoil et pointage engins.

Créer `permissions.ts` avec permissions comme `chantier.read`, `chantier.create`, `caisse.read`, `caisse.create`, `caisse.validate`, `gasoil.read`, `gasoil.create_sortie`, `gasoil.validate`, `personnel.read_salary`, `production.create`, `production.validate`, `rentabilite.read`, `admin.users.manage`. Les composants utilisent `can(user, 'permission.name')`.

---

## 8. Architecture des routes

Routes publiques : `/login`, `/forgot-password`, `/reset-password`.

Routes privées : `/app`, `/app/dashboard`, `/app/chantiers`, `/app/chantiers/[chantierId]`, `/app/caisse`, `/app/gasoil`, `/app/personnel`, `/app/engins`, `/app/production`, `/app/matieres`, `/app/fournisseurs`, `/app/sous-traitance`, `/app/transport`, `/app/entretien`, `/app/bq`, `/app/rapports`, `/app/validations`, `/app/alertes`, `/app/admin`, `/app/profile`.

Routes mobiles terrain : `/mobile`, `/mobile/accueil`, `/mobile/production/nouveau`, `/mobile/gasoil/sortie`, `/mobile/engins/pointage`, `/mobile/historique`, `/mobile/synchronisation`.

---

## 9. Structure de dossier frontend recommandée

```text
src/
├── app/
│   ├── (public)/login/
│   ├── (public)/forgot-password/
│   ├── (dashboard)/dashboard/
│   ├── (dashboard)/chantiers/
│   ├── (dashboard)/caisse/
│   ├── (dashboard)/gasoil/
│   ├── (dashboard)/personnel/
│   ├── (dashboard)/engins/
│   ├── (dashboard)/production/
│   ├── (dashboard)/matieres/
│   ├── (dashboard)/fournisseurs/
│   ├── (dashboard)/sous-traitance/
│   ├── (dashboard)/transport/
│   ├── (dashboard)/entretien/
│   ├── (dashboard)/bq/
│   ├── (dashboard)/rapports/
│   ├── (dashboard)/validations/
│   ├── (dashboard)/alertes/
│   ├── (dashboard)/admin/
│   └── mobile/
├── components/ui/
├── components/layout/
├── components/common/
├── components/forms/
├── components/tables/
├── components/charts/
├── components/domain/
├── features/auth/
├── features/chantiers/
├── features/caisse/
├── features/gasoil/
├── features/personnel/
├── features/engins/
├── features/production/
├── features/fournisseurs/
├── features/bq/
├── features/notifications/
├── hooks/
├── services/
├── mocks/
├── stores/
├── types/
├── schemas/
├── utils/
├── constants/
└── config/
```

Rôle : `components/ui` pour composants de base ; `components/layout` pour shells/navigation ; `components/common` pour états et composants transverses ; `components/domain` pour composants métier partagés ; `features` pour composants/hooks/services/types par module.

Exemple feature gasoil : `GasoilStockCard`, `GasoilEntreeForm`, `GasoilSortieForm`, `GasoilTable`, hooks `useGasoilEntrees`, `useGasoilSorties`, service `gasoil.service.ts`, schema `gasoil.schema.ts`, types.

---

## 10. Composants UI globaux indispensables

Layout : AppShell, DashboardLayout, MobileLayout, Sidebar, Topbar, MobileBottomNav, Breadcrumbs, PageHeader, PageActions.

Données : DataTable, DataTableToolbar, FilterBar, DateRangePicker, SearchInput, ColumnVisibilityToggle, ExportButton, PaginationControls.

Métier : ChantierSelector, ChantierStatusBadge, ValidationStatusBadge, PaymentStatusBadge, AmountDisplay, QuantityDisplay, DocumentUploader, DocumentPreview, AuditTimeline, ValidationActions, AlertBadge.

Dashboards : KpiCard, KpiGrid, TrendIndicator, MiniChartCard, CostBreakdownChart, ProductionChart, GasoilStockChart, AlertList, RecentActivityList.

Formulaires : FormSection, FormRow, MoneyInput, QuantityInput, DateInput, ChantierSelect, FournisseurSelect, EnginSelect, EmployeeSelect, WorkTypeSelect, FileUploadField, SubmitBar.

---

## 11. Design des pages principales

### 11.1 Login

Objectif : connexion simple. Contenu : logo OMOTAL, titre Gestion de Chantiers, email, mot de passe, bouton connexion, lien mot de passe oublié, message d'erreur. UX : centré, sobre, parfait mobile, redirection Ayoub vers `/mobile/accueil`, Ali/Boubker/Comptable vers `/app/dashboard`.

### 11.2 Dashboard global

Accès : Super Admin, Directeur, Comptable limité. Sections : header avec période/chantier/export, KPIs chantiers actifs/dépenses/solde/stock/restes/alertes/marge si autorisé, cartes chantiers, graphiques dépenses/gasoil/restes/évolution, alertes critiques.

### 11.3 Dashboard chantier

Header chantier : nom, statut, maître d'ouvrage, dates, responsable, période. KPIs : caisse, gasoil, salaires, engins, fournisseurs, production, coût moyen, avancement BQ. Onglets : Vue générale, Finance, Gasoil, Personnel, Engins, Production, Fournisseurs, Documents, Alertes. Activité récente : saisies, validations, paiements, documents.

### 11.4 Chantiers

Liste : nom, code, maître d'ouvrage, statut, responsable, date début, dépenses mois, alertes, actions. Actions : voir, modifier, archiver, exporter. Formulaire : nom, code, ref AO, maître d'ouvrage, localisation, dates, montant HT, TVA, statut, responsable, utilisateurs autorisés.

### 11.5 Caisse

KPIs : entrées, sorties, solde, dépenses en attente, dépenses sans justificatif. Filtres : chantier, date, type, catégorie, mode, statut, recherche. Table : date, chantier, type, catégorie, description, mode, débit, crédit, justificatif, statut, saisi par, actions. Formulaire : date, chantier, débit/crédit, montant, mode, catégorie, sous-catégorie, description, personne/fournisseur, document. UX : débit rouge, crédit vert, message validation direction si seuil dépassé, avertissement justificatif manquant.

### 11.6 Gasoil

Onglets : Vue d'ensemble, Entrées, Sorties, Consommation par engin, Anomalies. KPIs : stock, litres entrés/sortis, coût total, prix moyen, engin le plus consommateur, alertes. Graphiques : stock, consommation par engin, consommation par affectation. Form entrée : date, chantier, fournisseur, litres, PU, montant, BR, bon fournisseur, justificatif. Form sortie : date, chantier, BS, engin, chauffeur, affectation, litres, PU, montant, jauges, KM, photo, observation. Mobile sortie : engin, litres, affectation, photo, observation.

### 11.7 Personnel

Onglets : Employés, Pointage mensuel, Avances, Paie mensuelle, Historique. Liste employés : nom, poste, chantier, rémunération, salaire référence, statut, actions. Pointage mensuel type Excel propre : employé, poste, jours, total heures, total jours, salaire dû, avances, reliquat, statut. UX : cellules éditables, vendredis/repos différenciés, total recalculé, valider mois, exporter. Fiche employé : infos, pointage, avances, paiements, reliquats.

### 11.8 Engins

Onglets : Engins, Pointage mensuel, Consommation gasoil, Paiements, Entretien, Rentabilité engin. Liste : désignation, type, loueur/propriétaire, mode facturation, tarif, chauffeur, statut, actions. Pointage : engin, chauffeur, jours, total heures, jours facturés, tarif, dû, payé, restant, validation. Mobile : liste engins actifs avec champs heures, journée complète, observation/panne, enregistrer brouillon, soumettre journée.

### 11.9 Production & Rendements

Onglets : Saisies production, Synthèse jour, Synthèse voie, Synthèse engin, Coûts et rendements. Table : date, voie, tranche, tronçon, type travail, engin, chauffeur, dimensions, quantité, unité, heures, rendement, coût/unité, statut, actions. Desktop form : date, chantier, voie, tranche, tronçon, type, BQ, engin, chauffeur, dimensions, quantité calculée, heures, photos, observation. Mobile form en étapes : localisation, engin, dimensions, confirmation. Synthèses : volume jour/voie, rendement engin, coût/m³, consommation L/m³.

### 11.10 Matières & Fournisseurs

Onglets : Achats matières, Fournisseurs, Paiements, Échéances, Situations fournisseurs. Table achats : date, fournisseur, désignation, quantité, unité, PU HT, total HT, TVA, total TTC, payé, restant, échéance, paiement, justificatif, actions. Vue fournisseur : total livré, payé, restant, factures échues, historique paiements.

### 11.11 Sous-traitance / ETP

Sections : sous-traitants, prestations, imputations OMOTAL, gasoil ETP, matières ETP, avances, situation à date. KPIs : prestations TTC, payé, imputé, reste à payer, reste à régulariser.

### 11.12 BQ & Rentabilité

Accès : Ali, Boubker, rôles autorisés. Sections : import/saisie BQ, articles BQ, réalisé par article, coûts affectés, rentabilité. Table : article, désignation, unité, quantité marché, quantité réalisée, avancement, PU, montant réalisé, PR prévu, coût réel, marge réelle, statut. UX : colonnes sensibles masquées selon rôle, indicateurs rentable/attention/perte, export Excel.

### 11.13 Validations

Centralise sorties gasoil, productions, pointages engins, transactions élevées, achats/factures en attente. Table : type, chantier, date, saisi par, résumé, montant/quantité, justificatif, statut, actions. Actions : voir détail, valider, rejeter avec motif, demander correction.

### 11.14 Alertes

Types : gasoil, caisse, personnel, engins, fournisseurs, BQ, retards. Statuts : nouvelle, vue, en cours, résolue, ignorée. UX : priorité critique > haute > moyenne > basse, filtrage chantier/module, lien vers opération concernée.

### 11.15 Rapports

Rapports : caisse mensuelle, gasoil mensuel, pointage personnel, pointage engins, situation fournisseur, situation ETP, production/rendements, dashboard chantier PDF, rentabilité BQ. UX : type rapport, chantier, période, format Excel/PDF, inclure brouillons selon permission, générer.

### 11.16 Administration

Sections : utilisateurs, rôles et permissions, référentiels globaux, paramètres société, seuils alertes, import Excel, logs. Utilisateurs : nom, email, rôle, chantiers autorisés, statut, dernière connexion, actions.

---

## 12. États standards de chaque page

Chaque page doit gérer : loading avec skeleton loaders, empty state utile avec action, error simple avec réessayer et détail technique caché, no permission avec retour dashboard, offline avec bandeau « Vous êtes hors ligne. Les saisies seront synchronisées plus tard. »

---

## 13. Formulaires : règles UX

Principes : champs par sections, obligatoires indiqués, validation immédiate, erreurs simples, montants/quantités formatés, calculs temps réel, sauvegarder brouillon, soumettre.

Sortie gasoil : litres + PU calculent montant, stock insuffisant avertit, engin absent erreur, photo manquante avertit selon règle.

Production : longueur/largeur/profondeur calculent volume, unité affichée, rendement estimé si heures disponibles.

---

## 14. Tables : règles UX

Chaque table desktop doit avoir recherche, filtres, tri, pagination, colonnes masquables, export, actions ligne, badges statut, montants alignés à droite, dates formatées, état vide.

Colonnes standards : date, chantier, description, montant/quantité, statut, saisi par, validé par, actions.

---

## 15. Dashboard : règles UX

Structure : header avec filtre période, KPIs principaux, graphiques importants, tables/récap, alertes, activité récente.

KPI card : titre, valeur, unité, variation vs période précédente, état normal/attention/critique, lien détail.

---

## 16. Mobile terrain : conception détaillée

Objectif : expérience ultra simple pour chantier avec peu de temps, soleil, bruit, connexion faible.

Accueil mobile : Bonjour Ayoub, chantier, date, statut synchronisation, actions production/gasoil/engins, récapitulatif productions/litres/engins/en attente.

Règles : pas de tableaux complexes, gros boutons, formulaires en étapes, date préremplie, chantier prérempli si un seul assigné, sauvegarde locale, confirmation claire.

Parcours production : voie/tranche/tronçon, type travail, engin, dimensions, quantité calculée, photo, soumettre.

Parcours gasoil : engin, litres, affectation, photo, soumettre.

Parcours pointage engins : liste actifs, heures, panne/arrêt, soumettre journée.

---

## 17. Offline et synchronisation frontend

Le frontend doit être conçu pour l'offline même si le complet vient en phase 2/3.

États mobile : brouillon local, attente synchronisation, synchronisé, erreur synchronisation, conflit.

Affichage : badges Local, Envoyé, Validé, Rejeté.

Stockage local : `localQueue` pour opérations hors ligne, photos en attente, erreurs de synchronisation.

---

## 18. Données mockées à préparer

Mock users : Ali Super Admin, Boubker Directeur, Ayoub Pointeur, Comptable Administration, Responsable chantier.

Mock chantiers : Génie Meknès AO 62/2026, Chantier Zaitoune, Chantier Berkane.

Mock modules : transactions caisse, entrées gasoil, sorties gasoil, personnel, engins, productions, fournisseurs, ETP, alertes, BQ articles.

Objectif : couvrir données normales, données manquantes, alertes, paiements partiels, rejet/validation, différents rôles.

---

## 19. Types TypeScript principaux

```ts
type UserRole =
  | 'SUPER_ADMIN'
  | 'DIRECTEUR'
  | 'RESPONSABLE_CHANTIER'
  | 'POINTEUR'
  | 'COMPTABLE'
  | 'MATERIEL'
  | 'LECTURE_SEULE';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  chantierIds: string[];
  permissions: string[];
};

type ChantierStatus = 'PREPARATION' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';

type Chantier = {
  id: string;
  name: string;
  code: string;
  refAo?: string;
  maitreOuvrage?: string;
  status: ChantierStatus;
  startDate: string;
  expectedEndDate?: string;
  montantMarcheHt?: number;
  responsableId?: string;
};

type ValidationStatus =
  | 'BROUILLON'
  | 'SOUMIS'
  | 'VALIDE'
  | 'REJETE'
  | 'ANNULE'
  | 'VERROUILLE';

type Transaction = {
  id: string;
  chantierId: string;
  date: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  paymentMode: string;
  category: string;
  description: string;
  status: ValidationStatus;
  documentUrl?: string;
  createdBy: string;
};

type GasoilSortie = {
  id: string;
  chantierId: string;
  date: string;
  bsNumber: string;
  enginId: string;
  chauffeurId?: string;
  affectation: 'PRODUCTION' | 'ETP' | 'PERSONNEL' | 'TRANSPORT' | 'AUTRE';
  litres: number;
  unitPrice: number;
  totalAmount: number;
  status: ValidationStatus;
  documentUrl?: string;
};

type Production = {
  id: string;
  chantierId: string;
  date: string;
  voie: string;
  tranche?: string;
  troncon?: string;
  workType: string;
  enginId?: string;
  chauffeurId?: string;
  length?: number;
  width?: number;
  depth?: number;
  quantity: number;
  unit: 'M3' | 'M2' | 'ML' | 'U' | 'T';
  hours?: number;
  status: ValidationStatus;
};
```

---

## 20. Ordre de développement frontend recommandé

1. Base projet : Next.js + TS, Tailwind, shadcn/ui, ESLint/Prettier, layouts public/dashboard, thème OMOTAL.
2. Auth simulée et rôles : login, mocks users, store user, redirections, permissions, menus dynamiques.
3. Layout application : sidebar, topbar, mobile layout, bottom nav, PageHeader, Breadcrumbs.
4. Dashboards global et chantier : KPIs mockés, cartes chantier, graphiques, alertes, filtres période.
5. Chantiers : liste, détail, formulaire création/modification.
6. Gasoil : vue globale, tables entrées/sorties, forms entrée/sortie, version mobile sortie.
7. Engins : liste, pointage mensuel, form mobile pointage.
8. Personnel : employés, pointage mensuel, avances, calculs affichés.
9. Caisse : transactions, filtres, form transaction, statuts validation.
10. Production mobile : formulaire étapes, synthèse jour, table desktop.
11. Validations et alertes : actions valider/rejeter, page alertes.
12. Rapports : génération rapports, exports mock.

---

## 21. Version MVP frontend à livrer en premier

Pages prioritaires : Login, Dashboard global, Dashboard chantier, Liste chantiers, Caisse, Gasoil, Personnel, Engins, Mobile Ayoub accueil, Mobile Ayoub sortie gasoil, Mobile Ayoub pointage engins, Mobile Ayoub production, Validations, Alertes.

Mockable au début : connexion, chantiers, transactions, stock gasoil, pointages, calculs, notifications, exports.

Réel dès le début : navigation, permissions visibles, responsive mobile, formulaires, validations frontend, structure des données, expérience utilisateur.

---

## 22. Checklist qualité frontend

Général : application responsive, menus différents par rôles, loading/empty/error, formulaires validés, montants MAD, dates claires, tables avec filtres/pagination, confirmations actions importantes, erreurs compréhensibles.

Mobile : boutons grands, clavier numérique, petits écrans supportés, navigation simple, statut synchronisation visible.

Métier : Ayoub ne voit ni caisse, ni salaires, ni marge ; directeur voit dashboards ; comptable voit caisse/personnel/fournisseurs ; opérations validées distinguées ; alertes visibles.

---

## 23. Erreurs à éviter

- Commencer tous les modules à la fois.
- Mettre toute la logique métier dans React.
- Créer des tables illisibles sur mobile.
- Afficher les mêmes menus à tous les rôles.
- Créer des formulaires trop longs pour Ayoub.
- Mélanger mocks et UI sans couche service.
- Oublier loading/empty/error.
- Oublier permissions sur boutons.
- Créer un design décoratif mais peu métier.
- Reproduire Excel exactement au lieu d'améliorer l'expérience.

---

## 24. Recommandation finale frontend

Créer une version qui donne l'impression d'un vrai produit utilisable, même avec mocks. Priorités : layout professionnel, navigation par rôle, dashboard clair, formulaires mobile terrain simples, tables desktop puissantes, composants réutilisables, couche services prête backend, validations frontend, UX cohérente, branchement API sans refaire l'interface.

Le frontend doit être développé comme si le backend existait déjà, mais avec des données mockées contrôlées. C'est la meilleure manière d'avancer vite, valider l'expérience avec les utilisateurs, puis connecter progressivement les vrais modules backend.
