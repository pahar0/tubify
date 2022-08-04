var validUrl = require('valid-url')
const fs = require('fs')
const axios = require('axios')

const config = require('../config')


const getPlaylist = async (req, res, next) => {

    const tokensFile = fs.readFileSync('./tokens.json')
    const tokensParse = JSON.parse(tokensFile)

    console.log(tokensParse.spotify.expires_in, Math.round(new Date() / 1000), (tokensParse.spotify.expires_in <= Math.round(new Date() / 1000)))

    if (tokensParse.spotify.expires_in <= Math.round(new Date() / 1000)) {
        spotifyApi.clientCredentialsGrant().then((result) => {
            fs.writeFileSync('./tokens.json', JSON.stringify({ spotify: { access_token: result.body.access_token, expires_in: Math.round(new Date() / 1000) + result.body.expires_in } }, null, 4))
            console.log("access token refreshed")
        }).catch(function (err) {
            return next(err)
        })
    }

    //spotifyApi.setAccessToken(tokensParse.spotify.access_token)

    const userInfo = await spotifyApi.getMe()
    console.log(userInfo);
    return
    const playlists = await spotifyApi.getUserPlaylists()

    const spotifyId = pathnameSplit[2]
    const playlistApi = (playlistType == "playlist") ? await spotifyApi.getPlaylist(spotifyId) : await spotifyApi.getAlbum(spotifyId)


    const playlistDetails = {
        name: playlistApi.body.name,
        id: playlistApi.body.id,
        cover: playlistApi.body.images[1].url
    }

    if (playlistType == "playlist")
        playlistDetails.description = playlistApi.body.description

    // TODO: pass playlistType to getAllSongs and use the proper function
    const songsApi = await getAllSongs(spotifyId)

    const songsDetails = songsApi.reverse().map((track) => {
        const covers = (track.track.is_local === true) ? false : track.track.album.images
        const trackArtists = track.track.artists.map((artist) => artist.name).join(', ')
        const songName = track.track.name
        const albumName = track.track.album.name
        const addDate = new Date(track.added_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).replace('.', '')
        //const addDate = new Date(track.added_at).toDateString()
        const durationMinutes = Math.floor(track.track.duration_ms / 60000)
        const durationSeconds = ((track.track.duration_ms % 60000) / 1000).toFixed(0)
        const duration = durationMinutes + ":" + (durationSeconds < 10 ? '0' : '') + durationSeconds
        return {
            covers: covers,
            songName: songName,
            artistsName: trackArtists,
            albumName: albumName,
            addDate: addDate,
            duration: duration,

        }
    })

    playlistDetails.songs = songsDetails
    playlistDetails.youtubeIDS = []


    const youtubeSearch = (song) => axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(song)}&sp=EgIQAQ%253D%253D`)

    const promiseArray = playlistDetails.songs.map((song) => {
        return youtubeSearch(`${song.artistsName} - ${song.songName}`)
    })

    Promise.all(promiseArray).then((data) => {
        data.map((responseYoutube, index) => {
            //console.log(responseYoutube.data);
            const regexp = /(?<={"videoId":").*?(?=")/gm;
            const youtubeIDS = [...new Set(responseYoutube.data.match(regexp))];
            playlistDetails.songs[index].youtubeIDS = youtubeIDS

        })

        playlistDetails.songs.map((value, index) => {
            playlistDetails.youtubeIDS.push(playlistDetails.songs[index].youtubeIDS[0])
        })

        //console.log(JSON.stringify(playlistDetails, null, 4));
        //return res.send(playlistDetails)
        return res.render('player', { playlistDetails: playlistDetails })
    }).catch((error) => {
        console.log(error);
    })


    //spotifyApi.getPlaylistTracks('5y1ZcTsuHdtm7UQIeOllFw').then(function (data) {
    //    console.log(data.body);
    //    return res.send(data.body.tracks)
    //}, function (err) {
    //    console.log('Something went wrong!', err);
    //});



    //const resp = await axios.get(`${url}`, {})
    //
    //console.log(resp.data);
    //
    //let $ = cheerio.load(resp.data)
    //
    //let spotifyTracklist = [], spotifyTracklistAux
    //
    //spotifyTracklistAux = $('span[dir="auto"]').map((i, track) => $(track).text()).get().forEach((v, i, a) => {
    //    if (i % 2 !== 0) spotifyTracklist.push(`${v} - ${a[i - 1]}`)
    //})

    //spotifyTracklist.map((track, index)) => {
    //    console.log(track);
    //    spotifyTracklist[index] = track.data.items[0].id.videoId
    //})


    //const youtubeSearch = (url) => axios.get(url)
    //const promiseArray = spotifyTracklist.map(youtubeSearch)
    //
    //Promise.all(promiseArray).then((data) => {
    //    data.map((responseYoutube, index) => {
    //        console.log(responseYoutube);
    //        data[index] = responseYoutube.data.items[0].id.videoId
    //    })
    //    //return res.send(data)
    //}).catch((error) => {
    //
    //})
    //return res.send(spotifyTracklist)
}
const getAllSongs = async (id) => {
    var data = await spotifyApi.getPlaylistTracks(id);
    var numBatches = Math.floor(data.body.total / 100) + 1;
    var promises = [];
    for (let batchNum = 0; batchNum < numBatches; batchNum++) {
        var promise = getSongs(id, batchNum * 100);
        promises.push(promise);
    }
    var rawSongData = await Promise.all(promises);
    var songs = [];
    for (let i = 0; i < rawSongData.length; i++) {
        songs = songs.concat(rawSongData[i].body.items);
    }
    return songs;
}

const getSongs = async (id, offset) => {
    var songs = await spotifyApi.getPlaylistTracks(id, { offset: offset });
    return songs;
}

module.exports = getPlaylist