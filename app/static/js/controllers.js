
function getC2cController(c2c_item){

    return ['$scope','QueryEditor','currentUser','columnDefs','gettextCatalog','locale','urlQuery', 'NgMap',
    function($scope, QueryEditor, currentUser, columnDefs, gettextCatalog, locale, urlQuery, NgMap){

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

        $scope.toggleMapView = function(){
            var gmap = $scope.gmap

            if(gmap.visible){
                gmap.setMarkers($scope.data)
            }
        }

        var Map = function(){

            var ESPG_4326 = new proj4.Proj('EPSG:4326');
            var ESPG_3785 = new proj4.Proj('EPSG:3785');

            _this = this
            this.visible=false
            this.center = {x:5, y:43}
            this.zoom = 9
            this.markers = []

            this.removeMarkers = function(){
                for (var i = 0; i < this.markers.length; i++ ) {
                    this.markers[i].setMap(null);
                }
                this.markers.length = 0;
            }

            this.appendMarkers = function(data){
                NgMap.getMap().then(function(map){

                    var bounds = new google.maps.LatLngBounds();

                    data.documents.forEach(function(doc){
                        var point = JSON.parse(doc.geometry.geom).coordinates
                        point = proj4.transform(ESPG_3785, ESPG_4326, point)
                        var latLng = new google.maps.LatLng(point.y, point.x)

                        bounds.extend(latLng)

                        _this.markers.push(new google.maps.Marker({
                            position:  latLng,
                            map: map,
                        }))
                    })

                    map.fitBounds(bounds)

                })
            }

            this.setMarkers = function(data){
                this.removeMarkers()
                this.appendMarkers(data)
            }
        }

        $scope.gmap = new Map()

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

