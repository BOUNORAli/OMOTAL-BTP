# PRD v2.0 — Application Web de Gestion de Chantiers OMOTAL TRAVAUX

Produit : Plateforme web & mobile de gestion complète des chantiers  
Entreprise : OMOTAL TRAVAUX  
Auteur fonctionnel : Ali BOUNOR  
Date : Mai 2026  
Statut : Version améliorée — base de discussion avant spécifications détaillées  
Source métier : Analyse des fichiers Excel existants : situation chantier, suivi rendements, pointage personnel, pointage engins, gasoil, caisse, matières, transport, ETP.

---

## 1. Résumé exécutif

OMOTAL TRAVAUX gère aujourd'hui ses chantiers à travers plusieurs fichiers Excel contenant des données financières, opérationnelles et administratives : caisse, gasoil, pointage personnel, pointage engins, production, rendements, fournisseurs, matières, transport, ETP et tableaux de bord.

Ces fichiers représentent déjà une logique métier riche, mais ils présentent des limites fortes : données dispersées, formules fragiles, duplication mensuelle, manque de traçabilité, absence de rôles, absence de validation formelle, risques d'erreurs, difficulté d'accès mobile et faible visibilité en temps réel.

L'objectif du produit est de créer une application web centralisée, multi-chantiers, mobile-first pour le terrain, avec rôles différenciés, workflows de validation, tableaux de bord en temps réel, pièces justificatives, alertes automatiques, exports Excel/PDF et suivi avancé de la rentabilité.

L'application doit devenir un ERP chantier léger, adapté à la réalité opérationnelle d'OMOTAL, et non une simple copie des fichiers Excel en ligne.

---

## 2. Vision produit

Créer une plateforme unique permettant à OMOTAL TRAVAUX de :

- Suivre chaque chantier en temps réel.
- Maîtriser les dépenses et les paiements.
- Suivre le gasoil de l'entrée jusqu'à la consommation par engin.
- Gérer le pointage personnel et engins.
- Calculer automatiquement les salaires, locations, avances et restes à payer.
- Suivre la production terrain, les rendements et les coûts par m³/m².
- Comparer le réalisé au BQ et au prix de revient prévisionnel.
- Réduire les erreurs de saisie et de calcul.
- Faciliter le travail du pointeur terrain via mobile.
- Donner à la direction une vision claire, fiable et consolidée.

### 2.1 Principe fondamental

Chaque donnée importante doit être :

1. Saisie une seule fois.
2. Rattachée à un chantier.
3. Liée à une personne responsable.
4. Validée selon un workflow clair.
5. Historisée.
6. Exploitable dans les tableaux de bord et exports.

---

## 3. Problèmes actuels et solutions attendues

| Problème actuel | Impact | Solution cible |
|---|---|---|
| Plusieurs fichiers Excel séparés | Données difficiles à synchroniser | Base de données centralisée |
| Formules cassées ou fragiles | Risque d'erreur financière | Calculs serveur robustes et testés |
| Duplication des feuilles par mois | Maintenance lourde | Gestion automatique des périodes |
| Mélange saisie/calcul/synthèse | Fichier difficile à contrôler | Séparation saisie, validation, synthèse |
| Pas de rôles | Données sensibles visibles à tous | Permissions par rôle et chantier |
| Pas de validation formelle | Données non fiables | Workflows brouillon/soumis/validé/rejeté |
| Pas d'historique | Impossible de savoir qui a modifié quoi | Audit log complet |
| Pas de justificatifs centralisés | Difficulté de contrôle | Upload photo/PDF lié aux opérations |
| Pas de mobile terrain adapté | Saisie tardive ou incomplète | Interface mobile-first / PWA |
| Pas d'alertes | Problèmes découverts trop tard | Notifications automatiques |
| Suivi rentabilité manuel | Décisions tardives | Dashboard coût réel vs prévu |

---

## 4. Objectifs produit

### 4.1 Objectifs principaux

- Remplacer progressivement les fichiers Excel utilisés pour la gestion chantier.
- Permettre la saisie quotidienne terrain depuis mobile.
- Fiabiliser les calculs de caisse, gasoil, paie, engins, fournisseurs et rendements.
- Fournir une vision journalière, mensuelle et globale par chantier.
- Mettre en place une séparation stricte des accès selon les rôles.
- Automatiser les alertes et les contrôles métier.
- Suivre la rentabilité réelle par chantier, article BQ, voie, engin et période.

### 4.2 Objectifs mesurables

| Indicateur | Cible |
|---|---|
| Temps de saisie quotidienne terrain | Moins de 10 minutes |
| Temps de clôture mensuelle | Moins de 30 minutes |
| Erreurs de calcul manuel | 0 erreur critique |
| Disponibilité du dashboard | Temps réel ou quasi temps réel |
| Taux d'opérations avec justificatif | Supérieur à 90 % |
| Délai de validation des saisies terrain | Moins de 24 h |
| Couverture des chantiers actifs | 100 % à terme |

