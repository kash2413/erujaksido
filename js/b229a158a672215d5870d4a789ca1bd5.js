

/*
Lightbox v2.51
by Lokesh Dhakar - http://www.lokeshdhakar.com

For more information, visit:
http://lokeshdhakar.com/projects/lightbox2/

Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
- free for use in both personal and commercial projects
- attribution requires leaving author name, author link, and the license info intact
	
Thanks
- Scott Upton(uptonic.com), Peter-Paul Koch(quirksmode.com), and Thomas Fuchs(mir.aculo.us) for ideas, libs, and snippets.
- Artemy Tregubenko (arty.name) for cleanup and help in updating to latest proto-aculous in v2.05.


Table of Contents
=================
LightboxOptions

Lightbox
- constructor
- init
- enable
- build
- start
- changeImage
- sizeContainer
- showImage
- updateNav
- updateDetails
- preloadNeigbhoringImages
- enableKeyboardNav
- disableKeyboardNav
- keyboardAction
- end

options = new LightboxOptions
lightbox = new Lightbox options
*/

(function() {
  var $, Lightbox, LightboxOptions;

  $ = jQuery;

  LightboxOptions = (function() {

    function LightboxOptions() {
      this.fileLoadingImage = '/images/loading.gif';
      this.fileCloseImage = '/images/close.png';
      this.resizeDuration = 700;
      this.fadeDuration = 500;
      this.labelImage = "Image";
      this.labelOf = "of";
    }

    return LightboxOptions;

  })();

  Lightbox = (function() {

    function Lightbox(options) {
      this.options = options;
      this.album = [];
      this.currentImageIndex = void 0;
      this.init();
    }

    Lightbox.prototype.init = function() {
      this.enable();
      return this.build();
    };

    Lightbox.prototype.enable = function() {
      var _this = this;
      return $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox]', function(e) {
        _this.start($(e.currentTarget));
        return false;
      });
    };

    Lightbox.prototype.build = function() {
      var $lightbox,
        _this = this;
      $("<div>", {
        id: 'lightboxOverlay'
      }).appendTo($('body'));
      $('<div/>', {  
        id: 'lightbox'
      }).append($('<div/>', {
        "class": 'lb-outerContainer'
      }).append($('<div/>', {
        "class": 'lb-container'
      }).append($('<img/>', {
        "class": 'lb-image'
      }), $('<div/>', {
        "class": 'lb-nav'
      }).append($('<a/>', {
        "class": 'lb-prev'
      }), $('<a/>', {
        "class": 'lb-next'
      })), $('<div/>', {
        "class": 'lb-loader'
      }).append($('<a/>', {
        "class": 'lb-cancel'
      }).append($('<img/>', {
        src: this.options.fileLoadingImage
      }))))), $('<div/>', {
        "class": 'lb-dataContainer'
      }).append($('<div/>', {
        "class": 'lb-data'
      }).append($('<div/>', {
        "class": 'lb-details'
      }).append($('<span/>', {
        "class": 'lb-caption'
      }), $('<span/>', {
        "class": 'lb-number'
      })), $('<div/>', {
        "class": 'lb-closeContainer'
      }).append($('<a/>', {
        "class": 'lb-close'
      }).append($('<img/>', {
        src: this.options.fileCloseImage
      })))))).appendTo($('body'));
      $('#lightboxOverlay').hide().on('click', function(e) {
        _this.end();
        return false;
      });
      $lightbox = $('#lightbox');
      $lightbox.hide().on('click', function(e) {
        if ($(e.target).attr('id') === 'lightbox') _this.end();
        return false;
      });
      $lightbox.find('.lb-outerContainer').on('click', function(e) {
        if ($(e.target).attr('id') === 'lightbox') _this.end();
        return false;
      });
      $lightbox.find('.lb-prev').on('click', function(e) {
        _this.changeImage(_this.currentImageIndex - 1);
        return false;
      });
      $lightbox.find('.lb-next').on('click', function(e) {
        _this.changeImage(_this.currentImageIndex + 1);
        return false;
      });
      $lightbox.find('.lb-loader, .lb-close').on('click', function(e) {
        _this.end();
        return false;
      });
    };

    Lightbox.prototype.start = function($link) {
      var $lightbox, $window, a, i, imageNumber, left, top, _len, _ref;
      $(window).on("resize", this.sizeOverlay);
      $('select, object, embed').css({
        visibility: "hidden"
      });
      $('#lightboxOverlay').width($(document).width()).height($(document).height()).fadeIn(this.options.fadeDuration);
      this.album = [];
      imageNumber = 0;
      if ($link.attr('rel') === 'lightbox') {
        this.album.push({
          link: $link.attr('href'),
          title: $link.attr('title')
        });
      } else {
        _ref = $($link.prop("tagName") + '[rel="' + $link.attr('rel') + '"]');
        for (i = 0, _len = _ref.length; i < _len; i++) {
          a = _ref[i];
          this.album.push({
            link: $(a).attr('href'),
            title: $(a).attr('title')
          });
          if ($(a).attr('href') === $link.attr('href')) imageNumber = i;
        }
      }
      $window = $(window);
      top = $window.scrollTop() + $window.height() / 10;
      left = $window.scrollLeft();
      $lightbox = $('#lightbox');
      $lightbox.css({
        top: top + 'px',
        left: left + 'px'
      }).fadeIn(this.options.fadeDuration);
      this.changeImage(imageNumber);
    };

    Lightbox.prototype.changeImage = function(imageNumber) {
      var $image, $lightbox, preloader,
        _this = this;
      this.disableKeyboardNav();
      $lightbox = $('#lightbox');
      $image = $lightbox.find('.lb-image');
      this.sizeOverlay();
      $('#lightboxOverlay').fadeIn(this.options.fadeDuration);
      $('.loader').fadeIn('slow');
      $lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();
      $lightbox.find('.lb-outerContainer').addClass('animating');
      preloader = new Image;
      preloader.onload = function() {
        $image.attr('src', _this.album[imageNumber].link);
        $image.width = preloader.width;
        $image.height = preloader.height;
        return _this.sizeContainer(preloader.width, preloader.height);
      };
      preloader.src = this.album[imageNumber].link;
      this.currentImageIndex = imageNumber;
    };

    Lightbox.prototype.sizeOverlay = function() {
      return $('#lightboxOverlay').width($(document).width()).height($(document).height());
    };

    Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
      var $container, $lightbox, $outerContainer, containerBottomPadding, containerLeftPadding, containerRightPadding, containerTopPadding, newHeight, newWidth, oldHeight, oldWidth,
        _this = this;
      $lightbox = $('#lightbox');
      $outerContainer = $lightbox.find('.lb-outerContainer');
      oldWidth = $outerContainer.outerWidth();
      oldHeight = $outerContainer.outerHeight();
      $container = $lightbox.find('.lb-container');
      containerTopPadding = parseInt($container.css('padding-top'), 10);
      containerRightPadding = parseInt($container.css('padding-right'), 10);
      containerBottomPadding = parseInt($container.css('padding-bottom'), 10);
      containerLeftPadding = parseInt($container.css('padding-left'), 10);
      newWidth = imageWidth + containerLeftPadding + containerRightPadding;
      newHeight = imageHeight + containerTopPadding + containerBottomPadding;
      if (newWidth !== oldWidth && newHeight !== oldHeight) {
        $outerContainer.animate({
          width: newWidth,
          height: newHeight
        }, this.options.resizeDuration, 'swing');
      } else if (newWidth !== oldWidth) {
        $outerContainer.animate({
          width: newWidth
        }, this.options.resizeDuration, 'swing');
      } else if (newHeight !== oldHeight) {
        $outerContainer.animate({
          height: newHeight
        }, this.options.resizeDuration, 'swing');
      }
      setTimeout(function() {
        $lightbox.find('.lb-dataContainer').width(newWidth);
        $lightbox.find('.lb-prevLink').height(newHeight);
        $lightbox.find('.lb-nextLink').height(newHeight);
        _this.showImage();
      }, this.options.resizeDuration);
    };

    Lightbox.prototype.showImage = function() {
      var $lightbox;
      $lightbox = $('#lightbox');
      $lightbox.find('.lb-loader').hide();
      $lightbox.find('.lb-image').fadeIn('slow');
      this.updateNav();
      this.updateDetails();
      this.preloadNeighboringImages();
      this.enableKeyboardNav();
    };

    Lightbox.prototype.updateNav = function() {
      var $lightbox;
      $lightbox = $('#lightbox');
      $lightbox.find('.lb-nav').show();
      if (this.currentImageIndex > 0) $lightbox.find('.lb-prev').show();
      if (this.currentImageIndex < this.album.length - 1) {
        $lightbox.find('.lb-next').show();
      }
    };

    Lightbox.prototype.updateDetails = function() {
      var $lightbox,
        _this = this;
      $lightbox = $('#lightbox');
      if (typeof this.album[this.currentImageIndex].title !== 'undefined' && this.album[this.currentImageIndex].title !== "") {
        $lightbox.find('.lb-caption').html(this.album[this.currentImageIndex].title).fadeIn('fast');
      }
      if (this.album.length > 1) {
        $lightbox.find('.lb-number').html(this.options.labelImage + ' ' + (this.currentImageIndex + 1) + ' ' + this.options.labelOf + '  ' + this.album.length).fadeIn('fast');
      } else {
        $lightbox.find('.lb-number').hide();
      }
      $lightbox.find('.lb-outerContainer').removeClass('animating');
      $lightbox.find('.lb-dataContainer').fadeIn(this.resizeDuration, function() {
        return _this.sizeOverlay();
      });
    };

    Lightbox.prototype.preloadNeighboringImages = function() {
      var preloadNext, preloadPrev;
      if (this.album.length > this.currentImageIndex + 1) {
        preloadNext = new Image;
        preloadNext.src = this.album[this.currentImageIndex + 1].link;
      }
      if (this.currentImageIndex > 0) {
        preloadPrev = new Image;
        preloadPrev.src = this.album[this.currentImageIndex - 1].link;
      }
    };

    Lightbox.prototype.enableKeyboardNav = function() {
      $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
    };

    Lightbox.prototype.disableKeyboardNav = function() {
      $(document).off('.keyboard');
    };

    Lightbox.prototype.keyboardAction = function(event) {
      var KEYCODE_ESC, KEYCODE_LEFTARROW, KEYCODE_RIGHTARROW, key, keycode;
      KEYCODE_ESC = 27;
      KEYCODE_LEFTARROW = 37;
      KEYCODE_RIGHTARROW = 39;
      keycode = event.keyCode;
      key = String.fromCharCode(keycode).toLowerCase();
      if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
        this.end();
      } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
        if (this.currentImageIndex !== 0) {
          this.changeImage(this.currentImageIndex - 1);
        }
      } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
        if (this.currentImageIndex !== this.album.length - 1) {
          this.changeImage(this.currentImageIndex + 1);
        }
      }
    };

    Lightbox.prototype.end = function() {
      this.disableKeyboardNav();
      $(window).off("resize", this.sizeOverlay);
      $('#lightbox').fadeOut(this.options.fadeDuration);
      $('#lightboxOverlay').fadeOut(this.options.fadeDuration);
      return $('select, object, embed').css({
        visibility: "visible"
      });
    };

    return Lightbox;

  })();

  $(function() {
    var lightbox, options;
    options = new LightboxOptions;
    return lightbox = new Lightbox(options);
  });

}).call(this);


