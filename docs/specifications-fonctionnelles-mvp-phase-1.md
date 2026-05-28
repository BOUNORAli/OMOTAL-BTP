# Specifications fonctionnelles MVP - Phase 1

Produit : Application web et mobile de gestion de chantiers OMOTAL TRAVAUX  
Version source : PRD v2.0 - Mai 2026  
Auteur fonctionnel : Ali BOUNOR  
Statut : Document d'execution initial pour cadrage et developpement  
Perimetre : MVP Phase 1 - Base fiable chantier, caisse, gasoil, pointage, dashboard

## 1. Objectif du MVP Phase 1

Le MVP Phase 1 doit permettre a OMOTAL TRAVAUX de suivre un chantier pilote sans dependance quotidienne aux fichiers Excel pour les modules critiques suivants :

- authentification et roles simples ;
- gestion des chantiers ;
- referentiels de base : engins, personnel, fournisseurs, voies ;
- caisse et transactions ;
- entrees et sorties gasoil avec stock theorique ;
- pointage personnel avec calcul salaire simple ;
- pointage engins avec calcul location simple ;
- justificatifs photo/PDF ;
- dashboard chantier simple ;
- exports Excel basiques ;
- historique des modifications importantes.

Le critere de succes principal est le suivant : le chantier pilote peut etre configure, alimente quotidiennement et controle par Ali avec des donnees fiables, filtrees par role et exportables.

## 2. Principes fonctionnels obligatoires

Chaque donnee importante doit respecter ces principes :

- elle est rattachee a un chantier ;
- elle a un responsable de saisie ;
- elle possede un statut ;
- elle est horodatee ;
- elle peut etre controlee via un historique ;
- elle est visible uniquement selon les droits utilisateur ;
- elle alimente les calculs uniquement lorsqu'elle est validee, sauf affichage explicite des brouillons.

## 3. Hypotheses MVP

- Le MVP cible d'abord un chantier pilote, puis doit rester compatible multi-chantiers.
- L'application est responsive web, utilisable sur mobile, mais le mode offline n'est pas inclus en Phase 1.
- Les notifications WhatsApp/SMS ne sont pas incluses en Phase 1.
- Les exports PDF ne sont pas inclus en Phase 1.
- Le BQ, la rentabilite avancee, les matieres, ETP, transport et entretien sont hors Phase 1.
- Les validations avancees existent seulement pour les operations critiques : sorties gasoil, pointage engins, paiement ou depense elevee si seuil configure.
- Les calculs doivent etre effectues cote serveur ou dans une couche metier testable, jamais uniquement dans l'interface.

## 4. Roles MVP

### 4.1 Super Admin

Utilisateur cible : Ali.

Droits :

- acces a tous les chantiers ;
- creation, modification et archivage chantier ;
- gestion utilisateurs, roles et affectations chantier ;
- lecture et modification de tous les modules ;
- validation, rejet et annulation des operations ;
- consultation des donnees sensibles : caisse, salaires, couts, soldes ;
- export Excel ;
- correction tracee des donnees validees ;
- configuration des seuils.

### 4.2 Directeur

Utilisateur cible : Boubker.

Droits :

- lecture globale des dashboards ;
- lecture caisse, salaires, couts et soldes ;
- approbation des depenses au-dessus du seuil ;
- export rapports direction si active ;
- aucune saisie quotidienne terrain.

### 4.3 Pointeur chantier

Utilisateur cible : Ayoub.

Droits :

- acces uniquement aux chantiers assignes ;
- saisie sortie gasoil ;
- saisie pointage engins ;
- ajout justificatif ;
- consultation de ses propres saisies ;
- modification uniquement tant que la donnee est en brouillon ou rejetee.

Restrictions :

- pas d'acces a la caisse globale ;
- pas d'acces aux salaires ;
- pas d'acces aux marges ou benefices ;
- pas de validation ;
- pas de suppression apres soumission.

### 4.4 Comptable / Administration

Droits :

- acces aux chantiers assignes ;
- saisie caisse ;
- saisie entree gasoil ;
- saisie personnel, pointage personnel et avances ;
- consultation des soldes et restes a payer ;
- export Excel financier ;
- association justificatifs.

Restrictions :

- ne peut pas modifier directement une sortie gasoil validee sans correction tracee ;
- ne valide pas les productions terrain, car production hors Phase 1.

### 4.5 Responsable chantier

Droits :

- acces aux chantiers assignes ;
- consultation operations terrain ;
- validation ou rejet sorties gasoil ;
- validation ou rejet pointage engins ;
- saisie operationnelle si autorisee ;
- ajout observations.

