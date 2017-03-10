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
        .state('dashboard', {
            url: "/",
            templateUrl: "static/views/dashboard.html",
        })

        .state('topos', {
            url: "/topos",
            templateUrl: "static/views/topos.html",
        })

        .state('outings', {
            url: "/outings",
            templateUrl: "static/views/outings.html",
        })

        .state('credits', {
            url: "/credits",
            templateUrl: "static/views/credits.html",
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
                logout: {method: 'DELETE'}
            }),
            users: $resource('/api/users\\/', {}, {
                create: {method: 'POST'}
            }),
        };
    })

    .factory('c2c', function($http){

        function c2c_query(base_url){
            return function($scope, query){

                query = (typeof query === 'undefined') ? {} : query;
                url_query = jQuery.param(query)

                $http.get(base_url + '?' + url_query)
                    .success(function(data, status, headers, config) {
                        $scope.items = data.documents;
                    })
                    .error(function(data, status, headers, config) {
                        // log error
                    });
            }
        }

        return {
            getOutings : c2c_query('https://api.camptocamp.org/outings'),
            getImages : c2c_query('https://api.camptocamp.org/images'),
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
        }
    })

    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
