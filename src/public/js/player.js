let lastPlayerVolume = 0,
    playedSongsIndexes = [],
    playlistCurrentSongIndex = 0,
    dragging = false,
    shuffleMode = false,
    repeatMode = 0,
    speedEnabled = false,
    speedPerc = 1,
    lastDirection = 0 // 0 RIGHT - 1 LEFT

refreshInfo()
setInterval(playerInfo, 1000)

function playerInfo() {
    if (youTubePlayer.hasOwnProperty('getPlayerState')) {
        if (youTubePlayer.getPlayerState() !== 2) {
            let current = youTubePlayer.getCurrentTime()
            let duration = youTubePlayer.getDuration()
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

function refreshInfo(index = null) {
    index = index || playlistCurrentSongIndex
    let cover = $(`.spotify-track-row:eq(${index})`).attr('data-cover')
    let songName = $(`.spotify-track-row[data-index=${index}]`).attr('data-songName')
    let artistsName = $(`.spotify-track-row[data-index=${index}]`).attr('data-artistsName')
    $('.spotify-sidebar-cover').find('img').attr('src', cover)
    $('.player-trackname-title').text(songName)
    $('.player-trackname-artists').text(artistsName)

    $('.spotify-play-button-playing').html($('.spotify-play-button-playing').parent().attr('data-index')).removeClass('spotify-play-button-playing')
    $('.spotify-track-row').removeClass('spotify-track-row-playing')
    $('.spotify-track-row-songName').removeClass('spotify-track-row-songName-playing')

    //console.log($(`.spotify-track-row[data-index='${playedSongsIndexes.slice(-1)[0]}']`).text())
    //$(`.spotify-track-row[data-index='${playedSongsIndexes.slice(-1)[0]}']`).find('.spotify-play-button')
    //    .css('background-color', 'transparent')
    //    .css('mask', 'none')
    //    .css('-webkit-mask', 'none')
    //    .html(playedSongsIndexes.slice(-1)[0])

    $(`.spotify-track-row:eq(${index})`).addClass('spotify-track-row-playing')
    $(`.spotify-track-row:eq(${index})`).find('.spotify-play-button').addClass('spotify-play-button-playing').html('')
    $(`.spotify-track-row:eq(${index})`).find('.spotify-track-row-songName').addClass('spotify-track-row-songName-playing')
    //$(`.spotify-track-row:eq(${index})`).find('.spotify-play-button')
    //    .css('background-color', '#1ed760')
    //    .css('mask', 'url("/images/player/equalizer.png") center/contain no-repeat')
    //    .css('-webkit-mask', 'url("/images/player/equalizer.png") center/contain no-repeat')
    //    .html('')
}

const prevVideo = () => {
    lastDirection = 1
    let previousSong = 0
    if (playedSongsIndexes.length > 1) {
        playedSongsIndexes.pop()
        previousSong = playedSongsIndexes.slice(-1)[0]
        playlistCurrentSongIndex = previousSong
    }
    youTubePlayer.loadVideoById(playlistYoutubeIDS[previousSong])
    refreshInfo(previousSong)
}

const nextVideo = (click = false) => {
    lastDirection = 0
    if (click) {
        if (shuffleMode) {
            playlistCurrentSongIndex = Math.floor(Math.random() * playlistYoutubeIDS.length)
        } else {
            //console.log(playlistCurrentSongIndex);
            playlistCurrentSongIndex += 1
            //console.log(playlistCurrentSongIndex);
        }
    } else {
        if (shuffleMode && repeatMode !== 2) {
            playlistCurrentSongIndex = Math.floor(Math.random() * playlistYoutubeIDS.length)
        } else {
            if (repeatMode !== 2) {
                playlistCurrentSongIndex += 1
                if (playlistCurrentSongIndex > playlistYoutubeIDS.length) playlistCurrentSongIndex = 0
            }
        }
    }
    if (playedSongsIndexes.slice(-1)[0] !== playlistCurrentSongIndex) playedSongsIndexes.push(playlistCurrentSongIndex)
    youTubePlayer.loadVideoById(playlistYoutubeIDS[playlistCurrentSongIndex])
    refreshInfo()
}

function onYouTubeIframeAPIReady() {
    'use strict'

    var height = 151
    var width = 270

    function onError(event) {
        // AGE RESTRICTED VIDEO
        if (event.target.playerInfo.videoData.isListed == false) {
            if (lastDirection == 0) {
                nextVideo()
            } else if (lastDirection == 1) {
                prevVideo()
            }
        }
    }

    function onReady(event) {
        //var player = event.target;
        //var iframe = $('#YouTube-player')
    }

    function onStateChange(event) {
        // -1 = YT.PlayerState.
        //  0 = YT.PlayerState.ENDED
        //  1 = YT.PlayerState.PLAYING
        //  2 = YT.PlayerState.PAUSED
        //  3 = YT.PlayerState.BUFFERING
        //  5 = YT.PlayerState.CUED

        // SKIP ON SKIPSONG = 2
        if (event.target.getPlayerState() == -1) {
        }

        // TODO: add logic for fadein next song
        if (event.target.getPlayerState() == 0) nextVideo()

        if (event.target.getPlayerState() == 1) {
            $('.spotify-controls-buttons-play, .player-button-play').find('img').attr('src', '/images/player/pause.png')

            if (youTubePlayer.hasOwnProperty('getPlayerState')) {
                youTubePlayer.setVolume($('.player-settings-slider .slider').val())
            }
        }

        if (event.target.getPlayerState() == 2) {
            $('.spotify-controls-buttons-play, .player-button-play').find('img').attr('src', '/images/player/play.png')
        }

        // RESET SKIPSONG ON BUFFERING
        if (event.target.getPlayerState() == 3) {
        }

        console.log(event.target.getPlayerState())
    }

    youTubePlayer = new YT.Player('YouTube-player', {
        videoId: playlistYoutubeIDS[0],
        height: height,
        width: width,
        playerVars: {
            autohide: 1,
            cc_load_policy: 0,
            controls: 0,
            disablekb: 0,
            iv_load_policy: 3,
            modestbranding: 1,
        },
        events: {
            onError: onError,
            onReady: onReady,
            onStateChange: onStateChange,
        },
    })

    playedSongsIndexes.push(0)
}

$(document).ready(function (e) {
    $(document).on('dblclick', '.spotify-sidebar-video', function (e) {
        var requestFullScreen = iframe.requestFullScreen || iframe.mozRequestFullScreen || iframe.webkitRequestFullScreen
        if (requestFullScreen) {
            requestFullScreen.bind(iframe)()
        }
    })

    $(document)
        .on('mouseenter', '.spotify-track-row', function (e) {
            if ($(this).attr('data-index') == playlistCurrentSongIndex) {
                $(this).find('.spotify-play-button').addClass('spotify-play-button-pause').html('')
            } else {
                $(this).find('.spotify-play-button').addClass('spotify-play-button-play').html('')
            }
        })
        .on('mouseleave', '.spotify-track-row', function () {
            if ($(this).attr('data-index') == playlistCurrentSongIndex) {
                $(this).find('.spotify-play-button').removeClass('spotify-play-button-pause').html($(this).attr('data-index'))
            } else {
                $(this).find('.spotify-play-button').removeClass('spotify-play-button-play').html($(this).attr('data-index'))
            }
        })

    $(document).on('click', '.spotify-play-button', function (e) {
        //console.log(playedSongsIndexes, playedSongsIndexes.slice(-1)[0], playlistCurrentSongIndex)

        if (playlistCurrentSongIndex == $(this).parent().attr('data-index')) {
            if (youTubePlayer.getPlayerState() == 1) {
                youTubePlayer.pauseVideo()
            } else if (youTubePlayer.getPlayerState() == 2) {
                youTubePlayer.playVideo()
            }
        } else {
            playlistCurrentSongIndex = parseInt($(this).parent().attr('data-index'))
            playedSongsIndexes.push(playlistCurrentSongIndex)

            youTubePlayer.loadVideoById(playlistYoutubeIDS[playlistCurrentSongIndex])
            refreshInfo()
        }
    })

    $(document).on('click', '.player-button-shuffle', function (e) {
        shuffleMode = !shuffleMode
        if (shuffleMode) {
            $(this).css('background-color', '#1ed760')
            //const randomSong = Math.floor(Math.random() * (max - min + 1) + min)
        } else {
            $(this).css('background-color', '#FFF')
        }
    })

    $(document).on('click', '.spotify-controls-buttons-play, .player-button-play', function (e) {
        if (youTubePlayer.hasOwnProperty('getPlayerState')) {
            if (youTubePlayer.getPlayerState() == 1) {
                youTubePlayer.pauseVideo()
            } else if (youTubePlayer.getPlayerState() == 2) {
                youTubePlayer.playVideo()
            } else if (youTubePlayer.getPlayerState() == 5) {
                youTubePlayer.playVideo()
                refreshInfo()
            } else {
                console.log('estado => ' + youTubePlayer.getPlayerState())
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
        dragging = false
        youTubePlayer.seekTo(($(this).val() * youTubePlayer.getDuration()) / 100, true)
    })

    $(document).on('click', '.player-settings-speed-less', function (e) {
        if (speedPerc !== 0.7) {
            speedPerc = Number(parseFloat(speedPerc - 0.1).toFixed(1))
            youTubePlayer.setPlaybackRate(speedPerc)
        }

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
            youTubePlayer.setPlaybackRate(speedPerc)
        } else {
            $(this)
                .css('background-image', 'url("/images/player/speed.png")')
                .css('filter', 'invert(100%) sepia(100%) saturate(0%) hue-rotate(238deg) brightness(104%) contrast(103%)')
                .find('.player-settings-speed-perc')
                .html('')
            youTubePlayer.setPlaybackRate(1)
        }
    })

    $(document).on('click', '.player-settings-speed-more', function (e) {
        if (speedPerc !== 1.3) {
            speedPerc = Number(parseFloat(speedPerc + 0.1).toFixed(1))
            youTubePlayer.setPlaybackRate(speedPerc)
        }

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

    $(document).on('input', '.player-settings-slider .slider', function (e) {
        const min = $(this).prop('min')
        const max = $(this).prop('max')
        const val = $(this).prop('value')
        let volume = ((val - min) * 100) / (max - min)

        if (youTubePlayer.hasOwnProperty('getPlayerState')) {
            youTubePlayer.setVolume(volume)
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
})
