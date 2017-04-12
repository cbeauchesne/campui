/*
	angular-photoswipe v0.2.0
	(c) 2016 Massimiliano Sartoretto <massimilianosartoretto@gmail.com>
	License: MIT
*/

'format amd';
/* global define */

(function () {
  'use strict';

  function ngPhotoswipe(angular, Photoswipe) {

    return angular
      .module('ngPhotoswipe', [])
      .directive('ngPhotoswipe', ["$compile", "$http", "$templateCache", ngPhotoswipeDirective]);

    function ngPhotoswipeDirective($compile, $http, $templateCache) {
      return {
        restrict: 'AE',
        replace: true,
        scope: {
          open: '=',
          options: '=',
          slides: '=',
          slideSelector: '@',
          template: '@',
          onClose: '&'
        },
        link: linkFn
      };

      function linkFn(scope, iElement, iAttrs) {
        scope.template = scope.template || 'static/views/components/ng-photoswipe.html';

        $http
          .get(scope.template, { cache: $templateCache })
          .success(function(html) {
            var template = angular.element(html);
            iElement.append($compile(template)(scope));
          });

        scope.start = function () {
          scope.open = true;
          startGallery();
        };

        var startGallery = function () {
          var pswpElement = document.querySelectorAll('.pswp')[0];

          if (angular.isUndefined(scope.options.getThumbBoundsFn) &&
              angular.isDefined(scope.slideSelector)) {

            scope.options = angular.merge({}, {

              getThumbBoundsFn: function(index) {
                var thumbnail = document.querySelectorAll(scope.slideSelector)[index];
                var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                var rect = thumbnail.getBoundingClientRect();
                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
              }

            }, scope.options);
          }

          scope.gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default || false, scope.slides, scope.options);

          // Image loaded
          scope.gallery.listen('gettingData', function(index, item) {
              if (item.w < 1 || item.h < 1) { // unknown size
                  var img = new Image();
                  img.onload = function() { // will get size after load
                      item.w = this.width; // set image width
                      item.h = this.height; // set image height
                      scope.gallery.invalidateCurrItems(); // reinit Items
                      scope.gallery.updateSize(true); // reinit Items
                  }
                  img.src = item.src; // let's download image
              }
          });

          scope.gallery.init();
          scope.item = scope.gallery.currItem;

          scope.gallery.listen('destroy', function () {
            scope.safeApply(function () {
              (scope.onClose || angular.noop)();
            });
          });

          scope.gallery.listen('afterChange', function () {
            scope.safeApply(function () {
              scope.item = scope.gallery.currItem;
            });
          });
        };

        scope.$watch('open', function (nVal, oVal) {
          if (nVal != oVal) {
            if (nVal) {
              startGallery();
            }
          } else if (!nVal && scope.gallery) {
            scope.gallery.close();
            scope.gallery = null;
          }
        });

        scope.safeApply = function(fn) {
          var phase = this.$root.$$phase;
          if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        };

        scope.$on('destroy', function () {
          scope.gallery = null;
        });
      }
    }
  }

  if (typeof define === 'function' && define.amd) {
		define(['angular', 'photoswipe'], ngPhotoswipe);
	} else if (typeof module !== 'undefined' && module && module.exports) {
		ngPhotoswipe(angular, require('photoswipe'));
		module.exports = 'ngPhotoswipe';
	} else {
		ngPhotoswipe(angular, (typeof global !== 'undefined' ? global : window).Photoswipe);
	}
})();
