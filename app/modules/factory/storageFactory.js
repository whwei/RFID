"use strict";

var commonFactory = angular.module('commonFactory');

commonFactory.factory('storageFactory', function () {
    var storage = require('node-persist');
    var gui = require('nw.gui');

    storage.initSync({
        dir: gui.App.dataPath + '/persist'
    });

    return storage;
});