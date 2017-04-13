app = angular.module('campui')

app.config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: true
    });

    $.each(c2cItems, function(item, params){

        params.detailled_controller = params.detailled_controller ?
            params.detailled_controller :
            ['$scope', '$stateParams', 'c2c', 'locale', function($scope, $stateParams, c2c, locale){
                c2c[item].get($stateParams, function(data){
                    $scope[item] = data;
                    $scope.currentLocale = $scope.getLocale(data)
                })

                $scope.getLocale = function(item){ return locale.get(item)}
            }]

        $stateProvider.state(item, {
            url: "/" + item + "/{id}",
            templateUrl: "static/views/" + item + ".html",
            controller: params.detailled_controller,
        })

        $stateProvider.state(item + 's', {
            url: "/" + item + "s?u&r&a&w",
            templateUrl: "static/views/c2c_items.html",
            controller: item + "sController",
        })
    });


    $stateProvider.state('home', {
        url: "/",
        templateUrl: "static/views/home.html",
    })

    $stateProvider.state('login', {
        url: "/login",
        templateUrl: "static/views/login.html",
        controller : "authController"
    })

    $stateProvider.state('search',{
        url: "/search",
        templateUrl: "static/views/search.html",
        controller : "searchController"
    })

    $stateProvider.state('credits', {
        url: "/credits",
        templateUrl: "static/views/credits.html",
    })

    $stateProvider.state('faq', {
        url: "/faq",
        templateUrl: "static/views/faq.html",
    })

    $stateProvider.state('markdown', {
        url: "/markdown",
        templateUrl: "static/views/markdown.html",
    })

    $stateProvider.state('me', {
        url: "/me",
        templateUrl: 'static/views/me.html',
        controller: ['$scope', 'currentUser', function($scope, currentUser){
            $scope.user = currentUser
        }]
    })
}]);

app.config(['tmhDynamicLocaleProvider', function(tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('/static/angular-i18n/angular-locale_{{locale}}.js');
}]);

app.config(["$locationProvider", function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);

app.config(['$httpProvider', function($httpProvider){
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
}]);

app.run(['$rootScope', '$state', '$cookies', 'gettextCatalog', 'tmhDynamicLocale', function($rootScope, $state, $cookies, gettextCatalog, tmhDynamicLocale) {
    lang = $cookies.get('lang') || 'fr';
    gettextCatalog.setCurrentLanguage(lang);
    tmhDynamicLocale.set(lang);
    gettextCatalog.loadRemote("/static/translations/" + lang + ".json");

    $rootScope.$state = $state;

    //scroll top when state change
    $rootScope.$on('$stateChangeSuccess', function() {
       document.body.scrollTop = document.documentElement.scrollTop = 0;
    });

}]);
