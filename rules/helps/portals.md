Cette aide vous aidera à mettre à jour les portails présents sur CampUI.

## Principe

Un portail sur campui est une page qui utilise le contenu d'un article de www.camptocamp.org. Ce contenu sera affiché dans le navigateur directement, après un passage dans un interpréteur pour enrichir certaines balises. En théorie, il n'y a aucune limite à ce rendu. En pratique, veuillez suivre ce petit guide pour garantir la cohérence du rendu, ainsi que la maintenance future.

* Aide sur la [syntaxe HTML](/HTML_syntax.md)


### Eléments HTML

Les éléments HTML sont très nombreux. Pour commencer, n'utilisez que les éléments suivants :

* `<div> contenu </div>` : un bloc qui prendra tout la largeur disponible
* `<h1> titre </h1>` : un titre de niveau 1. (h2 pour deuxieme nivaeu, etc.)
* `<strong> gras </strong>` : un texte en **gras**
* `<i> italic </i>` : un texte en *italic*
* `<a href="http:\\www.google.com"> Lien vers google </a>` : [Lien vers google](http:\\www.google.com)

### Propriétés HTML

Les propriétés HTML sont très nombreuses. Pour le moment, une seule vous sera utile : `class` 
* `<div class="className1 className2">` : Ce div aura les classe className1 et className2.

La classe indiquera au navigateur de quelle manière sera rendu votre élément. Celle-ci sont défini au sein de campui, et sont très nombreuses. utilisez pour commencer les classes suivantes : 

* `<div class="row">` : une ligne qui prendra toute la largeur de l'écran
* `<div class="col-md-X">` : X étant un nombre entre 1 et 12 : un bloc qui prendre X douzieme de la largeur de l'écran. 

### Elements CampUI

Au sien de CampUI, vous pouvez utilisez des éléments supplémentaires. Voici la liste des éléments supportés :

* `<recent-outings></recent-outings>` : liste des sorties récentes
  * `filter="'filter'"` : propriété optionelle, par exemple 'activities=rock_climbing'
* `<div markdown> Du *contenu* écrit en **markdown** </div>` : Utilisez la syntaxe markdown pour rédiger un texte, c'est bien plus pratique!

