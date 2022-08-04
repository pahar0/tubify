const authIsLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn)
        return res.redirect('/login') // change to /
    next()
}

module.exports = { authIsLoggedIn }