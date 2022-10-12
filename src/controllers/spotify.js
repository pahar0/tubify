const { spotify } = require('../utils')

const spotifyRefreshToken = async (req, res, next) => {
    if (req.session.spotifyTokens.expires_date <= Date.now() / 1000) {
        try {
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
