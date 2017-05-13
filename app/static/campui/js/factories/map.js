
app = angular.module('campui').factory("mapData", ["NgMap", "c2c", function(NgMap, c2c){
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
