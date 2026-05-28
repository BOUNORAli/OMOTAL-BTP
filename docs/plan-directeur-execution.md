# Plan directeur d'execution - OMOTAL TRAVAUX

Ce plan transforme le PRD v2.0 en sequence de construction concrete. L'objectif est de commencer petit, solide et extensible : un MVP utilisable sur un chantier pilote, puis l'enrichir sans casser les calculs ni les permissions.

## 1. Decisions de depart

- Socle MVP : Next.js + TypeScript pour livrer vite une application web responsive.
- Backend cible : PostgreSQL/Supabase ou API dediee selon decision finale, mais la logique metier est isolee des maintenant.
- Mobile terrain : responsive web en Phase 1, PWA/offline en Phase 2.
- Donnees sensibles : jamais affichees sans permission explicite.
- Calculs critiques : testes automatiquement des le debut.

## 2. Ordre de construction

1. Socle technique : Next.js, TypeScript, styles globaux, structure domaine.
2. Modele metier : roles, chantiers, caisse, gasoil, personnel, engins.
3. Permissions : matrice RBAC simple et reutilisable.
4. Calculs : solde caisse, stock gasoil, cout engins, paie simple.
5. Interface pilote : dashboard direction, vue chantier, accueil mobile pointeur.
6. Validations : statuts brouillon, soumis, valide, rejete.
7. Exports : Excel Phase 1.
8. Persistance : branchement base de donnees.
9. Upload documents : justificatifs lies aux operations.
10. Audit log : historique creation, modification, validation, rejet.

## 3. Sprint 1 - Socle executable

Objectif : obtenir une application qui se lance, montre les premiers tableaux de bord et contient une logique metier testee.

Livrables :

- application Next.js ;
- design system visuel initial ;
- donnees mockees realistes ;
- types TypeScript du domaine MVP ;
- calculs metier purs ;
- tests unitaires des calculs ;
- page dashboard bureau ;
- page mobile pointeur.

## 4. Sprint 2 - CRUD et workflows MVP

Objectif : remplacer les mocks par des formulaires et une persistance.

Livrables :

- creation chantier ;
- referentiels engins, personnel, fournisseurs ;
- saisie caisse ;
- entree gasoil ;
- sortie gasoil ;
- pointage engins ;
- workflow soumis/valide/rejete ;
- audit log minimal.

## 5. Sprint 3 - Paie, exports et controle

Objectif : rendre le pilote exploitable par Ali et le comptable.

Livrables :

- pointage personnel ;
- avances personnel ;
- calcul salaire mensuel ;
- exports Excel ;
- dashboard avec filtres periode ;
- alertes MVP ;
- verrouillage simple des periodes.

## 6. Risques a maitriser

- Ne pas coder tous les modules du PRD au depart.
- Ne pas mettre les calculs uniquement dans l'UI.
- Ne pas melanger permissions d'affichage et permissions serveur.
- Ne pas rendre trop de champs obligatoires pour Ayoub.
- Ne pas importer l'historique Excel avant d'avoir valide les modeles.

## 7. Prochaine decision majeure

Choisir la strategie backend definitive :

- Supabase pour aller vite avec Auth, PostgreSQL, Storage et Realtime.
- Spring Boot + PostgreSQL pour controle long terme plus strict.

La structure actuelle garde cette decision reversible : les fonctions metier et types du domaine restent reutilisables dans les deux options.

