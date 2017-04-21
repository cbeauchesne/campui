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

app.factory('QueryEditor', ['c2c', 'currentUser', 'gettextCatalog', 'locale', 'urlQuery', 'filterItems', function(c2c, currentUser, gettextCatalog, locale, urlQuery, filterItems){

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

            _this.queryModel = urlQuery.toObject(query.url)

            //force default filter items
            this.filterItemsParams.defaults.forEach(function(item){
                _this.queryModel[item] = _this.queryModel[item] || undefined
            })


            if(_this.queryModel.a){
                _this.refreshAreas(undefined, _this.queryModel.a)
            }
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

        _this.showFilterItem = function (item){
            _this.queryModel[item] = _this.queryModel[item] || filterItems[item].emptyValue
        }

        var filterItemsParams = {
            area : {
                defaults:["atyp"],
                availables:["atyp", "qa"],
            },
            article : {
                defaults:["act"],
                availables:["act", "acat", "l", "qa"], // not atyp, keyword collision!!
            },
            image : {
                defaults:["act","a"],
                availables:["act","a","u"],
            },
            outing : {
                defaults:["act","a"],
                //todo : "date",
                availables:["act", "a", "ocond", "u", "w", "ofreq", "oglac", "r", "odif","swquan","swlu","oparka","oalt","avdate","qa","swld","swqual","l"]
            },
            route : {
                //todo : "qa","rlen","l","rock","conf","time","ddif","hexpo","rmina","mbpush","mbtrack","mbdr","mbroad","mbur","wrat","krat","hrat","mrat","irat","rappr","dhei","ralt","prat","erat","orrat","grat","arat","rrat","rexpo","frat","crtyp","srat","lrat","trat","sexpo","rmaxa"
                defaults:["act", "a"],
                availables:["act","a","rtyp","fac","hdif","w"],
            },
            waypoint : {
                //todo ?
                defaults:["wtyp"],
                availables:["wtyp"],
            },
            xreport : {
                defaults:["act","a"],
                availables:["act","a"],
            },
        }

        _this.filterItemsParams = filterItemsParams[c2c_item]
        _this.filterItems=filterItems

        //here is data that will be injected in editor
        _this.queryModel = {}

    }

    return QueryEditor

}])


app.factory('filterItems', ["c2c_common", function(c2c_common){

    var multiSelectFilterItem = function(label, values, template, pictos){
        this.label = label
        this.values = values
        this.template = template
        this.isArray = true
        this.emptyValue = undefined
        this.pictos = pictos
    }

    var rangeFilterItem = function(label, values, template){
        this.label = label
        this.values = values.slice()
        this.template = template
        this.isArray = true
        this.emptyValue = [values[0], values[values.length-1]]
    }

    var rangeIntegerFilterItem = function(label, floor, ceil, step){
        this.label = label
        this.template = "slider"
        this.isArray = true
        this.floor = floor
        this.ceil = ceil
        this.step = step
        this.emptyValue = [floor, ceil]
    }

    var c2cSelectFilterItem = function(label, c2c_item){
        this.label = label
        this.c2c_item = c2c_item
        this.values = []
        this.template = "c2c_select"
        this.isArray = true
    }

    return {
        a : new c2cSelectFilterItem("Areas", "area"),
        acat : new multiSelectFilterItem("Categories", c2c_common.attributes.article_categories , "select_multi"),
        act : new multiSelectFilterItem("Activities", c2c_common.attributes.activities, "select_multi", true),
        atyp : new multiSelectFilterItem("Types", c2c_common.attributes.area_types, "select_multi"),
        avdate : new multiSelectFilterItem("Avalanche signs", c2c_common.attributes.avalanche_signs, "select_multi"),
        ddif: new rangeIntegerFilterItem("Elevation gain", 0,10000,100),
        fac : new multiSelectFilterItem("Orientations", c2c_common.attributes.orientation_types, "select_multi"),
        hdif : new rangeIntegerFilterItem("Elevation loss", 0,10000,100),
        l: new multiSelectFilterItem("Language", c2c_common.attributes.default_langs, "select_multi"),
        oalt : new rangeIntegerFilterItem("Max altitude", 0,8850,100),
        ocond : new rangeFilterItem("Conditions", c2c_common.attributes.condition_ratings, "slider_inverse"),
        odif : new rangeIntegerFilterItem("Elevation gain", 0,10000,100),
        ofreq : new rangeFilterItem("Crowding", c2c_common.attributes.frequentation_types, "slider"),
        oglac : new rangeFilterItem("Glacier rating", c2c_common.attributes.glacier_ratings, "slider"),
        oparka : new rangeIntegerFilterItem("Altitude of access point", 0,5000,100),
        qa : new rangeFilterItem("Completeness", c2c_common.attributes.quality_types, "slider"),
        rmaxa: new rangeIntegerFilterItem("Max altitude", 0,8850,100),
        rmina: new rangeIntegerFilterItem("Min altitude", 0,6000,100),
        r: new c2cSelectFilterItem("Routes", "route"),
        rtyp : new multiSelectFilterItem("Types", c2c_common.attributes.route_types, "select_multi"),
        swld : new rangeIntegerFilterItem("Snow elevation (down)", 0,4000,100),
        swqual : new rangeFilterItem("Snow quality", c2c_common.attributes.condition_ratings, "slider_inverse"),
        swquan : new rangeFilterItem("Snow quantity", c2c_common.attributes.condition_ratings, "slider_inverse"),
        swlu : new rangeIntegerFilterItem("Snow elevation (up)", 0,4000,100),
        w : new c2cSelectFilterItem("Waypoints", "waypoint"),
        walt: new rangeIntegerFilterItem("Elevation", 0,8850,100),
        wtyp : new multiSelectFilterItem("Type", c2c_common.attributes.waypoint_types, "select_multi"),

        owpt : {label:"public_transport"}, // bool
        bbox : {label:"Map"}, // map filter
        date : {label:"Date"}, // debut et fin
        time: {label:"XXX"}, //

        u: {
            label:"Users",
            isArray:true
        },
    }
}])
