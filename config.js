require('dotenv').config()

module.exports = {
    debug: false,
    appPort: 4000,
    spotifyClientId: process.env.SPOTIFY_API_ID,
    spotifyClientSecret: process.env.SPOTIFY_API_SECRET,
    spotifyScopes: 'user-read-private user-read-email user-top-read playlist-read-collaborative playlist-read-private',
    redirectUrl: 'http://localhost:4000/login'
}