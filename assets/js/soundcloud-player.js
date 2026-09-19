/* Custom SoundCloud player.

   The markup lives in layouts/_partials/soundcloud-player.html; this file is
   loaded once per page from baseof.html and initialises every player on that
   page. Keeping the implementation out of the partial means it is fetched
   once and cached like the rest of our JavaScript, instead of being re-sent
   inline with every page that carries a player.

   All user-facing strings come from the markup (data attributes and the
   hidden panels), because this file sits outside Hugo's templating and so
   cannot reach the translations itself. */
(function () {
  'use strict';

  if (window.__soundcloudPlayerReady) return;
  window.__soundcloudPlayerReady = true;

  var VOLUME_KEY = 'soundcloud-player-volume';
  var DEFAULT_VOLUME = 0.7;
  var SEEK_STEP = 5000;      // milliseconds an arrow key moves the playhead
  var VOLUME_STEP = 0.1;
  var NEAR_VIEWPORT = '200px 0px';
  var API_TIMEOUT = 10000;

  /* ---- SoundCloud Widget API ----

     Guarded, because the playlist partial ships the same loader: whichever
     runs first keeps ownership of the memoised promise, so a second copy
     cannot orphan the callers already waiting on the first. */
  if (!window.SoundCloudAPIManager) {
    window.SoundCloudAPIManager = (function () {
      var apiPromise = null;

      function loadAPI() {
        if (apiPromise) return apiPromise;

        apiPromise = new Promise(function (resolve, reject) {
          if (window.SC) { resolve(); return; }

          var script = document.createElement('script');
          script.src = 'https://w.soundcloud.com/player/api.js';
          script.async = true;

          /* A privacy extension usually refuses the request outright, but
             some simply never answer: time out rather than wait for ever. */
          var timer = setTimeout(function () {
            reject(new Error('SoundCloud API loading timeout - likely blocked by privacy extension'));
          }, API_TIMEOUT);

          script.onload = function () { clearTimeout(timer); resolve(); };
          script.onerror = function () {
            clearTimeout(timer);
            reject(new Error('SoundCloud API blocked by privacy extension or network error'));
          };

          document.head.appendChild(script);
        });

        return apiPromise;
      }

      return { loadAPI: loadAPI };
    })();
  }

  /* ---- helpers ---- */

  function fmt(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function clamp(n) {
    return Math.min(1, Math.max(0, n));
  }

  /* Storage is unavailable in private windows and with some privacy settings. */
  function readStoredVolume() {
    try {
      var v = parseFloat(window.localStorage.getItem(VOLUME_KEY));
      return isFinite(v) && v >= 0 && v <= 1 ? v : null;
    } catch (e) { return null; }
  }

  function storeVolume(v) {
    try { window.localStorage.setItem(VOLUME_KEY, String(v)); } catch (e) {}
  }

  function point(event) {
    if (event.touches && event.touches.length) return event.touches[0];
    if (event.changedTouches && event.changedTouches.length) return event.changedTouches[0];
    return event;
  }

  /* Drag along a horizontal track, reporting a fraction from 0 to 1.

     The track's rectangle is measured once when the pointer goes down: it
     cannot move or resize while the drag is running, so re-reading it on
     every frame would only force a layout for an answer we already have.

     Pointer Events keep the drag on the element itself through pointer
     capture, so nothing is attached to `document` at all. The mouse and
     touch fallback does attach to `document`, but only for the length of
     the drag, and it removes itself on release. */
  function drag(el, onMove, onStart, onEnd) {
    var dragging = false;
    var rect = null;

    function at(e) {
      if (!rect || !rect.width) return 0;
      return clamp((point(e).clientX - rect.left) / rect.width);
    }

    function begin(e) {
      dragging = true;
      rect = el.getBoundingClientRect();
      el.classList.add('is-scrubbing');
      if (onStart) onStart();
      onMove(at(e));
    }

    function finish() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-scrubbing');
      if (onEnd) onEnd();
    }

    if (window.PointerEvent) {
      el.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        begin(e);
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });
      el.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        onMove(at(e));
        e.preventDefault();
      });
      el.addEventListener('pointerup', finish);
      el.addEventListener('pointercancel', finish);
      return;
    }

    function move(e) {
      if (!dragging) return;
      onMove(at(e));
      e.preventDefault();
    }

    function up() {
      finish();
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
    }

    el.addEventListener('mousedown', function (e) {
      begin(e);
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
      e.preventDefault();
    });
    el.addEventListener('touchstart', function (e) {
      begin(e);
      document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('touchend', up);
      e.preventDefault();
    }, { passive: false });
  }

  /* ---- one player ---- */

  function setup(root) {
    if (root.dataset.scInit) return;
    root.dataset.scInit = '1';

    var player = root.querySelector('.custom-soundcloud-player');
    var privacyPanel = root.querySelector('.soundcloud-privacy-error');
    if (!player) return;

    var trackUrl = player.dataset.trackUrl;
    var customBackground = player.dataset.customBackground;

    var playButton = player.querySelector('.custom-soundcloud-player__play-button');
    var playIcon = playButton && playButton.querySelector('ion-icon');
    var progress = player.querySelector('.custom-soundcloud-player__progress-container');
    var currentTime = player.querySelector('.custom-soundcloud-player__time-display--current');
    var totalTime = player.querySelector('.custom-soundcloud-player__time-display--total');
    var artwork = player.querySelector('.custom-soundcloud-player__artwork');
    var title = player.querySelector('.custom-soundcloud-player__title');
    var artist = player.querySelector('.custom-soundcloud-player__artist');
    var volumeSlider = player.querySelector('.custom-soundcloud-player__volume-slider');
    var volumeButton = player.querySelector('.custom-soundcloud-player__volume-button');
    var volumeIcon = volumeButton && volumeButton.querySelector('ion-icon');
    var link = player.querySelector('.custom-soundcloud-player__soundcloud-link');

    /* Anything missing means the markup is not what we expect. Leave the
       shell alone rather than half-wiring a player that cannot work. */
    if (!trackUrl || !playButton || !progress || !currentTime || !totalTime ||
        !title || !artist || !volumeSlider || !volumeButton) {
      return;
    }

    var text = player.dataset;

    var widget = null;
    var created = false;
    var isReady = false;
    var isPlaying = false;
    var wantPlaying = false;   // what the listener asked for, not what the widget did
    var duration = 0;
    var position = 0;
    var scrubbing = false;
    var pendingSeek = 0;

    var volume = readStoredVolume();
    if (volume === null) volume = DEFAULT_VOLUME;
    var lastAudible = volume > 0 ? volume : DEFAULT_VOLUME;

    /* ---- painting ----

       Both bars are driven by a custom property that the stylesheet turns
       into a transform, so a drag never writes a layout-affecting style. */

    function paintProgress(fraction, ms) {
      progress.style.setProperty('--progress', fraction);
      progress.setAttribute('aria-valuenow', Math.round(fraction * 100));
      progress.setAttribute('aria-valuetext', fmt(ms / 1000) + ' / ' + fmt(duration / 1000));
      currentTime.textContent = fmt(ms / 1000);
    }

    function paintVolume() {
      volumeSlider.style.setProperty('--volume', volume);
      volumeSlider.setAttribute('aria-valuenow', Math.round(volume * 100));
      if (volumeIcon) {
        volumeIcon.setAttribute('name', volume === 0 ? 'volume-off' : (volume < 0.5 ? 'volume-low' : 'volume-high'));
      }
      volumeButton.setAttribute('aria-label', volume === 0 ? text.labelUnmute : text.labelMute);
    }

    function paintPlayState() {
      if (playIcon) playIcon.setAttribute('name', isPlaying ? 'pause' : 'play');
      playButton.classList.toggle('playing', isPlaying);
      playButton.setAttribute('aria-label', isPlaying ? text.labelPause : text.labelPlay);
    }

    /* ---- volume ---- */

    function setVolume(v, remember) {
      volume = clamp(v);
      if (volume > 0) lastAudible = volume;
      if (widget) widget.setVolume(volume * 100);
      if (remember !== false) storeVolume(volume);
      paintVolume();
    }

    volumeButton.addEventListener('click', function () {
      // Unmuting a slider sitting at zero should give back the level the
      // listener last chose, not a hardcoded default.
      setVolume(volume > 0 ? 0 : lastAudible);
    });

    drag(volumeSlider, function (f) {
      setVolume(f, false);
    }, null, function () {
      storeVolume(volume);
    });

    volumeSlider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') setVolume(volume + VOLUME_STEP);
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') setVolume(volume - VOLUME_STEP);
      else if (e.key === 'Home') setVolume(0);
      else if (e.key === 'End') setVolume(1);
      else return;
      e.preventDefault();
    });

    /* ---- progress ---- */

    function seek(ms) {
      position = Math.min(duration, Math.max(0, ms));
      // Seeking is for looking at a position, so it does not start playback.
      if (widget) widget.seekTo(position);
      paintProgress(duration ? position / duration : 0, position);
    }

    drag(progress, function (f) {
      if (!duration) return;
      // Paint straight away so the bar tracks the pointer without waiting
      // for the widget, which is on the far side of an iframe boundary.
      pendingSeek = f * duration;
      paintProgress(f, pendingSeek);
    }, function () {
      scrubbing = true;
    }, function () {
      scrubbing = false;
      // One seek on release: the widget re-buffers on every seekTo, so
      // sending one per pointer move made a scrub stutter and flooded the
      // iframe with postMessage traffic.
      if (widget && duration) seek(pendingSeek);
    });

    progress.addEventListener('keydown', function (e) {
      if (!widget || !duration) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') seek(position + SEEK_STEP);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') seek(position - SEEK_STEP);
      else if (e.key === 'Home') seek(0);
      else if (e.key === 'End') seek(duration);
      else return;
      e.preventDefault();
    });

    /* ---- play / pause ---- */

    /* iOS Safari will not start audio unless the first play comes out of a
       user gesture, and the widget needs one play/pause round trip before it
       will honour later calls. Primed once, inside the click handler. */
    var primed = false;

    function prime() {
      if (primed) return Promise.resolve();
      primed = true;

      var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      if (!isIOS || !isSafari || !widget) return Promise.resolve();

      return new Promise(function (resolve) {
        widget.play();
        setTimeout(function () {
          widget.pause();
          widget.seekTo(position);
          resolve();
        }, 100);
      });
    }

    playButton.addEventListener('click', function () {
      if (!widget || !isReady) return;
      if (isPlaying) {
        wantPlaying = false;
        widget.pause();
      } else {
        wantPlaying = true;
        prime().then(function () { widget.play(); });
      }
    });

    /* The widget lets a fragment of its buffer through when it stops, heard
       as a short rumble. Muting across the stop is a workaround rather than
       a cure, but it is the only lever the widget API offers; the restore
       reads the live volume, so it cannot undo the listener's own setting. */
    function silenceBriefly() {
      if (!widget || volume === 0) return;
      widget.setVolume(0);
      setTimeout(function () {
        if (widget && !isPlaying) widget.setVolume(volume * 100);
      }, 100);
    }

    /* ---- states ---- */

    function ready() {
      isReady = true;
      player.classList.remove('custom-soundcloud-player--loading');
      playButton.disabled = false;
    }

    function showError() {
      title.textContent = text.labelErrorTitle;
      artist.textContent = text.labelErrorArtist;
      player.classList.remove('custom-soundcloud-player--loading');
      player.classList.add('custom-soundcloud-player--error');
    }

    /* Swap the two panels rather than rewriting the player's outerHTML: the
       old code detached the very element its listeners and widget binding
       still referenced, and could not be undone without a reload. */
    function showPrivacyError() {
      if (!privacyPanel) { showError(); return; }
      player.hidden = true;
      privacyPanel.hidden = false;
    }

    function loadArtwork(url) {
      var large = url.replace('-large', '-t300x300');
      var img = new Image();

      img.onload = function () {
        artwork.src = large;
        artwork.style.display = 'block';
      };

      img.onerror = function () {
        artwork.src = url.replace('-large', '-t120x120');
        artwork.style.display = 'block';
      };

      img.src = large;
    }

    function applyTrackData(ms, sound) {
      duration = ms || 0;
      totalTime.textContent = fmt(duration / 1000);
      paintProgress(0, 0);

      if (!sound) return;
      title.textContent = sound.title || text.labelUnknownTitle;
      artist.textContent = (sound.user && sound.user.username) || text.labelUnknownArtist;
      if (sound.permalink_url && link) link.href = sound.permalink_url;
      if (sound.artwork_url && !customBackground && artwork) loadArtwork(sound.artwork_url);
    }

    function bindWidget() {
      widget.bind(SC.Widget.Events.PLAY, function () {
        /* Seeking a paused track makes the widget announce PLAY of its own
           accord, and the browser then blocks the sound, leaving the button
           showing a pause it never honoured. Scrubbing is for looking at a
           position, so put it back rather than follow the widget. */
        if (!wantPlaying) { widget.pause(); return; }
        isPlaying = true;
        paintPlayState();
      });

      widget.bind(SC.Widget.Events.PAUSE, function () {
        isPlaying = false;
        paintPlayState();
        silenceBriefly();
      });

      widget.bind(SC.Widget.Events.FINISH, function () {
        isPlaying = false;
        wantPlaying = false;
        position = 0;
        paintPlayState();
        paintProgress(0, 0);
        silenceBriefly();
      });

      widget.bind(SC.Widget.Events.PLAY_PROGRESS, function (data) {
        if (scrubbing) return;
        position = data.currentPosition;
        paintProgress(duration ? position / duration : 0, position);
      });
    }

    /* ---- the iframe ----

       Built on demand. A player below the fold used to fetch
       w.soundcloud.com on page load whether or not anyone scrolled to it. */

    function build() {
      if (created) return;
      created = true;

      var iframe = document.createElement('iframe');
      iframe.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(trackUrl) +
        '&auto_play=false&hide_related=true&show_comments=false&show_user=false' +
        '&show_reposts=false&visual=false&buying=false&download=false&sharing=false';
      iframe.title = text.labelIframe || 'SoundCloud';
      iframe.style.display = 'none';
      iframe.width = '100%';
      iframe.height = '0';
      player.appendChild(iframe);

      window.SoundCloudAPIManager.loadAPI().then(function () {
        widget = SC.Widget(iframe);

        widget.bind(SC.Widget.Events.READY, function () {
          widget.setVolume(volume * 100);
          paintVolume();

          Promise.all([
            new Promise(function (resolve) { widget.getDuration(resolve); }),
            new Promise(function (resolve) { widget.getCurrentSound(resolve); })
          ]).then(function (results) {
            applyTrackData(results[0], results[1]);
            ready();
          })['catch'](function () { showError(); });
        });

        bindWidget();
      })['catch'](function (error) {
        var message = (error && error.message) || '';
        if (message.indexOf('privacy extension') !== -1 ||
            message.indexOf('blocked') !== -1 ||
            message.indexOf('timeout') !== -1) {
          showPrivacyError();
        } else {
          showError();
        }
      });
    }

    paintVolume();
    paintPlayState();

    if (window.IntersectionObserver) {
      var observer = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            observer.disconnect();
            build();
            return;
          }
        }
      }, { rootMargin: NEAR_VIEWPORT });
      observer.observe(player);
    } else {
      build();
    }
  }

  function init() {
    var blocks = document.querySelectorAll('[data-soundcloud-player]');
    for (var i = 0; i < blocks.length; i++) {
      // One broken player must not take the others down with it.
      try { setup(blocks[i]); } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
