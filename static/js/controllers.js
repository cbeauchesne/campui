
function c2cController($scope, c2cGet, queries, columnDefs, label){

    $scope.label = label
    $scope.queries = queries
    $scope.columnDefs = columnDefs

    $scope.setQuery = function(query){
        $scope.currentQuery = query
        c2cGet($scope, query);
    }

    $scope.setQuery()
}


function outingsController($scope, c2c, queries) {

    var columnDefs =  [
                          { name:'Date', field: 'date_start' , width: '10%'},
                          { name:'Title', field: 'locales[0].title', width: '*',
                          cellTemplate:'<div class="ui-grid-cell-contents"><a href="https://www.camptocamp.org/outings/{{row.entity.document_id}}">{{row.entity.locales[0].title}}</a></div>'},
                          { name:'Activities', field: 'activities', width: '10%',
                          cellTemplate:'<img ng-repeat="activity in row.entity.activities" alt="{{activity}}" ng-src="static/img/{{activity}}-24x24.png"/>'},
                          { name:'Author', field: 'author.name', width: '20%'}
                        ];

    c2cController($scope, c2c.getOutings, queries.outings, columnDefs, "Outings");
}

function articlesController($scope, c2c, queries)  {
    c2cController($scope, c2c.getArticles, queries.articles, undefined, "Articles");
}

function Images($scope, c2c, queries) {
    c2cController($scope, c2c.getImages, queries.images);
}

function xreportsController($scope, c2c, queries) {
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

    c2cController($scope, c2c.getXreports, queries.xreports, columnDefs, "Incidents and accidents");
}


function routesController($scope, c2c, queries) {

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

    c2cController($scope, c2c.getRoutes, queries.xreports, columnDefs, "Routes");
}

function authController($scope, api, authState, $http) {

//        $('#id_auth_form input').checkAndTriggerAutoFillEvent();

        $scope.authState = authState;

        $scope.getCredentials = function(){
            return {username: $scope.username, password: $scope.password};
        };

        $scope.login = function(){
            creds = $scope.getCredentials();
            $http.defaults.headers.common['Authorization'] = ('Basic ' + btoa(creds.username +
                                        ':' + creds.password));
            api.auth.login(creds).
                $promise.
                    then(function(data){
                        authState.user = {username:data.username};
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
    }


var app = angular.module('campui')

app.controller('authController', authController)
app.controller("outings",outingsController);
app.controller("articles", articlesController);
app.controller("images", Images);
app.controller("xreports", xreportsController);
app.controller("routes", routesController);