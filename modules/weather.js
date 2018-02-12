const https = require("https");
'use strict';

var Weather = function ()  {

    Weather.prototype.lookup = function (location, callback) {
        const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q="+location+"&appid=API KEY&units=metric"
        https.get(weatherURL, res => {
            res.setEncoding("utf8")
            let body = ""
            res.on("data", data => {
                body += data
            })
            res.on("end", () => {
                body = JSON.parse(body)
                callback(body)
            })
        })
    }
}
exports = module.exports = Weather;
