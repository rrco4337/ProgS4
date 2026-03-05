FROM node:20-alpine

WORKDIR /app

# Installer Angular CLI
RUN npm install -g @angular/cli

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port
EXPOSE 4200

# Commande de démarrage
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
