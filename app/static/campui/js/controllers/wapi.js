
var app = angular.module('campui')

app.controller("editController", ["wapi", "$stateParams", "$state", function(wapi, $stateParams, $state){
    var _this = this

    this.document = wapi.document.get($stateParams,
        function(document){
            document.update = function(){
                document.comment = document.newComment
                delete document.newComment
                _this.saving = true
                wapi.document.update({name:$stateParams.name}, {document:document},
                    function(){
                        delete _this.saving
                        delete _this.error
                        $state.go("document", {"name":$stateParams.name})
                    },
                    function(response){
                        delete _this.saving
                        _this.error = response.statusText
                    }
                )
            }
        }
    )
}])

app.controller("createController", ["wapi", "$stateParams", "$state", function(wapi, $stateParams, $state){
    var _this = this
    this.document = {name:$stateParams.name, comment:"creation"}

    if($stateParams.name){
        this.namespace = $stateParams.name.split("/")[0]
    }

    this.document.create = function(){
        _this.saving = true
        wapi.document.create({name:_this.document.name}, {document:_this.document},
            function(){
                delete _this.saving
                delete _this.error
                $state.go("document", {"name":_this.document.name})
            },
            function(response){
                delete _this.saving
                _this.error = response.statusText
            }
        )
    }
}])

app.controller("diffController", ["wapi", "$stateParams", function(wapi, $stateParams){
    var _this = this

    this.name = $stateParams.name

    var computeDiff = function(){
        if(!_this.oldDoc || !_this.newDoc)
            return

        _this.contentDiff = JsDiff.diffLines(_this.oldDoc.content,
                                                    _this.newDoc.content)
        _this.contentDiff.forEach(function (d){
          //  if(!d.value) console.log(d)
            d.lines = d.value.split("\n")
        })

        console.log("diffing", _this.contentDiff)
    }

    var delNewDoc = function(r){ delete _this.newDoc }
    var delOldDoc   = function(r){ delete _this.oldDoc }

    if($stateParams.offset=='next'){
        this.oldDoc = wapi.document.get({name:$stateParams.name, hid:$stateParams.hid}, computeDiff, delOldDoc)
        this.newDoc = wapi.document.get({name:$stateParams.name, hid:$stateParams.hid, offset:"next"},
                        computeDiff, delNewDoc)
    }
    else{
        this.oldDoc = wapi.document.get({name:$stateParams.name, hid:$stateParams.hid, offset:"prev"},
                        computeDiff, delOldDoc)
        this.newDoc = wapi.document.get({name:$stateParams.name, hid:$stateParams.hid}, computeDiff, delNewDoc)
    }
}])

app.controller("wapiController", ["wapi", "$stateParams", "currentUser", function(wapi, $stateParams, currentUser){
    var getRawUrl = function($stateParams){
        var rawUrl = '/api/document/' + $stateParams.name + '?view=raw'
        rawUrl += $stateParams.hid? "&hid=" + $stateParams.hid : ""
        rawUrl += $stateParams.offset? "&offset=" + $stateParams.offset : ""

        return rawUrl
    }

    var _this = this

    if($stateParams.namespace){
        $stateParams.name = $stateParams.namespace + "/" + $stateParams.name
        delete $stateParams.namespace
    }

    this.currentUser = currentUser
    this.namespace = $stateParams.name.split("/")[0]
    this.rawUrl = getRawUrl($stateParams)
    this.params = $stateParams

    if(this.namespace=="Discussion"){

        this.newSubject = {
            save:function(){
                _this.newSubject.saving = true
                wapi.discussion.addSubject({name:$stateParams.name},
                                           {title:this.title, response:this.response},
                                           function(doc){
                                                delete _this.newSubject.saving
                                                delete _this.newSubject.title
                                                delete _this.newSubject.response
                                                delete _this.newSubject.error
                                                delete _this.showNewSubject
                                                _this.document=doc
                                           },
                                           function(error){
                                                _this.newSubject.error = error.statusText
                                                delete _this.newSubject.saving
                                           })

            }
        }

        this.addResponse = function(subjectId, response){
            _this[subjectId] = {saving : true}

            wapi.discussion.addResponse({name:$stateParams.name},
                                       {subjectId:subjectId, response:response},
                                       function(doc){
                                            delete _this[subjectId]
                                            _this.document=doc
                                       },
                                       function(error){
                                            delete _this[subjectId].saving
                                            _this[subjectId].error = error.statusText
                                       })
        }
    }

    this.document = wapi.document.get($stateParams,
        function(document){ //success

        },

        function(response){ //error
            _this.error = response
            _this.error.notFound = response.status == 404
        }
    )

    this.isOld = typeof $stateParams.hid !== 'undefined'
}])

app.controller("recentchangesController", ["wapi","$stateParams", function(wapi, $stateParams){
    this.versions = wapi.recentChanges.get($stateParams)
    this.params = $stateParams
    $stateParams.offset = parseFloat($stateParams.offset || 0)
    $stateParams.limit = parseFloat($stateParams.offset || 30)
}])


app.controller("contributionsController", ["wapi", "$stateParams", function(wapi, $stateParams){
    this.versions = wapi.contributions.get($stateParams)
    this.params = $stateParams
    $stateParams.offset = parseFloat($stateParams.offset || 0)
    $stateParams.limit = parseFloat($stateParams.offset || 30)
}])

app.controller("historyController", ["wapi", "$stateParams", function(wapi, $stateParams){
    this.versions = wapi.document.history({name:$stateParams.name})
}])