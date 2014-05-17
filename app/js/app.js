"use strict";

angular.module('window', []);
angular.module('addAlgorithm', []);
angular.module('algorithm', []);
angular.module('comparison', []);
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
		.otherwise({ redirectTo: '/comparison'});
}]);

