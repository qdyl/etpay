/**
 * WaveSurfer-WP Premium Front-End Script
 * Author: X-Raym
 * Author URl: https://www.extremraym.com
 * Date: 2016-12-21
 * Version: 1.2.6
 */

// No conflict for WordPress
var $j = jQuery.noConflict();

// Init table for storing wavesurfer objects
var wavesurfer = [];
var markers = [];

if ( ( 0 === $j('body.single-download').length && 0 === $j('body.single-post').length && 0 === $j('body.page').length ) && $j('.facetwp-template').length > 0 ) {
    $j(document).on('facetwp-loaded', function() {
        $j(document).trigger('wavesurfer');
        $j(document).trigger('wavesurfer-markers-init');
    });
} else {
    $j(document).on('ready', function() {
        $j(document).trigger('wavesurfer');
        $j(document).trigger('wavesurfer-markers-init');
    });
}

// On Document Ready and Ajax Complete
$j(document).on('ajaxComplete wavesurfer', function(event, request, settings) {
    if (typeof settings !== 'undefined') {
        if (settings.success.name === 'wavesurfer_wp_ajax') return;
    } else {
        WaveSurferInit();
    }
});

// Markers Init
$j(document).on('wavesurfer-wp-init wavesurfer-markers-init', function() { //
    MarkerInit();
});

/* FUNCTIONS */

// WaveSurfer Init
function WaveSurferInit() {

    // Loop in each wavesurfer block
    $j('.wavesurfer-block').each(function(i) {

        // If there is already a player instance for this id
        if ( typeof wavesurfer[i] !== 'undefined' ) return;

        // Get WaveSurfer block for datas attribute
        var container = $j(this).children('.wavesurfer-player');
        var split = container.data('split-channels');

        // Wavesurfer block object
        var object = this;

        var peaks = container.data('peaks');

        init(i, container, object, split, peaks);

    }); // End loop in each wavesurfer-block

} // End function WaveSurferInit

