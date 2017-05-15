Une directive est un élement de votre document, mais qui sera interprété par CampUI de manière à afficher un objet plus complexe. Par exemple :

```
<div>
  <campui-directive parameter="value"></campui-directive>
</div>
```

Ceci est un div qui contient une directive CampUI nommée `campui-directive`. Celle ci à une propriété nommé `parameter` qui a pour valeur `value`.

Voici la liste des directives supportées :

* `<recent-outings></recent-outings>` : liste des sorties récentes
  * `filter="'filter'"` : propriété optionelle, par exemple 'activities=rock_climbing'
* `<div markdown> Du *contenu* écrit en **markdown** </div>` : Utilisez la syntaxe markdown pour rédiger un texte, c'est bien plus pratique!

