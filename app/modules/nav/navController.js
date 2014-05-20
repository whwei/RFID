"use strict";

var nav = angular.module('nav');


nav.controller('navController', function ($scope, $location, algorithmInfoFactory) {
    // load algorithm to initialize the nav bar
    $scope.algos = algorithmInfoFactory.algos;

    $scope.compareAlgo = { url: '#/comparison', name: 'comparison', title: '算法对比', klass: '' };

    $scope.addAlgo = { url: '#/add', name: 'add', title: '添加算法', klass: '' };

    $scope.removeAlgo = { url: '#/remove', name: 'remove', title: '移除算法', klass: '' };

    $scope.navList = concatItems($scope.compareAlgo, $scope.algos, $scope.addAlgo, $scope.removeAlgo);

    $scope.select = function (url) {
        $scope.navList.forEach(function (v, k) {
            v.klass = (v.url === url ? 'current' : '');
        });
    };

    $scope.select('#' + $location.$$path);

    $scope.$on('navRefresh', function () {
        $scope.algos = algorithmInfoFactory.refresh();
        $scope.navList = concatItems($scope.compareAlgo, $scope.algos, $scope.addAlgo, $scope.removeAlgo);
        $scope.select('#' + $location.$$path);
    });

    function concatItems() {
        var i,
            it,
            type,
            ret = [],
            args = [].slice.call(arguments);

        for (i = 0; i < args.length; i++) {
            it = args[i];
            type = Object.prototype.toString.call(args[i]);
            if (type === '[object Array]' ) {
                ret = ret.concat(it);
            } else if (type === '[object Object]') {
                ret.push(it);
            }
        }

        return ret;
    }
});