Restrictions :

- acces aux salaires et caisse uniquement si droit explicite ;
- pas d'approbation de grosse depense sauf autorisation.

### 4.6 Lecture seule

Droits :

- lecture des dashboards ou rapports explicitement autorises ;
- aucun droit de saisie ;
- aucun droit de modification.

## 5. Permissions MVP synthetiques

| Action | Super Admin | Directeur | Responsable chantier | Pointeur | Comptable | Lecture seule |
|---|---:|---:|---:|---:|---:|---:|
| Creer chantier | Oui | Non | Non | Non | Non | Non |
| Modifier chantier | Oui | Non | Limite | Non | Non | Non |
| Voir dashboard chantier | Oui | Oui | Oui | Limite | Oui | Limite |
| Gerer utilisateurs | Oui | Non | Non | Non | Non | Non |
| Saisir caisse | Oui | Non | Non | Non | Oui | Non |
| Voir caisse | Oui | Oui | Selon droit | Non | Oui | Selon droit |
| Saisir entree gasoil | Oui | Non | Non | Non | Oui | Non |
| Saisir sortie gasoil | Oui | Non | Oui | Oui | Non | Non |
| Valider sortie gasoil | Oui | Non | Oui | Non | Non | Non |
| Saisir personnel | Oui | Non | Selon droit | Non | Oui | Non |
| Voir salaires | Oui | Oui | Selon droit | Non | Oui | Non |
| Saisir pointage personnel | Oui | Non | Selon droit | Non | Oui | Non |
| Saisir pointage engin | Oui | Non | Oui | Oui | Non | Non |
| Valider pointage engin | Oui | Non | Oui | Non | Non | Non |
| Export Excel | Oui | Oui | Limite | Non | Oui | Limite |

## 6. Statuts MVP

Les operations validables utilisent les statuts suivants :

- Brouillon : saisie en cours, modifiable par son auteur ;
- Soumis : attente de validation ;
- Valide : operation officielle, incluse dans les calculs ;
- Rejete : operation retournee avec motif obligatoire ;
- Annule : operation neutralisee, conservee dans l'historique ;
- Verrouille : periode cloturee, modification interdite sauf Super Admin.

Les modules Phase 1 concernes par ce cycle sont :

- sortie gasoil ;
- pointage engin ;
- pointage personnel si validation activee ;
- transaction caisse superieure au seuil ;
- avance personnel si validation activee.

## 7. Navigation MVP

### 7.1 Navigation bureau

Menu principal :

- Tableau de bord ;
- Chantiers ;
- Caisse ;
- Gasoil ;
- Personnel ;
- Engins ;
- Referentiels ;
- Validations ;
- Exports ;
- Administration.

### 7.2 Navigation mobile pointeur

Accueil mobile :

- chantier actif ;
- date du jour ;
- bouton Sortie gasoil ;
- bouton Pointage engins ;
- bouton Justificatif ;
- bloc "Mes saisies du jour" ;
- bloc "A corriger" pour les operations rejetees.

## 8. M01 - Authentification, utilisateurs et acces

### 8.1 Ecrans

Ecran connexion :

- email ;
- mot de passe ;
- bouton connexion ;
- message erreur simple ;
- lien mot de passe oublie si disponible.

Ecran utilisateurs :

- liste utilisateurs ;
- creation utilisateur ;
- modification role ;
- affectation chantier ;
- activation/desactivation.

Ecran profil :

- nom ;
- email ;
- role ;
- chantiers autorises ;
- changement mot de passe.

### 8.2 Champs utilisateur

- id ;
- nom ;
- email ;
- telephone ;
- role principal ;
- statut : actif, inactif ;
- chantiers autorises ;
- date creation ;
- derniere connexion.

### 8.3 Regles metier

- Un utilisateur inactif ne peut pas se connecter.
- Un utilisateur ne voit que les chantiers autorises.
- Les permissions doivent etre controlees cote serveur.
- Un Super Admin ne peut pas etre supprime s'il est le dernier Super Admin actif.
- Les sessions doivent expirer automatiquement.

### 8.4 Criteres d'acceptation

- Un utilisateur peut se connecter avec email et mot de passe valides.
- Un utilisateur sans acces chantier ne voit aucune donnee chantier.
- Un Pointeur ne voit pas les modules Caisse, Salaires et Administration.
- Un Super Admin peut affecter un utilisateur a un chantier.
- Un utilisateur desactive ne peut plus acceder a l'application.

## 9. M02 - Gestion des chantiers

### 9.1 Ecrans

Liste chantiers :

