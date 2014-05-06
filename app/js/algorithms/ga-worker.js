"use strict";

self.addEventListener('message', function (e) {
    var ga = new GA(e.data);
    ga.init();

   self.postMessage(ga.run());

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
    this.records = [];

};

GA.prototype = {
    options:  {
        rn: 10, // reader_number
        tn: 30, // tag_number
        size: 30, // working area size
        r: 5,
        EIRP: 15,
        G: 3,
        lambda: 13.56,
        Rq: 10,
        iterations: 200,
        step: 10,
        m: 20,
        pc: 0.7,
        pm: 0.0001
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

        console.table(g1);
        console.table(g2);
    },
    init: function () {
        this.reset();

        var i = 0,
            j = 0;

        // each tag has a random position
        for (i = 0; i < this.options.tn; i++) {
            this.tags.push({
                x: randomNumber(),
                y: randomNumber()
            });
        }

        // each reader has a random position
        for (i = 0; i < this.options.m; i++) {
            this.population[i] = [];
            for (j = 0; j < this.options.rn; j++) {
                this.population[i].push(new Reader(randomNumber(),randomNumber()));
            }
        }

        this.status.initialized = true;

        return this;
    },
    reset: function () {
        this.population = [];
        this.tags = [];
        this.elements = [];
        this.records = [];
        this.status.iteration = 0;
        this.status.initialized = false;
    },
    run: function(it) {
        var i,
            len = it || this.options.iterations;
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
            highestFitness = 0,
            self = this,
            sum = 0,
            ac = 0,
            accumulated = [],
            winners = [];

        this.population.forEach(function (s) {
            s.statistic = self.getStatistic(s, self.tags);

            if (s.statistic.fitness > highestFitness) {
                highestFitness = s.statistic.fitness;
                self.readers = s;
            }
            sum += s.statistic.fitness;
        });

        for (i = 0; i < len; i++) {
            this.population[i].statistic = this.getStatistic(this.population[i], this.tags);
            ac += this.population[i].statistic.fitness / sum;
            accumulated[i] = ac;
        }
        
        accumulated.unshift(0);
        // individual selection
        for (j = 0; j < len; j++) {
            rd = Math.random();
            for (i = accumulated.length - 1; i >= 1; i--) {
                if (rd <= accumulated[i] && rd >= accumulated[i - 1]) {
                    winners.push(this.population[i - 1]);
                    break;
                }
            }
        }
        // cross operation
        var halfLen = len / 2;
        for (i = 0; i < halfLen; i++) {
            cross(winners[i], winners[i + halfLen], this.options.pc);
        }

        // mutation operation
        for (i = 0; i < len; i++) {
            mutation(winners[i], this.options.pm);
        }

        this.population = winners;

        this.records.push(sum / len);

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
        return (this.options.lambda * this.options.lambda * this.options.G * this.options.EIRP) / Math.pow(4 * Math.PI * d, 2);
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
            readers.forEach(function (reader, ir) {
                //coverage
                coverage += reader.distance[it] <= self.options.r ? 1 : 0;
            });
        });
        results.push({
            object: 'coverage',
            weight: 0.333,
            value: coverage / this.options.tn
        });

        // interference
        var i = 0,
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
            i = max / i;
            interference += i;
        });
        results.push({
            object: 'interference',
            weight: 0.333,
            value: interference / this.options.tn
        });

        // load balance
        var ni = 0,
            balance = 0;
        readers.forEach(function (reader, ir) {
            ni = 0;
            tags.forEach(function (tag, it) {
                if (reader.distance[it] <= self.options.r) {
                    ni++;
                }
            });

            balance += ni !== 0 ?
                (ni / self.options.tn) * Math.log(ni / self.options.tn) / Math.log(self.options.rn)
                :
                0;

        });
        results.push({
            object: 'loadBalance',
            weight: 0.333,
            value: -1 * balance
        });


        return {
            readers: readers.slice(), // deep copy
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

function distance(p1, p2) {
    if (check(p1.x) && check(p1.y) && check(p2.x) && check(p2.y)) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
    function check(n) {
        return n >= 0 && n <= GA.prototype.options.size;
    }

    return null;
}

function randomNumber(min, max) {
    min = min || 0;
    max = max || GA.prototype.options.size;
    return (Math.random() * (max - min) + min).toFixed(3);
}

function cross(g1, g2, pc) {
    var i,
        temp,
        len = g1.length;

    for (i = 0; i < len; i++) {
        if (Math.random() <= pc) {
            temp = g1[i];
            g1[i] = g2[i];
            g2[i] = temp;
        }
    }
}


function mutation(g, pm) {
    var i,
        len = g.length;

    for (i = 0; i < len; i++) {
        if (Math.random() <= pm) {
            g[i] = new Reader(randomNumber(), randomNumber());
        }
    }
}