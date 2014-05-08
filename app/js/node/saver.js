"use strict";

var fs = require('fs');

var saver = {
    write: function(info, result) {
        fs.writeFileSync('./js/algorithms/' + info.name + '-worker.js', result.split(',')[1], {encoding: 'base64'});
    },
    exists: function(dir) {
        fs.exists(dir, function (exists) {
            console.log(exists ? "it's there" : "no passwd!");
        });
    }
}

exports.saver = saver;