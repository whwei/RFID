"use strict";

var fs = require('fs');


var saver = {
    path: './js/algorithms/',

    setPath: function(p) {
        if (p) {
            this.path = p + '/algorithmWorker/';
        }
        this.persistent();
    },
    persistent: function () {
        var file,
            ofiles,
            files;
        
        try {
            files = fs.readdirSync(this.path);
        } catch (e) {
            fs.mkdirSync(this.path);
        }

        ofiles = fs.readdirSync('./js/algorithms/').filter(function(v){return v.match(/-worker.js/);});

        ofiles.forEach(function(v, i) {
            file = fs.readFileSync('./js/algorithms/' + v);
            fs.writeFileSync(this.path + v, file, {encoding: 'utf-8'});
        }.bind(this));
    },
    checkWorker: function(name) {
         try {
             fs.readFileSync(this.path + name + '-worker.js');
             return true;
         } catch (e) {
             this.persistent();
             return true;
         }
    },
    write: function(info, result) {
        try {
            fs.writeFileSync(this.path + info.name + '-worker.js', result.split(',')[1], {encoding: 'base64'});
        } catch (e) {
            fs.mkdirSync(this.path);
            fs.writeFileSync(this.path + info.name + '-worker.js', result.split(',')[1], {encoding: 'base64'});
        }

    },
    remove: function(name) {
        try {
            fs.unlinkSync(this.path + name + '-worker.js');
        } catch (e) {
            return e;
        }
    },
    exists: function(dir) {
        fs.exists(dir, function (exists) {
            console.log(exists ? "it's there" : "no passwd!");
        });
    }
}

exports.saver = saver;