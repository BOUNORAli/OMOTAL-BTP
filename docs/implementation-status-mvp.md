# Implementation status MVP - OMOTAL TRAVAUX

## Fait dans cette iteration

- Branche de travail : `codex/omotal-mvp`.
- Baseline frontend commitee avant les modifications backend.
- Backend Spring Boot cree dans `backend/`.
- Schema PostgreSQL Flyway pour le MVP Phase 1.
- Auth JWT, roles serveur et isolation chantier.
- API v1 initiale : auth, chantiers, caisse, gasoil, personnel, engins, fournisseurs, validations, documents, dashboard, exports CSV.
- Donnees demo chargees automatiquement en dev si la base est vide.
- Frontend conserve en mode mock par defaut, avec bascule backend via `NEXT_PUBLIC_API_BASE_URL`.
- Login frontend compatible JWT backend, avec profils demo mot de passe `password`.
- Docker Compose PostgreSQL et scripts backup/restauration.

## Restant MVP prioritaire

- Finaliser les formulaires frontend reels : creation chantier, users, fournisseurs, engins, employes, transaction, entree gasoil, pointage personnel, pointage engin.
- Ajouter upload fichier reel pour `documents` avec stockage local dev puis S3/MinIO.
- Remplacer les exports CSV par XLSX si le format Excel natif est obligatoire.
- Ajouter les actions frontend de validation/rejet connectees aux endpoints.
- Ajouter tests API complets avec MockMvc pour permissions, validation et isolation chantier.
- Ajouter migrations pour imports Excel historiques en Phase 2.

## Decisions ouvertes

- Java local actuel : 17. La cible Java 21 reste possible en production apres installation JDK 21.
- Seuil depense elevee par defaut : 30 000 DH.
- Justificatifs : non bloquants en MVP technique, mais alertables.
- Exports : CSV Excel-compatible pour cette iteration, XLSX natif a prioriser si Ali exige le format `.xlsx`.
