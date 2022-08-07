const express = require('express')
const router = express.Router({ caseSensitive: true })

const { authIsLoggedIn } = require('../controllers/auth')
const { indexDebug, indexRender } = require('../controllers/indexController')

router.get('/', indexDebug, authIsLoggedIn, indexRender)

module.exports = router
