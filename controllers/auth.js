const authIsLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        if (req.method == "POST")
            return res.send({ error: 'not logged in' })
        return res.redirect('/login')
    }
    next()
}

module.exports = { authIsLoggedIn }