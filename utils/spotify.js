const SpotifyWebApi = require('spotify-web-api-node')

const config = require('../config')
const spotifyApi = new SpotifyWebApi({ clientId: config.spotifyClientId, clientSecret: config.spotifyClientSecret })

const getSongs = async (id, offset) => {
    var songs = await spotifyApi.getPlaylistTracks(id, { offset: offset })
    return songs
}

const getAllSongs = async (id) => {
    let data = await spotifyApi.getPlaylistTracks(id)
    let numBatches = Math.floor(data.body.total / 100) + 1
    let promises = []
    for (let batchNum = 0; batchNum < numBatches; batchNum++) {
        let promise = getSongs(id, batchNum * 100)
        promises.push(promise)
    }
    let rawSongData = await Promise.all(promises)
    let songs = []
    for (let i = 0; i < rawSongData.length; i++) {
        songs = songs.concat(rawSongData[i].body.items)
    }
    return songs
}

module.exports = { spotifyApi, getAllSongs }