"use strict";

var comparison = angular.module('comparison');

comparison.controller('comparisonController', function ($scope, $location, algorithmInfoFactory, storageFactory) {
    var algos = algorithmInfoFactory.algos,
        stores = [],
        history,
        len,
        optList = {};

    // initialize stores
    for (var i = 0; i < algos.length; i++ ) {
        var v = algos[i];
        history = storageFactory.getItem(v.name + 'Store');
        len = history && history.length;

        if (!history) {
            continue;
        }

        // initialize optList
        for (var o in history[len - 1].runData.options) {
            var it = history[len - 1].runData.options[o];
            if (!optList[o] && it.optional) {
                optList[o] = it;
            }
        }
        console.log(history[len - 1]);
        stores.push({
            name: v.name.toUpperCase(),
            history: history,
            currentRecord: history[len - 1]
        });
    }

    $scope.optList = optList;

    $scope.empty = stores.length === 0 ? true : false;

    $scope.stores = stores;

    // watch current record
    stores.forEach(function (v, i) {
        $scope.$watch(function(){
            return $scope.stores[i].currentRecord;
        }, function(value) {
            initColumnChart('#column-chart-highest', {
                title: {
                    text: '最高适应度'
                },
                subtitle: {
                    text: '数值越高越好'
                },
                xAxis: {
                    categories: [
                        ''
                    ]
                },
                yAxis: {
                    title: {
                        text: '适应度'
                    }
                },
                series: stores.map(function(v){
                    return {
                        name: v.name,
                        data: [v.currentRecord.runData.readerStatistic.fitness]
                    };
                })
            });

            initColumnChart('#column-chart-avgFitness', {
                title: {
                    text: '平均适应度'
                },
                subtitle: {
                    text: '数值越高越好'
                },
                xAxis: {
                    categories: [
                        ''
                    ]
                },
                yAxis: {
                    title: {
                        text: '适应度'
                    }
                },
                series: stores.map(function(v){
                    return {
                        name: v.name,
                        data: [v.currentRecord.runData.avgFitness]
                    };
                })
            });

            initColumnChart('#column-chart-avgTime', {
                title: {
                    text: '平均模拟时间'
                },
                subtitle: {
                    text: '数值越小越好'
                },
                xAxis: {
                    categories: [
                        ''
                    ]
                },
                yAxis: {
                    title: {
                        text: '时间（ms）'
                    }
                },
                series: stores.map(function(v){
                    return {
                        name: v.name,
                        data: [v.currentRecord.runData.avgTime]
                    };
                })
            });

            initColumnChart('#column-chart-avgIte', {
                title: {
                    text: '得到最佳适应度平均代数'
                },
                subtitle: {
                    text: '数值越小越好'
                },
                xAxis: {
                    categories: [
                        '得到最佳适应度平均代数'
                    ]
                },
                yAxis: {
                    title: {
                        text: '代数'
                    }
                },
                series: stores.map(function(v){
                    return {
                        name: v.name,
                        data: [v.currentRecord.runData.avgIte]
                    };
                })
            });

            initColumnChart('#column-chart-mse', {
                title: {
                    text: '模拟均方差'
                },
                subtitle: {
                    text: '数值越小越好'
                },
                xAxis: {
                    categories: [
                        '模拟均方差'
                    ]
                },
                yAxis: {
                    title: {
                        text: '均方差'
                    }
                },
                series: stores.map(function(v){
                    return {
                        name: v.name,
                        data: [v.currentRecord.runData.mse]
                    };
                })
            });
        });
    });




    function initColumnChart(selector, opt) {
        var dft = {
            chart: {
                type: 'column'
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: [],
                labels: {
                    rotation: -45,
                    align: 'right',
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                min: 0
            },
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.series.name +'</b><br/>'+
                        this.point.y;
                }
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: []
        };

        opt = $.extend(dft, opt);
        $(selector).highcharts(opt);
    }

});