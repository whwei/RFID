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
        this.algorithmInfos.push(info);
        fs.writeFileSync(this.aiPath, JSON.stringify(this.algorithmInfos, null, '\t'));
    }
};

exports.algorithmInfo = algorithmInfo;