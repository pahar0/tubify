const authIsLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        console.log('not logged in')
        if (req.method == 'POST') return res.send({ error: 'not logged in' })
        return res.redirect('/login')
    }
    console.log('logged in')
    next()
}

module.exports = { authIsLoggedIn }
