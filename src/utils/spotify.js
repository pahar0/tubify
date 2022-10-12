const SpotifyWebApi = require('spotify-web-api-node')

const config = require('../config')
const spotify = new SpotifyWebApi({
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
})

const getSongs = (id, offset) => spotify.getPlaylistTracks(id, { offset: offset })

const getAllSongs = async (id) => {
    try {
        const data = await spotify.getPlaylistTracks(id)
        const numBatches = Math.floor(data.body.total / 100) + 1
        const promises = []
        for (let batchNum = 0; batchNum < numBatches; batchNum++) {
            const promise = getSongs(id, batchNum * 100)
            promises.push(promise)
        }
        const rawSongData = await Promise.all(promises)
        let songs = []
        for (let i = 0; i < rawSongData.length; i++) {
            songs = songs.concat(rawSongData[i].body.items)
        }
        return songs
    } catch (error) {
        console.log(error)
    }
}

module.exports = spotify
module.exports.getAllSongs = getAllSongs
