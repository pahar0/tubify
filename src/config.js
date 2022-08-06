require('dotenv').config()

const PORT = 4000

const config = {
    debug: false,
    appPort: PORT,
    spotifyClientId: process.env.SPOTIFY_API_ID,
    spotifyClientSecret: process.env.SPOTIFY_API_SECRET,
    spotifyScopes: 'user-read-private user-read-email user-top-read playlist-read-collaborative playlist-read-private',
    redirectUrl: `http://localhost:${PORT}/login`,
}

module.exports = config
