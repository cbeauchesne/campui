app = angular.module('campui')


app.directive('oldDocumentLink', [function () {
    return {
        restrict: 'E',
        scope: {"document":"="},
        template: '<a ui-sref="oldDocument({name:document.name, hid:document.hid})">Version&nbsp;' +
                    '<span translate>as of</span>&nbsp;' +
                    '{{document.date | date }}&nbsp;' +
                    '<span translate>at</span>&nbsp;' +
                    '{{document.date | date :"HH:mm" }}</a>'
    }
}])