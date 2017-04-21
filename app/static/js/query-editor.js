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

            currentModels = _this.queryModel[itemId]
            filterItem = filterItems[itemId]

            if(userRequests){
                c2c.search.get({q:userRequests}, function(data){

                    filterItem.values.forEach(function(item){
                        delete item.visible
                    })
                    data.areas.documents.forEach(function(newObject){
                        newObject.visible=true
                        smartPush(filterItem.values, newObject, "document_id")
                    })
                })
            }

            if(currentModels){
                currentModels.forEach(function(a_id){
                    var item = c2c.area.get({id:a_id}, function(newObject){
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
            route : {
                defaults:["act", "a"],
                availables:["act","a","rtyp","fac"],
            },
            article : {
                defaults:["act"],
                availables:["act", "atyp", "acat"],
            },
            waypoint : {
                defaults:["wtyp"],
                availables:["wtyp"],
            },
            area : {
                defaults:["atyp"],
                availables:["atyp"],
            },
            xreport : {
                defaults:["act","a"],
                availables:["act","a"],
            },
            outing : {
                defaults:["act","a"],
                availables:["act", "a", "ocond", "u", "ofreq", "oglac"]
            },
            image : {
                defaults:["act","a"],
                availables:["act","a","u"],
            },
        }

        _this.filterItemsParams = filterItemsParams[c2c_item]
        _this.filterItems=filterItems

        _this.metadata = {
            activities : [
                "skitouring",
                "snow_ice_mixed",
                "mountain_climbing",
                "rock_climbing",
                "ice_climbing",
                "hiking",
                "snowshoeing",
                "paragliding",
                "mountain_biking",
            ],
            areas : [],
        }

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
        this.values = values
        this.template = template
        this.isArray = true
        this.emptyValue = [values[0], values[values.length-1]]
    }

    return {
        a : {
            label:"Areas",
            isArray:true,
            values:[]
        },

        act : new multiSelectFilterItem("Activities", c2c_common.attributes.activities, "select_multi", true),
        acat : new multiSelectFilterItem("Categories", c2c_common.attributes.article_categories , "select_multi"),
        atyp : new multiSelectFilterItem("Types", c2c_common.attributes.article_types, "select_multi"),
        avdate : new multiSelectFilterItem("Avalanche signs", c2c_common.attributes.avalanche_signs, "select_multi"),

        bbox : {label:"Map"}, // map filter
        date : {label:"Date"}, // debut et fin
        ddif: {label:"height_diff_down"}, // int range
        fac : new multiSelectFilterItem("Orientations", c2c_common.attributes.orientation_types, "select_multi"),
        hdif: {label:"height_diff_up"}, // int range
        l: {label:"XXX"}, //

        ocond : new rangeFilterItem("Conditions", c2c_common.attributes.condition_ratings, "slider_inverse"),

        odif : {label:"Elevation loss"}, // int range
        oparka : {label:"Altitude of access point"}, // int range
        oalt : {label:"Max altitude"}, // int range
        owpt : {label:"public_transport"}, // bool

        oglac : new rangeFilterItem("Glacier rating", c2c_common.attributes.glacier_ratings, "slider"),
        ofreq : new rangeFilterItem("Crowding", c2c_common.attributes.frequentation_types, "slider"),
        qa : new rangeFilterItem("Completeness", c2c_common.attributes.quality_types, "slider"),

        r: {
            label:"Routes",
            isArray:true
        }, //

        rmaxa: {label:"elevation_max"}, // int range
        rmina: {label:"elevation_min"}, // int range
        rtyp : new multiSelectFilterItem("Types", c2c_common.attributes.route_types, "select_multi"),

        swlu : {label:"elevation_up_snow"}, // int range
        swld : {label:"elevation_down_snow"}, // int range

        swqual : new rangeFilterItem("Snow quality", c2c_common.attributes.condition_ratings, "slider_inverse"),
        swquan : new rangeFilterItem("Snow quantity", c2c_common.attributes.condition_ratings, "slider_inverse"),

        time: {label:"XXX"}, //

        u: {
            label:"Users",
            isArray:true
        },

        w: {
            label:"Waypoints",
            isArray:true
        },

        walt: {label:"Waypoint altitude"}, // int range
        wtyp : new multiSelectFilterItem("Type", c2c_common.attributes.waypoint_types, "select_multi"),
    }
}])
