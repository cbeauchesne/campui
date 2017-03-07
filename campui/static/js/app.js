/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 */
(function () {
    angular.module('campui', [
        'ui.router',                    // Routing
        'oc.lazyLoad',                  // ocLazyLoad
        'ui.bootstrap',                 // Ui Bootstrap
        'ui.grid',                      // ui-grid
        'ui.grid.autoResize',
        'ngCookies',
    ])
    angular.module('core.phone', ['ngResource']);
})();

