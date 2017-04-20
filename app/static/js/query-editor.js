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

app.factory('QueryEditor', ['c2c', 'currentUser', 'gettextCatalog', 'locale', 'urlQuery', function(c2c, currentUser, gettextCatalog, locale, urlQuery){

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

        _this.refreshAreas = function(userRequests, currentModels){

            if(userRequests){
                c2c.search.get({q:userRequests}, function(data){

                    _this.metadata.areas.forEach(function(item){
                        delete item.visible
                    })
                    data.areas.documents.forEach(function(newObject){
                        newObject.visible=true
                        smartPush(_this.metadata.areas, newObject, "document_id")
                    })
                })
            }

            if(currentModels){
                currentModels.forEach(function(a_id){
                    var item = c2c.area.get({id:a_id}, function(newObject){
                        newObject.visible=true
                        smartPush(_this.metadata.areas, newObject, "document_id")
                    })

                    item.document_id = a_id

                    smartPush(_this.metadata.areas, item, "document_id")
                })
            }
        }

        var smartPush = function(objectArray, newObject, propName){
            existingObject = findObject(objectArray, propName, newObject.document_id)

            if(!existingObject)
               _this.metadata.areas.push(newObject)
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
            _this.queryModel[item] = _this.queryModel[item] || undefined
        }

        var filterItemsParams = {
            route : {
                defaults:["act", "a"],
                availables:["act","a"],
            },
            article : {
                defaults:["act"],
                availables:[],
            },
            waypoint : {
                defaults:["wtyp"],
                availables:[],
            },
            area : {
                defaults:["atyp"],
                availables:[],
            },
            xreport : {
                defaults:["act","a"],
                availables:[],
            },
            outing : {
                defaults:["act","a"],
                availables:[],
            },
        }

        _this.filterItemsParams = filterItemsParams[c2c_item]

        _this.filterItems = {
            a : {label:"areas"},
            act : {label:"activities"},
            acat : {label:"XXX"}, // article category
            atyp : {label:"XXX"}, // area type
            avdate : {label:"XXX"}, //
            bbox : {label:"XXX"}, // map filter
            date : {label:"XXX"}, //
            ddif: {label:"XXX"}, //
            fac: {label:"XXX"}, //
            hdif: {label:"XXX"}, //
            l: {label:"XXX"}, //

            ocond : {label:"XXX"},
            odif : {label:"XXX"}, //
            oparka : {label:"XXX"}, //
            oalt : {label:"XXX"}, //
            owpt : {label:"XXX"}, //
            oglac : {label:"XXX"}, //
            ofreq : {label:"XXX"}, //

            qa : {label:"XXX"}, //

            r: {label:"routes"}, //

            rmaxa: {label:"XXX"}, //
            rmina: {label:"XXX"}, //
            rtyp: {label:"XXX"}, // route type

            swlu : {label:"XXX"}, //
            swld : {label:"XXX"}, //
            swqual : {label:"XXX"}, //
            swquan : {label:"XXX"}, //
            time: {label:"XXX"}, //
            u: {label:"users"}, //
            w: {label:"waypoints"}, //
            walt: {label:"XXX"}, // Waypoint altitude
            wtyp: {label:"XXX"}, // Waypoint type
        }


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
        _this.queryModel = {act:[]}

    }

    return QueryEditor

}])