- recherche par nom ou code ;
- filtre statut ;
- cartes ou tableau avec nom, code, statut, responsable, date debut.

Fiche chantier :

- informations generales ;
- utilisateurs affectes ;
- referentiels lies ;
- KPI simples ;
- documents chantier.

Formulaire chantier :

- creation ;
- modification ;
- archivage.

### 9.2 Champs chantier MVP

- nom ;
- code interne ;
- maitre d'ouvrage ;
- adresse ;
- localisation GPS optionnelle ;
- date debut ;
- date fin previsionnelle ;
- montant marche HT optionnel ;
- TVA optionnelle ;
- montant marche TTC optionnel ;
- statut : preparation, en cours, suspendu, termine, archive ;
- responsable chantier ;
- utilisateurs autorises ;
- observation.

### 9.3 Regles metier

- Le code chantier doit etre unique.
- Un chantier archive reste consultable mais non modifiable par defaut.
- Un chantier avec donnees liees ne peut pas etre supprime.
- Toute operation metier doit etre rattachee a un chantier actif ou en cours.

### 9.4 Criteres d'acceptation

- Ali peut creer un chantier pilote.
- Ali peut affecter Ayoub au chantier pilote.
- Ayoub voit uniquement le chantier pilote sur mobile.
- Un chantier archive n'apparait plus dans les listes de saisie.
- Le dashboard chantier affiche les KPI du chantier selectionne.

## 10. M03 - Referentiels MVP

## 10.1 Engins

### Ecrans

- liste engins ;
- fiche engin ;
- formulaire creation/modification ;
- affectation chantier.

### Champs

- designation ;
- code interne optionnel ;
- type : pelle, niveleuse, tractopelle, camion, tombereau, vehicule, compacteur, autre ;
- proprietaire ou loueur ;
- chantier affecte ;
- mode facturation : heure, jour, forfait, interne ;
- tarif horaire ;
- tarif journalier ;
- chauffeur habituel ;
- statut : mobilise, demobilise, en panne, arrete, archive.

### Regles

- Un engin archive ne peut plus etre selectionne en saisie.
- Un engin sans tarif peut etre cree, mais genere une alerte lors du pointage.
- Le mode de facturation utilise dans un pointage doit etre historise sur la ligne de pointage.

### Criteres d'acceptation

- Le comptable ou Ali peut creer une pelle avec tarif horaire.
- Ayoub voit uniquement les engins mobilises sur son chantier.
- Un engin archive n'apparait pas dans la saisie pointage.

## 10.2 Personnel

### Ecrans

- liste personnel ;
- fiche employe ;
- formulaire creation/modification ;
- affectation chantier.

### Champs

- nom ;
- prenom ;
- poste ;
- chantier d'affectation ;
- type remuneration : heure, jour, mois ;
- salaire mensuel ;
- salaire journalier ;
- salaire horaire ;
- date debut ;
- date fin optionnelle ;
- statut : actif, inactif, transfere ;
- observation.

### Regles

- Le tarif applicable doit etre copie dans le pointage au moment de la saisie.
- Modifier le tarif d'un employe ne recalcule pas les pointages deja valides.
- Un employe inactif ne peut plus etre pointe.

### Criteres d'acceptation

- Le comptable peut creer un employe mensuel.
- Le salaire horaire par defaut peut etre calcule depuis le salaire mensuel.
- Un employe inactif disparait de la saisie pointage.

## 10.3 Fournisseurs

### Ecrans

- liste fournisseurs ;
- fiche fournisseur ;
- formulaire creation/modification.

### Champs

- nom ;
- type : station, matiere, transport, entretien, sous-traitant, loueur, autre ;
- contact ;
- telephone ;
- adresse ;
- conditions de paiement optionnelles ;
- statut : actif, inactif ;
- observation.

### Regles

- Un fournisseur inactif ne peut pas etre choisi dans une nouvelle transaction.
- Les fournisseurs de type station sont proposes dans les entrees gasoil.

### Criteres d'acceptation

- Le comptable peut creer une station gasoil.
- Une station inactive n'apparait plus dans les formulaires gasoil.

## 10.4 Voies

### Ecrans

- liste voies par chantier ;
- formulaire voie/tranche/troncon simple.

### Champs

- chantier ;
- nom voie ;
- tranche optionnelle ;
- troncon optionnel ;
- statut : actif, archive.

### Regles

- Phase 1 utilise ce referentiel uniquement comme preparation a la production Phase 2.
- Une voie archivee ne doit plus apparaitre dans les listes de saisie futures.

## 11. M04 - Caisse et transactions

