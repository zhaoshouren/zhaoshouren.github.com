/*!
 * Photo Service jQuery Plugin v1.0.RC1
 * http://zhaoshouren.com/
 *
 * Copyright 2010, Warren Chu
 * licensed under the MIT license
 *
 * requires:
 *  jQuery JavaScript Library
 *  http://jquery.com/
 * compatible with:
 *  v1.4.2
 */

/* JSLint – The JavaScript Code Quality Tool
 * http://www.jslint.com/
 *
 * settings below
 */
/*global window,ZS,jQuery*/
/*jslint
    white: true,
    browser: true,
    forin: true,
    onevar: true,
    undef: true,
    nomen: true, // 1 expected dangling '_' in '_content' since this property that is sometimes returned in the JSON by flickr
    eqeqeq: true,
    plusplus: true,
    bitwise: true,
    regexp: true,
    newcap: true,
    immed: true,
    strict: true
 */

"use strict"; // ES5 strict mode


//jQuery Photo Service plugin
(function (jQuery, pluginName) {
    var defaults = {
            empty: true, // empty contents of target element before appending image(s)
            limit: undefined, // maximum number of images to append; leave undefined to append all
            start: 0, // starting index, set to 'random' for random starting index
            increment: 1, //default increment for traversing retrieved images, set to -1 to traverse in reverse order
            link: false, // wrap image with link to image page at service (ie. flickr, Picasa)
            className: 'photo', //CSS class name used for <img> and <a>,<li> when generated
            random: false, // randomize sort order of retrieved images stored in indexes
            size: 'thumbnail', // original|thumbnail(square)|tiny(thumbnail at original aspect)|small|medium|large (avaiable sizes vary between services, selecting size that doesn't exist for particular image will default to original)

            // settings that are not meant to be overridden, used for maintaining state by plugin
            currentIndex: undefined, // current index in the photos[] collection stored in cache[]
            indexes: [], // sorted indexes for photos[]; either random or ordered
            randomized: false // whether indexes[] has been randomized or not
        },
        key = pluginName + ':configuration'; // for use with jQuery.data(key) to store configuration between calls to plugin

    function selectPhotos($element, photos, configuration) {
        var currentIndex = configuration.currentIndex,
            indexes = configuration.indexes,
            index,
            counter,
            limit,
            total = photos.length,
            className = configuration.className,
            start = configuration.start,
            random = configuration.random,
            randomized = configuration.randomized,
            size = configuration.size,
            photo,
            image,
            sources,
            $photos = jQuery('<div>'), //temporary node we'll use to build up the HTML chain before we attach it to the DOMex
            $photo,
            link = configuration.link;

        if (!isNaN(currentIndex)) {
            currentIndex = ((!random && randomized) ? indexes[currentIndex] : currentIndex) + configuration.increment;

            if (currentIndex >= total) {
                currentIndex = 0;
            }
            else if (currentIndex < 0) {
                currentIndex = total - 1;
            }
        }
        else {
            currentIndex = (start === 'random') ? Math.floor(Math.random() * total) : start;
            indexes = [];
        }

        if (!indexes.length || random !== randomized) {
            for (index = 0; index < total; index += 1) {
                indexes[index] = index;
                randomized = false;
            }
            if (random) {
                indexes.sort(function () {
                    return 0.5 - Math.random();
                });
                randomized = true;
            }
        }
        
        for (index = currentIndex, counter = 0, limit = configuration.limit || total; index < total && counter < limit; index += 1, counter += 1) {
            photo = photos[indexes[index]];
            image = photo.images[size];
            sources = photo.sources;

            $photo = image && jQuery(image) || jQuery('<img>', {
                'class': className,
                src: sources[size] || sources.original,
                alt: photo.attribution
            });

            if (link) {
                $photo = jQuery('<a>', {
                    href: photo.link,
                    'class': className
                }).append($photo);
            }

            $photos.append($photo);
        }

        configuration.currentIndex = currentIndex;
        configuration.indexes = indexes;
        configuration.randomized = randomized;
        $element.data(key, configuration);
        
        return $photos;
    }
    
    function appendPhotos($element, $photos, configuration) {
        if (configuration.empty) {
            $element.empty();
        }
        
        if ($element.is("ul")) {
            $photos.children().wrap('<li class="' + configuration.className + '">');
        }
        
        $element.append($photos.html());
    }

    jQuery.fn[pluginName] = function (new_configuration) {
        var $this = this,
            configuration = jQuery.extend(true, {}, defaults, $this.data(key), new_configuration);

        $this.data(key, configuration);
        
        return $this.each(function (index) {
            var $element = jQuery(this);
            
            configuration.service.getPhotos(
                $element, 
                function ($element, photos) {
                    var successHandler = configuration.success,
                        $selectedPhotos;

                    if (configuration.limit !== 0) {
                        $selectedPhotos = selectPhotos($element, photos, configuration);
                        appendPhotos($element, $selectedPhotos, configuration, index);
                    }

                    if (typeof(successHandler) === 'function') {
                        successHandler.call($element);
                    }
                }
            );
        }); 
    };

    jQuery[pluginName] = {
        getConfiguration: function ($target) {
            return $target && $target.data && $target.data(key) && $target.data(key) || defaults;
        },
        defaults: function (new_defaults) {
            return jQuery.extend(true, defaults, new_defaults);
        },
        getPhotos: function ($target) {
            var configuration = this.getConfiguration($target);
            
            return configuration.service && configuration.service.getCachedPhotos() || [];
        },
        getPhoto: function ($target) {
            var photos = this.getPhotos($target),
                configuration = this.getConfiguration($target);

            return photos.length ? photos[configuration.indexes[configuration.currentIndex] || 0] : {};
        }
        
    };
}(jQuery, 'photoService')); //if 'photoService' conflicts rename



