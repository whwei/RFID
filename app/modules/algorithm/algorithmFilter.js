"use strict";

var algorithm = angular.module('algorithm');

algorithm.filter('simulationParam', function() {
    return function(input) {
        if (angular.isDefined(input)) {
            var ret = [];

            angular.forEach(input, function (v, i) {
                if (v.cate === 'simulation') {
                    ret.push(v);
                }
            });

            return ret;
        }
    };
});

algorithm.filter('algorithmParam', function() {
    return function(input) {
        if (angular.isDefined(input)) {
            var ret = [];

            angular.forEach(input, function (v, i) {
                if (v.cate === 'algorithm') {
                    ret.push(v);
                }
            });

            return ret;
        }
    };
});

