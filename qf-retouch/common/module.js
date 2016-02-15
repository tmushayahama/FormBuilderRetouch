define(['angular',

], function (angular) {

    "use strict";

    var module = angular.module('qf-retouch.common', ['ui.router']);

    module.directive('ngRightClick', function ($parse) {
        return function (scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function (event) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, { $event: event });
                });
            });
        };
    });

    module.directive('elemReady', function ($parse, $timeout) {
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
    module.directive('loading', ['$http', function ($http) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                scope.isLoading = function () {
                    return $http.pendingRequests.length > 0;
                };

                scope.$watch(scope.isLoading, function (v) {
                    if (v) {
                        elm.show();
                    } else {
                        elm.hide();
                    }
                });
            }
        }
    }]);

    module.directive('selectOnFocus', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var focusedElement = null;

                element.on('focus', function () {
                    var self = this;
                    if (focusedElement != self) {
                        focusedElement = self;
                        $timeout(function () {
                            self.select();
                        }, 10);
                    }
                });

                element.on('blur', function () {
                    focusedElement = null;
                });
            }
        }
    }]);
    module.directive('multiswitchWhen', function () {
        return {
            transclude: 'element',
            priority: 800,
            require: '^ngSwitch',
            link: function (scope, element, attrs, ctrl, $transclude) {
                var selectTransclude = { transclude: $transclude, element: element };
                angular.forEach(attrs.multiswitchWhen.split('|'), function (switchWhen) {
                    ctrl.cases['!' + switchWhen] = (ctrl.cases['!' + switchWhen] || []);
                    ctrl.cases['!' + switchWhen].push(selectTransclude);
                });
            }
        }
    });
    module.filter('strLimit', ['$filter', function ($filter) {
        /*going to use css3 ellipsis instead of this*/
        return function (input, limit) {
            if (input.length <= limit) {
                return input;
            }
            return $filter('limitTo')(input, limit) + '...';
        };
    }]);
    module.filter('startFrom', function () {
        return function (input, start) {
            if (input) {
                start = parseInt(start);
                return input.slice(start);
            }
            return [];
        }
    });
    return module;
});
