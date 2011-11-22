/*global jQuery, window*/
/*jslint
    white: true,
    browser: true,
    onevar: true,
    undef: true,
    nomen: true,
    eqeqeq: true,
    plusplus: true,
    bitwise: true,
    regexp: true,
    newcap: true,
    immed: true,
    strict: true
 */

"use strict"; // ES5 strict mode

(function (jQuery, window) {
 
    var $title = jQuery('#title'),
        $attribution = jQuery('#attribution'),
        $frame = jQuery('#frame'),
        $header = jQuery('#header a'),
        $play = jQuery('#play'),
        $prev = jQuery('#prev'),
        $next = jQuery('#next'),
        $links = jQuery('#links a:visible'),
        $thumbnails = jQuery('#thumbnails'),
        $options = jQuery('#options'),

        slideshow, // setTimeout queue
        interval = 10000, // slideshow interval

        background = {
//            service: new ZS.Picasa({
//                userID: "ajanhelendam",
//                albumID: "5347214534709152305",
//                method: "album"
////            }),
            service: new jQuery.photoService.Flickr({
                preload: ["large","original","thumbnail"],
                method: "flickr.photosets.getPhotos",
                //method: "flickr.photos.getInfo",
                //method: "flickr.interestingness.getList",
                parameters: {
                    api_key: "bb4ea500727e218d0838ae2b40cf2369",
                    photoset_id: "72157623918551670",
                    photo_id: "4597269195",
                    per_page: 30,
                    page: 1
                }
            }),
//            service: new jQuery.photoService.Mock({
//                preload: ["large","original"]
//            }),
            random: false,
            //start: 'random',
            //increment: 0,
            limit: 1,
            size: "original"
        },

        thumbnails = {
            service: new jQuery.photoService.Picasa({
                userID: "ajanhelendam",
                albumID: "5347214534709152305",
                method: "album"
            }),
//            service: new ZS.Flickr({
//                method: "flickr.photosets.getPhotos",
//                //method: "flickr.photos.getInfo",
//                //method: "flickr.interestingness.getList",
//                parameters: {
//                    api_key: "bb4ea500727e218d0838ae2b40cf2369",
//                    photoset_id: "72157623918551670",
//                    photo_id: "4597269195"
//                }
//            }),
//            service: new jQuery.photoService.Mock(),
            size: "thumbnail",
            link: true,
            limit: 10
        },

        resizeBackground = (function (resizing) {
            return function ($image) {
                var containerHeight,
                    containerWidth,
                    imgHeight,
                    imgWidth;
                
                if (!resizing) {
                    resizing = true;
                    
                    containerHeight = $image.parent().height();
                    containerWidth = $image.parent().width();
                    imgHeight = $image.height();
                    imgWidth = $image.width();

                    $image.width(containerWidth);
                    $image.height(imgHeight + containerWidth - imgWidth);

                    if ($image.height() < containerHeight) {
                        $image.height(containerHeight);
                        $image.width(imgWidth + containerHeight - imgHeight);
                    }

                    setInterval(function () {
                        resizing = false;
                    }, 250);
                }
                
                return $image;
            };
        }(false));

    function loadBackground(options) {
        $title.animate({width: "hide"}, 250, 'easeInCirc', function () {
            $attribution.fadeOut(250);
        });

        $header.add($links).add($thumbnails.find('a'))
            .animate({opacity: 1}, 500);
            //.each(linkMax);

        $frame.find('img').fadeOut(250, function () {
            $frame.photoService(jQuery.extend(options, {
                success: function () {
                    var $this = this;
                    $this.find('img')
                        .hide()
                        .load(function () {
                            var photo = jQuery.photoService.getPhoto($this),
                                $that = jQuery(this);

                            $header.animate({opacity: 0.7}, 1000);

                            $links.add($thumbnails.find('a')).animate({opacity: 0.5}, 1000);

                            $attribution
                                .attr({
                                    href: photo.link,
                                    title: photo.attribution
                                })
                                .html('<span class="hidden">' + photo.attribution + '</span>')
                                .fadeIn(250, function () {
                                    $title.html(photo.title + '<span class="index"> (#' + photo.index + ' of ' + photo.total + ')</span>')
                                        .animate({width: 'show'}, 500, 'easeOutCirc');
                                });

                            resizeBackground($that.fadeIn(1500));
                            $that.resize().fadeIn(1500);
                        }
                    );
                },
                error: function (error) {
                    if (window && window.console) {
                        window.console.log(error);
                    }
                }
            }));
        });
    }

    function animateThumbnail(thumbnail, opacity, size, duration, delay) {
        jQuery(thumbnail)
            .clearQueue()
            .animate({opacity: opacity}, duration)
            .find('img')
                .clearQueue()
                .delay(delay)
                .animate({width: size, height: size}, duration);
    }

    function thumbnailMax(thumbnail) {
        animateThumbnail(this !== window ? this : thumbnail, 1, '64px', 500, 0);
    }

    function thumbnailMin(thumbnail) {
        animateThumbnail(this !== window ? this : thumbnail, 0.5, '32px', 500, 250);
    }
    function thumbnailLoad(i, thumbnail) {
        jQuery(thumbnail)
            .clearQueue()
            .delay(3000 - i * 250)
            .animate({opacity: 0}, 0, function () {
                jQuery(thumbnail)
                .show()
                .animate({opacity: 1}, 1000, function () {
                    setTimeout(thumbnailMin, 500, thumbnail);
                });
            });
    }

    function linkMax(link) {
        jQuery(this !== window ? this : link).clearQueue().animate({opacity: 1}, 500);
    }

    function linkMin(link) {
        jQuery(this !== window ? this : link).clearQueue().animate({opacity: 0.5}, 500);
    }

    $links.bind({
        mouseover: linkMax,
        focusin: linkMax,
        mouseout: linkMin,
        focusout: linkMin
    });
   
    jQuery('hr').css({opacity: 0.7});

    jQuery('#hd, #ft').css({opacity: 0})
        .clearQueue()
        .animate({opacity: 0.7}, 5000, 'linear');

    $header.bind({
        mouseover: function () {
            jQuery(this).clearQueue().animate({opacity: 1}, 500);
        },
        focusin: function () {
            jQuery(this).clearQueue().animate({opacity: 1}, 500);
        },
        mouseout: function () {
            jQuery(this).clearQueue().animate({opacity: 0.7}, 500);
        },
        focusout: function () {
            jQuery(this).clearQueue().animate({opacity: 0.7}, 500);
        }
    });

    $title.hide();

    $next.bind({
        click: function () {
            loadBackground(jQuery.extend({increment: 1}, background));
            this.blur();
            window.focus();
        }
    });

    $prev.bind({
        click: function () {
            loadBackground(jQuery.extend({increment: -1}, background));
            this.blur();
            window.focus();
        }
    });

    $play.toggle(
        function () {
            jQuery(this).toggleClass('pause');
            slideshow = setInterval(function () {
                $next.click();
            }, interval);
            $next.click();
            this.blur();
            window.focus();
        },
        function () {
            jQuery(this).toggleClass('pause');
            clearInterval(slideshow);
            this.blur();
            window.focus();
        }
    );

    jQuery(window).resize(function () {
        resizeBackground(jQuery('#frame > img'));
        $links.css({top: jQuery(window).height() - 30});
    });

    jQuery.keyboardListener.keyMap({
            39: 'RIGHT',
            37: 'LEFT',
            38: 'UP',
            40: 'DOWN',
            32: 'SPACE',
            17: 'CTRL',
            18: 'ALT',
            79: 'O',
            82: 'R'
        });

    jQuery(window.document)
        .keyboardListener({
            keydown: {
                CTRL_ALT_O: function () {
                    $options.toggleClass('hidden');
                },
                CTRL_ALT_R: function (event) {
                    var height = jQuery(window).height();

                    $links.each(function (i, link) {
                        jQuery(link)
                            .delay(i * 250)
                            .animate({top: "+=50px"}, 1000, function () {
                                jQuery(this).css({top: "-30px", opacity: 1});
                            })
                            .delay(2000 + i * 500)
                            .animate({top: height - 30}, height / 1000 * 5000, 'easeOutBounce', function () {
                                jQuery(this).animate({opacity: 0.5}, 2000).clearQueue();
                            });
                    });

                    this.keyboardListenerRemove(event.type, 'CTRL_ALT_R');
                },
                CTRL_RIGHT: function () {
                    this.keyboardListenerDetach();
                },
                SPACE: function () {
                    $play.addClass('active');
                },
                LEFT: function () {
                    $prev.addClass('active');
                },
                RIGHT: function () {
                    $next.addClass('active');
                }
            },
            keyup: {
                SPACE: function () {
                    $play.removeClass('active').click();
                },
                LEFT: function () {
                    $prev.removeClass('active').click();
                },
                RIGHT: function () {
                    $next.removeClass('active').click();
                }
            }
        })
        .click(function (event) {
            $links.each(linkMax);
        });

    jQuery.each($links, function (i, link) {
        jQuery(link)
            .css({left: i * 25 + 5})
            .delay(2000 + i * 750)
            .animate({top: jQuery(window).height() - 30}, jQuery(window).height() / 1000 * 5000, 'easeOutBounce', function () {
                jQuery(this).animate({opacity: 0.5}, 2000);
            });
    });

    jQuery('input[name=random]:radio')
        .each(function () {
            var $this = jQuery(this);
            if ($this.val() === jQuery.extend({}, jQuery.photoService.defaults(), background).random.toString()) {
                //alert($this.val());
                $this.attr('checked', true);
            }
            
            $this.click(function () {
                var $this = jQuery(this);
                if ($this.attr('checked') === true) {
                    background.random = $this.val() === 'true' ? true : false;
                }   
            });
        });

    jQuery('input[name=interval]:text')
        .each(function () {
            jQuery(this)
                .bind({
                    change: function () {
                        interval = jQuery(this).val();
                        if(slideshow) {
                            clearInterval(slideshow);

                            slideshow = setInterval(function () {
                                $next.click();
                            }, interval);
                        }
                    }
                })
                .keyboardListener({
                    bubble: false,
                    keydown: {
                        UP: function () {
                            //interval = parseInt(interval) + 1000;
                            this.val(parseInt(interval) + 1000).change();
                        },
                        DOWN: function () {
                            //interval = parseInt(interval) || 0 - 1000;
                            this.val(parseInt(interval) - 1000).change();
                        }
                    }
                })
                .val(interval);
        });

    jQuery('#thumbnails')
        .append(jQuery('<ul class="nav"/>'))
        .photoService(jQuery.extend({}, thumbnails, {
            success: function () {
                var $thumbnails = jQuery('#thumbnails');
                $thumbnails.find('a')
                    .hide()
                    .bind({
                        mouseover: thumbnailMax,
                        focusin: thumbnailMax,
                        mouseout: thumbnailMin,
                        focusout: thumbnailMin
                    })
                    .each(thumbnailLoad);
            }
        }));
    
    loadBackground(background);
}(jQuery, window));

