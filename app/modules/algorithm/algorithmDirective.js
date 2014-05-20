"use strict";

var algorithm = angular.module('algorithm');

algorithm.directive('rfidWeight', function(){
    return {
        restrict: "EA",
        replace: true,
        template: '<div>\n' +
                    '<label for="{{weightId}}">{{weightName}}</label>\n' +
                    '<input type="number" min="0" max="1" step="0.01" id="{{weightId}}" ng-disabled="weightDisabled" ng-model="weightValue" value="{{weightValue}}"/>\n' +
                  '</div>',
        scope: {
            weightId: '@',
            weightName: '@',
            weightValue: '=',
            weightDisabled: '='
        },
        controller: function($scope, $element, $attrs) {
            var cache;
            $scope.$watch('weightDisabled', function(value) {
                if (value) {
                    cache = $scope.weightValue;
                    $scope.weightValue = 0;
                } else {
                    $scope.weightValue = cache;
                }
            });
        }
    };
});