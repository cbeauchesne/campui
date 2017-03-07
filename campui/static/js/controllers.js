

function Outings($scope, $http) {
  $http.get('https://api.camptocamp.org/outings').
    success(function(data, status, headers, config) {
        $scope.outings = data;

      $scope.columnDefs =  [
                              { name:'Date', field: 'date_start' , width: '10%'},
                              { name:'Title', field: 'locales[0].title', width: '*',
                              cellTemplate:'<div class="ui-grid-cell-contents"><a href="https://www.camptocamp.org/outings/{{row.entity.document_id}}">{{row.entity.locales[0].title}}</a></div>'},
                              { name:'Activities', field: 'activities', width: '10%',
                              cellTemplate:'<img ng-repeat="activity in row.entity.activities" alt="{{activity}}" ng-src="static/img/{{activity}}-24x24.png"/>'},
                              { name:'Author', field: 'author.name', width: '20%'}
                            ]


    }).
    error(function(data, status, headers, config) {
      // log error
    });
}

function Articles($scope, $http) {
  $http.get('https://api.camptocamp.org/articles').
    success(function(data, status, headers, config) {
      $scope.articles = data;
    }).
    error(function(data, status, headers, config) {
      // log error
    });
}

function Images($scope, $http) {
  $http.get('https://api.camptocamp.org/images').
    success(function(data, status, headers, config) {
      $scope.images = data;
    }).
    error(function(data, status, headers, config) {
      // log error
    });
}

function Xreports($scope, $http) {
  $http.get('https://api.camptocamp.org/xreports').
    success(function(data, status, headers, config) {
      $scope.xreports = data;
    }).
    error(function(data, status, headers, config) {
      // log error
    });
}


function Routes($scope, $http) {
  $http.get('https://api.camptocamp.org/routes').
    success(function(data, status, headers, config) {
      $scope.routes = data;

      $scope.columnDefs =  [
                              { name:'Title', field: 'locales[0].title', width: '*',
                              cellTemplate:'<div class="ui-grid-cell-contents"><a href="https://www.camptocamp.org/routes/{{row.entity.document_id}}">{{row.entity.locales[0].title}}</a></div>'},
                              { name:'Activities', field: 'activities', width: '15%',
                              cellTemplate:'<img ng-repeat="activity in row.entity.activities" alt="{{activity}}" ng-src="static/img/{{activity}}-24x24.png"/>'},
                              { name:'Global rating', field: 'labande_global_rating', width: '15%'}
                            ]

    }).
    error(function(data, status, headers, config) {
      // log error
    });
}


var app = angular.module('campui')

app.controller('MainCtrl', MainCtrl);
app.controller("outings", Outings);
app.controller("articles", Articles);
app.controller("images", Images);
app.controller("xreports", Xreports);
app.controller("routes", Routes);