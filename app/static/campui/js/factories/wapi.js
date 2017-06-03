
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

        discussion : $resource('/api/discussion/:name', {}, {
            addSubject: {method: 'PUT'},
            addResponse : {method: 'POST'},
        }),
    };
}]);

app.factory("namespaceTemplateUrl", ["customization", function(customization){

    var templateUrls = {
        "" : "static/campui/views/home.html",
        "Article" : 'static/campui/views/ns-templates/article.html',
        "Discussion" : 'static/campui/views/ns-templates/discussion.html',
        "Portal" : 'static/campui/views/ns-templates/portal.html',
        "diff" : 'static/campui/views/wapi/diff.html',
        "history" : 'static/campui/views/wapi/history.html',
        "create" : 'static/campui/views/wapi/create.html',
        "edit" : 'static/campui/views/wapi/edit.html',
        "contributions" : 'static/campui/views/wapi/contributions.html',
        "recentchanges" : 'static/campui/views/wapi/recentchanges.html',
        "statistics" : 'static/campui/views/statistics.html',
        "outing" : "static/campui/views/outing.html",
        "route" : "static/campui/views/route.html",
        "waypoint" : "static/campui/views/waypoint.html",
        "area" : "static/campui/views/area.html",
        "article" : "static/campui/views/article.html",
        "xreport" : "static/campui/views/xreport.html",
        "book" : "static/campui/views/book.html",
        "user" : "static/campui/views/user.html",
        "image" : "static/campui/views/image.html",
        "outings" : "static/campui/views/c2c_items.html",
        "routes" : "static/campui/views/c2c_items.html",
        "waypoints" : "static/campui/views/c2c_items.html",
        "areas" : "static/campui/views/c2c_items.html",
        "articles" : "static/campui/views/c2c_items.html",
        "xreports" : "static/campui/views/c2c_items.html",
        "books" : "static/campui/views/c2c_items.html",
        "users" : "static/campui/views/c2c_items.html",
        "images" : "static/campui/views/c2c_items.html",
        "search" : "static/campui/views/search.html",
    }

    var customTemplateUrls = customization.templateUrls
    templateUrls = Object.assign(templateUrls, customTemplateUrls)

    return function(namespace){
        return  templateUrls[namespace] || 'static/campui/views/ns-templates/article.html'
    }
}])