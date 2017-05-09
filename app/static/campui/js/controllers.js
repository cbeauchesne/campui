
function getC2cController(c2c_item){

    return ['$scope','QueryEditor','currentUser','columnDefs','gettextCatalog','locale','urlQuery', 'mapData','c2c', 'photoswipe',
    function($scope, QueryEditor, currentUser, columnDefs, gettextCatalog, locale, urlQuery, mapData, c2c, photoswipe){

        $scope.getLocale = function(item){ return locale.get(item)}
        $scope.c2c_item = c2c_item
        $scope.currentUser = currentUser
        $scope.photoswipe = photoswipe
        $scope.columnDefs = columnDefs[c2c_item]

        $scope.details = {}

        $scope.$watch("data", function(){
            if($scope.loadDetails && $scope.data){
                $scope.data.$promise.then(function(){
                    $scope.data.documents.forEach(function(doc){
                        if(!$scope.details[doc.document_id])
                            $scope.details[doc.document_id] = c2c[c2c_item].get({id:doc.document_id})
                    })
                })
            }
        })

        $scope.onRegisterApi = function(gridApi) {
            gridApi.infiniteScroll.on.needLoadMoreData($scope, function() {
                onEndCallback = gridApi.infiniteScroll.dataLoaded
                $scope.qe.loadNextItems(onEndCallback, onEndCallback)

            });
        }

        $scope.mapData = new mapData()
        $scope.qe = new QueryEditor($scope, c2c_item, $scope.mapData.displayMarkers)

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
        gettextCatalog.loadRemote("/static/campui/translations/" + lang + ".json");
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

    c2c.forum.latest_topics.get(function (data){

        $scope.latest_topics = JSON.parse(data.result)

        $scope.latest_topics.topic_list.topics = $scope.latest_topics.topic_list.topics.filter(function(topic){
            return topic.category_id != 29 //comments on outings
        })

        var users = {}

        $scope.latest_topics.users.forEach(function(user){
            users[user.username] = user
        })

        $scope.latest_topics.topic_list.topics.map(function(topic){
            topic.last_poster_user = users[topic.last_poster_username]
        })

        console.log($scope.latest_topics)
    })

}]);

app.controller("linkedOutingsController", ['$scope', 'c2cBeta', 'c2c', '$stateParams', 'photoswipe', 'currentUser',
    function($scope, c2cBeta, c2c, $stateParams, photoswipe, currentUser){
        var appendImages = function(data){

            data.documents.forEach(function(outing){
                outing.associations.images.forEach(function(image){
                    $scope.items.push({image:image, outing:outing})
                })
            })
        }

        $scope.currentUser = currentUser
        $scope.items = []
        $scope.loadMore = function(){
            $scope.data.loadMore(appendImages)
        }

        if($stateParams['r'])
            $scope.c2cItem = c2c.route.get({id:$stateParams['r']})
        else if($stateParams['a'])
            $scope.c2cItem = c2c.area.get({id:$stateParams['a']})
        else if($stateParams['w'])
            $scope.c2cItem = c2c.waypoint.get({id:$stateParams['w']})
        else if($stateParams['u'])
            $scope.c2cItem = c2c.user.get({id:$stateParams['u']})
        else
            throw "dafuck" + $stateParams

        $scope.data = c2cBeta.outings.get($stateParams, appendImages)

        $scope.photoswipe = photoswipe
        $scope.photoswipe.getters.push(function() {
            var images = []
            $scope.items.forEach(function(item){
                images.push(item.image)
            })

            return images
        })
    }
])

