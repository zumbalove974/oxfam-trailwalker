# Oxfam Trailwalker

Dans le cadre du projet de fin d'année, nous réalisons une application pour visualiser les données de course fournies par l'Oxfam.
Ces visualisation sont à but de recherche pour comprendre le comportement des coureurs lors de cette course.

## Installation

Pour installer notre projet, une seule dependance est necessaire : **[Docker](https://docs.docker.com/desktop/)**.

Dans le repertoire courant, cloner le projet :
```cmd
git clone https://github.com/zumbalove974/oxfam-trailwalker.git
cd oxfam-trailwalker
```

Build le projet avec
```cmd
sudo docker compose build --no-cache
```


Lancer le projet avec 
```cmd
sudo docker compose up -d
```

Les services sont utilisables.
Le site web est disponible à l'adresse : http://localhost:8500/home

Pour arrêter les services : 
```cmd
sudo docker compose down
```

N'hésitez pas à lire le [guide d'utilisation](./Guide_Utilisation.md)

## Livrables

Rapport: 
- [Overleaf](https://www.overleaf.com/3983765366srgnhqdfqvdh)
- [Version PDF](./rapport/Rapport.pdf)

Présentation: 
- [Canva](https://www.canva.com/design/DAFhRy5EKeI/3IweNNkSO9Ci0i29ZuVX1A/edit?utm_content=DAFhRy5EKeI&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
- [Version PDF](https://github.com/zumbalove974/oxfam-trailwalker/blob/main/rapport/Presentation.pdf)

## Vidéo expliquant le fonctionnement de l'application
![](./oxfam-trailwalker-demo.mp4)

## Documentation rapide

#### Organisation des dossiers

Dans le dossier `app` : donnees de l'application.
- Sous-dossier `Front` : application Vue.
- Sous-dossier `Back` : application Express.

Dans le dossier `db-data` : les donnees de la base de donnees. Tous les `*.sql` sont executes dans l'ordre alphanumerique.

Dans le dossier `test`: tests d'intégration

#### Ports disponibles

Tout est sur `localhost`

- `5500` : Port de l'application Express, qui traite les donnees
- `6500` : Port de la base de donnees.
- `7500` : Port de l'administration de la base de donnees.
- `8500` : Port de la page web.



#### Technologies utilisées

Front : [Vue.js](https://vuejs.org/), [PrimeVue](https://primevue.org/)

Back: [Express](https://expressjs.com/), [PostgreSQL](https://www.postgresql.org/)

Test: [Jest](https://jestjs.io/)

Build: [Docker](https://www.docker.com/)

IDE: [Visual Studio Code](https://code.visualstudio.com/)

