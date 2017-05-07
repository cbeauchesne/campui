
app = angular.module('campui')

app.directive('pageTitle', ['$rootScope','$timeout',function ($rootScope, $timeout) {
    return {
        link: function(scope, element) {
            var listener = function(event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'CampUI';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'CampUI | ' + toState.data.pageTitle;
                $timeout(function() {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
}])


app.directive('iboxTools', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        scope: false,
        templateUrl: 'static/campui/views/common/ibox_tools.html',
    };
}])

app.directive('license', function(){
    return {
        restrict: 'EA',
        scope: {
            type:"=",
            id:"=",
            cc:"="
        },
        templateUrl: 'static/campui/views/components/license.html',

    }
})



app.directive('activities', function(){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            activities: '=',
        },
        template: '<img ng-repeat="activity in activities" alt="{{activity}}" ng-src="static/campui/img/{{activity}}-16x16.png"></img>',
    };
})

app.directive('rating', function(){
    return {
        restrict: 'E',
        scope: {
            route: '=',
        },
        templateUrl: '/static/campui/views/components/rating.html',
    };
})

app.directive('loadingInfo', function(){
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: '/static/campui/views/components/loading_info.html',
    };
})


app.directive('gallery', function(){
    return {
        restrict: 'EA',
        replace: false,
        scope: {
            images: '=',
        },
        templateUrl: '/static/campui/views/components/image_gallery.html',
        controller:["$scope","locale","photoswipe", function($scope, locale, photoswipe){
            // https://github.com/dimsemenov/PhotoSwipe/issues/580
            // history is important, see comment of mutac
            $scope.photoswipe = photoswipe
            photoswipe.getters.push(function(){
                return $scope.images
            })
        }]
    };
})

app.directive('outingIbox', function(){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            outings: '=',
        },
        templateUrl: '/static/campui/views/components/outing_ibox.html',
    };
})

app.directive('authorLink', function(){
    return {
        restrict: 'E',
        scope: {author:"="},
        template: '<a ui-sref="stories({"u":author.user_id})">{{author.name}}</a>',
    };
})

app.directive('qualityIcon', function(){
    return {
        restrict: 'E',
        scope: {quality:"="},
        replace: true,
        template: '<i class="fa fa-star quality-{{quality}}"></i>',
    };
})

app.directive('conditionIcon', function(){
    tooltip = "{{'Conditions : ' | translate }}{{condition | translate}}"

    return {
        restrict: 'E',
        scope: {condition:"="},
        replace: true,
        template: '<span class="condition-{{condition}}" uib-tooltip="' + tooltip + '"><i ng-show="condition" class="fa fa-circle"></i></span>',
    };
})

app.directive('areas', function(){
    return {
        restrict: 'EA',
        replace:true,
        scope: {areas:"="},
        template: '<span ng-repeat="area in areas"><area-link area="area"></area-link>{{$last ? "" : ", "}}</span>',
    };
})

app.directive('queryEditor', function(){
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'static/campui/views/components/query_editor.html',
    };
})

app.directive('outingImages', function(){
    result =   {
        restrict: 'E',
        replace: true,
        scope: {
            item:"=",
            itemType:"=?",
        },
        template: '<a class="badge badge-success" ui-sref="outingImages({[item.type || itemType]:item.document_id})" translate>images</a>',
    };
    return result;
})

app.directive('stories', function(){
    result =   {
        restrict: 'E',
        replace: true,
        scope: {
            item:"=",
            itemType:"=?",
        },
        template: '<a class="badge badge-success" ui-sref="stories({[item.type || itemType]:item.document_id})" translate>stories</a>',
    };
    return result;
})


var c2cItems = {
    user:{
        label:"name",
        detailled_controller: "linkedOutingsController",
        itemLinkTemplate: '<a ui-sref="stories({u:user.user_id || user.document_id})">{{user.name}}</a>'
    },
    outing:{},
    route:{
        label_prefix:"title_prefix",
    },
    article:{},
    waypoint:{},
    xreport:{},
    image:{},
    area:{},
}

$.each(c2cItems, function(item, params){

    var controller = ['$scope','locale', function($scope, locale){
        $scope.getLocale = function(item){return locale.get(item)}
    }]

    params.label = params.label ? item + '.' + params.label : 'getLocale(' + item + ').title'

    var label = '{{' + params.label + '}}';

    params.itemLinkTemplate = params.itemLinkTemplate ?
                                params.itemLinkTemplate :
                                '<a ui-sref="' + item + '({id:' + item + '.document_id})">' + label + '</a>'

    if(params.label_prefix){
        var prefixModel = 'getLocale(' + item + ').' + params.label_prefix
        label = '<span ng-if="' + prefixModel + '">{{' + prefixModel + '}} : </span>' + label
    }

    app.directive(item + 'LinkC2c', function(){

        var result = {
            restrict: 'E',
            scope: {},
            template: '<a target="_blank" href="https://www.camptocamp.org/' + item + 's/{{' + item + '.document_id}}">' + label + '</a>',
            controller: controller
        };

        result.scope[item] = "=";

        return result;
    })

    app.directive(item + 'Link', function(){
        var result =  {
            restrict: 'E',
            scope: {},
            template: params.itemLinkTemplate,
            controller: controller
        };

        result.scope[item] = "=";

        return result;
    })

    var Item = item.charAt(0).toUpperCase() + item.slice(1) //capitalize first letter

    app.directive('linked' + Item + 's', function(){
        var result =   {
            restrict: 'E',
            replace: true,
            scope: {
                item:"=",
                itemType:"=?",
            },
            template: '<a class="badge badge-success" ui-sref="' + item + 's({[item.type || itemType]:item.document_id})" translate>' + item + 's</a>',
        };
        return result;
    })

    app.directive(item + 'List', function(){
        var result =   {
            restrict: 'E',
            replace: true,
            scope: {},
            templateUrl: '/static/campui/views/components/' + item + '_list.html',
        };

        result.scope[item + "s"] = "=";

        return result;
    })
})


app.directive('filterItem', ['filterItems', function (filterItems) {

    return {
        restrict: 'E',
        scope: {"itemId":"=",qe:"=queryEditor"},
        template: '<div ng-if="itemId" ng-include="_templateUrl"></div>',
        link: function(scope, element, attrs) {
            scope.filterItem = filterItems[scope.itemId]
            scope._templateUrl = '/static/campui/views/filterItems/' + ( scope.filterItem.template || scope.itemId ) + '.html'
        }
    }
}])
