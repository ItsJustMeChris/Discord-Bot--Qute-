const https = require("https");
'use strict';

var CurrencyExchange = function ()  {

    CurrencyExchange.prototype.xtoy = function (x,y, callback) {
        const url = "https://api.fixer.io/latest?base="+x
        https.get(url, res => {
            res.setEncoding("utf8")
            let body = ""
            res.on("data", data => {
                body += data
            })
            res.on("end", () => {
                body = JSON.parse(body)
                var value = body["rates"][y]
                callback(value)
            })
        })
    }

    CurrencyExchange.prototype.all = function (x, callback) {
        const url = "https://api.fixer.io/latest?base="+x
        https.get(url, res => {
            res.setEncoding("utf8")
            let body = ""
            res.on("data", data => {
                body += data
            })
            res.on("end", () => {
                body = JSON.parse(body)
                var value = body["rates"]
                callback(value)
            })
        })
    }


}
exports = module.exports = CurrencyExchange;
