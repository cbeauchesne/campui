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

        .state('login', {
            url: "/login",
            templateUrl: "static/views/login.html",
        })

        .state('register', {
            url: "/register",
            templateUrl: "static/views/register.html",
            controller: 'RegisterController',
            controllerAs: 'vm'
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

    .service('authState', function () {
        return {
            user: undefined
        };
    })

    .factory('api', function($resource, $http){
        function add_auth_header(data, headersGetter){
            $http.defaults.headers.common['Authorization'] = ('Basic ' + btoa(data.username +
                                        ':' + data.password));
        }
        return {
            auth: $resource('/api/auth\\/', {}, {
                login:  {method: 'POST', transformRequest: add_auth_header},
                logout: {method: 'DELETE'}
            }),
            users: $resource('/api/users\\/', {}, {
                create: {method: 'POST'}
            }),
        };
    })

    .controller('authController', function($scope, api, authState) {

//        $('#id_auth_form input').checkAndTriggerAutoFillEvent();

        $scope.authState = authState;

        $scope.getCredentials = function(){
            return {username: $scope.username, password: $scope.password};
        };
        $scope.login = function(){
            api.auth.login($scope.getCredentials()).
                $promise.
                    then(function(data){
                        authState.user = data.username;
                    }).
                    catch(function(data){
                        alert(data.data.detail);
                    });
        };
        $scope.logout = function(){
            api.auth.logout(function(){
                authState.user = undefined;
            });
        };
        $scope.register = function($event){
            $event.preventDefault();
            api.users.create($scope.getCredentials()).
                $promise.
                    then($scope.login).
                    catch(function(data){
                        alert(data.data.username);
                    });
        };
    })

    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