### 11.1 Objectif

Centraliser les mouvements financiers de base pour obtenir un solde fiable par chantier, periode, categorie et mode de paiement.

### 11.2 Ecrans

Liste transactions :

- filtres : chantier, periode, type, categorie, mode paiement, statut ;
- recherche description, fournisseur/personne, montant ;
- total debit, total credit, solde filtre.

Formulaire transaction :

- saisie rapide ;
- ajout justificatif ;
- lien vers operation metier si applicable.

Fiche transaction :

- details ;
- justificatifs ;
- historique ;
- validation ou rejet si applicable.

### 11.3 Champs transaction

- date ;
- chantier ;
- type : debit, credit ;
- montant ;
- mode paiement : especes OMOTAL, banque OMOTAL, especes ETP, autre ;
- categorie : personnel, gasoil, matieres, location engins, entretien, transport, ETP, frais generaux, financement, divers ;
- sous-categorie optionnelle ;
- description ;
- fournisseur ou personne concernee optionnel ;
- operation liee optionnelle ;
- justificatif optionnel ;
- saisi par ;
- valide par ;
- statut.

### 11.4 Regles metier

- Toute sortie doit avoir une categorie.
- Le montant doit etre strictement positif.
- Une transaction superieure au seuil configure passe en attente d'approbation.
- Une transaction validee ne peut pas etre modifiee directement.
- Toute correction cree une nouvelle version ou une operation d'annulation.
- Les brouillons ne sont pas inclus dans les soldes officiels.
- Le solde par mode de paiement est calcule avec les transactions validees.

### 11.5 Calculs

Total credits = somme des transactions validees de type credit.  
Total debits = somme des transactions validees de type debit.  
Solde = total credits - total debits.

Les soldes doivent etre disponibles :

- par chantier ;
- par mode de paiement ;
- par periode ;
- par categorie.

### 11.6 Criteres d'acceptation

- Le comptable peut saisir une depense gasoil avec justificatif.
- Une depense sans categorie est refusee.
- Une depense au-dessus du seuil apparait dans les validations.
- Ali peut valider ou rejeter une depense au-dessus du seuil.
- Le dashboard affiche le solde caisse valide du chantier.
- Un Pointeur ne peut pas ouvrir la liste caisse.

## 12. M05 - Gasoil

## 12.1 Entrees gasoil

### Ecrans

- liste entrees gasoil ;
- formulaire entree ;
- fiche entree ;
- filtre par chantier, station, periode.

### Champs

- date ;
- chantier ;
- fournisseur ou station ;
- quantite litres ;
- prix unitaire ;
- montant total calcule ;
- numero BR optionnel ;
- numero bon fournisseur optionnel ;
- mode paiement ;
- transaction liee optionnelle ;
- justificatif ;
- observation ;
- statut.

### Regles

- Quantite litres doit etre strictement positive.
- Prix unitaire doit etre positif.
- Montant total = quantite litres x prix unitaire.
- Une entree validee augmente le stock theorique.
- Une entree brouillon ne modifie pas le stock officiel.
- Un numero de bon duplique sur le meme chantier genere une alerte.

### Criteres d'acceptation

- Le comptable peut saisir une entree de 1 000 litres.
- Le montant total est calcule automatiquement.
- Le stock theorique augmente apres validation.
- Une entree sans quantite est refusee.

## 12.2 Sorties gasoil

### Ecrans

Mobile sortie gasoil :

- chantier preselectionne ;
- date du jour ;
- engin ;
- chauffeur/responsable ;
- litres ;
- affectation ;
- numero BS optionnel ;
- photo bon/jauge ;
- observation ;
- bouton enregistrer brouillon ;
- bouton soumettre.

Bureau validations gasoil :

- liste sorties soumises ;
- details ;
- justificatif ;
- bouton valider ;
- bouton rejeter avec motif.

### Champs

- date ;
- chantier ;
- numero BS optionnel ;
- station ou fournisseur optionnel ;
- affectation : production, ETP, personnel, transport, autre ;
- engin ou vehicule ;
- chauffeur/responsable ;
- litres ;
- prix unitaire ;
- montant calcule ;
- jauge debut optionnelle ;
- jauge fin optionnelle ;
- km debut optionnel ;
- km fin optionnel ;
- BR de reference optionnel ;
- photo bon/jauge ;
- observation ;
- saisi par ;
- valide par ;
- statut.

### Regles