---

## 5. Périmètre fonctionnel

### 5.1 Inclus dans le produit

- Gestion multi-chantiers.
- Gestion des utilisateurs, rôles et permissions.
- Caisse et transactions.
- Entrées/sorties gasoil et stock théorique.
- Pointage personnel et calcul de paie.
- Pointage engins et calcul des locations.
- Production terrain et rendements.
- Achats matières, fournisseurs et échéances.
- Sous-traitants / ETP.
- Transport.
- Entretien engins.
- BQ, prix de revient et rentabilité.
- Justificatifs et documents.
- Workflows de validation.
- Alertes et notifications.
- Tableaux de bord.
- Exports Excel/PDF.
- Import initial des fichiers Excel historiques.

### 5.2 Hors périmètre initial

- Comptabilité générale complète.
- Déclarations fiscales.
- Gestion RH avancée : contrats, CNSS, congés légaux complets.
- Gestion complète des appels d'offres.
- Génération officielle des attachements maître d'ouvrage.
- Facturation client complète.
- Gestion bancaire automatisée connectée aux banques.
- Gestion stock magasin avancée multi-dépôts, sauf besoin confirmé.

### 5.3 Point important

Certains éléments hors périmètre peuvent devenir des modules futurs, mais ils ne doivent pas bloquer le MVP.

---

## 6. Utilisateurs, rôles et permissions

### 6.1 Super Admin — Ali

Profil : responsable produit/interne avec accès complet.  
Accès : tous chantiers, tous modules, toutes données.

Capacités :

- Créer, modifier, archiver un chantier.
- Gérer utilisateurs, rôles et accès chantier.
- Voir toutes les données financières et opérationnelles.
- Valider ou annuler les opérations sensibles.
- Configurer les seuils d'alerte.
- Gérer les référentiels globaux.
- Importer/exporter les données.
- Corriger une donnée validée via procédure tracée.
- Verrouiller une période.

### 6.2 Directeur — Boubker

Profil : direction, pilotage et validation haute importance.  
Accès : lecture globale, approbations stratégiques.

Capacités :

- Consulter les dashboards multi-chantiers.
- Voir les situations financières.
- Voir marges, coûts, rentabilité et paiements.
- Approuver les paiements au-dessus d'un seuil.
- Consulter les alertes critiques.
- Exporter les rapports de direction.

Restrictions :

- Ne saisit pas les données opérationnelles quotidiennes.
- Ne modifie pas les pointages ou productions terrain.

### 6.3 Pointeur Chantier — Ayoub

Profil : saisie terrain quotidienne depuis mobile.  
Accès : chantiers assignés uniquement.

Capacités :

- Saisir la production journalière.
- Saisir les sorties gasoil.
- Pointer les engins.
- Ajouter photos/justificatifs.
- Consulter le récapitulatif de ses propres saisies.
- Modifier ses saisies tant qu'elles ne sont pas validées.

Restrictions :

- Pas d'accès à la caisse globale.
- Pas d'accès aux salaires.
- Pas d'accès à la marge ou bénéfice.
- Pas d'accès aux paiements fournisseurs/ETP.
- Pas de suppression après soumission.

### 6.4 Comptable / Administration

Profil : saisie administrative et suivi financier.  
Accès : bureau, chantiers assignés.

Capacités :

- Saisir les transactions caisse.
- Saisir les entrées gasoil.
- Gérer avances, paiements et restes à payer.
- Saisir ou contrôler le pointage personnel.
- Gérer achats matières et fournisseurs.
- Gérer situations ETP/sous-traitants.
- Exporter les rapports financiers.

Restrictions :

- Pas de modification directe des productions terrain validées.
- Accès au BQ/rentabilité uniquement si autorisé par Super Admin.

### 6.5 Responsable chantier / Conducteur de travaux

Profil : validation opérationnelle.  
Accès : chantiers assignés.

Capacités :

- Valider les pointages engins.
- Valider les sorties gasoil.
- Valider les productions terrain.
- Consulter les rendements.
- Consulter les coûts opérationnels non sensibles si autorisé.
- Ajouter observations et corrections demandées.

Restrictions :

- Accès aux salaires et bénéfices selon configuration.
- Ne valide pas les gros paiements sauf autorisation.

### 6.6 Responsable matériel / Mécanicien

Profil : suivi des entretiens et pannes.  
Accès : engins des chantiers assignés.

Capacités :

- Déclarer pannes.
- Saisir interventions d'entretien.
- Ajouter pièces, fournisseurs, coûts et photos.
- Voir historique d'un engin.

### 6.7 Lecture seule / Partenaire

Profil : associé ou partenaire ayant besoin d'une visibilité limitée.  
Accès : dashboards ou rapports sélectionnés.

Capacités :

