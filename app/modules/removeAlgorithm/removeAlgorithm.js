"use strict";

var removeAlgorithm = angular.module('addAlgorithm');

removeAlgorithm.controller('removeController', function($scope, saverFactory, algorithmInfoFactory, storageFactory) {
    $scope.list = algorithmInfoFactory.algos;
    
    $scope.remove = function (name) {
        algorithmInfoFactory.algorithmInfo.removeAlgorithmInfo(name);
        saverFactory.saver.remove(name);
        storageFactory.removeItem(name + 'Store');

        for (var i = 0; i < $scope.list.length; i++) {
            if ($scope.list[i].name === name) {
                break;
            }
        }

        $scope.list.splice(i, 1);

        $scope.$emit('algoRemoved');
    };
});