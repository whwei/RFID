"use strict";

var addAlgorithm = angular.module('addAlgorithm');


addAlgorithm.controller('addController', function ($scope, $routeParams, saverFactory, algorithmInfoFactory) {
    // prevent default behavior from changing page on dropped file
    window.ondragover = function(e) { e.preventDefault(); return false; };
    window.ondrop = function(e) { e.preventDefault(); return false; };

    $scope.bind = bind;
    $scope.submit = function () {
        if (!$scope.name || !$scope.file) {
            // alert or ....
            console.log('no input');
            return;
        }
        var saver = saverFactory.saver,
            algorithmInfo = algorithmInfoFactory.algorithmInfo;
        var info = {
            name: $scope.name,
            title: $scope.name
        };

        // save algorithm info
        algorithmInfo.saveAlgorithmInfo(info);

        // save algorithm
        saver.write(info, $scope.file);

        $scope.$emit('algoSaved');
    };

    bind('holder');

    function bind(id) {
        var holder = document.getElementById(id),
            tip = document.querySelector('.tip');
        holder.ondragover = function () { this.className = 'hover'; return false; };
        holder.ondragend = function () { this.className = ''; return false; };
        holder.ondrop = function (e) {
            e.preventDefault();

            var file = e.dataTransfer.files[0],
                reader = new FileReader();

            reader.onload = function (event) {
                $scope.file = event.target.result;
            };
            reader.readAsDataURL(file);

            tip.innerHTML = file.name;

            return false;
        };
    }



});