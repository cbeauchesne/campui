
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
        controller: "recentchangesController",
    })

    $stateProvider.state('contributions', {
        url: "/contributions/:username?limit&offset",
        templateUrl: 'static/campui/views/wapi/contributions.html',
        controllerAs:'ctrl',
        controller: "contributionsController",
    })

    $stateProvider.state("history", {
        url: "/history?name",
        templateUrl: 'static/campui/views/wapi/history.html',
        controllerAs:'ctrl',
        controller: "historyController"
    })

    $stateProvider.state("create", {
        url: "/create?name",
        templateUrl: 'static/campui/views/wapi/create.html',
        controllerAs:'ctrl',
        controller: "createController"
    })

    $stateProvider.state("edit", {
        url: "/edit?name&hid",
        templateUrl: 'static/campui/views/wapi/edit.html',
        controllerAs:'ctrl',
        controller: 'editController'
    })

    $stateProvider.state("diff", {
        url: "/diff?name&hid&offset",
        templateUrl: 'static/campui/views/wapi/diff.html',
        controllerAs:'ctrl',
        controller: "diffController"
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

    var getTemplateUrl = function($stateParams){
        var elts = $stateParams.name.split("/")
        var namespace = $stateParams.namespace || elts[0]

        if(namespace=="Article")
            return 'static/campui/views/ns-templates/article.html'

        if(namespace=="Discussion")
            return 'static/campui/views/ns-templates/discussion.html'

        if(namespace=="Portal")
            return 'static/campui/views/ns-templates/portal.html'

        return 'static/campui/views/ns-templates/article.html'
    }


    $stateProvider.state("oldDocument", {
        url: "/old?name&hid&offset",
        templateUrl: getTemplateUrl,
        controllerAs:'ctrl',
        controller: "wapiController",
    })

    $stateProvider.state("discussion", {
        url: "/Discussion/{name:WapiName}",
        templateUrl: 'static/campui/views/ns-templates/discussion.html',
        params: {
            namespace: "Discussion"
        },
        controllerAs:'ctrl',
        controller: "wapiController"
    })

    $stateProvider.state("document", {
        url: "/{name:WapiName}",
        templateUrl: getTemplateUrl,
        controllerAs:'ctrl',
        controller: "wapiController"
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
