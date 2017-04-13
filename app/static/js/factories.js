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
    user = api.currentUser.get(function(){
        if(user.username === ""){
            user.isAnonymous = true
            user.profile = anonymousProfile
        }
        else {
            user.isAnonymous = false

            user.profile = user.profile || {}
            user.profile.params = user.profile.params || {}
            user.profile.params.queries = user.profile.params.queries || []

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
            }
        }
    },
    function(){
        user.isAnonymous = true
        user.profile = anonymousProfile
    });

    user.isAnonymous = true

    return user
}]);

app.factory('locale', ['gettextCatalog', function(gettextCatalog){
    return {
        get : function(item){
            if(!item)
                return {}

            lang = gettextCatalog.getCurrentLanguage()
            locale = item.locales.find(function(locale){return locale.lang == lang})
            if(locale)
                return locale
            else
                return item.locales[0]
        }
    }
}])

app.factory('c2c', ['$resource','gettextCatalog', function($resource, gettextCatalog){

    result = {}

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
    result.search = $resource('https://api.camptocamp.org/search?limit=15&t=w,r&q=:q',
                                {pl:function(){return gettextCatalog.getCurrentLanguage()}},
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
        return $.param( object )
    }

    var toObject = function(query) {
        var query_string = {};
        var vars = query.split("&");

        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            pair[0] = decodeURIComponent(pair[0]);
            pair[1] = decodeURIComponent(pair[1]);
                // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]], pair[1] ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    };

    return {
        getCurrent:getCurrent,
        fromObject:fromObject,
        toObject:toObject,
    }
}])

app.factory('columnDefs', ['gettextCatalog', function(gettextCatalog){
    return {
        outing:[{ name:'Date', field: 'date_start' , width: '10%'},
                {
                    name:gettextCatalog.getString('Title'),
                    width: '*',
                    cellTemplate:'<outing-link outing="row.entity" class="ui-grid-cell-contents"></outing-link>',
                },
                {
                    name:gettextCatalog.getString('Activities'),
                    width: '10%',
                    cellTemplate:'<div class="ui-grid-cell-contents"><activities activities="row.entity.activities"></activities></div>'
                },
                {
                    name:'C',
                    width: '5%',
                    cellTemplate:'<div class="ui-grid-cell-contents"><condition-icon condition="row.entity.condition_rating"></condition-icon></div>'
                },
                {
                    name:gettextCatalog.getString('Author'),
                    field: 'author.name', width: '20%',
                    cellTemplate:'<author-link author="row.entity.author" class="ui-grid-cell-contents"></author-link>',
                }
        ],

        xreport:[
                 {
                     name:gettextCatalog.getString('Title'),
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
                     width: '10%',
                     cellTemplate:'<div class="ui-grid-cell-contents"><activities activities="row.entity.activities" /></div>',
                 },
                 {
                    name:gettextCatalog.getString('Event type'),
                     width: '10%',
                     cellTemplate:'<span ng-repeat="type in row.entity.event_type">{{type}}</span>'
                 },
        ],

        route:[
            {
                name:gettextCatalog.getString('Title'),
                width: '*',
                cellTemplate:'<route-link route="row.entity" class="ui-grid-cell-contents"/>',
            },
            {
                name:gettextCatalog.getString('Activities'),
                width: '15%',
                cellTemplate:'<activities activities="row.entity.activities" class="ui-grid-cell-contents"></activities>',
            },
            {
                name:gettextCatalog.getString('Rating'),
                width: '15%',
                cellTemplate:'<rating route="row.entity" class="ui-grid-cell-contents"/>',
            },
            {
                name:gettextCatalog.getString('Orientations'),
                width: '15%',
                field: 'orientations',
            },
        ],

        article:[
            {
                name:gettextCatalog.getString('Title'),
                cellTemplate:'<article-link-c2c article="row.entity" class="ui-grid-cell-contents"></article-link-c2c>',
            },
            {
                name:gettextCatalog.getString('Activities'),
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
                cellTemplate:'<waypoint-link waypoint="row.entity" class="ui-grid-cell-contents"/>',
            },
            {
                name:gettextCatalog.getString("Areas"),
                cellTemplate:'<div areas="row.entity.areas" class="ui-grid-cell-contents"/>',
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