function init(i, container, object, split, peaks) {

    // Text selector for the player
    var selector = '#wavesurfer-player-' + i;

    // Add unique ID to WaveSurfer Block
    container.attr('id', 'wavesurfer-player-' + i);

    // Get data attribute
    var wave_color = container.data('wave-color');
    var progress_color = container.data('progress-color');
    var cursor_color = container.data('cursor-color');
    var file_url = container.data('url');
    var height = container.data('height');
    var bar_width = container.data('bar-width');
    var continuous = container.data('continuous');

    // Init and Control
    var options = {
        container: selector,
        splitChannels: split,
        waveColor: wave_color,
        progressColor: progress_color,
        cursorColor: cursor_color,
        backend: 'MediaElement',
        height: height,
        barWidth: bar_width,
    };

    // Others parameters
    var preload = '';

    // Create WaveSurfer object
    wavesurfer[i] = WaveSurfer.create(options);

    // Prevent error if the player can't be initialized
    if ( typeof wavesurfer[i] === 'undefined' ) return;

    // File
    if ( peaks ) {
        preload = 'metadata';
        wavesurfer[i].load(file_url, peaks, preload);
    } else {
        preload = 'auto';
        wavesurfer[i].load(file_url, false, preload);
    }

    // Responsive Waveform
    $j(window).resize(function() {
        if ( typeof wavesurfer[i] !== 'undefined') {
            wavesurfer[i].drawer.containerWidth = wavesurfer[i].drawer.container.clientWidth;
            wavesurfer[i].drawBuffer();
        }
    });

    // Buttons

    // Timecode blocks
    var timeblock = $j(object).find('.wavesurfer-time');
    var duration = $j(object).find('.wavesurfer-duration');

    // Controls Definition
    var buttonPlay = $j(object).find('button.wavesurfer-play');
    var buttonStop = $j(object).find('button.wavesurfer-stop');
    var buttonMute = $j(object).find('button.wavesurfer-mute');
    var buttonDownload = $j(object).find('button.wavesurfer-download');
    var buttonLoop = $j(object).find('button.wavesurfer-loop');
    var debugBlock = $j(object).find('.debug');
    var progressBar = $j(object).find('progress');

    var playlist = false;
    if ($j(object).hasClass('wavesurfer-playlist')) playlist = true;

    wavesurfer[i].on('waveform-ready', function() {
        AjaxWritePeaks(wavesurfer[i], file_url, split);
    });

    wavesurfer[i].on('error', function() {
        progressBar.hide();
    });

    // Timecode during Play
    wavesurfer[i].on('audioprocess', function() {
        var current_time = wavesurfer[i].getCurrentTime();
        timeblock.html(secondsTimeSpanToMS(current_time));

        // Markers Set Current
        $j.each(markers[i], function(i) {
            if (current_time >= this.time_start && current_time < this.time_end) {
                $j(this.dom).addClass("wavesurfer-marker-current");
            } else {
                $j(this.dom).removeClass("wavesurfer-marker-current");
            }
        });

    });

    // Timecode and duration at Ready
    wavesurfer[i].on('ready', function() {
        progressBar.hide();
        var audio_duration = wavesurfer[i].getDuration();
        duration.html(secondsTimeSpanToMS(audio_duration));
        var current_time = wavesurfer[i].getCurrentTime();
        timeblock.html(secondsTimeSpanToMS(current_time));
    });

    // Timecode during pause + seek
    wavesurfer[i].on('seek', function() {
        var current_time = wavesurfer[i].getCurrentTime();
        timeblock.html(secondsTimeSpanToMS(current_time));
    });

    // Add Active class on all stop button at init stage
    buttonStop.addClass('wavesurfer-active-button');

    // Controls Functions
    buttonPlay.click(function() {

        wavesurfer[i].playPause();

        // IF PLAYING -> TO PAUSE
        if ($j(this).hasClass('wavesurfer-active-button')) {

            SetPauseButton(this);

        } else {
            // IS NOT PLAYING -> TO PLAY
            PauseOtherPlayers(wavesurfer, i);

            $j(this).children('span').text(wavesurfer_localize.pause);

            // Add an active class
            $j(this).addClass('wavesurfer-active-button');

            // Remove active class from the other buttons
            $j(this).parent().children('button.wavesurfer-play').removeClass('wavesurfer-paused-button');
            $j(this).parent().children('button.wavesurfer-stop').removeClass('wavesurfer-active-button');
        }

    });
    buttonStop.click(function() {

        wavesurfer[i].stop();

        if (!$j(this).hasClass('wavesurfer-active-button')) {

            $j(this).addClass('wavesurfer-active-button');
            $j(this).parent().children('button.wavesurfer-play').removeClass('wavesurfer-active-button');
            $j(this).parent().children('button.wavesurfer-play').removeClass('wavesurfer-paused-button');
            $j(this).parent().children('button.wavesurfer-play').children('span').text(wavesurfer_localize.play);
            var current_time = wavesurfer[i].getCurrentTime();
            timeblock.html(secondsTimeSpanToMS(current_time));
        }
    });

    // Button Mute
    buttonMute.click(function() {
        wavesurfer[i].toggleMute();

        // IF ACTIVE
        if ($j(this).hasClass('wavesurfer-active-button')) {
            $j(this).removeClass('wavesurfer-active-button');
            $j(this).children('span').text(wavesurfer_localize.mute);
        } else {
            $j(this).addClass('wavesurfer-active-button');
            $j(this).children('span').text(wavesurfer_localize.unmute);
        }

    });

    // Define Stop button
    buttonDownload.click(function() {
        var audio = $j(this).parent().parent('.wavesurfer-block').children('.wavesurfer-player');

        var download_url = audio.data('url');
        // Get FileName from URL
        var index = download_url.lastIndexOf("/") + 1;
        var file_name = download_url.substr(index);
        $j(this).children('a').attr('href', download_url);
        $j(this).children('a').attr('download', file_name);

        // then download
        download(download_url);
    });

    // On finish, remove active class on play
    wavesurfer[i].on('finish', function() {
        if (playlist === false) {
            if (buttonLoop.hasClass('wavesurfer-active-button') === false) {
                buttonPlay.removeClass('wavesurfer-active-button');
                buttonStop.addClass('wavesurfer-active-button');
            }
        }
    });

    // Button Loop
    buttonLoop.click(function() { // NOTE: seamless loop need WebAudio backend
        // IF LOOP
        if ($j(this).hasClass('wavesurfer-active-button')) {
            $j(this).removeClass('wavesurfer-active-button');
            $j(this).children('span').text(wavesurfer_localize.loop);
            wavesurfer[i].on('finish', function() {
                wavesurfer[i].pause();
            });
        } else {
            $j(this).addClass('wavesurfer-active-button');
            $j(this).children('span').text(wavesurfer_localize.unloop);
            wavesurfer[i].on('finish', function() {
                wavesurfer[i].play();
            });
        }
    });

    // Check if playlist
    if (playlist === true) {

        // The playlist list
        var tracks = $j(object).find('.wavesurfer-list-group li');

        // Set the first track as active at init
        var current = 0;
        tracks.eq(current).addClass('wavesurfer-active-track');

        // When cliking on an item
        tracks.click(function() {

            if ($j(this).hasClass('wavesurfer-active-track') === false) {

                // Remove active track class to all tracks
                tracks.each(function() {
                    $j(this).removeClass('wavesurfer-active-track');
                });

                // Add active track class
                $j(this).addClass('wavesurfer-active-track');

                file_url = $j(this).data('url');
                current = $j(this).index();

                peaks = $j(this).data('peaks');

                // Load sound and waveform
                if (peaks) {
                    wavesurfer[i].load(file_url, peaks, 'auto');
                } else {
                    wavesurfer[i].load(file_url, false, 'auto');
                }

                wavesurfer[i].on('ready', function() {
                    if (buttonPlay.hasClass('wavesurfer-active-button')) {
                        wavesurfer[i].play();
                    }
                });
            }

        }); // END click track

        wavesurfer[i].on('finish', function() {

            if (buttonLoop.hasClass('wavesurfer-active-button')) {
                wavesurfer[i].play();
            } else {
                // Increment current track number
                current++;

                // Get track URL
                var url = tracks.eq(current).data('url');
                var peaks = tracks.eq(current).data('peaks');
                // If there no other tracks after
                if (url !== undefined) {
                    if (continuous !== false) {

                        if (peaks) {
                            wavesurfer[i].load(url, peaks);
                        } else {
                            wavesurfer[i].load(url, false);
                        }
                        progressBar.attr('value', '0');
                        // progressBar.show(); -- hidden since 2.2 for BackEnd element

                        // Remove active tracks from all tracks
                        wavesurfer[i].on('loading', function(percent) {
                            progressBar.attr('value', percent);
                        });

                        tracks.eq(current - 1).removeClass('wavesurfer-active-track');
                        tracks.eq(current).addClass('wavesurfer-active-track');

                        buttonDownload.parent().parent('.wavesurfer-block').children('.wavesurfer-player').data('url', url);

                        // When it is loaded, play.
                        if (buttonPlay.hasClass('wavesurfer-active-button')) {
                            wavesurfer[i].on('ready', function() {
                                if (buttonPlay.hasClass('wavesurfer-active-button')) {
                                    wavesurfer[i].play();
                                }
                            });
                        }
                    } else {
                        buttonPlay.removeClass('wavesurfer-active-button');
                        buttonStop.addClass('wavesurfer-active-button');
                    }

                } else {
                    if (buttonLoop.hasClass('wavesurfer-active-button') === false) {
                        buttonPlay.removeClass('wavesurfer-active-button');
                        buttonStop.addClass('wavesurfer-active-button');
                    }
                }// End if url not undefined

            } // End if Loop is on
        }); // End of wavesurfer.on('finish')

    } // End if playlist
}

