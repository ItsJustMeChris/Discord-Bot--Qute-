const Discord = require('discord.js')
const client = new Discord.Client()
const Generators = require('./modules/generators.js')
const YouTube = require('./modules/youtubesearch.js')
const Weather = require('./modules/weather.js')
const CurrencyExchange = require('./modules/currency.js')
const gen = new Generators()
const weather = new Weather()
const yt = new YouTube()
const ce = new CurrencyExchange()
const fs = require('fs')
const ytdl = require('ytdl-core')
const streamOptions = {
    seek: 0,
    volume: 1
}
const broadcast = client.createVoiceBroadcast()
var debugToggled = false

function debug(text) {
    console.log("[Qute][debug] " + text)
}
debug('[Qute] Sigh, waking up.  ')
client.on('ready', () => {
    debug('[Qute] Naisu!  I\'m Ready!')
    client.user.setGame("qT pie <3")
})

var songQueue = []

function queueSong(guild, title, link, channel, requester) {
    if (songQueue[guild] == undefined) {
        songQueue[guild] = []
        songQueue[guild].push({
            title: title,
            link: link,
            channel: channel,
            requester: requester,
            paused: false,
            skip: false,
            songLength: 99999999999999,
            songPosition: 99999999999999
        })
    } else {
        songQueue[guild].push({
            title: title,
            link: link,
            channel: channel,
            requester: requester,
            paused: false,
            skip: false,
            songLength: 99999999999999,
            songPosition: 99999999999999
        })
    }
}

function sectostr(time) {
    return ~~(time / 60) + ":" + (time % 60 < 10 ? "0" : "") + time % 60
}

function isURL(str) {
    var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/
    if (!regex.test(str)) {
        return false
    } else {
        return true
    }
}

function urlencode(str) {
    str = escape(str);
    str = str.replace('+', '%2B');
    str = str.replace('%20', '+');
    str = str.replace('*', '%2A');
    str = str.replace('/', '%2F');
    str = str.replace('@', '%40');
    return str;
}

