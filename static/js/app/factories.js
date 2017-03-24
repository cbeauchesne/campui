app = angular.module('campui')

app.factory('api', function($resource){
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
        }),
        currentUser: $resource('/api/current_user', {}, {
            get: {method: 'GET'},
            save: {method: 'PUT'},
        }),
    };
});

app.factory('currentUser', function(api){
    return api.currentUser.get();
})

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
        route: $resource('https://api.camptocamp.org/routes/:id', {},{
            get : {method: 'GET'}
        }),
    }
});

app.factory('columnDefs', function(){
    return {
        outing:[{ name:'Date', field: 'date_start' , width: '10%'},
                {
                    name:'Title', field: 'locales[0].title', width: '*',
                    cellTemplate:'<outing-link outing="row.entity" class="ui-grid-cell-contents"/>',
                },
                {
                    name:'Activities', field: 'activities', width: '10%',
                    cellTemplate:'<activities activities="row.entity.activities" class="ui-grid-cell-contents"/>'
                },
                { name:'Author', field: 'author.name', width: '20%'}
        ],

        xreport:[{  name:'Date', field: 'date' , width: '10%' },
                 {   field: 'nb_impacted' , width: '10%' },
                 {   field: 'severity' , width: '10%'},
                 {
                     name:'Title',
                     width: '*',
                     cellTemplate:'<xreport-link xreport="row.entity" class="ui-grid-cell-contents"/>',
                 },
                 {   name:'Activities',
                     field: 'activities',
                     width: '10%',
                     cellTemplate:'<activities activities="row.entity.activities" class="ui-grid-cell-contents"/>',
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
                    width: '*',
                    cellTemplate:'<route-link route="row.entity" class="ui-grid-cell-contents"/>',
                },
                {
                    name:'Activities',
                    field: 'activities',
                    width: '15%',
                    cellTemplate:'<activities activities="row.entity.activities" class="ui-grid-cell-contents"/>',
                },
                {
                    name:'Rating',
                    width: '15%',
                    cellTemplate:'<rating route="row.entity" class="ui-grid-cell-contents"/>',
                 },
                {
                    name:'Orientations',
                    width: '15%',
                    field: 'orientations',
                 },
        ],

        article:[
                {
                    name:'Title',
                    cellTemplate:'<article-link article="row.entity" class="ui-grid-cell-contents"/>',
                },
                {
                    name:'Activities',
                    field: 'activities',
                    width: '20%',
                    cellTemplate:'<activities activities="row.entity.activities" class="ui-grid-cell-contents"/>',
                },
                {
                    field: 'quality',
                    width: '15%',
                },
                {
                    field: 'categories',
                    width: '15%',
                },
        ],
    }
})