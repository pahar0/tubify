const express = require('express')
const router = express.Router({ caseSensitive: true })

const { authIsLoggedIn } = require('../controllers/auth')
const { spotifyRefreshToken, spotifyGetUserPlaylists } = require('../controllers/spotify')
const { selectPlaylistsDebug, selectPlaylistsGetTracks, selectPlaylistsRender } = require('../controllers/selectPlaylistsController')

router
    .route('/selectPlaylists')
    .get(selectPlaylistsDebug, authIsLoggedIn, spotifyRefreshToken, spotifyGetUserPlaylists, selectPlaylistsRender)
    .post(authIsLoggedIn, spotifyRefreshToken, selectPlaylistsGetTracks)

module.exports = router
