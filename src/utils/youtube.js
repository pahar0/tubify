const axios = require('axios')

const youtubeSearch = (name) => axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(name)}&sp=EgIQAQ%253D%253D`)

module.exports = { youtubeSearch }