// Convert seconds into MS
function secondsTimeSpanToMS(s) {
    var m = Math.floor(s / 60); //Get remaining minutes
    s -= m * 60;
    s = Math.floor(s);
    return (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s); //zero padding on minutes and seconds
} // End secondsTimeSpanToMS

// Pause the other players if Play is pressed on a player
function PauseOtherPlayers(wavesurfer, i) {
    $j.each(wavesurfer, function(j) {
        if (wavesurfer[j].isPlaying() && j != i) {
            wavesurfer[j].playPause();
        }
    });

    // Loop in each wavesurfer block
    $j('.wavesurfer-block button.wavesurfer-play').each(function(i) {
        // IF IS NOT PLAYING
        if ($j(this).hasClass('wavesurfer-active-button')) {
            SetPauseButton(this);
        }
    });
}

// Set Button to Pause
function SetPauseButton(object) {
    $j(object).removeClass('wavesurfer-active-button');

    $j(object).addClass('wavesurfer-paused-button');

    $j(object).children('span').text(wavesurfer_localize.resume);

    $j(object).parent().children('button.wavesurfer-play').removeClass('wavesurfer-active-button');
    $j(object).parent().children('button.wavesurfer-stop').removeClass('wavesurfer-active-button');
}

// Need to be call after WaveForm is fully decode, on.ready
function AjaxWritePeaks(object, file_url, split) {
    var peaks = object.backend.getPeaks(960, 0, 959);
    var peaks_object = {
        url: file_url,
        peaks: peaks
    }
    $j.ajax({
        url: my_ajax_obj.ajax_url,
        data: { //POST request
            _ajax_nonce: my_ajax_obj.nonce, //nonce
            action: 'wavesurfer_write_peaks', //action
            peaks_object: JSON.stringify(peaks_object),
            split: split
        },
        type: 'post',
        dataType: 'json',
        success: function wavesurfer_wp_ajax(data, status, message) { //callback
            //console.log('======================================= ECRITURE =======================================');
            //console.log(data);
        }
    });
}