- Litres doit etre strictement positif, sauf correction autorisee par Super Admin.
- Une sortie doit avoir un engin ou une justification.
- Le prix unitaire par defaut est le prix moyen des entrees validees de la periode ou le dernier prix connu.
- Montant calcule = litres x prix unitaire.
- Une sortie soumise n'impacte pas le stock officiel.
- Une sortie validee diminue le stock theorique.
- Une sortie superieure au stock disponible genere une alerte et peut necessiter autorisation.
- Un numero BS duplique sur le meme chantier genere une alerte.

### Calculs

Stock theorique = somme entrees validees - somme sorties validees.  
Consommation L/km = litres / (km fin - km debut), si les deux valeurs sont renseignees.  
Montant sortie = litres x prix unitaire.

### Criteres d'acceptation

- Ayoub peut saisir une sortie gasoil depuis mobile en moins de quelques champs.
- Ayoub peut soumettre la sortie pour validation.
- Le responsable chantier voit la sortie dans les validations.
- Apres validation, le stock theorique diminue.
- Une sortie sans litre est refusee.
- Une sortie sans engin demande une justification.
- Une sortie rejetee revient dans "A corriger" chez le pointeur.

## 13. M06 - Pointage personnel et paie simple

### 13.1 Objectif

Permettre au comptable de saisir le pointage personnel mensuel et de calculer le salaire du mois, les avances et le reliquat simple.

### 13.2 Ecrans

Liste pointage personnel :

- filtre chantier ;
- filtre mois ;
- filtre employe ;
- statut ;
- total heures, jours et montant du.

Saisie pointage :

- date ;
- chantier ;
- employe ;
- heures travaillees ou type journee ;
- observation.

Fiche employe mensuelle :

- total heures ;
- total jours ;
- salaire du ;
- avances ;
- reliquat precedent ;
- montant a payer ;
- reliquat final.

Saisie avance :

- date ;
- employe ;
- chantier ;
- montant ;
- mode paiement ;
- transaction liee ;
- motif ;
- justificatif.

### 13.3 Champs pointage personnel

- date ;
- chantier ;
- employe ;
- heures travaillees ;
- type journee : normal, absence, conge, arret, demi-journee ;
- tarif applique ;
- type remuneration applique ;
- observation ;
- saisi par ;
- valide par optionnel ;
- statut.

### 13.4 Champs avance

- date ;
- chantier ;
- employe ;
- montant ;
- mode paiement ;
- transaction liee ;
- motif ;
- justificatif ;
- statut.

### 13.5 Regles metier

- Le tarif applique est historise sur chaque ligne de pointage.
- Une date ne peut pas etre pointee deux fois pour le meme employe et chantier sans confirmation.
- Une avance doit etre liee a une transaction caisse ou creer une transaction caisse.
- Une paie verrouillee ne peut plus etre modifiee sauf correction Super Admin.
- Le salaire horaire par defaut = salaire mensuel / 26 / 9.

### 13.6 Calculs

Pour remuneration horaire : salaire du = total heures x salaire horaire applique.  
Pour remuneration journaliere : salaire du = total jours travailles x salaire journalier applique.  
Pour remuneration mensuelle : salaire du = salaire mensuel prorate selon regle validee par OMOTAL.  
Montant a payer = salaire du + reliquat precedent - avances du mois.  
Reliquat final = montant a payer - montant effectivement paye.

### 13.7 Criteres d'acceptation

- Le comptable peut saisir les heures d'un employe sur un mois.
- Le salaire du mois est calcule automatiquement.
- Une avance diminue le montant a payer.
- Une avance cree ou reference une transaction caisse.
- Modifier le salaire d'un employe ne modifie pas les pointages deja valides.
- Ayoub ne peut pas voir les salaires.

## 14. M07 - Pointage engins

### 14.1 Objectif

Suivre les heures ou jours des engins et calculer le cout de location simple par chantier et periode.

### 14.2 Ecrans

Mobile pointage engins :

- chantier ;
- date ;
- liste engins mobilises ;
- heures travaillees ;
- jours factures ;
- type activite ;
- observation ;
- bouton journee complete ;
- bouton soumettre.

Bureau pointage engins :

- liste pointages ;
- filtres chantier, engin, periode, statut ;
- total heures ;
- total jours ;
- cout calcule ;
- validation/rejet.

Fiche engin periode :

- heures ;
- jours ;
- cout location ;
- gasoil consomme ;
- total preliminaire ;
- statut paiements si active.

### 14.3 Champs pointage engin

- date ;
- chantier ;
- engin ;
- chauffeur ;
- heures travaillees ;
- jours factures ;
- type activite : production, reglage, attente, panne, transport, autre ;
- mode facturation applique ;
- tarif horaire applique ;
- tarif journalier applique ;
- observation ;
- saisi par ;
- valide par ;
- statut.

