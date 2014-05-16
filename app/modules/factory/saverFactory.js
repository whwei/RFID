"use strict";

var commonFactory = angular.module('commonFactory');

commonFactory.factory('saverFactory', function () {
    var sv = {};

    sv.saver = require('./js/node/saver').saver;

    return sv;
});


