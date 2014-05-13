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
    $scope.calculating = '';

    // tab setting
    $scope.tabs = {simulate: 'current', result: ''};
    $scope.panels = {simulate: 'show', result: ''};

    // get worker
    var wk = new Worker('js/algorithms/' + $scope.algo + '-worker.js');

    wk.postMessage({
        command: 'getDefaultOption'
    });

    // bind worker event
    wk.addEventListener('message', function (e) {

        if (e.data.type === 'result'){
            $scope.$apply(function(scope) {
                scope.result = e.data.value;
                scope.generations = e.data.value.records;
                scope.cfgReaders = cloneReaders(e.data.value.readers);
                scope.resultReturned = true;

                var readers = e.data.value.readers.map(function (v, i) {
                    return {x: +v.x, y: +v.y, z: 2};
                });
                var tags = e.data.value.tags.map(function (v, i) {
                    return {x: +v.x, y: +v.y, z: 1};
                });
                console.log(e.data.value);

                $('#highest').highcharts({
                    chart: {
                        zoomType: 'x'
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: 'Fitness 收敛图' + (e.data.value.records.bestPos !== 0 ? '（第' + (e.data.value.records.bestPos + 1) + '次模拟）' : '')
                    },
                    xAxis: {
                        type: 'linear',
                        minRange: 1
                    },
                    yAxis: {
                        title: {
                            text: 'Fitness'
                        },
                        min: 0,
                        max: 1
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        area: {
                            fillColor: {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                                stops: [
                                    [0, Highcharts.getOptions().colors[0]],
                                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                ]
                            },
                            marker: {
                                radius: 2
                            },
                            lineWidth: 1,
                            states: {
                                hover: {
                                    lineWidth: 1
                                }
                            },
                            threshold: null
                        }
                    },
                    series: [{
                        type: 'area',
                        name: 'Fitness',
                        pointInterval: 1,
                        pointStart: 1,
                        data: e.data.value.records[e.data.value.records.bestPos].highest
                    }]
                });


                $('#bubble-chart-origin').highcharts({
                    chart: {
                        type: 'bubble',
                        width: 360,
                        height: 360
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        tickInterval: 5,
                        gridLineWidth: 1,
                        min: 0,
                        max: $scope.options.xsize.value
                    },
                    yAxis: {
                        tickInterval: 5,
                        min: 0,
                        max: $scope.options.ysize.value,
                        title: {
                            text: null
                        }
                    },
                    title: {
                        text: '原始读写器分布'
                    },
                    plotOptions: {
                        bubble: {
                            //maxSize: (200 * $scope.options.r.value / $scope.options.xsize.value) + '%',
                            maxSize: 5,
                            minSize: 3
                        }
                    },
                    series: [{
                        name: '读写器',
                        data: $scope.result.initialReaders.map(function(v, i) {return [+v.x, +v.y, 2];}),
                        sizeBy: 'width'
                    },{
                        name: '标签',
                        data: $scope.result.tags.map(function(v, i) {return [+v.x, +v.y, 1];})
                    }]
                });

                $('#bubble-chart-result').highcharts({
                    chart: {
                        type: 'bubble',
                        width: 360,
                        height: 360
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        gridLineWidth: 1,
                        tickInterval: 5,
                        min: 0,
                        max: $scope.options.xsize.value
                    },
                    yAxis: {
                        tickInterval: 5,
                        min: 0,
                        max: $scope.options.ysize.value,
                        title: {
                            text: null
                        }
                    },
                    title: {
                        text: '优化后读写器分布'
                    },
                    plotOptions: {
                        bubble: {
                            //maxSize: (200 * $scope.options.r.value / $scope.options.xsize.value) + '%',
                            maxSize: 5,
                            minSize: 3
                        }
                    },
                    series: [{
                        name: '读写器',
                        data: readers,
                        sizeBy: 'width'
                    },{
                        name: '标签',
                        data: tags
                    }]
                });

                $scope.switchTab('result');
            });
        } else if (e.data.type === 'options') {
            $scope.$apply(function(scope) {
                var opts = {},
                    ret = JSON.parse(e.data.value);

                for (var p in ret) {
                    if (ret.hasOwnProperty(p)) {
                        if (ret[p].optional === true) {
                            opts[p] = ret[p];
                        }
                    }
                }

                scope.options = opts;
            });
        } else if (e.data.type === 'statistic') {
            $scope.$apply(function(scope) {
                scope.cfgReaders.statistic = JSON.parse(e.data.value);

                $('#bubble-chart-result').highcharts({
                    chart: {
                        type: 'bubble',
                        width: 400,
                        height: 400
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        tickInterval: 5,
                        gridLineWidth: 1,
                        min: 0,
                        max: $scope.options.xsize.value
                    },
                    yAxis: {
                        tickInterval: 5,
                        max: $scope.options.ysize.value,
                        title: {
                            text: null
                        }
                    },
                    title: {
                        text: null
                    },
                    plotOptions: {
                        bubble: {
                            //maxSize: (200 * $scope.options.r.value / $scope.options.xsize.value) + '%',
                            maxSize: 5,
                            minSize: 3
                        }
                    },
                    series: [{
                        name: '读写器',
                        sizeBy: 'width',
                        data: scope.cfgReaders.map(function(v, i) {return [+v.x, +v.y, 2];})
                    },{
                        name: '标签',
                        data: scope.result.tags.map(function(v, i) {return [+v.x, +v.y, 1];})
                    }]
                });
            });

        }

        $scope.$apply(function(scope) {
            scope.calculating = '';
        });

        // helper function
        function clone(myObj){
            if(typeof(myObj) !== 'object' || myObj === null) {
                return myObj;
            }

            var newObj = {};
            for(var i in myObj){
                newObj[i] = clone(myObj[i]);
            }
            return newObj;
        }

        function cloneArray(arr) {
            var ret = [];
            arr.forEach(function(v, i) {
                if (typeof(v) === 'object') {
                    ret.push(clone(v));
                } else {
                    ret.push(v);
                }
            });

            return ret;
        }

        function cloneReaders (target) {
            var ret = [];
            ret = cloneArray(target);
            ret.statistic = clone(target.statistic);
            return ret;
        }

    }, false);

    $scope.switchTab = function (n) {
        for (var p in $scope.tabs) {
            if ($scope.tabs.hasOwnProperty(p)) {
                $scope.tabs[p] = '';
                $scope.panels[p] = '';
            }
        }

        $scope.tabs[n] = 'current';
        $scope.panels[n] = 'show';
    };


    $scope.simulate = function () {
        $scope.calculating = 'calculating-show';

        // run worker
        wk.postMessage({
            command: 'run',
            options: $scope.options
        });
    };


    $scope.updateStatistic = function () {
        wk.postMessage({
            command: 'getStatistic',
            options: $scope.options,
            cfgReaders: $scope.cfgReaders,
            tags: $scope.result.tags
        });
    };

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