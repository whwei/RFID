"use strict";

self.addEventListener('message', function (e) {

    switch (e.data.command) {
        case 'run':
            var ga = new GA(e.data.options);
            ga.init();
            self.postMessage({
                type: 'result',
                value: ga.run()
            });
            break;
        case 'getDefaultOption':
            self.postMessage({
                type: 'options',
                value: JSON.stringify(GA.prototype.options)
            });
            break;
        case 'getStatistic':
            self.postMessage({
                type: 'statistic',
                value: JSON.stringify(GA.prototype.getStatistic(e.data.cfgReaders, e.data.tags))
            });
            break;
    }
}, false);


var GA = function (op) {
    this.options = extend({}, GA.prototype.options, op); // simulation params
    this.status = {
        initialized: false,
        iteration: 0
    };
    this.population = [];
    this.readers = []; // best solution
    this.tags = [];
    this.records = {
        avg: [],
        highest:[]
    };

};

GA.prototype = {
    options:  {
        rn: {
            name: 'rn',
            desc: '读写器个数',
            optional: true,
            value: 10
        },
        tn: {
            name: 'tn',
            desc: '标签个数',
            optional: true,
            value: 30
        },
        xsize: {
            name: 'xsize',
            desc: '工作区宽度',
            optional: true,
            value: 30
        },
        ysize: {
            name: 'ysize',
            desc: '工作区高度',
            optional: true,
            value: 30
        },
        r: {
            name: 'r',
            desc: '读写器覆盖范围',
            optional: true,
            value: 5
        },
        EIRP: {
            name: 'EIRP',
            desc: '',
            optional: false,
            value: 15
        },
        G: {
            name: 'G',
            desc: '',
            optional: false,
            value: 3
        },
        lambda: {
            name: 'lambda',
            desc: '',
            optional: false,
            value: 13.56
        },
        Rq: {
            name: 'Rq',
            desc: '',
            optional: false,
            value: 10
        },
        iterations: {
            name: 'iterations',
            desc: '最大代数',
            optional: true,
            value: 50
        },
        m: {
            name: 'm',
            desc: '种群大小',
            optional: true,
            value: 20
        },
        pc: {
            name: 'pc',
            desc: '交叉概率',
            optional: true,
            value: 0.7
        },
        pm: {
            name: 'pm',
            desc: '突变概率',
            optional: true,
            value: 0.05
        },
        wc: {
            name: 'wc',
            desc: '覆盖率权重',
            optional: true,
            value: 0.7
        },
        wi: {
            name: 'wi',
            desc: '干扰率权重',
            optional: true,
            value: 0.1
        },
        wb: {
            name: 'wb',
            desc: '负载均衡权重',
            optional: true,
            value: 0.2
        }
    },
    testCM: function () {
        var g1 = [
                {x:11,y:12},
                {x:13,y:14},
                {x:15,y:16},
                {x:17,y:18},
                {x:19,y:10}
            ],
            g2 = [
                {x:21,y:22},
                {x:23,y:24},
                {x:25,y:26},
                {x:27,y:28},
                {x:29,y:20}
            ];

        mutation(g1, g2);

    },
    init: function () {
        this.reset();

        var i = 0,
            j = 0;

        // each tag has a random position
        for (i = 0; i < this.options.tn.value; i++) {
            this.tags.push({
                x: randomNumber(0, this.options.xsize.value),
                y: randomNumber(0, this.options.ysize.value)
            });
        }

        // each reader has a random position
        for (i = 0; i < this.options.m.value; i++) {
            this.population[i] = [];
            for (j = 0; j < this.options.rn.value; j++) {
                this.population[i].push(new Reader(randomNumber(0, this.options.xsize.value),randomNumber(0, this.options.ysize.value)));
            }
        }

        // random position for readers(best solution)
        for (i = 0; i < this.options.rn.value; i++) {
            this.readers.push(new Reader(randomNumber(0, this.options.xsize.value), randomNumber(0, this.options.ysize.value)));
        }

        this.status.initialized = true;

        return this;
    },
    reset: function () {
        this.population = [];
        this.tags = [];
        this.readers = [];
        this.elements = [];
        this.records = {
            avg: [],
            highest:[]
        };
        this.status.iteration = 0;
        this.status.initialized = false;
    },
    run: function(it) {
        var i,
            len = it || this.options.iterations.value;
        for (i = 0; i < len; i++) {
            this.iterator();
            this.status.iteration = i;
        }

        return this;
    },
    iterator: function () {
        var i,
            j,
            len = this.population.length,
            rd,
            highestFitness = this.getStatistic(this.readers, this.tags).fitness || 0,
            worst = 1,
            worstPos = 0,
            self = this,
            sum = 0,
            ac = 0,
            accumulated = [],
            winners = [];


        this.population.forEach(function (s, i) {
            if (!s.statistic) {
                s.statistic = self.getStatistic(s, self.tags);
            }

            if (s.statistic.fitness > highestFitness) {
                highestFitness = s.statistic.fitness;

                self.readers = cloneReaders(s);
            }

            sum += s.statistic.fitness;
        });

        for (i = 0; i < len; i++) {
            ac += this.population[i].statistic.fitness / sum;
            accumulated[i] = ac;
        }
        
        accumulated.unshift(0);

        // individual selection
        for (j = 0; j < len; j++) {
            rd = Math.random();
            for (i = accumulated.length - 1; i >= 1; i--) {
                if (rd <= accumulated[i] && rd >= accumulated[i - 1]) {
                    winners.push(cloneReaders(this.population[i - 1]));
                    break;
                }
            }
        }
        // cross operation
        var halfLen = len / 2;
        for (i = 0; i < halfLen; i++) {
            cross(winners[i], winners[i + halfLen], this.options.pc.value);
        }

        // mutation operation
        for (i = 0; i < len; i++) {
            mutation(winners[i], this.options.pm.value);
        }

        this.population = winners;

        // get the best one from the new generation
        this.population.forEach(function (s, i) {
            s.statistic = self.getStatistic(s, self.tags);

            // find best
            if (s.statistic.fitness > highestFitness) {
                highestFitness = s.statistic.fitness;

                self.readers = cloneReaders(s);
            }
            // find wrost
            if (s.statistic.fitness < worst) {
                worst = s.statistic.fitness;

                worstPos = i;
            }
        });

        this.population[worstPos] = cloneReaders(this.readers);

        this.records.avg.push(sum / len);
        this.records.highest.push(highestFitness);

        return this;
    },

    // received power of tag from reader
    getPower: function (reader, tag, it) {
        var d = 0;
        if (it && it >= 0) {
            d = reader.distance[it];
        } else {
            d = distance(reader, tag);
        }
        return (this.options.lambda.value * this.options.lambda.value * this.options.G.value * this.options.EIRP.value) / Math.pow(4 * Math.PI * d, 2);
    },
    isInField: function (reader, tag, it) {
        return reader.distance[it] <= this.options.r.value;
    },
    getStatistic: function (readers, tags) {
        var self = this,
            results = [];

        // calculate the distance between each reader and each tag
        readers.forEach(function (reader, ir) {
            tags.forEach(function (tag, it) {
                //coverage
                reader.distance[it] = distance(reader, tag);
            });
        });

        // coverage
        var coverage = 0;
        tags.forEach(function (tag, it) {
            for(var p = 0; p < readers.length; p++) {
                if (self.isInField(readers[p], null, it)) {
                    coverage += 1;
                    break;
                }
            }
        });
        results.push({
            object: 'coverage',
            desc: '覆盖率',
            weight: self.options.wc.value,
            value: coverage / this.options.tn.value
        });

        // interference
        var i = 0,
            rt = 0,
            max = 0,
            temp = 0,
            interference = 0;
        tags.forEach(function (tag, it) {
            i = 0;
            max = 0;
            readers.forEach(function (reader, ir) {
                temp = self.getPower(reader, tag, it);
                max = max > temp ? max : temp;
                i += temp;
            });
            rt = max / i;
            interference += rt ? rt : 0;
        });
        results.push({
            object: 'interference',
            desc: '干扰率',
            weight: self.options.wi.value,
            value: interference / this.options.tn.value
        });

        // load balance
        var ni = 0,
            balance = 1;
        tags.forEach(function (tags, it) {
            ni = 0;
            readers.forEach(function (reader, ir) {
                if (self.isInField(reader, null, it)) {
                    ni++;
                }
            });
            ni = ni === 0 ? 1 : ni;
            balance = balance * (1 / ni);
        });
        results.push({
            object: 'loadBalance',
            desc: '负载均衡',
            weight: self.options.wb.value,
            value: balance
        });


        return {
            results: results,
            fitness: results.reduce(function(memo, v) {return memo + v.weight * v.value;}, 0)
        };
    }
};

