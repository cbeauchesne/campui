*Cette règle est un brouillon*

## Liste des développements
A intervalle régulier, les développeurs proposent une liste de point à prioriser. Ces points auront été validés par ailleurs par la communauté. Pour chaque point, les tenants et aboutissants fonctionnels et techniques, ainsi qu'une estimation du temps seront donnés.
Un vote public est alors organisé.

## Vote
Pour chaque point, les contributeurs donneront un parmi ces trois avis :

* Prioritaire
* Pas urgent
* Ne se prononce pas
* Attendre

## Interprétation
Le point *Attendre* ne veut pas dire que le contributeur est contre le point, mais qu'il estime qu'il ne doit pas être fait tant que d'autre ne sont pas fait. Ce choix doit obligatoirement est justifié par une rapide explication, sans quoi il ne sera pas pris en compte.

A l'issue du vote, les résultat sont compilés et présentés. Les développeurs étant bénévoles, ces résultats ne sont pas contraignants, à l'exception de la règle suivante : si un point recueille une majorité (50%) de voix *Attendre*, alors le développement ne sera pas mis en production avant que les autres points ne soient livrés.

## Exemple

### Listes des points

* A : super fonctionnalité, facile à faire
* B : autre super fonctionnalité, dur à faire
* C : changement de comportement, facile à faire

### Vote

Les votes *pas d'avis* sont omis.

* Albert
  * B : Attendre => *Le point C est vraiment urgent*
  * C : Urgent
* Bertrand
  * B : Pas urgent
* Camille
  * A : Urgent
  * B : Attendre => *Je suis contre cette fonctionnalité, et le point A doit vraiment être fait*
* David
  * A : Urgent
  * B : Urgent
* Ella
  * A : Urgent
  * B : Pas urgent
  * C : Pas urgent
* Fanny
  * A : Urgent
  * B : Attendre => *Vraiment pas prioritaire par rapport aux point A et C*
  * C : Urgent

### Résultat 
![image](https://cloud.githubusercontent.com/assets/11915659/26049869/e0576304-395c-11e7-8acb-ac7a2ad53d25.png)

* Le point A est prioritaire
* Le point C vient après (mais si un dev veut faire le point C avant, libre à lui)
* Le point B ne pourra pas être livré en prod avant que les points A et C ne soit livrés
