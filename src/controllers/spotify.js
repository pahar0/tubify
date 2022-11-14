const { spotify } = require('../utils')

async function spotifyRefreshToken(req, res, next) {
    if (req.session.spotifyTokens.expires_date <= Date.now() / 1000) {
        console.log('expired token -> login')
        req.session.isLoggedIn = false
        return res.redirect('/login')
    }
    if (req.session.spotifyTokens.expires_date - 450000 >= Date.now() / 1000) {
        console.log('almost expired token -> refresh')
        try {
            const newTokens = await spotify.refreshAccessToken()
            req.session.spotifyTokens = {
                ...newTokens.body,
                expires_date: Date.now() / 1000 + newTokens.body.expires_in,
            }
        } catch (err) {
            console.error(err)
        }
    }
    next()
}

async function spotifyGetUserPlaylists(req, res, next) {
    try {
        const getUserPlaylists = await spotify.getUserPlaylists({ limit: 50 })
        req.session.getUserPlaylists = getUserPlaylists.body
        res.locals.getUserPlaylists = getUserPlaylists.body
        next()
    } catch (error) {
        console.log(error)
    }
}

module.exports = { spotifyRefreshToken, spotifyGetUserPlaylists }
