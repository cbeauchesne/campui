
app = angular.module('campui')

app.factory('wapi', ['$resource', function($resource){
    "use strict";

    return {
        document: $resource('/api/document/:name', {}, {
            get: {method: 'GET'},
//            raw: {method: 'GET', params: {view:"raw"}}, // not used
            update : {method: 'POST'},
            history : {method: 'GET', params: {view:"history"}}
        }),
        recentChanges : $resource('/api/recentchanges', {}, {
            get: {method: 'GET'},
        }),
    };
}]);