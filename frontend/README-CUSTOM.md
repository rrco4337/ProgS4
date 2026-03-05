# Frontend Angular TypeScript

## Description
Application frontend développée avec Angular et TypeScript, connectée à l'API backend Node.js.

## Technologies
- **Angular 21.x** avec TypeScript
- **Server-Side Rendering (SSR)** activé
- **HttpClient** pour les appels API
- **Routing** configuré

## Installation

```bash
npm install
```

## Configuration

Les variables d'environnement sont définies dans :
- `src/environments/environment.ts` (développement)
- `src/environments/environment.prod.ts` (production)

URL de l'API par défaut : `http://localhost:3000/api`

## Scripts disponibles

- `npm start` ou `ng serve` : Lance le serveur de développement sur http://localhost:4200
- `npm run build` : Build de production
- `npm test` : Exécute les tests unitaires
- `npm run watch` : Build en mode watch
- `npm run serve:ssr:frontend` : Lance l'application avec SSR

## Structure du projet

```
frontend/
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   └── api.ts          # Service API pour communiquer avec le backend
│   │   ├── app.ts              # Composant principal
│   │   ├── app.config.ts       # Configuration de l'application
│   │   └── app.routes.ts       # Définition des routes
│   ├── environments/
│   │   ├── environment.ts      # Config développement
│   │   └── environment.prod.ts # Config production
│   └── index.html
└── angular.json
```

## Service API

Le service API (`src/app/services/api.ts`) fournit des méthodes génériques pour :
- `get<T>(endpoint)` : Requête GET
- `post<T>(endpoint, data)` : Requête POST
- `put<T>(endpoint, data)` : Requête PUT
- `delete<T>(endpoint)` : Requête DELETE

### Exemple d'utilisation

```typescript
import { Api } from './services/api';

export class MyComponent {
  constructor(private api: Api) {}

  loadData() {
    this.api.get<any>('example').subscribe({
      next: (data) => console.log(data),
      error: (err) => console.error(err)
    });
  }
}
```

## Développement

Lancez le serveur de développement :

```bash
npm start
```

L'application sera accessible sur http://localhost:4200 et se rechargera automatiquement lors des modifications.

## Build

Pour créer un build de production :

```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`.
