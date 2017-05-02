
function getC2cController(c2c_item){

    return ['$scope','QueryEditor','currentUser','columnDefs','gettextCatalog','locale','urlQuery', 'mapData','c2c',
    function($scope, QueryEditor, currentUser, columnDefs, gettextCatalog, locale, urlQuery, mapData, c2c){

        $scope.getLocale = function(item){ return locale.get(item)}
        $scope.c2c_item = c2c_item

        $scope.getLabel = function(){
            item = c2c_item.charAt(0).toUpperCase() + c2c_item.slice(1) + "s"
            return gettextCatalog.getString(item)
        }

        $scope.user = currentUser
        $scope.columnDefs = columnDefs[c2c_item]

        $scope._itemCache = {}
        $scope.getItemDetails = function(id){
            if(!$scope._itemCache[id])
                $scope._itemCache[id] = c2c[c2c_item].get({id:id})

            return $scope._itemCache[id]
        }

        $scope.getImageCount = function(id){
            var details = $scope.getItemDetails(id)

            if(!details || !details.$resolved)
                return 0

            return details.associations.images.length
        }

        $scope.onRegisterApi = function(gridApi) {
            gridApi.infiniteScroll.on.needLoadMoreData($scope, function() {
                onEndCallback = gridApi.infiniteScroll.dataLoaded
                $scope.qe.loadNextItems(onEndCallback, onEndCallback)

            });
        }

        $scope.mapData = new mapData()
        $scope.qe = new QueryEditor($scope, c2c_item, $scope.mapData.onDataLoad)

        $scope.mapData.onMapMove = function(coords){
            if($scope.mapData.filterMode)
                $scope.qe.queryModel.bbox = coords.join(",")
            else
                delete $scope.qe.queryModel.bbox

            $scope.qe.apply()

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

app.controller('authController', ['$scope','currentUser', 'api', function($scope, currentUser, api) {
    $scope.currentUser = currentUser;

    var Form = function(){
        var _this = this
        this.username = ""
        this.password1= ""
        this.password2= ""

        this.errors = {
            username:true,
            password1:true,
            password2:true,
            }
        this.hasError = true

        this.check = function(){

            this.errors.password2 = !this.password2 || this.password1 != this.password2
            this.errors.password1 = !this.password1 || this.password1.length < 8
            this.errors.username = !(/^[a-zA-Z0-9\-\_]+$/.test(this.username))
            this.errors.username = !this.username || this.errors.username

            this.hasError = this.errors.password2 || this.errors.password1 || this.errors.username

            return !this.hasError
        }

        this.createUser = function(){
            if(!this.check())
                return

            currentUser.create(this.username, this.password1)
        }
    }

    $scope.form = new Form()
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