//ZS Base
(function (window) { 
    window.ZS = window.ZS || {};
}(window));
  
(function (ZS) {
    if (!ZS.create) { //not defined
        //based on a snippet from http://www.jspatterns.com/
        //which in turn is based on stuff found on the net
        ZS.create = (function () {
            function Blank() {} //we only need to create this "blank" function once since we're replacing the prototype on each call
            
            return function (prototype, target, targetPrototype) {
                var property; 
                
                target = target || {}; // if undefined assign target a blank object;
                Blank.prototype = prototype;
                target.prototype = new Blank();
                target.uber = prototype;
                target.prototype.constructor = target;
                
                for (property in targetPrototype) {
                    target.prototype[property] = targetPrototype[property];
                }
                
                return target;
            };
        }());
    }
}(ZS));


//ZS.adapters (jQuery, Dojo, MooTools)
(function (ZS, jQuery) {
        
    //var adapters = {
    //map in chosen library (jQuery, MooTools, Dojo) context
    //or implement yourself
    //
    //    merge: function () {...},
    //    request: function () {...}
    //
    //    i.e. jQuery mappings
    //    merge: function (target, reference) {
    //      return jQuery.extend(true, target, reference);
    //    },
    //    request: jQuery.getJSON
    //};
    
    //jQuery
    var adapters = {
        merge: function (target, reference) {
            return jQuery.extend(true, target, reference);
        },
        request: jQuery.getJSON
    };
    
    //MooTools
    //var adapters = {
    //    merge: Object.append,
    //    request: function (url, callback) {
    //        return Request.JSON({url: url, onSuccess: callback});
    //    }
    //}

    //Dojo
    //var adapters = {
    //    merge: function (target, reference) {
    //        return dojo.mixin(target, reference);
    //    },
    //    request: function (configuration) {
    //        return dojo.(configuration.url, configuration.callback);
    //    }
    //}
    
    ZS.adapters = adapters.merge(ZS.adapters, adapters);
    
}(ZS, jQuery));

