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
            ['$scope', '$stateParams', 'c2c', 'locale', 'gettextCatalog', 'photoswipe', function($scope, $stateParams, c2c, locale, gettextCatalog, photoswipe){
                c2c[item].get($stateParams, function(data){
                    $scope[item] = data;
                    $scope.currentLocale = $scope.getLocale(data)
                })

                $scope.getLocale = function(item){ return locale.get(item)}

                $scope.translateArray = function(arr){
                    if(arr){
                        var r = []
                        arr.forEach(function(item){
                            r.push(gettextCatalog.getString(item))
                        })

                        return r
                    }
                }

                $scope.photoswipe = photoswipe
                $scope.photoswipe.getImages = function() {
                    return $scope[item].associations.images
                }
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

    $stateProvider.state('register', {
        url: "/register",
        templateUrl: "static/views/register.html",
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

    $stateProvider.state('me', {
        url: "/me",
        templateUrl: 'static/views/me.html',
        controller: ['$scope', 'currentUser', function($scope, currentUser){
            $scope.user = currentUser
        }]
    })

    $stateProvider.state('outingImages', {
        url: "/outing-images?r&u&w&a",
        templateUrl: 'static/views/outingImages.html',
        controller: ['$scope', 'c2cBeta', '$stateParams', 'photoswipe', function($scope, c2cBeta, $stateParams, photoswipe){
            var appendImages = function(data){

                data.documents.forEach(function(outing){
                    outing.associations.images.forEach(function(image){
                        $scope.items.push({image:image, outing:outing})
                    })
                })

                console.log($scope.images)
            }

            $scope.items = []
            $scope.loadMore = function(){
                $scope.data.loadMore(appendImages)
            }

            $scope.data = c2cBeta.outings.get($stateParams, appendImages)

            $scope.photoswipe = photoswipe
            $scope.photoswipe.getImages = function() {
                var images = []
                $scope.items.forEach(function(item){
                    images.push(item.image)
                })

                return images
            }
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

// this is cryptic : forum request is loaded but not sent back.
/*
app.config(['$httpProvider', function($httpProvider) {
        console.log($httpProvider.defaults.headers.common["X-Requested-With"])
        delete $httpProvider.defaults.headers.common["X-Requested-With"]
    }])
*/

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