- Consulter certains rapports.
- Exporter si autorisé.

Restrictions :

- Aucun droit de saisie ou modification.

---

## 7. Matrice de permissions synthétique

| Module / Action | Super Admin | Directeur | Responsable chantier | Pointeur | Comptable | Matériel | Lecture seule |
|---|---|---|---|---|---|---|---|
| Créer chantier | Oui | Non | Non | Non | Non | Non | Non |
| Voir dashboard global | Oui | Oui | Limité | Non | Limité | Non | Limité |
| Saisir production | Oui | Non | Oui | Oui | Non | Non | Non |
| Valider production | Oui | Non | Oui | Non | Non | Non | Non |
| Saisir sortie gasoil | Oui | Non | Oui | Oui | Non | Non | Non |
| Valider sortie gasoil | Oui | Non | Oui | Non | Non | Non | Non |
| Saisir entrée gasoil | Oui | Non | Non | Non | Oui | Non | Non |
| Voir caisse | Oui | Oui | Selon droit | Non | Oui | Non | Selon droit |
| Saisir transaction | Oui | Non | Non | Non | Oui | Non | Non |
| Valider paiement élevé | Oui | Oui | Non | Non | Non | Non | Non |
| Voir salaires | Oui | Oui | Selon droit | Non | Oui | Non | Non |
| Saisir pointage personnel | Oui | Non | Oui | Selon droit | Oui | Non | Non |
| Saisir entretien | Oui | Non | Oui | Non | Non | Oui | Non |
| Voir rentabilité | Oui | Oui | Selon droit | Non | Selon droit | Non | Selon droit |
| Exporter rapports | Oui | Oui | Limité | Non | Oui | Limité | Limité |

---

## 8. Cycle de vie des données et workflows

### 8.1 Statuts génériques

Toute opération importante suit un cycle :

1. Brouillon : saisie en cours.
2. Soumis : envoyé pour validation.
3. Validé : intégré officiellement dans les calculs.
4. Rejeté : retourné avec motif.
5. Corrigé : nouvelle version après rejet.
6. Annulé : opération neutralisée, mais conservée dans l'historique.
7. Verrouillé : période clôturée, modification impossible sauf Super Admin.

### 8.2 Workflow sortie gasoil

1. Le pointeur saisit la sortie gasoil depuis mobile.
2. Il sélectionne chantier, engin, chauffeur, quantité, affectation.
3. Il ajoute photo du bon ou jauge si disponible.
4. La sortie passe en statut Soumis.
5. Le responsable chantier valide ou rejette.
6. Après validation, le stock théorique et le coût engin sont recalculés.
7. Toute correction après validation crée une trace dans l'audit log.

### 8.3 Workflow production terrain

1. Le pointeur saisit voie, tranche, tronçon, engin, dimensions, type de travail.
2. Le système calcule automatiquement m³ ou m².
3. Le responsable chantier vérifie la cohérence.
4. Après validation, les rendements et coûts sont recalculés.
5. Les données alimentent le dashboard chantier et le module BQ.

### 8.4 Workflow pointage engins

1. Le pointeur saisit heures ou journées par engin.
2. Le système applique le mode de facturation : heure ou jour.
3. Le responsable valide le pointage.
4. Le comptable peut associer les paiements.
5. Le système calcule dû, payé et restant.

### 8.5 Workflow pointage personnel

1. Le pointeur, responsable ou comptable saisit les heures/jours.
2. Le système calcule salaire dû selon le tarif.
3. Les avances sont liées aux transactions caisse.
4. Le comptable valide la paie mensuelle.
5. Le reliquat est reporté automatiquement.

### 8.6 Workflow achat matière/fournisseur

1. Le comptable saisit le bon de réception ou achat.
2. Il associe fournisseur, matière, quantité, PU, TVA, échéance.
3. Il ajoute photo du bon/facture.
4. Le paiement peut être partiel ou total.
5. Le système met à jour situation fournisseur et reste à payer.

### 8.7 Workflow paiement important

1. Une transaction supérieure au seuil configuré est saisie.
2. Elle reste en attente d'approbation.
3. Ali ou Boubker reçoit une alerte.
4. Après approbation, le paiement devient validé.
5. En cas de rejet, le motif est obligatoire.

---

## 9. Modules fonctionnels détaillés

### M01 — Gestion des Chantiers

Objectif : créer une entité chantier centrale qui isole toutes les données opérationnelles, financières et analytiques.

Données chantier : nom, code interne, référence appel d'offres, maître d'ouvrage, localisation GPS, adresse, date début, date fin contractuelle, date fin prévisionnelle mise à jour, montant marché HT, TVA applicable, montant marché TTC, budget prévisionnel, statut, responsable chantier, partenaires groupement, taux de participation par partenaire, sous-traitants principaux, utilisateurs autorisés, documents contractuels.

