/**
 * Created by whwei on 14-4-26.
 */
"use strict";

var fs = require('fs');

var algorithmInfo = {
    aiPath: './js/algorithms/index.json',
    algorithmInfos: [],
    loadAlgorithmInfo: function () {
        this.refresh();
        return this.algorithmInfos;
    },
    refresh: function () {
        this.algorithmInfos = JSON.parse(fs.readFileSync(this.aiPath, {encoding: 'utf-8'}));
    },
    saveAlgorithmInfo: function (info) {
        this.refresh();
        info && this.algorithmInfos.push(info);
        fs.writeFileSync(this.aiPath, JSON.stringify(this.algorithmInfos, null, '\t'));
    },
    removeAlgorithmInfo: function (name) {
        this.refresh();
        var i = 0;
        for (; i< this.algorithmInfos.length; i++) {
            if (this.algorithmInfos[i].name === name) {
                break;
            }
        }
        
        this.algorithmInfos.splice(i, 1);
        console.log(this.algorithmInfos);
        fs.writeFileSync(this.aiPath, JSON.stringify(this.algorithmInfos, null, '\t'));
    }
};

exports.algorithmInfo = algorithmInfo;