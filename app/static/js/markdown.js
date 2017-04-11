
app = angular.module('campui')

app.provider('markdownConverter', function () {
    var opts = {
        simpleLineBreaks : true,
        headerLevelStart : 2,
        simplifiedAutoLink: true,
        extensions : ['c2c_folies'],
        };

    var c2c_folies = function () {
        var italic = {
            type: 'lang',
            regex: /\[i\](.*)\[\/i\]/g,
            replace: function (match, text) {
                return '<i>'+ text + '</i>';
            }
        };

        var bold = {
            type: 'lang',
            regex: /\[b\](.*)\[\/b\]/g,
            replace: function (match, text) {
                return '<strong>'+ text + '</strong>';
            }
        };

        var img = {
            type: 'lang',
            regex: /\[img=([\d]+)( right| center| big| inline)*\/\]/g,
            replace: function (match, imgId, position, size) {
                return '<img src="https://api.camptocamp.org/images/proxy/' + imgId + '?size=MI" />';
            }
        };

        var imgLegend = {
            type: 'lang',
            regex: /\[img=([\d]+)( right| center| big| inline)*\]([^\[]*)\[\/img\]/g,
            replace: function (match, imgId, position, legend) {
                console.log(match,imgId,position,legend)
                return '<img src="https://api.camptocamp.org/images/proxy/' + imgId + '?size=MI" />';
            }
        };

        var url = {
            type: 'lang',
            regex: /\[url\]([^\[]*)\[\/url\]/g,
            replace: function (match, url) {
                return '<a href="' + url + '">' + url + '</a>';
            }
        };

        var url2 = {
            type: 'lang',
            regex: /\[url=([^\]]+)\]([^\[]*)\[\/url\]/g,
            replace: function (match, url, text) {
                return '<a href="' + url + '">' + text + '</a>';
            }
        };

        var c2cItem = {
            type: 'lang',
            regex: /\[\[(waypoint|route)s\/([\d]+)(\/fr)?\|([^\]]*)\]\]/g,
            replace: function (match, item, id, lang, text) {
                return '<a href="' + item + '/' + id + '">' + text + '</a>';
            }
        };

        return [italic, bold, img, imgLegend, url, url2, c2cItem];
    }

    showdown.extension('c2c_folies', c2c_folies);

    return {
        $get: function () {

            return new showdown.Converter(opts);
        }
    };
})

app.directive('markdown', ['$sanitize', 'markdownConverter', function ($sanitize, markdownConverter) {
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
}])