Fonctionnalités : créer/modifier/archiver un chantier, affecter utilisateurs et rôles, affecter engins/personnel/fournisseurs, voir fiche complète, voir KPI résumé, archiver sans supprimer.

Règles métier : chantier archivé consultable mais non modifiable, données visibles uniquement aux utilisateurs autorisés, suppression uniquement si aucune donnée liée sinon archivage obligatoire.

### M02 — Caisse & Transactions

Objectif : centraliser toutes les entrées/sorties de trésorerie, remplacer les feuilles Transactions et BDD_Caisse, fournir un solde fiable par chantier, période et mode de paiement.

Données transaction : date, chantier, projet/affectation, type débit/crédit, montant, mode de paiement, catégorie, sous-catégorie, description, fournisseur/personne concernée, opération liée, justificatif, saisi par, validé par, statut.

Fonctionnalités : saisie rapide, upload justificatif, recherche, filtres, vue journalière/mensuelle/globale, solde par mode, réconciliation entre paiements et dettes, export Excel/PDF.

Règles métier : toute sortie doit avoir une catégorie, sortie supérieure au seuil nécessite approbation, solde négatif génère alerte, transaction validée non modifiable directement et correction tracée obligatoire.

### M03 — Gasoil

Objectif : suivre le carburant de l'achat/ravitaillement jusqu'à la consommation par engin, véhicule, ETP ou autre affectation.

#### M03a — Entrées gasoil

Données : date, chantier, fournisseur/station, quantité litres, prix unitaire, montant total, numéro BR, numéro bon fournisseur, mode de paiement, justificatif, observation.

Fonctionnalités : saisie entrée gasoil, calcul prix moyen par période, association à une transaction caisse, import historique Excel.

#### M03b — Sorties gasoil

Données : date, chantier, numéro BS, station/fournisseur, affectation, engin/véhicule, chauffeur/responsable, litres, prix unitaire, montant calculé, jauge début/fin, KM début/fin, BR de référence, photo bon/jauge, observation.

Calculs : stock théorique = entrées validées - sorties validées, consommation L/km, DH/km, coût gasoil par engin, L/m³, DH/m³, L/m², DH/m², gasoil ETP selon affectation.

Alertes : stock négatif, sortie sans engin, sortie sans responsable, prix/litre manquant, consommation anormale, retour gasoil négatif, bon dupliqué.

### M04 — Pointage Personnel & Paie

Objectif : remplacer les feuilles mensuelles de pointage salaire et automatiser salaires, avances et reliquats.

Référentiel employé : nom, prénom, poste, chantier d'affectation, type de rémunération heure/jour/mois, salaire mensuel, salaire journalier, salaire horaire, date début, date fin, statut actif/inactif/transféré, pièce jointe optionnelle.

Pointage journalier : date, chantier, employé, heures travaillées, type journée, observation, saisi par, validé par, statut.

Avances : date, employé, montant, mode de paiement, transaction liée, motif, justificatif.

Calculs : total heures par mois, total jours travaillés, salaire dû, avances du mois, reliquat précédent, reliquat final, montant à payer.

Règles métier : tarif utilisé historisé au moment du pointage, changement de tarif non rétroactif sauf action volontaire, paie validée/verrouillée non modifiable sans correction officielle.

### M05 — Pointage Engins

Objectif : suivre heures/jours des engins, calculer locations, relier consommations gasoil et mesurer coût réel par machine.

Référentiel engin : désignation, type, propriétaire/loueur, chantier affecté, mode facturation heure/jour/forfait/interne, tarif horaire, tarif journalier, chauffeur habituel, statut.

Pointage engin : date, chantier, engin, chauffeur, heures travaillées, jours facturés, type activité, jauge début/fin, observation, statut validation.

Calculs : coût location, coût gasoil lié, coût entretien lié, coût total engin, heures par période, dû, payé, restant.

Règles métier : mode de facturation historisé, engin pointé sans tarif génère alerte, engin avec gasoil sans pointage génère alerte, engin pointé sans production autorisé avec justification.

### M06 — Production & Rendements

Objectif : remplacer le fichier de suivi des rendements et permettre le suivi terrain détaillé par voie, tranche, tronçon, engin et jour.

Types de production : décapage, réglage, déblai, remblai, compactage, transport, autres travaux configurables.

Saisie production : date, chantier, voie, tranche, tronçon/repère, article BQ lié, engin, chauffeur, type de travail, profondeur, longueur, largeur, quantité manuelle, unité m³/m²/ml/u/tonne, heures optionnelles, observation, photos terrain.

Calculs : volume m³, surface m², rendement m³/h ou m²/h, rendement par jour, gasoil alloué au prorata, location allouée, coût personnel alloué, frais chauffeur/logement, frais siège, coût total alloué, coût/m³ ou coût/m².

Synthèses : par jour, semaine, mois, voie, tranche, tronçon, engin, chauffeur, type de travail, article BQ.

