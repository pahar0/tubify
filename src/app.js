const express = require('express')
const session = require('express-session')
const csrf = require('csurf')
const path = require('path')
const app = express()

const config = require('./config')

app.disable('x-powered-by')
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.set('json spaces', 4)

app.use(
    session({
        secret: 'laloli',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, maxAge: 31536000000 }, // 1 year
    })
)
app.use(csrf())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', require('./routes'))
app.get('/login', require('./routes/login'))

app.get('/selectPlaylists', require('./routes/selectPlaylists'))
app.post('/selectPlaylists', require('./routes/selectPlaylists'))

app.use((req, res, next) => {
    res.status(404).send('Sorry cant find that!')
})

app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return res.send(err)

    res.status(500).send(err)
})

app.listen(config.appPort, console.log(`Example app listening on http://localhost:${config.appPort}`))