$j(document).on('click', '.wavesurfer-marker', function(event) {
    //event.preventDefault(); // Useful if links. Links can help TAB naivgation.
    var time_start = $j(this).data('start');
    var time_stop = $j(this).data('stop');
    if (time_stop !== undefined) {
        var time_end = $j(this).data('end');
    } else {
        var time_end = 0;
    }
    var id = $j(this).data('id');
    if (id >= 1) {
        id = id - 1;
    } else {
        id = 0;
    }
    time_start = TimeCodeToSeconds( time_start );
    time_end = TimeCodeToSeconds( time_end );
    var autoplay = $j(this).data('autoplay');
    if (autoplay === false) {
        wavesurfer[id].seekTo(time_start / wavesurfer[id].getDuration());
    } else {
        PauseOtherPlayers(wavesurfer, id);
        wavesurfer[id].play(time_start, time_end);
    }
});

function MarkerInit() {
    $j('.wavesurfer-marker').each(function(i) {
        var time_start = $j(this).data('start');
        var time_end = $j(this).data('end');
        var id = $j(this).data('id');
        if (id >= 1) {
            id = id - 1;
        } else {
            id = 0;
        }
        time_start = TimeCodeToSeconds( time_start );
        time_end = TimeCodeToSeconds( time_end );
        marker = {};
        marker.time_start = time_start;
        marker.time_end = time_end;
        marker.dom = this;
        if (typeof(markers[id]) === 'undefined') {
            markers[id] = [];
        }
        markers[id].push(marker);
    });
}

function TimeCodeToSeconds( value ) {
    if ( typeof value === 'undefined' || typeof value === 'number' ) return value;
    var time_array = value.split(':');
    time_array = time_array.reverse();
    time_array[0] = time_array[0].replace(',', '.');

    var multiply = [1, 60, 3600, 86400];
    var seconds = 0;
    for( i=0; i < time_array.length;	i++) {
        seconds = time_array[i] * multiply[i] + seconds;
    }

    return seconds;
}
