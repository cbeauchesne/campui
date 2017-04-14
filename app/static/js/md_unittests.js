app = angular.module('campui')


app.config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('markdown', {
        url: "/markdown",
        templateUrl: "static/views/markdown.html",
        controller: ['$scope', 'code_samples', 'markdownConverter', '$sanitize', function($scope, code_samples, markdownConverter, $sanitize){
            
            
            code_samples.forEach(function(item){
                item.result = $sanitize(markdownConverter(item.code))
                
                if(item.result.startsWith("<p>") && item.result.endsWith("</p>"))
                    item.result = item.result.substring(3,item.result.length-4)
                
                item.success = item.result == item.html
            })
            
            $scope.items = code_samples
        }]
    })
}])


app.factory('code_samples', function(){
    
    /* pattern : 
        {
        name:'NAME',
        code:'CODE',
        html:'???'
        },
    */    

    return [
        {
        name:'Table',
        code:'L# |1\nL#bis|1bis \nL#_ |2',
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L1bis</td><td>1bis</td></tr><tr><td>L2</td><td>2</td></tr></tbody></table>'
        },
        {
        name:'Url',
        code:'[url]www.google.com[/url]',
        html:'<a href="www.google.com">www.google.com</a>'
        },
        {
        name:'Table',
        code:'L# |1\nL#|2',
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L2</td><td>2</td></tr></tbody></table>'
        },
        {
        name:'Table',
        code:'L# |1\nL#+bis|2bis',
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L2bis</td><td>2bis</td></tr></tbody></table>'
        },
        {
        name:'Table',
        code:'L# |1\nL#bis|1bis \nL#_ |2',
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L1bis</td><td>1bis</td></tr><tr><td>L2</td><td>2</td></tr></tbody></table>'
        },
        {
        name:'Table',
        code:'L# |1\nL#6|6',
        html:'<table><tbody><tr><td>L1</td><td>1</td></tr><tr><td>L6</td><td>6</td></tr></tbody></table>'
        },
        {
        name:"Link",
        code:"[[waypoints/106822|text]]",
        html:'<a href="waypoint/106822">text</a>'
        },
        {
        name:"Link",
        code:"[[waypoints/106822/a/b/c|text]]",
        html:'<a href="waypoint/106822">text</a>'
        },
        {
        name:"Link",
        code:"[[books/106822|text]]",
        html:'<a href="https://www.camptocamp.org/books/106822">text</a>'
        },
        {
        name:"Link",
        code:"[[routes/106822|text]]",
        html:'<a href="route/106822">text</a>'
        },
        {
        name:"Link",
        code:"[[outings/106822|text]]",
        html:"?"
        },
        {
        name:"Image",
        code:"[img=37027 right /]",
        html:'<figure class="  image-right"><a href="https://www.camptocamp.org/images/37027" target="_blank"><img src="https://api.camptocamp.org/images/proxy/37027?size=MI"></a></figure>'
        },
        {
        name:"Image",
        code:"[img=321450 center big]text[/img]",
        html:"EXPECTED"
        },
        {
        name:"italic",
        code:"[i]coucou[/i]",
        html:"<i>coucou</i>"
        },
        {
        name:"gras",
        code:"[b]coucou[/b]",
        html:"<strong>coucou</strong>"
        }
    ]
})
