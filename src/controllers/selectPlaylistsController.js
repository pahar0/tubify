const fs = require('fs')
const path = require('path')

const config = require('../config')
const { spotify, youtube } = require('../utils')

const selectPlaylistsDebug = (req, res, next) => {
    if (config.debug) {
        const selectPlaylistsExample = fs.readFileSync(path.join(__dirname, '../debug/selectPlaylists.json'), { encoding: 'utf8', flag: 'r' })
        return res.render('selectPlaylists', {
            userPlaylists: JSON.parse(selectPlaylistsExample),
        })
    }
    next()
}

const selectPlaylistsGetTracks = async (req, res) => {
    const bodyPlaylistsSelected = req.body.playlists || []

    if (typeof bodyPlaylistsSelected !== 'object') return res.send({ error: 'data sent is not an object' })

    const durationStart = Date.now() / 1000
    const selectedPlaylists = req.session.getUserPlaylists.items.filter((value, index) => bodyPlaylistsSelected.includes(index))
    const playlistsDetails = []
    for await (const playlist of selectedPlaylists) {
        const playlistAux = {
            id: playlist.id,
            name: playlist.name,
            collaborative: playlist.collaborative,
            owner: playlist.owner.id, // if "spotify" use first element in images
            description: playlist.description,
            images: playlist.images,
            totalTracks: playlist.tracks.total,
            youtubeIDS: [],
        }
        try {
            const tracksApi = await spotify.getAllSongs(playlist.id)
            playlistAux.tracks = tracksApi.reverse().map((track) => {
                const name = track.track.name
                const artists = track.track.artists.map((artist) => artist.name).join(', ')
                const images = track.track.is_local === true ? false : track.track.album.images
                const album = track.track.album.name
                const added_at = new Date(track.added_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).replace('.', '')
                const durationMinutes = Math.floor(track.track.duration_ms / 60000)
                const durationSeconds = ((track.track.duration_ms % 60000) / 1000).toFixed(0)
                const duration_string = durationMinutes + ':' + (durationSeconds < 10 ? '0' : '') + durationSeconds
                return {
                    name: name,
                    artists: artists,
                    images: images,
                    album: album,
                    added_at: added_at,
                    duration_string: duration_string,
                }
            })
            for await (const [index, track] of playlistAux.tracks.entries()) {
                const search = await youtube.search(`${track.artists} - ${track.name}`)
                const regexp = /(?<={"videoId":").*?(?=")/gm
                playlistAux.tracks[index].youtubeIDS = [...new Set(search.data.match(regexp))].slice(0, 3)
                playlistAux.youtubeIDS.push(playlistAux.tracks[index].youtubeIDS[0])
            }
        } catch (err) {
            console.error(err)
        }
        playlistsDetails.push(playlistAux)
    }
    req.session.playlistsDetails = playlistsDetails
    const durationFinish = (Date.now() / 1000 - durationStart).toFixed(2)
    console.log(durationFinish)
    res.send({
        action: 'completed',
        duration: durationFinish,
    })
}

const selectPlaylistsRender = (req, res) => {
    return res.render('selectPlaylists', { userPlaylists: res.locals.getUserPlaylists })
}

module.exports = { selectPlaylistsDebug, selectPlaylistsGetTracks, selectPlaylistsRender }
