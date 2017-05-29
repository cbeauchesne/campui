
var app = angular.module('campui')

app.config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', '$ocLazyLoadProvider',
function($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: true
    });

    $.each(c2cItems, function(item, params){

        params.detailled_controller = params.detailled_controller ?
            params.detailled_controller :
            ['$scope', '$stateParams', 'c2c', 'locale', 'gettextCatalog', 'photoswipe', 'currentUser', function($scope, $stateParams, c2c, locale, gettextCatalog, photoswipe, currentUser){
                c2c[item].get($stateParams, function(data){
                    $scope[item] = data;
                    $scope.currentLocale = $scope.getLocale(data)
                })

                $scope.getLocale = function(item){ return locale.get(item)}

                $scope.translateArray = function(arr){
                    function getString(item){ return gettextCatalog.getString(item) }

                    if(arr)
                        return arr.map(getString)
                }

                $scope.currentUser = currentUser

                $scope.photoswipe = photoswipe
                $scope.photoswipe.getters.push(function() {
                    return $scope[item].associations.images
                })
            }]

        $stateProvider.state(item, {
            url: "/" + item + "/{id:int}",
            templateUrl: "static/campui/views/" + item + ".html",
            controller: params.detailled_controller,
        })

        $stateProvider.state(item + 's', {
            url: "/" + item + "s?u&r&a&w",
            templateUrl: "static/campui/views/c2c_items.html",
            controller: item + "sController",
        })
    });


    $stateProvider.state('home', {
        url: "/",
        templateUrl: "static/campui/views/home.html",
    })

    $stateProvider.state('login', {
        url: "/login",
        templateUrl: "static/campui/views/login.html",
        controller : "authController"
    })

//    $stateProvider.state('register', {
//        url: "/register",
//        templateUrl: "static/campui/views/register.html",
//        controller : "authController"
//    })

    $stateProvider.state('search',{
        url: "/search",
        templateUrl: "static/campui/views/search.html",
        controller : "searchController"
    })

    $stateProvider.state('me', {
        url: "/me",
        templateUrl: 'static/campui/views/me.html',
        controller: ['$scope', 'currentUser', function($scope, currentUser){
            $scope.user = currentUser
        }]
    })

    $stateProvider.state('stories', {
        url: "/stories?r&u&w&a",
        templateUrl: 'static/campui/views/stories.html',
        controller: "linkedOutingsController"
    })

    $stateProvider.state('outingImages', {
        url: "/outing-images?r&u&w&a",
        templateUrl: 'static/campui/views/outingImages.html',
        controller: "linkedOutingsController"
    })

    $stateProvider.state('statistics', {
        url: "/statistics",
        templateUrl: 'static/campui/views/statistics.html',
        controllerAs:'ctrl',
        controller: 'statisticsController'
    })

    $stateProvider.state('recentchanges', {
        url: "/recentchanges?limit&offset",
        templateUrl: 'static/campui/views/wapi/recentchanges.html',
        controllerAs:'ctrl',
        controller: ["wapi","$stateParams", function(wapi, $stateParams){
            this.versions = wapi.recentChanges.get($stateParams)
            this.params = $stateParams
            $stateParams.offset = parseFloat($stateParams.offset || 0)
            $stateParams.limit = parseFloat($stateParams.offset || 30)
        }]
    })

    $stateProvider.state('contributions', {
        url: "/contributions/:username?limit&offset",
        templateUrl: 'static/campui/views/wapi/contributions.html',
        controllerAs:'ctrl',
        controller: ["wapi", "$stateParams", function(wapi, $stateParams){
            this.versions = wapi.contributions.get($stateParams)
            this.params = $stateParams
            $stateParams.offset = parseFloat($stateParams.offset || 0)
            $stateParams.limit = parseFloat($stateParams.offset || 30)
        }]
    })

    $stateProvider.state("history", {
        url: "/history?name",
        templateUrl: 'static/campui/views/wapi/history.html',
        controllerAs:'ctrl',
        controller: ["wapi", "$stateParams", function(wapi, $stateParams){
            this.versions = wapi.document.history({name:$stateParams.name})
        }]
    })

    $stateProvider.state("create", {
        url: "/create?name",
        templateUrl: 'static/campui/views/wapi/create.html',
        controllerAs:'ctrl',
        controller: ["wapi", "$stateParams", "$state", function(wapi, $stateParams, $state){
            var _this = this
            this.document = {name:$stateParams.name, comment:"creation"}

            this.document.create = function(){

                wapi.document.create({name:_this.document.name}, {document:_this.document},
                    function(){
                        $state.go("document", {"name":_this.document.name})
                    },
                    function(response){
                        console.log(response)
                    }
                )
            }
        }]
    })

    $stateProvider.state("edit", {
        url: "/edit?name&hid",
        templateUrl: 'static/campui/views/wapi/edit.html',
        controllerAs:'ctrl',
        controller: ["wapi", "$stateParams", "$state", function(wapi, $stateParams, $state){
            var _this = this

            this.document = wapi.document.get($stateParams,
                function(document){
                    document.update = function(){
                        document.comment = document.newComment
                        delete document.newComment

                        wapi.document.update({name:$stateParams.name}, {document:document},
                            function(){
                                $state.go("document", {"name":$stateParams.name})
                            },
                            function(response){
                                console.log(response)
                            }
                        )
                    }
                }
            )
        }]
    })

    $stateProvider.state("diff", {
        url: "/diff?name&hid&offset",
        templateUrl: 'static/campui/views/wapi/diff.html',
        controllerAs:'ctrl',
        controller: ["wapi", "$stateParams", function(wapi, $stateParams){
            var _this = this

            this.name = $stateParams.name

            var computeDiff = function(){
                if(!_this.oldDoc || !_this.newDoc)
                    return

                _this.contentDiff = JsDiff.diffLines(_this.oldDoc.content,
                                                            _this.newDoc.content)
                _this.contentDiff.forEach(function (d){
                  //  if(!d.value) console.log(d)
                    d.lines = d.value.split("\n")
                })

                console.log("diffing", _this.contentDiff)
            }

            var delNewDoc = function(r){ delete _this.newDoc }
            var delOldDoc   = function(r){ delete _this.oldDoc }

            if($stateParams.offset=='next'){
                this.oldDoc = wapi.document.get({name:$stateParams.name, hid:$stateParams.hid}, computeDiff, delOldDoc)
                this.newDoc = wapi.document.get({name:$stateParams.name, hid:$stateParams.hid, offset:"next"},
                                computeDiff, delNewDoc)
            }
            else{
                this.oldDoc = wapi.document.get({name:$stateParams.name, hid:$stateParams.hid, offset:"prev"},
                                computeDiff, delOldDoc)
                this.newDoc = wapi.document.get({name:$stateParams.name, hid:$stateParams.hid}, computeDiff, delNewDoc)
            }
        }]
    })

    function valToString(val) { return val != null ? val.toString() : val; }
    function valFromString(val) { return val != null ? val.toString() : val; }
    function regexpMatches(val) { /*jshint validthis:true */ return this.pattern.test(val); }

    $urlMatcherFactoryProvider.type("WapiName", {
        encode: valToString,
        decode: valFromString,
        is: regexpMatches,
        pattern: /.+/
    });

    var getRawUrl = function($stateParams){
        var rawUrl = '/api/document/' + $stateParams.name + '?view=raw'
        rawUrl += $stateParams.hid? "&hid=" + $stateParams.hid : ""
        rawUrl += $stateParams.offset? "&offset=" + $stateParams.offset : ""

        return rawUrl
    }

    var getTemplateUrl = function($stateParams){
        var elts = $stateParams.name.split("/")
        var namespace = elts[0]

        if(namespace=="Article")
            return 'static/campui/views/ns-templates/article.html'

        if(namespace=="Discussion")
            return 'static/campui/views/ns-templates/discussion.html'

        if(namespace=="Portal")
            return 'static/campui/views/ns-templates/raw-doc.html'

    }

    $stateProvider.state("oldDocument", {
        url: "/old?name&hid&offset",
        templateUrl: getTemplateUrl,
        controllerAs:'ctrl',
        controller: ["wapi", "$stateParams", function(wapi, $stateParams){
            this.rawUrl = getRawUrl($stateParams)
            this.document = wapi.document.get($stateParams)
            this.isOld = true
        }],
    })

    $stateProvider.state("document", {
        url: "/{name:WapiName}",
        templateUrl: getTemplateUrl,
        controllerAs:'ctrl',
        controller: ["wapi", "$stateParams", function(wapi, $stateParams){
            this.rawUrl = getRawUrl($stateParams)
            this.document = wapi.document.get($stateParams)
            this.isOld = false
        }]
    })

    $stateProvider.state("discussion", {
        url: "/discussion/{name:WapiName}",
        templateUrl: getTemplateUrl,
        controllerAs:'ctrl',
        controller: ["wapi", "$stateParams", function(wapi, $stateParams){
            this.rawUrl = getRawUrl($stateParams)
            this.document = wapi.document.get($stateParams)
            this.isOld = false
        }]
    })

}]);

