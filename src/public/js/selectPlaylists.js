$(document).ready(function (e) {
    $('.select-playlists-playlist').click(function () {
        $(this).toggleClass('selected')
        calculateAverageTime()
    })

    $('.deselect-all').click(function () {
        $('.select-playlists-playlist').removeClass('selected')
        calculateAverageTime()
    })

    $('.select-all').click(function () {
        $('.select-playlists-playlist').addClass('selected')
        calculateAverageTime()
    })

    $('.convert').click(function () {
        const button = $(this)
        button.addClass('disabled')
        const playlists = $('.selected')
            .map(function (i, v) {
                return Number($(v).attr('data-index'))
            })
            .get()

        $.ajax({
            type: 'POST',
            url: '/selectPlaylists',
            contentType: 'application/json',
            data: JSON.stringify({ playlists: playlists }),
        })
            .done((response) => {
                if (!response.error) {
                    button.html(`Completed in ${response.duration} secs`)
                    setTimeout(function () {
                        window.location.replace('/')
                    }, 3000)
                } else {
                    console.log(response)
                }
            })
            .fail(function (response, status) {
                console.log(response)
            })
    })

    function pluralize(count, noun, suffix = 's') {
        return `${noun}${Number(count) !== 1 ? suffix : ''}`
    }

    function secondsToString(e) {
        const h = Math.floor(e / 3600)
                .toString()
                .padStart(1, '0'),
            m = Math.floor((e % 3600) / 60)
                .toString()
                .padStart(1, '0'),
            s = Math.floor(e % 60)
                .toString()
                .padStart(1, '0')
        return (
            (h == 0 ? '' : h + ' ' + pluralize(h, 'hour') + ' ') +
            (m == 0 ? '' : m + ' ' + pluralize(m, 'minute') + ' ') +
            (s == 0 ? '' : s + ' ' + pluralize(s, 'second') + ' ')
        )
    }

    function calculateAverageTime() {
        let totalSeconds = 0
        $('.selected').each(function () {
            totalSeconds += Number($(this).attr('data-avg'))
        })
        if (totalSeconds === 0) {
            $('.time').html('Select at least one playlist')
            $('.convert').addClass('disabled')
        } else {
            $('.time').html(secondsToString(totalSeconds))
            $('.convert').removeClass('disabled')
        }
    }
})
