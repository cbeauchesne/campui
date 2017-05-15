Une directive est un élement de votre document, mais qui sera interprété par CampUI de manière à afficher un objet plus complexe. Par exemple :

```
<div>
  <campui-directive parameter="value"></campui-directive>
</div>
```

Ceci est un div qui contient une directive CampUI nommée `campui-directive`. Celle ci à une propriété nommé `parameter` qui a pour valeur `value`.

Voici la liste des directives supportées :

<table>
<tr><th>Nom</th><th>Fonction</th><th>Paramètres</th></tr>

<tr>
<td>recent-outings</td>
<td>Liste des sorties récentes</td>
<td>`filter="'filter'"` : propriété optionelle, par exemple 'activities=rock_climbing'</td>
</tr>

<tr>
<td>markdown</td>
<td>Interprète son contenu en markdown</td>
<td>Aucun</td>
</tr>

<tr>
<td>article</td>
<td>Insère le contenu d'un article de camptocamp</td>
<td>'id'="article_id"</td>
</tr>

</table>

