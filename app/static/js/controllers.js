
function getC2cController(c2c_item){

    return ['$scope','QueryEditor','currentUser','columnDefs','gettextCatalog','locale','urlQuery',
    function($scope, QueryEditor, currentUser, columnDefs, gettextCatalog, locale, urlQuery){

        $scope.getLocale = function(item){ return locale.get(item)}
        $scope.c2c_item = c2c_item

        $scope.getLabel = function(){
            item = c2c_item.charAt(0).toUpperCase() + c2c_item.slice(1) + "s"
            return gettextCatalog.getString(item)
        }

        $scope.user = currentUser
        $scope.columnDefs = columnDefs[c2c_item]
        $scope.qe = new QueryEditor($scope, c2c_item)

        $scope.onRegisterApi = function(gridApi) {
            gridApi.infiniteScroll.on.needLoadMoreData($scope, function() {
                onEndCallback = gridApi.infiniteScroll.dataLoaded
                $scope.qe.loadNextItems(onEndCallback, onEndCallback)

            });
        }

        $scope.center = "41,-87"
        $scope.getCenter = function(){

            if(!$scope.data)
                return "40,40"

                console.log($scope.data.documents[0].geometry)
            return JSON.parse($scope.data.documents[0].geometry.geom)

            var SE = [72.99329,-166.59975] //init with SE point
            var NO = [-51.68022,161.05650] //init with NO point

            $scope.data.documents.forEach(function(doc){

                var version = doc.geometry.version
                var geom = GeoJSON.parse(JSON.parse(doc.geometry.geom))

                console.log(geom)
            })

            console.log(NO,SE)
        }
        
        url = urlQuery.getCurrent()

        if(url){ // if query is un url, do not load user
            $scope.qe.setQuery({url:url})
        }
        else{

            currentUser.$promise.then(function(){
                defaultQueryName = currentUser.profile.params[c2c_item + "DefaultQuery"]

                var query

                currentUser.profile.params.queries.forEach(function(item){
                    if(item.name===defaultQueryName && item.name)
                        query = item
                })

                $scope.qe.setQuery(query)
            },
            function(){ //api failed
                $scope.qe.setQuery() //api failed, => no queries
            })
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

app.controller('authController', ['$scope','currentUser', function($scope, currentUser) {
    $scope.currentUser = currentUser;
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


app.controller('forumController',['$scope','c2c',function($scope, c2c){

    $scope.latest_topics = c2c.forum.latest_topics.get(
        function (data){console.log("s", data)},
        function (data){console.log("e", data)}
        )
}]);

