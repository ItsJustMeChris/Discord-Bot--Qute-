var accepts = require('accepts')
const https = require("https");
'use strict';

var Generators = function ()  {

    Generators.prototype.password = function (length) {
        if (length == null){
            length = 12
        }
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    Generators.prototype.number = function (max) {
        if (max == null){
            max = 100
        }
        return Math.floor(Math.random() * Math.floor(max));
    }

    Generators.prototype.avatar = function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 12; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));

        return "https://api.adorable.io/avatars/285/"+text
    }

    Generators.prototype.dadjoke = function (callback) {
        var options = {
        host: 'icanhazdadjoke.com',
        path: '/',
        headers: {
            accept: 'application/json'
            }
        };
        https.get(options, res => {
            res.setEncoding("utf8")
            let body = ""
            res.on("data", data => {
                body += data
            })
            res.on("end", () => {
                body = JSON.parse(body)
                var value = body["joke"]
                callback(value)
            })
        })
    }
}
exports = module.exports = Generators;
