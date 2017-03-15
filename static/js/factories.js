app = angular.module('campui')

app.factory('api', function($resource, $http){
    return {
        auth: $resource('/api/auth\\/', {}, {
            login:  {method: 'POST'},
            logout: {method: 'DELETE'},
        }),
        users: $resource('/api/users\\/', {}, {
            create: {method: 'POST'},
        }),
        user: $resource('/api/user/:username', {}, {
            get: {method: 'GET'},
            save: {method: 'PUT'},
        }),
    };
});

app.factory('c2c', function($resource){
    return {
        outings: $resource('https://api.camptocamp.org/outings?:query', {query:''},{
            get : {method: 'GET'}
        }),
        images: $resource('https://api.camptocamp.org/images?:query', {query:''},{
            get : {method: 'GET'}
        }),
        xreports: $resource('https://api.camptocamp.org/xreports?:query', {query:''},{
            get : {method: 'GET'}
        }),
        routes: $resource('https://api.camptocamp.org/routes?:query', {query:''},{
            get : {method: 'GET'}
        }),

        articles: $resource('https://api.camptocamp.org/articles?:query', {query:''},{
            get : {method: 'GET'}
        }),
        outing: $resource('https://api.camptocamp.org/outings/:id', {},{
            get : {method: 'GET'}
        }),
    }
});

app.factory('columnDefs', function(){
    return {
        outing:[{ name:'Date', field: 'date_start' , width: '10%'},
                {
                    name:'Title', field: 'locales[0].title', width: '*',
                    cellTemplate:'<div class="ui-grid-cell-contents"><a href="https://www.camptocamp.org/outings/{{row.entity.document_id}}">{{row.entity.locales[0].title}}</a></div>'
                },
                {
                    name:'Activities', field: 'activities', width: '10%',
                    cellTemplate:'<img ng-repeat="activity in row.entity.activities" alt="{{activity}}" ng-src="static/img/{{activity}}-24x24.png"/>'
                },
                { name:'Author', field: 'author.name', width: '20%'}
        ],

        xreport:[{  name:'Date', field: 'date' , width: '10%' },
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
        ],

        route:[
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
        ],
    }
})