### 14.4 Regles metier

- Si mode facturation = heure, heures travaillees est obligatoire.
- Si mode facturation = jour, jours factures est obligatoire.
- Un engin sans tarif genere une alerte.
- Un pointage soumis doit etre valide par Responsable chantier ou Super Admin.
- Une ligne validee ne peut pas etre modifiee directement.
- Les pointages valides alimentent le dashboard engins.

### 14.5 Calculs

Si facturation horaire : cout location = heures travaillees x tarif horaire applique.  
Si facturation journaliere : cout location = jours factures x tarif journalier applique.  
Si facturation forfait ou interne : cout location = montant ou regle specifique a confirmer.

### 14.6 Criteres d'acceptation

- Ayoub peut saisir les heures d'une pelle depuis mobile.
- Le responsable chantier peut valider ou rejeter le pointage.
- Le cout de location est calcule apres validation.
- Un engin sans tarif apparait dans les alertes.
- Un pointage rejete retourne au pointeur avec motif.

## 15. M08 - Documents et justificatifs MVP

### 15.1 Objectif

Centraliser les pieces justificatives essentielles et les rattacher aux operations.

### 15.2 Types MVP

- bon de reception ;
- bon de sortie ;
- bon fournisseur ;
- facture ;
- recu ;
- photo jauge ;
- photo compteur ;
- photo terrain ;
- autre.

### 15.3 Champs document

- chantier ;
- type document ;
- fichier ;
- nom fichier ;
- extension ;
- taille ;
- operation liee ;
- module lie ;
- ajoute par ;
- date ajout ;
- commentaire.

### 15.4 Regles metier

- Les fichiers acceptes en MVP : JPG, PNG, PDF.
- La taille maximale doit etre configuree.
- Les documents heritent des permissions de l'operation liee.
- Une operation peut avoir plusieurs justificatifs.
- Un document ne doit pas etre supprime physiquement s'il est lie a une operation validee ; il peut etre marque annule.

### 15.5 Criteres d'acceptation

- Ayoub peut ajouter une photo a une sortie gasoil.
- Le comptable peut ajouter un PDF a une transaction.
- Ali peut consulter les justificatifs depuis la fiche operation.
- Un utilisateur non autorise ne peut pas ouvrir un document sensible.

## 16. M09 - Validations

### 16.1 Ecran validations

Liste des operations en attente :

- type operation ;
- chantier ;
- date ;
- saisi par ;
- montant ou quantite ;
- statut ;
- action voir details.

Detail validation :

- donnees completes ;
- justificatifs ;
- historique ;
- bouton valider ;
- bouton rejeter ;
- motif obligatoire en cas de rejet.

### 16.2 Regles metier

- Le validateur doit avoir le droit sur le chantier et le module.
- Le validateur ne doit pas etre le meme utilisateur que le saisisseur pour les operations sensibles, sauf Super Admin.
- Le rejet exige un motif.
- La validation enregistre date, utilisateur et commentaire optionnel.
- Une operation validee alimente les calculs officiels.

### 16.3 Criteres d'acceptation

- Une sortie gasoil soumise apparait chez le responsable chantier.
- Le responsable peut valider la sortie.
- Le responsable peut rejeter avec motif.
- L'auteur voit l'operation rejetee avec le motif.
- Les operations validees disparaissent de la liste d'attente.

## 17. M10 - Dashboard chantier simple

### 17.1 Objectif

Donner une vue fiable et rapide du chantier pilote.

### 17.2 Filtres

- chantier ;
- periode : aujourd'hui, semaine, mois, personnalisee ;
- option inclure brouillons : non par defaut.

### 17.3 Blocs MVP

Caisse :

- total credits ;
- total debits ;
- solde ;
- depenses par categorie.

Gasoil :

- litres entres ;
- litres sortis ;
- stock theorique ;
- prix moyen ;
- sorties en attente.

Personnel :

- total heures ;
- salaire du estime ;
- avances ;
- montant a payer.

Engins :

- total heures ;
- total jours ;
- cout location ;
- pointages en attente.

Alertes :

- stock gasoil negatif ;
- depense elevee en attente ;
- sortie gasoil sans engin ;
- engin sans tarif ;
- justificatif manquant.

### 17.4 Regles metier

- Par defaut, les chiffres affichent uniquement les donnees validees.
- Les brouillons ou soumis peuvent etre inclus uniquement si l'utilisateur active un filtre.
- Les donnees sensibles sont masquees selon role.
- Le dashboard doit charger en moins de 3 secondes pour un chantier standard.