//ZS Photo Service
(function (ZS) {
    var prototypes = { //prototypes
            photo: { //prototype for Photo implementations
                //properties implemented in Child Functions
                
                //see init()
                //this.images – hash of Image()s created by load()
                //this.sources – hash of image source URLs created by map() - implement in child prototype
                
                //map: function (json) - implementation specific (3rd parameter of ZS.create(prototype, target, targetPrototype)
                //map json to 
                    //this[image || sources].original
                    //this[image || sources].thumbnail
                    //this[image || sources].tiny
                    //this[image || sources].small
                    //this[image || sources].medium
                    //this[image || sources].large

                    //this.attribution – see updateAttribution()
                    //this.author
                    //this.id  – id of photo on photo service
                    //this.index – index of photo in retrieved collection
                    //this.license – photo's license type
                    //this.link – URL to photo's page on photo service
                    //this.title
                    //this.total – total number of photos in retrieved collection
                    
                //site: "" - site URL; implementation specific
                
                init: function (json) {
                    var photo = this;
                    
                    photo.images = {};
                    photo.sources = {};
                    
                    photo.map(json);
                    
                    return photo;
                },

                updateAttribution: function () { //format title, if title is blank or undefined display [untitled], include author if available, and finally include site photo originates from
                    var photo = this;

                    photo.attribution = (photo.title !== "[untitled]" ? (photo.title.match(/"/g) ? photo.title : "\"" + photo.title + "\"") : photo.title) + (photo.author ? " by " + photo.author : "") + " (" + photo.site + ")";

                    return photo;
                },
                
                load: function (size) {
                    var photo = this,
                        images = photo.images,
                        sources = photo.sources;
                        
                    if (sources[size] && !images[size]) {
                        setTimeout( function () {
                            var image = new Image();
                            image.src = sources[size];
                            image.alt = photo.attribution;
                            images[size] = image;
                        }, 1);
                        
                    } 
                }
            },
            service: { //prototype for Service implementations
                cache: {}, //store photo objects here as key/value pairs; assigned to prototype so it's share across all service instances
                init: function (configuration) {
                    //this function is intended to be called by Child Functions which merges
                    //the configuration object with defined default values
                    var service = this,
                        merge = ZS.adapters.merge;

                    merge(service, service.defaults || {});
                    merge(service, configuration || {});

                    return service;
                },
                filterParameters: function (parameters, filters) {
                    //creates a querystring stub from filtered parameters
                    //filters defined in Child Functions
                    var filteredParameters = [],
                        index,
                        total,
                        filter,
                        parameter;

                    for (index = 0, total = filters.length; index < total; index += 1) {
                        filter = filters[index];
                        parameter = parameters[filter];
                        if (parameter) { //not undefined
                            filteredParameters.push(filter + '=' + parameter);
                        }
                    }

                    return filteredParameters.join('&');
                },
                getCachedPhotos: function () {
                    var service = this;
                    
                    return service.cache[service.getJsonURL(service.method)] || [];
                },
                throwError: function (message, name) {
                    var error = new Error(message);

                    error.name = name;

                    throw error;
                }
                //getPhotos: function(context, callback) - implementation specific
                //mapPhotos: function(data) - implementation specific; data: json, xml, etc
            }
        };
        
    ZS.prototypes = ZS.prototypes && ZS.adapters.merge(ZS.prototypes, prototypes) || prototypes;

}(ZS));
    
    //Flickr
(function (ZS) {    
    var FlickrPhoto = ZS.create(
        ZS.adapters.merge(
            ZS.prototypes.photo,
            {
                site: "www.flickr.com",
                map: (function () {
                    //store static data in a closure
                    var sizeMap = {
                            Square: 'thumbnail',
                            Thumbnail: 'tiny',
                            Small: 'small',
                            Medium: 'medium',
                            Large: 'large',
                            Original: 'original'
                        };

                    return function (json) {
                        var photo = this,
                            id = json.id,
                            secret = json.secret,
                            title = json.title,
                            originalsecret = json.originalsecret,
                            owner = json.owner,
                            height = json.height_o || json.o_height,
                            width = json.width_o || json.o_width,
                            base,
                            original,
                            size,
                            sources = photo.sources,
                            index,
                            total,
                            preload = json.preload;

                        photo.author = json.ownername || owner.username;
                        photo.id = id;
                        photo.index = json.index;
                        photo.link = "http://www.flickr.com/photos/" + (owner && owner.nsid || owner) + "/" + id + "/";
                        photo.title = title && title._content || title || "[untitled]";
                        photo.total = json.total;

                        if (!json.size) { //is undefined
                            base = "http://farm" + json.farm + ".static.flickr.com/" + json.server + "/" + id + "_";
                            original = originalsecret ? (base + originalsecret + "_o." + json.originalformat + "") : json.o_url;

                            base += secret;

                            sources.large = (height <= 1200 && width <= 1200) ? original : (base + ((height > 500 || width > 500) ? "_b" : "") + ".jpg");
                            sources.original = original || sources.large;
                            sources.thumbnail = base + "_s.jpg";
                            sources.tiny = base + "_t.jpg";
                            sources.small = base + "_m.jpg";
                            sources.medium = base + ".jpg";
                        }
                        else {
                            for (size in json.size) {
                                sources[sizeMap[size.label]] = size.source;
                            }

                            if (!sources.original) { //is undefined
                                sources.original = sources.large || sources.medium;
                            }
                        }

                        photo.updateAttribution();

                        for (index = 0, total = preload.length; index < total; index += 1) {
                            photo.load(preload[index]);
                        }
                    };
                }())
            }
        ), 
        function FlickrPhoto(json) { //assign function a name to make it easier to identify in supported debuggers
            return this.init(json); 
        }
    );

    var Flickr = ZS.create( 
        ZS.prototypes.service,
        function Flickr(configuration) { //assign function a name to make it easier to identify in supported debuggers
            return this.init(configuration); 
        }, 
        {
            defaults: {
                preload: false,
                parameters: {
                    extras: "owner_name,original_format,o_dims"
                }
            },
            getJsonURL: (function () {
                var filters = { //'api_key' is always required so it will be concatonated when passed to filterParameters
                    'flickr.favorites.getPublicList': ['user_id', 'min_fave_date', 'max_fave_date', 'extras', 'per_page', 'page'],
                    'flickr.groups.pools.getPhotos': ['group_id', 'tags', 'user_id', 'extras', 'per_page', 'page'],
                    'flickr.interestingness.getList': ['date', 'extras', 'per_page', 'page'],
                    'flickr.people.getPublicPhotos': ['user_id', 'safe_search', 'extras', 'per_page', 'page'],
                    'flickr.photos.getInfo': ['photo_id', 'secret'],
                    'flickr.photosets.getPhotos': ['photoset_id', 'extras', 'privacy_filter', 'per_page', 'page', 'media'],
                    'flickr.photos.getRecent': ['extras', 'per_page', 'page'],
                    'flickr.photos.search': ['user_id', 'tags', 'tag_mode', 'text', 'min_upload_date', 'max_upload_date',
                        'min_taken_date', 'max_taken_date', 'license', 'sort', 'privacy_filter', 'bbox', 'accuracy', 'save_search',
                        'content_type', 'machine_tag_mode', 'group_id', 'contacts', 'woe_id', 'place_id', 'media', 'has_geo', 'geo_context',
                        'lat', 'lon', 'radius', 'radius_unites', 'is_commons', 'extras', 'per_page', 'page'],
                    'flickr.photos.getSizes': ['photo_id']      
                };

                return function (method) {   
                    var flickr = this,
                        filter = filters[(method || this.method)];

                    if (!filter) { //is undefined
                        flickr.throwError("Could not find corresponding filter for method = '" + (method || this.method) + "'; if method is correct than it is not yet supported by this implementation.");
                    }

                    return "http://api.flickr.com/services/rest/?format=json&jsoncallback=?&method=" + (method || this.method) + "&" + flickr.filterParameters(flickr.parameters, filter.concat(['api_key']));
                };
            }()),
            getPhotos: function (context, callback) {
                var flickr = this,
                    url = flickr.getJsonURL(),
                    cache = flickr.cache,
                    request = ZS.adapters.request,
                    urlSizes;

                if (cache[url]) { //exists
                    callback(context, cache[url]);
                }
                else {      
                    request(url, function (photosJSON) {
                        if (photosJSON.stat === 'ok') {
                            if (flickr.method === 'flickr.photos.getInfo') {
                                urlSizes = flickr.getJsonURL('flickr.photos.getSizes');
                                request(urlSizes, function (sizesJSON) {
                                    if (sizesJSON.stat === 'ok') {
                                        cache[url] = flickr.mapPhotos(ZS.adapters.merge({index: 1, total: 1}, photosJSON.photo, sizesJSON.sizes));
                                        callback(context, cache[url]);
                                    }
                                    else {
                                        flickr.throwError("failed to retrieve JSON from Flickr using the following URL: " + urlSizes + (photosJSON ? "; Flickr returned message: " + photosJSON.message : "; no message received"));
                                    }
                                });
                            }
                            else {
                                cache[url] = flickr.mapPhotos(photosJSON.photos || photosJSON.photoset);
                                callback(context, cache[url]);
                            }
                        }
                        else {
                            flickr.throwError("failed to retrieve JSON from Flickr using the following URL: " + url + (photosJSON ? "; Flickr returned message: " + photosJSON.message : "; no message received"));
                        }
                    });
                }
            },
            mapPhotos: function (json) {
                var mappedPhotos = [],
                    photos = json.photo,
                    owner = json.owner,
                    index,
                    total,
                    merge = ZS.adapters.merge,
                    preload = this.preload;

                for (index = 0, total = photos.length; index < total; index += 1) {
                    mappedPhotos[index] = new FlickrPhoto(merge({index: index + 1, total: total, owner: owner, preload: preload}, photos[index]));
                }

                return mappedPhotos;
            }
        }
    );
        
    ZS.Flickr = Flickr; //add to ZS namespace

}(ZS));

//Add Flickr Service to Photo Service plugin
(function (jQuery, ZS) {
    jQuery.extend(jQuery.photoService, {
        Flickr: ZS.Flickr
    });
}(jQuery, ZS));
    
    
// Picasa
(function (ZS) {
    var PicasaPhoto = ZS.create(
        ZS.prototypes.photo,
        function PicasaPhoto(json) { //assign function a name to make it easier to identify in supported debuggers
            return this.init(json); 
        }, 
        {
            site: "picasaweb.google.com",
            map: function (json) {
                var photo = this,
                    sources = this.sources,
                    preload = json.preload,
                    index,
                    total;

                photo.author = json.feedAuthor || json.author[0].name.$t;
                photo.index = json.index;
                photo.link = json.link[2].href;
                sources.original = json.content.src;
                sources.thumbnail = json.media$group.media$thumbnail[0].url;
                photo.title = json.title.$t;
                photo.total = json.total;

                photo.updateAttribution();
                
                for (index = 0, total = preload.length; index < total; index += 1) {
                    photo.load(preload[index]);
                }
            }
        }
    );

    var Picasa = ZS.create(
        ZS.prototypes.service,
        function Picasa(configuration) { //assign function a name to make it easier to identify in supported debuggers
            return this.init(configuration); 
        }, 
        {
            defaults: {
                preload: false,
                parameters: {
                    imgmax: 1600, // Picasa currently limits image size for remote linking check with Picasa API for current limit
                    thumbsize: '64c' // add a default "square" thumbmail for Picasa
                }
            },
            getJsonURL: (function () { // create a closure so that filters, user, albumid will not have to be created with each call to getJsonURL
                var filter = ['access', 'alt', 'bbox', 'fields', 'imgmax', 'kind', 'l', 'max-results', 'prettyprint', 'q', 'start-index', 'tag', 'thumbsize'],
                    user = "user/",
                    album = "/albumid/";

                return function () {
                    var picasa = this,
                        userID = this.userID,
                        albumID = this.albumID,
                        url = "http://picasaweb.google.com/data/feed/api/";

                    switch (picasa.method) {
                    case 'user':
                        url += user + userID;
                        break;
                    case 'album':
                        url += user + userID + album + albumID;
                        break;
                    case 'photo':
                        url += user + userID + album + albumID + "/photoid/" + picasa.photoID;
                        break;
                    case 'community':
                        url += "all";
                        break;
                    case 'featured':
                        url += "featured";
                        break;
                    default:
                    }
                    url += "?alt=json&callback=?&kind=photo&" + picasa.filterParameters(picasa.parameters, filter);

                    return url;
                };
            }()),
            getPhotos: function (context, callback) {
                var picasa = this,
                    url = picasa.getJsonURL(),
                    cache = picasa.cache;

                if (cache[url]) {
                    callback(context, cache[url]);
                }
                else {     
                    ZS.adapters.request(url, function (json) {
                        if (json) {
                            cache[url] = picasa.mapPhotos(json.feed);
                            callback(context, cache[url]);
                        }
                        else {
                            picasa.throwError("failed to retrieve JSON from Picasa using the following URL: " + url);
                        }
                    });
                }
            },
            mapPhotos: function (json) {
                var mappedPhotos = [],
                    photos = json.entry,
                    author = json.author.length ? json.author[0].name.$t : undefined,
                    index,
                    total,
                    merge = ZS.adapters.merge,
                    preload = this.preload;

                for (index = 0, total = photos.length; index < total; index += 1) {
                    mappedPhotos[index] = new PicasaPhoto(merge({index: index + 1, total: total, feedAuthor: author, preload: preload}, photos[index]));
                }

                return mappedPhotos;
            }
        }
    );
        
    ZS.Picasa = Picasa; //add to ZS namespace

}(ZS));

//Add Picasa Service to PhotoService plugin
(function (jQuery, ZS) {
    jQuery.extend(jQuery.photoService, {
        Picasa: ZS.Picasa
    });
}(jQuery, ZS));




