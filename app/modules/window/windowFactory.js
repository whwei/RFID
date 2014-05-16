"use strict";

var wd = angular.module('window');

wd.factory('windowFactory', function () {
    var gui = global.window.nwDispatcher.requireNwGui();
    var win = gui.Window.get();

    return win;
});