/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 */

/**
 * MainCtrl - controller
 */
function MainCtrl() {
    this.userName = 'Example user';
    this.helloText = 'Welcome in SeedProject';
    this.descriptionText = 'It is an application skeleton for a typical AngularJS web app. You can use it to quickly bootstrap your angular webapp projects and dev environment for these projects.';
};

function Outings($scope, $http) {
  $http.get('https://api.camptocamp.org/outings').
    success(function(data, status, headers, config) {
      $scope.outings = data;
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

var app = angular.module('campui')

app.controller('MainCtrl', MainCtrl);
app.controller("outings", Outings);
app.controller("articles", Articles);
app.controller("images", Images);
app.controller("xreports", Xreports);
