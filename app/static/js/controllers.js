
function getC2cController(c2c_item){

    return ['$scope','c2c','currentUser','columnDefs','gettextCatalog','locale','urlQuery',
    function($scope, c2c, currentUser, columnDefs, gettextCatalog, locale, urlQuery){

        $scope.getLocale = function(item){ return locale.get(item)}

        $scope.getLabel = function(){
            item = c2c_item.charAt(0).toUpperCase() + c2c_item.slice(1) + "s"
            return gettextCatalog.getString(item)
        }

        $scope.user = currentUser
        $scope.columnDefs = columnDefs[c2c_item]

        $scope.offset = 0

        $scope.next = function(){
            $scope.offset += 30;
            $scope.setQuery($scope.currentQuery);
        }

        $scope.previous = function(){
            if($scope.offset != 0){
                $scope.offset = Math.max(0, $scope.offset - 30);
                $scope.setQuery($scope.currentQuery);
            }
        }

        $scope.setQuery = function(query){
            $scope.currentQuery = query

            query = query || {};
            url_query = query.url || "";

            if($scope.offset != 0)
                url_query += "&offset=" + $scope.offset;

            if($scope.data)
                $scope.data.documents = []

            c2c[c2c_item + "s"].get({query:url_query},
                function(data){
                    $scope.data = data
                    delete $scope.error
                },
                function(response){
                    $scope.error = "CampToCamp error"
                })
        }

        currentUser.$promise.then(function(){
            firstLoad(currentUser.profile.params[c2c_item + "DefaultQuery"])
        },
        function(){ //api failed
            firstLoad() //api failed, => no queries
        })

        //function that will be called on first load
        var firstLoad = function(defaultQueryName){
            url = urlQuery.getCurrent()

            if(url)
                query = {url:url}
            else
                query = currentUser.profile.params.queries.find(function(item){
                    return item.name == defaultQueryName && item.name
                })

            $scope.setQuery(query)
        }


        $scope.qe = {}

        $scope.qe.visible = false

        $scope.qe.toggle = function(){
            $scope.qe.visible = !$scope.qe.visible
        }

        $scope.qe.save = function(){
            if(user.getQueryIndex($scope.currentQuery) == -1 && ($scope.currentQuery.url || $scope.currentQuery.name))
                user.addQuery($scope.currentQuery)

            user.save()
        }
    }]
}

var app = angular.module('campui')

app.controller("areasController",getC2cController('area'));
app.controller("outingsController",getC2cController('outing'));
app.controller("articlesController", getC2cController('article'));
app.controller("imagesController", getC2cController('image'));
app.controller("xreportsController", getC2cController('xreport'));
app.controller("routesController", getC2cController('route'));
app.controller("waypointsController", getC2cController('waypoint'));

app.controller('authController', ['$scope','$state','api','currentUser','$http', function($scope, $state, api, currentUser, $http) {

    $scope.currentUser = currentUser;

    $scope.getCredentials = function(){
        return {username: $scope.username, password: $scope.password};
    };

    $scope.login = function(){
        creds = $scope.getCredentials();
        api.auth.login(creds).$promise.
                then(function(data){
                    currentUser.username = data.username
                    currentUser.profile = data.profile
                    currentUser.isAnonymous = false
                    $state.go('home')
                }).
                catch(function(data){
                    console.log(data);
                });
    };

    $scope.logout = function(){
        api.auth.logout(function(){
            currentUser.username = undefined
            currentUser.profile = {params:{}}
            currentUser.isAnonymous = true
        });
    };
}])

app.controller('languageController', ['$scope','$cookies','gettextCatalog','tmhDynamicLocale', function($scope, $cookies, gettextCatalog, tmhDynamicLocale){
    $scope.setCurrentLanguage = function(lang){
        $cookies.put('lang', lang);
        gettextCatalog.loadRemote("/static/translations/" + lang + ".json");
        tmhDynamicLocale.set(lang);
        return gettextCatalog.setCurrentLanguage(lang)
    }
    $scope.getCurrentLanguage = function(){ return gettextCatalog.getCurrentLanguage()}
}]);

app.controller('searchController',['$scope','c2c','$state','searchData',function($scope, c2c, $state, searchData){
    $scope.data = searchData
    $scope.search = function(){
        if($scope.data.query.length>=3){
            $state.go('search')
            c2c.search.get({q:$scope.data.query}, function(data){
                $scope.data.result=data;
            })
        }
    }
}]);
