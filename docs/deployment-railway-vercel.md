# Deploiement Railway + Vercel

## Objectif

- Backend Spring Boot sur Railway.
- PostgreSQL gere par Railway.
- Frontend Next.js sur Vercel.
- Code source synchronise via GitHub.

## GitHub

Le depot local est deja committe sur la branche `codex/omotal-mvp`. Il faut creer un repo GitHub vide puis pousser cette branche.

Commandes a executer apres creation du repo GitHub :

```bash
git remote add origin https://github.com/<ton-user>/<ton-repo>.git
git push -u origin codex/omotal-mvp
```

Si tu veux que Vercel/Railway utilisent `main` comme branche de production :

```bash
git branch -M main
git push -u origin main
```

## Railway backend

1. Creer un projet Railway.
2. Ajouter une base PostgreSQL : `+ New` -> `Database` -> `PostgreSQL`.
3. Ajouter un service depuis GitHub et choisir ce repo.
4. Dans le service backend, configurer :
   - Root Directory : `backend`
   - Config file path : `/backend/railway.toml`
5. Ajouter les variables du service backend :

```text
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
OMOTAL_JWT_SECRET=<long-secret-aleatoire>
OMOTAL_JWT_EXPIRATION_MINUTES=480
OMOTAL_HIGH_PAYMENT_THRESHOLD=30000
OMOTAL_DEMO_DATA_ENABLED=true
OMOTAL_FRONTEND_ORIGIN=https://<ton-projet-vercel>.vercel.app
```

6. Deployer le backend.
7. Dans `Settings` -> `Networking`, cliquer `Generate Domain`.
8. Tester :

```text
https://<ton-backend>.up.railway.app/api/docs
```

## Vercel frontend

1. Importer le meme repo GitHub dans Vercel.
2. Garder la racine du projet sur `/` parce que Next.js est a la racine.
3. Framework preset : Next.js.
4. Build command : `npm run build`.
5. Ajouter la variable :

```text
NEXT_PUBLIC_API_BASE_URL=https://<ton-backend>.up.railway.app
```

6. Deployer.
7. Revenir sur Railway et mettre a jour :

```text
OMOTAL_FRONTEND_ORIGIN=https://<ton-projet-vercel>.vercel.app
```

8. Redeployer Railway apres modification de cette variable.

## Comptes demo

Mot de passe : `password`

- `ali@omotal.ma`
- `direction@omotal.ma`
- `ayoub@omotal.ma`
- `admin@omotal.ma`
- `responsable@omotal.ma`

## Notes importantes

- Ne jamais mettre `.env.local` sur GitHub.
- Changer `OMOTAL_JWT_SECRET` avant production.
- `OMOTAL_DEMO_DATA_ENABLED=true` charge les donnees demo seulement si la base est vide.
- Les exports actuels sont CSV compatibles Excel ; le vrai XLSX reste une prochaine etape.
