const config = require('../config')
const axios = require('axios')

const login = async (req, res) => {
    if (req.session.isLoggedIn) return res.redirect('/')

    const { error, code, state, scope } = req.query

    if (error) return res.send(error)

    if (code && state === req.session.state && scope === req.session.scope) {
        delete req.session.state
        delete req.session.scope
        const body = `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(config.redirectUrl)}`
        const token = Buffer.from(`${config.spotifyClientId}:${config.spotifyClientSecret}`, 'utf8').toString('base64')
        const headers = {
            headers: {
                Authorization: `Basic ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
        try {
            const resp = await axios.post('https://accounts.spotify.com/api/token', body, headers)
            req.session.isLoggedIn = true
            req.session.spotifyTokens = {
                ...resp.data,
                expires_date: Date.now() / 1000 + resp.data.expires_in,
            }
            return res.redirect('/')
        } catch (err) {
            console.error(err)
        }
    } else {
        const state = Math.random().toString(36).slice(2)
        req.session.state = state
        const params = new URLSearchParams()

        params.append('response_type', 'code')
        params.append('client_id', config.spotifyClientId)
        params.append('scope', config.spotifyScopes)
        params.append('redirect_uri', config.redirectUrl)
        params.append('state', state)
        const url = `https://accounts.spotify.com/authorize?${params.toString()}`
        res.redirect(url)
    }
}

module.exports = login
