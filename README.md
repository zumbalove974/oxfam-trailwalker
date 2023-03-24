# Oxfam Trailwalker

Ce projet permet de visualiser les données de course fournies par l'Oxfam.
Ces visualisation sont à but de recherche.

## Installation

Pour installer notre projet, une seule dependance est necessaire : **[Docker](https://docs.docker.com/desktop/)**.

Dans le repertoire courant, cloner le projet :
```cmd
git clone https://github.com/zumbalove974/oxfam-trailwalker.git
cd oxfam-trailwalker
```

## Utilisation

Lancer le projet avec 
```cmd
sudo docker compose build --no-cache && sudo docker compose up &
```

Les services sont utilisables.
Le site web est disponible à l'adresse : http://localhost:8500

Arreter les services avec 
```cmd
sudo docker compose down
```

## Documentation rapide

#### Organisation des dossiers

Dans le dossier `app` : donnees de l'application.
- Sous-dossier `Front` : application Vue.
- Sous-dossier `Back` : application Express.

Dans le dossier `db-data` : les donnees de la base de donnees. Tous les `*.sql` sont executes dans l'ordre alphanumerique.

#### Ports disponibles

Tout est sur `localhost`

- `5500` : Port de l'application Express, qui traite les donnees
- `6500` : Port de la base de donnees.
- `7500` : Port de l'administration de la base de donnees.
- `8500` : Port de la page web.
