var youTubePlayer

function secondsToTime(e) {
    const h = Math.floor(e / 3600)
            .toString()
            .padStart(1, '0'),
        m = Math.floor((e % 3600) / 60)
            .toString()
            .padStart(1, '0'),
        s = Math.floor(e % 60)
            .toString()
            .padStart(2, '0')
    return (h !== 0 ? '' : h + ':') + m + ':' + s
}

$(document).ready(function (e) {
    var tag = document.createElement('script')

    tag.src = 'https://www.youtube.com/iframe_api'

    var first_script_tag = document.getElementsByTagName('script')[0]

    first_script_tag.parentNode.insertBefore(tag, first_script_tag)

    const getRandomColor = () => {
        var letters = '0123456789ABCDEF'.split('')
        var color = '#'
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)]
        }
        return color
    }

    const adjust = (col, amt) => {
        col = col.replace(/^#/, '')
        if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]
        let [r, g, b] = col.match(/.{2}/g)
        ;[r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt]
        r = Math.max(Math.min(255, r), 0).toString(16)
        g = Math.max(Math.min(255, g), 0).toString(16)
        b = Math.max(Math.min(255, b), 0).toString(16)
        const rr = (r.length < 2 ? '0' : '') + r
        const gg = (g.length < 2 ? '0' : '') + g
        const bb = (b.length < 2 ? '0' : '') + b
        return `#${rr}${gg}${bb}`
    }

    const randomColor = getRandomColor()
    const shadeRandomColor = adjust(randomColor, -50)

    $('.spotify-playlist-info').css('background-color', randomColor)
    $('.spotify-playlist-info').css('background-image', `linear-gradient(${randomColor}, ${shadeRandomColor})`)
    $('.spotify-controls').css('background-color', randomColor)
    $('.spotify-controls').css('background-image', `linear-gradient(${shadeRandomColor}, #121212)`)
})
