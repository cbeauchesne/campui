app = angular.module('campui')

app.factory('QueryEditor', ['c2c', 'currentUser', 'gettextCatalog', 'urlQuery', function(c2c, currentUser, gettextCatalog, urlQuery){

    var QueryEditor = function(scope, c2c_item){
        var _this = this

        _this.scope = scope
        _this.offset = 0
        _this.c2c_item = c2c_item

        _this.save = function(){
            if(currentUser.getQueryIndex(_this.currentQuery) == -1 && (_this.currentQuery.url || _this.currentQuery.name))
                currentUser.addQuery(_this.currentQuery)

            currentUser.save()
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

        _this.setQuery = function(query){

            _this.currentQuery = query

            query = query || {url:""};
            url_query = query.url || "";

            if(_this.offset != 0)
                url_query += "&offset=" + _this.offset;

            if(this.scope.data)
                _this.scope.data.documents = []

            c2c[_this.c2c_item + "s"].get({query:url_query},
                function(data){
                    _this.scope.data = data
                    delete _this.scope.error
                },
                function(response){
                    _this.scope.error = "CampToCamp error"
                })


            queryObject = urlQuery.toObject(query.url)

            if(queryObject.act){
                _this.queryModel.act = queryObject.act.split(",")
            }
        }

        //will save current html filters into current query, and call setQuery
        _this.apply = function(){
            queryObject = {}

            if(_this.queryModel.act && _this.queryModel.act.length)
                queryObject.act = _this.queryModel.act.join(",")

            _this.currentQuery.url = urlQuery.fromObject(queryObject)
            _this.setQuery(_this.currentQuery)
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
                "snow_ice_mixed",
                "mountain_climbing",
                "rock_climbing",
                "ice_climbing",
                "hiking",
                "snowshoeing",
                "paragliding",
                "mountain_biking",
            ]
        }

        //here is data that will be injected in editor
        _this.queryModel = {act:[]}

    }

    return QueryEditor

}])