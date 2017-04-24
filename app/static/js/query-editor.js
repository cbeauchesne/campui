app = angular.module('campui')

app.filter('hasProp', function() {
  return function(items, prop) {
    var out = [];

      items.forEach(function(item) {
        if(typeof item[prop] !== 'undefined')
          out.push(item);
      });

    return out;
  };
});

app.factory('QueryEditor', ['c2c', 'currentUser', 'gettextCatalog', 'locale', 'urlQuery', 'filterItems', 'filterItemStorage', function(c2c, currentUser, gettextCatalog, locale, urlQuery, filterItems, filterItemStorage){

    var QueryEditor = function(scope, c2c_item){
        var _this = this

        _this.scope = scope
        _this.offset = 0
        _this.limit = 30
        _this.c2c_item = c2c_item
        _this.currentUser = currentUser

        _this.getLocale = function(item){
            return locale.get(item)
        }

        _this.isSavedQuery = function(){
            return typeof _this.currentQuery.name !=='undefined'
        }


        _this._loadItems = function(url_query, onSuccess, onFailure){

            console.log("setQuery:",  url_query)
            c2c[_this.c2c_item + "s"].get({query:url_query},
                function(data){
                    delete _this.scope.error
                    if(onSuccess)
                        onSuccess(data)
            }, function(response){
                    _this.scope.error = "CampToCamp error"
                    if(onFailure)
                        onFailure(response)
            })
        }

        _this.loadNextItems = function(onSuccess, onFailure){
            var query = _this.currentQuery

            query = query || {url:""};
            url_query = query.url || "";

            url_query += "&offset=" + _this.scope.data.documents.length;
            url_query += "&limit=" + _this.limit;

            _this._loadItems(url_query,
                function(data){
                    data.documents.forEach(function(item){
                        _this.scope.data.documents.push(item)
                    })

                    onSuccess(data)
                },
                onFailure
            )
        }

        _this.setQuery = function(query, doNotResetQueryModel){

            _this.currentQuery = query || {}

            query = query || {url:""};
            url_query = query.url || "";

            if(this.scope.data)
                _this.scope.data.documents = []

            if(_this.offset != 0)
                url_query += "&offset=" + _this.offset;

            url_query += "&limit=" + _this.limit;

            _this._loadItems(url_query,
                function(data){
                    _this.scope.data = data
                }
            )

            if(doNotResetQueryModel)
                return

            _this.queryModel = {}

            //force default filter items first of all
            this.filterItemStorage.defaults.forEach(function(item){
                _this.queryModel[item] = filterItems[item].getEmptyValue()
            })

            //then add extra filters present in query
            _this.queryModel = Object.assign(_this.queryModel, urlQuery.toObject(query.url))
        }

        _this.next = function(){
            _this.offset += _this.limit;
            _this.setQuery(_this.currentQuery);
        }

        _this.previous = function(){
            if(_this.offset != 0){
                _this.offset = Math.max(0, _this.offset - _this.limit);
                _this.setQuery(_this.currentQuery);
            }
        }

        _this.save = function(){
            var query = {
                name : _this.currentQuery.name || "",
                url : urlQuery.fromObject(_this.queryModel)
            }

            currentUser.updateQuery(query)
            currentUser.save()
        }

        _this.apply = function(){
            var query = {
                name:_this.currentQuery.name,
                url:urlQuery.fromObject(_this.queryModel)
            }

            _this.setQuery(query, true)
        }

        _this.refreshC2cItems = function(itemId, userRequests){

            var currentModels = _this.queryModel[itemId]
            var filterItem = filterItems[itemId]
            var c2c_item =  filterItem.c2c_item

            if(userRequests){
                c2c.search.get({q:userRequests}, function(data){

                    filterItem.values.forEach(function(item){
                        delete item.visible
                    })
                    data[c2c_item + "s"].documents.forEach(function(newObject){
                        newObject.visible=true
                        smartPush(filterItem.values, newObject, "document_id")
                    })
                })
            }

            if(currentModels){
                currentModels.forEach(function(a_id){
                    var item = c2c[c2c_item].get({id:a_id}, function(newObject){
                        newObject.visible=true
                        smartPush(filterItem.values, newObject, "document_id")
                    })

                    item.document_id = a_id

                    smartPush(filterItem.values, item, "document_id")
                })
            }
        }

        var smartPush = function(objectArray, newObject, propName){
            existingObject = findObject(objectArray, propName, newObject.document_id)

            if(!existingObject)
                objectArray.push(newObject)
            else
                Object.assign(existingObject, newObject)

        }


        var findObject = function(objectArray, propName, propValue){
            var result = undefined
            objectArray.forEach(function(item){
                if(item[propName]==propValue)
                    result = item
            })

            return result
        }

        _this.filterItemIsSelected = function(itemId){
            return _this.queryModel && typeof _this.queryModel[itemId] !=='undefined'
        }

        _this.toggleFilterItem = function (itemId){

            if(typeof _this.queryModel[itemId] ==='undefined')
            {
                filterItem = filterItems[itemId]
                _this.queryModel[itemId] = filterItem.getEmptyValue()
            }
            else
                delete _this.queryModel[itemId]
        }

        _this.filterItemStorage = filterItemStorage[c2c_item] //filterItemsParams[c2c_item]
        _this.filterItems=filterItems

        //here is data that will be injected in editor
        _this.queryModel = {}
    }

    return QueryEditor

}])

