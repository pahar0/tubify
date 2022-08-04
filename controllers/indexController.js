const fs = require('fs')

const config = require('../config')
const { spotifyApi } = require('../utils/spotify')
const { youtubeSearch } = require('../utils/youtube')
const { getAllSongs } = require('../utils/spotify')

const indexDebug = (req, res, next) => {
    if (config.debug) {
        const indexExample = fs.readFileSync('./debug/index.json')
        return res.render('index', { userPlaylists: JSON.parse(indexExample), csrfToken: req.csrfToken() })
    }
    next()
}

const indexGeneratePlaylists = async (req, res, next) => {
    const playlistsDetails = []
    for await (const playlist of res.locals.getUserPlaylists.items) {
        if (playlist.tracks.total > 0)
            continue

        let playlistAux = {
            id: playlist.id,
            name: playlist.name,
            collaborative: playlist.collaborative,
            owner: playlist.owner.id, // if "spotify" use first element in images
            description: playlist.description,
            images: playlist.images,
            totalTracks: playlist.tracks.total,
            youtubeIDS: []
        }
        try {
            const tracksApi = await getAllSongs(playlist.id)
            playlistAux.tracks = tracksApi.reverse().map((track) => {
                const name = track.track.name
                const artists = track.track.artists.map((artist) => artist.name).join(', ')
                const images = (track.track.is_local === true) ? false : track.track.album.images
                const album = track.track.album.name
                const added_at = new Date(track.added_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).replace('.', '')
                const durationMinutes = Math.floor(track.track.duration_ms / 60000)
                const durationSeconds = ((track.track.duration_ms % 60000) / 1000).toFixed(0)
                const duration_string = durationMinutes + ":" + (durationSeconds < 10 ? '0' : '') + durationSeconds
                return {
                    name: name,
                    artists: artists,
                    images: images,
                    album: album,
                    added_at: added_at,
                    duration_string: duration_string
                }
            })
            for await (const [index, track] of playlistAux.tracks.entries()) {
                const search = await youtubeSearch(`${track.artists} - ${track.name}`)
                const regexp = /(?<={"videoId":").*?(?=")/gm;
                playlistAux.tracks[index].youtubeIDS = [...new Set(search.data.match(regexp))]
                playlistAux.youtubeIDS.push(playlistAux.tracks[index].youtubeIDS[0])
            }
        } catch (err) {
            console.log(err)
        }
        playlistsDetails.push(playlistAux)
    }
    res.locals.getUserPlaylists = playlistsDetails
    next()
}

const indexGenerateTopSongsPlaylist = async (req, res, next) => {
    let playlistTopSongsAux = {
        id: 'playlistTopSongs',
        name: 'Top Songs This Month',
        collaborative: false,
        owner: 'you hehe', // if "spotify" use first element in images
        description: 'Most played songs in the last month',
        images: [{
            "height": 640,
            "url": "/images/top-songs-month.png",
            "width": 640
        }],
        totalTracks: 50,
        youtubeIDS: []
    }
    try {
        spotifyApi.setAccessToken(req.session.spotifyTokens.access_token)
        const playlistTopSongs = await spotifyApi.getMyTopTracks({ time_range: 'short_term', limit: 50 })
        playlistTopSongsAux.tracks = playlistTopSongs.body.items.map((track) => {
            const name = track.name
            const artists = track.artists.map((artist) => artist.name).join(', ')
            const images = (track.is_local === true) ? false : track.album.images
            const album = track.album.name
            const added_at = 'today'
            const durationMinutes = Math.floor(track.duration_ms / 60000)
            const durationSeconds = ((track.duration_ms % 60000) / 1000).toFixed(0)
            const duration_string = durationMinutes + ":" + (durationSeconds < 10 ? '0' : '') + durationSeconds
            return {
                name: name,
                artists: artists,
                images: images,
                album: album,
                added_at: added_at,
                duration_string: duration_string
            }
        })
        for await (const [index, track] of playlistTopSongsAux.tracks.entries()) {
            const search = await youtubeSearch(`${track.artists} - ${track.name}`)
            const regexp = /(?<={"videoId":").*?(?=")/gm;
            playlistTopSongsAux.tracks[index].youtubeIDS = [...new Set(search.data.match(regexp))].slice(0, 3)
            playlistTopSongsAux.youtubeIDS.push(playlistTopSongsAux.tracks[index].youtubeIDS[0])
        }
    } catch (err) {
        console.log(err)
    }
    res.locals.getUserPlaylists.unshift(playlistTopSongsAux)
    next()
}


const indexRender = (req, res, next) => {
    //return res.send(res.locals.getUserPlaylists)
    return res.render('index', { userPlaylists: res.locals.getUserPlaylists, csrfToken: req.csrfToken() })

}

module.exports = { indexDebug, indexGeneratePlaylists, indexGenerateTopSongsPlaylist, indexRender }
