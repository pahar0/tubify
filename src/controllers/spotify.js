const { spotify } = require('../utils')

const spotifyRefreshToken = async (req, res, next) => {
    if (req.session.spotifyTokens.expires_date <= Date.now() / 1000) {
        try {
            spotify.setRefreshToken(req.session.spotifyTokens.refresh_token)
            const newTokens = await spotify.refreshAccessToken()
            req.session.spotifyTokens = {
                ...newTokens.body,
                expires_date: Date.now() / 1000 + newTokens.body.expires_in,
            }
            console.log('token refreshed')
        } catch (err) {
            console.error(err)
        }
    }
    next()
}

const spotifyGetUserPlaylists = async (req, res, next) => {
    spotify.setAccessToken(req.session.spotifyTokens.access_token)
    const getUserPlaylists = await spotify.getUserPlaylists({ limit: 50 })
    req.session.getUserPlaylists = getUserPlaylists.body
    res.locals.getUserPlaylists = getUserPlaylists.body
    next()
}

module.exports = { spotifyRefreshToken, spotifyGetUserPlaylists }
