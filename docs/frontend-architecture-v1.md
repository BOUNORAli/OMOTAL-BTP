# Architecture frontend v1 - OMOTAL TRAVAUX

Ce document decrit l'implementation frontend actuelle, alignee avec la specification frontend v1.

## Stack installee

- Next.js + TypeScript
- Tailwind CSS
- Composants UI locaux inspires shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Zustand
- Recharts
- Lucide React
- date-fns

## Strategie frontend-first

Les pages ne lisent pas directement les mocks. La chaine actuelle est :

Page / Component  
-> Hook metier `useChantiers`, `useGasoilOverview`, `useTransactions`  
-> Service mock `src/services/mock-api.ts`  
-> Donnees mockees `src/lib/domain/mock-data.ts`

Quand le backend sera pret, il faudra remplacer les fonctions de `mock-api.ts` par des appels API reels sans refaire les pages.

## Routes principales creees

- `/login`
- `/app/dashboard`
- `/app/chantiers`
- `/app/chantiers/[chantierId]`
- `/app/caisse`
- `/app/gasoil`
- `/app/personnel`
- `/app/engins`
- `/app/production`
- `/app/validations`
- `/app/alertes`
- `/app/rapports`
- `/app/admin`
- `/mobile/accueil`
- `/mobile/gasoil/sortie`
- `/mobile/engins/pointage`
- `/mobile/production/nouveau`
- `/mobile/historique`

## Socle UI

Composants de base :

- `Button`
- `Card`
- `Badge`
- `Input`
- `Select`
- `Textarea`
- `PageHeader`
- `DataTable`
- `KpiCard`
- `StatusBadge`
- `AmountDisplay`
- etats standards loading, empty, error, no permission

## Roles et permissions

La navigation desktop est filtree via `src/lib/domain/permissions.ts`.

Le frontend masque deja les menus selon role. La securite definitive devra rester appliquee cote backend.

## Formulaires actifs

Deux formulaires sont deja valides avec React Hook Form + Zod :

- sortie gasoil desktop/mobile ;
- production terrain.

Ils calculent les valeurs metier en temps reel :

- montant gasoil = litres x prix provisoire ;
- quantite production = longueur x largeur x profondeur ou longueur x largeur.

## Verification actuelle

Commandes vertes :

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`

Le serveur local utilise `http://localhost:3001` car le port `3000` est deja occupe.

