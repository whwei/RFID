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
			templateUrl: 'views/algorithm.html'
		})
        .when('/add', {
            controller: 'addController',
            templateUrl: 'views/add-algorithm.html'
        })
		.when('/comparison', {
			controller: 'comparisonController',
			templateUrl: 'views/comparison.html'
		})
		.otherwise({ redirectTo: '/comparison'});
}]);

