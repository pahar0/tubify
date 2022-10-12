const express = require('express')
const session = require('express-session')
const path = require('path')
const app = express()

const config = require('./config')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.set('json spaces', 4)

app.use(
    session({
        secret: 'tubify',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, maxAge: 31536000000 }, // 1 year
    })
)

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

app.listen(config.appPort, console.log(`Example app listening on http://localhost:${config.appPort}`))
