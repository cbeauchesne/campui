
function getC2cController(c2c_item){

    return ['$scope','c2c','currentUser','columnDefs','gettextCatalog','locale', function($scope, c2c, currentUser, columnDefs, gettextCatalog, locale){

        $scope.getLocale = function(item){ return locale.get(item)}

        $scope.getLabel = function(){
            item = c2c_item.charAt(0).toUpperCase() + c2c_item.slice(1) + "s"
            return gettextCatalog.getString(item)
        }

        $scope.user = currentUser
        $scope.columnDefs = columnDefs[c2c_item]

       // $scope.label = c2c_item + "s"
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
            defaultQuery = undefined

            profile = currentUser.profile || {}
            user_params = profile.params || {};
            $scope.queries = user_params.queries || [];
            defaultQueryName = user_params[c2c_item + "DefaultQuery"]
            defaultQuery = $scope.queries.find(function(item){return item.name == defaultQueryName})

            $scope.setQuery(defaultQuery)
        },
        function(){ //api failed
            $scope.setQuery() //api failed, => no queries
        })

        $scope.qe = {}

        $scope.qe.conf = {}
        $scope.qe.conf.activities = ["snow_ice_mixed","skitouring","hiking","snowshoeing",
                                "paragliding","mountain_climbing","rock_climbing",
                                "mountain_biking","via_ferrata","ice_climbing"]

        $scope.qe.apply = function(){
            items = $('#queryForm').serializeArray()

            console.log(items)

            result = {}
            items.forEach(function(item){
                if(typeof result[item.name] === 'undefined')
                    result[item.name] = item.value
                else
                    result[item.name] += "," + item.value
            })

            console.log(jQuery.param(result))

            url = jQuery.param(result).replace("%2C",",")
            $scope.offset = 0
            $scope.setQuery({url:url})
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
        $state.go('search')
        c2c.search.get({q:$scope.data.query}, function(data){
            console.log(data);
            $scope.data.result=data;
        })
    }
}]);