### 17.5 Criteres d'acceptation

- Ali voit les blocs caisse, gasoil, personnel et engins.
- Ayoub voit seulement son recapitulatif terrain autorise.
- Le stock gasoil du dashboard correspond au calcul officiel.
- Une depense elevee en attente apparait comme alerte.
- Les filtres de periode modifient correctement les KPI.

## 18. M11 - Exports Excel MVP

### 18.1 Exports inclus

- caisse periode ;
- transactions brutes ;
- entrees gasoil ;
- sorties gasoil ;
- pointage personnel mensuel ;
- pointage engins mensuel ;
- synthese dashboard chantier.

### 18.2 Regles

- Chaque export contient chantier, periode, date generation et utilisateur generateur.
- Les exports respectent les permissions.
- Les exports incluent les donnees validees par defaut.
- L'option inclure brouillons doit etre visible seulement aux roles autorises.

### 18.3 Criteres d'acceptation

- Le comptable peut exporter la caisse du mois.
- Ali peut exporter les entrees et sorties gasoil.
- Ayoub ne peut pas exporter les donnees financieres.
- Les montants exportes correspondent aux chiffres du dashboard.

## 19. M12 - Historique et audit log

### 19.1 Evenements a tracer en MVP

- creation ;
- modification ;
- soumission ;
- validation ;
- rejet ;
- annulation ;
- changement de statut ;
- correction d'une operation validee ;
- connexion echouee si disponible ;
- modification permission utilisateur.

### 19.2 Champs audit log

- utilisateur ;
- date heure ;
- module ;
- operation ;
- entite cible ;
- ancienne valeur ;
- nouvelle valeur ;
- motif ;
- adresse IP optionnelle ;
- user agent optionnel.

### 19.3 Regles

- L'audit log est non modifiable par l'interface standard.
- Les corrections apres validation doivent demander un motif.
- Les suppressions physiques de donnees metier sont interdites.

### 19.4 Criteres d'acceptation

- Ali peut voir qui a valide une sortie gasoil.
- Ali peut voir l'ancienne et la nouvelle valeur d'une correction.
- Une operation annulee reste visible dans l'historique.

## 20. Alertes MVP

### 20.1 Alertes incluses

Gasoil :

- stock negatif ;
- sortie sans engin ;
- numero bon duplique ;
- prix litre manquant.

Caisse :

- sortie superieure au seuil ;
- transaction sans categorie ;
- transaction sans justificatif si justificatif obligatoire.

Personnel :

- pointage manquant si regle activee ;
- avance elevee si seuil active.

Engins :

- engin sans tarif ;
- pointage soumis non valide ;
- engin pointe sans heures ou jours.

### 20.2 Regles

- Les alertes sont visibles dans le dashboard et dans un centre d'alertes simple.
- Une alerte peut etre ouverte, traitee ou ignoree avec motif.
- Une alerte critique ne bloque pas toujours la saisie, mais doit etre visible.

## 21. Donnees minimales recommandees

Avant demarrage pilote, creer :

- 1 chantier pilote ;
- 1 Super Admin : Ali ;
- 1 Directeur : Boubker ;
- 1 Pointeur : Ayoub ;
- 1 Comptable ;
- 1 Responsable chantier ;
- liste initiale des engins mobilises ;
- liste initiale du personnel actif ;
- liste fournisseurs/stations ;
- solde initial caisse par mode de paiement ;
- stock initial gasoil si existant.

## 22. Regles de securite MVP

- HTTPS obligatoire en production.
- Mots de passe robustes.
- Acces documents protege.
- Permissions controlees cote serveur.
- Les donnees salaires, caisse et couts sont masquees par defaut aux roles terrain.
- Les sauvegardes quotidiennes sont obligatoires en production.
- Les exports sont journalises.

## 23. Definition of Done fonctionnelle

Une fonctionnalite MVP est terminee si :

- les champs obligatoires sont implementes ;
- les permissions sont appliquees cote serveur et interface ;
- les regles de validation sont testees ;
- les calculs critiques sont couverts par tests ;
- les erreurs utilisateur sont comprehensibles en francais ;
- les donnees apparaissent dans le dashboard si applicable ;
- l'export inclut la donnee si le module est exportable ;
- l'audit log trace les modifications importantes.

## 24. Tests d'acceptation transverses

### Scenario 1 - Configuration chantier pilote

1. Ali se connecte.
2. Ali cree le chantier pilote.
3. Ali cree Ayoub et l'affecte au chantier.
4. Ayoub se connecte sur mobile.
5. Ayoub voit uniquement le chantier pilote.

