/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 */


/**
 * pageTitle - Directive for set Page title - mata title
 */
function pageTitle($rootScope, $timeout) {
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
};

/**
 * sideNavigation - Directive for run metsiMenu on sidebar navigation
 */
function sideNavigation($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            // Call the metsiMenu plugin and plug it to sidebar navigation
            $timeout(function(){
                element.metisMenu();
            });
        }
    };
};

/**
 * iboxTools - Directive for iBox tools elements in right corner of ibox
 */
function iboxTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'static/views/common/ibox_tools.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.children('.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            },
                // Function for close ibox
                $scope.closebox = function () {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                }
        }
    };
}


/**
 *
 * Pass all functions into module
 */
angular.module('campui')

    .directive('pageTitle', pageTitle)
    .directive('sideNavigation', sideNavigation)
    .directive('iboxTools', iboxTools)

    .directive('activities', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                activities: '=',
            },
            template: '<img ng-repeat="activity in activities" alt="{{activity}}" ng-src="static/img/{{activity}}-24x24.png"/>',
        };
    })

    .directive('rating', function(){
        return {
            restrict: 'E',
            scope: {
                route: '=',
            },
            templateUrl: '/static/views/components/rating.html',
        };
    })


/////////////////////////////////////////////////////////////////////


    .directive('imageGallery', function(){
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                images: '=',
            },
            templateUrl: '/static/views/components/image_gallery.html',
        };
    })

    .directive('outingIbox', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                outings: '=',
            },
            templateUrl: '/static/views/components/outing_ibox.html',
        };
    })

    .provider('markdownConverter', function () {
        var opts = {simpleLineBreaks:true};
        return {
            config: function (newOpts) {
                opts = newOpts;
                opts.simpleLineBreaks=true;
            },
            $get: function () {
                return new showdown.Converter(opts);
            }
        };
    })

    .directive('markdown', ['$sanitize', 'markdownConverter', function ($sanitize, markdownConverter) {
        return {
            restrict: 'AE',
            link: function (scope, element, attrs) {
                if (attrs.markdown) {
                    scope.$watch(attrs.markdown, function (newVal) {
                        var html = newVal ? $sanitize(markdownConverter.makeHtml(newVal)) : '';
                        element.html(html);
                    });
                } else {
                    var html = $sanitize(markdownConverter.makeHtml(element.text()));
                    element.html(html);
                }
            }
        };
    }]);


c2cItems = {
    user:{
        label:"name",
        detailled_controller:function($scope, $stateParams, api, c2c){
            $scope.user = c2c.user.get($stateParams);
            $scope.outings = c2c.outings.get({query:"u=" + $stateParams.id});
        }
    },
    outing:{},
    route:{},
    article:{},
    waypoint:{},
    xreport:{},
    image:{},
}

$.each(c2cItems, (item, params) => {

    params.label = params.label ? params.label : "locales[0].title"

    angular.module('campui').directive(item + 'LinkC2c', function(){
        result = {
            restrict: 'E',
            scope: {},
            template: '<a class="c2c" href="https://www.camptocamp.org/' + item + 's/{{' + item + '.document_id}}">{{' + item + '.' + params.label + '}}</a>',
        };

        result.scope[item] = "=";

        return result;
    })

    angular.module('campui').directive(item + 'Link', function(){
        result =  {
            restrict: 'E',
            scope: {},
            template: '<a ui-sref="' + item + '({id:' + item + '.document_id})">{{' + item + '.' + params.label + '}}</a>',
        };

        result.scope[item] = "=";

        return result;
    })

    angular.module('campui').directive(item + 'List', function(){
        result =   {
            restrict: 'E',
            replace: true,
            scope: {},
            templateUrl: '/static/views/components/' + item + '_list.html',
        };

        result.scope[item + "s"] = "=";

        return result;
    })

})
