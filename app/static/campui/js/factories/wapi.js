
app = angular.module('campui')

app.factory('wapi', ['$resource', function($resource){
    "use strict";

    return {
        document: $resource('/api/document/:name', {}, {
            get: {method: 'GET'},
            update : {method: 'POST'},
            create : {method: 'PUT'},
            history : {method: 'GET', params: {view:"history"}}
        }),

        recentChanges : $resource('/api/recentchanges', {}, {
            get: {method: 'GET'},
        }),

        contributions : $resource('/api/contributions/:username', {}, {
            get: {method: 'GET'},
        }),
    };
}]);