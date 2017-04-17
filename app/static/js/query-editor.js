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

app.factory('QueryEditor', ['c2c', 'currentUser', 'gettextCatalog', 'urlQuery', function(c2c, currentUser, gettextCatalog, urlQuery){

    var QueryEditor = function(scope, c2c_item){
        var _this = this

        _this.scope = scope
        _this.offset = 0
        _this.c2c_item = c2c_item

        _this.deletable = false

        _this.setQuery = function(query, doNotResetQueryModel){

            _this.currentQuery = query
            _this.deletable = currentUser.getQueryIndex(query) != -1
            _this.clonable = _this.deletable

            query = query || {url:""};
            url_query = query.url || "";

            if(_this.offset != 0)
                url_query += "&offset=" + _this.offset;

            if(this.scope.data)
                _this.scope.data.documents = []

            console.log("setQuery:",  url_query)
            c2c[_this.c2c_item + "s"].get({query:url_query}, function(data){
                    _this.scope.data = data
                    delete _this.scope.error
            }, function(response){
                    _this.scope.error = "CampToCamp error"
            })

            if(doNotResetQueryModel)
                return

            queryObject = urlQuery.toObject(query.url)
            _this.queryModel = {}

            if(queryObject.act)
                _this.queryModel.act = queryObject.act.split(",")

            if(queryObject.a){
                _this.queryModel.a = queryObject.a.split(",").map(function(item) {
                    return parseInt(item, 10);
                });
                _this.refreshAreas(undefined, _this.queryModel.a)
            }
        }

        _this.next = function(){
            _this.offset += 30;
            _this.setQuery(_this.currentQuery);
        }

        _this.previous = function(){
            if(_this.offset != 0){
                _this.offset = Math.max(0, _this.offset - 30);
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

            if(_this.queryModel.act && _this.queryModel.act.length)
                queryObject.act = _this.queryModel.act.join(",")

            if(_this.queryModel.a && _this.queryModel.a.length)
                queryObject.a = _this.queryModel.a.join(",")

            _this.currentQuery.url = urlQuery.fromObject(queryObject)
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
            result = undefined
            objectArray.forEach(function(item){
                if(item[propName]==propValue)
                    result = item
            })

            return result
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
