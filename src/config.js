require('dotenv').config()

const appPort = 4000

module.exports = {
    appPort,
    debug: false,
    spotifyClientId: process.env.SPOTIFY_API_ID,
    spotifyClientSecret: process.env.SPOTIFY_API_SECRET,
    spotifyScopes: 'user-read-private user-read-email user-top-read playlist-read-collaborative playlist-read-private',
    redirectUrl: `http://localhost:${appPort}/login`,
}