app.factory('filterItemStorage', function(){

    result = {
        area : {
            defaults:["atyp", "qa"],
        },
        article : {
            defaults:["act", "acat", "l", "qa"],
        },
        image : {
            defaults:["act","a"],
        },
        outing : {
            defaults:["act","a", "ocond"],
            //todo : "date",
            bootstrapCol:3,
            storage : [
                {label:"Usefull",subItems:["act", "a", "ocond", "w","ofreq"]},
                {label:"Outing",subItems:["oglac","oparka","odif","oalt",]},
                {label:"Snow",subItems:["avdate", "swquan","swqual","swld","swlu"]},
                {label:"Misc.",subItems:["u","r","qa","l"]},
            ]
        },
        route : {
            defaults:["act", "a", "grat"],
            bootstrapCol:3,
            storage : [
                {label:"Usefull",subItems:["act", "a", "grat", "w"]},
                {label:"Rock ratings",subItems:["frat","rrat","erat","prat","rexpo","arat"]},
                {label:"Snow/ice ratings",subItems:["orrat", "srat","lrat","irat","mrat","trat","sexpo"]},
                {label:"Other ratings",subItems:["wrat","krat","hrat","mbdr","mbur","hexpo",""]},
                {label:"Route",subItems:["time","rtyp","rlen","rappr","ralt","dhei",]},
                {label:"Terrain",subItems:["crtyp","hdif","ddif","rmina","rmaxa"]},
                {label:"Terrain",subItems:["fac", "rock","conf", "prom"]},
                {label:"Misc.",subItems:["mbpush","mbtrack","mbroad","qa","l"]},
            ]
        },
        waypoint : { //plift
            //todo ,"
            defaults:["wtyp", "a", "rqua"],
            bootstrapCol:3,
            storage : [
                {label:"Usefull",subItems:["walt","prom","wfac","period","tappt"]},
                {label:"Ratings",subItems:["pgrat","tmedr","anchq","pglexp","psnow"]},
                {label:"Terrain",subItems:["wrock","rain","ctout","tcsty","tmedh","hsta"]},
                {label:"Misc.",subItems:["whtyp","tpty","hscap","ftyp","qa","l"]},
            ]
        },
        xreport : {
            //todo ,"date"
            defaults:["act","a","xtyp"],
            bootstrapCol:4,
            storage : [
                {label:"Usefull",subItems:["xsev","ximp","xpar"]},
                {label:"Terrain",subItems:["xalt", "xavlev", "xavslo"]},
                {label:"Misc.",subItems:["qa","l"]},
            ]
        },
    }

    return result
})