Règles métier : production validée alimente le BQ si liée à un article, dimensions négatives interdites, quantités nulles justifiées, production sans engin autorisée seulement pour certains travaux manuels.

### M07 — Matières Premières & Fournisseurs

Objectif : tracer achats, bons de réception, factures, échéances, paiements et restes à payer.

Référentiel fournisseur : nom, type, contact, téléphone, adresse, conditions de paiement, statut.

Achat matière : date, chantier, fournisseur, désignation, unité, quantité, prix unitaire HT, transport HT, total HT, TVA, total TTC, numéro BR, numéro bon fournisseur, affectation, article BQ lié, échéance, statut paiement, montant payé, restant à payer, justificatif.

Fonctionnalités : situation fournisseur, paiements partiels, suivi échéances, export situation fournisseur, alertes facture impayée.

### M08 — Sous-traitance / ETP

Objectif : gérer situations ETP et sous-traitants avec prestations, avances, fournitures imputées, gasoil et régularisation.

Données sous-traitant : nom société, contact, contrat, conditions de paiement, taux TVA, retenue éventuelle.

Prestations : date, chantier, sous-traitant, désignation, article BQ, quantité, prix unitaire, montant HT, TVA, montant TTC, statut.

Imputations OMOTAL vers sous-traitant : gasoil fourni, matières fournies, avances, transport, autres frais imputables.

Calculs : montant prestations TTC, total payé, total fournitures imputées, reste à payer, reste à imputer, écart à régulariser.

### M09 — Transport

Objectif : suivre les voyages de transport et leur coût par chantier, fournisseur, période et affectation.

Données : date, chantier, transporteur, désignation, départ, arrivée, nombre de voyages, prix unitaire, total, numéro BR, affectation matière/ETP/engin/autre, justificatif, observation.

Fonctionnalités : situation transporteur, coût transport par période, intégration possible au coût matière, export mensuel.

### M10 — Entretien Engins

Objectif : créer un vrai historique de maintenance pour chaque engin, avec coûts et alertes.

Données : date, chantier, engin, fournisseur/atelier, type intervention, désignation, quantité, prix unitaire, total, numéro BL/facture, chauffeur concerné, immobilisation, nombre de jours d'arrêt, justificatif, observation.

Fonctionnalités : historique par engin, coût entretien mensuel/cumulé, rapport rentabilité engin, alerte coût élevé, alerte immobilisation longue.

### M11 — BQ & Prix de Revient

Objectif : comparer avancement réel et coûts réels au BQ et au prix de revient prévisionnel.

Données article BQ : chantier, numéro article, désignation, unité, quantité marché, PU marché HT, montant marché HT, PR prévisionnel main d'œuvre, matériaux, engins, sous-traitance, frais généraux, PR total, marge prévue.

Réalisé : article BQ, date/période, quantité réalisée, source production terrain/saisie manuelle/import, validation.

Calculs : avancement %, montant réalisé, coût réel affecté, écart coût, marge réelle, taux de marge réel.

Alertes : quantité réalisée > quantité marché, marge réelle négative, coût réel supérieur au prévu, avancement faible par rapport au planning.

### M12 — Tableaux de bord

Dashboard direction multi-chantiers : chantiers actifs, dépenses totales période, encaissements/financements, engagements restants à payer, solde par mode, gasoil total consommé, alertes critiques, marge estimée par chantier, classement rentabilité.

Dashboard chantier : filtres jour/semaine/mois/période/global ; blocs caisse, gasoil, personnel, engins, matières, ETP, production, rentabilité, alertes.

Dashboard engins : heures par engin, coût location, gasoil consommé, entretien, coût total, production réalisée, coût/m³ ou coût/m², comparaison entre engins.

Dashboard finance : transactions par catégorie, dépenses par fournisseur, échéances proches, paiements validés/en attente, restes à payer, dépenses sans justificatif.

### M13 — Alertes & Notifications

Types d'alertes :

- Gasoil : stock théorique bas, stock négatif, consommation anormale, sortie sans engin, bon dupliqué.
- Caisse : sortie supérieure au seuil, solde faible, transaction sans justificatif, catégorie manquante.
- Personnel : pointage manquant, reliquat important, avance élevée, paie non clôturée.
- Engins : engin sans pointage, engin pointé sans production, gasoil sans pointage, entretien élevé, immobilisation longue.
- Fournisseurs : échéance proche, facture impayée depuis X jours, paiement partiel ancien.
- BQ / Rentabilité : marge négative, dépassement coût prévu, avancement supérieur à 100 %, retard de production.

Canaux : notification in-app, email, WhatsApp/SMS en phase 2.

### M14 — Exports & Rapports

Exports Excel : caisse période, transactions brutes, gasoil entrées/sorties, pointage personnel mensuel, pointage engins mensuel, situation fournisseurs, situation ETP, rendements par jour/voie/engin, BQ réalisé vs prévu.

