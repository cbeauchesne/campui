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
            //abstract: true,
            url: "/",
            templateUrl: "static/views/dashboard.html",
        })

        .state('topos', {
            //abstract: true,
            url: "/topos",
            templateUrl: "static/views/topos.html",
        })

        .state('outings', {
            //abstract: true,
            url: "/outings",
            templateUrl: "static/views/outings.html",
        })
}
angular
    .module('campui')


    .config(config)
    .config(["$locationProvider", function($locationProvider) {
        $locationProvider.html5Mode(true);
        }])
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
