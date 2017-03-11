

function Outings($scope, c2c, queries) {

    $scope.queries = queries.outings

    $scope.setQuery = function(query){
        c2c.getOutings($scope, query);
    }

    $scope.columnDefs =  [
                          { name:'Date', field: 'date_start' , width: '10%'},
                          { name:'Title', field: 'locales[0].title', width: '*',
                          cellTemplate:'<div class="ui-grid-cell-contents"><a href="https://www.camptocamp.org/outings/{{row.entity.document_id}}">{{row.entity.locales[0].title}}</a></div>'},
                          { name:'Activities', field: 'activities', width: '10%',
                          cellTemplate:'<img ng-repeat="activity in row.entity.activities" alt="{{activity}}" ng-src="static/img/{{activity}}-24x24.png"/>'},
                          { name:'Author', field: 'author.name', width: '20%'}
                        ]

    c2c.getOutings($scope);
}

function Articles($scope, c2c, queries)  {
    $scope.queries = queries.articles;
    $scope.setQuery = function(query){
        c2c.getArticles($scope, query);
    }

    c2c.getArticles($scope);
}

function Images($scope, c2c, queries) {
    $scope.queries = queries.images;
    $scope.setQuery = function(query){
        c2c.getImages($scope, query);
    }

    c2c.getImages($scope);
}

function Xreports($scope, c2c, queries) {
    $scope.queries = queries.xreports;
    $scope.setQuery = function(query){
        c2c.getXreports($scope, query);
    }

    $scope.columnDefs = [
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
                        ]

    c2c.getXreports($scope);
}


function Routes($scope, c2c, queries) {
    $scope.queries = queries.routes;
    $scope.setQuery = function(query){
        c2c.getRoutes($scope, query);
    }

    $scope.columnDefs = [
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
                        ]

    c2c.getRoutes($scope);
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
app.controller("outings", Outings);
app.controller("articles", Articles);
app.controller("images", Images);
app.controller("xreports", Xreports);
app.controller("routes", Routes);