Exports PDF : dashboard chantier, situation fournisseur, situation ETP, fiche paie synthétique, rapport direction mensuel, rapport rentabilité.

Règles : chaque export contient période, chantier, date génération, généré par ; exports basés sur données validées sauf option explicite « inclure brouillons ».

### M15 — Documents & Justificatifs

Objectif : centraliser tous les documents liés aux opérations.

Types : bon de réception, bon de sortie, bon fournisseur, facture, reçu, photo jauge, photo compteur, photo terrain, contrat, BL, attachement interne.

Fonctionnalités : upload photo/PDF, compression automatique images, association à une opération, recherche par type/date/chantier/fournisseur, indicateur justificatif manquant, droits d'accès selon module.

### M16 — Import Excel & Migration historique

Objectif : récupérer les données historiques des fichiers existants et éviter une rupture brutale.

Fonctionnalités : import transactions, gasoil, pointage personnel, pointage engins, matières/fournisseurs, rendements, BQ/prix de revient.

Processus : upload, mapping automatique, prévisualisation, détection erreurs, correction/exclusion, import en statut « historique importé », rapport d'import.

Règles : aucune donnée importée ne doit écraser une donnée validée sans confirmation, doublons signalés, trace du fichier source conservée.

### M17 — Planning & Avancement

Objectif : ajouter une vision planning pour comparer avancement prévu et réalisé.

Fonctionnalités : planning chantier par phase, dates prévues, avancement prévu, avancement réel depuis production/BQ, retards, alertes retard.

Données : phase, article BQ lié, date début prévue, date fin prévue, quantité prévue, quantité réalisée, statut.

Phase produit : module possible en phase 3 après stabilisation des modules de base.

---

## 10. Modèle de données principal

Entités de base : User, Role, Permission, Chantier, ChantierUserAccess, Fournisseur, Personnel, Engin, Chauffeur, Voie, Tranche, Troncon, TypeTravail, Document, AuditLog, ValidationLog.

Entités opérationnelles : CaisseTransaction, GasoilEntree, GasoilSortie, PointagePersonnel, AvancePersonnel, PaieMensuelle, PointageEngin, PaiementEngin, Production, AchatMatiere, PaiementFournisseur, SousTraitant, SousTraitantPrestation, SousTraitantImputation, Transport, EntretienEngin, BQArticle, BQRealise, Alert, Notification.

Relations importantes :

- Un utilisateur peut avoir plusieurs chantiers autorisés.
- Un chantier possède plusieurs engins, personnels, fournisseurs, voies et productions.
- Une transaction peut être liée à un paiement, une avance, un achat ou un autre objet métier.
- Une sortie gasoil est liée à un engin, un chantier et éventuellement un article BQ.
- Une production est liée à un chantier, un engin, une voie, un type de travail et éventuellement un article BQ.
- Un document peut être attaché à plusieurs types d'opérations.
- Toute opération validable possède un statut et un historique.

---

## 11. Règles métier critiques

### 11.1 Isolation chantier

- Un utilisateur ne voit que les chantiers auxquels il est affecté.
- Les données financières globales sont réservées à la direction et aux rôles autorisés.
- Les exports respectent les mêmes permissions que l'interface.

### 11.2 Historisation

- Toute modification importante est enregistrée avec utilisateur, date, ancienne valeur, nouvelle valeur, motif si nécessaire.
- Les suppressions physiques sont interdites pour les données métier ; utiliser annulation ou archivage.

### 11.3 Validation

- Les données brouillon ne doivent pas impacter les rapports officiels.
- Les dashboards peuvent afficher brouillon + validé si option explicite activée.
- Les périodes clôturées sont verrouillées.

### 11.4 Tarifs

- Les tarifs personnel, engins, TVA, prix gasoil et frais siège sont historisés.
- Changer un tarif ne recalcule pas automatiquement les périodes déjà validées.

### 11.5 Gasoil

- Stock théorique = entrées validées - sorties validées.
- Une sortie supérieure au stock disponible nécessite autorisation.
- Une sortie négative est possible pour retour/correction mais génère une alerte.

### 11.6 Personnel

- Salaire horaire par défaut = salaire mensuel / 26 / 9.
- Les avances sont liées aux transactions caisse.
- Le reliquat est reporté au mois suivant.

### 11.7 Engins

- Si tarif journalier : jours facturés possiblement différents des heures saisies selon convention.
- Si tarif horaire : coût = heures × tarif horaire.
- Un engin peut être pointé sans production uniquement avec justification.

### 11.8 BQ

- Quantité réalisée supérieure à quantité marché déclenche une alerte.
- Coûts réels affectés à un article BQ quand possible.
- Marge réelle protégée par permissions.

---

## 12. Expérience utilisateur

