
function getC2cController(c2c_item){

    return function($scope, c2c, currentUser, columnDefs){

        $scope.label = c2c_item + "s"

        $scope.setQuery = function(query){
            $scope.currentQuery = query

            query = (typeof query === 'undefined') ? {} : query;
            url_query = (typeof query.url === 'undefined') ? "" : query.url;

            c2c[c2c_item + "s"].get({query:query.url},
                (data) => {
                    $scope.data = data
                    delete $scope.error
                },
                (response) => {
                    $scope.error = "CampToCamp error"
                })
        }

        currentUser.$promise.then(function(){
            user_params = currentUser.profile.params;
            $scope.queries = user_params.queries;
            $scope.columnDefs = columnDefs[c2c_item]
            queries = (typeof $scope.queries === 'undefined') ? {} : $scope.queries;
            $scope.setQuery(queries[user_params[c2c_item + "DefaultQuery"]])
        })
    }
}

function authController($scope, api, currentUser, $http) {

//        $('#id_auth_form input').checkAndTriggerAutoFillEvent();

    $scope.currentUser = currentUser;

    $scope.getCredentials = function(){
        return {username: $scope.username, password: $scope.password};
    };

    $scope.login = function(){
        creds = $scope.getCredentials();
        $http.defaults.headers.common.Authorization = ('Basic ' + btoa(creds.username +
                                    ':' + creds.password));
        api.auth.login(creds).$promise.
                then(function(data){
                    delete $http.defaults.headers.common.Authorization;
                    currentUser.username = data.username
                    currentUser.profile = data.profile
                }).
                catch(function(data){
                    delete $http.defaults.headers.common.Authorization;
                    alert(data.data.detail);
                });
    };

    $scope.logout = function(){
        api.auth.logout(function(){
            currentUser.username = undefined
            currentUser.profile = {params:{}}

        });
    };
}


var app = angular.module('campui')

app.controller('authController', authController)

app.controller("outingsController",getC2cController('outing'));
app.controller("articlesController", getC2cController('article'));
app.controller("imagesController", getC2cController('image'));
app.controller("xreportsController", getC2cController('xreport'));
app.controller("routesController", getC2cController('route'));
app.controller("waypointsController", getC2cController('waypoint'));