app.config(['tmhDynamicLocaleProvider', function(tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('/static/campui/angular-i18n/angular-locale_{{locale}}.js');
}]);

app.config(["$locationProvider", function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);

app.config(['$httpProvider', function($httpProvider){
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
}]);

//fix resource encode folies :
//if you have a "+"  in url (like TD+), C2C fails, you have to encode it as %2B AND ALSO commas as %2C
//if you change it to %2B in std function, resource re-encode % => %252B
//this dirty fix handle this...
app.config(["$provide", function($provide) {
    $provide.decorator('$httpBackend', ["$delegate", function($delegate) {
        return function(method, url, post, callback, headers, timeout, withCredentials, responseType) {
            url = url.replace(/,/g, '%2C');
            url = url.replace(/\+/g, '%2B');
            $delegate(method, url, post, callback, headers, timeout, withCredentials, responseType);
        };
    }])
}]);



app.run(['$rootScope', '$state', '$cookies', 'gettextCatalog', 'tmhDynamicLocale', 'photoswipe', 'analytics', '$timeout',
    function($rootScope, $state, $cookies, gettextCatalog, tmhDynamicLocale, photoswipe, analytics, $timeout) {
        var lang = $cookies.get('lang') || 'fr';
        gettextCatalog.setCurrentLanguage(lang);
        tmhDynamicLocale.set(lang);
        gettextCatalog.loadRemote("/static/campui/translations/" + lang + ".json");

        $rootScope.$state = $state;

        //scroll top when state change
        $rootScope.$on('$stateChangeSuccess', function() {
           document.body.scrollTop = document.documentElement.scrollTop = 0;
           photoswipe.getters = []
           photoswipe.open = false
           $timeout(analytics.ping.send)
        });
    }
]);