Principes UX : mobile-first terrain, bureau/tableau pour administration et direction, formulaires courts, saisie numérique optimisée, sauvegarde automatique, champs obligatoires limités au départ, validations progressives, interface française, arabe/darija possible plus tard.

Interface mobile pointeur : accueil avec chantier, date, boutons Production/Sortie gasoil/Pointage engins/Photos, récapitulatif du jour ; production avec voie/tranche/tronçon, type travail, engin, dimensions et calcul ; gasoil avec engin/litres/affectation/photo ; pointage engins avec liste actifs, heures, journée complète, observation panne/arrêt.

Interface bureau : navigation par chantier, tableaux filtrables, dashboards, validations en attente, exports, administration.

---

## 13. Mode offline

Objectif : permettre la saisie terrain malgré connexion instable.

Fonctionnement : stockage local des données, identifiant local temporaire, synchronisation automatique au retour connexion, états visibles enregistré localement / synchronisation / synchronisé / erreur.

Gestion conflits : affichage conflit si donnée modifiée entre-temps, résolution par responsable ou admin, données financières sensibles non modifiables offline sauf autorisation.

Priorité : phase 1 responsive connectée, phase 2 offline simple terrain, phase 3 offline robuste avec conflits.

---

## 14. Sécurité et conformité interne

Exigences : HTTPS obligatoire, email/mot de passe, mots de passe robustes, sessions expirantes, rôles côté serveur, row-level security ou logique équivalente, audit log complet, sauvegardes quotidiennes, restauration possible, accès documents protégé.

Données sensibles : salaires, marges, paiements, solde caisse, documents financiers. Ces données nécessitent des permissions spécifiques.

---

## 15. Exigences non fonctionnelles

Performance : dashboard principal < 3 secondes, pagination grandes listes, recherche rapide transactions/fournisseurs/bons/engins.

Disponibilité : objectif 99 %, sauvegarde quotidienne, export complet possible à tout moment.

Scalabilité : support initial 5 à 10 chantiers actifs, 10 à 50 utilisateurs, architecture extensible.

Maintenabilité : code modulaire par domaine, tests calculs critiques, documentation API, journal versions.

Qualité : tests automatiques salaires/gasoil/caisse/BQ/rendements, tests import Excel, tests permissions, tests mobile.

---

## 16. Architecture technique recommandée

### Option A — Rapide à lancer

| Composant | Technologie | Justification |
|---|---|---|
| Frontend | Next.js / React | Rapide, moderne, bon pour PWA |
| Backend | Supabase | Auth, PostgreSQL, Storage, Realtime intégrés |
| Base de données | PostgreSQL | Données relationnelles fortes |
| Stockage | Supabase Storage | Photos et PDF |
| Déploiement | Vercel + Supabase | Mise en production rapide |
| Notifications | Email + fonctions serveur | Simple au départ |

### Option B — Plus robuste long terme

| Composant | Technologie | Justification |
|---|---|---|
| Frontend | Angular ou React | Application métier structurée |
| Backend | Spring Boot | Robuste, adapté ERP, maîtrisable par Ali |
| Base de données | PostgreSQL | Idéal pour relations métier |
| Stockage | S3 compatible / MinIO | Documents et justificatifs |
| Auth | JWT + RBAC | Contrôle total |
| Déploiement | VPS/Cloud | Maîtrise complète |

Recommandation : MVP rapide avec Next.js + Supabase ; produit stratégique durable avec Spring Boot + PostgreSQL + React/Angular. La décision dépend du but : prototype rapide ou système interne durable.

---

## 17. Roadmap produit

### Phase 0 — Cadrage détaillé

Durée indicative : 1 à 2 semaines. Livrables : PRD validé, rôles validés, modules MVP, modèle de données initial, maquettes prioritaires, règles de calcul confirmées, plan import Excel.

### Phase 1 — MVP opérationnel

Objectif : arrêter progressivement Excel sur un chantier pilote. Modules : auth, chantier, utilisateurs/rôles simples, référentiels engins/personnel/fournisseurs/voies, caisse, gasoil, pointage personnel, pointage engins, dashboard simple, upload justificatifs, exports Excel. Critère : chantier Génie Meknès suivi quotidiennement dans l'application.

### Phase 2 — Terrain & rendements

Objectif : couvrir saisies terrain et analyses production. Modules : production/rendements, synthèses jour/voie/engin, coût/m³ et coût/m², mobile amélioré, offline simple, alertes gasoil/pointage, import Excel. Critère : Ayoub saisit production, gasoil et pointage engins en moins de 10 minutes par jour.

### Phase 3 — Finance avancée & fournisseurs

Objectif : fiabiliser dettes, paiements, ETP, matières et transport. Modules : matières/fournisseurs, paiements partiels, échéances, sous-traitance/ETP, transport, entretien engins, exports PDF, workflows avancés. Critère : situation fournisseurs/ETP/engins fiable sans retraitement Excel.

### Phase 4 — BQ, rentabilité et pilotage direction