setInterval(function() {
    client.voiceConnections.array().forEach(elem => {
        if (!elem) {return false}
        let curVoice = client.voiceConnections.find(v => v.channel.guild.name == elem.channel.guild.name)
        if (elem.channel.members.array().length == 1) {
            if (curVoice.dispatcher) {
                if (curVoice.dispatcher.stream) {
                    curVoice.dispatcher.stream.end()
                }
                curVoice.dispatcher.end()
            }
            curVoice.disconnect()
            songQueue[elem.channel.guild.name] = []
            return false
        }
        if (!songQueue[elem.channel.guild.name]) {
            return false
        }
        if (!songQueue[elem.channel.guild.name][0]) {
            return false
        }
        if (songQueue[elem.channel.guild.name][0].songPosition > 0 && !songQueue[elem.channel.guild.name][0].paused) {
            songQueue[elem.channel.guild.name][0].songPosition = songQueue[elem.channel.guild.name][0].songPosition - 1
        } else {
            songQueue[elem.channel.guild.name].splice(0, 1)
            curVoice.dispatcher.stream.end()
            curVoice.dispatcher.end()
            if (songQueue[elem.channel.guild.name][0] == undefined) {
                curVoice.disconnect()
                return true
            }
            return true
        }
        if ((!curVoice.dispatcher && !songQueue[elem.channel.guild.name][0].paused) || songQueue[elem.channel.guild.name][0].skip) {
            const stream = ytdl(songQueue[elem.channel.guild.name][0].link.toString(), {
                filter: 'audioonly'
            })
            if (songQueue[elem.channel.guild.name][0].skip) {
                songQueue[elem.channel.guild.name].splice(0, 1)
                if (stream) {
                    stream.destroy()
                }
                if (curVoice.dispatcher) {
                    if (curVoice.dispatcher.stream) {
                        curVoice.dispatcher.stream.end()
                    }
                    curVoice.dispatcher.end()
                }
                curVoice.speaking = false
                if (songQueue[elem.channel.guild.name][0] == undefined) {
                    curVoice.disconnect()
                    return true
                }
                return true
            }
            curVoice.playStream(stream)
            ytdl.getInfo(songQueue[elem.channel.guild.name][0].link.toString(), (err, info) => {
                if (info && info.length_seconds) {
                    songQueue[elem.channel.guild.name][0].songLength = info.length_seconds // 5 second cross fade?
                    songQueue[elem.channel.guild.name][0].songPosition = info.length_seconds
                }
            })
            let curText = client.voiceConnections.find(v => v.channel.guild.name == elem.channel.guild.name).channel.guild.channels.find("name", songQueue[elem.channel.guild.name][0].channel)
            const embed = new Discord.RichEmbed()
                .setAuthor("[Music | Playing]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
                .setColor(0xff69b4)
                .addField(songQueue[elem.channel.guild.name][0].title + " [requested by " + songQueue[elem.channel.guild.name][0].requester + "]", songQueue[elem.channel.guild.name][0].link)
            curText.send({
                embed
            })
        }
    })
}, 1000)

client.on('message', message => {
    var msg = message.content.split(" ")

    //Currency Lookup
    if (msg[0] === "!currency") {
        message.delete()
        if (msg[1] != null && msg[2] != null) {
            ce.xtoy(msg[1].toUpperCase(), msg[2].toUpperCase(), function(data) {
                const embed = new Discord.RichEmbed()
                    .setAuthor("[Currency Rates]", "http://images.clipartpanda.com/money-clipart-stacks-of-money-clipart-1.jpg")
                    .setColor(0xff69b4)


                .addField(msg[1].toUpperCase() + " to " + msg[2].toUpperCase(), "1 " + msg[1].toUpperCase() + " = " + data + " " + msg[2].toUpperCase())
                message.channel.send({
                    embed
                })
            })
        }
        if (msg[1] != null && msg[2] == null) {
            ce.all(msg[1].toUpperCase(), function(data) {
                const embed = new Discord.RichEmbed()
                    .setAuthor("[Currency Exchange]", "http://images.clipartpanda.com/money-clipart-stacks-of-money-clipart-1.jpg")
                    .setTitle(msg[1].toUpperCase() + " to all")
                    .setColor(0xff69b4)


                var count = 0
                for (c in data) {
                    count++
                    if (count < 25) {
                        embed.addField(c, data[c])
                    }
                }
                message.channel.send({
                    embed
                })
            })
        }
    }

    if (msg[0] == "!avatar") {
        message.delete()
        return message.reply("Here ya go! " + gen.avatar())
    }

    if (msg[0] == "!dadjoke") {
        message.delete()
        gen.dadjoke(function(data) {
            message.reply("hehe\n" + data)
        })
    }

    if (msg[0] == "!weather") {
        message.delete()
        if (msg[1] == null) {
            return message.reply("Please enter a location!")
        }
        if (msg[2]) {
            return message.reply("Invalid Search, Enter a state or city")
        }
        weather.lookup(msg[1], function(e) {
            if (e["cod"] == "404") {
                return message.reply("Invalid City")
            }
            const embed = new Discord.RichEmbed()
                .setAuthor("[" + msg[1].toUpperCase() + " WEATHER" + "]", "http://openweathermap.org/img/w/" + e["weather"][0].icon + ".png")
                .setThumbnail("http://openweathermap.org/img/w/" + e["weather"][0].icon + ".png")
                .setColor(0xff69b4)
                .addField("Weather", e["weather"][0].description)
                .addField("Temperature", e["main"].temp + "c")
                .addField("Temperature Min", e["main"].temp_min + "c")
                .addField("Temperature Max", e["main"].temp_max + "c")
                .addField("Pressure", e["main"].pressure)
                .addField("Humidity", e["main"].humidity + "%")
                .addField("Wind Speed", e["wind"].speed + "m/s")
                .addField("Cloudiness", e["clouds"].all + "%")
            message.channel.send({
                embed
            })

        })
    }

    //Help Message
    if (msg[0] === '!help') {
        message.delete()
        if (msg[1] == null) {
            const embed = new Discord.RichEmbed()
                .setAuthor("[Help]", "https://cdn.discordapp.com/avatars/399941524919418880/0706c7fd508cd12a898ddfbff9143020.webp?size=128")
                .setColor(0xff69b4)
                .addField("Generators", "!help generators")
                .addField("Music", "!help music")
                .addField("Currency", "!help currency")
                .addField("Weather", "!help weather")
                .addField("General", "!help general")
            message.channel.send({
                embed
            })
        } else if (msg[1] == "generators") {
            const embed = new Discord.RichEmbed()
                .setAuthor("[Help | Generators]", "https://cdn.discordapp.com/avatars/399941524919418880/0706c7fd508cd12a898ddfbff9143020.webp?size=128")
                .setColor(0xff69b4)
                .addField("!password <length>", "Generates a random password of <length> size")
                .addField("!number <max>", "Generates a random number between 0 and <max> (Default 100)")
                .addField("!avatar", "Generate a random avatar")
                .addField("!dadjoke", "Generate a random dad joke")
            message.channel.send({
                embed
            })
        } else if (msg[1] == "music") {
            const embed = new Discord.RichEmbed()
                .setAuthor("[Help | Music]", "https://cdn.discordapp.com/avatars/399941524919418880/0706c7fd508cd12a898ddfbff9143020.webp?size=128")
                .setColor(0xff69b4)
                .addField("!queue <page>", "Displays music queue")
                .addField("!join", "Joins the voice channel you are in")
                .addField("!skip", "Skips the current song")
                .addField("!pause", "Pause the current song")
                .addField("!resume", "Resume the current song")
                .addField("!current", "Resume the current song")
                .addField("!search <terms>", "Search youtube for <terms>")
                .addField("!play <terms/youtube-link>", "Search youtube for <terms> and queue the first result || play <youtube-link>")
                .addField("!volume <volume>", "Set the stream volume to <volume> (0-100)")
                .addField("!playlist <youtube-link>", "Add a full youtube playlist to the queue")
                .addField("!clear", "Clear the music queue")
            message.channel.send({
                embed
            })
        } else if (msg[1] == "currency") {
            const embed = new Discord.RichEmbed()
                .setAuthor("[Help | Currency]", "https://cdn.discordapp.com/avatars/399941524919418880/0706c7fd508cd12a898ddfbff9143020.webp?size=128")
                .setColor(0xff69b4)
                .addField("!currency <x> <y>", "Shows currency conversion from X to Y")
                .addField("!currency <x>", "Shows currency conversion from X to all currencies")
            message.channel.send({
                embed
            })
        } else if (msg[1] == "weather") {
            const embed = new Discord.RichEmbed()
                .setAuthor("[Help | Weather]", "https://cdn.discordapp.com/avatars/399941524919418880/0706c7fd508cd12a898ddfbff9143020.webp?size=128")
                .setColor(0xff69b4)
                .addField("!weather <state/city>", "Shows currency weather information")
            message.channel.send({
                embed
            })
        } else if (msg[1] == "general") {
            const embed = new Discord.RichEmbed()
                .setAuthor("[Help | General]", "https://cdn.discordapp.com/avatars/399941524919418880/0706c7fd508cd12a898ddfbff9143020.webp?size=128")
                .setColor(0xff69b4)
                .addField("!lmgtfy <search-terms>", "Sends a let me google that for you link")
            message.channel.send({
                embed
            })
        }
    }

    //Random Password Generator
    if (msg[0] === '!password') {
        message.delete()
        if (msg[1] == null) {
            message.author.send("Here's your password: \n" + gen.password())
        } else {
            message.author.send("Here's your password: \n" + gen.password(msg[1]))
        }
    }

    if (msg[0] == "!lmgtfy") {
        var searchTerms = message.content.substring(7)

        message.delete()
        if (msg[1] == null) {
            return message.reply("Input search terms!")
        }
        message.reply("http://lmgtfy.com/?q=" + urlencode(searchTerms))
    }

    //Random Number Generator
    if (msg[0] === '!number') {
        message.delete()
        if (msg[1] == null) {
            message.channel.send("Random Number: " + gen.number())
        } else {
            message.channel.send("Random Number: " + gen.number(msg[1]))
        }
    }

    if (msg[0] == "!play") {
        message.delete()
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {})
                .catch(console.log)
        } else {
            return message.reply('Join a voice silly!')
        }
        if (isURL(msg[1])) {
            ytdl.getInfo(msg[1], (err, info) => {
                if (info && info.title) {
                    const embed = new Discord.RichEmbed()
                        .setAuthor("[Music | Added]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
                        .setColor(0xff69b4)
                        .addField(info.title, msg[1])
                        .addField("Length", sectostr(info.length_seconds))
                        .addField("Author", info.author.name)
                        .addField("Requester", message.author.username)
                    if (info.player_response.videoDetails && info.player_response.videoDetails.thumbnail && info.player_response.videoDetails.thumbnail.thumbnails[0]) {
                        embed.setThumbnail(info.player_response.videoDetails.thumbnail.thumbnails[0].url)
                    }
                    message.channel.send({
                        embed
                    })
                    queueSong(message.guild.name, info.title, msg[1], message.channel.name, message.author.username)
                }
            })
        } else {
            var searchTerms = message.content.substring(6)
            if (msg[1] == null) {
                return message.reply("Input search terms!")
            }
            yt.lookup(searchTerms, function(results) {
                ytdl.getInfo(results[0].link, (err, info) => {
                    if (info && info.title) {
                        const embed = new Discord.RichEmbed()
                            .setAuthor("[Music | Added]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
                            .setColor(0xff69b4)
                            .addField(info.title, results[0].link)
                            .addField("Length", sectostr(info.length_seconds))
                            .addField("Author", info.author.name)
                            .addField("Requester", message.author.username)
                        if (info.player_response.videoDetails && info.player_response.videoDetails.thumbnail && info.player_response.videoDetails.thumbnail.thumbnails[0]) {
                            embed.setThumbnail(info.player_response.videoDetails.thumbnail.thumbnails[0].url)
                        }
                        message.channel.send({
                            embed
                        })
                        queueSong(message.guild.name, info.title, results[0].link, message.channel.name, message.author.username)
                    }
                })
            })
        }
    }

    if (msg[0] == "!search") {
        var searchTerms = message.content.substring(8)

        message.delete()
        if (msg[1] == null) {
            return message.reply("Input search terms!")
        }
        yt.lookup(searchTerms, function(results) {
            const embed = new Discord.RichEmbed()
                .setAuthor("[Youtube | Search]", "https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-256.png")
                .setTitle("Search Results For: " + searchTerms.toUpperCase())
                .setColor(0xff69b4)
            for (c in results) {
                embed.addField("[" + c + "] " + results[c].title, results[c].link)
            }
            message.channel.send({
                embed
            })
        })
    }

    if (msg[0] == "!playlist") {
        message.delete()
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {})
                .catch(console.log)
        } else {
            return message.reply('Join a voice silly!')
        }
        yt.playlist(msg[1], function(items) {
            items.forEach(elem => {
                if (elem.title != "Deleted video") {
                    queueSong(message.guild.name, elem.title, "https://youtube.com/watch?v=" + elem.resourceId.videoId, message.channel.name, message.author.username)
                }
            });
            const embed = new Discord.RichEmbed()
                .setAuthor("[Music | Added]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
                .setColor(0xff69b4)
                .addField("Playlist", msg[1])
                .addField("Songs", items.length)
                .addField("Requester", message.author.username)
            message.channel.send({
                embed
            })
        })
    }

    //=======
    //Music Commands | Ignore Private Chat
    //=======
    if (!message.guild) return
        //Force join voice
    if (msg[0] === '!join') {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    message.reply('Let\'s get this party started!')
                })
                .catch(console.log)
        } else {
            message.reply('Join a voice silly!')
        }
    }

    //Skip Song
    if (msg[0] === "!skip") {
        if (songQueue[message.channel.guild.name] && songQueue[message.channel.guild.name][0]) {
            const embed = new Discord.RichEmbed()
                .setAuthor("[Music | Skip]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
                .setColor(0xff69b4)
                .addField("Skipping: " + songQueue[message.channel.guild.name][0].title + " [requested by " + songQueue[message.channel.guild.name][0].requester + "]", songQueue[message.channel.guild.name][0].link)
                message.channel.send({
                    embed
                })
            songQueue[message.channel.guild.name][0].skip = true
        } else {
            message.reply("Nothing to skip")
        }
    }

    //Clear queue
    if (msg[0] === "!clear") {
        if (songQueue[message.channel.guild.name] && songQueue[message.channel.guild.name][0]) {
            songQueue[message.channel.guild.name] = []
            message.reply("Queue cleared, let me finish this tune tho!")
        } else {
            message.reply("Nothing to skip")
        }
    }

    //Resume Song
    if (msg[0] === "!resume") {
        if (songQueue[elem.channel.guild.name] == undefined || songQueue[elem.channel.guild.name][0] == undefined)
        {
            return message.reply("There is no song to resume.  ")
        }
        const embed = new Discord.RichEmbed()
            .setAuthor("[Music | Resume]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
            .setColor(0xff69b4)
            .addField("Resuming: " + songQueue[message.channel.guild.name][0].title + " [requested by " + songQueue[message.channel.guild.name][0].requester + "]", songQueue[message.channel.guild.name][0].link)
        message.channel.send({
            embed
        })
        client.voiceConnections.array().forEach(elem => {
            if (elem.channel.guild.name == message.guild.name) {
                songQueue[elem.channel.guild.name][0].paused = false
                let curVoice = client.voiceConnections.find(v => v.channel.guild.name == message.guild.name)
                curVoice.dispatcher.resume()
            }
        })
    }
    if (msg[0] === "!volume") {
        if (msg[1] < 0 || msg[1] > 100) {
            return message.reply("Error, valid volume 0-100")
        }
        const embed = new Discord.RichEmbed()
            .setAuthor("[Music | Volume]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
            .setColor(0xff69b4)
            .addField("Volume Changed", message.author.username + " changed the volume to: " + msg[1])
        message.channel.send({
            embed
        })
        client.voiceConnections.array().forEach(elem => {
            if (elem.channel.guild.name == message.guild.name) {
                let curVoice = client.voiceConnections.find(v => v.channel.guild.name == message.guild.name)
                curVoice.dispatcher.setVolume(msg[1] / 100)
            }
        })
    }
    //Pause Song
    if (msg[0] === "!pause") {
        if (songQueue[elem.channel.guild.name] == undefined || songQueue[elem.channel.guild.name][0] == undefined)
        {
            return message.reply("There is no song to pause.  ")
        }
        const embed = new Discord.RichEmbed()
            .setAuthor("[Music | Pause]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
            .setColor(0xff69b4)
            .addField("Pausing: " + songQueue[message.channel.guild.name][0].title + " [requested by " + songQueue[message.channel.guild.name][0].requester + "]", songQueue[message.channel.guild.name][0].link)
        message.channel.send({
            embed
        })
        client.voiceConnections.array().forEach(elem => {
            if (elem.channel.guild.name == message.guild.name) {
                songQueue[elem.channel.guild.name][0].paused = true
                let curVoice = client.voiceConnections.find(v => v.channel.guild.name == message.guild.name)
                curVoice.dispatcher.pause()
            }
        })
    }

    //Leave Voice
    if (msg[0] === "!leave") {
        client.voiceConnections.array().forEach(elem => {
            if (elem.channel.guild.name == message.guild.name) {
                let curVoice = client.voiceConnections.find(v => v.channel.guild.name == message.guild.name)
                curVoice.disconnect()
            }
        })
        message.reply("Fine, party alone..")
    }

    //Current song
    if (msg[0] == "!current") {
        message.delete()
        if (songQueue[message.guild.name] != undefined && songQueue[message.guild.name][0] != undefined) {
            var alpha = songQueue[message.channel.guild.name][0].songLength - songQueue[message.channel.guild.name][0].songPosition
            var percent = Math.floor(alpha / songQueue[message.channel.guild.name][0].songLength * 100)
            var percentBars = []
            for (i = 0; i < 20; i++) {
                if (Math.floor(i / 20 * 100) <= percent) {
                    percentBars.push("=")
                } else {
                    percentBars.push("-")
                }
            }
            const embed = new Discord.RichEmbed()
                .setAuthor("[Music | Current]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
                .setColor(0xff69b4)
                .addField(songQueue[message.guild.name][0].title + " [requested by " + songQueue[message.guild.name][0].requester + "]", songQueue[message.guild.name][0].link)
                .addField("Song Progress", percentBars.join('') + " [" + percent + "%]")
            message.channel.send({
                embed
            })
        } else {
            message.reply("Current Song: None")
        }
    }

    //Music Queue
    if (msg[0] == "!queue") {
        message.delete()
        if (msg[1] == 0 || msg[1] == null) {
            if (songQueue[message.guild.name] == undefined || songQueue[message.guild.name][0] == undefined) {
                message.reply("Nothing to show you :(\nWhy not play something!")
                return true
            }
            const embed = new Discord.RichEmbed()
                .setAuthor("[Music | Queue Page 0-" + (Math.ceil((songQueue[message.guild.name].length - 1) / 10) - 1) + "]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
                .setColor(0xff69b4)
            songQueue[message.guild.name].forEach(function(value, i) {
                if (i < (10)) {
                    embed.addField('[' + i + '] ' + value.title + " [requested by " + value.requester + "]", value.link)
                }
            })
            message.channel.send({
                embed
            })
        } else {
            if (songQueue[message.guild.name] == undefined || songQueue[message.guild.name][0] == undefined) {
                message.reply("Nothing to show you :(\nWhy not play something!")
                return true
            }
            const embed = new Discord.RichEmbed()
                .setAuthor("[Music | Queue Page " + msg[1] + "-" + (Math.ceil((songQueue[message.guild.name].length - 1) / 10) - 1) + "]", "https://cdn.pixabay.com/photo/2016/04/07/22/09/note-1314943_960_720.png")
                .setColor(0xff69b4)
            songQueue[message.guild.name].forEach(function(value, i) {
                if (i >= msg[1] * 10 && i < msg[1] * 10 + 10) {
                    embed.addField('[' + i + '] ' + value.title + " [requested by " + value.requester + "]", value.link)
                }
                if (i == songQueue[message.guild.name].length - 1) {
                    message.channel.send({
                        embed
                    })
                }
            })
        }
    }
})

client.login('DISCORD KEY')
