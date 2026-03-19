# Système de Présence Blockchain

DApp Ethereum de vérification de présence inspirée de SoWeSign. Projet universitaire — Solidity + Web3.js + MetaMask. Développement local via Ganache, compatible avec tout réseau EVM.

---

## Prérequis

- **Node.js** + **npm** — `sudo pacman -S nodejs npm` (Arch Linux)
- **MetaMask** — extension navigateur (Firefox ou Chromium)

```bash
npm install
```

---

## Lancement

### Étape 1 — Démarrer le stack

```bash
npm start
```

Lance automatiquement : Ganache → compilation → déploiement → seed (2 profs, 2 classes, 3 étudiants) → serveur sur **http://localhost:8080**.

`Ctrl+C` arrête tout.

### Étape 2 — Configurer MetaMask (à faire une seule fois)

**Ajouter le réseau Ganache :**

Dans MetaMask → Réseaux → Ajouter un réseau manuellement :

| Champ | Valeur |
|-------|--------|
| Nom | `Ganache` |
| URL RPC | `http://127.0.0.1:7545` |
| ID de chaîne | `1337` |
| Symbole | `ETH` |

**Importer les comptes :**

Dans MetaMask → Importer un wallet → entrer le mnemonic :
```
link gate remind scout swim concert labor organ arena ripple net notable
```

Puis renommer les 6 premiers comptes :

| Compte | Rôle |
|--------|------|
| Compte 1 | Admin |
| Compte 2 | Prof1 — Classe A |
| Compte 3 | Prof2 — Classe B |
| Compte 4 | Etudiant1 — Classe A |
| Compte 5 | Etudiant2 — Classe A |
| Compte 6 | Etudiant3 — Classe B |

### Étape 3 — Ouvrir la DApp

1. Ouvrir **http://localhost:8080**
2. Sélectionner le compte souhaité dans MetaMask
3. Cliquer **Connecter MetaMask** — la vue s'adapte automatiquement au rôle du compte

---

## Scripts npm

| Commande | Action |
|----------|--------|
| `npm start` | Lance tout (Ganache + compile + déploie + seed + frontend) |
| `npm run compile` | Compile `AttendanceSystem.sol` → `scripts/compiled.json` |
| `npm run deploy` | Déploie sur Ganache + écrit `contract-address.json` |
| `npm run ganache` | Lance Ganache seul (port 7545, Chain ID 1337) |

---

## Structure du projet

```
attendance-dapp/
├── contracts/
│   └── AttendanceSystem.sol        # Smart contract Solidity
├── scripts/
│   ├── compile.js                  # Compile .sol → compiled.json
│   ├── deploy.js                   # Déploie sur Ganache + écrit contract-address.json
│   ├── start.js                    # Lance Ganache + compile + déploie + seed + serveur
│   └── compiled.json               # (généré, gitignored)
├── presentation/
│   ├── presentation.md             # Source Beamer (Markdown)
│   ├── presentation.pdf            # Diapo compilée
│   ├── logo-imt.png                # Logo IMT Nord Europe
│   └── webui1.png                  # Screenshot de la DApp
├── index.html                      # Frontend — structure HTML
├── style.css                       # Frontend — styles (charte IMT Nord Europe)
├── app.js                          # Frontend — logique JavaScript
├── logo-imt.png                    # Logo IMT (header du site)
├── contract-address.json           # (généré, gitignored)
├── package.json
└── README.md
```

---

## Architecture

```
Navigateur (HTML/CSS/JS)
        │
     Web3.js (CDN)
        │
     MetaMask
        │
  Réseau Ethereum (Ganache en dev)
        │
  AttendanceSystem.sol
```

---

## Rôles

| Rôle | Accès |
|------|-------|
| **Super-Admin** | Ajouter / retirer des professeurs, pause / reprise du contrat |
| **Professeur** | Classes (créer, supprimer, transférer), étudiants (inscrire, désinscrire), sessions (ouvrir, fermer, rouvrir, noter), présences, justifications |
| **Étudiant** | Signer sa présence, justifier une absence, consulter son historique |

Le rôle est détecté automatiquement à la connexion MetaMask selon l'adresse active.

---

## Smart Contract — `AttendanceSystem.sol`

**Solidity** `^0.8.0`

### Fonctions principales

Le contrat expose une vingtaine de fonctions couvrant : gestion des profs et des classes, inscription/désinscription des étudiants, ouverture/fermeture/réouverture de sessions, signature de présence (avec vérification du code secret haché), gestion des retards, justifications d'absence, transfert de classe, notes de session, et pause d'urgence. Le détail est dans le code source (`contracts/AttendanceSystem.sol`).

### Mécanisme de présence

1. Le prof crée une session avec un **code secret** (haché keccak256, jamais stocké en clair)
2. Il communique le code oralement en cours (modifiable à tout moment via `updateSessionCode`)
3. L'étudiant entre le code dans la DApp et signe via MetaMask
4. Le contrat vérifie : classe, session active, code correct, pas de double signature
5. La présence est enregistrée sur la blockchain avec un **timestamp**
6. Signature après le seuil → marqué **en retard** automatiquement (si configuré)
7. Étudiant absent → peut **justifier** (motif stocké on-chain), le prof accepte ou refuse

