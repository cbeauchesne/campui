app = angular.module('campui')

app.config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('markdown', {
        url: "/markdown",
        templateUrl: "static/campui/views/markdown.html",
        controller: ['$scope', '$http', 'markdownConverter', '$sanitize', function($scope, $http, markdownConverter, $sanitize){

            $http.get('/static/campui/js/tests/tests.json').then(function(result){
                console.log(result.data)
                $scope.items = result.data

                result.data.forEach(function(item){

                    item.result = markdownConverter(item.code, $sanitize)

                    if(item.result.startsWith("<p>") && item.result.endsWith("</p>"))
                        item.result = item.result.substring(3,item.result.length-4)

                    item.success = item.result == item.html
                })
            })

            $scope.toggle = function(mode){ $scope[mode] = !$scope[mode] }
        }]
    })
}])

