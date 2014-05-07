"use strict";

var appControllers = angular.module('app.controllers', []);

appControllers.controller('appController', function ($scope, windowFactory) {
    $scope.closeWindow = function () {
        windowFactory.close();
    };

    $scope.hideWindow = function () {
        windowFactory.minimize();
    } ;

    $scope.$on('algoSaved', function (e) {
        $scope.$broadcast('navRefresh');
    });
});

appControllers.controller('indexController', function ($scope) {

});

appControllers.controller('algorithmController', function ($scope, $routeParams, $location) {
	$scope.algo = $routeParams.algo;
    $scope.resultReturned = false;

    var wk = new Worker('js/algorithms/' + $scope.algo + '-worker.js');
    wk.addEventListener('message', function (e) {
        $scope.$apply(function(scope) {
            scope.generations = e.data.records;
            scope.resultReturned = true;
            console.log(e.data.records);
        });
    }, false);

    wk.postMessage({
        iterations: 40,
        m: 20
    });

});

appControllers.controller('addController', function ($scope, $routeParams, saverFactory, algorithmInfoFactory) {
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
    };



});


appControllers.controller('navController', function ($scope, $location, algorithmInfoFactory) {
	// load algorithm to initialize the nav bar
	$scope.algos = algorithmInfoFactory.algos;

    $scope.addAlgo = { url: '#/add', name: 'add', title: '添加算法', klass: '' };

	$scope.navList = $scope.algos.concat([$scope.addAlgo]);
	
	$scope.select = function (url) {
        $scope.navList.forEach(function (v, k) {
			v.klass = (v.url === url ? 'current' : '');
		});
	};

    $scope.select('#' + $location.$$path);

    $scope.update = function () {
        $scope.algos = [
            {
                name: "ga",
                title: "遗传算法",
                klass: 'current'
            },
            {
                name: "pso",
                title: "粒子群算法",
                klass: ''
            }];
    };

    $scope.$on('navRefresh', function () {
        $scope.algos = algorithmInfoFactory.refresh();
        $scope.navList = $scope.algos.concat([$scope.addAlgo]);
        $scope.select('#' + $location.$$path);
    });
});