function Reader(x, y) {
    this.x = x;
    this.y = y;
    this.distance = [];
}


//helper functions
function extend(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
}

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

function distance(p1, p2) {
    if (check(p1.x) && check(p1.y) && check(p2.x) && check(p2.y)) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
    function check(n) {
        return n >= 0 && (n <= GA.prototype.options.xsize.value || n <= GA.prototype.options.ysize.value);
    }

    return null;
}

function randomNumber(min, max) {
    min = min || 0;
    max = max || 1;
    return (Math.random() * (max - min) + min).toFixed(3);
}

function cross(g1, g2, pc) {
    var i,
        temp,
        len = g1 && g1.length,
        len2 = g2 && g2.length;

    if (!len || !len2 || len !== len2) {
        console.error('array length unmatch');
        return;
    }

    for (i = 0; i < len; i++) {
        // cross x
        if (Math.random() <= pc) {
            temp = g1[i].x;
            g1[i].x = g2[i].x;
            g2[i].x = temp;
        }
        // cross y
        if (Math.random() <= pc) {
            temp = g1[i].y;
            g1[i].y = g2[i].y;
            g2[i].y = temp;
        }
    }
}


function mutation(g, pm) {
    var i,
        len = g && g.length;

    for (i = 0; i < len; i++) {
        if (Math.random() <= pm) {
            g[i] = new Reader(randomNumber(0, GA.prototype.options.xsize.value), randomNumber(0, GA.prototype.options.ysize.value));
        }
    }
}