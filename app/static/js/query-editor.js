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

        _this.deletable = false

        _this.getLocale = function(item){ return locale.get(item)}

        _this.setQuery = function(query, doNotResetQueryModel){

            _this.currentQuery = query
            _this.deletable = currentUser.getQueryIndex(query) != -1
            _this.clonable = _this.deletable

            query = query || {url:""};
            url_query = query.url || "";

            if(this.scope.data)
                _this.scope.data.documents = []

            if(_this.offset != 0)
                url_query += "&offset=" + _this.offset;

            url_query += "&limit=" + _this.limit;

            console.log("setQuery:",  url_query)
            c2c[_this.c2c_item + "s"].get({query:url_query}, function(data){
                    _this.scope.data = data
                    delete _this.scope.error
            }, function(response){
                    _this.scope.error = "CampToCamp error"
            })

            if(doNotResetQueryModel)
                return

            _this.queryModel = {}

            //force default filter items first of all
            this.filterItemStorage.defaults.forEach(function(item){
                _this.queryModel[item] = filterItems[item].emptyValue
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
            if(currentUser.getQueryIndex(_this.currentQuery) == -1 && (_this.currentQuery.url || _this.currentQuery.name))
                currentUser.addQuery(_this.currentQuery)

            currentUser.save()
            _this.deletable = true
            _this.clonable = true
        }

        //will save current html filters into current query, and call setQuery
        _this.apply = function(){
            queryObject = {}
            _this.currentQuery = _this.currentQuery || {}

            _this.currentQuery.url = urlQuery.fromObject(_this.queryModel)
            _this.setQuery(_this.currentQuery, true)
        }

        _this.delete = function(){
            currentUser.deleteQuery(_this.currentQuery)
            _this.setQuery()
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

                emptyValue = filterItem.emptyValue

                if(filterItem.isArray)
                    emptyValue = emptyValue.slice()

                _this.queryModel[itemId] = emptyValue
            }
            else
                delete _this.queryModel[itemId]
        }

        _this.TEST = function(){
            console.log(arguments)
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
            defaults:["act","a", "u"],
        },
        outing : {
            defaults:["act","a", "ocond"],
            //todo : "date",
            bootstrapCol:3,
            storage : [
                {label:"Frequents",subItems:["act", "a", "w"]},
                {label:"XXX",subItems:["ocond", "u", "w", "ofreq", "oglac", "r"]},
                {label:"XXX",subItems:["odif","swquan","swlu","oparka","oalt"]},
                {label:"XXX",subItems:["avdate","qa","swld","swqual","l"]},
            ]
        },
        route : {
            defaults:["act", "a", "grat"],
            bootstrapCol:3,
            storage : [
                {label:"Usefull",subItems:["w"]},
                {label:"Route",subItems:["time","rtyp","rlen","rappr","ralt","dhei",]},
                {label:"Ratings1",subItems:["krat","hrat","mrat","irat","prat"]},
                {label:"Ratings2",subItems:["wrat","rexpo","erat","orrat","arat","rrat"]},
                {label:"Ratings3",subItems:["frat","srat","lrat","trat","sexpo","hexpo"]},
                {label:"Terrain1",subItems:["crtyp","fac","hdif","ddif","rmina","rmaxa"]},
                {label:"Terrain2",subItems:["rock","conf", "prom"]},
                {label:"Misc",subItems:["mbpush","mbtrack","mbdr","mbroad","mbur","qa","l"]},
            ]
        },
        waypoint : { //plift
            //todo ,"
            defaults:["wtyp", "a", "rqua"],
            bootstrapCol:2,
            storage : [
                {label:"Usefull",subItems:["prom"]},
                {label:"Ratings",subItems:["pgrat","tmedr","anchq","pglexp","psnow"]},
                {label:"Terrain",subItems:["walt","wrock","wfac","rain","ctout","tcsty","period","tmedh","tappt","hsta"]},
                {label:"Misc",subItems:["whtyp","tpty","hscap","ftyp"]},
                {label:"Meta",subItems:["qa","l"]},
            ]
        },
        xreport : {
            //todo ,"date"
            defaults:["act","a","xtyp"],
            bootstrapCol:4,
            storage : [
                {label:"Frequents",subItems:["xsev","ximp","xpar"]},
                {label:"Terrain",subItems:["xalt", "xavlev", "xavslo"]},
                {label:"Meta",subItems:["qa","l"]},
            ]
        },
    }

    return result
})

