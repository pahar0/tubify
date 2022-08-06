const express = require('express')
const router = express.Router({ caseSensitive: true })

const { authIsLoggedIn } = require('../controllers/auth')
const { spotifyRefreshToken, spotifyGetUserPlaylists } = require('../controllers/spotify')
const { indexDebug, indexGeneratePlaylists, indexGenerateTopSongsPlaylist, indexRender } = require('../controllers/indexController')

router.get('/', indexDebug, authIsLoggedIn, spotifyRefreshToken, spotifyGetUserPlaylists, indexGeneratePlaylists, indexGenerateTopSongsPlaylist, indexRender)

module.exports = router