app.factory('filterItems', ["c2c_common","gettextCatalog", function(c2c_common, gettextCatalog){

   // dd = {}
    var filterItem = function(label, template){
        this.label = label
        this.template = template
        this.getEmptyValue =function(){
            return []
        }
    }

    var multiSelectFilterItem = function(label, values, pictos){
        filterItem.call(this,label, "select_multi")

        this.values = values
        this.isArray = true
        this.pictos = pictos

        //if(values)
        //    values.forEach((item)=>dd[item]=0)
    }

    var sliderFilterItem = function(label, values, template){
        filterItem.call(this,label, template || "slider")

        this.values = values.slice()
        this.isArray = true
        this.getEmptyValue =function(){
            return [values[0], values[values.length-1]]
        }
        this.translate = function(value){
            return gettextCatalog.getString(value)
        }
    }

    var sliderIntFilterItem = function(label, floor, ceil, step){
        filterItem.call(this,label, "slider")

        this.isArray = true
        this.floor = floor || 0
        this.ceil = ceil || 666
        this.step = step || 1
        this.getEmptyValue =function(){
            return [floor, ceil]
        }
    }

    var c2cSelectFilterItem = function(label, c2c_item){
        filterItem.call(this,label, "c2c_select")

        this.c2c_item = c2c_item
        this.values = []
        this.isArray = true
    }

    result = {
        a : new c2cSelectFilterItem("areas", "area"),
        acat : new multiSelectFilterItem("categories", c2c_common.attributes.article_categories),
        act : new multiSelectFilterItem("activities", c2c_common.attributes.activities, true),
        atyp : new multiSelectFilterItem("types", c2c_common.attributes.area_types),
        avdate : new multiSelectFilterItem("avalanche signs", c2c_common.attributes.avalanche_signs),
        ddif: new sliderIntFilterItem("elevation gain", 0,10000,100),
        fac : new multiSelectFilterItem("orientations", c2c_common.attributes.orientation_types),
        hdif : new sliderIntFilterItem("elevation loss", 0,10000,100),
        l: new multiSelectFilterItem("language", c2c_common.attributes.default_langs),
        oalt : new sliderIntFilterItem("max altitude", 0,8850,100),
        ocond : new sliderFilterItem("conditions", c2c_common.attributes.condition_ratings, "slider_inverse"),
        odif : new sliderIntFilterItem("elevation gain", 0,10000,100),
        ofreq : new sliderFilterItem("crowding", c2c_common.attributes.frequentation_types),
        oglac : new sliderFilterItem("glacier rating", c2c_common.attributes.glacier_ratings),
        oparka : new sliderIntFilterItem("altitude of access point", 0,5000,100),
        qa : new sliderFilterItem("completeness", c2c_common.attributes.quality_types),
        rmaxa: new sliderIntFilterItem("max altitude", 0,8850,100),
        rmina: new sliderIntFilterItem("min altitude", 0,6000,100),
        r: new c2cSelectFilterItem("routes", "route"),
        rtyp : new multiSelectFilterItem("types", c2c_common.attributes.route_types),
        swld : new sliderIntFilterItem("snow elevation (down)", 0,4000,100),
        swqual : new sliderFilterItem("snow quality", c2c_common.attributes.condition_ratings, "slider_inverse"),
        swquan : new sliderFilterItem("snow quantity", c2c_common.attributes.condition_ratings, "slider_inverse"),
        swlu : new sliderIntFilterItem("snow elevation (up)", 0,4000,100),
        w : new c2cSelectFilterItem("waypoints", "waypoint"),
        walt: new sliderIntFilterItem("elevation", 0,8850,100),
        wtyp : new multiSelectFilterItem("type", c2c_common.attributes.waypoint_types),
        xalt : new sliderIntFilterItem("elevation", 0,8850,100),
        xavlev : new multiSelectFilterItem("avalanche level", c2c_common.attributes.avalanche_levels),
        xavslo : new multiSelectFilterItem("avalanche slope", c2c_common.attributes.avalanche_slopes),
        ximp : new sliderIntFilterItem("impacted count",1,25,1),
        xpar : new sliderIntFilterItem("participants count",1,25,1),
        xsev : new sliderFilterItem("severity", c2c_common.attributes.severities),
        xtyp : new multiSelectFilterItem("type", c2c_common.attributes.event_types),

        //todo : sort, name, get bounds
        rexpo :  new sliderFilterItem('exposition rock', c2c_common.attributes.exposition_rock_ratings),
        time :  new multiSelectFilterItem('durations', c2c_common.attributes.route_duration_types),
        trat :  new sliderFilterItem('ski rating', c2c_common.attributes.ski_ratings),
        sexpo :  new sliderFilterItem('ski exposition', c2c_common.attributes.exposition_ratings),
        srat :  new sliderFilterItem('labande ski rating', c2c_common.attributes.labande_ski_ratings),
        lrat :  new sliderFilterItem('labande global rating', c2c_common.attributes.global_ratings),
        grat :  new sliderFilterItem('global rating', c2c_common.attributes.global_ratings),
        erat :  new sliderFilterItem('engagement rating', c2c_common.attributes.engagement_ratings),
        orrat :  new sliderFilterItem('risk rating', c2c_common.attributes.risk_ratings),
        prat :  new sliderFilterItem('equipment rating', c2c_common.attributes.equipment_ratings),
        irat :  new sliderFilterItem('ice rating', c2c_common.attributes.ice_ratings),
        mrat :  new sliderFilterItem('mixed rating', c2c_common.attributes.mixed_ratings),
        frat :  new sliderFilterItem('rock free rating', c2c_common.attributes.climbing_ratings),
        rrat :  new sliderFilterItem('rock required rating', c2c_common.attributes.climbing_ratings),
        arat :  new sliderFilterItem('aid rating', c2c_common.attributes.aid_ratings),
        krat :  new sliderFilterItem('via ferrata rating', c2c_common.attributes.via_ferrata_ratings),
        hrat :  new sliderFilterItem('hiking rating', c2c_common.attributes.hiking_ratings),
        hexpo :  new sliderFilterItem('hiking MTB exposition', c2c_common.attributes.exposition_ratings),
        wrat :  new sliderFilterItem('snowshoe rating', c2c_common.attributes.snowshoe_ratings),
        mbur :  new sliderFilterItem('MTB up rating', c2c_common.attributes.mtb_up_ratings),
        mbdr :  new sliderFilterItem('MTB down rating', c2c_common.attributes.mtb_down_ratings),
        rock :  new multiSelectFilterItem('rock types', c2c_common.attributes.rock_types),
        crtyp :  new multiSelectFilterItem('climbing outdoor type', c2c_common.attributes.climbing_outdoor_types),
        conf :  new multiSelectFilterItem('configuration', c2c_common.attributes.route_configuration_types),
        mbroad :  new sliderIntFilterItem('MTB length asphalt',0,666),
        mbtrack :  new sliderIntFilterItem('MTB length trail',0,666),
        mbpush :  new sliderIntFilterItem('MTB portage',0,666),
        rlen :  new sliderIntFilterItem('route length',0,666),
        ralt :  new sliderIntFilterItem('difficulties height',0,666),

        rappr :  new sliderIntFilterItem('height diff access',0,666),
        dhei :  new sliderIntFilterItem('height diff difficulties',0,666),

        walt : new sliderIntFilterItem('elevation'),
        prom : new sliderIntFilterItem('prominence'),
        tmaxh : new sliderIntFilterItem('height max'),
        tminh : new sliderIntFilterItem('height min'),
        tmedh : new sliderIntFilterItem('height median'),
        rqua : new sliderIntFilterItem('routes quantity'),
        len : new sliderIntFilterItem('length'),
        hucap : new sliderIntFilterItem('capacity'),
        hscap : new sliderIntFilterItem('capacity staffed'),

        wtyp : new multiSelectFilterItem('waypoint type', c2c_common.attributes.waypoint_type),
        wrock : new multiSelectFilterItem('rock types', c2c_common.attributes.rock_types),
        wfac : new multiSelectFilterItem('orientations', c2c_common.attributes.orientation_types),
        period : new multiSelectFilterItem('best periods', c2c_common.attributes.months),
        hsta : new multiSelectFilterItem('custodianship', c2c_common.attributes.custodianship_types),
        tcsty : new multiSelectFilterItem('climbing styles', c2c_common.attributes.climbing_styles),
        tappt : new multiSelectFilterItem('access time', c2c_common.attributes.access_times),
        tmaxr : new sliderFilterItem('climbing rating max', c2c_common.attributes.climbing_ratings),
        tminr : new sliderFilterItem('climbing rating min', c2c_common.attributes.climbing_ratings),
        tmedr : new sliderFilterItem('climbing rating median', c2c_common.attributes.climbing_ratings),
        chil : new multiSelectFilterItem('children proof', c2c_common.attributes.children_proof),
        rain : new multiSelectFilterItem('rain proof', c2c_common.attributes.rain_proof_types),
        ctout : new multiSelectFilterItem('climbing outdoor types', c2c_common.attributes.climbing_outdoor_types),
        ctin : new multiSelectFilterItem('climbing indoor types', c2c_common.attributes.climbing_indoor_types),
        pgrat : new sliderFilterItem('paragliding rating', c2c_common.attributes.paragliding_ratings),
        pglexp : new sliderFilterItem('exposition rating', c2c_common.attributes.exposition_ratings),
        whtyp : new multiSelectFilterItem('weather station', c2c_common.attributes.weather_station_types),
        anchq : new sliderFilterItem('equipment ratings', c2c_common.attributes.equipment_ratings),
        tpty : new multiSelectFilterItem('public transportation types', c2c_common.attributes.public_transportation_types),
        tp : new multiSelectFilterItem('public transportation rating', c2c_common.attributes.public_transportation_rating),
        psnow : new sliderFilterItem('snow clearance rating', c2c_common.attributes.snow_clearance_ratings),
        ftyp : new multiSelectFilterItem('product types', c2c_common.attributes.product_types),

/*
        date : {label:"Date", emptyValue:[undefined, undefined], isArray:true}, // debut et fin
        glac : {label:"glacier gear", emptyValue:""}, // bool
        owpt : {label:"public transport", emptyValue:""}, // bool
        bbox : {label:"Map", emptyValue:""}, // map filter
        plift : {label: 'lift access', emptyValue:""},
*/
        u: {
            label:"Users",
            isArray:false,
            getEmptyValue:function(){
                return ""
            }
        },
    }

   // console.log(Object.keys(dd).join("\n"))

    return result
}])

