Cette aide vous aidera à mettre à jour les portails présents sur CampUI.

Un portail sur campui est une page qui utilise le contenu d'un article de www.camptocamp.org. Ce contenu sera affiché dans le navigateur directement, après un passage dans un interpréteur pour enrichir certaines balises. En théorie, il n'y a aucune limite à ce rendu. En pratique, veuillez suivre ce petit guide pour garantir la cohérence du rendu, ainsi que la maintenance future.

Voici les aides pour éditer les portails

1. Aide sur la [syntaxe HTML](/rules/helps/HTML_syntax.md) (temps de lecture : 5mn)
2. Aide sur les [élements HTML](/rules/helps/HTML_elements.md) (temps de lecture : 5mn)
2. Aide sur les [directives CampUI](/rules/helps/CampUI_directives.md) (temps de lecture : 5mn)

Pour exemple, voici le code de la page d'acceuil : 

```html
<!-- First line, a row with recent images box -->
<div class="row">
  <div class="col-md-12">
    <recent-images-box/>
  </div>
</div>

<!-- second line, a row -->
<div class="row">
  
  <!-- with recent outings -->
  <div class="col-md-7">
    <recent-outings-box/>
  </div>
  
  <!-- and recent formum message, then routes and articles -->
  <div class="col-md-5">
    <recent-forum-box limit="15"/>
    <recent-routes-box limit="10"/>
    <recent-articles-box limit="5"/>
  </div>
</div>
```
