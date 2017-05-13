
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
    var profile = {
        params:{
            queries:[],
            follow:{
                users:[],
                routes:[]
            }
        }
    }

    var activities = ["skitouring",
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

app.factory('currentUser', ["api", "anonymousProfile","$state", function(api, anonymousProfile, $state){

    var user = api.currentUser.get(function(data){
        setUser(user, data)
    });

    function setUser(user, data){

        data = data || {}

        user.username = data.username
        user.profile = data.profile || anonymousProfile
        user.profile.params = user.profile.params || anonymousProfile.params
        user.profile.params.queries = user.profile.params.queries || anonymousProfile.params.queries
        user.profile.params.follow = user.profile.params.follow || anonymousProfile.params.follow
        user.profile.params.follow.users = user.profile.params.follow.users || anonymousProfile.params.follow.users
        user.profile.params.follow.routes = user.profile.params.follow.routes || anonymousProfile.params.follow.routes

        user.isAnonymous = !data.username

        var getFollowList = function(document){
            if(document.type == "r")
                return user.profile.params.follow.routes
            else if(document.type == "u" || typeof document.type === "undefined")
                return user.profile.params.follow.users

            throw "Unsupported document type : " + document.type
        }

        user.toggleFollow = function(document){
            list = getFollowList(document)
            position = list.indexOf(document.document_id)

            if(position==-1)
                list.push(document.document_id)
            else
                list.splice(position, 1)

            user.save()
        }

        user.isFollowed = function(document){
            if(!document || (!document.$resolved && typeof document.$resolved !== "undefined"))
                return false

            if(document.type == "o"){
                var result = false

                routes = user.profile.params.follow.routes
                users = user.profile.params.follow.users

                document.associations.routes.forEach(function(route){
                    result = result || routes.indexOf(route.document_id) != -1
                })

                document.associations.users.forEach(function(user){
                    result = result || users.indexOf(user.document_id) != -1
                })

                return result
            }

            list = getFollowList(document)
            return list.indexOf(document.document_id) != -1
        }

        user.create = function(username, password1){
            user.user = true
            api.users.create({username:username, password:password1}, function(data){
                delete user.creating
                delete user.creatingError
                setUser(user, data)
                $state.go('home')
            },
            function(response){ //server error
                user.creatingError = response.data || response.statusText
                delete user.creating
            })
        }

        user.login = function(username, password){
            console.log("login", username)
            user.loging = true
            api.auth.login({username: username, password: password}).$promise
                .then(function(data){
                    setUser(user, data)
                    delete user.loginError
                    delete user.loging
                    $state.go('home')
                })
                .catch(function(data){
                    console.log("login error", data)
                    user.loginError = data.data.detail || data.statusText
                    delete user.loging
                    setUser(user, undefined)
                });
        };

        user.logout = function(){
            console.log("logout", user.username)
            setUser(user, undefined)
            api.auth.logout();
        }

        user.getQueryIndex = function(query){
            for(i=0;i<user.profile.params.queries.length;i++)
                if(user.profile.params.queries[i].name===query.name)
                    return i

            return -1
        }

        user.updateQuery = function(query){
            i = user.getQueryIndex(query)

            if(i==-1)
                user.addQuery(query)
            else
                user.profile.params.queries[i].url = query.url
        }

        user.addQuery = function(query){
            query=query || {url:"", name:""}
            user.profile.params.queries.push(query)

            return query
        }

        user.deleteQuery = function(query){
            index = user.getQueryIndex(query);

            if(index != -1) {
                delete query.name
                delete query.url
                user.profile.params.queries.splice(index, 1);
            }
        }

        user.save = function(){

            console.log("cleaning user", user)

            user.profile.params.queries.forEach(function(item){
                if(item.url){
                    item.url = item.url.replace(/https:\/\/www.camptocamp\.org\/[a-z]*#/g,"")
                    item.url = item.url.replace(/%252C/g,",")
                    item.url = item.url.replace(/%252B  /g,"+")
                }
            })


            if(user.isAnonymous)
                return

            console.log("saving user", user)
            user.saving = true;
            api.currentUser.save({profile:user.profile},
                function(){
                    console.log("user saved")
                    delete user.saving;
                    delete user.errors;
                },
                function(response){
                    console.log("user not saved", response)
                    delete user.saving;
                    user.errors = response;
                }
            );
        };
    }

    setUser(user, undefined)

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
            get : function(parameters, onSuccess, onFailure){

                var result = {documents:[], query:parameters}

                var load = function(query, onSuccess, onFailure){

                    console.log("Load", query)
                    result.loading = true
                    c2c.outings.get(query, function(response){
                        result.loading = response.documents.length
                        result.total = response.total
                        response.documents.forEach(function(item){
                            result.documents.push(c2c.outing.get({id:item.document_id}, function(){
                                result.loading--
                                if(result.loading===0){
                                    delete result.loading
                                    if(onSuccess)
                                        onSuccess(result)
                                }
                            }, function(){
                                result.loading--
                                if(result.loading===0){
                                    delete result.loading
                                    if(onSuccess)
                                        onSuccess(result)
                                }
                            }))
                        })
                    }, function(){
                        delete result.loading

                        if(onFailure)
                            onSuccess(result)
                    })
                }

                result.loadMore = function(onSuccess){
                    if(result.loading || result.total<=result.documents.length)
                        return

                    var query = Object.assign({offset:result.documents.length}, result.query)
                    load(query, onSuccess, onFailure)
                }

                load(parameters, onSuccess, onFailure)

                return result
            }
        }
    }
}]);

