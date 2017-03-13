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

        .state('articles', {
            url: "/articles",
            templateUrl: "static/views/c2c_items.html",
            controller: articlesController,
        })

        .state('credits', {
            url: "/credits",
            templateUrl: "static/views/credits.html",
        })

        .state('user', {
            url: "/user/{username}",
            templateUrl: 'static/views/user.html',
            controller: function($scope, $stateParams, api, c2c, authState){

                json_props = ["outing_queries","xreport_queries","image_queries","route_queries"]

                $scope.user = api.user.get({username:$stateParams.username}, function() {
                        params = $scope.user.profile.params;

                        $scope.outings = c2c.outings.get({query:"u=" + params.c2c_id})

                        for (i = 0; i < json_props.length; ++i)
                            if(params[json_props[i]])
                                params["_" + json_props[i]] = JSON.stringify(params[json_props[i]], null, 2);
                    }
                );

                $scope.save = function(){

                    params = $scope.user.profile.params;

                    for (i = 0; i < json_props.length; ++i)
                        if(params["_" + json_props[i]])
                            params[json_props[i]] = JSON.parse(params["_" + json_props[i]], null, 2);

                    api.user.save({username:$stateParams.username}, $scope.user, function(){
                        if($stateParams.username==authState.user.username)
                            authState.user.profile = $scope.user.profile;
                    });
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
            outing: $resource('https://api.camptocamp.org/outings/:id', {},{
                get : {method: 'GET'}
            }),
        }
    })

    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
