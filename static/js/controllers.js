
function c2cController($scope, c2cGet, user_params, columnDefs, c2c_item){

    $scope.label = c2c_item + "s"
    $scope.queries = user_params[c2c_item + "_queries"]
    $scope.columnDefs = columnDefs

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


function outingsController($scope, c2c, authState) {

    var columnDefs =  [
                          { name:'Date', field: 'date_start' , width: '10%'},
                          { name:'Title', field: 'locales[0].title', width: '*',
                          cellTemplate:'<div class="ui-grid-cell-contents"><a href="https://www.camptocamp.org/outings/{{row.entity.document_id}}">{{row.entity.locales[0].title}}</a></div>'},
                          { name:'Activities', field: 'activities', width: '10%',
                          cellTemplate:'<img ng-repeat="activity in row.entity.activities" alt="{{activity}}" ng-src="static/img/{{activity}}-24x24.png"/>'},
                          { name:'Author', field: 'author.name', width: '20%'}
                        ];

    c2cController($scope, c2c.outings.get, authState.user.profile.params, columnDefs, "outing");
}

function articlesController($scope, c2c, authState)  {
    c2cController($scope, c2c.articles.get, authState.user.profile.params, undefined, "article");
}

function Images($scope, c2c, authState) {
    c2cController($scope, c2c.images.get, authState.user.profile.params, undefined, "image");
}

function xreportsController($scope, c2c, authState) {
    columnDefs = [
                {  name:'Date', field: 'date' , width: '10%' },
                {   field: 'nb_impacted' , width: '10%' },
                {   field: 'severity' , width: '10%'},
                {
                    name:'Title', field: 'locales[0].title', width: '*',
                    cellTemplate:'<div class="ui-grid-cell-contents"><a href="https://www.camptocamp.org/xreports/{{row.entity.document_id}}">{{row.entity.locales[0].title}}</a></div>'
                },
                {   name:'Activities',
                    field: 'activities',
                    width: '10%',
                    cellTemplate:'<img ng-repeat="activity in row.entity.activities" alt="{{activity}}" ng-src="static/img/{{activity}}-24x24.png"/>'
                },
                {   name:'Type',
                    field: 'event_type',
                    width: '10%',
                    cellTemplate:'<span ng-repeat="type in row.entity.event_type">{{type}}</span>'
                },
                ];

    c2cController($scope, c2c.xreports.get, authState.user.profile.params, columnDefs, "xreport");
}


function routesController($scope, c2c, authState) {

    columnDefs = [
                {
                    name:'Title',
                    field: 'locales[0].title',
                    width: '*',
                    cellTemplate:'<div class="ui-grid-cell-contents"><a href="https://www.camptocamp.org/routes/{{row.entity.document_id}}">{{row.entity.locales[0].title}}</a></div>'
                },
                {
                    name:'Activities',
                    field: 'activities',
                    width: '15%',
                    cellTemplate:'<img ng-repeat="activity in row.entity.activities" alt="{{activity}}" ng-src="static/img/{{activity}}-24x24.png"/>'
                },
                { name:'Global rating', field: 'labande_global_rating', width: '15%'},
                ];

    c2cController($scope, c2c.routes.get, authState.user.profile.params, columnDefs, "route");
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
app.controller("images", Images);
app.controller("xreports", xreportsController);
app.controller("routes", routesController);
app.controller("routes", routesController);