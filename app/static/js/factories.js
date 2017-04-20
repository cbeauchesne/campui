app = angular.module('campui')

app.factory('api', ['$resource', function($resource){
    return {
        auth: $resource('/api/auth', {}, {
            login:  {method: 'POST'},
            logout: {method: 'DELETE'},
        }),
        users: $resource('/api/users', {}, {
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
}]);

app.factory('anonymousProfile', ["gettextCatalog", function(gettextCatalog){
    profile = {
        params:{
            queries:[]
        }
    }

    activities = ["skitouring",
        "snow_ice_mixed",
        "mountain_climbing",
        "rock_climbing",
        "ice_climbing",
        "hiking",
        "snowshoeing",
        "paragliding",
        "mountain_biking",
        "via_ferrata"]

    activities.forEach(function(activity){
        profile.params.queries.push({
            "name": gettextCatalog.getString(activity),
            "url": "act=" + activity,
        })
    })

    return profile

}])

app.factory('currentUser', ["api", "anonymousProfile", function(api, anonymousProfile){


    user = api.currentUser.get(function(data){
        setUser(user)
        user.profile = data.profile || {}
        user.profile.params = user.profile.params || {}
        user.profile.params.queries = user.profile.params.queries || []

        if(data.username != ""){
            user.isAnonymous = false

            user.save = function(){
                user.saving = true;
                api.currentUser.save({profile:user.profile},
                    function(){
                        delete user.saving;
                        delete user.errors;
                    },
                    function(response){
                        delete user.saving;
                        user.errors = response;
                    }
                );
            };
        }
    });

    user.isAnonymous = true
    user.profile = anonymousProfile

    function setUser(user){

    user.getQueryIndex = function(query){
        return user.profile.params.queries.indexOf(query)
    }

    user.addQuery = function(query){
        query=query || {}
        user.profile.params.queries.push(query)
    }

    user.deleteQuery = function(query){
        index = user.getQueryIndex(query);

        if(index != -1) {
            delete query.name
            delete query.url
            user.profile.params.queries.splice(index, 1);
        }

        user.save()
    }

    user.save = function(){
    };
}
    setUser(user)
    return user
}]);

app.factory('locale', ['gettextCatalog', function(gettextCatalog){
    return {
        get : function(item){
            if(!item || ! item.locales)
                return {}

            var lang = gettextCatalog.getCurrentLanguage()
            var locale = item.locales[0]

            item.locales.forEach(function(l){
                if(l.lang == lang)
                    locale = l
            })

            return locale
        }
    }
}])

app.factory('c2cBeta', ['c2c', function(c2c){
    return {
        outings : {
            get : function(paramters){
                var result = {documents:[]}
                c2c.outings.get(paramters, function(response){
                    response.documents.forEach(function(item){
                        result.documents.push(c2c.outing.get({id:item.document_id}))
                    })
                })
                return result
            }
        }
    }

}]);

app.factory('c2c', ['$resource','gettextCatalog', function($resource, gettextCatalog){

    var result = {}

    $.each(c2cItems, function(item, params) {
        _item = item == 'user' ? 'profile' : item

        result[item] = $resource('https://api.camptocamp.org/' + _item + 's/:id',
                                {pl:function(){return gettextCatalog.getCurrentLanguage()}},
                                {
                                    get : {method: 'GET'}
                                })

        result[item + 's'] = $resource('https://api.camptocamp.org/' + _item + 's?:query', {query:''},{
            get : {method: 'GET'}
        })
    })


    //https://api.camptocamp.org/search?q=tacul&pl=fr&limit=7&t=w,r,c,b
    result.search = $resource('https://api.camptocamp.org/search?limit=15&t=w,r,a&q=:q',
                                {pl:function(){return gettextCatalog.getCurrentLanguage()}},
                                {
                                    get : {method: 'GET'}
                                })

    forum = {}

    result.forum = forum

    forum.latest_topics = $resource('https://forum.camptocamp.org/latest.json', {},
                                {
                                    get : {method: 'GET'}
                                })

    forum.top_topics = $resource('https://forum.camptocamp.org/top.json', {},
                                {
                                    get : {method: 'GET'}
                                })

    return result;
}]);

app.factory('searchData', function(){
    return {
        query:"",
        result:undefined
    }
});

app.service('photoswipe', ["locale", function(locale){
    _this = this

    // https://github.com/dimsemenov/PhotoSwipe/issues/580
    // history is important, see comment of mutac
    _this.opts={
        index:0,
        history:false
    }

    _this.getImages = undefined

    _this.showGallery = function (i) {
        _this.opts.index = i;
        _this.slides = []
        _this.getImages().forEach(function (image) {
            _this.slides.push({
                src:"https://media.camptocamp.org/c2corg_active/" + image.filename.replace('.', 'BI.').replace('.svg', '.jpg'),
                w:0,h:0,
                title:locale.get(image).title,
                document_id:image.document_id,
            })
        })
        _this.open = true;
    }

    _this.closeGallery = function () {
        _this.open = false;
    };
}]);

app.factory("urlQuery", ['$location', function($location){

    var getCurrent = function(){
        return fromObject($location.search())
    }

    var fromObject = function(object){
        var temp = {}
        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {
                if(Array.isArray(object[prop])){
                    if(object[prop].length!=0)
                        temp[prop] = object[prop].join(",")
                    }
                 else if(typeof object[prop] !== "undefined")
                    temp[prop] = object[prop]
            }
        }
        return $.param( temp ).replace(/%2C/g,",")
    }

    var toObject = function(query) {
        var query_string = {};
        var vars = query.split("&");

        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");

            if(pair.length==1){
                query_string[pair[0]] = undefined
            }
            else{
                pair[0] = decodeURIComponent(pair[0]);
                pair[1] = decodeURIComponent(pair[1]);
                query_string[pair[0]] = pair[1]
            }
        }

        if(query_string.act)
            query_string.act = query_string.act.split(",")

        items =['a','r','w']

        items.forEach(function(t){
            if(query_string[t]){
                query_string[t] = query_string[t].split(",").map(function(item) {
                    return parseInt(item, 10);
                });
            }
        })

        return query_string;
    };

    return {
        getCurrent:getCurrent,
        fromObject:fromObject,
        toObject:toObject,
    }
}])

app.factory('columnDefs', ['gettextCatalog', 'locale',function(gettextCatalog, locale){
    var areaSortingAlgorithm = function(a, b, rowA, rowB, direction){

        areaA = rowA.entity.areas[rowA.entity.areas.length-1]
        areaB = rowB.entity.areas[rowB.entity.areas.length-1]

        titleA = locale.get(areaA).title
        titleB = locale.get(areaB).title
        if (titleA == titleB) return 0;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
    }


    var areasSortingAlgorithm = function(a, b, rowA, rowB, direction){

        areasA = rowA.entity.areas
        areasB = rowB.entity.areas

        for(i=0;i<areasA.length && i<areasB.length;i++){
            titleA = locale.get(areasA[i]).title
            titleB = locale.get(areasB[i]).title
            if (titleA < titleB) return -1;
            if (titleA > titleB) return 1;
        }

        if(areasA.length == areasB.length)
            return 0

        if(areasA.length < areasB.length)
            return -1

        //if(areasA.length > areasB.length)
        return 1
    };

    return {
        outing:[{ name:'Date', field: 'date_start' , width: '10%'},
                {
                    name:gettextCatalog.getString('Title'),
                    field: 'locales[0].title',
                    width: '*',
                    cellTemplate:'<outing-link outing="row.entity" class="ui-grid-cell-contents"></outing-link>',
                },
                {
                    name:gettextCatalog.getString('Activities'),
                    field: 'activities',
                    width: '10%',
                    cellTemplate:'<div class="ui-grid-cell-contents"><activities activities="row.entity.activities"></activities></div>'
                },
                {
                    name:gettextCatalog.getString('Area'),
                    sortingAlgorithm : areaSortingAlgorithm,
                    width: '15%',
                    cellTemplate:'<area-link class="ui-grid-cell-contents" area="row.entity.areas[row.entity.areas.length-1]"></area-link>',
                },
                {
                    name:'C',
                    width: '5%',
                    field: 'condition_rating',
                    cellTemplate:'<div class="ui-grid-cell-contents"><condition-icon condition="row.entity.condition_rating"></condition-icon></div>'
                },
                {
                    name:gettextCatalog.getString('Height'),
                    width: '8%',
                    field: 'height_diff_up',
                },
                {
                    name:gettextCatalog.getString('Author'),
                    field: 'author.name',
                    width: '15%',
                    cellTemplate:'<author-link author="row.entity.author" class="ui-grid-cell-contents"></author-link>',
                }
        ],

        xreport:[
                 {
                     name:gettextCatalog.getString('Title'),
                     field: 'locales[0].title',
                     width: '*',
                     cellTemplate:'<xreport-link-c2c xreport="row.entity" class="ui-grid-cell-contents"/>',
                 },
                 {
                    name:gettextCatalog.getString('Date'),
                    field: 'date' ,
                    width: '10%'
                 },
                 {
                    name:gettextCatalog.getString('Impacted people'),
                    field: 'nb_impacted' ,
                    width: '10%'
                 },
                 {
                    name:gettextCatalog.getString('Severity'),
                    field: 'severity' ,
                    width: '10%'
                 },
                 {
                     name:gettextCatalog.getString('Activities'),
                     field: 'activities',
                     width: '10%',
                     cellTemplate:'<div class="ui-grid-cell-contents"><activities activities="row.entity.activities" /></div>',
                 },
                 {
                    name:gettextCatalog.getString('Event type'),
                    field:'event_type',
                    width: '10%',
                    cellTemplate:'<span ng-repeat="type in row.entity.event_type">{{type}}</span>'
                 },
        ],

        route:[
            {
                name:gettextCatalog.getString('Title'),
                field: 'locales[0].title',
                width: '*',
                cellTemplate:'<route-link route="row.entity" class="ui-grid-cell-contents"/>',
            },
            {
                name:gettextCatalog.getString('Activities'),
                field: 'activities',
                width: '10%',
                cellTemplate:'<div  class="ui-grid-cell-contents"><activities activities="row.entity.activities"></activities></div>',
            },
            {
                name:gettextCatalog.getString('Area'),
                sortingAlgorithm : areaSortingAlgorithm,
                width: '15%',
                cellTemplate:'<area-link class="ui-grid-cell-contents" area="row.entity.areas[row.entity.areas.length-1]"></area-link>',
            },
            {
                name:gettextCatalog.getString('Rating'),
                field:"global_rating",
                width: '15%',
                cellTemplate:'<rating route="row.entity" class="ui-grid-cell-contents"/>',
            },
            {
                name:gettextCatalog.getString('Height diff'),
                field:"height_diff_difficulties",
                width: '10%',
            },
            {
                name:gettextCatalog.getString('Orientations'),
                width: '10%',
                field: 'orientations',
            },
        ],

        article:[
            {
                name:gettextCatalog.getString('Title'),
                field: 'locales[0].title',
                cellTemplate:'<article-link-c2c article="row.entity" class="ui-grid-cell-contents"></article-link-c2c>',
            },
            {
                name:gettextCatalog.getString('Activities'),
                field: 'activities',
                width: '20%',
                cellTemplate:'<activities activities="row.entity.activities"></activities>',
            },
            {
                name:gettextCatalog.getString('Quality'),
                field: 'quality',
                width: '15%',
            },
            {
                name:gettextCatalog.getString('Categories'),
                field: 'categories',
                width: '15%',
            },
        ],

        waypoint:[
            {
                name:gettextCatalog.getString("Name"),
                field: 'locales[0].title',
                cellTemplate:'<waypoint-link waypoint="row.entity" class="ui-grid-cell-contents"/>',
            },
            {
                name:gettextCatalog.getString("Areas"),
                field:'areas',
                sortingAlgorithm : areasSortingAlgorithm,
                cellTemplate:'<div class="ui-grid-cell-contents"><areas areas="row.entity.areas" ></areas></div>',
            },
            {
                name:gettextCatalog.getString("Elevation"),
                field:"elevation",
                width: '10%',
            },
            {
                name:gettextCatalog.getString("Type"),
                field:"waypoint_type",
                width: '15%',
            },
        ],

        area:[
            {
                name:gettextCatalog.getString("Name"),
                field: 'locales[0].title',
                cellTemplate:'<area-link area="row.entity" class="ui-grid-cell-contents"/>',
            },
            {
                name:gettextCatalog.getString("Type"),
                field:"area_type",
                width: '15%',
            },
        ]

    }
}])

