'use strict';

var app = angular.module('app', ['ngRoute', 'ngAnimate', 'app.controllers']);

app.factory('windowFactory', function () {
    var gui = global.window.nwDispatcher.requireNwGui();
    var win = gui.Window.get();

    return win;
});

app.factory('saverFactory', function () {
    var sv = {};

    sv.saver = require('./js/node/saver').saver;

    return sv;
});

app.factory('algorithmInfoFactory', function () {
    var ai = {};

    ai.algorithmInfo = require('./js/node/algorithmInfo').algorithmInfo;
    ai.algos = ai.algorithmInfo.loadAlgorithmInfo();
    ai.algos.map(function (a, i) {
        a.url = '#/algorithm/' + a.name;
        a.klass = i === 0 ? 'current' : '';
    });
    ai.refresh = function () {
        this.algos = this.algorithmInfo.loadAlgorithmInfo();
        this.algos.map(function (a, i) {
            a.url = '#/algorithms/' + a.name;
            a.klass = i === 0 ? 'current' : '';
        });
        return this.algos;
    };

    return ai;
});

app.factory('algorithmFactory', function () {
    var af = {};

    var algorithmInfo = require('./js/node/algorithmInfo').algorithmInfo;

    af.algos = algorithmInfo.loadAlgorithmInfo();
    af.algos.map(function (a, i) {
        a.url = '#/algorithms/' + a.name;
        a.klass = i === 0 ? 'current' : '';
    });

    return af;
});

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
		.when('/', {
			controller: 'indexController',
			templateUrl: 'views/index.html'
		})
		.otherwise({ redirectTo: '/'});
}]);

