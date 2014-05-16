"use strict";

var nav = angular.module('nav');


nav.controller('navController', function ($scope, $location, algorithmInfoFactory) {
    // load algorithm to initialize the nav bar
    $scope.algos = algorithmInfoFactory.algos;

    $scope.compareAlgo = { url: '#/comparison', name: 'comparison', title: '算法对比', klass: '' };

    $scope.addAlgo = { url: '#/add', name: 'add', title: '添加算法', klass: '' };

    $scope.navList = [$scope.compareAlgo].concat($scope.algos.concat([$scope.addAlgo]));

    $scope.select = function (url) {
        $scope.navList.forEach(function (v, k) {
            v.klass = (v.url === url ? 'current' : '');
        });
    };

    $scope.select('#' + $location.$$path);

    $scope.$on('navRefresh', function () {
        $scope.algos = algorithmInfoFactory.refresh();
        $scope.navList = $scope.algos.concat([$scope.addAlgo]);
        $scope.select('#' + $location.$$path);
    });
});

