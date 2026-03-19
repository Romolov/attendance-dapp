---
title: "Système de Présence Blockchain"
subtitle: "DApp Ethereum inspirée de SoWeSign"
author: "Romain Y."
date: "Mars 2026"
theme: metropolis
aspectratio: 169
fontsize: 10pt
header-includes:
  - \usepackage{fontspec}
  - \usepackage{graphicx}
  - \setsansfont{Liberation Sans}
  - \definecolor{imtblue}{RGB}{0,184,222}
  - \setbeamercolor{normal text}{fg=black,bg=white}
  - \setbeamercolor{frametitle}{bg=imtblue,fg=white}
  - \setbeamercolor{progress bar}{fg=imtblue}
  - \setbeamercolor{title separator}{fg=imtblue}
  - \setbeamercolor{progress bar in head/foot}{fg=imtblue}
  - \setbeamercolor{progress bar in section page}{fg=imtblue}
  - \setbeamercolor{alerted text}{fg=imtblue}
  - \titlegraphic{\hfill\includegraphics[height=1.2cm]{logo-imt.png}}
---

## Problématique

**Comment remplacer les feuilles de présence papier ?**

\vspace{0.5em}

Problèmes actuels :

- Falsification facile (signature d'un absent)
- Données centralisées et modifiables
- Pas de traçabilité fiable

\vspace{0.5em}

**Objectif :** une solution décentralisée, infalsifiable, sans tiers de confiance

## Solution proposée

\begin{center}
\includegraphics[width=0.95\textwidth]{webui1.png}
\end{center}

## Technologies utilisées

| Couche | Technologie |
|--------|-------------|
| Smart contract | Solidity \textasciicircum 0.8.0 |
| Blockchain | Réseau Ethereum (Ganache en développement) |
| Interface web | HTML / CSS / JavaScript pur |
| Connexion blockchain | Web3.js v1 (CDN) |
| Wallet | MetaMask |
| Compilation / déploiement | Node.js (scripts locaux) |

\vspace{0.5em}
\small Pas de framework frontend, pas de backend applicatif. Compatible avec tout réseau EVM.

## Architecture

\begin{center}
\texttt{Navigateur (HTML/CSS/JS)}

$\downarrow$

\texttt{Web3.js}

$\downarrow$

\texttt{MetaMask}

$\downarrow$

\texttt{Réseau Ethereum (Ganache en dev)}

$\downarrow$

\texttt{AttendanceSystem.sol}
\end{center}

## Structure des données

5 structures principales :

- **Student** — nom, classe, statut d'inscription
- **Class** — nom, professeur responsable, supprimable
- **Session** — nom, classe, hash du code secret, durée configurable, seuil de retard, note
- **AttendanceRecord** — signé ?, validé ?, en retard ?, timestamp
- **Justification** — motif en clair, soumise ?, acceptée ?, traitée ?

\vspace{0.5em}

+ état global `paused` (pause d'urgence par l'admin)

Stockage via **mappings** et **tableaux** Solidity :

```solidity
mapping(address => Student) public students;
mapping(uint256 => mapping(address => AttendanceRecord))
    public attendance;
```

## Rôles et contrôle d'accès

3 rôles distincts, contrôlés par des **modifiers** Solidity :

\vspace{0.5em}

| Rôle | Modifier | Capacités |
|------|----------|-----------|
| Super-Admin | `onlyAdmin` | Ajouter / retirer des profs, pause d'urgence |
| Professeur | `onlyTeacher` | Classes, étudiants, sessions, présences, justifications, transferts, notes |
| Étudiant | `onlyRegisteredStudent` | Signer, justifier une absence, consulter son historique |

\vspace{0.5em}

\small Le rôle est détecté automatiquement à la connexion MetaMask — la vue s'adapte en conséquence. Déconnexion via \texttt{wallet\_revokePermissions}.

## Mécanisme de présence

\begin{enumerate}
\item Le prof crée une session avec un \textbf{code secret}
\item Le contrat stocke \texttt{keccak256(code)} — jamais le code en clair
\item Le prof communique le code \textit{oralement} (modifiable en cours de session)
\item L'étudiant entre le code dans la DApp et signe via MetaMask
\item Le contrat vérifie :
  \begin{itemize}
    \item Session ouverte et non expirée (durée configurable)
    \item Étudiant dans la bonne classe
    \item Code correct (\texttt{keccak256} côté contrat)
    \item Pas de double signature
  \end{itemize}
\item La présence est enregistrée avec un \textbf{timestamp} immuable
\item Signature après le seuil $\rightarrow$ marqué \textbf{en retard} automatiquement
\item Si absent, l'étudiant peut \textbf{justifier} (motif stocké on-chain)
\item Le prof \textbf{accepte ou refuse} la justification
\end{enumerate}

## Comparatif : SoWeSign vs ma DApp

| Critère | SoWeSign | Ma DApp |
|---------|----------|------------|
| Données | Serveur centralisé | Blockchain (immuable) |
| Falsification | Possible côté serveur | Impossible (on-chain) |
| Code secret | Stocké en clair côté serveur | Haché (keccak256) |
| Tiers de confiance | Oui (SoWeSign) | Non (décentralisé) |
| Infrastructure | Cloud propriétaire | Pas de serveur, 100\% décentralisé |
| Coût | Abonnement payant | Coût gas (réduit via L2 : Polygon, Arbitrum…) |
| Retards | Détection manuelle | Automatique (timestamp) |
| Justifications | Hors système | Stockées on-chain |

\vspace{0.2em}
\small \textbf{Limites :} scalabilité (gas sur mainnet) ; TOTP impossible on-chain (seed haché = non dérivable), compensé par \texttt{updateSessionCode}.

## Questions ?

\begin{center}
\Large Merci
\end{center}
