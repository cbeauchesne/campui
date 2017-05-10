app = angular.module('campui')


app.config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('markdown', {
        url: "/markdown",
        templateUrl: "static/campui/views/markdown.html",
        controller: ['$scope', 'code_samples', 'markdownConverter', '$sanitize', function($scope, code_samples, markdownConverter, $sanitize){

//            code_samples=[code_samples[23]]
            code_samples.forEach(function(item){
                console.log(item.name)
                item.result = markdownConverter(item.code, $sanitize)
                
                if(item.result.startsWith("<p>") && item.result.endsWith("</p>"))
                    item.result = item.result.substring(3,item.result.length-4)
                
                item.success = item.result == item.html
            })
            
            $scope.items = code_samples

            $scope.toggle = function(mode){ $scope[mode] = !$scope[mode] }
        }]
    })
}])


app.factory('code_samples', function(){

    // please keep names unique
    // add keep them in alphabetical order
    /* pattern :

        {
        name:'NAME', //short name of your text
        code:'CODE', //markdown code
        html:'???'   //expected html result
        },
    */    

    return [
        {
        name:'Acr1',
        code:'[acr=a b]c[/acr]',
        html:'<acronym title="a b">c</acronym>'
        },
        {
        name:'Image1',
        code:'[img=234624 big center no_border no-legend/]',
        html:'<figure class="image-big image-center image-no-border image-no-legend"><img src="https://api.camptocamp.org/images/proxy/234624?size=BI" ng-click="photoswipe.showGallery(234624)"></figure>'
        },
        {
        name:'Image2',
        code:'[img=picto/rock_climbing_mini.png /]',
        html:'<img src="/static/campui/img/picto/rock_climbing_mini.png">'
        },
        {
        name:"Image3",
        code:"[img=37027 right /]",
        html:'<figure class="image-right"><img src="https://api.camptocamp.org/images/proxy/37027?size=MI" ng-click="photoswipe.showGallery(37027)"></figure>'
        },
        {
        name:"Image4",
        code:"[img=37027 center big]text[/img]",
        html:'<figure class="image-center image-big"><img src="https://api.camptocamp.org/images/proxy/37027?size=BI" ng-click="photoswipe.showGallery(37027)"></figure>'
        },
        {
        name:"Image5",
        code:"[img=142101right][/img]",
        html:'<figure class="image-right"><img src="https://api.camptocamp.org/images/proxy/142101?size=MI" ng-click="photoswipe.showGallery(142101)"></figure>'
        },

        {
        name:"Link1",
        code:"[[waypoints/106822|text]]",
        html:'<a href="waypoint/106822">text</a>'
        },
        {
        name:"Link2",
        code:"[[waypoints/106822/a/b/c|text]]",
        html:'<a href="waypoint/106822">text</a>'
        },
        {
        name:"Link3",
        code:"[[books/106822|text]]",
        html:'<a href="https://www.camptocamp.org/books/106822">text</a>'
        },
        {
        name:"Link4",
        code:"[[routes/106822|text]]",
        html:'<a href="route/106822">text</a>'
        },
        {
        name:"Link5",
        code:"[[outings/106822|text]]",
        html:'<a href="outing/106822">text</a>'
        },
        {
        name:"Link6",
        code:"[[articles/482718|article]]",
        html:'<a href="https://www.camptocamp.org/articles/482718">article</a>'
        },
        {
        name:'Table2',
        code:'L# |1\nL#| 2',
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L2</td><td>2</td></tr></tbody></table>'
        },
        {
        name:'Table3',
        code:'L# |1\nL#+bis|2bis',
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L2bis</td><td>2bis</td></tr></tbody></table>'
        },
        {
        name:'Table4',
        code:'L# |1\nL#bis|1bis \nL#_ |2',
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L1bis</td><td>1bis</td></tr><tr><td>L2</td><td>2</td></tr></tbody></table>'
        },
        {
        name:'Table5',
        code:'L# |1\nL#6|6',
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L6</td><td>6</td></tr></tbody></table>'
        },
        {
        name:'Table6',
        code:'L# | x\ny\nL# | xy',
        html:'<table><tbody><tr><td>L1</td><td>x<br>y</td></tr><tr><td>L2</td><td>xy</td></tr></tbody></table>'
        },
        {
        name:'Table7',
        code:'L# | x\n\ny\nL# | xy',
        html:'<table><tbody><tr><td>L1</td><td>x</td></tr></tbody></table>&#10;<p>y</p>&#10;<table><tbody><tr><td>L2</td><td>xy</td></tr></tbody></table>'
        },
        {
        name:'Table8',
        code:'L#! | 1\nL# | 2\nL#bis | 1bis',
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L2</td><td>2</td></tr><tr><td>L1bis</td><td>1bis</td></tr></tbody></table>'
        },
        {
        name:'Table9', //short name of your text
        code:'L#-3 | 1-3', //markdown code
        html:'<table><tbody><tr><td>L1-3</td><td>1-3</td></tr></tbody></table>'   //expected html result
        },
        {
        name:'Table10', //short name of your text
        code:'L#1 | 1\nL#-+2 | 2-4', //markdown code
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L2-4</td><td>2-4</td></tr></tbody></table>'
        },
        {
        name:'Table11', //short name of your text
        code:'L#= | header\nL#= header', //markdown code
        html:'<table><tbody><tr><th></th><th>header</th></tr><tr><th></th><th>header</th></tr></tbody></table>'
        },
        {
        name:'Table12', //short name of your text
        code:'L#= | header \nL#~ text\nL# | 1 ', //markdown code
        html:'<table><tbody><tr><th></th><th>header</th></tr><tr><td colspan="2">text</td></tr><tr><td>L1</td><td>1</td></tr></tbody></table>'
        },
        {
        name:'Table13', //short name of your text
        code:'L# | 1\nL#+left | 2left\nL#right | 2right', //markdown code
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L2left</td><td>2left</td></tr><tr><td>L2right</td><td>2right</td></tr></tbody></table>'
        },
        {
        name:'Table14', //short name of your text
        code:'L# | 1\nL#3bis | 3bis', //markdown code
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L3bis</td><td>3bis</td></tr></tbody></table>'
        },
        {
        name:'Table15', //short name of your text
        code:'L# : L1 \nL#bis : L1bis\nL#_ : L2\nL#+left : L3left\nL#right : L3right\nL#_ : L4\nL#12bis : L12bis',
        html:'<table><tbody><tr><td>L1</td><td>L1</td></tr><tr><td>L1bis</td><td>L1bis</td></tr><tr><td>L2</td><td>L2</td></tr><tr><td>L3left</td><td>L3left</td></tr><tr><td>L3right</td><td>L3right</td></tr><tr><td>L4</td><td>L4</td></tr><tr><td>L12bis</td><td>L12bis</td></tr></tbody></table>'
        },
        {
        name:'Table16', //short name of your text
        code:'## Voie\nL# | 5b',
        html:'<h3>Voie</h3>&#10;<table><tbody><tr><td>L1</td><td>5b</td></tr></tbody></table>'
        },
        {
        name:'Table17', //short name of your text
        code:'L# :: 5b ::text',
        html:'<table><tbody><tr><td>L1</td><td>5b</td><td>text</td></tr></tbody></table>'
        },
        {
        name:'Table18', //short name of your text
        code:'L# || 5b ||text',
        html:'<table><tbody><tr><td>L1</td><td>5b</td><td>text</td></tr></tbody></table>'
        },
        {
        name:'Table19', //short name of your text
        code:'L# 5b',
        html:'<table><tbody><tr><td>L1</td><td>5b</td></tr></tbody></table>'
        },
        {
        name:'Table20', //short name of your text
        code:'L# | 35m |  a [[http://www.google.com|google]] c',
        html:'<table><tbody><tr><td>L1</td><td>35m</td><td>a <a href="http://www.google.com">google</a> c</td></tr></tbody></table>'
        },
        {
        name:'Table21', //short name of your text
        code:'L# : a : b',
        html:'<table><tbody><tr><td>L1</td><td>a : b</td></tr></tbody></table>'
        },
        {
        name:'Table22', //short name of your text
        code:'L# : a\n\nL# : b',
        html:'<table><tbody><tr><td>L1</td><td>a</td></tr><tr><td>L2</td><td>b</td></tr></tbody></table>'
        },
        {
        name:'Table23', //short name of your text
        code:'L#bis : L1bis\nL#2 : L2',
        html:'<table><tbody><tr><td>L1bis</td><td>a</td></tr><tr><td>L2</td><td>b</td></tr></tbody></table>'
        },
        {
        name:'Table24', //short name of your text
        code:'L# : L1\nL#bis : L1bis\n\nxx\nL#1_ : L1',
        html:'<table><tbody><tr><td>L1</td><td>L1</td></tr><tr><td>L1bis</td><td>L1bis</td></tr></tbody></table>&#10;<p>xx</p>&#10;<table><tbody><tr><td>L1</td><td>L1</td></tr></tbody></table>'
        },
        {
        name:'Table25', //short name of your text
        code:"L# | L1\nL#' | L1'\nL#10_ | L10\nL#' | L10'\n",
        html:"<table><tbody><tr><td>L1</td><td>L1</td></tr><tr><td>L1'</td><td>L1'</td></tr><tr><td>L10</td><td>L10</td></tr><tr><td>L10'</td><td>L10'</td></tr></tbody></table>"
        },
        {
        name:'Table26', //short name of your text
        code:"L# | R# R1.\nL#bis | L#+1_ L2. R# R?.\nL#~ | Avec L#-2_-+2.\nL#_ | L#-1 / L#-+2 / R#-2 / L#-3-+1 / R#-3–1",
        html:"<table><tbody><tr><td>L1</td><td>L1</td><td>L1</td></tr><tr><td>L2</td><td>L3</td><td>L3</td></tr><tr><td>L3</td><td>L1</td><td>L1</td></tr></tbody></table>"
        },
        {
        name:'Table27', //short name of your text
        code:"L# | 1 \nL# | 1 | 2\nL# | 1 | 2 | 3",
        html:"<table><tbody><tr><td>L1</td><td>1</td><td></td><td></td></tr><tr><td>L2</td><td>1</td><td>2</td><td></td></tr><tr><td>L3</td><td>1</td><td>2</td><td>3</td></tr></tbody></table>"
        },
        {
        name:'Table27', //short name of your text
        code:"L# | 1 \nL#+3 | L4",
        html:"<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L4</td><td>L4</td></tr></tbody></table>"
        },
        {
        name:'Trash1',
        code:'[p]',
        html:''
        },
        {
        name:'Trash2',
        code:'[col 33 left]',
        html:''
        },
        {
        name:'Trash3',
        code:'[/col]',
        html:''
        },
        {
        name:'Trash4',
        code:'[toc2]',
        html:''
        },
        {
        name:'Trash5',
        code:'[toc 666]',
        html:''
        },
        {
        name:'Trash6',
        code:'[picto cou_cou /]',
        html:''
        },
        {
        name:"Typo1",
        code:"[i]coucou[/i]",
        html:"<i>coucou</i>"
        },
        {
        name:"Typo2",
        code:"[b]coucou[/b]",
        html:"<strong>coucou</strong>"
        },
        {
        name:"Typo3",
        code:"[sup]coucou[/sup]",
        html:"<sup>coucou</sup>"
        },
        {
        name:"Typo4",
        code:"[imp]coucou[/imp]",
        html:'<div class="alert alert-danger">coucou</div>'
        },
        {
        name:'Typo5',
        code:'[i][url=www.google.com]google[/url][/i]',
        html:'<i><a href="www.google.com">google</a></i>'
        },
        {
        name:'Typo6',
        code:'[i][b]google[/b][/i]',
        html:'<i><strong>google</strong></i>'
        },
        {
        name:'Typo7',
        code:'[b][i]google[/i][/b]',
        html:'<strong><i>google</i></strong>'
        },
        {
        name:'Typo8',
        code:'[url=www.google.com][b]google[/b][/url]',
        html:'<a href="www.google.com"><strong>google</strong></a>'
        },
        {
        name:'Typo9',
        code:'[imp][b]google[/b]\ncoucou[/imp]',
        html:'<div class="alert alert-danger"><strong>google</strong><br>coucou</div>'
        },
        {
        name:'Typo10',
        code:'[code]int main()\nreturn 0;[/code]',
        html:'<pre>int main()&#10; return 0;</pre>'
        },
        {
        name:'Typo11',
        code:'\n##c Titre c2c # precisions\n',
        html:'<h3>Titre c2c <small> precisions</small></h3>'
        },
        {
        name:'Typo11bis',
        code:'##T1\n###T2# prec',
        html:'<h3>T1</h3>&#10;<h4>T2<small> prec</small></h4>'
        },
        {
        name:"Typo12",
        code:"[u]coucou[/u]",
        html:"<u>coucou</u>"
        },
        {
        name:"Typo13",
        code:"[s]coucou[/s]",
        html:"<del>coucou</del>"
        },
        {
        name:"Typo14",
        code:"[color=#ffffff]coucou[/color]",
        html:"coucou"
        },
        {
        name:"Typo15",
        code:"[c]coucou[/c]",
        html:"<span>coucou</span>"
        },
        {
        name:"Typo16",
        code:"[sup]coucou[/sup]",
        html:"<sup>coucou</sup>"
        },
        {
        name:"Typo17",
        code:"[ind]coucou[/ind]",
        html:"<sub>coucou</sub>"
        },
        {
        name:'Typo18',
        code:'[important]\na\nb[/important]',
        html:'<div class="alert alert-danger">a<br>b</div>'
        },
        {
        name:'Typo19',
        code:'[warning]coucou[/warning]',
        html:'<div class="alert alert-danger">coucou</div>'
        },
        {
        name:'Typo20',
        code:'[b][u]xx[/u][/b]',
        html:'<strong><u>xx</u></strong>'
        },
        {
        name:'Typo21',
        code:'[i][u]xx[/u][/i]',
        html:'<i><u>xx</u></i>'
        },
        {
        name:'Url',
        code:'[url]www.google.com[/url]',
        html:'<a href="www.google.com">www.google.com</a>'
        },
        {
        name:'Url2',
        code:'[url=www.google.com]google[/url]',
        html:'<a href="www.google.com">google</a>'
        },
        {
        name:'Url3',
        code:'[url=]www.google.com[/url]',
        html:'<a href="www.google.com">www.google.com</a>'
        },
        {
        name:'Url4',
        code:'[email]registration@camptocamp.org[/email]',
        html:'<a href="mailto:registration@camptocamp.org">registration@camptocamp.org</a>'
        },
        {
        name:'video1',
        code:'[video]https://vimeo.com/80477501[/video]',
        html:'<iframe src="https://player.vimeo.com/video/80477501" width="640" height="360"></iframe>'
        },
    ]
})




