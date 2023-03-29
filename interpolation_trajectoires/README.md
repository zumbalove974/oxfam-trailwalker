# Module de transformation des donnees

Ce dossier a pour but de normaliser les trajectoires fournies.

## Probleme

De nombreuses trajectoires ne sont pas coherentes avec la trajectoire voulue.
Les donnees sont bruitees.
Il est difficile de comparer les trajectoires si elles ne suivent pas un meme trace.

## Methodologie

![methodologie.png](./methodologie.png)

En diminuant le nombre de points grace a un moyennage, on reduit tres fortement le bruit des donnees GPS.

Puis, on ramene ces nouveaux points moyennes sur une trajectoire de reference, ce qui permet de mieux comparer les trajectoires entre elles.

## Realisation

Nous allons utiliser les donnees de la base de donnees Oxfam, presente sur le port 5500 en localhost. Il est fort probable que ce port soit ensuite utilise pour exposer les donnees obtenues grace a cette methode.

Le moyennage se fera comme suit : le point n de la trajectoire moyennee est la moyenne des points 3n, 3n+1 et 3n+2 de la trajectoire GPS.

La trajectoire de reference sera la trajectoire moyennee du device 3883, qui realise le trajet prevu par l'organisation Oxfam.