app.factory('c2c', ['$resource','gettextCatalog', function($resource, gettextCatalog){

    var result = {}

    $.each(c2cItems, function(item, params) {
        var _item = item == 'user' ? 'profile' : item

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
    result.search = $resource('https://api.camptocamp.org/search?limit=15&t=:t&q=:q',
        {
            pl:function(){
                return gettextCatalog.getCurrentLanguage()
            },
            t:"w,r,a",  //u : must be auth on c2c...
        },
        {
            get : {method: 'GET'}
        }
    )

    var forum = {}

    result.forum = forum

    forum.latest_topics = $resource('https://forum.camptocamp.org/latest.json', {},
                                {
                                    get : {method: 'GET'}
                                })


    forum.latest_topics = $resource('/api/forum', {},
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

app.factory("urlQuery", ['$location', 'filterItems', function($location, filterItems){

    function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    var getCurrent = function(){
        return fromObject($location.search())
    }

    var fromObject = function(object){
        var temp = []

        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {

                filterItem = filterItems[prop]

                if(!Array.isArray(object[prop])){
                    if(typeof object[prop] !== "undefined" && object[prop] !== "")
                        temp.push(prop +  "=" + object[prop])
                }
                else if(object[prop].length!=0 && !arraysEqual(object[prop], filterItem.getEmptyValue())){
                    temp.push(prop +  "=" + object[prop].join(","))
                }
            }
        }

        return temp.join("&")
    }

    var toObject = function(query) {
        var queryObject = {};
        query = query || ""
        var vars = query.split("&");

        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");

            if(pair[0]){
                filterItem = filterItems[pair[0]] || {}

                if(pair.length==1){
                    queryObject[pair[0]] = filterItem.getEmptyValue()
                }
                else{
                    pair[0] = decodeURIComponent(pair[0]);
                    pair[1] = decodeURIComponent(pair[1]);

                    if(!pair[1])
                        pair[1] = filterItem.getEmptyValue()
                    else if(filterItem.isArray)
                        pair[1] = pair[1].split(",")

                    queryObject[pair[0]] = pair[1]
                }
            }
        }

        items =['a','r','w']

        items.forEach(function(t){
            if(queryObject[t]){
                queryObject[t] = queryObject[t].map(function(item) {
                    return parseInt(item, 10);
                });
            }
        })

        return queryObject;
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
                    cellTemplate:'<user-link user="row.entity.author" class="ui-grid-cell-contents"></author-link>',
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
                field: 'locales[0].title_prefix',
                width: '*',
                cellTemplate:'<route-link route="row.entity" class="ui-grid-cell-contents"/>',
            },
            {
                name:gettextCatalog.getString('Activities'),
                field: 'activities',
                width: '10%',
                cellTemplate:'<div class="ui-grid-cell-contents"><activities activities="row.entity.activities"></activities></div>',
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
                cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.orientations.join(", ")}}</div>',
            }
            ,
            {
                field : "aid_rating",
                name: gettextCatalog.getString('aid_rating'),
                width: '10%',
                visible:false
            },{
                field : "elevation_max",
                name: gettextCatalog.getString('elevation_max'),
                width: '10%',
                visible:false
            },{
                field : "engagement_rating",
                name: gettextCatalog.getString('engagement_rating'),
                width: '10%',
                visible:false
            },{
                field : "equipment_rating",
                name: gettextCatalog.getString('equipment_rating'),
                width: '10%',
                visible:false
            },{
                field : "exposition_rock_rating",
                name: gettextCatalog.getString('exposition_rock_rating'),
                width: '10%',
                visible:false
            },{
                field : "global_rating",
                name: gettextCatalog.getString('global_rating'),
                width: '10%',
                visible:false
            },{
                field : "height_diff_up",
                name: gettextCatalog.getString('height_diff_up'),
                width: '10%',
                visible:false
            },{
                field : "protected",
                name: gettextCatalog.getString('protected'),
                width: '10%',
                visible:false
            },{
                field : "quality",
                name: gettextCatalog.getString('quality'),
                width: '10%',
                visible:false
            },{
                field : "risk_rating",
                name: gettextCatalog.getString('risk_rating'),
                width: '10%',
                visible:false
            },{
                field : "rock_free_rating",
                name: gettextCatalog.getString('rock_free_rating'),
                width: '10%',
                visible:false
            },{
                field : "rock_required_rating",
                name: gettextCatalog.getString('rock_required_rating'),
                width: '10%',
                visible:false
            },
        ],

        article:[
            {
                name:gettextCatalog.getString('Title'),
                field: 'locales[0].title',
                cellTemplate:'<article-link article="row.entity" class="ui-grid-cell-contents"></article-link>',
            },
            {
                name:gettextCatalog.getString('Activities'),
                field: 'activities',
                width: '15%',
                cellTemplate:'<activities activities="row.entity.activities"></activities>',
            },
            {
                name:gettextCatalog.getString('Quality'),
                field: 'quality',
                width: '10%',
            },
            {
                name:gettextCatalog.getString('Categories'),
                field: 'categories',
                width: '15%',
            },
            {
                name:gettextCatalog.getString('Type'),
                field: 'article_type',
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
