
function c2cController($scope, c2c, user_params, columnDefs, c2c_item){

    c2cGet = c2c[c2c_item + "s"].get
    $scope.label = c2c_item + "s"
    $scope.queries = user_params[c2c_item + "_queries"]
    $scope.columnDefs = columnDefs[c2c_item]

    $scope.setQuery = function(query){
        $scope.currentQuery = query

        query = (typeof query === 'undefined') ? {} : query;

        var output = [];
        for (var prop in query) {
            if (query.hasOwnProperty(prop)) {
                value = query[prop];
                if(value.constructor === Array)
                    output.push(prop + '=' + query[prop].join(','));
                else
                    output.push(prop + '=' + value);
            }
        }
        url_query =  output.join('&');

        $scope.data = c2cGet({query:url_query})
    }

    queries = (typeof $scope.queries === 'undefined') ? {} : $scope.queries;
    $scope.setQuery(queries[user_params[c2c_item + "DefaultQuery"]])
}


function outingsController($scope, c2c, authState, columnDefs) {
    c2cController($scope, c2c, authState.user.profile.params, columnDefs, "outing");
}

function articlesController($scope, c2c, authState, columnDefs)  {
    c2cController($scope, c2c, authState.user.profile.params, columnDefs, "article");
}

function imagesController($scope, c2c, authState, columnDefs) {
    c2cController($scope, c2c, authState.user.profile.params, columnDefs, "image");
}

function xreportsController($scope, c2c, authState, columnDefs) {
    c2cController($scope, c2c, authState.user.profile.params, columnDefs, "xreport");
}

function routesController($scope, c2c, authState, columnDefs) {
    c2cController($scope, c2c, authState.user.profile.params, columnDefs, "route");
}


function authController($scope, api, authState, $http) {

//        $('#id_auth_form input').checkAndTriggerAutoFillEvent();

    $scope.authState = authState;

    $scope.getCredentials = function(){
        return {username: $scope.username, password: $scope.password};
    };

    $scope.login = function(){
        creds = $scope.getCredentials();
        $http.defaults.headers.common.Authorization = ('Basic ' + btoa(creds.username +
                                    ':' + creds.password));
        api.auth.login(creds).
            $promise.
                then(function(data){
                    delete $http.defaults.headers.common.Authorization;
                    authState.user = api.user.get({username:data.username});
                }).
                catch(function(data){
                    delete $http.defaults.headers.common.Authorization;
                    alert(data.data.detail);
                });
    };
    $scope.logout = function(){
        api.auth.logout(function(){
            authState.user = authState.userAnonymous;
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
}


var app = angular.module('campui')

app.controller('authController', authController)
app.controller("outings",outingsController);
app.controller("articles", articlesController);
app.controller("images", imagesController);
app.controller("xreports", xreportsController);
app.controller("routes", routesController);
app.controller("routes", routesController);