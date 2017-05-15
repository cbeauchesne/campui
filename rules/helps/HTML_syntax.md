HTML est le langage de rendu web. Il est basé sur la syntaxe XML décrite ici :

```
<elementA>
    <elementB>
    </elementB>
    <elementC>    
        <elementD>
            Ceci est du contenu
        </elementD>
    </elementC>
<elementA>
```
    
Ceci s'interpete de la manière suivante : 

* l'élement A contient deux éléments : B et C. 
* L'élément C contient un élément D. 
* L'élément D contient le texte : **Ceci est du contenu**

De plus, on peut rajouter des propriétés aux éléments :
  
    <elementA property="value">
    </elementA>
    
Les retours à la ligne et les espace sont ignorés. L'indentation que vous voyez ci dessus est une bonne pratique pour garder le code lisible, mais n'a pas d'impact sur le résultat.
