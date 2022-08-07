const axios = require('axios')

const search = (name) => axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(name)}&sp=EgIQAQ%253D%253D`)

module.exports = { search }