app.factory('filterItems', ["c2c_common", function(c2c_common){

    var multiSelectFilterItem = function(label, values, pictos){
        this.label = label
        this.values = values
        this.template = "select_multi"
        this.isArray = true
        this.emptyValue = []
        this.pictos = pictos
    }

    var sliderFilterItem = function(label, values, template){
        this.label = label
        this.values = values.slice()
        this.template = template || "slider"
        this.isArray = true
        this.emptyValue = [values[0], values[values.length-1]]
    }

    var sliderIntFilterItem = function(label, floor, ceil, step){
        this.label = label
        this.template = "slider"
        this.isArray = true
        this.floor = floor || 0
        this.ceil = ceil || 666
        this.step = step || 1
        this.emptyValue = [this.floor, this.ceil]
    }

    var c2cSelectFilterItem = function(label, c2c_item){
        this.label = label
        this.c2c_item = c2c_item
        this.values = []
        this.template = "c2c_select"
        this.isArray = true
        this.emptyValue = []
    }

    return {
        a : new c2cSelectFilterItem("Areas", "area"),
        acat : new multiSelectFilterItem("Categories", c2c_common.attributes.article_categories),
        act : new multiSelectFilterItem("Activities", c2c_common.attributes.activities, true),
        atyp : new multiSelectFilterItem("Types", c2c_common.attributes.area_types),
        avdate : new multiSelectFilterItem("Avalanche signs", c2c_common.attributes.avalanche_signs),
        ddif: new sliderIntFilterItem("Elevation gain", 0,10000,100),
        fac : new multiSelectFilterItem("Orientations", c2c_common.attributes.orientation_types),
        hdif : new sliderIntFilterItem("Elevation loss", 0,10000,100),
        l: new multiSelectFilterItem("Language", c2c_common.attributes.default_langs),
        oalt : new sliderIntFilterItem("Max altitude", 0,8850,100),
        ocond : new sliderFilterItem("Conditions", c2c_common.attributes.condition_ratings, "slider_inverse"),
        odif : new sliderIntFilterItem("Elevation gain", 0,10000,100),
        ofreq : new sliderFilterItem("Crowding", c2c_common.attributes.frequentation_types),
        oglac : new sliderFilterItem("Glacier rating", c2c_common.attributes.glacier_ratings),
        oparka : new sliderIntFilterItem("Altitude of access point", 0,5000,100),
        qa : new sliderFilterItem("Completeness", c2c_common.attributes.quality_types),
        rmaxa: new sliderIntFilterItem("Max altitude", 0,8850,100),
        rmina: new sliderIntFilterItem("Min altitude", 0,6000,100),
        r: new c2cSelectFilterItem("Routes", "route"),
        rtyp : new multiSelectFilterItem("Types", c2c_common.attributes.route_types),
        swld : new sliderIntFilterItem("Snow elevation (down)", 0,4000,100),
        swqual : new sliderFilterItem("Snow quality", c2c_common.attributes.condition_ratings, "slider_inverse"),
        swquan : new sliderFilterItem("Snow quantity", c2c_common.attributes.condition_ratings, "slider_inverse"),
        swlu : new sliderIntFilterItem("Snow elevation (up)", 0,4000,100),
        w : new c2cSelectFilterItem("Waypoints", "waypoint"),
        walt: new sliderIntFilterItem("Elevation", 0,8850,100),
        wtyp : new multiSelectFilterItem("Type", c2c_common.attributes.waypoint_types),
        xalt : new sliderIntFilterItem("Elevation", 0,8850,100),
        xavlev : new multiSelectFilterItem("Avalanche level", c2c_common.attributes.avalanche_levels),
        xavslo : new multiSelectFilterItem("Avalanche slope", c2c_common.attributes.avalanche_slopes),
        ximp : new sliderIntFilterItem("nb_impacted",1,25,1),
        xpar : new sliderIntFilterItem("nb_participants",1,25,1),
        xsev : new sliderFilterItem("Severity", c2c_common.attributes.severities),
        xtyp : new multiSelectFilterItem("Type", c2c_common.attributes.event_types),

        //todo : sort, name, get bounds
        rexpo :  new sliderFilterItem('exposition_rock_rating', c2c_common.attributes.exposition_rock_ratings),
        time :  new multiSelectFilterItem('durations', c2c_common.attributes.route_duration_types),
        trat :  new sliderFilterItem('ski_rating', c2c_common.attributes.ski_ratings),
        sexpo :  new sliderFilterItem('ski_exposition', c2c_common.attributes.exposition_ratings),
        srat :  new sliderFilterItem('labande_ski_rating', c2c_common.attributes.labande_ski_ratings),
        lrat :  new sliderFilterItem('labande_global_rating', c2c_common.attributes.global_ratings),
        grat :  new sliderFilterItem('global_rating', c2c_common.attributes.global_ratings),
        erat :  new sliderFilterItem('engagement_rating', c2c_common.attributes.engagement_ratings),
        orrat :  new sliderFilterItem('risk_rating', c2c_common.attributes.risk_ratings),
        prat :  new sliderFilterItem('equipment_rating', c2c_common.attributes.equipment_ratings),
        irat :  new sliderFilterItem('ice_rating', c2c_common.attributes.ice_ratings),
        mrat :  new sliderFilterItem('mixed_rating', c2c_common.attributes.mixed_ratings),
        frat :  new sliderFilterItem('rock_free_rating', c2c_common.attributes.climbing_ratings),
        rrat :  new sliderFilterItem('rock_required_rating', c2c_common.attributes.climbing_ratings),
        arat :  new sliderFilterItem('aid_rating', c2c_common.attributes.aid_ratings),
        krat :  new sliderFilterItem('via_ferrata_rating', c2c_common.attributes.via_ferrata_ratings),
        hrat :  new sliderFilterItem('hiking_rating', c2c_common.attributes.hiking_ratings),
        hexpo :  new sliderFilterItem('hiking_mtb_exposition', c2c_common.attributes.exposition_ratings),
        wrat :  new sliderFilterItem('snowshoe_rating', c2c_common.attributes.snowshoe_ratings),
        mbur :  new sliderFilterItem('mtb_up_rating', c2c_common.attributes.mtb_up_ratings),
        mbdr :  new sliderFilterItem('mtb_down_rating', c2c_common.attributes.mtb_down_ratings),
        rock :  new multiSelectFilterItem('rock_types', c2c_common.attributes.rock_types),
        crtyp :  new multiSelectFilterItem('climbing_outdoor_type', c2c_common.attributes.climbing_outdoor_types),
        conf :  new multiSelectFilterItem('configuration', c2c_common.attributes.route_configuration_types),
        mbroad :  new sliderIntFilterItem('mtb_length_asphalt',0,666),
        mbtrack :  new sliderIntFilterItem('mtb_length_trail',0,666),
        mbpush :  new sliderIntFilterItem('mtb_height_diff_portages',0,666),
        rlen :  new sliderIntFilterItem('route_length',0,666),
        ralt :  new sliderIntFilterItem('difficulties_height',0,666),
        rappr :  new sliderIntFilterItem('height_diff_access',0,666),
        dhei :  new sliderIntFilterItem('height_diff_difficulties',0,666),

        walt : new sliderIntFilterItem('elevation'),
        prom : new sliderIntFilterItem('prominence'),
        tmaxh : new sliderIntFilterItem('height_max'),
        tminh : new sliderIntFilterItem('height_min'),
        tmedh : new sliderIntFilterItem('height_median'),
        rqua : new sliderIntFilterItem('routes_quantity'),
        len : new sliderIntFilterItem('length'),
        hucap : new sliderIntFilterItem('capacity'),
        hscap : new sliderIntFilterItem('capacity_staffed'),

        wtyp : new multiSelectFilterItem('waypoint_type', c2c_common.attributes.waypoint_type),
        wrock : new multiSelectFilterItem('rock_types', c2c_common.attributes.rock_types),
        wfac : new multiSelectFilterItem('orientations', c2c_common.attributes.orientation_types),
        period : new multiSelectFilterItem('best_periods', c2c_common.attributes.months),
        hsta : new multiSelectFilterItem('custodianship', c2c_common.attributes.custodianship_types),
        tcsty : new multiSelectFilterItem('climbing_styles', c2c_common.attributes.climbing_styles),
        tappt : new multiSelectFilterItem('access_time', c2c_common.attributes.access_times),
        tmaxr : new sliderFilterItem('climbing_rating_max', c2c_common.attributes.climbing_ratings),
        tminr : new sliderFilterItem('climbing_rating_min', c2c_common.attributes.climbing_ratings),
        tmedr : new sliderFilterItem('climbing_rating_median', c2c_common.attributes.climbing_ratings),
        chil : new multiSelectFilterItem('children_proof', c2c_common.attributes.children_proof),
        rain : new multiSelectFilterItem('rain_proof', c2c_common.attributes.rain_proof_types),
        ctout : new multiSelectFilterItem('climbing_outdoor_types', c2c_common.attributes.climbing_outdoor_types),
        ctin : new multiSelectFilterItem('climbing_indoor_types', c2c_common.attributes.climbing_indoor_types),
        pgrat : new sliderFilterItem('paragliding_rating', c2c_common.attributes.paragliding_ratings),
        pglexp : new sliderFilterItem('exposition_rating', c2c_common.attributes.exposition_ratings),
        whtyp : new multiSelectFilterItem('weather_station_types', c2c_common.attributes.weather_station_types),
        anchq : new sliderFilterItem('equipment_ratings', c2c_common.attributes.equipment_ratings),
        tpty : new multiSelectFilterItem('public_transportation_types', c2c_common.attributes.public_transportation_types),
        tp : new multiSelectFilterItem('public_transportation_rating', c2c_common.attributes.public_transportation_rating),
        psnow : new sliderFilterItem('snow_clearance_rating', c2c_common.attributes.snow_clearance_ratings),
        ftyp : new multiSelectFilterItem('product_types', c2c_common.attributes.product_types),


        glac : {label:"glacier_gear", emptyValue:""}, // bool
        owpt : {label:"public_transport", emptyValue:""}, // bool
        bbox : {label:"Map", emptyValue:""}, // map filter
        date : {label:"Date", emptyValue:""}, // debut et fin
        plift : {label: 'lift_access', emptyValue:""},

        u: {
            label:"Users",
            isArray:true,
            emptyValue:[],
        },
    }
}])

