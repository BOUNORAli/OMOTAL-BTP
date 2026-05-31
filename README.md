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

## Pilote local MVP

1. Lancer PostgreSQL :

```bash
npm.cmd run db:up
```

2. Lancer le backend Spring Boot dans un premier terminal :

```bash
npm.cmd run pilot:backend
```

3. Creer `C:\Users\PC\Documents\OMOTAL BTP\.env.local` avec :

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Si le port `8080` est deja occupe, lancer le backend avec `PORT=8081` et mettre dans `.env.local` :

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

4. Lancer le frontend dans un deuxieme terminal :

```bash
npm.cmd run pilot:frontend
```

5. Ouvrir `http://localhost:3000/login` et utiliser :

- Ali : `ali@omotal.ma` / `password`
- Ayoub : `ayoub@omotal.ma` / `password`
- Responsable : `responsable@omotal.ma` / `password`

6. Scenario pilote a verifier :

- Ali ouvre le dashboard et controle le chantier `Genie Meknes AO 62/2026`.
- Ayoub saisit une sortie gasoil depuis `/mobile/gasoil/sortie`.
- Ayoub saisit un pointage engin depuis `/mobile/engins/pointage`.
- Le responsable valide depuis `/app/validations`.
- Ali verifie que le dashboard et le stock gasoil se mettent a jour.
- Ali telecharge les rapports `.xlsx` depuis `/app/rapports`.

Les exports `.xlsx` incluent le chantier, la periode, l'utilisateur generateur, le filtre applique et les totaux.

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
- Deploiement Railway/Vercel : `docs/deployment-railway-vercel.md`

## Routes utiles

- Login : `http://localhost:3001/login`
- Dashboard : `http://localhost:3001/app/dashboard`
- Mobile Ayoub : `http://localhost:3001/mobile/accueil`

## Operations

- Backup PostgreSQL : `.\ops\backup-postgres.ps1`
- Restore PostgreSQL : `.\ops\restore-postgres.ps1 -BackupFile backups\omotal-YYYYMMDD-HHMMSS.sql`
