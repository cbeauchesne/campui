var app = angular.module('campui')

app.controller("statisticsController", ["$ocLazyLoad", "analytics",function($ocLazyLoad, analytics){
    "use strict";
    var _this = this
    this.data = analytics.statistics.get()

    $ocLazyLoad.load("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js").then(function() {
        _this.data.$promise.then(function(){

            console.log(_this.data)

            var ri = function(){
                return Math.floor(Math.random() * 128)
            }

            var dataset = function(label, backgroundColor){
                return {
                    label : label || "(home)",
                    data : new Array(20).fill(0),
                    backgroundColor : backgroundColor
                }
            }

            var datasets = {
                "" : dataset("","blue"),
                "route" : dataset("route","red"),
                "outing" : dataset("outing","green"),
                "waypoint" : dataset("waypoint","gold"),
                "outings" : dataset("outings","purple"),
            }
            var dates = {}
            var pageStates = {}

            _this.data.page_states.forEach(function(p){
                pageStates[p.id] = p.name
            })

            _this.data.statistics.forEach(function(d){
                var date = d.date
                var pageState = pageStates[d.page_state]

                if(!dates[date])
                    dates[date] = Object.keys(dates).length

                if(!datasets[pageState]){
                    var color = []

                    datasets[pageState] = dataset(pageState, 'rgba(' + ri() + ',' + ri() + ',' + ri() + ',0.66)')
                }

                var data = datasets[pageState].data
                var pos = dates[date]

                data[pos] = (data[pos] ? data[pos] : 0 ) + d.count
            })

            console.log(Object.keys(dates))
            console.log(Object.values(datasets))

            var myChart = new Chart(document.getElementById("statistics").getContext("2d"), {
                type: 'bar',
                data: {
                    labels: Object.keys(dates),
                    datasets: Object.values(datasets)
                },
                options: {
                    legend:{
                        position:'left',
                    },
                    scales: {
                        xAxes: [{
                            stacked:true,
                        }],
                        yAxes: [{
                            stacked:true,
                            ticks: {
                                beginAtZero:true,
                            }
                        }]
                    }
                }
            })
        })
    }, function(e) {
        console.error(e);
    })

}])
