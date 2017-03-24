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

    $.each(c2cItems, (item, params) => {

        params.detailled_controller = params.detailled_controller ? params.detailled_controller : function($scope, $stateParams, c2c){
                $scope[item] = c2c[item].get($stateParams)
            }

        $stateProvider.state(item, {
            url: "/" + item + "/{id}",
            templateUrl: "static/views/" + item + ".html",
            controller: params.detailled_controller,
        })

        $stateProvider.state(item + 's', {
            url: "/" + item + "s",
            templateUrl: "static/views/c2c_items.html",
            controller: item + "sController",
        })
    });

    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "static/views/home.html",
        })

        .state('credits', {
            url: "/credits",
            templateUrl: "static/views/credits.html",
        })

        .state('me', {
            url: "/me",
            templateUrl: 'static/views/me.html',
            controller: function($scope, api, c2c, currentUser){
                currentUser.$promise.then(function(){
                    $scope.errors = {}
                    $scope.user = jQuery.extend(true, {}, currentUser);
                    params = $scope.user.profile.params;

                    if(params.queries)
                        params._queries = JSON.stringify(params.queries, null, 2);

                    $scope.save = function(){
                        if(params._queries)
                        try{
                            params.queries = JSON.parse(params._queries);
                        }
                        catch (err){
                            $scope.errors.queries = err.message;
                            return
                        }

                        $scope.saving = true;
                        api.currentUser.save($scope.user,
                            function(){
                                currentUser.profile = $scope.user.profile;
                                delete $scope.saving;
                                delete $scope.errors;
                            },
                            function(response){
                                delete $scope.saving;
                                $scope.errors.global = response;
                            }
                        );
                    };
                })
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

        //scroll top when state change
        $rootScope.$on('$stateChangeSuccess', function() {
           document.body.scrollTop = document.documentElement.scrollTop = 0;
        });

    });
