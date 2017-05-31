
app = angular.module('campui')


app.directive('article', ['wapi', "c2c", function (wapi, c2c) {
    return {
        restrict: 'E',
        scope: {"name":"=", "id":"="},
        template: '<markdown content="content"></div>',
        link: function(scope, element, attrs) {
            scope.$watch(attrs.id, function(id){
                if(id)
                    c2c.article.get({id:id}, function(article){
                        scope.content = article.locales[0].description
                    })
            })

            scope.$watch(attrs.name, function(name){
                if(name)
                    wapi.document.get({name:"Article/" + name}, function(document){
                        scope.content = document.content
                    })
            })
        }
    }
}])

app.directive('outings', ['c2c', 'currentUser', "locale", function (c2c, currentUser, locale) {
    return {
        restrict: 'E',
        scope: {"query":"=?", "data":"=?", "display": "="},
        templateUrl: '/static/campui/views/components/outings.html',
        link: function(scope, element, attrs) {

            var loadDetails = function(){
                scope.data.documents.forEach(function(doc){
                    if(!scope.details[doc.document_id])
                        scope.details[doc.document_id] = c2c.outing.get({id:doc.document_id})
                })
            }

            scope.getLocale = function(item){ return locale.get(item)}
            scope.currentUser = currentUser

            if(!attrs.data)
                scope.$watch(attrs.query, function(query){
                    scope.data = c2c.outings.get({query:query})
                });

            scope.details = {}

            scope.$watch("data", function(){
                if(scope.data){
                    if(scope.data.$promise)
                        scope.data.$promise.then(loadDetails)
                    else
                        loadDetails()
                }
            })
        }
    }
}])

app.directive('images', ['c2c',  "locale", function (c2c,  locale) {
    return {
        restrict: 'E',
        scope: {"query":"=?", "data":"=?", "display": "="},
        template: '<gallery images="data.documents"></gallery>',
        link: function(scope, element, attrs) {
            if(!attrs.data)
                scope.$watch(attrs.query, function(query){
                    scope.data = c2c.images.get({query:query})
                });
        }
    }
}])

app.directive('wikiTools', ['$stateParams', function ($stateParams) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'static/campui/views/directives/wiki-tools.html',
        link:function(scope, element, attrs) {
            if($stateParams.namespace){
                $stateParams.name = $stateParams.namespace + "/" + $stateParams.name
                delete $stateParams.namespace
            }

            scope.namespace = $stateParams.name.split("/")[0]

            if(scope.namespace=="Discussion"){
                scope.mainPageName = $stateParams.name.substring(11)
            }

            else{
                scope.mainPageName = $stateParams.name
            }

            scope.name = $stateParams.name
        }
    };
}])