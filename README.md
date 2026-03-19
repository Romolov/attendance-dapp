# Système de Présence Blockchain

DApp de vérification de présence sur Ethereum, inspirée de SoWeSign.
Solidity + Web3.js + MetaMask, développement local avec Ganache.

## Prérequis

- Node.js + npm
- MetaMask (Firefox ou Chromium)

```bash
npm install
```

## Lancement

```bash
npm start
```

Ça lance Ganache, compile le contrat, le déploie, crée des données de test (2 profs, 2 classes, 3 étudiants), et sert le frontend sur **http://localhost:8080**.

`Ctrl+C` pour tout arrêter.

### Configurer MetaMask

À faire une seule fois.

**Ajouter le réseau Ganache** dans MetaMask → Réseaux → Ajouter manuellement :
- Nom : `Ganache`
- URL RPC : `http://127.0.0.1:7545`
- Chain ID : `1337`
- Symbole : `ETH`

**Importer les comptes :** dans MetaMask → Importer un wallet, entrer le mnemonic :
```
link gate remind scout swim concert labor organ arena ripple net notable
```

Les 6 premiers comptes correspondent à :

1. Admin
2. Prof1 (Classe A)
3. Prof2 (Classe B)
4. Etudiant1 (Classe A)
5. Etudiant2 (Classe A)
6. Etudiant3 (Classe B)

Ensuite ouvrir http://localhost:8080, choisir un compte dans MetaMask, cliquer "Connecter MetaMask". La vue s'adapte au rôle.

## Scripts

- `npm start` — lance tout (Ganache + compile + deploy + seed + frontend)
- `npm run compile` — compile le `.sol` uniquement
- `npm run deploy` — déploie sur Ganache (il faut que Ganache tourne)
- `npm run ganache` — lance Ganache seul

## Rôles

**Super-Admin** : ajouter/retirer des profs, pause d'urgence.

**Professeur** : gestion des classes et étudiants, sessions de cours (ouvrir, fermer, rouvrir, changer le code secret), consultation des présences, justifications.

**Étudiant** : signer sa présence avec le code secret, justifier une absence, voir son historique.

Le rôle est détecté automatiquement selon l'adresse MetaMask active.

## Comment ça marche (présence)

1. Le prof ouvre une session avec un code secret (stocké haché en keccak256, jamais en clair)
2. Il donne le code à l'oral en cours
3. L'étudiant entre le code dans la DApp et signe via MetaMask
4. Le contrat vérifie tout (bonne classe, session active, code correct, pas de doublon)
5. La présence est enregistrée on-chain avec un timestamp
6. Si l'étudiant signe après le seuil configuré → marqué en retard automatiquement
7. Si absent, il peut soumettre une justification que le prof accepte ou refuse

## Limites connues

- Coût en gas sur mainnet → envisageable sur un L2 (Polygon, Arbitrum…)
- Pas de TOTP possible on-chain (la seed hachée n'est pas dérivable), compensé par `updateSessionCode` qui permet au prof de changer le code en cours de session
- La `teacherList` garde les adresses retirées (soft delete) — pas idéal mais ça marche
- Testé sur Firefox + Chromium, pas testé sur Safari
