# OMOTAL TRAVAUX - Gestion de chantiers

Socle initial de la plateforme web et mobile de gestion de chantiers OMOTAL TRAVAUX.

## Demarrage frontend seul

```bash
npm.cmd install
npm.cmd run dev
```

Puis ouvrir `http://localhost:3000`.

Sans `NEXT_PUBLIC_API_BASE_URL`, l'application reste en mode mock frontend.

## Demarrage backend local

```bash
docker compose up -d postgres
npm.cmd run backend:dev
```

Le backend expose :

- API : `http://localhost:8080/api/v1`
- Swagger UI : `http://localhost:8080/api/docs`

Comptes demo backend :

- `ali@omotal.ma`
- `direction@omotal.ma`
- `ayoub@omotal.ma`
- `admin@omotal.ma`
- `responsable@omotal.ma`

Mot de passe demo : `password`.

Pour brancher le frontend sur le backend, creer un `.env.local` avec :

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Scripts

```bash
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
npm.cmd run backend:test
npm.cmd run check
```

## Documents projet

- Specifications MVP Phase 1 : `docs/specifications-fonctionnelles-mvp-phase-1.md`
- Plan directeur d'execution : `docs/plan-directeur-execution.md`
- Architecture frontend v1 : `docs/frontend-architecture-v1.md`

## Routes utiles

- Login : `http://localhost:3001/login`
- Dashboard : `http://localhost:3001/app/dashboard`
- Mobile Ayoub : `http://localhost:3001/mobile/accueil`

## Operations

- Backup PostgreSQL : `.\ops\backup-postgres.ps1`
- Restore PostgreSQL : `.\ops\restore-postgres.ps1 -BackupFile backups\omotal-YYYYMMDD-HHMMSS.sql`
