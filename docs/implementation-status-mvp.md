# Implementation status MVP - OMOTAL TRAVAUX

## Fait dans cette iteration

- Branche de travail : `codex/omotal-mvp`.
- Baseline frontend commitee avant les modifications backend.
- Backend Spring Boot cree dans `backend/`.
- Schema PostgreSQL Flyway pour le MVP Phase 1.
- Auth JWT, roles serveur et isolation chantier.
- API v1 initiale : auth, chantiers, caisse, gasoil, personnel, engins, fournisseurs, validations, documents, dashboard, exports `.xlsx`.
- Fondations ERP avancees ajoutees : production/rendements, achats matieres, paiements fournisseurs, ETP, transport, entretien, BQ/rentabilite et preview import Excel.
- Donnees demo chargees automatiquement en dev si la base est vide.
- Frontend conserve en mode mock par defaut, avec bascule backend via `NEXT_PUBLIC_API_BASE_URL`, et pages avancees branchees sur les endpoints quand le backend est actif.
- Login frontend compatible JWT backend, avec profils demo mot de passe `password`.
- Docker Compose PostgreSQL, scripts backup/restauration et CI GitHub Actions.

## Restant MVP prioritaire

- Completer les formulaires avances pour matieres, ETP, transport, entretien et BQ avec le meme niveau de confort que gasoil/caisse.
- Transformer la preview import Excel en import historique complet : mapping, corrections, doublons, rapport d'erreurs et import controle.
- Ajouter exports PDF direction et rapports mensuels mis en page.
- Ajouter offline mobile robuste : file locale, reprise upload photo, conflits et synchronisation visualisee.
- Ajouter verrouillage des periodes et correction Super Admin tracee.
- Ajouter monitoring production, alertes email et verification mensuelle des sauvegardes.

## Decisions ouvertes

- Java local actuel : 17. La cible Java 21 reste possible en production apres installation JDK 21.
- Seuil depense elevee par defaut : 30 000 DH.
- Justificatifs : non bloquants en MVP technique, mais alertables.
- Exports : `.xlsx` natif pour les rapports MVP ; PDF direction a ajouter apres stabilisation des modules avances.
