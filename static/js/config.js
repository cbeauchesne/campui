/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: true
    });

    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "static/views/home.html",
        })

        .state('routes', {
            url: "/routes",
            templateUrl: "static/views/c2c_items.html",
            controller: routesController,
        })

        .state('outings', {
            url: "/outings",
            templateUrl: "static/views/c2c_items.html",
            controller: outingsController,
        })

        .state('xreports', {
            url: "/xreports",
            templateUrl: "static/views/c2c_items.html",
            controller: xreportsController,
        })

        .state('credits', {
            url: "/credits",
            templateUrl: "static/views/credits.html",
        })

        .state('user', {
            url: "/user/{username}",
            templateUrl: 'static/views/user.html',
            controller: function($scope, $stateParams, api, c2c){
                $scope.user = api.user.get({username:$stateParams.username});
                $scope.save = function(){
                    api.user.save({username:$stateParams.username}, $scope.user)
                };
            }
        })
}

angular.module('campui')

    .config(config)

    .config(["$locationProvider", function($locationProvider) {
        $locationProvider.html5Mode(true);
        }])

    .config(['$httpProvider', function($httpProvider){
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    }])

    .factory('api', function($resource, $http){
        return {
            auth: $resource('/api/auth\\/', {}, {
                login:  {method: 'POST'},
                logout: {method: 'DELETE'},
            }),
            users: $resource('/api/users\\/', {}, {
                create: {method: 'POST'},
            }),
            user: $resource('/api/user/:username', {}, {
                get: {method: 'GET'},
                save: {method: 'PUT'},
            }),
        };
    })

    .factory('c2c', function($resource){
        return {
            outings: $resource('https://api.camptocamp.org/outings?:query', {query:''},{
                get : {method: 'GET'}
            }),
            images: $resource('https://api.camptocamp.org/images?:query', {query:''},{
                get : {method: 'GET'}
            }),
            xreports: $resource('https://api.camptocamp.org/xreports?:query', {query:''},{
                get : {method: 'GET'}
            }),
            routes: $resource('https://api.camptocamp.org/routes?:query', {query:''},{
                get : {method: 'GET'}
            }),
            articles: $resource('https://api.camptocamp.org/articles?:query', {query:''},{
                get : {method: 'GET'}
            }),
        }
    })

    .factory('user', function(){
        return {
        }
    })

    .factory('queries', function(){
        return {
            outings : {
                skitouring : {act : "skitouring"},
                snow_ice_mixed : {act : "snow_ice_mixed"},
                mountain_climbing : {act : "mountain_climbing"},
                rock_climbing : {act : "rock_climbing"},
                ice_climbing : {act : "ice_climbing"},
                hiking : {act : "hiking"},
                snowshoeing : {act : "snowshoeing"},
                paragliding : {act : "paragliding"},
                mountain_biking : {act : "mountain_biking"},
                via_ferrata : {act : "via_ferrata"},
                mine : {u : "286726"}
            },
            images : {
                skitouring : {act : "skitouring"},
                snow_ice_mixed : {act : "snow_ice_mixed"},
                mountain_climbing : {act : "mountain_climbing"},
                rock_climbing : {act : "rock_climbing"},
                ice_climbing : {act : "ice_climbing"},
                hiking : {act : "hiking"},
                snowshoeing : {act : "snowshoeing"},
                paragliding : {act : "paragliding"},
                mountain_biking : {act : "mountain_biking"},
                via_ferrata : {act : "via_ferrata"},
            },
            xreports : {},
        }
    })

    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