Resultat attendu : l'isolation chantier est respectee.

### Scenario 2 - Sortie gasoil terrain

1. Le comptable saisit une entree gasoil validee de 1 000 L.
2. Ayoub saisit une sortie de 120 L pour une pelle.
3. Ayoub ajoute une photo et soumet.
4. Le responsable valide.
5. Le dashboard affiche stock = 880 L.

Resultat attendu : le stock theorique est correct.

### Scenario 3 - Pointage engin

1. Ali cree une pelle avec tarif horaire 350 DH.
2. Ayoub saisit 8 heures.
3. Le responsable valide.
4. Le dashboard engins affiche cout location = 2 800 DH.

Resultat attendu : le calcul de location est correct.

### Scenario 4 - Avance personnel

1. Le comptable cree un employe mensuel.
2. Le comptable saisit une avance de 500 DH.
3. Une transaction caisse est creee ou liee.
4. La fiche mensuelle de l'employe deduit l'avance.

Resultat attendu : avance, caisse et paie sont coherentes.

### Scenario 5 - Permissions sensibles

1. Ayoub se connecte.
2. Il tente d'ouvrir Caisse.
3. Il tente d'ouvrir Salaires.
4. Il tente d'exporter les transactions.

Resultat attendu : acces refuse ou menu masque.

## 25. Hors MVP Phase 1 confirme

Les elements suivants ne doivent pas bloquer le MVP :

- production et rendements detailles ;
- cout/m3 et cout/m2 ;
- matieres/fournisseurs avances ;
- ETP et sous-traitance ;
- transport ;
- entretien engins ;
- BQ et prix de revient ;
- rentabilite par article ;
- planning ;
- offline ;
- notifications WhatsApp/SMS ;
- application mobile native ;
- exports PDF.

## 26. Points a valider avant developpement

- Seuil exact de depense necessitant approbation.
- Liste definitive des modes de paiement.
- Regle de proratisation du salaire mensuel.
- Qui valide les sorties gasoil sur le chantier pilote.
- Qui valide les pointages engins sur le chantier pilote.
- Justificatif obligatoire ou optionnel par type d'operation.
- Gestion du stock initial gasoil.
- Format Excel attendu pour les exports.
- Architecture retenue : Next.js/Supabase ou Spring Boot/PostgreSQL.

## 27. Backlog Sprint 1 propose

Objectif Sprint 1 : poser le socle multi-role et multi-chantier.

User stories prioritaires :

- En tant qu'Ali, je peux me connecter comme Super Admin.
- En tant qu'Ali, je peux creer un chantier.
- En tant qu'Ali, je peux creer un utilisateur et lui donner un role.
- En tant qu'Ali, je peux affecter un utilisateur a un chantier.
- En tant qu'utilisateur, je vois uniquement les chantiers autorises.
- En tant qu'Ali, je peux creer les premiers engins, personnels et fournisseurs.
- En tant que Pointeur, je vois une page mobile simple avec mon chantier et mes actions autorisees.

Livrables techniques attendus :

- structure projet ;
- authentification ;
- modele User/Role/Permission/Chantier ;
- affectation chantier utilisateur ;
- guard permissions cote serveur ;
- premieres pages UI ;
- audit log minimal sur creation/modification.

## 28. Backlog Sprint 2 propose

Objectif Sprint 2 : rendre le chantier pilote exploitable financierement et operationnellement.

User stories prioritaires :

- En tant que Comptable, je peux saisir une transaction caisse.
- En tant que Comptable, je peux saisir une entree gasoil.
- En tant que Pointeur, je peux saisir une sortie gasoil mobile.
- En tant que Responsable chantier, je peux valider une sortie gasoil.
- En tant qu'Ali, je peux voir le stock gasoil theorique.
- En tant qu'Ali, je peux consulter le dashboard chantier simple.
- En tant que Comptable, je peux exporter les transactions en Excel.

## 29. Backlog Sprint 3 propose

Objectif Sprint 3 : couvrir pointage personnel, pointage engins et premiers calculs.

User stories prioritaires :

- En tant que Comptable, je peux saisir le pointage personnel.
- En tant que Comptable, je peux saisir une avance personnel.
- En tant qu'Ali, je peux voir le salaire du, les avances et le montant a payer.
- En tant que Pointeur, je peux saisir un pointage engin.
- En tant que Responsable chantier, je peux valider un pointage engin.
- En tant qu'Ali, je peux voir le cout location engin par periode.
- En tant qu'Ali, je peux exporter pointage personnel et engins en Excel.

