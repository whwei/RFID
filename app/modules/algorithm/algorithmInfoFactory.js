"use strict";

var algorithm = angular.module('algorithm');


algorithm.factory('algorithmInfoFactory', function () {
    var ai = {};

    ai.algorithmInfo = require('./js/node/algorithmInfo').algorithmInfo;
    ai.algos = ai.algorithmInfo.loadAlgorithmInfo();
    ai.algos.map(function (a, i) {
        a.url = '#/algorithms/' + a.name;
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