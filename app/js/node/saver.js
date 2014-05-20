"use strict";

var fs = require('fs');

var saver = {
    path: './js/algorithms/',
    write: function(info, result) {
        fs.writeFileSync(this.path + info.name + '-worker.js', result.split(',')[1], {encoding: 'base64'});
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