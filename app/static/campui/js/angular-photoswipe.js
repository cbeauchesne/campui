/*
	angular-photoswipe v0.2.0
	(c) 2016 Massimiliano Sartoretto <massimilianosartoretto@gmail.com>
	License: MIT
*/

'format amd';
/* global define */


angular.module("campui").service('photoswipe', ["locale", function(locale){
    var _this = this

    // https://github.com/dimsemenov/PhotoSwipe/issues/580
    // history is important, see comment of mutac
    _this.opts={
        index:0,
        history:false
    }

    _this.getters = []
    _this.slides = []

    _this.showGallery = function(document_id) {
        _this.opts.index = 0;
        _this.slides.length = 0
        var i = 0

        _this.getters.forEach(function(getter){
            getter().forEach(function(image){

                _this.slides.push({
                    src:"https://media.camptocamp.org/c2corg_active/" + image.filename.replace('.', 'BI.').replace('.svg', '.jpg'),
                    w:0,h:0,
                    title:locale.get(image).title,
                    document_id:image.document_id,
                })

                if(document_id==image.document_id)
                    _this.opts.index = i

                i++
            })
        })

        _this.open = true;
    }

    _this.closeGallery = function () {
        _this.open = false;
    };
}]);


(function () {
  'use strict';

  function ngPhotoswipe(angular, Photoswipe) {

    return angular
      .module('ngPhotoswipe', [])
      .directive('ngPhotoswipe', ["$compile", "$http", "$templateCache", "c2c", "photoswipe", ngPhotoswipeDirective]);

    function ngPhotoswipeDirective($compile, $http, $templateCache, c2c, photoswipe) {
      return {
        restrict: 'AE',
        replace: true,
        scope: {
        },
        link: linkFn
      };

      function linkFn(scope, iElement, iAttrs) {
        scope.template = 'static/campui/views/components/ng-photoswipe.html';
        scope.photoswipe = photoswipe
        scope.options = photoswipe.opts
        scope.slides = photoswipe.slides

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

          scope.gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default || false, scope.slides, scope.options);

          // Image loaded
          scope.details = {}
          scope.gallery.listen('gettingData', function(index, item) {

              if(!scope.details[item.document_id])
                  c2c.image.get({id:item.document_id}, function(details){
                    scope.details[item.document_id] = details
                    console.log(details)
                  })

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
                scope.photoswipe.open = false
            });
          });

          scope.gallery.listen('afterChange', function () {
            scope.safeApply(function () {
              scope.item = scope.gallery.currItem;
            });
          });
        };

        scope.$watch('photoswipe.open', function (nVal, oVal) {
          if (nVal != oVal) {
            if (nVal) {
              startGallery();
            }
           else if (!nVal && scope.gallery) {
            scope.gallery.close();
            scope.gallery = null;
          }
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
