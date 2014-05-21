/**
 * Created by whwei on 14-4-26.
 */
"use strict";

var fs = require('fs');

var algorithmInfo = {
    aiPath: './js/algorithms/index.json',
    algorithmInfos: [],
    setPath: function(p) {
        if (p) {
            this.aiPath = p + '/algoInfo/index.json';
        }
        this.persistent();
    },
    persistent: function () {
        try {
            fs.readFileSync(this.aiPath, {encoding: 'utf-8'});
        } catch(e) {
            this.algorithmInfos = JSON.parse(fs.readFileSync('./js/algorithms/index.json', {encoding: 'utf-8'}));
            fs.mkdirSync(this.aiPath.replace('/index.json', ''));
            fs.writeFileSync(this.aiPath, JSON.stringify(this.algorithmInfos, null, '\t'));
        }
    },
    loadAlgorithmInfo: function () {
        this.refresh();
        return this.algorithmInfos;
    },
    refresh: function () {
        try {
            this.algorithmInfos = JSON.parse(fs.readFileSync(this.aiPath, {encoding: 'utf-8'}));
        } catch (e) {
            this.algorithmInfos = JSON.parse(fs.readFileSync('./js/algorithms/index.json', {encoding: 'utf-8'}));
        }
    },
    saveAlgorithmInfo: function (info) {
        this.refresh();
        info && this.algorithmInfos.push(info);
        try {
            fs.writeFileSync(this.aiPath, JSON.stringify(this.algorithmInfos, null, '\t'));
        } catch (e) {
            fs.mkdirSync(this.aiPath.replace('/algoInfo/', ''));
            fs.writeFileSync(this.aiPath, JSON.stringify(this.algorithmInfos, null, '\t'));
        }

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
        fs.writeFileSync(this.aiPath, JSON.stringify(this.algorithmInfos, null, '\t'));
    }
};

exports.algorithmInfo = algorithmInfo;