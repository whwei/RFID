"use strict";

var ga = function () {
    this.options = {}; // simulation params
    this.status = {
        initialized: false,
        iteration: 0
    };
    this.population = [];
    this.readers = []; // best solution
    this.tags = [];
    this.records = [];

};

ga.prototype = {
    test: function () {
        return this;
    },
    init: function (op) {
        this.reset();

        var i = 0,
            j = 0;

        this.options = extend({}, ga._options, op);

        this.l = distance({x: 0, y: 0}, {x: this.size, y: this.size});

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
            halfLen,
            rd,
            highestFitness = 0,
            self = this,
            sum = 0,
            ac = 0,
            accumulated = [],
            winners = [];

//        console.table(this.population);

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
        halfLen = Math.floor(winners.length / 2);
        for (i = 0; i < halfLen; i++) {
             cross(winners[i], winners[i + halfLen]);
        }

        // mutation operation
        winners.forEach(mutation);

//        console.table(winners);

        this.population = winners;

        this.records.push(this.readers.statistic);

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

ga._options =  {
    rn: 10, // reader_number
    tn: 50, // tag_number
    size: 30, // working area size
    r: 5,
//    EIRP: 15,
//    G: 3,
//    lambda: 13.56,
//    Rq: 10,
    iterations: 1000,
    step: 10,
    m: 8,
    pc: 0.8,
    pm: 0.01
};

function Reader(x, y) {
    this.x = x;
    this.y = y;
    this.distance = [];
}

function extend() {

}

function distance(p1, p2) {
    if (check(p1.x) && check(p1.y) && check(p2.x) && check(p2.y)) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
    function check(n) {
        return n >= 0 && n <= ga.options.size;
    }

    return null;
}

function randomNumber(min, max) {
    min = min || 0;
    max = max || ga.options.size;
    return (Math.random() * (max - min) + min).toFixed(3);
}

function cross(g1, g2) {
    var i,
        temp,
        len = g1.length;

    for (i = 0; i < len; i++) {
        if (Math.random() <= ga.options.pc) {
            temp = g1[i];
            g1[i] = g2[i];
            g2[i] = temp;
        }
    }
}


function mutation(g) {
    g.forEach(function (r) {
        if (Math.random() <= ga.options.pm) {
            r = {
                x: randomNumber(),
                y: randomNumber()
            };
        }
    });
}

exports.ga = ga;