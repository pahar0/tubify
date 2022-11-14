$(document).ready(function () {
    const randomColor = getRandomColor(),
        shadeRandomColor = adjust(randomColor, -50)

    let playlistCurrentSongIndex = 0,
        playedSongsIndexes = [],
        youtubeTrackFallback = 0,
        lastPlayerVolume = 0,
        dragging = false,
        shuffleMode = false,
        repeatMode = 0,
        speedEnabled = false,
        speedPerc = 1,
        lastDirection = 1 // -1 LEFT / 1 RIGHT

    $('#youtubePlayer').tubeplayer({
        // Plugin init params
        width: 270, // the width of the player
        height: 152, // the height of the player
        allowFullScreen: 'true', // true by default, allow user to go full screen
        initialVideo: playlistsDetails[playlistSelected].youtubeIDS[0], // the video that is loaded into the player
        playlist: [], // array of video id's if a playlist is desired
        start: 0,
        preferredQuality: 'default', // preferred quality: auto, small, medium, large, hd720
        controls: 0, // whether the player should have the controls visible, 0 or 1 or 2
        showRelated: false, // show the related videos when the player ends, 0 or 1
        playsinline: false, // setting for ipad
        autoPlay: false, // whether the player should autoplay the video, 0 or 1
        color: 'red', // possible options: "red" or "white"
        showinfo: false, // if you want the player to include details about the video
        modestbranding: false, // specify to include/exclude the YouTube watermark
        annotations: false, // show annotations?
        loop: 0, // whether or not the player will loop
        protocol: 'http',

        // Player Trigger Specific Functionality
        onPlay: function (id) {
            // after the play method is called
            refreshInfo()
        },
        onPause: function () {
            // after the pause method is called
            document.title = 'tubify'
        },
        onStop: function () {
            // after the player is stopped
        },
        onSeek: function (time) {}, // after the video has been seeked to a defined point
        onMute: function () {}, // after the player is muted
        onUnMute: function () {}, // after the player is unmuted

        // Player State Change Specific Functionality
        onPlayerUnstarted: function () {}, // player returns a state of unstarted
        onPlayerLoaded: function () {
            // player is initially loaded and attached to the DOM
            playedSongsIndexes.push(0)
            setInterval(playerInfo, 1000)
        },
        onPlayerBuffering: function () {}, // player returns a state of buffering
        onPlayerPlaying: function () {
            // player returns a state of playing
            $('.spotify-controls-buttons-play, .player-button-play').find('img').attr('src', '/images/player/pause.png')

            if ($('#youtubePlayer').tubeplayer('player').hasOwnProperty('getPlayerState')) {
                $('#youtubePlayer').tubeplayer('volume', $('.player-settings-slider .slider').val())
            }
        },
        onPlayerPaused: function () {
            // player returns a state of paused
            $('.spotify-controls-buttons-play, .player-button-play').find('img').attr('src', '/images/player/play.png')
        },
        onPlayerEnded: function () {
            // player returns a state of ended
            nextVideo()
        },
        onPlayerCued: function () {}, // player returns a state of cued
        onQualityChange: function (quality) {}, // player quality changes
        onRateChange: function (rate) {}, // player rate changes

        // Error State Specific Functionality
        onErrorNotFound: function () {}, // if a video cant be found
        onErrorNotEmbeddable: function () {
            // if a video isnt embeddable
            if (lastDirection == 1) {
                nextVideo()
            } else if (lastDirection == -1) {
                prevVideo()
            }
        },
        onErrorInvalidParameter: function () {}, // if we've got an invalid param and can't play
    })

    refreshInfo()

    $('.spotify-playlist-info').css('background-color', randomColor)
    $('.spotify-playlist-info').css('background-image', `linear-gradient(${randomColor}, ${shadeRandomColor})`)
    $('.spotify-controls').css('background-color', randomColor)
    $('.spotify-controls').css('background-image', `linear-gradient(${shadeRandomColor}, #121212)`)

    $(document).on('click', '.spotify-sidebar-playlist-name', function (e) {
        const playlistSelected = Number($(this).attr('data-index'))
        window.location = `/?playlistSelected=${playlistSelected}`
    })

    $(document).on('click', '.player-button-shuffle', function (e) {
        shuffleMode = !shuffleMode
        if (shuffleMode) {
            $(this).css('background-color', '#1ed760')
        } else {
            $(this).css('background-color', '#FFF')
        }
    })

    $(document).on('click', '.spotify-controls-buttons-play, .player-button-play', function (e) {
        if ($('#youtubePlayer').tubeplayer('player').hasOwnProperty('getPlayerState')) {
            if ($('#youtubePlayer').tubeplayer('data').state == 1) {
                $('#youtubePlayer').tubeplayer('pause')
            } else if ($('#youtubePlayer').tubeplayer('data').state == 2 || $('#youtubePlayer').tubeplayer('data').state == 5) {
                $('#youtubePlayer').tubeplayer('play')
            } else {
                console.log('estado => ' + $('#youtubePlayer').tubeplayer('data').state)
            }
        } else {
            console.log('no getPlayerState')
        }
    })

    $(document).on('click', '.player-button-previous', function (e) {
        prevVideo(true)
    })

    $(document).on('click', '.player-button-next', function (e) {
        nextVideo(true)
    })

    $(document).on('click', '.player-button-repeat', function (e) {
        repeatMode += 1
        if (repeatMode > 2) repeatMode = 0

        if (repeatMode == 0) {
            $(this)
                .css('background-color', '#FFF')
                .css('mask', 'url("/images/player/repeat.png") center/contain no-repeat')
                .css('-webkit-mask', 'url("/images/player/repeat.png") center/contain no-repeat')
        } else if (repeatMode == 1) {
            $(this).css('background-color', '#1ed760')
        } else if (repeatMode == 2) {
            $(this)
                .css('mask', 'url("/images/player/repeat-once.png") center/contain no-repeat')
                .css('-webkit-mask', 'url("/images/player/repeat-once.png") center/contain no-repeat')
        }
    })

    $(document).on('mousedown', '.player-slider-container .slider', function (e) {
        dragging = true
    })

    $(document).on('mousemove', '.player-slider-container .slider', function (e) {
        $(this).css('background-size', `${$(this).val()}% 100%`)
    })

    $(document).on('mouseup', '.player-slider-container .slider', function (e) {
        $('#youtubePlayer').tubeplayer('seek', ($(this).val() * $('#youtubePlayer').tubeplayer('data').duration) / 100)
        dragging = false
    })

    $(document).on('click', '.player-settings-speed-less', function (e) {
        if (speedPerc !== 0.7) {
            speedPerc = Number(parseFloat(speedPerc - 0.05).toFixed(2))
        }
        $('#youtubePlayer').tubeplayer('playbackRate', speedPerc)

        if (speedEnabled) {
            $('.player-settings-speed-reset')
                .find('.player-settings-speed-perc')
                .html(speedPerc + 'x')
        } else {
            speedEnabled = !speedEnabled
            $('.player-settings-speed-reset')
                .css('background-image', 'url("/images/player/speed-on.png")')
                .css('filter', 'invert(65%) sepia(22%) saturate(1536%) hue-rotate(89deg) brightness(98%) contrast(93%)')
                .find('.player-settings-speed-perc')
                .html(speedPerc + 'x')
        }
    })

    $(document).on('click', '.player-settings-speed-reset', function (e) {
        speedEnabled = !speedEnabled
        if (speedEnabled) {
            $(this)
                .css('background-image', 'url("/images/player/speed-on.png")')
                .css('filter', 'invert(65%) sepia(22%) saturate(1536%) hue-rotate(89deg) brightness(98%) contrast(93%)')
                .find('.player-settings-speed-perc')
                .html(speedPerc + 'x')
            $('#youtubePlayer').tubeplayer('playbackRate', speedPerc)
        } else {
            $(this)
                .css('background-image', 'url("/images/player/speed.png")')
                .css('filter', 'invert(100%) sepia(100%) saturate(0%) hue-rotate(238deg) brightness(104%) contrast(103%)')
                .find('.player-settings-speed-perc')
                .html('')
            $('#youtubePlayer').tubeplayer('playbackRate', 1)
        }
    })

    $(document).on('click', '.player-settings-speed-more', function (e) {
        if (speedPerc !== 1.3) {
            speedPerc = Number(parseFloat(speedPerc + 0.05).toFixed(2))
        }
        $('#youtubePlayer').tubeplayer('playbackRate', speedPerc)

        if (speedEnabled) {
            $('.player-settings-speed-reset')
                .find('.player-settings-speed-perc')
                .html(speedPerc + 'x')
        } else {
            speedEnabled = !speedEnabled
            $('.player-settings-speed-reset')
                .css('background-image', 'url("/images/player/speed-on.png")')
                .css('filter', 'invert(65%) sepia(22%) saturate(1536%) hue-rotate(89deg) brightness(98%) contrast(93%)')
                .find('.player-settings-speed-perc')
                .html(speedPerc + 'x')
        }
    })

    $(document).on('click', '.player-settings-mute', function (e) {
        let sliderValue = $('.player-settings-slider .slider').prop('value')
        if (sliderValue == 0) {
            $('.player-settings-slider .slider').val(lastPlayerVolume).trigger('input')
        } else {
            lastPlayerVolume = sliderValue
            $('.player-settings-slider .slider').val(0).trigger('input')
        }
    })

    $(document).on('input', '.player-settings-slider .slider', function () {
        const min = $(this).prop('min')
        const max = $(this).prop('max')
        const val = $(this).prop('value')
        let volume = ((val - min) * 100) / (max - min)

        if ($('#youtubePlayer').tubeplayer('player').hasOwnProperty('getPlayerState')) {
            $('#youtubePlayer').tubeplayer('volume', volume)
        }

        $(this).css('background-size', volume + '% 100%')

        let volumeIcon = $(this).parent().prev()
        if (val > 50) {
            volumeIcon
                .css('mask', 'url("/images/player/volume.png") center/contain no-repeat')
                .css('-webkit-mask', 'url("/images/player/volume.png") center/contain no-repeat')
        } else if (val < 50 && val != 0) {
            volumeIcon
                .css('mask', 'url("/images/player/volume-mid.png") center/contain no-repeat')
                .css('-webkit-mask', 'url("/images/player/volume-mid.png") center/contain no-repeat')
        } else if (val == 0) {
            volumeIcon
                .css('mask', 'url("/images/player/mute.png") center/contain no-repeat')
                .css('-webkit-mask', 'url("/images/player/mute.png") center/contain no-repeat')
        }
    })

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

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('')
        var color = '#'
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)]
        }
        return color
    }

    function adjust(col, amt) {
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

    function generateRandom(length, exception) {
        if (length === 1) return exception
        const num = Math.floor(Math.random() * length)
        return num === exception ? generateRandom(length, exception) : num
    }

    function playerInfo() {
        if ($('#youtubePlayer').tubeplayer('player').hasOwnProperty('getPlayerState')) {
            if ($('#youtubePlayer').tubeplayer('data').state !== 2) {
                let current = $('#youtubePlayer').tubeplayer('data').currentTime
                let duration = $('#youtubePlayer').tubeplayer('data').duration
                let currentPercent = current && duration ? (current * 100) / duration : 0
                $('.player-slider-currentTime').html(secondsToTime(current))
                $('.player-slider-songLength').html(secondsToTime(duration))
                if (!dragging) {
                    $('.player-slider-container .slider').css('background-size', `${Math.round(currentPercent)}% 100%`)
                    $('.player-slider-container .slider').val(currentPercent)
                }
            }
        }
    }

    $(document)
        .on('mouseenter', '.spotify-track-row', function (e) {
            if (Number($(this).attr('data-index')) == playlistCurrentSongIndex) {
                if ($('#youtubePlayer').tubeplayer('data').state == 1) {
                    $(this).find('.spotify-play-button').removeClass('spotify-play-button-playing').addClass('spotify-play-button-pause').html('')
                } else {
                    $(this).find('.spotify-play-button').addClass('spotify-play-button-play').html('')
                }
            } else {
                $(this).find('.spotify-play-button').addClass('spotify-play-button-play').html('')
            }
        })
        .on('mouseleave', '.spotify-track-row', function () {
            if (Number($(this).attr('data-index')) == playlistCurrentSongIndex) {
                if ($('#youtubePlayer').tubeplayer('data').state !== 1) {
                    $(this)
                        .find('.spotify-play-button')
                        .removeClass('spotify-play-button-play')
                        .html(Number($(this).attr('data-index')) + 1)
                } else {
                    $(this).find('.spotify-play-button').removeClass('spotify-play-button-pause').addClass('spotify-play-button-playing')
                }
            } else {
                $(this)
                    .find('.spotify-play-button')
                    .removeClass('spotify-play-button-play')
                    .html(Number($(this).attr('data-index')) + 1)
            }
        })

    function refreshInfo(index = null) {
        index = index || playlistCurrentSongIndex
        let cover = $(`.spotify-track-row:eq(${index})`).attr('data-cover')
        let songName = $(`.spotify-track-row[data-index=${index}]`).attr('data-songName')
        let artistsName = $(`.spotify-track-row[data-index=${index}]`).attr('data-artistsName')
        console.log(`${artistsName} - ${songName}`)
        document.title = `${artistsName} - ${songName}`
        $('.spotify-sidebar-cover').find('img').attr('src', cover)
        $('.player-trackname-title').text(songName)
        $('.player-trackname-artists').text(artistsName)

        $('.spotify-play-button-playing')
            .html(Number($('.spotify-play-button-playing').parent().attr('data-index')) + 1)
            .removeClass('spotify-play-button-playing')
        $('.spotify-track-row').removeClass('spotify-track-row-playing')
        $('.spotify-track-row-songName').removeClass('spotify-track-row-songName-playing')

        $(`.spotify-track-row:eq(${index})`).addClass('spotify-track-row-playing')
        $(`.spotify-track-row:eq(${index})`).find('.spotify-play-button').addClass('spotify-play-button-playing').html('')
        $(`.spotify-track-row:eq(${index})`).find('.spotify-track-row-songName').addClass('spotify-track-row-songName-playing')
    }

    $(document).on('click', '.spotify-play-button', function (e) {
        if (playlistCurrentSongIndex == Number($(this).parent().attr('data-index'))) {
            if ($('#youtubePlayer').tubeplayer('data').state == 1) {
                $('#youtubePlayer').tubeplayer('pause')
            } else if ($('#youtubePlayer').tubeplayer('data').state == 2) {
                $('#youtubePlayer').tubeplayer('play')
            }
        } else {
            playlistCurrentSongIndex = Number($(this).parent().attr('data-index'))
            playedSongsIndexes.push(playlistCurrentSongIndex)
            $('#youtubePlayer').tubeplayer('play', playlistsDetails[playlistSelected].tracks[playlistCurrentSongIndex].youtubeIDS[youtubeTrackFallback])
            $(this).removeClass('spotify-play-button-play').addClass('spotify-play-button-pause')
        }
    })

    function prevVideo() {
        lastDirection = -1
        let previousSong = 0
        if (playedSongsIndexes.length > 1) {
            playedSongsIndexes.pop()
            previousSong = playedSongsIndexes.slice(-1)[0]
            playlistCurrentSongIndex = previousSong
        }
        $('#youtubePlayer').tubeplayer('play', playlistsDetails[playlistSelected].tracks[previousSong].youtubeIDS[youtubeTrackFallback])
    }

    function nextVideo(click = false) {
        lastDirection = 1
        if (click) {
            if (shuffleMode) {
                playlistCurrentSongIndex = generateRandom(playlistsDetails[playlistSelected].tracks.length, playlistCurrentSongIndex)
            } else if (playlistsDetails[playlistSelected].tracks.length !== 1) {
                playlistCurrentSongIndex += 1
            }
        } else {
            if (shuffleMode && repeatMode !== 2) {
                playlistCurrentSongIndex = generateRandom(playlistsDetails[playlistSelected].tracks.length, playlistCurrentSongIndex)
            } else {
                if (repeatMode !== 2) {
                    if (playlistsDetails[playlistSelected].tracks.length !== 1) playlistCurrentSongIndex += 1
                }
            }
        }
        if (playedSongsIndexes.slice(-1)[0] !== playlistCurrentSongIndex) playedSongsIndexes.push(playlistCurrentSongIndex)
        $('#youtubePlayer').tubeplayer('play', playlistsDetails[playlistSelected].tracks[playlistCurrentSongIndex].youtubeIDS[youtubeTrackFallback])
    }
})
