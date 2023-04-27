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

## Utilisation
Si on ajoute une nouvelle librairie ou bibliothèque, on re-build le projet avec :
```cmd
sudo docker compose build --no-cache
```


Lancer le projet avec 
```cmd
sudo docker compose up -d
```

Les services sont utilisables.
Le site web est disponible à l'adresse : http://localhost:8500

Pour arrêter les services : 
```cmd
sudo docker compose down
```

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



## Logiciels utilisés qu'on peut retrouver dans la partie architecture de l'appli:

Front : Vue.js, PrimeVue

Back: Express, PostgreSQL

Test: Jest

Build: Docker

Rapport: Overleaf https://www.overleaf.com/3983765366srgnhqdfqvdh
Présentation: https://www.canva.com/design/DAFhRy5EKeI/3IweNNkSO9Ci0i29ZuVX1A/edit?utm_content=DAFhRy5EKeI&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

IDE: Visual Studio Code

