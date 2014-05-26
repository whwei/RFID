"use strict";

self.addEventListener('message', function (e) {

    switch (e.data.command) {
        case 'run':
            var pso = new PSO(e.data.options);
            pso.init();
            var rt = pso.run(e.data.mode.name, e.data.mode.requirements);
            self.postMessage({
                type: 'result',
                value: rt
            });
            break;
        case 'getDefaultOption':
            self.postMessage({
                type: 'options',
                value: JSON.stringify(PSO.prototype.options)
            });
            break;
        case 'getMode':
            self.postMessage({
                type: 'mode',
                value: JSON.stringify(PSO.prototype.mode)
            });
            break;
        case 'getStatistic':
            self.postMessage({
                type: 'statistic',
                value: JSON.stringify((new PSO(e.data.options)).getStatistic(e.data.cfgReaders, e.data.tags))
            });
            break;
    }
}, false);


var PSO = function (op) {
    this.options = extend({}, PSO.prototype.options, op); // simulation params
    this.status = {
        initialized: false,
        iteration: 0
    };
    this.population = [];
    this.readers = []; // best solution
    this.tags = [];
    this.v = [];
    this.records = [];
    this.runData = {};
    this.records.bestPos = 0;
    this.status.repetition = 0;

};

PSO.prototype = {
    mode: {
        normal: {
            name: 'normal',
            desc: '最大化适应度',
            default: true,
            requirements: {
                wc: {
                    name: 'wc',
                    desc: '覆盖率权重',
                    cate: 'simulation',
                    value: 0.9
                },
                wi: {
                    name: 'wi',
                    desc: '干扰率权重',
                    cate: 'simulation',
                    value: 0.05
                },
                wb: {
                    name: 'wb',
                    desc: '负载均衡权重',
                    cate: 'simulation',
                    value: 0.05
                }
            }
        },
        minReader: {
            name: 'minReader',
            desc: '最小化读写器',
            default: false,
            requirements: {
                coverage: {
                    name: 'coverage',
                    desc: '覆盖率',
                    value: 0.8
                },
                minRn: {
                    name: 'minRn',
                    desc: '初始读写器数',
                    value: 5
                },
                maxRn: {
                    name: 'maxRn',
                    desc: '最大读写器数',
                    value: 15
                }
            }
        }
    },
    runMode: {
        normal: function (requirements) {
            var i;

            this.options = extend(this.options, requirements.weight);
            for(i = 0; i < this.options.rpt.value; i++) {
                this.records[i] = this.records[i] || new Record(
                                                            null,
                                                            null,
                                                            null,
                                                            cloneReaders(this.initialReaders),
                                                            cloneReaderArray(this.initialPopulation),
                                                            cloneArray(this.initialV));
                this.runOnce(this.records[i]);
            }
        },
        minReader: function (requirements) {
            var i,
                j;

            this.options = extend(this.options, requirements.weight);
            for (i = 0; i < this.options.rpt.value; i++) {
                for (j = 1; j < requirements.minReader.maxRn.value; j++) {
                    this.options.rn.value = j;
                    this.records[i] = new Record(
                                            null,
                                            null,
                                            null,
                                            cloneReaders(this.initReaders(j)),
                                            cloneReaderArray(this.initPopulation(j)),
                                            cloneArray(this.initialV));
                    this.runOnce(this.records[i], function (record) {
                        return record.readers.statistic.results[0].value >= requirements.minReader.coverage.value;
                    });

                    if (this.records[i].readers.statistic.results[0].value >= requirements.minReader.coverage.value) {
                        break;
                    }
                }

            }

        }
    },
    options:  {
        rn: {
            name: 'rn',
            desc: '读写器个数',
            optional: true,
            cate: 'simulation',
            value: 10
        },
        tn: {
            name: 'tn',
            desc: '标签个数',
            optional: true,
            cate: 'simulation',
            value: 30
        },
        xsize: {
            name: 'xsize',
            desc: '工作区宽度',
            optional: true,
            cate: 'simulation',
            value: 30
        },
        ysize: {
            name: 'ysize',
            desc: '工作区高度',
            optional: true,
            cate: 'simulation',
            value: 30
        },
        Gtx: {
            name: 'Gtx',
            desc: '天线增益',
            optional: true,
            cate: 'simulation',
            value: 1.5
        },
        Gtag: {
            name: 'Gtag',
            desc: '标签增益',
            optional: true,
            cate: 'simulation',
            value: 1.5
        },
        Rq: {
            name: 'Rq',
            desc: '门限值',
            optional: true,
            cate: 'simulation',
            value: -10
        },
        Ps: {
            name: 'Ps',
            desc: '读写器输出功率',
            optional: true,
            cate: 'simulation',
            value: 30
        },
        iterations: {
            name: 'iterations',
            desc: '最大代数',
            optional: true,
            cate: 'simulation',
            value: 50
        },
        m: {
            name: 'm',
            desc: '种群大小',
            optional: true,
            cate: 'algorithm',
            value: 30
        },
        c1: {
            name: 'c1',
            desc: '学习因子c1',
            optional: true,
            cate: 'algorithm',
            value: 2
        },
        c2: {
            name: 'c2',
            desc: '学习因子c2',
            optional: true,
            cate: 'algorithm',
            value: 2
        },
        w: {
            name: 'w',
            desc: '惯性权重',
            optional: true,
            cate: 'algorithm',
            value: 0.75
        },
        maxV: {
            name: 'maxV',
            desc: '最大速度',
            optional: true,
            cate: 'algorithm',
            value: 0.1
        },
        wc: {
            name: 'wc',
            desc: '覆盖率权重',
            optional: false,
            cate: 'simulation',
            value: 0.9
        },
        wi: {
            name: 'wi',
            desc: '干扰率权重',
            optional: false,
            cate: 'simulation',
            value: 0.05
        },
        wb: {
            name: 'wb',
            desc: '负载均衡权重',
            optional: false,
            cate: 'simulation',
            value: 0.05
        },
        rpt: {
            name: 'rpt',
            desc: '运行次数',
            optional: true,
            cate: 'simulation',
            value: 5
        }
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

        this.initPopulation();

        this.initReaders();

        this.initV();

        this.status.initialized = true;

        return this;
    },
    initV: function (rn) {
        var i,
            maxV = this.options.maxV.value,
            v = [];

        rn = rn || this.options.rn.value;

        // initialize v
        for (i = 0; i < rn; i++) {
            v[i] = new V(randomNumber(-1 * maxV, maxV), randomNumber(-1 * maxV, maxV));
        }

        this.v = v;
        this.initialV = cloneArray(this.v);

        return v;
    },
    initPopulation: function (rn, m) {
        var i,
            j,
            population = [];

        m = m || this.options.m.value;
        rn = rn || this.options.rn.value;

        // each reader has a random position
        for (i = 0; i < m; i++) {
            population[i] = [];
            for (j = 0; j < rn; j++) {
                population[i].push(new Reader(randomNumber(0, this.options.xsize.value),randomNumber(0, this.options.ysize.value)));
            }
        }

        this.population = population;
        this.initialPopulation = cloneReaderArray(this.population);

        return population;
    },
    initReaders: function(rn) {
        var i,
            readers = [];

        rn = rn || this.options.rn.value;

        // random position for readers(best solution)
        for (i = 0; i < rn; i++) {
            var nrd = new Reader(randomNumber(0, this.options.xsize.value), randomNumber(0, this.options.ysize.value));
            readers.push(nrd);
        }

        readers.statistic = this.getStatistic(readers, this.tags);
        this.readers = readers;
        this.initialReaders = cloneReaders(this.readers);

        return readers;
    },
    reset: function () {
        this.population = [];
        this.tags = [];
        this.v = [];
        this.readers = [];
        this.initialReaders = [];
        this.initialPopulation = [];
        this.records = [];
        this.runData = {};
        this.runData.bestPos = 0;
        this.status.iteration = 0;
        this.status.initialized = false;
        this.status.repetition = 0;
    },
    run: function(mode, requirements) {
        this.runMode[mode || 'maxCoverage'].call(this, requirements);

        this.simulationStatistic();

        this.runData.mode = {
            mode: mode,
            desc: this.mode[mode].desc,
            requirements: requirements
        };

        return this;
    },
    runOnce: function(record, ck) {
        var i,
            len = this.options.iterations.value;

        var st = +new Date();
        record.run.getBestIte = 0;
        for (i = 0; i < len; i++) {
            this.status.iteration = i;
            this.iterate(record);
            if (ck && ck.call(this, record)) {
                break;
            }
        }
        var et = +new Date();
        var duration = et - st;

        record.run.total = duration;
        record.run.iterations = len;

        return this;
    },
    simulationStatistic: function() {
        var j,
            r,
            best = 0,
            sumFitness = 0,
            sumTime = 0,
            sumIte = 0,
            sumRn = 0,
            mse = 0,
            rpt = this.options.rpt.value;

        // find the best one
        for(j = 0; j < rpt; j++) {
            r = this.records[j];
            if (r.readers.statistic.fitness > best) {
                best = r.readers.statistic.fitness;
                this.readers = cloneReaders(r.readers);
                this.runData.bestPos = j;
            }

            // avg fitness
            sumFitness += r.readers.statistic.fitness;

            // avg time
            sumTime += r.run.total;

            // avg iteration to get best solution
            sumIte += r.run.getBestIte;

            // for minReader object, avg min reader to achive the goal
            sumRn += r.readers.length;

        }

        this.runData.avgFitness = sumFitness / rpt;
        this.runData.avgTime = sumTime / rpt;
        this.runData.avgIte = sumIte / rpt;
        this.runData.avgRn = sumRn / rpt;
        this.runData.options = clone(this.options);
        this.runData.tags = cloneArray(this.tags);
        this.runData.readers = cloneReaders(this.readers);
        this.runData.readerStatistic = clone(this.readers.statistic);
        this.runData.initialReaders = cloneReaders(this.initialReaders);
        this.runData.date = +new Date();

        for(j = 0; j < rpt; j++) {
            mse += Math.pow(this.records[j].readers.statistic.fitness - this.runData.avgFitness, 2);
        }
        this.runData.mse = mse / rpt;


    },
    iterate: function (record) {
        var i,
            j,
            sum = 0,
            self = this,
            len = this.options.rn.value,
            m = this.options.m.value,
            w = this.options.w.value,
            c1 = this.options.c1.value,
            c2 = this.options.c2.value,
            maxV = this.options.maxV.value,
            xsize = this.options.xsize.value,
            ysize = this.options.ysize.value,
            gbest = record.readers,
            pbest = record.pbest,
            population = record.population,
            x,
            tempx,
            highestFitness = (gbest.statistic ? gbest.statistic.fitness : this.getStatistic(gbest, this.tags).fitness) || 0,
            f1,
            f2,
            v = record.v;

        for (i = 0; i < m; i++) {
            x = population[i];
            tempx = cloneReaders(x);
            for (j = 0; j < len; j++) {
                f1 = c1 * Math.random();
                f2 = c2 * Math.random();

                // update speed
                v[j].x = w * v[j].x
                         + f1 * ( (pbest[i][j] ? pbest[i][j].x : 0) - ( x[j].x ) )
                         + f2 * ( (gbest[j] ? gbest[j].x : 0) - ( x[j].x ) );
                v[j].y = w * v[j].y
                         + f1 * ( (pbest[i][j] ? pbest[i][j].y : 0) - ( x[j].y ) )
                         + f2 * ( (gbest[j] ? gbest[j].y : 0) - ( x[j].y ) );

                // make sure v is not greater than maxV or less than -maxV
                v[j].x = v[j].x > maxV ? maxV : v[j].x;
                v[j].x = v[j].x < -1 * maxV ? -1 * maxV : v[j].x;

                v[j].y = v[j].y > maxV ? maxV : v[j].y;
                v[j].y = v[j].y < -1 * maxV ? -1 * maxV : v[j].y;

                // new position
                tempx[j].x += +v[j].x;
                tempx[j].x = tempx[j].x > xsize ? xsize : tempx[j].x;

                tempx[j].y += +v[j].y;
                tempx[j].y = tempx[j].y > ysize ? ysize : tempx[j].y;

            }

            tempx.statistic = this.getStatistic(tempx, this.tags);
            population[i] = cloneReaders(tempx);

            // avg fitness
            sum += tempx.statistic.fitness;

            if (!pbest[i].statistic) {
                pbest[i].statistic = this.getStatistic(pbest[i], this.tags);
            }

            if (tempx.statistic.fitness > pbest[i].statistic.fitness ) {
                pbest[i] = cloneReaders(tempx);
            }

            if (tempx.statistic.fitness > gbest.statistic.fitness) {
                record.readers = cloneReaders(tempx);
                highestFitness = tempx.statistic.fitness;
                record.run.getBestIte = self.status.iteration;
            }

        }

        record.avg.push(sum / m);
        record.highest.push(highestFitness);
        record.readers = cloneReaders(record.readers);

        return this;
    },
    // received power of tag from reader
    getPower: function (reader, tag, it) {
        var d = 0;
        if (it >= 0) {
            d = reader.distance[it];
        } else {
            d = distance(reader, tag);
        }
        var L = 10 * Math.log(  Math.pow( 4 * Math.PI * d / 0.33 , 2) / (this.options.Gtx.value * this.options.Gtag.value) ) / Math.log(10) + rnd(0, 5);
        return this.options.Ps.value - L;
    },
    isInField: function (reader, tag, it) {
        return this.getPower(reader, tag, it) >= this.options.Rq.value;
    },
    getStatistic: function (readers, tags) {
        var self = this,
            results = [];

        // calculate the distance between each reader and each tag
        readers.forEach(function (reader, ir) {
            tags.forEach(function (tag, it) {
                reader.distance[it] = distance(reader, tag);
            });
        });

        // coverage
        var coverage = 0;
        tags.forEach(function (tag, it) {
            for(var p = 0; p < readers.length; p++) {
                if (self.isInField(readers[p], tag, it)) {
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
            max = -1000;
            rt = 0;
            readers.forEach(function (reader, ir) {
                temp = self.getPower(reader, tag, it);
                max = max > temp ? max : temp;
                i += temp;
            });
            if (i !== 1) {
                rt = max / i;
            }
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
        tags.forEach(function (tag, it) {
            ni = 0;
            readers.forEach(function (reader, ir) {
                if (self.isInField(reader, tag, it)) {
                    ni++;
                }
            });
            if (ni !== 0 && ni !== 1){
                balance = balance * (1 / ni);
            }

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

function Record(avg, highest, run, readers, population, v) {
    this.avg = avg || [];
    this.highest = highest || [];
    this.run = run || {};
    this.readers = readers || [];
    this.population = population || [];
    this.v = v || [];
    this.pbest = cloneReaderArray(this.population);
}

function V(x, y) {
    this.x = x || 0;
    this.y = y || 0;
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

function cloneReaderArray(arr) {
    var ret = [];
    arr.forEach(function(v, i) {
        ret.push(cloneReaders(v));
    });

    return ret;
}

function distance(p1, p2) {

    if (check(p1.x) && check(p1.y) && check(p2.x) && check(p2.y)) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    function check(n) {
        return n >= 0;
    }
    return null;
}

function randomNumber(min, max) {
    min = min || 0;
    max = max || 1;
    return parseFloat((Math.random() * (max - min) + min).toFixed(3));
}

// standard normal distribution
function rnd_snd() {
    return (Math.random() * 2 - 1) + (Math.random() * 2 - 1) + (Math.random() * 2 - 1);
}

// get normal distribution number with given 'mean' and 'stdev'. http://www.protonfish.com/random.shtml
function rnd(mean, stdev) {
    return rnd_snd() * stdev + mean;
}