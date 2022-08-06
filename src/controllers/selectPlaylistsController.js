const fs = require('fs')

const config = require('../config')

const selectPlaylistsDebug = (req, res, next) => {
    if (config.debug) {
        const selectPlaylistsExample = fs.readFileSync('./debug/selectPlaylists.json')
        console.log(JSON.parse(selectPlaylistsExample))
        return res.render('selectPlaylists', {
            userPlaylists: JSON.parse(selectPlaylistsExample),
            csrfToken: req.csrfToken(),
        })
    }
    next()
}

const selectPlaylistsRender = (req, res) =>
    res.render('selectPlaylists', {
        userPlaylists: res.locals.getUserPlaylists,
        csrfToken: req.csrfToken(),
    })

module.exports = { selectPlaylistsDebug, selectPlaylistsRender }
