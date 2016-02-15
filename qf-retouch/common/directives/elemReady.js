'use strict';

angular.module('app.common').directive('elemReady', function ($parse, $timeout) {
    return {
        restrict: 'A',
        link: function ($scope, elem, attrs) {
            elem.ready(function () {
                $timeout(function () {
                    var func = $parse(attrs.elemReady);
                    func($scope);
                }, 0);
            })
        }
    }
});