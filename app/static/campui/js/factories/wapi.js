
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

app.factory("namespaceTemplateUrl", [function(){
    return function(namespace){

        if(namespace=="Article")
            return 'static/campui/views/ns-templates/article.html'

        if(namespace=="Discussion")
            return 'static/campui/views/ns-templates/discussion.html'

        if(namespace=="Portal")
            return 'static/campui/views/ns-templates/portal.html'

        if(namespace=="diff")
            return 'static/campui/views/wapi/diff.html'

        if(namespace=="history")
            return 'static/campui/views/wapi/history.html'

        if(namespace=="create")
            return 'static/campui/views/wapi/create.html'

        if(namespace=="edit")
            return 'static/campui/views/wapi/edit.html'

        if(namespace=="contributions")
            return 'static/campui/views/wapi/contributions.html'

        if(namespace=="recentchanges")
            return 'static/campui/views/wapi/recentchanges.html'

        if(namespace=="statistics")
            return 'static/campui/views/statistics.html'

        if(namespace=="")
            return "static/campui/views/home.html"

        if(namespace=="outing") return "static/campui/views/outing.html"
        if(namespace=="route") return "static/campui/views/route.html"
        if(namespace=="waypoint") return "static/campui/views/waypoint.html"
        if(namespace=="area") return "static/campui/views/area.html"
        if(namespace=="article") return "static/campui/views/article.html"
        if(namespace=="xreport") return "static/campui/views/xreport.html"
        if(namespace=="book") return "static/campui/views/book.html"
        if(namespace=="user") return "static/campui/views/user.html"
        if(namespace=="image") return "static/campui/views/image.html"
        if(namespace=="outings") return "static/campui/views/c2c_items.html"
        if(namespace=="routes") return "static/campui/views/c2c_items.html"
        if(namespace=="waypoints") return "static/campui/views/c2c_items.html"
        if(namespace=="areas") return "static/campui/views/c2c_items.html"
        if(namespace=="articles") return "static/campui/views/c2c_items.html"
        if(namespace=="xreports") return "static/campui/views/c2c_items.html"
        if(namespace=="books") return "static/campui/views/c2c_items.html"
        if(namespace=="users") return "static/campui/views/c2c_items.html"
        if(namespace=="images") return "static/campui/views/c2c_items.html"

        return 'static/campui/views/ns-templates/article.html'
    }
}])