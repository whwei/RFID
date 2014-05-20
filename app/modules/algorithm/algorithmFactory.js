"use strict";

var algorithm = angular.module('algorithm');


algorithm.factory('algorithmFactory', function () {
    var af = {};

    var algorithmInfo = require('./js/node/algorithmInfo').algorithmInfo;

    af = algorithmInfo;
    af.algos = algorithmInfo.loadAlgorithmInfo().slice();
    af.algos.map(function (a, i) {
        a.url = '#/algorithms/' + a.name;
        a.klass = i === 0 ? 'current' : '';
    });

    return af;
});