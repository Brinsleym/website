/* Self-hosted audio for the SoundCloud players.

   SoundCloud is blocked in mainland China, so each player can carry our own
   copy of its audio (listed in data/audio.yaml). This file decides when to
   use it and provides a stand-in for the SoundCloud widget that plays it
   through an HTML5 audio element, so the players drive either one through
   the same calls and events.

   Loaded from baseof.html before soundcloud-player.js, on pages with a
   player or a playlist. */
(function () {
  'use strict';

  if (window.SelfHostedAudio) return;

  /* Mainland China time zones. Hong Kong, Macau and Taiwan have their own
     and can reach SoundCloud, so they are deliberately not listed. */
  var CHINA_TIME_ZONES = /^(Asia\/(Shanghai|Chongqing|Chungking|Harbin|Urumqi|Kashgar)|PRC)$/;

  /* Whether to skip SoundCloud and go straight to our copy.

     The Cloudflare Pages middleware (functions/_middleware.js) sets a
     `country` cookie from the visitor's IP, which is the best signal, so it
     wins when present. Without it (a local build, or another host) the
     browser's time zone stands in. A wrong guess is cheap either way: a
     visitor wrongly sent to our copy still hears the track, and one wrongly
     sent to SoundCloud falls back to our copy when SoundCloud does not
     answer.

     ?audio=local or ?audio=soundcloud forces either, for testing. */
  function preferred() {
    var forced = /[?&]audio=(local|soundcloud)(&|$)/.exec(location.search);
    if (forced) return forced[1] === 'local';

    var cookie = /(?:^|;\s*)country=([A-Z]{2})/.exec(document.cookie);
    if (cookie) return cookie[1] === 'CN';

    try {
      return CHINA_TIME_ZONES.test(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    } catch (e) {
      return false;
    }
  }

  /* ---- a widget-shaped audio player ----

     Implements the part of SC.Widget the players use: play, pause, seekTo
     (ms), setVolume (0-100), getDuration and getCurrentSound (by callback),
     and bind() for the events below, which carry SoundCloud's own names.

     `sources` are tried in order: the CDN copy first, then the site's own,
     as cdn-fallback.html does for images. `audio` may be an element to
     reuse: iOS only lets an element that has already played from a tap
     start the next track by itself, so a playlist keeps one for good. */

  var Events = {
    READY: 'ready',
    PLAY: 'play',
    PAUSE: 'pause',
    FINISH: 'finish',
    PLAY_PROGRESS: 'playProgress',
    ERROR: 'error'
  };

  function Widget(sources, sound, audio) {
    var self = this;

    this.isSelfHosted = true;
    this.sound = sound || {};
    this.audio = audio || new Audio();
    this.handlers = {};
    this.listeners = [];
    this.isReady = false;

    var next = 0;
    var resumeAt = 0;

    function load() {
      self.audio.src = sources[next++];
      self.audio.load();
    }

    this.listen('loadedmetadata', function () {
      if (resumeAt) {
        self.audio.currentTime = resumeAt;
        resumeAt = 0;
      }
      if (self.isReady) return;
      self.isReady = true;
      self.emit(Events.READY);
    });

    this.listen('error', function () {
      // Carry on from the same place if the CDN drops out mid-track.
      if (next < sources.length) {
        resumeAt = self.audio.currentTime || 0;
        load();
      } else {
        self.emit(Events.ERROR);
      }
    });

    this.listen('play', function () { self.emit(Events.PLAY); });
    this.listen('pause', function () { if (!self.audio.ended) self.emit(Events.PAUSE); });
    this.listen('ended', function () { self.emit(Events.FINISH); });
    this.listen('timeupdate', function () {
      self.emit(Events.PLAY_PROGRESS, { currentPosition: self.audio.currentTime * 1000 });
    });

    this.audio.preload = 'metadata';
    if (sources && sources.length) load();
    else setTimeout(function () { self.emit(Events.ERROR); }, 0);
  }

  Widget.prototype.listen = function (name, fn) {
    this.audio.addEventListener(name, fn);
    this.listeners.push([name, fn]);
  };

  Widget.prototype.emit = function (name, data) {
    var list = this.handlers[name] || [];
    for (var i = 0; i < list.length; i++) list[i](data);
  };

  Widget.prototype.bind = function (name, fn) {
    (this.handlers[name] = this.handlers[name] || []).push(fn);
  };

  Widget.prototype.play = function () {
    var self = this;
    var played = this.audio.play();
    // A refused play (autoplay policy) must not leave a pause button showing.
    if (played && played['catch']) played['catch'](function () { self.emit(Events.PAUSE); });
  };

  Widget.prototype.pause = function () {
    this.audio.pause();
  };

  Widget.prototype.seekTo = function (ms) {
    this.audio.currentTime = Math.max(0, ms / 1000);
  };

  Widget.prototype.setVolume = function (v) {
    // Ignored on iOS, where volume belongs to the hardware buttons.
    this.audio.volume = Math.min(1, Math.max(0, v / 100));
  };

  Widget.prototype.getDuration = function (cb) {
    var d = this.audio.duration;
    cb(isFinite(d) ? d * 1000 : 0);
  };

  Widget.prototype.getCurrentSound = function (cb) {
    cb(this.sound);
  };

  /* Stop and let go of the element. A shared element is kept, but stripped
     of this widget's listeners so the next track starts clean. */
  Widget.prototype.destroy = function () {
    this.audio.pause();
    for (var i = 0; i < this.listeners.length; i++) {
      this.audio.removeEventListener(this.listeners[i][0], this.listeners[i][1]);
    }
    this.listeners = [];
    this.handlers = {};
  };

  window.SelfHostedAudio = {
    preferred: preferred,
    Widget: Widget,
    Events: Events,
    // How long SoundCloud gets to answer before a player with our own copy
    // gives up on it.
    SOUNDCLOUD_TIMEOUT: 5000
  };
})();
