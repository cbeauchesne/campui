
var app = angular.module('campui')

app.config(["$ocLazyLoadProvider", function($ocLazyLoadProvider){

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: true
    });

}])

app.config(["$urlRouterProvider", function($urlRouterProvider){

    $urlRouterProvider.otherwise("/");

}])


app.config(['$stateProvider', '$urlMatcherFactoryProvider', '$ocLazyLoadProvider', 'namespaceTemplateUrlProvider',
function($stateProvider, $urlMatcherFactoryProvider, $ocLazyLoadProvider, namespaceTemplateUrlProvider) {

    var namespaceTemplateUrl = namespaceTemplateUrlProvider.$get()

    var getTemplateUrl = function($stateParams){
        var elts = $stateParams.name.split("/")
        var namespace = $stateParams.namespace || elts[0]

        return namespaceTemplateUrl(namespace) //  console.log( namespaceTemplateUrl)
    }

    $urlMatcherFactoryProvider.type("WapiName", {
        encode: function (val) { return val != null ? val.toString() : val; },
        decode: function (val) { return val != null ? val.toString() : val; },
        is: function (val) { /*jshint validthis:true */ return this.pattern.test(val); },
        pattern: /.+/
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
            templateUrl: namespaceTemplateUrl(item),
            controller: params.detailled_controller,
        })

        $stateProvider.state(item + 's', {
            url: "/" + item + "s?u&r&a&w",
            templateUrl: namespaceTemplateUrl(item + "s"),
            controller: item + "sController",
        })
    });

    $stateProvider.state('home', {
        url: "/",
        templateUrl: namespaceTemplateUrl(""),
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
        templateUrl: namespaceTemplateUrl("search"),
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
        templateUrl: namespaceTemplateUrl("statistics"),
        controllerAs:'ctrl',
        controller: 'statisticsController'
    })

    $stateProvider.state('recentchanges', {
        url: "/recentchanges?limit&offset",
        templateUrl: namespaceTemplateUrl("recentchanges"),
        controllerAs:'ctrl',
        controller: "recentchangesController",
    })

    $stateProvider.state('contributions', {
        url: "/contributions/:username?limit&offset",
        templateUrl: namespaceTemplateUrl("contributions"),
        controllerAs:'ctrl',
        controller: "contributionsController",
    })

    $stateProvider.state("history", {
        url: "/history?name",
        templateUrl: namespaceTemplateUrl("history"),
        controllerAs:'ctrl',
        controller: "historyController"
    })

    $stateProvider.state("create", {
        url: "/create?name",
        templateUrl: namespaceTemplateUrl("create"),
        controllerAs:'ctrl',
        controller: "createController"
    })

    $stateProvider.state("edit", {
        url: "/edit?name&hid",
        templateUrl: namespaceTemplateUrl("edit"),
        controllerAs:'ctrl',
        controller: 'editController'
    })

    $stateProvider.state("diff", {
        url: "/diff?name&hid&offset",
        templateUrl: namespaceTemplateUrl("diff"),
        controllerAs:'ctrl',
        controller: "diffController"
    })

    $stateProvider.state("discussion", {
        url: "/Discussion/{name:WapiName}",
        templateUrl: namespaceTemplateUrl("Discussion"), //'static/campui/views/ns-templates/discussion.html',
        params: {
            namespace: "Discussion"
        },
        controllerAs:'ctrl',
        controller: "wapiController"
    })

    $stateProvider.state("oldDocument", {
        url: "/old?name&hid&offset",
        templateUrl: getTemplateUrl,
        controllerAs:'ctrl',
        controller: "wapiController",
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
            url = url.replace(/%2F/g, '/');
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
