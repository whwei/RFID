"use strict";

var algorithm = angular.module('algorithm');

algorithm.controller('algorithmController', function ($scope, $routeParams, $location, storageFactory, saverFactory) {
    var storeName = $routeParams.algo + 'Store';

    $scope.algo = $routeParams.algo;
    $scope.cleanHistory = false;
    $scope.optionLoaded = false;
    $scope.calculating = '';
    $scope.runMode = '';
    $scope.weightCheck = true;
    $scope.history = storageFactory.getItem(storeName);

    // tab setting
    $scope.tabs = {simulate: 'current', result: ''};
    $scope.panels = {simulate: 'show', result: ''};

    var gui = require('nw.gui');

    // get worker
    var wk = saverFactory.saver.checkWorker($scope.name) && new Worker(gui.App.dataPath + '/algorithmWorker/' + $scope.algo + '-worker.js'),
        optionPromise;


    optionPromise = new Promise(function (resolve, reject) {
        wk.postMessage({
            command: 'getMode'
        });

        wk.postMessage({
            command: 'getDefaultOption'
        });


        // bind worker event
        wk.addEventListener('message', function (e) {
            if (e.data.type === 'result'){
                $scope.$apply(function(scope) {
                    $scope.cleanHistory = false;
                    scope.result = e.data.value;
                    scope.generations = e.data.value.records;
                    scope.cfgReaders = cloneReaders(e.data.value.readers);
                    scope.resultReturned = true;

                    initResult(e.data.value);


                    // save records
                    $scope.history = $scope.history || [];

                    $scope.currentRecord = {
                        records: e.data.value.records,
                        runData: e.data.value.runData
                    };

                    $scope.history.push($scope.currentRecord);

                    saveData($scope.history);

                    $scope.switchTab('result');

                    function saveData(store) {
                        storageFactory.setItem(storeName, store);
                    }

                });
            } else if (e.data.type === 'options') {
                $scope.$apply(function(scope) {
                    var opts = {},
                        ret = JSON.parse(e.data.value),
                        so = storageFactory.getItem('simulateOptionStore') || {};

                    for (var p in ret) {
                        if (ret.hasOwnProperty(p)) {
                            if (ret[p].optional === true) {
                                opts[p] = so[p] || ret[p];
                                opts[p].disabled = false;
                            }
                        }
                    }
                    scope.options = opts;
                    scope.optionLoaded = true;

                    resolve();
                });
            } else if (e.data.type === 'mode') {
                $scope.$apply(function(scope) {
                    scope.modes = JSON.parse(e.data.value);
                    scope.runMode = 'normal';
                    scope.requirements = {};
                    scope.requirements.minReader = scope.modes['minReader'].requirements;
                    scope.requirements.weight = scope.modes['normal'].requirements;

                });
            } else if (e.data.type === 'statistic') {
                $scope.$apply(function(scope) {
                    scope.cfgReaders.statistic = JSON.parse(e.data.value);

                    initBubbleChart('#bubble-chart-result',
                        null,
                        scope.result.tags.map(function(v, i) {return [+v.x, +v.y, 1];}),
                        scope.cfgReaders.map(function(v, i) {return [+v.x, +v.y, 2];})
                    );
                });
            }

            $scope.$apply(function(scope) {
                scope.calculating = '';
            });

        }, false);
    });

    // display the last experiment result, if there is one
    if ($scope.history) {
        $scope.currentRecord = $scope.history[$scope.history.length - 1];

        optionPromise.then(function(){
            initResult($scope.currentRecord);
        });

    } else {
        $scope.history = [];
        $scope.cleanHistory = true;
    }

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
        if ($scope.options && $scope.weightCheck){
            var so = {},
                opts = $scope.options;

            $scope.calculating = 'calculating-show';

            // run worker
            wk.postMessage({
                command: 'run',
                options: $scope.options,
                mode: {
                    name: $scope.runMode,
                    requirements: $scope.requirements
                }
            });

            for (var p in opts) {
                if (opts.hasOwnProperty(p)) {
                    if (opts[p].cate === 'simulation') {
                        so[p] = opts[p];
                    }
                }
            }

            storageFactory.setItem('simulateOptionStore', so);
        }
    };

    $scope.$watch('requirements.weight.wc.value', checkWeight);
    $scope.$watch('requirements.weight.wb.value', checkWeight);
    $scope.$watch('requirements.weight.wi.value', checkWeight);

    function checkWeight(value) {
        if (!$scope.requirements) {
            return;
        }

        var total = $scope.requirements.weight.wc.value +
                    $scope.requirements.weight.wb.value +
                    $scope.requirements.weight.wi.value;

        if (total !== 1) {
            $scope.weightCheck = false;
        } else {
            $scope.weightCheck = true;
        }
    }

    function initResult(target) {
        var result = {};

        result.records = target.records;
        result.options = target.runData.options;
        result.runData = target.runData;
        result.readers = target.runData.readers;
        result.readers.statistic = target.runData.readerStatistic;
        result.initialReaders = target.runData.initialReaders;
        result.tags = target.runData.tags;
        $scope.cfgReaders = cloneReaders(result.readers);
        $scope.result = result;

        initTimeChart('#highest',
            'Fitness 收敛图',
            (result.runData.bestPos !== 0 ? '第' + (result.runData.bestPos + 1) + '次模拟' : ''),
            result.records[result.runData.bestPos].highest
        );
        initBubbleChart('#bubble-chart-origin',
            '原始读写器分布',
            $scope.result.tags.map(function(v, i) {return [+v.x, +v.y, 1];}),
            $scope.result.initialReaders.map(function(v, i) {return [+v.x, +v.y, 2];})
        );
        initBubbleChart('#bubble-chart-result',
            '优化后读写器分布',
            result.tags.map(function (v, i) {return {x: +v.x, y: +v.y, z: 1};}),
            result.readers.map(function (v, i) {return {x: +v.x, y: +v.y, z: 2};})
        );

    }

    $scope.updateStatistic = function () {
        wk.postMessage({
            command: 'getStatistic',
            options: $scope.options,
            cfgReaders: $scope.cfgReaders,
            tags: $scope.result.tags
        });
    };

    $scope.$watch('currentRecord', function (value) {
        if (value && $scope.optionLoaded) {
            initResult(value);
        }
    });


    function initBubbleChart(selector, title, tags, readers) {
        $(selector).highcharts({
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
                text: title
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
                data: readers
            },{
                name: '标签',
                data: tags
            }]
        });
    }

    function initTimeChart(selector, title, subtitle, data) {
        $(selector).highcharts({
            chart: {
                zoomType: 'x'
            },
            credits: {
                enabled: false
            },
            title: {
                text: title
            },
            subtitle: {
                text: subtitle
            },
            xAxis: {
                type: 'linear',
                minRange: 1
            },
            yAxis: {
                title: {
                    text: 'Fitness'
                }
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
                data: data
            }]
        });
    }

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

});