function loginReq(){$('.login').css('display','none');$('.loginactive').css('display','block');$('.search-form').css('display','none');$('.user-panel-box').addClass('active');}
function zaloguj(){var loginemail=$('input[name="loginemail"]').val();var password=$('input[name="password"]').val();$.ajax({url:"/ajax/login/",dataType:"json",type:"POST",data:'loginemail='+loginemail+'&password='+password,success:function(data){if(data.status){$('.loginactive').css('display','none');$('.logintrue').css('display','block');$('.search-form').css('display','block');$('.user-panel-box').removeClass('active');$('.logintrue span.nick').html(data.data);$('.header .login-box #user-avatar > img').attr('src',data.avatar);window.location.replace("/profil");}else{$('.errorlogin').css('display','block');$('.errorlogin').html(data.errors);}}});}
function expandProfil(){$('.profilpanel').fadeToggle();}
function logout(){$.ajax({url:"/ajax/logout/",dataType:"json",type:"POST",data:'',success:function(data){if(data.status){$('.login').css('display','block');$('.logintrue').css('display','none');$('.profilpanel').css('display','none');$('.logintrue span.nick').html('');window.location.replace("/");}}});}
function facebook(){(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(d.getElementById(id))return;js=d.createElement(s);js.id=id;js.src="//connect.facebook.net/en_US/all.js#xfbml=1";fjs.parentNode.insertBefore(js,fjs);}(document,'script','facebook-jssdk'));}
function facebook_connect(){if($('#facebook_connect,#facebook_connect_reg').length){if($.browser.opera)
{FB.init({appId:fbid,status:true,cookie:true,xfbml:true});}
else
{window.fbAsyncInit=function(){FB.init({appId:fbid,status:true,cookie:true,xfbml:true});};}
$('#facebook_connect,#facebook_connect_reg').click(function(){FB.getLoginStatus(function(response){if(response.status==='connected'){FB.api('/me',function(r){var user_data={user_input_email:r.email,user_input_fname:r.first_name,user_input_lname:r.last_name,user_input_fb_id:r.id,user_input_fb_token:response.authResponse.accessToken};register_facebook(user_data);});}else{FB.login(function(response){if(response.authResponse){FB.api('/me',function(r){var user_data={user_input_email:r.email,user_input_fname:r.first_name,user_input_lname:r.last_name,user_input_fb_id:r.id,user_input_fb_token:response.authResponse.accessToken};register_facebook(user_data);});}else{alert('User cancelled login or did not fully authorize.');}},{scope:'email,publish_stream'});};});return false;});}}
function register_facebook(user_data){$.ajax({url:"/ajax/register_fbconnect/",dataType:"json",type:"POST",data:user_data,success:function(d){if(d.status){$('.loginactive').css('display','none');$('.logintrue').css('display','block');$('.search-form').css('display','block');$('.user-panel-box').removeClass('active');$('.logintrue span.nick').html(d.data);}else{$('.errorlogin').css('display','block');$('.errorlogin').html(d.errors);}}});}
function register_google(){$('#googleplus_connect,#googleplus_connect_reg').click(function(){$.ajax({url:"/ajax/register_googleconnect",dataType:"json",type:"POST",data:'',async:false,success:function(data){if(data.status){var url=data.data;var myWindow=window.open(url,'_blank','left=100,top=100,width=600,height=450,status=yes,toolbar=no,menubar=no,location=no');}
$('.search-form').css('display','block');$('.user-panel-box').removeClass('active');}});});}
$(function(){if(typeof(FB)=="undefined"){facebook();}
facebook_connect();register_google();});
/*!

   Flowplayer Commercial v5.1.1 (Friday, 19. October 2012 04:24PM) | flowplayer.org/license

*/
!function($) { 

// auto-install (any video tag with parent .flowplayer)
$(function() {
   if (typeof $.fn.flowplayer == 'function') {
      $("video").parent(".flowplayer").flowplayer();
   }
});

var instances = [],
   extensions = [],
   UA = navigator.userAgent,
   use_native = /iPhone/i.test(UA) || /Android/.test(UA) && /Firefox/.test(UA);


/* flowplayer()  */
window.flowplayer = function(fn) {
   return use_native ? 0 :
      $.isFunction(fn) ? extensions.push(fn) :
      typeof fn == 'number' || fn === undefined ? instances[fn || 0] :
      $(fn).data("flowplayer");
};

$.extend(flowplayer, {

   version: '5.1.1',

   engine: {},

   conf: {},

   defaults: {

      debug: false,

      // true = forced playback
      disabled: false,

      // first engine to try
      engine: 'html5',

      // keyboard shortcuts
      keyboard: true,

      // default aspect ratio
      ratio: 9 / 16,

      rtmp: 0,

      splash: false,

      swf: "/flowplayer/flowplayer.swf",

      speeds: [0.25, 0.5, 1, 1.5, 2],

      // initial volume level
      volume: 1,

      // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#error-codes
      errors: [

         // video exceptions
         '',
         'Video loading aborted',
         'Network error',
         'Video not properly encoded',
         'Video file not found',

         // player exceptions
         'Unsupported video',
         'Skin not found',
         'SWF file not found',
         'Subtitles not found',
         'Invalid RTMP URL'
      ]

   },

   support: {}

});

// smartphones simply use native controls
if (use_native) {
   return $(function() { $("video").attr("controls", "controls"); });
}

// jQuery plugin
$.fn.flowplayer = function(opts, callback) {

   if (typeof opts == 'string') opts = { swf: opts }
   if ($.isFunction(opts)) { callback = opts; opts = {} }

   return !opts && this.data("flowplayer") || this.each(function() {

      // private variables
      var root = $(this),
         conf = $.extend({}, flowplayer.defaults, flowplayer.conf, opts, root.data()),
         videoTag = $("video", root),
         lastSeekPosition,
         initialTypes = [],
         savedVolume,
         engine;


      /*** API ***/
      var api = {

         // properties
         conf: conf,
         currentSpeed: 1,
         volumeLevel: conf.volume,
         video: null,

         // states
         splash: false,
         ready: false,
         paused: false,
         playing: false,
         loading: false,
         muted: false,
         disabled: false,
         finished: false,

         // methods
         load: function(video, callback) {

            if (api.error || api.loading || api.disabled) return;

            root.trigger("load", [api, video, engine]);

            // callback
            if ($.isFunction(video)) callback = video;
            if (callback) root.one("ready", callback);

            return api;
         },

         pause: function(fn) {
            if (api.ready && !api.seeking && !api.disabled && !api.loading) {
               engine.pause();
               api.one("pause", fn);
            }
            return api;
         },

         resume: function() {

            if (api.ready && api.paused && !api.disabled) {
               engine.resume();

               // Firefox (+others?) does not fire "resume" after finish
               if (api.finished) {
                  api.trigger("resume");
                  api.finished = false;
               }
            }

            return api;
         },

         toggle: function() {
            return api.ready ? api.paused ? api.resume() : api.pause() : api.load();
         },

         /*
            seek(1.4)   -> 1.4s time
            seek(true)  -> 10% forward
            seek(false) -> 10% backward
         */
         seek: function(time, callback) {
            if (api.ready) {

               if (typeof time == "boolean") {
                  var delta = api.video.duration * 0.1;
                  time = api.video.time + (time ? delta : -delta);
               }

               time = lastSeekPosition = Math.min(Math.max(time, 0), api.video.duration);
               engine.seek(time);
               if ($.isFunction(callback)) root.one("seek", callback);
            }
            return api;
         },

         /*
            seekTo(1) -> 10%
            seekTo(2) -> 20%
            seekTo(3) -> 30%
            ...
            seekTo()  -> last position
         */
         seekTo: function(position, fn) {
            var time = position === undefined ? lastSeekPosition : api.video.duration * 0.1 * position;
            return api.seek(time, fn);
         },

         volume: function(level) {
            if (api.ready && level != api.volumeLevel) engine.volume(Math.min(Math.max(level, 0), 1));
            return api;
         },

         speed: function(val, callback) {

            if (api.ready) {

               // increase / decrease
               if (typeof val == "boolean") {
                  val = conf.speeds[$.inArray(api.currentSpeed, conf.speeds) + (val ? 1 : -1)] || api.currentSpeed;
               }

               engine.speed(val);
               if (callback) root.one("speed", callback);
            }

            return api;
         },


         stop: function() {
            if (api.ready) engine.stop();
            return api;
         },

         unload: function() {
            if (!root.hasClass("is-embedding")) {
               if (conf.splash) {
                  api.trigger("unload");
                  engine.unload();
               } else {
                  api.stop();
               }
            }
            return api;
         }

      };

      /* togglers */
      $.each(['disable', 'mute'], function(i, key) {
         api[key] = function() {
            return api.trigger(key);
         };
      });

      /* event binding / unbinding */
      $.each(['bind', 'one', 'unbind'], function(i, key) {
         api[key] = function(type, fn) {
            root[key](type, fn);
            return api;
         };
      });

      api.trigger = function(event, arg) {
         root.trigger(event, [api, arg]);
         return api;
      };


      /*** Behaviour ***/

      root.bind("boot", function() {

         // conf
         $.each(['autoplay', 'loop', 'preload', 'poster'], function(i, key) {
            var val = videoTag.attr(key);
            if (val !== undefined) conf[key] = val ? val : true;
         });

         // splash
         if (conf.splash || root.hasClass("is-splash")) {
            api.splash = conf.splash = conf.autoplay = true;
            root.addClass("is-splash");
         }

         if (conf.poster) delete conf.autoplay;

         // extensions
         $.each(extensions, function(i) {
            this(api, root);
         });

         // 1. use the configured engine
         engine = flowplayer.engine[conf.engine];
         if (engine) engine = engine(api, root);

         if (engine) {
            api.engine = conf.engine;

         // 2. failed -> try another
         } else {
            delete flowplayer.engine[conf.engine];

            $.each(flowplayer.engine, function(name, impl) {
               engine = this(api, root);
               if (engine) api.engine = name;
               return false;
            });
         }

         // no engine
         if (!engine) return api.trigger("error", { code: 5 });

         // start
         conf.splash ? api.unload() : api.load();

         // disabled
         if (conf.disabled) api.disable();

         // initial callback
         root.one("ready", callback);

         // instances
         instances.push(api);


      }).bind("load", function(e, api, video) {

         // unload others
         if (conf.splash) {
            $(".flowplayer").filter(".is-ready, .is-loading").not(root).each(function() {
               var api = $(this).data("flowplayer");
               if (api.conf.splash) api.unload();
            });
         }

         // loading
         api.loading = true;


      }).bind("ready unload", function(e) {
         var ready = e.type == "ready";
         root.toggleClass("is-splash", !ready).toggleClass("is-ready", ready);
         api.ready = ready;
         api.splash = !ready;

         function noLoad() {
            root.removeClass("is-loading");
            api.loading = false;
         }

         // load
         if (ready) {
            api.volume(conf.volume);

            if (conf.autoplay) {
               root.one("resume", noLoad);

            } else {
               if (!api.playing) api.trigger("pause");
               noLoad();
            }

         // unload
         } else {
            api.video.time = 0;
            if (conf.splash) videoTag.remove();
         }

      }).bind("mute", function(e) {
         var flag = api.muted = !api.muted;
         if (flag) savedVolume = api.volumeLevel;
         api.volume(flag ? 0 : savedVolume);

      }).bind("speed", function(e, api, val) {
         api.currentSpeed = val;

      }).bind("volume", function(e, api, level) {
         api.volumeLevel = Math.round(level * 100) / 100;

         if (api.muted && api.volumeLevel) {
            root.removeClass("is-muted");
            api.muted = false;
         }


      }).bind("beforeseek seek", function(e) {
         api.seeking = e.type == "beforeseek";
         root.toggleClass("is-seeking", api.seeking);

      }).bind("ready pause resume unload finish", function(e, _api, video) {

         // PAUSED: pause / finish
         api.paused = /pause|finish|unload/.test(e.type);

         // SHAKY HACK: first-frame / poster / preload=none
         if (e.type == "ready") {
            if (video) {
               api.paused = !video.duration || !conf.autoplay && (conf.preload != 'none' || api.engine == 'flash');
            }
         }

         // the opposite
         api.playing = !api.paused;

         // CSS classes
         root.toggleClass("is-paused", api.paused).toggleClass("is-playing", api.playing);

         // sanity check
         if (!api.load.ed) api.pause();

      }).bind("disable", function(){
         api.disabled = !api.disabled;

      }).bind("finish", function(e) {
         api.finished = true;

      }).bind("error", function() {
         videoTag.remove();
      });

      // boot
      root.trigger("boot", [api, root]).data("flowplayer", api);

   });

};

/* The most minimal Flash embedding */
var IS_IE = $.browser.msie;

try {

   var ver = IS_IE ? new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable('$version') :
      navigator.plugins["Shockwave Flash"].description;

   ver = ver.split(/\D+/);
   if (!IS_IE) ver = ver.slice(1);

   flowplayer.support.flashVideo = ver[0] > 9 || ver[0] == 9 && ver[2] >= 115;

} catch (err) {

}


// movie required in opts
function embed(swf, flashvars) {

   window["objectId"] = new Object();

   var id = "obj" + ("" + Math.random()).slice(2, 15),
      tag = '<object class="fp-engine" id="' + id+ '" name="' + id + '" ';

   tag += IS_IE ? 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">' :
      ' data="' + swf  + '" type="application/x-shockwave-flash">';

   var opts = {
      width: "100%",
      height: "100%",
      allowscriptaccess: "always",
      wmode: "opaque",
      quality: "high",
      flashvars: "",

      // https://github.com/flowplayer/flowplayer/issues/13#issuecomment-9369919
      movie: swf + (IS_IE ? "?" + id : ""),
      name: id
   };

   // flashvars
   $.each(flashvars, function(key, value) {
      opts.flashvars += key + "=" + value + "&";
   });

   // parameters
   $.each(opts, function(key, value) {
      tag += '<param name="' + key + '" value="'+ value +'"/>';
   });

   tag += "</object>";

   return $(tag);
}


// Flash is buggy allover
if (window.attachEvent) {
   window.attachEvent("onbeforeunload", function() {
      __flash_savedUnloadHandler = __flash_unloadHandler = function() {};
   });
}


flowplayer.engine.flash = function(player, root) {

   var conf = player.conf,
      video = player.video,
      callbackId,
      objectTag,
      api;

   function pick(sources) {
      for (var i = 0, source; i < sources.length; i++) {
         source = sources[i];
         if (/mp4|flv|flash/.test(source.type)) return source;
      }
   }

   // not supported
   if (!flowplayer.support.flashVideo || !pick(video.sources)) return;

   // ok
   $("video", root).remove();

   var engine = {

      load: function(video) {

         var source = pick(video.sources);
         source.url = (conf.rtmp ? source.src : $("<a/>").attr("href", source.src)[0].href)
            .replace(/&amp;/g, '%26').replace(/&/g, '%26').replace(/=/g, '%3D');

         if (api) {
            api.__play(source.url);

         } else {

            callbackId = "fp" + ("" + Math.random()).slice(3, 15);

            var opts = {
               hostname: conf.embedded ? conf.hostname : top.location.hostname,
               url: source.url,
               callback: "$."+ callbackId
            };

            // optional conf
            $.each(['key', 'autoplay', 'preload', 'poster', 'rtmp', 'loop', 'debug'], function(i, key) {
               if (conf[key]) opts[key] = conf[key];
            });

            if (/^https?:/.test(source.url)) delete opts.rtmp;

            objectTag = embed(conf.swf, opts);

            objectTag.prependTo(root);

            api = objectTag[0];

            // throw error if no loading occurs
            setTimeout(function() {
               try {
                  if (!api.PercentLoaded()) {
                     return root.trigger("error", [player, { code: 7, url: conf.swf }]);
                  }
               } catch (e) {}
            }, 5000);

            // listen
            $[callbackId] = function(type, arg) {

               if (conf.debug && type != "status") console.log("--", type, arg);

               var event = $.Event(type),
                  video = player.video;

               switch (type) {

                  // RTMP sends a lot of finish events in vain
                  // case "finish": if (conf.rtmp) return;
                  case "ready": arg = $.extend(video, arg); break;
                  case "click": event.flash = true; break;
                  case "keydown": event.which = arg; break;
                  case "buffered": video.buffered = true; break;
                  case "seek": video.time = arg; break;

                  case "status":
                     if (!video.time || arg.time > video.time) {
                        video.time = arg.time;
                        player.trigger("progress", arg.time);
                     }

                     if (arg.buffer < video.bytes) {
                        video.buffer = arg.buffer / video.bytes * video.duration;
                        player.trigger("buffer", video.buffer);
                     }
                     break;
               }

               // add some delay to that player is truly ready after an event
               setTimeout(function() { player.trigger(event, arg); }, 1)

            };

         }

         return source;

      },

      // not supported yet
      speed: $.noop,


      unload: function() {
         api && api.__unload();
         delete $[callbackId];
         $("object", root).remove();
         api = 0;
      }

   };

   $.each("pause,resume,seek,volume,stop".split(","), function(i, name) {

      engine[name] = function(arg) {
         if (player.ready) {

            if (name == 'seek') {

               // started
               if (player.video.time) {
                  player.trigger("beforeseek");

               // not started (TODO: simplify)
               } else {
                  engine.resume();
                  player.seeking = false;
                  player.trigger("resume");
                  return;
               }

            }

            if (arg === undefined) {
               api["__" + name]();

            } else {
               api["__" + name](arg);
            }

         }
      };

   });

   return engine;

};


var VIDEO = $('<video/>')[0];

   // HTML5 --> Flowplayer event
var EVENTS = {

   // fired
   ended: 'finish',
   pause: 'pause',
   play: 'resume',
   progress: 'buffer',
   timeupdate: 'progress',
   volumechange: 'volume',
   ratechange: 'speed',
   seeking: 'beforeseek',
   seeked: 'seek',
   // abort: 'resume',

   // not fired
   loadeddata: 'ready',
   // loadedmetadata: 0,
   // canplay: 0,

   // error events
   // load: 0,
   // emptied: 0,
   // empty: 0,
   error: 'error',
   dataunavailable: 'error'

};

flowplayer.support.video = !!VIDEO.canPlayType;

function round(val) {
   return Math.round(val * 100) / 100;
}

flowplayer.engine.html5 = function(player, root) {

   var videoTag = $("video", root),
      track = $("track", videoTag),
      conf = player.conf,
      timer,
      api;

   function canPlay(type) {
      if (!/video/.test(type)) type = "video/" + type;
      return !!VIDEO.canPlayType(type).replace("no", '');
   }

   function pick(video) {
      for (var i = 0, source; i < video.sources.length; i++) {
         source = video.sources[i];
         if (canPlay(source.type)) return source;
      };
   }

   // not supported
   if (!flowplayer.support.video || !pick(player.video)) return;

   // ok
   videoTag.addClass("fp-engine").removeAttr("controls");

   return {

      load: function(video) {

         var source = pick(video);

         if (conf.splash && !api) {
            videoTag = $("<video/>", {
               src: source.src,
               type: 'video/' + source.type,
               autoplay: 'autoplay',
               'class': 'fp-engine'
            }).prependTo(root);

            if (track.length) videoTag.append(track.attr("default", ""));

            if (conf.loop) videoTag.attr("loop", "loop");

            api = videoTag[0];

         } else {
            api = videoTag[0];

            // change of clip
            if (video.src && api.src != video.src) {
               videoTag.attr("autoplay", "autoplay");
               api.src = source.src;
               api.load();
            }
         }

         // no events fired when preload=none
         if (conf.preload == 'none') root.trigger("ready", [player, {}]);

         listen(api, $("source", videoTag));

         return source;
      },

      pause: function() {
         api.pause();
      },

      resume: function() {
         api.play();
      },

      speed: function(val) {
         api.playbackRate = val;
      },

      seek: function(time) {
         try {
            api.currentTime = time;
         } catch (ignored) {}
      },

      // seek(0) && pause() && display poster
      stop: function() {
         api.currentTime = 0;
         setTimeout(function() { api.load(); }, 100);
      },

      volume: function(level) {
         api.volume = level;
      },

      unload: function() {
         $("video", root).remove();
         api = 0;
         clearInterval(timer);
      }

   };

   function listen(api, sources) {

      // listen only once
      if (api.listening) return; api.listening = true;

      sources.bind("error", function(e) {
         if (canPlay($(e.target).attr("type"))) {
            player.trigger("error", { code: 4 });
         }
      });

      $.each(EVENTS, function(type, flow) {

        api.addEventListener(type, function(e) {

            // safari hack for bad URL
            if (flow == "progress" && e.srcElement && e.srcElement.readyState === 0) {
               setTimeout(function() {
                  if (!player.video.duration) {
                     flow = "error";
                     player.trigger(flow, { code: 4 });
                  }
               }, 500);
            }

            if (conf.debug && !/progress/.test(flow)) console.log(type, "->", flow, e);

            // no events if player not ready
            if (!player.ready && !/ready|error/.test(flow) || !flow) { return; }

            var event = $.Event(flow), video = player.video, arg;

            switch (flow) {

               case "ready":

                  arg = $.extend(video, {
                     duration: api.duration,
                     width: api.videoWidth,
                     height: api.videoHeight,
                     url: api.currentSrc
                  });

                  try {
                     video.seekable = api.seekable && api.seekable.end(null);

                  } catch (ignored) {}

                  // buffer
                  timer = timer || setInterval(function() {

                     try {
                        video.buffer = api.buffered.end(null);

                     } catch (ignored) {}

                     if (video.buffer) {
                        if (video.buffer < video.duration) {
                           player.trigger("buffer", e);

                        } else if (!video.buffered) {
                           video.buffered = true;
                           player.trigger("buffer", e).trigger("buffered", e);
                           clearInterval(timer);
                           timer = 0;
                        }
                     }

                  }, 250);

                  break;

               case "progress": case "seek":
                  // Safari can give negative times. add rounding
                  arg = video.time = Math.max(api.currentTime, 0);
                  break;

               case "speed":
                  arg = round(api.playbackRate);
                  break;

               case "volume":
                  arg = round(api.volume);
                  break;

               case "error":
                  arg = (e.srcElement || e.originalTarget).error;
            }

            player.trigger(event, arg);

         }, false);

      });

   }

};
var TYPE_RE = /.(\w{3,4})$/i;

function parseSource(el) {
   var type = el.attr("type"), src = el.attr("src");
   return { src: src, type: type ? type.replace("video/", "") : src.split(TYPE_RE)[1] };
}

/* Resolves video object from initial configuration and from load() method */
flowplayer(function(api, root) {

   var videoTag = $("video", root),
      initialSources = [];

   // initial video
   $("source", videoTag).each(function() {
      initialSources.push(parseSource($(this)));
   });

   if (!initialSources.length) initialSources.push(parseSource(videoTag));

   api.video = { sources: initialSources };

   // a new video is loaded
   api.bind("load", function(e, api, video, engine) {

      video = video || api.video;

      if ($.isArray(video)) {

         video = { sources: $.map(video, function(el) {
            var type = Object.keys(el)[0];
            el.type = type;
            el.src = el[type];
            delete el[type];
            return el;
         })};

      } else if (typeof video == 'string') {

         video = { src: video, sources: [] };

         $.each(initialSources, function(i, source) {
            if (source.type != 'flash') {
               video.sources.push({
                  type: source.type,
                  src: video.src.replace(TYPE_RE, "") + "." + source.type
               });
            }
         });

      }

      api.video = $.extend(video, engine.load(video));

   });

});
/* A minimal jQuery Slider plugin with all goodies */

// skip IE policies
// document.ondragstart = function () { return false; };


// execute function every <delay> ms
$.throttle = function(fn, delay) {
   var locked;

   return function () {
      if (!locked) {
         fn.apply(this, arguments);
         locked = 1;
         setTimeout(function () { locked = 0; }, delay);
      }
   };
};


$.fn.slider2 = function() {

   return this.each(function() {

      var root = $(this),
         doc = $(document),
         progress = root.children(":last"),
         disabled,
         offset,
         width,
         height,
         vertical,
         size,
         maxValue,
         max,

         /* private */
         calc = function() {
            offset = root.offset();
            width = root.width();
            height = root.height();

            /* exit from fullscreen can mess this up.*/
            // vertical = height > width;

            size = vertical ? height : width;
            max = toDelta(maxValue);
         },

         fire = function(value) {
            if (!disabled && value != api.value && (!maxValue || value < maxValue)) {
               root.trigger("slide", [ value ]);
               api.value = value;
            }
         },

         mousemove = function(e) {
            var delta = vertical ? e.pageY - offset.top : e.pageX - offset.left;
            delta = Math.max(0, Math.min(max || size, delta));

            var value = delta / size;
            if (vertical) value = 1 - value;
            return move(value, 0, true);
         },

         move = function(value, speed) {
            if (speed === undefined) { speed = 0; }
            var to = (value * 100) + "%";

            if (!maxValue || value <= maxValue)
               progress.stop().animate(vertical ? { height: to } : { width: to }, speed, "linear");

            return value;
         },

         toDelta = function(value) {
            return Math.max(0, Math.min(size, vertical ? (1 - value) * height : value * width));
         },

         /* public */
         api = {

            max: function(value) {
               maxValue = value;
            },

            disable: function(flag) {
               disabled = flag;
            },

            slide: function(value, speed, fireEvent) {
               calc();
               if (fireEvent) fire(value);

               move(value, speed);
            }

         };

      calc();

      // bound dragging into document
      root.data("api", api).bind("mousedown.sld", function(e) {

         e.preventDefault();

         if (!disabled) {

            // begin --> recalculate. allows dynamic resizing of the slider
            var delayedFire = $.throttle(fire, 100);
            calc();
            api.dragging = true;
            fire(mousemove(e));

            doc.bind("mousemove.sld", function(e) {
               e.preventDefault();
               delayedFire(mousemove(e));

            }).one("mouseup", function() {
               api.dragging = false;
               doc.unbind("mousemove.sld");
            });

         }

      });

   });

};

function zeropad(val) {
   val = parseInt(val, 10);
   return val >= 10 ? val : "0" + val;
}

// display seconds in hh:mm:ss format
function format(sec) {

   sec = sec || 0;

   var h = Math.floor(sec / 3600),
       min = Math.floor(sec / 60);

   sec = sec - (min * 60);

   if (h >= 1) {
      min -= h * 60;
      return h + "h:" + zeropad(min); // + ":" + zeropad(sec);
   }

   return zeropad(min) + ":" + zeropad(sec);
}


// detect animation support
flowplayer.support.animation = (function() {
   var vendors = ['','Webkit','Moz','O','ms','Khtml'], el = $("<p/>")[0];

   for (var i = 0; i < vendors.length; i++) {
      if (el.style[vendors[i] + 'AnimationName'] !== 'undefined') return true;
   }
})();


flowplayer(function(api, root) {

   var conf = api.conf,
      hovertimer;

   root.addClass("flowplayer is-mouseout").append('\
      <div class="ratio"/>\
      <div class="ui">\
         <div class="waiting"><em/><em/><em/></div>\
         <a class="fullscreen"/>\
         <a class="unload"/>\
         <p class="speed"/>\
         <div class="controls">\
            <div class="timeline">\
               <div class="buffer"/>\
               <div class="progress"/>\
            </div>\
            <div class="volume">\
               <a class="mute"></a>\
               <div class="volumeslider">\
                  <div class="volumelevel"/>\
               </div>\
            </div>\
         </div>\
         <div class="time">\
            <em class="elapsed">00:00</em>\
            <em class="remaining"/>\
            <em class="duration">99:99</em>\
         </div>\
         <div class="message"><h2/><p/></div>\
      </div>'.replace(/class="/g, 'class="fp-')
   );

   function find(klass) {
      return $(".fp-" + klass, root);
   }

   // widgets
   var progress = find("progress"),
      buffer = find("buffer"),
      elapsed = find("elapsed"),
      remaining = find("remaining"),
      waiting = find("waiting"),
      ratio = find("ratio"),
      speed = find("speed"),
      origRatio = ratio.css("paddingTop"),

      // sliders
      timeline = find("timeline").slider2(),
      timelineApi = timeline.data("api"),

      volume = find("volume"),
      fullscreen = find("fullscreen"),
      volumeSlider = find("volumeslider").slider2(),
      volumeApi = volumeSlider.data("api"),
      noToggle = root.hasClass("no-toggle");

   // aspect ratio
   function setRatio(val) {
      if (!parseInt(origRatio, 10))
         ratio.css("paddingTop", val * 100 + "%");

      // no inline-block support. sorry; no feature detection
      if ($.browser.msie && $.browser.version < 8) {
         $("object", root).height(root.height());
      }

   }

   function hover(flag) {
      root.toggleClass("is-mouseover", flag).toggleClass("is-mouseout", !flag);
   }

   // loading...
   if (!flowplayer.support.animation) waiting.html("<p>loading &hellip;</p>");

   setRatio(conf.ratio);

   if (noToggle) root.addClass("is-mouseover");

   // no fullscreen in IFRAME
   try {
      if (window != window.top) fullscreen.remove();

   } catch (e) {
      fullscreen.remove();
   }


   api.bind("ready", function() {

      var dur = api.video.duration;

      timelineApi.disable(!dur);

      setRatio(api.video.videoHeight / api.video.videoWidth);

      // initial time & volume
      find("duration").add(remaining).html(format(dur));
      volumeApi.slide(api.volumeLevel);


   }).bind("unload", function() {
      if (!origRatio) ratio.css("paddingTop", "");

   // buffer
   }).bind("buffer", function() {
      var video = api.video,
         max = video.buffer / video.duration;

      if (!video.seekable) timelineApi.max(max);

      buffer.animate({ width: (max * 100) + "%"}, 250, "linear");

   }).bind("speed", function(e, api, val) {
      speed.text(val + "x").addClass("fp-hilite");
      setTimeout(function() { speed.removeClass("fp-hilite") }, 1000);

   }).bind("buffered", function() {
      buffer.css({ width: '100%' });
      timelineApi.max(1);

   // progress
   }).bind("progress", function() {

      var time = api.video.time,
         duration = api.video.duration;

      if (!timelineApi.dragging || typeof Touch == 'object') {
         timelineApi.slide(time / duration, api.seeking ? 0 : 250);
      }

      elapsed.html(format(time));
      remaining.html("-" + format(duration - time));

   }).bind("finish resume seek", function(e) {
      root.toggleClass("is-finished", e.type == "finish");

   }).bind("finish", function() {
      elapsed.html(format(api.video.duration));
      window.foo = timelineApi;
      timelineApi.slide(1, 100);

   // misc
   }).bind("beforeseek", function() {

      progress.stop();


   }).bind("volume", function() {
      volumeApi.slide(api.volumeLevel);


   }).bind("disable", function() {
      var flag = api.disabled;
      timelineApi.disable(flag);
      volumeApi.disable(flag);
      root.toggleClass("is-disabled", api.disabled);

   }).bind("mute", function() {
      root.toggleClass("is-muted", api.muted);

   }).bind("error", function(e, api, error) {
      root.removeClass("is-loading").addClass("is-error");

      if (error) {
         error.message = conf.errors[error.code];
         api.error = true;

         var el = $(".fp-message", root);
         $("h2", el).text(api.engine + ": " + error.message);
         $("p", el).text(error.url || api.video.url || api.video.src);
         root.unbind("mouseenter click").removeClass("is-mouseover");
      }


   // hover
   }).bind("mouseenter mouseleave", function(e) {
      if (noToggle) return;

      var is_over = e.type == "mouseenter",
         lastMove;

      // is-mouseover/out
      hover(is_over);

      if (is_over) {

         root.bind("pause.x mousemove.x volume.x", function() {
            hover(true);
            lastMove = new Date;
         });

         hovertimer = setInterval(function() {
            if (new Date - lastMove > 5000) {
               hover(false)
               lastMove = new Date;
            }
         }, 100);

      } else {
         root.unbind(".x");
         clearInterval(hovertimer);
      }


   // allow dragging over the player edge
   }).bind("mouseleave", function() {

      if (timelineApi.dragging || volumeApi.dragging) {
         root.addClass("is-mouseover").removeClass("is-mouseout");
      }

   // click
   }).bind("click.player", function(e) {
      if ($(e.target).is(".fp-ui, .fp-engine") || e.flash || e.force) {
         e.preventDefault();
         return api.toggle();
      }
   });

   $(".fp-toggle", root).click(api.toggle);

   /* controlbar elements */
   $.each(['mute', 'fullscreen', 'unload'], function(i, key) {
      find(key).click(function() {
         api[key]();
      });
   });

   timeline.bind("slide", function(e, val) {
      api.seeking = true;
      api.seek(val * api.video.duration);
   });

   volumeSlider.bind("slide", function(e, val) {
      api.volume(val);
   });

   // times
   find("time").click(function(e) {
      $(this).toggleClass("is-inverted");
   });

   hover(false);

});

var focused,
   focusedRoot,
   IS_HELP = "is-help";

 // keyboard. single global listener
$(document).bind("keydown.fp", function(e) {

   if (!focused || !focused.conf.keyboard) return;

   var el = focused,
      metaKeyPressed = e.ctrlKey || e.metaKey || e.altKey,
      key = e.which;

   // help dialog (shift key not truly required)
   if ($.inArray(key, [63, 187, 191, 219]) != -1) {
      focusedRoot.toggleClass(IS_HELP);
      return false;
   }

   // close help
   if (key == 27 && focusedRoot.hasClass(IS_HELP)) {
      focusedRoot.toggleClass(IS_HELP);
      return false;
   }

   if (!metaKeyPressed && el.ready) {

      e.preventDefault();

      // slow motion / fast forward
      if (e.shiftKey) {
         if (key == 39) el.speed(true);
         else if (key == 37) el.speed(false);
         return;
      }

      // 1, 2, 3, 4 ..
      if (key < 58 && key > 47) return el.seekTo(key - 48);

      switch (key) {
         case 38: case 75: el.volume(el.volumeLevel + 0.15); break;        // volume up
         case 40: case 74: el.volume(el.volumeLevel - 0.15); break;        // volume down
         case 39: case 76: el.seeking = true; el.seek(true); break;        // forward
         case 37: case 72: el.seeking = true; el.seek(false); break;       // backward
         case 190: el.seekTo(); break;                                     // to last seek position
         case 32: el.toggle(); break;                                      // spacebar
         case 70: el.fullscreen(); break;                                  // toggle fullscreen
         case 77: el.mute(); break;                                        // mute
         case 27: el[el.isFullscreen ? 'fullscreen' : 'unload'](); break;  // esc
      }

   }

});

flowplayer(function(api, root) {

   // no keyboard configured
   if (!api.conf.keyboard) return;

   // hover
   root.bind("mouseenter mouseleave", function(e) {
      focused = !api.disabled && e.type == 'mouseenter' ? api : 0;
      if (focused) focusedRoot = root;
   });

   // TODO: add to player-layout.html
   root.append('\
      <div class="fp-help">\
         <a class="fp-close"></a>\
         <div class="fp-help-section fp-help-basics">\
            <p><em>space</em>play / pause</p>\
            <p><em>esc</em>stop</p>\
            <p><em>f</em>fullscreen</p>\
            <p><em>shift</em> + <em>&#8592;</em><em>&#8594;</em>slower / faster</p>\
         </div>\
         <div class="fp-help-section">\
            <p><em>&#8593;</em><em>&#8595;</em>volume</p>\
            <p><em>m</em>mute</p>\
         </div>\
         <div class="fp-help-section">\
            <p><em>&#8592;</em><em>&#8594;</em>seek</p>\
            <p><em>&nbsp;. </em>seek to previous\
            </p><p><em>1</em><em>2</em>&hellip;<em>6</em> seek to 10%, 20%, &hellip;60% </p>\
         </div>\
      </div>\
   ');

   api.bind("ready unload", function(e) {
      $(".fp-ui", root).attr("title", e.type == "ready" ? "Hit ? for help" : "");
   });

   $(".fp-close", root).click(function() {
      root.toggleClass(IS_HELP);
   });

});

var VENDOR = $.browser.mozilla ? "moz": "webkit",
   FS_ENTER = "fullscreen",
   FS_EXIT = "fullscreen-exit",
   FULL_PLAYER,
   FS_SUPPORT = typeof document.webkitCancelFullScreen == 'function' || document.mozFullScreenEnabled;

// detect native fullscreen support

flowplayer.support.fullscreen = FS_SUPPORT;


// esc button
$(document).bind(VENDOR + "fullscreenchange", function(e) {
   var el = $(document.webkitCurrentFullScreenElement || document.mozFullScreenElement);

   if (el.length) {
      FULL_PLAYER = el.trigger(FS_ENTER, [el]);
   } else {
      FULL_PLAYER.trigger(FS_EXIT, [FULL_PLAYER]);
   }

});


flowplayer(function(player, root) {

   player.isFullscreen = false;

   player.fullscreen = function(flag) {

      if (flag === undefined) flag = !player.isFullscreen;

      if (FS_SUPPORT) {

         if (flag) {
            root[0][VENDOR + 'RequestFullScreen'](Element.ALLOW_KEYBOARD_INPUT);
         } else {
            document[VENDOR + 'CancelFullScreen']();
         }

      } else {
         player.trigger(flag ? FS_ENTER : FS_EXIT, [player])
      }

      return player;
   };

   player.bind(FS_ENTER, function(e) {
      root.addClass("is-fullscreen");
      player.isFullscreen = true;

   }).bind(FS_EXIT, function(e) {
      root.removeClass("is-fullscreen");
      player.isFullscreen = false;
   });

   var origH = root.height(),
      origW = root.width();

   // handle Flash object aspect ratio on fullscreen
   player.bind("fullscreen", function() {

      var screenW = FS_SUPPORT ? screen.width : $(window).width(),
         screenH = FS_SUPPORT ? screen.height : $(window).height(),
         ratio = player.video.height / player.video.width,
         dim = ratio > 0.5 ? screenH * (1 / ratio) : screenW * ratio;

      $("object", root).css(ratio > 0.5 ?
         { width: dim, marginLeft: (screenW - dim) / 2, height: '100%' } :
         { height: dim, marginTop: (screenH - dim - 20) / 2, width: '100%' }
      );


   }).bind("fullscreen-exit", function() {
      var ie7 = $.browser.msie && $.browser.version < 8,
         ratio = player.video.height / player.video.width;

      $("object", root).css(ratio > 0.5 ?
         { width: ie7 ? origW : '', height: ie7 ? origH : '', marginLeft: '' } :
         { height: ie7 ? origH : '', width: ie7 ? origW : '', marginTop: '' }
      );

   });

});


flowplayer(function(player, root) {

   var conf = $.extend({ active: 'is-active', advance: true, query: ".fp-playlist a" }, player.conf),
      klass = conf.active;

   // getters
   function els() {
      return $(conf.query, root);
   }

   function active() {
      return $(conf.query + "." + klass, root);
   }

   // click -> play
   var items = els().live("click", function(e) {
      var el = $(this);
      el.is("." + klass) ? player.toggle() : player.load(el.attr("href"));
      e.preventDefault();
   });

   player.play = function(i) {
      if (i === undefined) player.resume();
      else if (typeof i != 'number') player.load.apply(null, arguments);
      else els().eq(i).click();
      return player;
   };

   if (items.length) {

      // disable single clip looping
      player.conf.loop = false;

      // playlist wide cuepoint support
      var has_cuepoints = items.filter("[data-cuepoints]").length;

      // highlight
      player.bind("load", function() {

         // active
         var prev = active().removeClass(klass),
            el = $("a[href*='" + player.video.src.replace(TYPE_RE, "") + "']", root).addClass(klass),
            clips = els(),
            index = clips.index(el),
            is_last = index == clips.length - 1;

         // index
         root.removeClass("video" + clips.index(prev)).addClass("video" + index).toggleClass("last-video", is_last);

         // video properties
         player.video.index = index;
         player.video.is_last = is_last;

         // cuepoints
         if (has_cuepoints) player.cuepoints = el.data("cuepoints");


      // without namespace callback called only once. unknown rason.
      }).bind("unload.pl", function() {
         active().toggleClass(klass);

      });

      // api.next() / api.prev()
      $.each(['next', 'prev'], function(i, key) {

         player[key] = function(e) {
            e && e.preventDefault();

            // next (or previous) entry
            var el = active()[key]();

            // cycle
            if (!el.length) el = els().filter(key == 'next' ? ':first' : ':last');;

            el.click();
         };

         $(".fp-" + key, root).click(player[key]);
      });

      if (conf.advance) {
         root.unbind("finish.pl").bind("finish.pl", function() {
            root.addClass("is-playing"); // hide play button

            // next clip is found or loop
            if (active().next().length || conf.loop) {
               player.next();

            // stop to last clip, play button starts from 1:st clip
            } else {
               player.one("resume", function() {
                  player.next();
                  return false;
               });
            }
         });
      }

   }


});

var CUE_RE = / ?cue\d+ ?/;

flowplayer(function(player, root) {

   var lastTime = 0;

   player.cuepoints = player.conf.cuepoints || [];

   function setClass(index) {
      root[0].className = root[0].className.replace(CUE_RE, " ");
      if (index >= 0) root.addClass("cue" + index);
   }

   player.bind("progress", function(e, api, time) {

      // avoid throwing multiple times
      if (lastTime && time - lastTime < 0.015) return lastTime = time;
      lastTime = time;

      var cues = player.cuepoints || [];

      for (var i = 0, cue; i < cues.length; i++) {

         cue = cues[i];
         if (1 * cue) cue = { time: cue }
         if (cue.time < 0) cue.time = player.video.duration + cue.time;
         cue.index = i;

         // progress_interval / 2 = 0.125
         if (Math.abs(cue.time - time) < 0.125) {
            setClass(i);
            root.trigger("cuepoint", [player, cue]);
         }

      }

   // no CSS class name
   }).bind("unload seek", setClass);

   if (player.conf.generate_cuepoints) {

      player.bind("ready", function() {

         var cues = player.cuepoints || [],
            duration = player.video.duration,
            timeline = $(".fp-timeline", root).css("overflow", "visible");

         $.each(cues, function(i, cue) {

            var time = cue.time || cue;
            if (time < 0) time = duration + cue;

            var el = $("<a/>").addClass("fp-cuepoint fp-cuepoint" + i)
               .css("left", (time / duration * 100) + "%");

            el.appendTo(timeline).mousedown(function() {
               player.seek(time);

               // preventDefault() doesn't work
               return false;
            });

         });

      });

   }

});
var TRACK_EL = $("<track/>")[0];

flowplayer.support.subtitles = !!TRACK_EL.track;

// TODO: remove in 6.0
$.extend($.support, flowplayer.support);


flowplayer(function(player, root, engine) {

   var track = $("track", root),
      conf = player.conf;

   if (flowplayer.support.subtitles) {

      player.subtitles = track.length && track[0].track;

      // use native when supported
      if (conf.nativesubtitles && conf.engine == 'html5') return;
   }

   // avoid duplicate loads
   track.remove();

   // Thanks: https://github.com/delphiki/Playr/blob/master/playr.js#L569
   var TIMECODE_RE = /^([0-9]{2}:[0-9]{2}:[0-9]{2}[,.]{1}[0-9]{3}) --\> ([0-9]{2}:[0-9]{2}:[0-9]{2}[,.]{1}[0-9]{3})(.*)/;

   function seconds(timecode) {
      var els = timecode.split(':');
      return els[0] * 60 * 60 + els[1] * 60 + parseFloat(els[2].replace(',','.'));
   }

   player.subtitles = [];

   var url = track.attr("src");

   $.get(url, function(txt) {

      for (var i = 0, lines = txt.split("\n"), len = lines.length, entry = {}, title, timecode, text, cue; i < len; i++) {

         timecode = TIMECODE_RE.exec(lines[i]);

         if (timecode) {

            // title
            title = lines[i - 1];

            // text
            text = "<p>" + lines[++i] + "</p><br/>";
            while ($.trim(lines[++i]) && i < lines.length) text +=  "<p>" + lines[i] + "</p><br/>";

            // entry
            entry = {
               title: title,
               startTime: seconds(timecode[1]),
               endTime: seconds(timecode[2]),
               text: text
            };

            cue = { time: entry.startTime, subtitle: entry };

            player.subtitles.push(entry);
            player.cuepoints.push(cue);
            player.cuepoints.push({ time: entry.endTime, subtitleEnd: title });

            // initial cuepoint
            if (entry.startTime === 0) {
               player.trigger("cuepoint", cue);
            }

         }

      }

   }).fail(function() {
      player.trigger("error", {code: 8, url: url });
      return false;
   });

   var wrap = $("<div class='fp-subtitle'/>", root).appendTo(root),
      currentPoint;

   player.bind("cuepoint", function(e, api, cue) {

      if (cue.subtitle) {
         currentPoint = cue.index;
         wrap.html(cue.subtitle.text).addClass("fp-active");

      } else if (cue.subtitleEnd) {
         wrap.removeClass("fp-active");
      }

   }).bind("seek", function() {

      var time = player.video.time;

      $.each(player.cuepoints || [], function(i, cue) {
         var entry = cue.subtitle;

         if (entry && currentPoint != cue.index) {
            if (time >= cue.time && time <= entry.endTime) player.trigger("cuepoint", cue);
            else wrap.removeClass("fp-active");
         }

      });

   });

});



flowplayer(function(player, root) {

   var id = player.conf.analytics, time = 0, last = 0;

   if (id && typeof _gat !== 'undefined') {

      function track(e) {

         if (time) {
            var tracker = _gat._getTracker(id),
               video = player.video;

            tracker._setAllowLinker(true);

            // http://code.google.com/apis/analytics/docs/tracking/eventTrackerGuide.html
            tracker._trackEvent(
               "Video / Seconds played",
               player.engine + "/" + video.type,
               root.attr("title") || video.src.split("/").slice(-1)[0].replace(TYPE_RE, ''),
               Math.round(time / 1000)
            );

            time = 0;

         }

      }

      player.bind("load unload", track).bind("progress", function() {

         if (!player.seeking) {
            time += last ? (+new Date - last) : 0;
            last = +new Date;
         }

      }).bind("pause", function() {
         last = 0;
      });

      $(window).unload(track);

   }

});
/*
   Bunch of hacks to gain mobile WebKit support. Main shortomings include:

   1. cannot insert video tag dynamically -> splash screen is tricky / hack
   2. autoplay not supported

   Both of these issues cannot be feature detected. More issues can be found here:

   http://blog.millermedeiros.com/2011/03/html5-video-issues-on-the-ipad-and-how-to-solve-them/
*/

if (/iPad|MeeGo/.test(UA)) {

   // Warning: This is a hack!. iPad is the new IE for developers.

   flowplayer(function(player, root) {

      // custom loaded event
      var conf = player.conf,
         loaded;

      conf.autoplay = player.splash = conf.splash = false;

      // old generation fix
      if (/Version\/5/.test(UA)) conf.preload = "none";


      if (conf.native_ipad_fullscreen) {
         player.fullscreen = function() {
           $('video', root)[0].webkitEnterFullScreen();
         }
      }

      root.bind("load", function() {
         var video = $('video', root)[0],
            poster = $(video).attr('poster'),
            autoplay = $(video).attr('autoplay');

         // poster fix
         if (poster && !autoplay) {
           root.css('background', 'url(' + poster + ') center no-repeat');
           root.css('background-size', 'contain');
         }

         root.addClass("is-ipad is-paused").removeClass("is-loading");
         player.ready = player.paused = true;
         player.loading = false;

         if (autoplay) player.resume();

         // fake ready event on start
         video.addEventListener("canplay", function(e) {
            root.trigger("ready").trigger("resume");
         }, false);

      });

      // force playback start with a first click
      root.bind("touchstart", function(e) {

         if (!loaded) {
            root.triggerHandler({ type: 'click.player', force: true });
            loaded = true;
         }

         // fake mouseover effect with click
         if (player.playing && !root.hasClass("is-mouseover")) {
            root.addClass("is-mouseover");
            return false;
         }

      });


      player.unload = function() {
         player.pause();
         root.trigger("unload");
         loaded = false;
      };

   });

}
if (/Android/.test(navigator.userAgent)) {
  flowplayer(function(player, root) {

    // custom loaded event
    var loaded;

    player.splash = player.conf.splash = false;
    player.conf.autoplay = false;
    
    //Setup fullscreen
    var video = $('video', root)[0];
    player.fullscreen = function() {
      video.webkitEnterFullScreen();
    }

    root.bind("load", function() {
      root.addClass("is-paused").removeClass("is-loading");
      player.ready = player.paused = true;
      player.loading = false;
      
      var handleVideoDurationOnTimeUpdate = function() { // Android browser gives video.duration == 1 until second 'timeupdate' event fired
        if (video.duration != 1) {
          player.video.duration = video.duration;
          $('.fp-duration', root).html(format(video.duration));
          video.removeEventListener('timeupdate', handleVideoDurationOnTimeUpdate);
        }
      };
      video.addEventListener('timeupdate', handleVideoDurationOnTimeUpdate);
    });
    
    // force playback start with a first click
    root.bind("touchstart", function(e) {
      if (!loaded) {
        root.triggerHandler("click.player");
        loaded = true;
      }
      // fake mouseover effect with click
      if (player.playing && !root.hasClass("is-mouseover")) {
        root.addClass("is-mouseover");
        return false;
      }
    });

    player.unload = function() {
      player.pause();
      root.trigger("unload");
      loaded = false;
    };
  });
}

flowplayer(function(player, root) {

   // no embedding
   if (player.conf.embed === false) return;

   var conf = player.conf,
      ui = $(".fp-ui", root),
      trigger = $("<a/>", { "class": "fp-embed", title: 'Copy to your site'}).appendTo(ui),
      target = $("<div/>", { 'class': 'fp-embed-code'})
         .append("<label>Paste this HTML code on your site to embed.</label><textarea/>").appendTo(ui),
      area = $("textarea", target);

   player.embedCode = function() {

      var video = player.video,
         width = video.width || root.width(),
         height = video.height || root.height(),
         el = $("<div/>", { 'class': 'flowplayer', css: { width: width, height: height }}),
         tag = $("<video/>").appendTo(el);

      if (conf.poster) tag.attr("poster", conf.poster);

      // configuration
      $.each(['origin', 'analytics', 'logo', 'key', 'rtmp'], function(i, key) {
         if (conf[key]) el.attr("data-" + key, conf[key]);
      });

      // sources
      $.each(video.sources, function(i, src) {
         tag.append($("<source/>", { type: "video/" + src.type, src: src.src }));
      });

      var code = $("<foo/>", { src: "http://embed.flowplayer.org/5.1.1/embed.min.js" }).append(el);
      return $("<p/>").append(code).html().replace(/<(\/?)foo/g, "<$1script");
   };

   root.fptip(".fp-embed", "is-embedding");

   area.click(function() {
      this.select();
   });

   trigger.click(function() {
      area.text(player.embedCode());
      area[0].focus();
      area[0].select();
   });

});


$.fn.fptip = function(trigger, active) {

   return this.each(function() {

      var root = $(this);

      function close() {
         root.removeClass(active);
         $(document).unbind(".st");
      }

      $(trigger || "a", this).click(function(e) {

         e.preventDefault();

         root.toggleClass(active);

         if (root.hasClass(active)) {

            $(document).bind("keydown.st", function(e) {
               if (e.which == 27) close();

            // click:close
            }).bind("click.st", function(e) {
               if (!$(e.target).parents("." + active).length) close();
            });
         }

      });

   });

};

}(jQuery);
flowplayer(function(e,t){function f(e){var t=n("<a/>")[0];return t.href=e,t.hostname}function l(e,t){var n="br.com,cn.com,eu.com,hu.com,no.com,qc.com,sa.com,se.com,us.com,uy.com,uk.com,gb.com,com,co.ac,gv.ac,or.ac,ac.ac,ac,ac.at,co.at,gv.at,or.at,asn.au,com.au,edu.au,org.au,net.au,id.au,adm.br,adv.br,am.br,arq.br,art.br,bio.br,cng.br,cnt.br,com.br,ecn.br,eng.br,esp.br,etc.br,eti.br,fm.br,fot.br,fst.br,g12.br,gov.br,ind.br,inf.br,jor.br,lel.br,med.br,mil.br,net.br,nom.br,ntr.br,odo.br,org.br,ppg.br,pro.br,psc.br,psi.br,rec.br,slg.br,tmp.br,tur.br,tv.br,vet.br,zlg.br,br,ab.ca,bc.ca,mb.ca,nb.ca,nf.ca,ns.ca,nt.ca,on.ca,pe.ca,qc.ca,sk.ca,yk.ca,ca,ac.cn,com.cn,edu.cn,gov.cn,org.cn,bj.cn,sh.cn,tj.cn,cq.cn,he.cn,nm.cn,ln.cn,jl.cn,hl.cn,js.cn,zj.cn,ah.cn,gd.cn,gx.cn,hi.cn,sc.cn,gz.cn,yn.cn,xz.cn,sn.cn,gs.cn,qh.cn,nx.cn,xj.cn,tw.cn,hk.cn,mo.cn,tm.fr,com.fr,asso.fr,presse.fr,fr,co.il,net.il,ac.il,k12.il,gov.il,muni.il,ac.in,co.in,org.in,ernet.in,gov.in,net.in,res.in,ac.jp,co.jp,go.jp,or.jp,ne.jp,ac.kr,co.kr,go.kr,ne.kr,nm.kr,or.kr,asso.mc,tm.mc,com.mm,org.mm,net.mm,edu.mm,gov.mm,org.ro,store.ro,tm.ro,firm.ro,www.ro,arts.ro,rec.ro,info.ro,nom.ro,nt.ro,com.sg,org.sg,net.sg,gov.sg,ac.th,co.th,go.th,mi.th,net.th,or.th,com.tr,edu.tr,gov.tr,k12.tr,net.tr,org.tr,tv.tr,com.tw,org.tw,net.tw,com.hk,org.hk,net.hk,edu.hk,us,tk,cd,by,ad,lv,eu.lv,bz,es,jp,net,org,biz,ws,in,me,co,edu,mil,co.uk,org.uk,ltd.uk,plc.uk,me.uk,ac.uk,uk,se.net,uk.net,gb.net,af,am,as,at,be,ac.be,cc,cn,cx,cz,de,dk,fo,com.ec,gf,gs,is,it,li,lt,lu,ms,nl,no,nu,pl,ro,se,si,sk,st,tf,tm,to,vg,sh,kz,ch,info,ua,gov,name,pro,ie,hk,fi,pe,cl,ag,mobi,eu,co.nz,org.nz,net.nz,maori.nz,iwi.nz,io,la,md,sc,sg,vc,tw,travel,my,se,tv,pt,com.pt,edu.pt,asia,com.ve,net.ve,org.ve,web.ve,info.ve,co.ve,tel,im,gr,ru,net.ru,org.ru,hr,com.hr,aero,cat,coop,int,jobs,museum,xxx,com.qa,edu.qa,gov.qa,gov.au,com.my,edu.my,gov.my".split(",");if(t!="localhost"&&!parseInt(t.split(".").slice(-1)))for(var r=0,i,s,o;r<n.length;r++){i=n[r],o=new RegExp("\\.("+i.replace(".","\\.")+")$");if(o.test(t)){s=t.substring(0,t.indexOf("."+i)).split(".").slice(-1)[0],t=s+"."+i;break}}var u=0;for(var r=t.length-1;r>=0;r--)u+=t.charCodeAt(r)*2983723987;u=(""+u).substring(0,7);for(r=0;r<e.length;r++)if(u===e[r].substring(1,8))return 1}var n=jQuery,r=e.conf,i=r.swf.indexOf("flowplayer.org")&&r.e&&t.data("origin"),s=i?f(i):location.hostname,o=r.key;location.protocol=="file:"&&(s="localhost"),e.load.ed=1,r.hostname=s,r.origin=i||location.href,i&&t.addClass("is-embedded"),typeof o=="string"&&(o=o.split(/,\s*/));if(o&&typeof l=="function"&&l(o,s))r.logo&&t.append(n("<a>",{"class":"fp-logo",href:i}).append(n("<img/>",{src:r.logo})));else{var u=n("<a/>").attr("href","http://flowplayer.org").appendTo(t),a=n(".fp-controls",t);t.bind("mouseenter mouseleave",function(t){e.ready&&u.toggle(t.type=="mouseenter")}),e.bind("progress unload",function(n){n.type=="progress"&&e.video.time<8&&e.engine!="flash"&&t.hasClass("is-mouseover")?(u.show().css({position:"absolute",left:6,bottom:a.height()+12,zIndex:99999,width:100,height:20,cursor:"pointer",backgroundImage:"url(http://stream.flowplayer.org/logo.png)"}),e.load.ed=u.is(":visible")):u.hide()})}});

/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
/**
*  Ajax Autocomplete for jQuery, version 1.1.3
*  (c) 2010 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: http://www.devbridge.com/projects/autocomplete/jquery/
*
*  Last Review: 04/19/2010
*/

/*jslint onevar: true, evil: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, newcap: true, immed: true */
/*global window: true, document: true, clearInterval: true, setInterval: true, jQuery: true */

(function($) {

  var reEscape = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g');

  function fnFormatResult(value, data, currentValue) {
    var pattern = '(' + currentValue.replace(reEscape, '\\$1') + ')';
    return value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>');
  }

  function Autocomplete(el, options) {
    this.el = $(el);
    this.el.attr('autocomplete', 'off');
    this.suggestions = [];
    this.data = [];
    this.badQueries = [];
    this.selectedIndex = -1;
    this.currentValue = this.el.val();
    this.intervalId = 0;
    this.cachedResponse = [];
    this.onChangeInterval = null;
    this.ignoreValueChange = false;
    this.serviceUrl = options.serviceUrl;
    this.isLocal = false;
    this.options = {
      autoSubmit: false,
      minChars: 1,
      maxHeight: 300,
      deferRequestBy: 0,
      width: 0,
      highlight: true,
      params: {},
      fnFormatResult: fnFormatResult,
      delimiter: null,
      zIndex: 9999
    };
    this.initialize();
    this.setOptions(options);
  }
  
  $.fn.autocomplete = function(options) {
    return new Autocomplete(this.get(0)||$('<input />'), options);
  };


  Autocomplete.prototype = {

    killerFn: null,

    initialize: function() {

      var me, uid, autocompleteElId;
      me = this;
      uid = Math.floor(Math.random()*0x100000).toString(16);
      autocompleteElId = 'Autocomplete_' + uid;

      this.killerFn = function(e) {
        if ($(e.target).parents('.autocomplete').size() === 0) {
          me.killSuggestions();
          me.disableKillerFn();
        }
      };

      if (!this.options.width) { this.options.width = this.el.width(); }
      this.mainContainerId = 'AutocompleteContainter_' + uid;

      $('<div id="' + this.mainContainerId + '" style="position:absolute;z-index:9999;"><div class="autocomplete-w1"><div class="autocomplete" id="' + autocompleteElId + '" style="display:none; width:300px;"></div></div></div>').appendTo('body');

      this.container = $('#' + autocompleteElId);
      this.fixPosition();
      if (window.opera) {
        this.el.keypress(function(e) { me.onKeyPress(e); });
      } else {
        this.el.keydown(function(e) { me.onKeyPress(e); });
      }
      this.el.keyup(function(e) { me.onKeyUp(e); });
      this.el.blur(function() { me.enableKillerFn(); });
      this.el.focus(function() { me.fixPosition(); });
    },
    
    setOptions: function(options){
      var o = this.options;
      $.extend(o, options);
      if(o.lookup){
        this.isLocal = true;
        if($.isArray(o.lookup)){ o.lookup = { suggestions:o.lookup, data:[] }; }
      }
      $('#'+this.mainContainerId).css({ zIndex:o.zIndex });
      this.container.css({ maxHeight: o.maxHeight + 'px', width:o.width });
    },
    
    clearCache: function(){
      this.cachedResponse = [];
      this.badQueries = [];
    },
    
    disable: function(){
      this.disabled = true;
    },
    
    enable: function(){
      this.disabled = false;
    },

    fixPosition: function() {
      var offset = this.el.offset();
      $('#' + this.mainContainerId).css({ top: (offset.top + this.el.innerHeight()) + 'px', left: offset.left + 'px' });
    },

    enableKillerFn: function() {
      var me = this;
      $(document).bind('click', me.killerFn);
    },

    disableKillerFn: function() {
      var me = this;
      $(document).unbind('click', me.killerFn);
    },

    killSuggestions: function() {
      var me = this;
      this.stopKillSuggestions();
      this.intervalId = window.setInterval(function() { me.hide(); me.stopKillSuggestions(); }, 300);
    },

    stopKillSuggestions: function() {
      window.clearInterval(this.intervalId);
    },

    onKeyPress: function(e) {
      if (this.disabled || !this.enabled) { return; }
      // return will exit the function
      // and event will not be prevented
      switch (e.keyCode) {
        case 27: //KEY_ESC:
          this.el.val(this.currentValue);
          this.hide();
          break;
        case 9: //KEY_TAB:
        case 13: //KEY_RETURN:
          if (this.selectedIndex === -1) {
            this.hide();
            return;
          }
          this.select(this.selectedIndex);
          if(e.keyCode === 9){ return; }
          break;
        case 38: //KEY_UP:
          this.moveUp();
          break;
        case 40: //KEY_DOWN:
          this.moveDown();
          break;
        default:
          return;
      }
      e.stopImmediatePropagation();
      e.preventDefault();
    },

    onKeyUp: function(e) {
      if(this.disabled){ return; }
      switch (e.keyCode) {
        case 38: //KEY_UP:
        case 40: //KEY_DOWN:
          return;
      }
      clearInterval(this.onChangeInterval);
      if (this.currentValue !== this.el.val()) {
        if (this.options.deferRequestBy > 0) {
          // Defer lookup in case when value changes very quickly:
          var me = this;
          this.onChangeInterval = setInterval(function() { me.onValueChange(); }, this.options.deferRequestBy);
        } else {
          this.onValueChange();
        }
      }
    },

    onValueChange: function() {
      clearInterval(this.onChangeInterval);
      this.currentValue = this.el.val();
      var q = this.getQuery(this.currentValue);
      this.selectedIndex = -1;
      if (this.ignoreValueChange) {
        this.ignoreValueChange = false;
        return;
      }
      if (q === '' || q.length < this.options.minChars) {
        this.hide();
      } else {
        this.getSuggestions(q);
      }
    },

    getQuery: function(val) {
      var d, arr;
      d = this.options.delimiter;
      if (!d) { return $.trim(val); }
      arr = val.split(d);
      return $.trim(arr[arr.length - 1]);
    },

    getSuggestionsLocal: function(q) {
      var ret, arr, len, val, i;
      arr = this.options.lookup;
      len = arr.suggestions.length;
      ret = { suggestions:[], data:[] };
      q = q.toLowerCase();
      for(i=0; i< len; i++){
        val = arr.suggestions[i];
        if(val.toLowerCase().indexOf(q) === 0){
          ret.suggestions.push(val);
          ret.data.push(arr.data[i]);
        }
      }
      return ret;
    },
    
    getSuggestions: function(q) {
      var cr, me;
      cr = this.isLocal ? this.getSuggestionsLocal(q) : this.cachedResponse[q];
      if (cr && $.isArray(cr.suggestions)) {
        this.suggestions = cr.suggestions;
        this.data = cr.data;
        this.suggest();
      } else if (!this.isBadQuery(q)) {
        me = this;
        me.options.params.query = q;
        $.post(this.serviceUrl, me.options.params, function(txt) { me.processResponse(txt); }, 'text');
      }
    },

    isBadQuery: function(q) {
      var i = this.badQueries.length;
      while (i--) {
        if (q.indexOf(this.badQueries[i]) === 0) { return true; }
      }
      return false;
    },

    hide: function() {
      this.enabled = false;
      this.selectedIndex = -1;
      this.container.hide();
    },

    suggest: function() {
      if (this.suggestions.length === 0) {
        this.hide();
        return;
      }

      var me, len, div, f, v, i, s, mOver, mClick;
      me = this;
      len = this.suggestions.length;
      f = this.options.fnFormatResult;
      v = this.getQuery(this.currentValue);
      mOver = function(xi) { return function() { me.activate(xi); }; };
      mClick = function(xi) { return function() { me.select(xi); }; };
      this.container.hide().empty();
      for (i = 0; i < len; i++) {
        s = this.suggestions[i];
        div = $((me.selectedIndex === i ? '<div class="selected"' : '<div') + ' title="' + s + '">' + f(s, this.data[i], v) + '</div>');
        div.mouseover(mOver(i));
        div.click(mClick(i));
        this.container.append(div);
      }
      this.enabled = true;
      this.container.show();
    },

    processResponse: function(text) {
      var response;
      try {
        response = eval('(' + text + ')');
      } catch (err) { return; }
      if (!$.isArray(response.data)) { response.data = []; }
      if(!this.options.noCache){
        this.cachedResponse[response.query] = response;
        if (response.suggestions.length === 0) { this.badQueries.push(response.query); }
      }
      if (response.query === this.getQuery(this.currentValue)) {
        this.suggestions = response.suggestions;
        this.data = response.data;
        this.suggest(); 
      }
    },

    activate: function(index) {
      var divs, activeItem;
      divs = this.container.children();
      // Clear previous selection:
      if (this.selectedIndex !== -1 && divs.length > this.selectedIndex) {
        $(divs.get(this.selectedIndex)).removeClass();
      }
      this.selectedIndex = index;
      if (this.selectedIndex !== -1 && divs.length > this.selectedIndex) {
        activeItem = divs.get(this.selectedIndex);
        $(activeItem).addClass('selected');
      }
      return activeItem;
    },

    deactivate: function(div, index) {
      div.className = '';
      if (this.selectedIndex === index) { this.selectedIndex = -1; }
    },

    select: function(i) {
      var selectedValue, f;
      selectedValue = this.suggestions[i];
      if (selectedValue) {
        this.el.val(selectedValue);
        if (this.options.autoSubmit) {
          f = this.el.parents('form');
          if (f.length > 0) { f.get(0).submit(); }
        }
        this.ignoreValueChange = true;
        this.hide();
        this.onSelect(i);
      }
    },

    moveUp: function() {
      if (this.selectedIndex === -1) { return; }
      if (this.selectedIndex === 0) {
        this.container.children().get(0).className = '';
        this.selectedIndex = -1;
        this.el.val(this.currentValue);
        return;
      }
      this.adjustScroll(this.selectedIndex - 1);
    },

    moveDown: function() {
      if (this.selectedIndex === (this.suggestions.length - 1)) { return; }
      this.adjustScroll(this.selectedIndex + 1);
    },

    adjustScroll: function(i) {
      var activeItem, offsetTop, upperBound, lowerBound;
      activeItem = this.activate(i);
      offsetTop = activeItem.offsetTop;
      upperBound = this.container.scrollTop();
      lowerBound = upperBound + this.options.maxHeight - 25;
      if (offsetTop < upperBound) {
        this.container.scrollTop(offsetTop);
      } else if (offsetTop > lowerBound) {
        this.container.scrollTop(offsetTop - this.options.maxHeight + 25);
      }
      this.el.val(this.getValue(this.suggestions[i]));
    },

    onSelect: function(i) {
      var me, fn, s, d;
      me = this;
      fn = me.options.onSelect;
      s = me.suggestions[i];
      d = me.data[i];
      me.el.val(me.getValue(s));
      if ($.isFunction(fn)) { fn(s, d, me.el); }
    },
    
    getValue: function(value){
        var del, currVal, arr, me;
        me = this;
        del = me.options.delimiter;
        if (!del) { return value; }
        currVal = me.currentValue;
        arr = currVal.split(del);
        if (arr.length === 1) { return value; }
        return currVal.substr(0, currVal.length - arr[arr.length - 1].length) + value;
    }

  };

}(jQuery));

/*jshint eqnull:true */
/*!
 * jQuery Cookie Plugin v1.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function($, document) {

	var pluses = /\+/g;
	function raw(s) {
		return s;
	}
	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	$.cookie = function(key, value, options) {

		// key and at least value given, set cookie...
		if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value == null)) {
			options = $.extend({}, $.cookie.defaults, options);

			if (value == null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// key and possibly options given, get cookie...
		options = value || $.cookie.defaults || {};
		var decode = options.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, parts; (parts = cookies[i] && cookies[i].split('=')); i++) {
			if (decode(parts.shift()) === key) {
				return decode(parts.join('='));
			}
		}
		return null;
	};

	$.cookie.defaults = {};

})(jQuery, document);

/*
* Slides, A Slideshow Plugin for jQuery
* Intructions: http://slidesjs.com
* By: Nathan Searles, http://nathansearles.com
* Version: 1.1.9
* Updated: September 5th, 2011
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
(function(a){a.fn.slides=function(b){return b=a.extend({},a.fn.slides.option,b),this.each(function(){function w(g,h,i){if(!p&&o){p=!0,b.animationStart(n+1);switch(g){case"next":l=n,k=n+1,k=e===k?0:k,r=f*2,g=-f*2,n=k;break;case"prev":l=n,k=n-1,k=k===-1?e-1:k,r=0,g=0,n=k;break;case"pagination":k=parseInt(i,10),l=a("."+b.paginationClass+" li."+b.currentClass+" a",c).attr("href").match("[^#/]+$"),k>l?(r=f*2,g=-f*2):(r=0,g=0),n=k}h==="fade"?b.crossfade?d.children(":eq("+k+")",c).css({zIndex:10}).fadeIn(b.fadeSpeed,b.fadeEasing,function(){b.autoHeight?d.animate({height:d.children(":eq("+k+")",c).outerHeight()},b.autoHeightSpeed,function(){d.children(":eq("+l+")",c).css({display:"none",zIndex:0}),d.children(":eq("+k+")",c).css({zIndex:0}),b.animationComplete(k+1),p=!1}):(d.children(":eq("+l+")",c).css({display:"none",zIndex:0}),d.children(":eq("+k+")",c).css({zIndex:0}),b.animationComplete(k+1),p=!1)}):d.children(":eq("+l+")",c).fadeOut(b.fadeSpeed,b.fadeEasing,function(){b.autoHeight?d.animate({height:d.children(":eq("+k+")",c).outerHeight()},b.autoHeightSpeed,function(){d.children(":eq("+k+")",c).fadeIn(b.fadeSpeed,b.fadeEasing)}):d.children(":eq("+k+")",c).fadeIn(b.fadeSpeed,b.fadeEasing,function(){a.browser.msie&&a(this).get(0).style.removeAttribute("filter")}),b.animationComplete(k+1),p=!1}):(d.children(":eq("+k+")").css({left:r,display:"block"}),b.autoHeight?d.animate({left:g,height:d.children(":eq("+k+")").outerHeight()},b.slideSpeed,b.slideEasing,function(){d.css({left:-f}),d.children(":eq("+k+")").css({left:f,zIndex:5}),d.children(":eq("+l+")").css({left:f,display:"none",zIndex:0}),b.animationComplete(k+1),p=!1}):d.animate({left:g},b.slideSpeed,b.slideEasing,function(){d.css({left:-f}),d.children(":eq("+k+")").css({left:f,zIndex:5}),d.children(":eq("+l+")").css({left:f,display:"none",zIndex:0}),b.animationComplete(k+1),p=!1})),b.pagination&&(a("."+b.paginationClass+" li."+b.currentClass,c).removeClass(b.currentClass),a("."+b.paginationClass+" li:eq("+k+")",c).addClass(b.currentClass))}}function x(){clearInterval(c.data("interval"))}function y(){b.pause?(clearTimeout(c.data("pause")),clearInterval(c.data("interval")),u=setTimeout(function(){clearTimeout(c.data("pause")),v=setInterval(function(){w("next",i)},b.play),c.data("interval",v)},b.pause),c.data("pause",u)):x()}a("."+b.container,a(this)).children().wrapAll('<div class="slides_control"/>');var c=a(this),d=a(".slides_control",c),e=d.children().size(),f=d.children().outerWidth(),g=d.children().outerHeight(),h=b.start-1,i=b.effect.indexOf(",")<0?b.effect:b.effect.replace(" ","").split(",")[0],j=b.effect.indexOf(",")<0?i:b.effect.replace(" ","").split(",")[1],k=0,l=0,m=0,n=0,o,p,q,r,s,t,u,v;if(e<2)return a("."+b.container,a(this)).fadeIn(b.fadeSpeed,b.fadeEasing,function(){o=!0,b.slidesLoaded()}),a("."+b.next+", ."+b.prev).fadeOut(0),!1;if(e<2)return;h<0&&(h=0),h>e&&(h=e-1),b.start&&(n=h),b.randomize&&d.randomize(),a("."+b.container,c).css({overflow:"hidden",position:"relative"}),d.children().css({position:"absolute",top:0,left:d.children().outerWidth(),zIndex:0,display:"none"}),d.css({position:"relative",width:f*3,height:g,left:-f}),a("."+b.container,c).css({display:"block"}),b.autoHeight&&(d.children().css({height:"auto"}),d.animate({height:d.children(":eq("+h+")").outerHeight()},b.autoHeightSpeed));if(b.preload&&d.find("img:eq("+h+")").length){a("."+b.container,c).css({background:"url("+b.preloadImage+") no-repeat 50% 50%"});var z=d.find("img:eq("+h+")").attr("src")+"?"+(new Date).getTime();a("img",c).parent().attr("class")!="slides_control"?t=d.children(":eq(0)")[0].tagName.toLowerCase():t=d.find("img:eq("+h+")"),d.find("img:eq("+h+")").attr("src",z).load(function(){d.find(t+":eq("+h+")").fadeIn(b.fadeSpeed,b.fadeEasing,function(){a(this).css({zIndex:5}),a("."+b.container,c).css({background:""}),o=!0,b.slidesLoaded()})})}else d.children(":eq("+h+")").fadeIn(b.fadeSpeed,b.fadeEasing,function(){o=!0,b.slidesLoaded()});b.bigTarget&&(d.children().css({cursor:"pointer"}),d.children().click(function(){return w("next",i),!1})),b.hoverPause&&b.play&&(d.bind("mouseover",function(){x()}),d.bind("mouseleave",function(){y()})),b.generateNextPrev&&(a("."+b.container,c).after('<a href="#" class="'+b.prev+'">Prev</a>'),a("."+b.prev,c).after('<a href="#" class="'+b.next+'">Next</a>')),a("."+b.next,c).click(function(a){a.preventDefault(),b.play&&y(),w("next",i)}),a("."+b.prev,c).click(function(a){a.preventDefault(),b.play&&y(),w("prev",i)}),b.generatePagination?(b.prependPagination?c.prepend("<ul class="+b.paginationClass+"></ul>"):c.append("<ul class="+b.paginationClass+"></ul>"),d.children().each(function(){a("."+b.paginationClass,c).append('<li><a href="#'+m+'">'+(m+1)+"</a></li>"),m++})):a("."+b.paginationClass+" li a",c).each(function(){a(this).attr("href","#"+m),m++}),a("."+b.paginationClass+" li:eq("+h+")",c).addClass(b.currentClass),a("."+b.paginationClass+" li a",c).click(function(){return b.play&&y(),q=a(this).attr("href").match("[^#/]+$"),n!=q&&w("pagination",j,q),!1}),a("a.link",c).click(function(){return b.play&&y(),q=a(this).attr("href").match("[^#/]+$")-1,n!=q&&w("pagination",j,q),!1}),b.play&&(v=setInterval(function(){w("next",i)},b.play),c.data("interval",v))})},a.fn.slides.option={preload:!1,preloadImage:"/img/loading.gif",container:"slides_container",generateNextPrev:!1,next:"next",prev:"prev",pagination:!0,generatePagination:!0,prependPagination:!1,paginationClass:"pagination",currentClass:"current",fadeSpeed:350,fadeEasing:"",slideSpeed:350,slideEasing:"",start:1,effect:"slide",crossfade:!1,randomize:!1,play:0,pause:0,hoverPause:!1,autoHeight:!1,autoHeightSpeed:350,bigTarget:!1,animationStart:function(){},animationComplete:function(){},slidesLoaded:function(){}},a.fn.randomize=function(b){function c(){return Math.round(Math.random())-.5}return a(this).each(function(){var d=a(this),e=d.children(),f=e.length;if(f>1){e.hide();var g=[];for(i=0;i<f;i++)g[g.length]=i;g=g.sort(c),a.each(g,function(a,c){var f=e.eq(c),g=f.clone(!0);g.show().appendTo(d),b!==undefined&&b(f,g),f.remove()})}})}})(jQuery);
/*! jQuery UI - v1.9.0 - 2012-10-05
* http://jqueryui.com
* Includes: jquery.ui.core.js
* Copyright 2012 jQuery Foundation and other contributors; Licensed MIT */
(function(e,t){function i(t,n){var r,i,o,u=t.nodeName.toLowerCase();return"area"===u?(r=t.parentNode,i=r.name,!t.href||!i||r.nodeName.toLowerCase()!=="map"?!1:(o=e("img[usemap=#"+i+"]")[0],!!o&&s(o))):(/input|select|textarea|button|object/.test(u)?!t.disabled:"a"===u?t.href||n:n)&&s(t)}function s(t){return!e(t).parents().andSelf().filter(function(){return e.css(this,"visibility")==="hidden"||e.expr.filters.hidden(this)}).length}var n=0,r=/^ui-id-\d+$/;e.ui=e.ui||{};if(e.ui.version)return;e.extend(e.ui,{version:"1.9.0",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({_focus:e.fn.focus,focus:function(t,n){return typeof t=="number"?this.each(function(){var r=this;setTimeout(function(){e(r).focus(),n&&n.call(r)},t)}):this._focus.apply(this,arguments)},scrollParent:function(){var t;return e.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?t=this.parents().filter(function(){return/(relative|absolute|fixed)/.test(e.css(this,"position"))&&/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0):t=this.parents().filter(function(){return/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!t.length?e(document):t},zIndex:function(n){if(n!==t)return this.css("zIndex",n);if(this.length){var r=e(this[0]),i,s;while(r.length&&r[0]!==document){i=r.css("position");if(i==="absolute"||i==="relative"||i==="fixed"){s=parseInt(r.css("zIndex"),10);if(!isNaN(s)&&s!==0)return s}r=r.parent()}}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++n)})},removeUniqueId:function(){return this.each(function(){r.test(this.id)&&e(this).removeAttr("id")})}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(n,r){function u(t,n,r,s){return e.each(i,function(){n-=parseFloat(e.css(t,"padding"+this))||0,r&&(n-=parseFloat(e.css(t,"border"+this+"Width"))||0),s&&(n-=parseFloat(e.css(t,"margin"+this))||0)}),n}var i=r==="Width"?["Left","Right"]:["Top","Bottom"],s=r.toLowerCase(),o={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+r]=function(n){return n===t?o["inner"+r].call(this):this.each(function(){e(this).css(s,u(this,n)+"px")})},e.fn["outer"+r]=function(t,n){return typeof t!="number"?o["outer"+r].call(this,t):this.each(function(){e(this).css(s,u(this,t,!0,n)+"px")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(n){return!!e.data(n,t)}}):function(t,n,r){return!!e.data(t,r[3])},focusable:function(t){return i(t,!isNaN(e.attr(t,"tabindex")))},tabbable:function(t){var n=e.attr(t,"tabindex"),r=isNaN(n);return(r||n>=0)&&i(t,!r)}}),e(function(){var t=document.body,n=t.appendChild(n=document.createElement("div"));n.offsetHeight,e.extend(n.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0}),e.support.minHeight=n.offsetHeight===100,e.support.selectstart="onselectstart"in n,t.removeChild(n).style.display="none"}),e.fn.extend({disableSelection:function(){return this.bind((e.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),e.extend(e.ui,{plugin:{add:function(t,n,r){var i,s=e.ui[t].prototype;for(i in r)s.plugins[i]=s.plugins[i]||[],s.plugins[i].push([n,r[i]])},call:function(e,t,n){var r,i=e.plugins[t];if(!i||!e.element[0].parentNode||e.element[0].parentNode.nodeType===11)return;for(r=0;r<i.length;r++)e.options[i[r][0]]&&i[r][1].apply(e.element,n)}},contains:e.contains,hasScroll:function(t,n){if(e(t).css("overflow")==="hidden")return!1;var r=n&&n==="left"?"scrollLeft":"scrollTop",i=!1;return t[r]>0?!0:(t[r]=1,i=t[r]>0,t[r]=0,i)},isOverAxis:function(e,t,n){return e>t&&e<t+n},isOver:function(t,n,r,i,s,o){return e.ui.isOverAxis(t,r,s)&&e.ui.isOverAxis(n,i,o)}})})(jQuery);
/*! jQuery UI - v1.9.0 - 2012-10-05
* http://jqueryui.com
* Includes: jquery.ui.position.js
* Copyright 2012 jQuery Foundation and other contributors; Licensed MIT */
(function(e,t){function h(e,t,n){return[parseInt(e[0],10)*(l.test(e[0])?t/100:1),parseInt(e[1],10)*(l.test(e[1])?n/100:1)]}function p(t,n){return parseInt(e.css(t,n),10)||0}e.ui=e.ui||{};var n,r=Math.max,i=Math.abs,s=Math.round,o=/left|center|right/,u=/top|center|bottom/,a=/[\+\-]\d+%?/,f=/^\w+/,l=/%$/,c=e.fn.position;e.position={scrollbarWidth:function(){if(n!==t)return n;var r,i,s=e("<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),o=s.children()[0];return e("body").append(s),r=o.offsetWidth,s.css("overflow","scroll"),i=o.offsetWidth,r===i&&(i=s[0].clientWidth),s.remove(),n=r-i},getScrollInfo:function(t){var n=t.isWindow?"":t.element.css("overflow-x"),r=t.isWindow?"":t.element.css("overflow-y"),i=n==="scroll"||n==="auto"&&t.width<t.element[0].scrollWidth,s=r==="scroll"||r==="auto"&&t.height<t.element[0].scrollHeight;return{width:i?e.position.scrollbarWidth():0,height:s?e.position.scrollbarWidth():0}},getWithinInfo:function(t){var n=e(t||window),r=e.isWindow(n[0]);return{element:n,isWindow:r,offset:n.offset()||{left:0,top:0},scrollLeft:n.scrollLeft(),scrollTop:n.scrollTop(),width:r?n.width():n.outerWidth(),height:r?n.height():n.outerHeight()}}},e.fn.position=function(t){if(!t||!t.of)return c.apply(this,arguments);t=e.extend({},t);var n,l,d,v,m,g=e(t.of),y=e.position.getWithinInfo(t.within),b=e.position.getScrollInfo(y),w=g[0],E=(t.collision||"flip").split(" "),S={};return w.nodeType===9?(l=g.width(),d=g.height(),v={top:0,left:0}):e.isWindow(w)?(l=g.width(),d=g.height(),v={top:g.scrollTop(),left:g.scrollLeft()}):w.preventDefault?(t.at="left top",l=d=0,v={top:w.pageY,left:w.pageX}):(l=g.outerWidth(),d=g.outerHeight(),v=g.offset()),m=e.extend({},v),e.each(["my","at"],function(){var e=(t[this]||"").split(" "),n,r;e.length===1&&(e=o.test(e[0])?e.concat(["center"]):u.test(e[0])?["center"].concat(e):["center","center"]),e[0]=o.test(e[0])?e[0]:"center",e[1]=u.test(e[1])?e[1]:"center",n=a.exec(e[0]),r=a.exec(e[1]),S[this]=[n?n[0]:0,r?r[0]:0],t[this]=[f.exec(e[0])[0],f.exec(e[1])[0]]}),E.length===1&&(E[1]=E[0]),t.at[0]==="right"?m.left+=l:t.at[0]==="center"&&(m.left+=l/2),t.at[1]==="bottom"?m.top+=d:t.at[1]==="center"&&(m.top+=d/2),n=h(S.at,l,d),m.left+=n[0],m.top+=n[1],this.each(function(){var o,u,a=e(this),f=a.outerWidth(),c=a.outerHeight(),w=p(this,"marginLeft"),x=p(this,"marginTop"),T=f+w+p(this,"marginRight")+b.width,N=c+x+p(this,"marginBottom")+b.height,C=e.extend({},m),k=h(S.my,a.outerWidth(),a.outerHeight());t.my[0]==="right"?C.left-=f:t.my[0]==="center"&&(C.left-=f/2),t.my[1]==="bottom"?C.top-=c:t.my[1]==="center"&&(C.top-=c/2),C.left+=k[0],C.top+=k[1],e.support.offsetFractions||(C.left=s(C.left),C.top=s(C.top)),o={marginLeft:w,marginTop:x},e.each(["left","top"],function(r,i){e.ui.position[E[r]]&&e.ui.position[E[r]][i](C,{targetWidth:l,targetHeight:d,elemWidth:f,elemHeight:c,collisionPosition:o,collisionWidth:T,collisionHeight:N,offset:[n[0]+k[0],n[1]+k[1]],my:t.my,at:t.at,within:y,elem:a})}),e.fn.bgiframe&&a.bgiframe(),t.using&&(u=function(e){var n=v.left-C.left,s=n+l-f,o=v.top-C.top,u=o+d-c,h={target:{element:g,left:v.left,top:v.top,width:l,height:d},element:{element:a,left:C.left,top:C.top,width:f,height:c},horizontal:s<0?"left":n>0?"right":"center",vertical:u<0?"top":o>0?"bottom":"middle"};l<f&&i(n+s)<l&&(h.horizontal="center"),d<c&&i(o+u)<d&&(h.vertical="middle"),r(i(n),i(s))>r(i(o),i(u))?h.important="horizontal":h.important="vertical",t.using.call(this,e,h)}),a.offset(e.extend(C,{using:u}))})},e.ui.position={fit:{left:function(e,t){var n=t.within,i=n.isWindow?n.scrollLeft:n.offset.left,s=n.width,o=e.left-t.collisionPosition.marginLeft,u=i-o,a=o+t.collisionWidth-s-i,f;t.collisionWidth>s?u>0&&a<=0?(f=e.left+u+t.collisionWidth-s-i,e.left+=u-f):a>0&&u<=0?e.left=i:u>a?e.left=i+s-t.collisionWidth:e.left=i:u>0?e.left+=u:a>0?e.left-=a:e.left=r(e.left-o,e.left)},top:function(e,t){var n=t.within,i=n.isWindow?n.scrollTop:n.offset.top,s=t.within.height,o=e.top-t.collisionPosition.marginTop,u=i-o,a=o+t.collisionHeight-s-i,f;t.collisionHeight>s?u>0&&a<=0?(f=e.top+u+t.collisionHeight-s-i,e.top+=u-f):a>0&&u<=0?e.top=i:u>a?e.top=i+s-t.collisionHeight:e.top=i:u>0?e.top+=u:a>0?e.top-=a:e.top=r(e.top-o,e.top)}},flip:{left:function(e,t){var n=t.within,r=n.offset.left+n.scrollLeft,s=n.width,o=n.isWindow?n.scrollLeft:n.offset.left,u=e.left-t.collisionPosition.marginLeft,a=u-o,f=u+t.collisionWidth-s-o,l=t.my[0]==="left"?-t.elemWidth:t.my[0]==="right"?t.elemWidth:0,c=t.at[0]==="left"?t.targetWidth:t.at[0]==="right"?-t.targetWidth:0,h=-2*t.offset[0],p,d;if(a<0){p=e.left+l+c+h+t.collisionWidth-s-r;if(p<0||p<i(a))e.left+=l+c+h}else if(f>0){d=e.left-t.collisionPosition.marginLeft+l+c+h-o;if(d>0||i(d)<f)e.left+=l+c+h}},top:function(e,t){var n=t.within,r=n.offset.top+n.scrollTop,s=n.height,o=n.isWindow?n.scrollTop:n.offset.top,u=e.top-t.collisionPosition.marginTop,a=u-o,f=u+t.collisionHeight-s-o,l=t.my[1]==="top",c=l?-t.elemHeight:t.my[1]==="bottom"?t.elemHeight:0,h=t.at[1]==="top"?t.targetHeight:t.at[1]==="bottom"?-t.targetHeight:0,p=-2*t.offset[1],d,v;a<0?(v=e.top+c+h+p+t.collisionHeight-s-r,e.top+c+h+p>a&&(v<0||v<i(a))&&(e.top+=c+h+p)):f>0&&(d=e.top-t.collisionPosition.marginTop+c+h+p-o,e.top+c+h+p>f&&(d>0||i(d)<f)&&(e.top+=c+h+p))}},flipfit:{left:function(){e.ui.position.flip.left.apply(this,arguments),e.ui.position.fit.left.apply(this,arguments)},top:function(){e.ui.position.flip.top.apply(this,arguments),e.ui.position.fit.top.apply(this,arguments)}}},function(){var t,n,r,i,s,o=document.getElementsByTagName("body")[0],u=document.createElement("div");t=document.createElement(o?"div":"body"),r={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},o&&e.extend(r,{position:"absolute",left:"-1000px",top:"-1000px"});for(s in r)t.style[s]=r[s];t.appendChild(u),n=o||document.documentElement,n.insertBefore(t,n.firstChild),u.style.cssText="position: absolute; left: 10.7432222px;",i=e(u).offset().left,e.support.offsetFractions=i>10&&i<11,t.innerHTML="",n.removeChild(t)}(),e.uiBackCompat!==!1&&function(e){var n=e.fn.position;e.fn.position=function(r){if(!r||!r.offset)return n.call(this,r);var i=r.offset.split(" "),s=r.at.split(" ");return i.length===1&&(i[1]=i[0]),/^\d/.test(i[0])&&(i[0]="+"+i[0]),/^\d/.test(i[1])&&(i[1]="+"+i[1]),s.length===1&&(/left|center|right/.test(s[0])?s[1]="center":(s[1]=s[0],s[0]="center")),n.call(this,e.extend(r,{at:s[0]+i[0]+" "+s[1]+i[1],offset:t}))}}(jQuery)})(jQuery);
/*! jQuery UI - v1.9.0 - 2012-10-05
* http://jqueryui.com
* Includes: jquery.ui.widget.js
* Copyright 2012 jQuery Foundation and other contributors; Licensed MIT */
(function(e,t){var n=0,r=Array.prototype.slice,i=e.cleanData;e.cleanData=function(t){for(var n=0,r;(r=t[n])!=null;n++)try{e(r).triggerHandler("remove")}catch(s){}i(t)},e.widget=function(t,n,r){var i,s,o,u,a=t.split(".")[0];t=t.split(".")[1],i=a+"-"+t,r||(r=n,n=e.Widget),e.expr[":"][i.toLowerCase()]=function(t){return!!e.data(t,i)},e[a]=e[a]||{},s=e[a][t],o=e[a][t]=function(e,t){if(!this._createWidget)return new o(e,t);arguments.length&&this._createWidget(e,t)},e.extend(o,s,{version:r.version,_proto:e.extend({},r),_childConstructors:[]}),u=new n,u.options=e.widget.extend({},u.options),e.each(r,function(t,i){e.isFunction(i)&&(r[t]=function(){var e=function(){return n.prototype[t].apply(this,arguments)},r=function(e){return n.prototype[t].apply(this,e)};return function(){var t=this._super,n=this._superApply,s;return this._super=e,this._superApply=r,s=i.apply(this,arguments),this._super=t,this._superApply=n,s}}())}),o.prototype=e.widget.extend(u,{widgetEventPrefix:t},r,{constructor:o,namespace:a,widgetName:t,widgetBaseClass:i,widgetFullName:i}),s?(e.each(s._childConstructors,function(t,n){var r=n.prototype;e.widget(r.namespace+"."+r.widgetName,o,n._proto)}),delete s._childConstructors):n._childConstructors.push(o),e.widget.bridge(t,o)},e.widget.extend=function(n){var i=r.call(arguments,1),s=0,o=i.length,u,a;for(;s<o;s++)for(u in i[s])a=i[s][u],i[s].hasOwnProperty(u)&&a!==t&&(n[u]=e.isPlainObject(a)?e.widget.extend({},n[u],a):a);return n},e.widget.bridge=function(n,i){var s=i.prototype.widgetFullName;e.fn[n]=function(o){var u=typeof o=="string",a=r.call(arguments,1),f=this;return o=!u&&a.length?e.widget.extend.apply(null,[o].concat(a)):o,u?this.each(function(){var r,i=e.data(this,s);if(!i)return e.error("cannot call methods on "+n+" prior to initialization; "+"attempted to call method '"+o+"'");if(!e.isFunction(i[o])||o.charAt(0)==="_")return e.error("no such method '"+o+"' for "+n+" widget instance");r=i[o].apply(i,a);if(r!==i&&r!==t)return f=r&&r.jquery?f.pushStack(r.get()):r,!1}):this.each(function(){var t=e.data(this,s);t?t.option(o||{})._init():new i(o,this)}),f}},e.Widget=function(e,t){},e.Widget._childConstructors=[],e.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(t,r){r=e(r||this.defaultElement||this)[0],this.element=e(r),this.uuid=n++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=e.widget.extend({},this.options,this._getCreateOptions(),t),this.bindings=e(),this.hoverable=e(),this.focusable=e(),r!==this&&(e.data(r,this.widgetName,this),e.data(r,this.widgetFullName,this),this._on({remove:"destroy"}),this.document=e(r.style?r.ownerDocument:r.document||r),this.window=e(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:e.noop,_getCreateEventData:e.noop,_create:e.noop,_init:e.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:e.noop,widget:function(){return this.element},option:function(n,r){var i=n,s,o,u;if(arguments.length===0)return e.widget.extend({},this.options);if(typeof n=="string"){i={},s=n.split("."),n=s.shift();if(s.length){o=i[n]=e.widget.extend({},this.options[n]);for(u=0;u<s.length-1;u++)o[s[u]]=o[s[u]]||{},o=o[s[u]];n=s.pop();if(r===t)return o[n]===t?null:o[n];o[n]=r}else{if(r===t)return this.options[n]===t?null:this.options[n];i[n]=r}}return this._setOptions(i),this},_setOptions:function(e){var t;for(t in e)this._setOption(t,e[t]);return this},_setOption:function(e,t){return this.options[e]=t,e==="disabled"&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!t).attr("aria-disabled",t),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(t,n){n?(t=e(t),this.bindings=this.bindings.add(t)):(n=t,t=this.element);var r=this;e.each(n,function(n,i){function s(){if(r.options.disabled===!0||e(this).hasClass("ui-state-disabled"))return;return(typeof i=="string"?r[i]:i).apply(r,arguments)}typeof i!="string"&&(s.guid=i.guid=i.guid||s.guid||e.guid++);var o=n.match(/^(\w+)\s*(.*)$/),u=o[1]+r.eventNamespace,a=o[2];a?r.widget().delegate(a,u,s):t.bind(u,s)})},_off:function(e,t){t=(t||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.unbind(t).undelegate(t)},_delay:function(e,t){function n(){return(typeof e=="string"?r[e]:e).apply(r,arguments)}var r=this;return setTimeout(n,t||0)},_hoverable:function(t){this.hoverable=this.hoverable.add(t),this._on(t,{mouseenter:function(t){e(t.currentTarget).addClass("ui-state-hover")},mouseleave:function(t){e(t.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(t){this.focusable=this.focusable.add(t),this._on(t,{focusin:function(t){e(t.currentTarget).addClass("ui-state-focus")},focusout:function(t){e(t.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(t,n,r){var i,s,o=this.options[t];r=r||{},n=e.Event(n),n.type=(t===this.widgetEventPrefix?t:this.widgetEventPrefix+t).toLowerCase(),n.target=this.element[0],s=n.originalEvent;if(s)for(i in s)i in n||(n[i]=s[i]);return this.element.trigger(n,r),!(e.isFunction(o)&&o.apply(this.element[0],[n].concat(r))===!1||n.isDefaultPrevented())}},e.each({show:"fadeIn",hide:"fadeOut"},function(t,n){e.Widget.prototype["_"+t]=function(r,i,s){typeof i=="string"&&(i={effect:i});var o,u=i?i===!0||typeof i=="number"?n:i.effect||n:t;i=i||{},typeof i=="number"&&(i={duration:i}),o=!e.isEmptyObject(i),i.complete=s,i.delay&&r.delay(i.delay),o&&e.effects&&(e.effects.effect[u]||e.uiBackCompat!==!1&&e.effects[u])?r[t](i):u!==t&&r[u]?r[u](i.duration,i.easing,s):r.queue(function(n){e(this)[t](),s&&s.call(r[0]),n()})}}),e.uiBackCompat!==!1&&(e.Widget.prototype._getCreateOptions=function(){return e.metadata&&e.metadata.get(this.element[0])[this.widgetName]})})(jQuery);
/*! jQuery UI - v1.9.0 - 2012-10-05
* http://jqueryui.com
* Includes: jquery.ui.dialog.js
* Copyright 2012 jQuery Foundation and other contributors; Licensed MIT */
(function(e,t){var n="ui-dialog ui-widget ui-widget-content ui-corner-all ",r={buttons:!0,height:!0,maxHeight:!0,maxWidth:!0,minHeight:!0,minWidth:!0,width:!0},i={maxHeight:!0,maxWidth:!0,minHeight:!0,minWidth:!0};e.widget("ui.dialog",{version:"1.9.0",options:{autoOpen:!0,buttons:{},closeOnEscape:!0,closeText:"close",dialogClass:"",draggable:!0,hide:null,height:"auto",maxHeight:!1,maxWidth:!1,minHeight:150,minWidth:150,modal:!1,position:{my:"center",at:"center",of:window,collision:"fit",using:function(t){var n=e(this).css(t).offset().top;n<0&&e(this).css("top",t.top-n)}},resizable:!0,show:null,stack:!0,title:"",width:300,zIndex:1e3},_create:function(){this.originalTitle=this.element.attr("title"),typeof this.originalTitle!="string"&&(this.originalTitle=""),this.oldPosition={parent:this.element.parent(),index:this.element.parent().children().index(this.element)},this.options.title=this.options.title||this.originalTitle;var t=this,r=this.options,i=r.title||"&#160;",s=(this.uiDialog=e("<div>")).addClass(n+r.dialogClass).css({display:"none",outline:0,zIndex:r.zIndex}).attr("tabIndex",-1).keydown(function(n){r.closeOnEscape&&!n.isDefaultPrevented()&&n.keyCode&&n.keyCode===e.ui.keyCode.ESCAPE&&(t.close(n),n.preventDefault())}).mousedown(function(e){t.moveToTop(!1,e)}).appendTo("body"),o=this.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(s),u=(this.uiDialogTitlebar=e("<div>")).addClass("ui-dialog-titlebar  ui-widget-header  ui-corner-all  ui-helper-clearfix").prependTo(s),a=e("<a href='#'></a>").addClass("ui-dialog-titlebar-close  ui-corner-all").attr("role","button").click(function(e){e.preventDefault(),t.close(e)}).appendTo(u),f=(this.uiDialogTitlebarCloseText=e("<span>")).addClass("ui-icon ui-icon-closethick").text(r.closeText).appendTo(a),l=e("<span>").uniqueId().addClass("ui-dialog-title").html(i).prependTo(u),c=(this.uiDialogButtonPane=e("<div>")).addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"),h=(this.uiButtonSet=e("<div>")).addClass("ui-dialog-buttonset").appendTo(c);s.attr({role:"dialog","aria-labelledby":l.attr("id")}),u.find("*").add(u).disableSelection(),this._hoverable(a),this._focusable(a),r.draggable&&e.fn.draggable&&this._makeDraggable(),r.resizable&&e.fn.resizable&&this._makeResizable(),this._createButtons(r.buttons),this._isOpen=!1,e.fn.bgiframe&&s.bgiframe(),this._on(s,{keydown:function(t){if(!r.modal||t.keyCode!==e.ui.keyCode.TAB)return;var n=e(":tabbable",s),i=n.filter(":first"),o=n.filter(":last");if(t.target===o[0]&&!t.shiftKey)return i.focus(1),!1;if(t.target===i[0]&&t.shiftKey)return o.focus(1),!1}})},_init:function(){this.options.autoOpen&&this.open()},_destroy:function(){var e,t=this.oldPosition;this.overlay&&this.overlay.destroy(),this.uiDialog.hide(),this.element.removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body"),this.uiDialog.remove(),this.originalTitle&&this.element.attr("title",this.originalTitle),e=t.parent.children().eq(t.index),e.length&&e[0]!==this.element[0]?e.before(this.element):t.parent.append(this.element)},widget:function(){return this.uiDialog},close:function(t){var n=this,r,i;if(!this._isOpen)return;if(!1===this._trigger("beforeClose",t))return;return this._isOpen=!1,this.overlay&&this.overlay.destroy(),this.options.hide?this.uiDialog.hide(this.options.hide,function(){n._trigger("close",t)}):(this.uiDialog.hide(),this._trigger("close",t)),e.ui.dialog.overlay.resize(),this.options.modal&&(r=0,e(".ui-dialog").each(function(){this!==n.uiDialog[0]&&(i=e(this).css("z-index"),isNaN(i)||(r=Math.max(r,i)))}),e.ui.dialog.maxZ=r),this},isOpen:function(){return this._isOpen},moveToTop:function(t,n){var r=this.options,i;return r.modal&&!t||!r.stack&&!r.modal?this._trigger("focus",n):(r.zIndex>e.ui.dialog.maxZ&&(e.ui.dialog.maxZ=r.zIndex),this.overlay&&(e.ui.dialog.maxZ+=1,e.ui.dialog.overlay.maxZ=e.ui.dialog.maxZ,this.overlay.$el.css("z-index",e.ui.dialog.overlay.maxZ)),i={scrollTop:this.element.scrollTop(),scrollLeft:this.element.scrollLeft()},e.ui.dialog.maxZ+=1,this.uiDialog.css("z-index",e.ui.dialog.maxZ),this.element.attr(i),this._trigger("focus",n),this)},open:function(){if(this._isOpen)return;var t,n=this.options,r=this.uiDialog;return this._size(),this._position(n.position),r.show(n.show),this.overlay=n.modal?new e.ui.dialog.overlay(this):null,this.moveToTop(!0),t=this.element.find(":tabbable"),t.length||(t=this.uiDialogButtonPane.find(":tabbable"),t.length||(t=r)),t.eq(0).focus(),this._isOpen=!0,this._trigger("open"),this},_createButtons:function(t){var n,r,i=this,s=!1;this.uiDialogButtonPane.remove(),this.uiButtonSet.empty(),typeof t=="object"&&t!==null&&e.each(t,function(){return!(s=!0)}),s?(e.each(t,function(t,n){n=e.isFunction(n)?{click:n,text:t}:n;var r=e("<button type='button'>").attr(n,!0).unbind("click").click(function(){n.click.apply(i.element[0],arguments)}).appendTo(i.uiButtonSet);e.fn.button&&r.button()}),this.uiDialog.addClass("ui-dialog-buttons"),this.uiDialogButtonPane.appendTo(this.uiDialog)):this.uiDialog.removeClass("ui-dialog-buttons")},_makeDraggable:function(){function r(e){return{position:e.position,offset:e.offset}}var t=this,n=this.options;this.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",handle:".ui-dialog-titlebar",containment:"document",start:function(n,i){e(this).addClass("ui-dialog-dragging"),t._trigger("dragStart",n,r(i))},drag:function(e,n){t._trigger("drag",e,r(n))},stop:function(i,s){n.position=[s.position.left-t.document.scrollLeft(),s.position.top-t.document.scrollTop()],e(this).removeClass("ui-dialog-dragging"),t._trigger("dragStop",i,r(s)),e.ui.dialog.overlay.resize()}})},_makeResizable:function(n){function u(e){return{originalPosition:e.originalPosition,originalSize:e.originalSize,position:e.position,size:e.size}}n=n===t?this.options.resizable:n;var r=this,i=this.options,s=this.uiDialog.css("position"),o=typeof n=="string"?n:"n,e,s,w,se,sw,ne,nw";this.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:this.element,maxWidth:i.maxWidth,maxHeight:i.maxHeight,minWidth:i.minWidth,minHeight:this._minHeight(),handles:o,start:function(t,n){e(this).addClass("ui-dialog-resizing"),r._trigger("resizeStart",t,u(n))},resize:function(e,t){r._trigger("resize",e,u(t))},stop:function(t,n){e(this).removeClass("ui-dialog-resizing"),i.height=e(this).height(),i.width=e(this).width(),r._trigger("resizeStop",t,u(n)),e.ui.dialog.overlay.resize()}}).css("position",s).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")},_minHeight:function(){var e=this.options;return e.height==="auto"?e.minHeight:Math.min(e.minHeight,e.height)},_position:function(t){var n=[],r=[0,0],i;if(t){if(typeof t=="string"||typeof t=="object"&&"0"in t)n=t.split?t.split(" "):[t[0],t[1]],n.length===1&&(n[1]=n[0]),e.each(["left","top"],function(e,t){+n[e]===n[e]&&(r[e]=n[e],n[e]=t)}),t={my:n.join(" "),at:n.join(" "),offset:r.join(" ")};t=e.extend({},e.ui.dialog.prototype.options.position,t)}else t=e.ui.dialog.prototype.options.position;i=this.uiDialog.is(":visible"),i||this.uiDialog.show(),this.uiDialog.position(t),i||this.uiDialog.hide()},_setOptions:function(t){var n=this,s={},o=!1;e.each(t,function(e,t){n._setOption(e,t),e in r&&(o=!0),e in i&&(s[e]=t)}),o&&this._size(),this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option",s)},_setOption:function(t,r){var i,s,o=this.uiDialog;switch(t){case"buttons":this._createButtons(r);break;case"closeText":this.uiDialogTitlebarCloseText.text(""+r);break;case"dialogClass":o.removeClass(this.options.dialogClass).addClass(n+r);break;case"disabled":r?o.addClass("ui-dialog-disabled"):o.removeClass("ui-dialog-disabled");break;case"draggable":i=o.is(":data(draggable)"),i&&!r&&o.draggable("destroy"),!i&&r&&this._makeDraggable();break;case"position":this._position(r);break;case"resizable":s=o.is(":data(resizable)"),s&&!r&&o.resizable("destroy"),s&&typeof r=="string"&&o.resizable("option","handles",r),!s&&r!==!1&&this._makeResizable(r);break;case"title":e(".ui-dialog-title",this.uiDialogTitlebar).html(""+(r||"&#160;"))}this._super(t,r)},_size:function(){var t,n,r,i=this.options,s=this.uiDialog.is(":visible");this.element.show().css({width:"auto",minHeight:0,height:0}),i.minWidth>i.width&&(i.width=i.minWidth),t=this.uiDialog.css({height:"auto",width:i.width}).outerHeight(),n=Math.max(0,i.minHeight-t),i.height==="auto"?e.support.minHeight?this.element.css({minHeight:n,height:"auto"}):(this.uiDialog.show(),r=this.element.css("height","auto").height(),s||this.uiDialog.hide(),this.element.height(Math.max(r,n))):this.element.height(Math.max(i.height-t,0)),this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option","minHeight",this._minHeight())}}),e.extend(e.ui.dialog,{uuid:0,maxZ:0,getTitleId:function(e){var t=e.attr("id");return t||(this.uuid+=1,t=this.uuid),"ui-dialog-title-"+t},overlay:function(t){this.$el=e.ui.dialog.overlay.create(t)}}),e.extend(e.ui.dialog.overlay,{instances:[],oldInstances:[],maxZ:0,events:e.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(e){return e+".dialog-overlay"}).join(" "),create:function(t){this.instances.length===0&&(setTimeout(function(){e.ui.dialog.overlay.instances.length&&e(document).bind(e.ui.dialog.overlay.events,function(t){if(e(t.target).zIndex()<e.ui.dialog.overlay.maxZ)return!1})},1),e(window).bind("resize.dialog-overlay",e.ui.dialog.overlay.resize));var n=this.oldInstances.pop()||e("<div>").addClass("ui-widget-overlay");return e(document).bind("keydown.dialog-overlay",function(r){var i=e.ui.dialog.overlay.instances;i.length!==0&&i[i.length-1]===n&&t.options.closeOnEscape&&!r.isDefaultPrevented()&&r.keyCode&&r.keyCode===e.ui.keyCode.ESCAPE&&(t.close(r),r.preventDefault())}),n.appendTo(document.body).css({width:this.width(),height:this.height()}),e.fn.bgiframe&&n.bgiframe(),this.instances.push(n),n},destroy:function(t){var n=e.inArray(t,this.instances),r=0;n!==-1&&this.oldInstances.push(this.instances.splice(n,1)[0]),this.instances.length===0&&e([document,window]).unbind(".dialog-overlay"),t.height(0).width(0).remove(),e.each(this.instances,function(){r=Math.max(r,this.css("z-index"))}),this.maxZ=r},height:function(){var t,n;return e.browser.msie?(t=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight),n=Math.max(document.documentElement.offsetHeight,document.body.offsetHeight),t<n?e(window).height()+"px":t+"px"):e(document).height()+"px"},width:function(){var t,n;return e.browser.msie?(t=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),n=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth),t<n?e(window).width()+"px":t+"px"):e(document).width()+"px"},resize:function(){var t=e([]);e.each(e.ui.dialog.overlay.instances,function(){t=t.add(this)}),t.css({width:0,height:0}).css({width:e.ui.dialog.overlay.width(),height:e.ui.dialog.overlay.height()})}}),e.extend(e.ui.dialog.overlay.prototype,{destroy:function(){e.ui.dialog.overlay.destroy(this.$el)}})})(jQuery);

(function($){$.fn.inputFocus=function(options){var _options=$.extend({'defaultValue':'Wypełnij pole'},options);$(this).each(function(){var _self=$(this);if(!_self.data('focusListener')){_self.attr('data-focus-listener',true);$(this).val(_options.defaultValue);var value="";_self.focus(function(){$(this).removeClass('default');if($(this).val()==_options.defaultValue){$(this).val("");}else if(value!=""){$(this).val(value);}});_self.blur(function(){value=$(this).val();if($(this).val()==""||$(this).val()==" "){$(this).val(_options.defaultValue);$(this).addClass('default');}});_self.siblings('button[type="reset"]').click(function(){value="";_self.val("");_self.focus();});}});};})(jQuery);(function($){$.fn.changeType=function(type){var element=$(this).get(0);element.type=type;};})(jQuery);(function($){$.fn.inputPasswordFocus=function(options){if(!$.browser.msie||parseInt($.browser.version)>8){var _options=$.extend({'defaultValue':'Hasło'},options);$(this).each(function(){var _self=$(this);if(!_self.data('focusListener')){_self.attr('data-focus-listener',true);_self.changeType('text');_self.val(_options.defaultValue);_self.focus(function(){if($(this).val()==""||$(this).val()==" "||$(this).val()==_options.defaultValue){_self.val('');_self.changeType('password');}});_self.blur(function(){if($(this).val()==""||$(this).val()==" "){_self.changeType('text');_self.val(_options.defaultValue);}});}});}};})(jQuery);(function($){$.fn.tabs=function(options){var click='ontouchstart'in document.documentElement?'touchstart click':'click';var _options=$.extend({'tabListClass':'tab-list','tabberClass':'tabber','tabClass':'tab','selectClass':'tabs-select','activeTabName':'active-tab'},options);$(this).each(function(){var _self=$(this);var $tabList=_self.children('.tab-list').add(_self.children('.tab-sidebar').children('.tab-list'));var $tabSelect=_self.children('.'+_options.selectClass);var $tabber=_self.children('.'+_options.tabberClass);var $tabs=$tabber.children('.'+_options.tabClass);var $activeTab=_self.children('input[name="'+_options.activeTabName+'"]');var $links=$tabList.find('li > a');$tabs.hide();if(undefined!=_options.activeTab&&'null'!=_options.activeTab&&_options.activeTab){$tabber.find('#'+_options.activeTab).show();$tabList.find('a[href="#'+_options.activeTab+'"]').parent().addClass('active');}else{$tabber.find('.'+_options.tabClass+':first-child').show();$tabList.find('li:first-child').addClass('active');}
$links.bind(click,function(event){event.preventDefault();var id=$(this).attr('href');var li=$(this).parent();$activeTab.val(id.split('-')[1]);$activeTab.change();if($.isFunction(_options.changeCallback))_options.changeCallback(id.split('-')[1],$.extend({},$(this).data('additional'),{wrapperId:_self.attr('id')}));li.siblings().removeClass('active');li.addClass('active');$tabs.hide();$tabber.find(id).fadeIn(500);return false;});$tabSelect.change(function(){var id=$tabSelect.children(':selected').val();var li=$tabList.children('[href="'+id+'"]');$activeTab.val(id.split('-')[1]);$activeTab.change();if($.isFunction(_options.changeCallback))_options.changeCallback(id.split('-')[1],$.extend({},$(this).data('additional'),{wrapperId:_self.attr('id')}));$tabs.hide();$tabber.find(id).fadeIn(500);return false;});var setTabLevels=function(){var tabLevels=[];$tabList.children().each(function(){$(this).removeClass('first-level middle-level last-level');if(-1==$.inArray(parseInt($(this).offset().top),tabLevels)){tabLevels.push(parseInt($(this).offset().top));}});if(tabLevels.length>1){$tabList.addClass('multilevel');$tabList.children().each(function(){if(parseInt($(this).offset().top)!=tabLevels[0]){if(parseInt($(this).offset().top+5)<tabLevels[tabLevels.length-1]){$(this).addClass('middle-level');}else{$(this).addClass('last-level');}}else{$(this).addClass('first-level');}});}else{$tabList.removeClass('multilevel');}};if(!_self.hasClass('tabs-vertical')){$(window).bind('resize',setTabLevels);setTabLevels();}});};})(jQuery);(function($){$.fn.dropdown=function(options){var _options=$.extend({},options);$(this).each(function(){var _self=$(this);if(_self.parents('.dropdown').length==0){var $handler=$('<span class="handler" />');$handler.text(_self.children(':selected').text());_self.wrap('<div class="dropdown" />');_self.before($handler);_self.change(function(){$handler.text(_self.children(':selected').text());});}});};})(jQuery);(function($){$.fn.multiDropdown=function(options){var _options=$.extend({},options);$(this).each(function(){var _self=$(this);if(!_self.data('multidropdownListener')){_self.attr('data-multidropdown-listener',true);var $handler=$('<span class="handler" />');$handler.text('Wybierz');_self.wrap('<div class="multidropdown" />');_self.before($handler);var counter=_self.children(':selected').length;if(counter>0){if(1==counter){$handler.text(_self.children(':selected').text());}else{$handler.text(counter+' rzeczy');}}
_self.focus(function(){_self.addClass('is-focus');}).blur(function(){_self.removeClass('is-focus');});_self.change(function(){_self.children().each(function(){if($(this).is(':selected')){$(this).attr('selected','selected');}else{$(this).removeAttr('selected');}});var counter=_self.children(':selected').length;if(1==counter){$handler.text(_self.children(':selected').text());}else{$handler.text(counter+' rzeczy');}});}});};})(jQuery);(function($){$.fn.radioGroup=function(options){var _options=$.extend({},options);$(this).each(function(){var _self=$(this);var $radios=_self.find('input[type="radio"]');var $holder=$('<input type="hidden" />');if($radios.length>0){$holder.attr('name',$radios.attr('name'));$holder.attr('value',$radios.first(':checked').val());$radios.each(function(){var $label=$(this).parent('label');var $trigger=$('<span class="trigger" />');$trigger.attr('id','value-'+$(this).val());$(this).before($trigger);if($(this).is(':checked')){$trigger.addClass('active');}
if($radios.attr('disabled')!='disabled'){$label.click(function(){var data=$(this).find('.trigger').attr('id').split('-');$holder.attr('value',data[1]);_self.find('.trigger').removeClass('active');$(this).find('.trigger').addClass('active');if(_options.changeCallback&&jQuery.isFunction(_options.changeCallback)){_options.changeCallback(data[1]);}});$trigger.click(function(){var data=$(this).attr('id').split('-');$holder.attr('value',data[1]);_self.find('.trigger').removeClass('active');$trigger.addClass('active');});}});if($radios.attr('disabled')!='disabled'){$radios.change(function(){_self.find('.trigger').removeClass('active');$(this).siblings('.trigger').addClass('active');if(_options.changeCallback&&jQuery.isFunction(_options.changeCallback)){_options.changeCallback($(this).val());}});}
_self.prepend($holder);$radios.remove();}});};})(jQuery);(function($){$.fn.checkbox=function(options){var _options=$.extend({},options);$(this).each(function(){var _self=$(this);var $holder=$('<input type="hidden" />');var $label=_self.prev('label');var $trigger=$('<span class="trigger" />');$holder.attr('name',_self.attr('name'));;if(_self.is(':checked')){$holder.val(1);$trigger.toggleClass('active');}
if(_self.attr('disabled')!='disabled'){$label.add($trigger).click(function(){if(0==$holder.val()){$holder.val(1);}else{$holder.val(0);}
if(_options.callback)_options.callback($holder.val(),$holder);$trigger.toggleClass('active');$holder.change();});}
_self.before($trigger);_self.before($holder);_self.remove();});};})(jQuery);$.fn.appendText=function(text){this.each(function(){var textNode=document.createTextNode(text);$(this).append(textNode);});};(function($){$.fn.populateForm=function(options){var _options=$.extend({},options);$(this).each(function(){var _self=$(this);if(_options.selects&&!jQuery.isEmptyObject(_options.selects)){for(var i in _options.selects){var select=$('select[name="'+i+'"]');for(var j in _options.selects[i]){select.append('<option value="'+_options.selects[i][j].id+'">'+_options.selects[i][j].name+'</option>');}}}
if(_options.data&&!jQuery.isEmptyObject(_options.data)){for(var i in _options.data){var element=$('input[name="'+i+'"], select[name="'+i+'"]');if(element.attr('type')==='radio'){element.filter('[value="'+_options.data[i]+'"]').attr('checked','checked');}else if(element.attr('type')==='checkbox'){if(_options.data[i]!=undefined&&_options.data[i]!=0){element.attr('checked','checked');}}else if(element.is('select')){if($.isArray(_options.data[i])){for(var j in _options.data[i]){element.find('option[value="'+_options.data[i][j]+'"]').attr('selected','selected');}}else{element.find('option[value="'+_options.data[i]+'"]').attr('selected','selected');}}else{element.val(_options.data[i]);}}}});};})(jQuery);(function($){$.fn.redrawForWebkit=function(){if($.browser.webkit){return this.each(function(){var $this=$(this);if($this.is(':visible')){$this.hide();$this[0].offsetHeight;$this.show();$this.css('display','');}else{$this[0].offsetHeight;}});}else{return this;}};})(jQuery);(function($){$.fn.cutText=function(numberOfLines,$switch){var click='ontouchstart'in document.documentElement?'touchstart click':'click';$(this).each(function(){var _self=$(this);var allLinesCount=parseInt(_self.height()/parseInt(_self.css('line-height')));var breakPoint=parseInt(_self.text().length/(allLinesCount/numberOfLines));var html='<span class="short">'
+characterLimit(_self.text(),breakPoint)
+'</span>'
+'<span class="fulltext hidden">'
+_self.text()
+'</span>';_self.html(html);if(undefined!=$switch){$switch.bind(click,function(){_self.children().toggleClass('hidden');});}});};})(jQuery);

function htmlEncode(value){return $('<div/>').text(value).html();}
function htmlDecode(value){return $('<div/>').html(value).text();}
$(document).ready(function(){if(!$.cookie("acceptCookie")){$('<div id="info-bar"><p>Informujemy, że na swoich stronach, Smaki Życia  wykorzystuje wraz z innymi podmiotami współpracującymi pliki  cookies (tzw. ciasteczka) i inne technologie w celach statystycznych,  reklamowych i w celu dostosowania naszych serwisów do indywidualnych potrzeb użytkowników.  Korzystając z naszych serwisów internetowych bez zmiany ustawień przeglądarki będą one zapisane w pamięci urządzenia. Kliknij <a href="/polityka-prywatnosci">[polityka cookies]</a>, aby dowiedzieć się więcej, w tym jak zarządzać plikami cookies. </p><button id="acceptC"><span>Akceptuj cookies</span></button> </div>').appendTo("body");$('#info-bar').css('display','block');$('button#acceptC').click(function(){$.cookie("acceptCookie","accept",{expires:365,path:'/'});$('#info-bar').css('display','none');});}
$('input[name="loginemail"]').click(function(){$('.errorlogin').css('display','none');});$('input[name="password"]').click(function(){$('.errorlogin').css('display','none');});$.ajax({url:"/ajax/checklogin/",dataType:"json",type:"POST",data:'',success:function(data){if(data.status){$('.login').css('display','none');$('.logintrue').css('display','block');$('.logintrue span.nick').html(data.data);}}});$("#slides").slides({play:5000,effect:'fade',next:'next',generatePagination:false,pagination:true,paginationClass:'slider-thumbs',prev:'prev',preload:true,preloadImage:'/gfx/front/ajax-loader.gif'});var sliderNav=new SliderNavigation("#slides .slider-thumbs");sliderNav.init();$("#slides_gallery").slides({play:5000,effect:'fade',next:'next',generatePagination:false,pagination:true,paginationClass:'slider-thumbs',prev:'prev',preload:true,preloadImage:'/gfx/front/ajax-loader.gif'});var sliderNav=new SliderNavigationMultimedia("#slides_gallery .slider-thumbs");sliderNav.init();$('#search-form input[type="text"]').inputFocus({defaultValue:'Szukaj...'});$('#search-form .current-search-filter').each(function(){var parent=$(this);parent.children('.js-remove').click(function(){$('#search-form input[name="category"]').val('');parent.fadeOut();});});$('.widget-newsletter input[name="email"]').inputFocus({defaultValue:'Twój email'});$('.widget-newsletter input[name="email_resign"]').inputFocus({defaultValue:'Twój email z newslettera'});$('#panel_user input[name="loginemail"]').inputFocus({defaultValue:'Użytkownik lub adres email'});$('#panel_user input[name="password"]').inputFocus({defaultValue:'Hasło'});$('.stars-selector').fancySelector({className:'stars-selector'});$('.portion-selector').fancySelector({className:'portion-selector'});$('.widget-new-recipe input[name="time_hours"], .widget-new-recipe input[name="wait_hours"]').inputFocus({defaultValue:'hh'});$('.widget-new-recipe input[name="time_minutes"], .widget-new-recipe input[name="wait_minutes"]').inputFocus({defaultValue:'mm'});$('.widget-new-recipe input[name="time"], .widget-new-recipe input[name="wait"]').inputFocus({defaultValue:'czas'});$('.widget-new-thread textarea').inputFocus({defaultValue:'Wiadomość'});$('.widget-new-thread input[name="title"]').inputFocus({defaultValue:'Tytuł'});$('.widget-new-recipe .group-products-list .input-container > .input-name').inputFocus({defaultValue:'Nazwa produktu'});$('.widget-new-recipe .group-products-list .input-container > .input-amount').inputFocus({defaultValue:'Ilość'});$('.widget-new-recipe .group-products-list').each(function(){var productContainer=$(this);var trigger=productContainer.next('#js-add-product');trigger.click(function(){var html='';html+='<div class="input-container">';html+='<label for="product[]">'+(parseInt((productContainer.children(':last-child').children('label').text()))+1)+'.</label>';html+='<input value="Nazwa produktu" class="input-name" type="text" name="product_name[]" />';html+='<input value="Ilość" class="input-amount" type="text" name="product_amount[]" />';html+='<span class="icon remove"></span>';html+='</div>';productContainer.append(html);productContainer.find('.input-name').inputFocus({defaultValue:'Nazwa produktu'});productContainer.find('.input-amount').inputFocus({defaultValue:'Ilość'});return false;});});$('.widget-new-recipe .group-products-list .icon.remove').live('hover',function(){$(this).toggleClass('is-hover');});$('.widget-new-recipe .group-products-list .icon.remove').live('click',function(){if($(this).parent().is(':first-child')){alert('Musisz wprowadzić przynajmniej jeden produkt');}else{$(this).parent().remove();}});$('.widget-new-recipe button[type="submit"]').live('click',function(){var $dialog=$('<div></div>').html('Trwa przetwarzanie danych!!!').dialog({autoOpen:true,title:'Dodawanie przepisu',width:'300',height:'100',show:'slide',open:function(event,ui){$(".ui-dialog-titlebar-close").hide();}});return true;});$('#panel_user #user-avatar, #panel_user #user-avatar .edit').hover(function(){$(this).toggleClass('is-hover');});$('#panel_user #user-avatar .edit').click(function(){$('#panel_user .avatar-change-box').fadeToggle();return false;});$('#panel_user .avatar-change-box .js-edit, .js-avatar-edit').click(function(){$(document).ready(function(){$("#dialog").load('/profil/avatarform');$("#dialog").dialog({'autoOpen':true,'draggable':false,'resizable':false,'title':"Wybierz plik",'width':320,'close':function(event,ui){location.reload();}});});return false;});$('#panel_user .avatar-change-box .js-delete, .js-avatar-delete').click(function(){$.ajax({url:"/profil/removeavatar/format/html",type:"POST",data:'',success:function(html){$('#dialog').html(html);}});$("#dialog").dialog({'autoOpen':true,'draggable':false,'resizable':false,'title':"Usunięcie avatara",'width':820,'close':function(event,ui){location.reload();}});return false;});$('#panel_user .avatar-change-box .js-save, .js-avatar-save').click(function(){$.ajax({url:"/profil/setavatar/format/html",type:"POST",data:'',success:function(html){$('#dialog').html(html);}});$("#dialog").dialog({'autoOpen':true,'draggable':false,'resizable':false,'title':"Zmiana avatara",'width':820,'close':function(event,ui){location.reload();}});return false;});$('.widget-poll button[type="submit"]').click(function(event){event.preventDefault();var data=$(this).parents('form').serialize();$.post('/ajax/poll',data,function(response){console.log(response);});return false;});$('.repository-link').click(function(){var data=$(this).attr('id').split('-');$.ajax({url:"/ajax/addtorepository/format/html",type:"POST",data:'page_id='+data[1]+'&user_id='+data[2],success:function(html){$('#dialog').html(html);}});$("#dialog").dialog({'autoOpen':true,'draggable':false,'resizable':false,'title':"Schowek",'width':820});return false;});$('.repository-remove-link').click(function(){var data=$(this).attr('id').split('-');$.ajax({url:"/ajax/removefromrepository/format/html",type:"POST",data:'page_id='+data[1]+'&user_id='+data[2],success:function(html){$('#dialog').html(html);}});$("#dialog").dialog({'autoOpen':true,'draggable':false,'resizable':false,'title':"Schowek",'width':820,'close':function(event,ui){location.reload();}});return false;});$('.widget-map').each(function(){$(this).find('#canvas_container').css({'height':85,'position':'relative'},1000);$(this).find('#map_legend, #objects_map_legend').animate({'opacity':0},600,function(){$(this).hide();});$('.widget-map > .switch').text('rozwiń');$('.widget-map > .switch').addClass('non-active');});$('.widget-map > .switch').click(function(){var self=$(this);if(self.hasClass('non-active')){self.removeClass('non-active');$('#canvas_container').stop().animate({'height':600},1000);$('#map_legend, #objects_map_legend').show();$('#map_legend, #objects_map_legend').stop().animate({'opacity':1},1300);self.text('zwiń');}else{self.addClass('non-active');$('#canvas_container').stop().animate({'height':85},1000);$('#canvas_container').css({'position':'relative'});$('#map_legend, #objects_map_legend').stop().animate({'opacity':0},600,function(){$(this).hide();});self.text('rozwiń');}});$('#newsletter_one .button').click(function(){$.ajax({url:"/ajax/newsletter/",type:"POST",dataType:'json',data:'email='+$('input[name="email"]').val(),success:function(data){if(data.status){$('#newsletter_one').css('display','none');$('#newsletter_two').css('display','block');$('#newsletter_two span.email_name').html(data.html);}else{$('#newsletter_one .newsletter_info').toggleClass('is-hover-error');}}});});$('#newsletter_three .button').click(function(){$.ajax({url:"/ajax/newsletter_resign/",type:"POST",dataType:'json',data:'email='+$('input[name="email_resign"]').val(),success:function(data){if(data.status){$('#newsletter_one').css('display','none');$('#newsletter_two').css('display','none');$('#newsletter_three').css('display','none');$('#newsletter_four').css('display','block');$('#newsletter_four span.email_name').html(data.html);$('#newsletter_four input[name="email_name"').val(data.html);}else{$('#newsletter_three .newsletter_info').toggleClass('is-hover-error');}}});});$('#newsletter_four .resign-link').click(function(){$.ajax({url:"/ajax/newsletter_resign/",type:"POST",dataType:'json',data:'email='+$('input[name="email_resign"]').val()+'&accept=1',success:function(data){if(data.status){$('#newsletter_one').css('display','block');$('#newsletter_two').css('display','none');$('#newsletter_three').css('display','none');$('#newsletter_four').css('display','none');}}});});$('#newsletter_resign_accept').click(function(){$('#newsletter_one').css('display','block');$('#newsletter_two').css('display','none');$('#newsletter_three').css('display','none');$('#newsletter_four').css('display','none');});$('#newsletter_four .button').click(function(){$.ajax({url:"/ajax/newsletter_resign/",type:"POST",dataType:'json',data:'email='+$('input[name="email_resign"]').val(),success:function(data){if(data.status){$('#newsletter_one').css('display','block');$('#newsletter_two').css('display','none');$('#newsletter_three').css('display','none');$('#newsletter_four').css('display','none');}else{$('#newsletter_four .newsletter_info').toggleClass('is-hover-error');}}});});$('#newsletter_one .resign-link, #newsletter_two .resign-link').click(function(){$('#newsletter_one').css('display','none');$('#newsletter_two').css('display','none');$('#newsletter_three').css('display','block');});$('#newsletter_one input[name="email"]').live('hover',function(){$('#newsletter_one .newsletter_info').toggleClass('is-hover');});$('#newsletter_three input[name="email_resign"]').live('hover',function(){$('#newsletter_three .newsletter_info').toggleClass('is-hover');});$('#newsletter_one input[name="email"]').click(function(){$('#newsletter_one .newsletter_info').removeClass('is-hover-error');return false;});$('#newsletter_three input[name="email_resign"]').click(function(){$('#newsletter_three .newsletter_info').removeClass('is-hover-error');return false;});$('.owner-filter-href').click(function(e){e.preventDefault();var data=$(this).attr('id').split('-');var $this=$(this);$.ajax({url:"/ajax/setownerfilter/format/json/",type:"POST",dataType:'json',data:'owner='+data[1]+'&url='+window.location.pathname,success:function(data){if(data.status){window.location=$this.attr('href');}}});return false;});$('.remove-cat-alpha-filter').click(function(){$.ajax({url:"/ajax/removecatfilter/format/json/",type:"POST",dataType:'json',data:'url='+window.location.pathname,success:function(data){}});});$('.reset-filters').click(function(){$.ajax({url:"/ajax/resetcatfilter/format/json/",type:"POST",dataType:'json',data:'url='+window.location.pathname,success:function(data){}});});$('.cat-alpha-filter').click(function(){var data=$(this).attr('id').split('-');$.ajax({url:"/ajax/setcatalphafilter/format/json/",type:"POST",dataType:'json',data:'cat_letter='+data[2]+'&url='+window.location.pathname,success:function(data){if(data.status){if(window.location.pathname==data.url.path){window.location.hash=data.url.hash;window.location.reload();}else{window.location.pathname=data.url.path+data.url.hash;}}}});return false;});$('.ad-external').click(function(e){var data=$(this).attr('id').split('-');var $this=$(this);$.ajax({url:"/ajax/adtraffic/format/json/",type:"POST",dataType:'json',data:'ad_id='+data[1],success:function(data){}});});if($('.buttons-container .buy, .buttons-container-det .buy').length){$('.buttons-container .buy, .buttons-container-det .buy').click(function(event){event.preventDefault();var productId=$(this).attr('data-id');if(productId){$.ajax({url:"/ajax/addbasket",type:"POST",dataType:'json',data:'productId='+productId,success:function(data){if(data.status){if($('#minicart_price').length){$('#minicart_price').html(data.data.amount+' PLN');var $dialog=$('<div></div>').html(data.data.html).dialog({'autoOpen':true,'draggable':false,'resizable':false,'title':"Koszyk",'width':'400','close':function(event,ui){$(this).dialog("close");},buttons:{"Kontynuuj":function(){$(this).dialog("close");},"Zapłać!":function(){$(this).dialog("close");window.location.href='/sklep/koszyk/lista';}}});}}}});}});}
if($('.butik-contener').length){if(!$('.butik-contener').hasClass('noactive')){if($('.checkbox-all').length){$('.checkbox-all').click(function(event){event.preventDefault();if($(this).hasClass('active')){$(this).removeClass('active');$('.checkbox').removeClass('active');$('#delete-check').css('display','none');}else{$(this).addClass('active');$('.checkbox').addClass('active');$('#delete-check').css('display','block');}});}
if($('.checkbox').length){$('.checkbox').click(function(event){event.preventDefault();if($(this).hasClass('active')){$(this).removeClass('active');$('#delete-check').css('display','none');}else{$(this).addClass('active');$('#delete-check').css('display','block');}});if($('.checkbox.active').length>0){$('#delete-check').css('display','block');}}
if($('select.count').length){$('select.count').change(function(event){event.preventDefault();var obj=$(this);var cnt=obj.attr('value');var productId=obj.parent().parent().parent().attr('data-product-id');$.ajax({url:"/ajax/changebasketValue",type:"POST",dataType:'json',data:'productId='+productId+'&cnt='+cnt,success:function(data){if(data.status){var amount=data.data.amount;var price=data.data.value;$('#minicart_price span').html(amount);$('#cart_price span').html(amount);obj.parent().parent().find('.value-act span').html(price);}}});});}
if($('select[name="delivery"]').length){$('select[name="delivery"]').change(function(){var obj=$(this);var deliveryTypeId=$(this).attr('value');if(deliveryTypeId!=0){$(this).removeClass('error');}
$.ajax({url:"/ajax/changebasketDeliveryValue",type:"POST",dataType:'json',data:'deliveryId='+deliveryTypeId,success:function(data){if(data.status){var amount=data.data.amount;var price=data.data.value;$('#minicart_price span').html(amount);$('#cart_price span').html(amount);obj.parent().parent().find('.delivery-value span').html(price);}}});});}
if($('#delete-check').length){$('#delete-check').click(function(event){event.preventDefault();var ids=[];$('.checkbox.active').each(function(){var prodId=$(this).parent().parent().parent().attr('data-product-id');ids.push(prodId);});$.ajax({url:"/ajax/changebasketDelete",type:"POST",dataType:'json',data:'productIds='+ids.join(','),success:function(data){if(data.status){var amount=data.data.amount;var idsResp=data.data.value;$('#minicart_price span').html(amount);$('#cart_price span').html(amount);$.each(idsResp,function(k,v){$('.content-butik[data-product-id='+v+']').remove();});$('.checkbox-all').removeClass('active');$('#delete-check').css('display','none');if($('.checkbox').length<2){$('.checkbox-all').css('display','none');}}}});});}
$('#pay').click(function(event){if($('select[name="delivery"]').attr('value')!=0){location.href='/sklep/koszyk/dane'}else{$('select[name="delivery"]').addClass('error');}});}else{$('select.count').attr('disabled','disbled');}}
if($('input[name="orderby_delivery"]').length){$('input[name="orderby_delivery"]').click(function(event){if($(this).val()==2){if($('div.delivery-block').hasClass('disabled')){$('div.delivery-block').removeClass('disabled');}
$('div.delivery-block').addClass('enabled');}else{if($('div.delivery-block').hasClass('enabled')){$('div.delivery-block').removeClass('enabled');}
$('div.delivery-block').addClass('disabled');}});}
if($('input.orderby').length){$('input.orderby').click(function(event){if($(this).attr('value')==1){console.log(1);$('input[name="orderby_company"]').val('');$('input[name="orderby_nip"]').val('');$('input[name="orderby_name"]').attr('disabled',false);if($('input[name="orderby_name"]').hasClass('disabled')){$('input[name="orderby_name"]').removeClass('disabled');}
$('input[name="orderby_company"]').addClass('disabled');$('input[name="orderby_company"]').attr('disabled',true);$('input[name="orderby_nip"]').addClass('disabled');$('input[name="orderby_nip"]').attr('disabled',true);}else{console.log(2);$('input[name="orderby_name"]').val('');$('input[name="orderby_name"]').addClass('disabled');$('input[name="orderby_name"]').attr('disabled',true);$('input[name="orderby_company"]').attr('disabled',false);$('input[name="orderby_nip"]').attr('disabled',false);if($('input[name="orderby_company"]').hasClass('disabled')){$('input[name="orderby_company"]').removeClass('disabled');}
if($('input[name="orderby_nip"]').hasClass('disabled')){$('input[name="orderby_nip"]').removeClass('disabled');}}});}
if($('.butik-contener-user').length){if($('.checkbox-all').length){$('.checkbox-all').click(function(event){event.preventDefault();if($(this).hasClass('active')){$(this).removeClass('active');$('.checkbox').removeClass('active');}else{$(this).addClass('active');$('.checkbox').addClass('active');}});}
if($('.checkbox').length){$('.checkbox').click(function(event){event.preventDefault();if($(this).hasClass('active')){$(this).removeClass('active');}else{$(this).addClass('active');}});}
if($('#delete-check').length){$('#delete-check').click(function(event){event.preventDefault();var ids=[];$('.checkbox.active').each(function(){var prodId=$(this).parent().parent().parent().attr('data-transaction-id');ids.push(prodId);});$.ajax({url:"/ajax/deleteusertransaction",type:"POST",dataType:'json',data:'transactionsIds='+ids.join(','),success:function(data){if(data.status){location.href='/profil/zakupy/';}}});});}
if($('.content-butik').length){$('.content-butik .zamowienie .txt, .content-butik .opis, .content-butik .status, .content-butik .kwota').click(function(event){event.preventDefault();var productId=$(this).parent().parent().attr('data-transaction-id');if(typeof productId=='undefined'){productId=$(this).parent().parent().parent().attr('data-transaction-id');}
location.href='/profil/zakupy/szczegoly/'+productId;});}}
if($('#shop-link').length){$('#shop-link').click(function(event){event.preventDefault();var transactionId=$(this).attr('data-transaction-id');console.log(transactionId);$.ajax({url:"/ajax/shopprepare",type:"POST",dataType:'json',data:'transactionId='+transactionId,success:function(data){if(data.status){location.href='/sklep/koszyk/lista/';}}});});}});function updateMessage(messageId){$.ajax({url:"/ajax/systemowe/",type:"POST",dataType:'json',data:'id='+messageId,success:function(data){if(data.status){$('#sysMsg'+messageId).css('display','none');}}});}
function changeMoviePalyer(id,movie_hash){$('#movie_image_'+id).css('display','none');$('#movie_'+id).css('display','block');flowplayer("video_player_"+id,"http://smaki.dev.hoqs.pl/flowplayer/flowplayer.swf","http://smaki.dev.hoqs.pl/videos/"+movie_hash+".mp4");console.log(123);}
function changeMovieSmallPalyer(id,movie_url){$('.video_small_player').css('display','none');$('.movie_image').css('display','block');$('#movie_image_'+id).css('display','none');$('#movie_'+id).css('display','block');flowplayer("video_small_player_"+id,"/flowplayer/flowplayer.commercial-3.2.5-1.swf",{clip:{url:movie_url,scaling:'orig',autoPlay:true,autoBuffering:true,scaling:'fit'},play:{replayLabel:'Odtwórz ponownie'},canvas:{backgroundColor:'#000000',backgroundGradient:'none'}});}
var SliderNavigation=function(element){var self;this.parent=$(element);this.childrenCounter=0;this.prev=$("<span class='previous' />");this.next=$("<span class='next' />");this.totalWidth=0;this.current=1;this.currentPosition=0;this.init=function(){self=this;self.childrenCounter=self.parent.children().length;self.manageNav();self.parent.wrap("<div class='nav_container' />");self.wrapper=self.parent.parent();self.wrapper.prepend(self.prev);self.wrapper.append(self.next);self.parent.children().each(function(){self.totalWidth+=140;});self.wrapper.css({'height':125,'overflow':'hidden','position':'relative','width':550});self.parent.css({'left':0,'position':'absolute','top':0,'width':self.totalWidth});self.next.click(function(){if((self.current+3)<self.childrenCounter){self.current++;self.currentPosition-=140;self.parent.stop().animate({'left':self.currentPosition},500);}
self.manageNav();});self.prev.click(function(){if(self.current!=1){self.current--;self.currentPosition+=140;self.parent.stop().animate({'left':self.currentPosition},500);}
self.manageNav();});};this.manageNav=function(){if(this.current==1){this.prev.hide();}else{this.prev.show();}
if((this.current+3)>=this.childrenCounter){this.next.hide();}else{this.next.show();}};};var SliderNavigationMultimedia=function(element){var self;this.parent=$(element);this.childrenCounter=0;this.prev=$("<span class='previous' />");this.next=$("<span class='next' />");this.totalWidth=0;this.current=1;this.currentPosition=0;this.init=function(){self=this;self.childrenCounter=self.parent.children().length;self.manageNav();self.parent.wrap("<div class='nav_container' />");self.wrapper=self.parent.parent();self.wrapper.prepend(self.prev);self.wrapper.append(self.next);self.parent.children().each(function(){self.totalWidth+=118;});self.wrapper.css({'height':97,'overflow':'hidden','position':'relative','width':463});self.parent.css({'left':0,'position':'absolute','top':0,'width':self.totalWidth});self.next.click(function(){if((self.current+3)<self.childrenCounter){self.current++;self.currentPosition-=118;self.parent.stop().animate({'left':self.currentPosition},500);}
self.manageNav();});self.prev.click(function(){if(self.current!=1){self.current--;self.currentPosition+=118;self.parent.stop().animate({'left':self.currentPosition},500);}
self.manageNav();});};this.manageNav=function(){if(this.current==1){this.prev.hide();}else{this.prev.show();}
if((this.current+3)>=this.childrenCounter){this.next.hide();}else{this.next.show();}};};(function($){$.fn.inputFocus=function(options){var _options=$.extend({'defaultValue':'Wypełnij pole'},options);var _self=$(this);_self.each(function(){var value="";$(this).live('focus',function(){if($(this).val()==_options.defaultValue){$(this).val("");}else if(value!=""){$(this).val(value);}});$(this).live('blur',function(){value=$(this).val();if($(this).val()==""||$(this).val()==" "){$(this).val(_options.defaultValue);}});});};})(jQuery);(function($){$.fn.fancySelector=function(options){var amountTranslator=[];amountTranslator.push('none','one','two','three','four','five');var _options=$.extend({'className':'stars-selector'},options);var _self=$(this);_self.each(function(){var value=0;var selectedValue=0;_self.mousemove(function(e){var x=e.pageX-_self.offset().left;if(x>0&&x<19.6){value=1;}else if(x>19.6&&x<39.2){value=2;}else if(x>39.2&&x<58.8){value=3;}else if(x>58.8&&x<78.4){value=4;}else if(x>78.4&&x<98){value=5;}else{value=0;}
_self.removeAttr('class');_self.addClass(_options.className+' '+amountTranslator[value]);});_self.click(function(){selectedValue=value;_self.siblings('input[type="hidden"]').val(selectedValue);});_self.mouseleave(function(){_self.removeAttr('class');_self.addClass(_options.className+' '+amountTranslator[selectedValue]);});});};})(jQuery);
/* Modernizr 2.5.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-touch-shiv-cssclasses-teststyles-prefixes-load
 */
;window.Modernizr=function(a,b,c){function w(a){j.cssText=a}function x(a,b){return w(m.join(a+";")+(b||""))}function y(a,b){return typeof a===b}function z(a,b){return!!~(""+a).indexOf(b)}function A(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:y(f,"function")?f.bind(d||b):f}return!1}var d="2.5.3",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n={},o={},p={},q=[],r=q.slice,s,t=function(a,c,d,e){var f,i,j,k=b.createElement("div"),l=b.body,m=l?l:b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),k.appendChild(j);return f=["&#173;","<style>",a,"</style>"].join(""),k.id=h,(l?k:m).innerHTML+=f,m.appendChild(k),l||(m.style.background="",g.appendChild(m)),i=c(k,a),l?k.parentNode.removeChild(k):m.parentNode.removeChild(m),!!i},u={}.hasOwnProperty,v;!y(u,"undefined")&&!y(u.call,"undefined")?v=function(a,b){return u.call(a,b)}:v=function(a,b){return b in a&&y(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=r.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(r.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(r.call(arguments)))};return e});var B=function(c,d){var f=c.join(""),g=d.length;t(f,function(c,d){var f=b.styleSheets[b.styleSheets.length-1],h=f?f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"":"",i=c.childNodes,j={};while(g--)j[i[g].id]=i[g];e.touch="ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch||(j.touch&&j.touch.offsetTop)===9},g,d)}([,["@media (",m.join("touch-enabled),("),h,")","{#touch{top:9px;position:absolute}}"].join("")],[,"touch"]);n.touch=function(){return e.touch};for(var C in n)v(n,C)&&(s=C.toLowerCase(),e[s]=n[C](),q.push((e[s]?"":"no-")+s));return w(""),i=k=null,function(a,b){function g(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function h(){var a=k.elements;return typeof a=="string"?a.split(" "):a}function i(a){var b={},c=a.createElement,e=a.createDocumentFragment,f=e();a.createElement=function(a){var e=(b[a]||(b[a]=c(a))).cloneNode();return k.shivMethods&&e.canHaveChildren&&!d.test(a)?f.appendChild(e):e},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+h().join().replace(/\w+/g,function(a){return b[a]=c(a),f.createElement(a),'c("'+a+'")'})+");return n}")(k,f)}function j(a){var b;return a.documentShived?a:(k.shivCSS&&!e&&(b=!!g(a,"article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}audio{display:none}canvas,video{display:inline-block;*display:inline;*zoom:1}[hidden]{display:none}audio[controls]{display:inline-block;*display:inline;*zoom:1}mark{background:#FF0;color:#000}")),f||(b=!i(a)),b&&(a.documentShived=b),a)}var c=a.html5||{},d=/^<|^(?:button|form|map|select|textarea)$/i,e,f;(function(){var a=b.createElement("a");a.innerHTML="<xyz></xyz>",e="hidden"in a,f=a.childNodes.length==1||function(){try{b.createElement("a")}catch(a){return!0}var c=b.createDocumentFragment();return typeof c.cloneNode=="undefined"||typeof c.createDocumentFragment=="undefined"||typeof c.createElement=="undefined"}()})();var k={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:j};a.html5=k,j(b)}(this,b),e._version=d,e._prefixes=m,e.testStyles=t,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+q.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return o.call(a)=="[object Function]"}function e(a){return typeof a=="string"}function f(){}function g(a){return!a||a=="loaded"||a=="complete"||a=="uninitialized"}function h(){var a=p.shift();q=1,a?a.t?m(function(){(a.t=="c"?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){a!="img"&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l={},o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};y[c]===1&&(r=1,y[c]=[],l=b.createElement(a)),a=="object"?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),a!="img"&&(r||y[c]===2?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i(b=="c"?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),p.length==1&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&o.call(a.opera)=="[object Opera]",l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return o.call(a)=="[object Array]"},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,i){var j=b(a),l=j.autoCallback;j.url.split(".").pop().split("?").shift(),j.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]||h),j.instead?j.instead(a,e,f,g,i):(y[j.url]?j.noexec=!0:y[j.url]=1,f.load(j.url,j.forceCSS||!j.forceJS&&"css"==j.url.split(".").pop().split("?").shift()?"c":c,j.noexec,j.attrs,j.timeout),(d(e)||d(l))&&f.load(function(){k(),e&&e(j.origUrl,i,g),l&&l(j.origUrl,i,g),y[j.url]=2})))}function i(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var j,l,m=this.yepnope.loader;if(e(a))g(a,0,m,0);else if(w(a))for(j=0;j<a.length;j++)l=a[j],e(l)?g(l,0,m,0):w(l)?B(l):Object(l)===l&&i(l,m);else Object(a)===a&&i(a,m)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,b.readyState==null&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};