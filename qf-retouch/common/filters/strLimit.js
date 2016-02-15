'use strict';

angular.module('qf-retouch.common').filter('strLimit', ['$filter', function ($filter) {
    /*going to use css3 ellipsis instead of this*/
    return function (input, limit) {
        if (input.length <= limit) {
            return input;
        }
        return $filter('limitTo')(input, limit) + '...';
    };
}]);