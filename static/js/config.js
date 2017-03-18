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
            controller: "routesController",
        })

        .state('outings', {
            url: "/outings",
            templateUrl: "static/views/c2c_items.html",
            controller: "outingsController",
        })

        .state('xreports', {
            url: "/xreports",
            templateUrl: "static/views/c2c_items.html",
            controller: "xreportsController",
        })

        .state('articles', {
            url: "/articles",
            templateUrl: "static/views/c2c_items.html",
            controller: "articlesController",
        })

        .state('credits', {
            url: "/credits",
            templateUrl: "static/views/credits.html",
        })

        .state('route', {
            url: "/route/{id}",
            templateUrl: "static/views/route.html",
            controller: function($scope, $stateParams, c2c){
                $scope.route = c2c.route.get($stateParams)
            },
        })

        .state('me', {
            url: "/me",
            templateUrl: 'static/views/me.html',
            controller: function($scope, api, c2c, currentUser){
                currentUser.$promise.then(function(){
                    $scope.user = jQuery.extend(true, {}, currentUser);
                    params = $scope.user.profile.params;

                    json_props = ["outing_queries","xreport_queries","image_queries","route_queries"]

                    for (i = 0; i < json_props.length; ++i)
                        if(params[json_props[i]])
                            params["_" + json_props[i]] = JSON.stringify(params[json_props[i]], null, 2);

                    $scope.save = function(){
                        for (i = 0; i < json_props.length; ++i)
                            if(params["_" + json_props[i]])
                                params[json_props[i]] = JSON.parse(params["_" + json_props[i]]);

                        api.currentUser.save($scope.user, function(){
                            currentUser.profile = $scope.user.profile;
                        });
                    };
                })
            }
        })

        .state('user', {
            url: "/user/{username}",
            templateUrl: 'static/views/user.html',
            controller: function($scope, $stateParams, api, c2c){

                $scope.user = api.user.get({username:$stateParams.username}, function() {
                    params = $scope.user.profile.params;
                    $scope.outings = c2c.outings.get({query:"u=" + params.c2c_id})
                });
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


    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
