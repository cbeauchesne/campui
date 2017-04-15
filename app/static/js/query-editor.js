app = angular.module('campui')

app.factory('QueryEditor', ['c2c', 'currentUser', function(c2c, currentUser){

    var QueryEditor = function(scope, c2c_item){
        var _this = this

        _this.scope = scope
        _this.visible = false
        _this.offset = 0
        _this.c2c_item = c2c_item

        _this.toggle = function(){
            _this.visible = !_this.visible
        }

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

            query = query || {};
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
        }

    }

    return QueryEditor

}])