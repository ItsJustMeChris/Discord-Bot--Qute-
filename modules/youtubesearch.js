const ypi = require('youtube-playlist-info');
'use strict';

var YouTube = function ()  {

    YouTube.prototype.lookup = function (terms, callback) {
        var search = require('youtube-search');

        var opts = {
          maxResults: 10,
          key: 'YouTube Key'
        };
        search(terms.toString(), opts, function(err, results) {
          if(err) return console.log(err);
          callback(results)
        });
    }

    YouTube.prototype.playlist = function (terms, callback) {
        var search = require('youtube-search');
        var cut = "list="
        var term = terms.slice(terms.indexOf(cut) + cut.length);
        ypi("YouTube Key", term.toString()).then(items => {
            callback(items)
        }).catch(console.error);
    }
}
exports = module.exports = YouTube;
