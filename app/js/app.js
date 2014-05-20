"use strict";

angular.module('window', []);
angular.module('addAlgorithm', ['commonFactory', 'algorithm']);
angular.module('removeAlgorithm', ['commonFactory', 'algorithm']);
angular.module('algorithm', []);
angular.module('comparison', ['algorithm']);
angular.module('commonFactory', []);
angular.module('nav', []);

var app = angular.module('app',
    [
        'ngRoute',
        'ngAnimate',
        'window',
        'addAlgorithm',
        'algorithm',
        'comparison',
        'commonFactory',
        'nav'
    ]);

app.controller('appController', function($scope) {
    $scope.$on('algoSaved', function (e) {
        $scope.$broadcast('navRefresh');
    });
    $scope.$on('algoRemoved', function (e) {
        $scope.$broadcast('navRefresh');
    });
});

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
		.when('/algorithms/:algo', {
			controller: 'algorithmController',
			templateUrl: 'modules/algorithm/algorithm.html'
		})
        .when('/add', {
            controller: 'addController',
            templateUrl: 'modules/addAlgorithm/add-algorithm.html'
        })
		.when('/comparison', {
			controller: 'comparisonController',
			templateUrl: 'modules/comparison/comparison.html'
		})
        .when('/remove', {
            controller: 'removeController',
            templateUrl: 'modules/removeAlgorithm/removeAlgorithm.html'
        })
		.otherwise({ redirectTo: '/comparison'});
}]);

