
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

app.service('photoswipe', ["locale", function(locale){
    var _this = this

    // https://github.com/dimsemenov/PhotoSwipe/issues/580
    // history is important, see comment of mutac
    _this.opts={
        index:0,
        history:false
    }

    _this.getters = []

    _this.showGallery = function(document_id) {
        _this.opts.index = 0;
        _this.slides = []
        var i = 0

        _this.getters.forEach(function(getter){
            getter().forEach(function(image){

                _this.slides.push({
                    src:"https://media.camptocamp.org/c2corg_active/" + image.filename.replace('.', 'BI.').replace('.svg', '.jpg'),
                    w:0,h:0,
                    title:locale.get(image).title,
                    document_id:image.document_id,
                })

                if(document_id==image.document_id)
                    _this.opts.index = i

                i++
            })
        })

        _this.open = true;
    }

    _this.closeGallery = function () {
        _this.open = false;
    };
}]);

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

app.factory("mapData", ["NgMap", "c2c", function(NgMap, c2c){
    var ESPG_4326 = new proj4.Proj('EPSG:4326');
    var ESPG_3785 = new proj4.Proj('GOOGLE');

    var letterToC2cItem = {
        o:"outing",
        r:"route",
        w:"waypoint",
        a:"area",
        x:"xreport",
    }

    var Markers = function(map){
        var _this = this
        _this.map = map

        _this.docs = []
        _this.waypoints = []
        _this.currentInfoWindow = undefined

        _this.removeWaypoints = function(){
            for (var i = 0; i < _this.waypoints.length; i++ ) {
                _this.waypoints[i].setMap(null);
            }

            _this.waypoints.length = 0;

            if(_this.currentInfoWindow)
                _this.currentInfoWindow.close()
        }

        _this.removeDocs = function(){
            for (var i = 0; i < _this.docs.length; i++ ) {
                _this.docs[i].setMap(null);
            }

            _this.docs.length = 0;

            if(_this.currentInfoWindow)
                _this.currentInfoWindow.close()
        }

        _this.addDoc = function(doc){
            var marker = _this._add(doc)
            _this.docs.push(marker)
            return marker
        }

        _this.addWaypoint = function(waypoint){
            var marker = _this._add(waypoint)
            _this.waypoints.push(marker)
            return marker
        }

        _this._add = function(doc){
            var point = JSON.parse(doc.geometry.geom).coordinates

            var infowindow = new google.maps.InfoWindow({
                content:
                    "<div class='map-info'>" +
                    "<a href='" + letterToC2cItem[doc.type] + "/" + doc.document_id + "'>" +
                    doc.locales[0].title +
                    "</a>" +
                    "" +
                    "</div>"
            });

            point = proj4.transform(ESPG_3785, ESPG_4326, point)
            var latLng = new google.maps.LatLng(point.y, point.x)

            var getIcon = function(doc){
                if(doc.type=="w"){
                    return "/static/campui/img/spotlights/spotlight_" + doc.waypoint_type + ".png"
                }
            }

            var marker = new google.maps.Marker({
                position:  latLng,
                map: _this.map,
                icon: getIcon(doc)
            })

            marker.addListener('click', function() {
                if (infowindow.isOpen())
                    infowindow.close()
                else {
                    if(_this.currentInfoWindow)
                        _this.currentInfoWindow.close()

                    infowindow.open(_this.map, marker);
                    _this.currentInfoWindow = infowindow
                }
            });

            return marker
        }
    }

    var result = function(){
        var _this = this

        _this.visible=false
        _this._waypointsChooser = false

        _this.waypoint_types = [[
            "summit",
            "pass",
            "lake",
            "waterfall",
            "canyon",
            "access",
            "hut",
            "gite",],
            ["shelter",
            "bivouac",
            "camp_site",
            "base_camp",
            "paragliding_takeoff",
            "paragliding_landing",
            "cave",
            "waterpoint",
        ]]

        _this.toggleFilterMode = function(){

             if(_this.filterMode)
                _this.sendBoundsToQuery();
             else
                _this.onMapMove()
        }

        _this.toggleMapView = function(data){
            if(_this.visible){

                NgMap.getMap().then(function(map){

                    if(!google.maps.InfoWindow.prototype.isOpen)
                        google.maps.InfoWindow.prototype.isOpen = function(){
                            var map = this.getMap();
                            return (map !== null && typeof map !== "undefined");
                        }

                    _this._map = map

                    if(!map._markers)
                        map._markers = new Markers(map)

                    if(map._dragend) map._dragend.remove()
                    if(map._zoom_changed) map._zoom_changed.remove()

                    map._dragend = map.addListener('dragend', _this.sendBoundsToQuery);
                    map._zoom_changed = map.addListener('zoom_changed', _this.sendBoundsToQuery);

                    _this.displayMarkers(data)
                },
                console.log)
            }
        }

        //event callback
        _this.hideWaypointsChooser = function(){
            _this._waypointsChooser = false
        }

        //event callback
        _this.sendBoundsToQuery = function(){
            if(!_this.filterMode)
                return

            _this.onMapMove(_this.getBoundsC2c())
        }

        //called from HTML
        _this.updateWaypoints = function(){
            var wps = []

            $.each(_this.visibleWaypoints, function(key, value){
                if(value)
                    wps.push(key)
            })

            _this._map._markers.removeWaypoints()

            if(wps.length==0)
                return

            var bbox = _this.getBoundsC2c().join(",")
            c2c.waypoints.get({query:"bbox=" + bbox + "&wtyp=" + wps.join(",")}, function(data){
                data.documents.forEach(_this._map._markers.addWaypoint)
            })
        }

        //helper
        _this.getBoundsC2c = function(){
            var bounds = _this._map.getBounds().toJSON()
            var NO = proj4.transform(ESPG_4326, ESPG_3785, [bounds.east,bounds.north])
            var SW = proj4.transform(ESPG_4326, ESPG_3785, [bounds.west,bounds.south])

            return [SW.x, SW.y, NO.x, NO.y]
        }


        //called from outside
        _this.displayMarkers = function(data){
            if(!_this.visible)
                return

            _this._map._markers.removeDocs()
            var bounds = new google.maps.LatLngBounds();

            data.documents.forEach(function(doc){
                var marker = _this._map._markers.addDoc(doc)
                bounds.extend(marker.position)
            })

            if(!_this.filterMode)
                _this._map.fitBounds(bounds)

            _this.updateWaypoints()
        }
    }

    return result

}])