Objectif : piloter marge et coût réel. Modules : BQ et prix de revient, affectation coûts par article, dashboard rentabilité, alertes coût, planning simple, dashboard multi-chantiers. Critère : direction voit marge estimée, coûts réels et avancement sans attendre clôture mensuelle.

---

## 18. Backlog MVP priorisé

Priorité P0 — indispensable : connexion utilisateur, rôles basiques, chantiers, référentiels engins/personnel/fournisseurs, caisse, entrée/sortie gasoil, stock gasoil théorique, pointage personnel, pointage engins, dashboard chantier simple, exports Excel basiques.

Priorité P1 — très important : upload justificatifs, validation sorties gasoil, validation pointage engins, avances personnel, paiements engins, alertes stock bas, alertes dépense élevée, historique modifications.

Priorité P2 — après stabilisation : production/rendements, coût/m³, matières/fournisseurs, ETP, transport, entretien engins, exports PDF.

Priorité P3 — avancé : BQ/prix de revient, planning, rentabilité par article, offline robuste, notifications WhatsApp, application mobile native.

---

## 19. Critères d'acceptation MVP

Le MVP est réussi si :

1. Un chantier peut être créé et configuré.
2. Les utilisateurs se connectent avec rôles différents.
3. Ayoub saisit pointage engins et sorties gasoil depuis mobile.
4. Le comptable saisit caisse, entrées gasoil, personnel et avances.
5. Le stock gasoil se calcule automatiquement.
6. Les salaires mensuels se calculent automatiquement.
7. Les locations engins se calculent automatiquement.
8. Ali voit un dashboard chantier fiable.
9. Les données s'exportent en Excel.
10. Les modifications importantes sont historisées.
11. Les utilisateurs non autorisés ne voient pas les données sensibles.
12. Les calculs principaux donnent le même résultat que les fichiers Excel corrigés.

---

## 20. Risques et points de vigilance

| Risque | Impact | Réponse |
|---|---|---|
| Vouloir tout développer dès le début | Retard et complexité | MVP progressif |
| Reproduire Excel sans repenser le métier | Produit lourd et fragile | Modèle de données propre |
| Mauvaise adoption terrain | Données incomplètes | Mobile simple et rapide |
| Permissions mal définies | Fuite données sensibles | Matrice rôles stricte |
| Données Excel historiques sales | Import difficile | Import avec prévisualisation et erreurs |
| Calculs métier non validés | Perte de confiance | Tests + validation Excel référence |
| Connexion chantier instable | Saisie retardée | PWA offline progressive |
| Trop de champs obligatoires | Rejet utilisateur | Formulaires courts et validation progressive |

---

## 21. Questions à valider avec OMOTAL

Organisation : chantiers actifs au lancement, utilisateurs réels, qui valide quoi, seuil d'approbation Boubker, visibilité coûts/salaires par responsable.

Terrain : périmètre Ayoub, pointage personnel chantier ou comptable, fiabilité 4G, obligation photos de bons.

Finance : modes de paiement réels, BudgetBakers remplacé ou continué, avances fournisseurs, HT/TTC partout ou partiel.

Gasoil : stock physique/station ou les deux, plusieurs citernes/dépôts, conversion jauges cm en litres, retours gasoil négatifs.

BQ & rentabilité : existence fichier prix de revient par chantier, import BQ automatique, affectation coûts BQ dès MVP, marge visible seulement Ali/Boubker.

Hébergement : cloud rapide ou serveur maîtrisé, données au Maroc, responsable sauvegardes.

---

## 22. Recommandation finale produit

Construire l'application en quatre temps :

1. Base fiable : utilisateurs, chantiers, caisse, gasoil, pointage, dashboard.
2. Terrain efficace : production, rendements, mobile, justificatifs.
3. Finance complète : fournisseurs, ETP, paiements, entretien, transport.
4. Pilotage stratégique : BQ, prix de revient, rentabilité, planning, multi-chantiers.

Il ne faut pas commencer par tout coder : il faut valider fonctionnement réel, rôles, workflows et règles de calcul, puis construire un MVP robuste qui remplace les fichiers les plus critiques.

Priorité absolue : simplicité de saisie terrain, fiabilité des calculs, séparation des rôles, traçabilité, tableaux de bord utiles pour décider vite.

---

## 23. Prochaine étape proposée

Transformer ce PRD v2.0 en documents d'exécution :

1. User stories détaillées par rôle et module.
2. Modèle de données SQL détaillé.
3. Maquettes écran par écran.
4. Backlog technique Sprint 1.
5. Plan d'import Excel.
6. Architecture technique finale.
7. Règles de calcul validées une par une.

Le prochain document à produire devrait être : **Spécifications fonctionnelles MVP — Phase 1**, avec tous les écrans, champs, permissions, règles et critères d'acceptation nécessaires pour commencer le développement proprement.
