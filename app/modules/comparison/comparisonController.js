"use strict";

var comparison = angular.module('comparison');

comparison.controller('comparisonController', function ($scope, $location, algorithmInfoFactory, storageFactory) {
    var algos = algorithmInfoFactory.algos,
        stores,
        history,
        len;

    stores = algos.map(function(v, i){
            history = storageFactory.getItem(v.name + 'Store');
            len = history && history.length;

            return {
                name: v.name,
                history: history,
                currentRecord: history[len - 1]
            };
        });

    $scope.empty = stores.length === 0 ? true : false;

    $scope.stores = stores;

    // watch current record
    stores.forEach(function (v, i) {
        $scope.$watch(function(){
            return $scope.stores[i].currentRecord;
        }, function(value) {
            console.log(value);
        });
    });

});