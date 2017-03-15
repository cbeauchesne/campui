
(function () {
    angular.module('campui', [
        'ui.router',                    // Routing
        'oc.lazyLoad',                  // ocLazyLoad
        'ui.bootstrap',                 // Ui Bootstrap
        'ui.grid',                      // ui-grid
        'ui.grid.autoResize',
        'ngCookies',
        'ngResource',
        'angular.filter',
        'ui.codemirror'
    ])

    angular.module('core.phone', ['ngResource']);
})();

