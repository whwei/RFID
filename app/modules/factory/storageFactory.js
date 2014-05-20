"use strict";

var commonFactory = angular.module('commonFactory');

commonFactory.factory('storageFactory', function () {
    var storage = require('node-persist');
    storage.initSync();
window.storage = storage;
    return storage;
});