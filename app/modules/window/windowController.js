"use strict";

var wd = angular.module('window');

wd.controller('windowController', function ($scope, windowFactory) {
    $scope.closeWindow = function () {
        windowFactory.close();
    };

    $scope.hideWindow = function () {
        windowFactory.minimize();
    } ;

    $scope.$on('algoSaved', function (e) {
        $scope.$broadcast('navRefresh');
    });
});





