const { spotifyApi } = require('../utils/spotify')

const spotifyRefreshToken = async (req, res, next) => {
    if (req.session.spotifyTokens.expires_date <= (Date.now() / 1000)) {
        try {
            spotifyApi.setRefreshToken(req.session.spotifyTokens.refresh_token)
            const newTokens = await spotifyApi.refreshAccessToken()
            req.session.spotifyTokens = { ...newTokens.body, expires_date: ((Date.now() / 1000) + newTokens.body.expires_in) }
            console.log('token refreshed');
        } catch (err) {
            console.log(err)
        }
    }
    next()
}

const spotifyGetUserPlaylists = async (req, res, next) => {
    spotifyApi.setAccessToken(req.session.spotifyTokens.access_token)
    const getUserPlaylists = await spotifyApi.getUserPlaylists({ limit: 50 })
    req.session.getUserPlaylists = getUserPlaylists.body
    res.locals.getUserPlaylists = getUserPlaylists.body
    next()
}

module.exports = { spotifyRefreshToken, spotifyGetUserPlaylists }