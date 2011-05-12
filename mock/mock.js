/*!
 * ZS Photo Service
 * -Mock
 * 
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


//ZS Photo Service
(function (ZS) {
        
    //Mock
    var MockPhoto = ZS.create(
        ZS.adapters.merge(
            ZS.prototypes.photo,
            {
                site: "www.flickr.com",
                map: function (json) {
                    var photo = this,
                        id = json.id,
                        secret = json.secret,
                        title = json.title,
                        originalsecret = json.originalsecret,
                        owner = json.owner,
                        height = json.o_height,
                        width = json.o_width,
                        base,
                        original,
                        sources = photo.sources,
                        index,
                        total,
                        preload = json.preload;

                    photo.author = json.ownername;
                    photo.id = id;
                    photo.index = json.index;
                    photo.link = "http://www.flickr.com/photos/" + owner + "/" + id + "/";
                    photo.title = title || "[untitled]";
                    photo.total = json.total;

                    base = "/zs/mock/images/" + id + "_";
                    original = originalsecret ? (base + originalsecret + "_o." + json.originalformat + "") : json.o_url;

                    base += secret;

                    sources.large = (height <= 1200 && width <= 1200) ? original : (base + ((height > 500 || width > 500) ? "_b" : "") + ".jpg");
                    sources.original = original || sources.large;
                    sources.thumbnail = base + "_s.jpg";
                    sources.tiny = base + "_t.jpg";
                    sources.small = base + "_m.jpg";
                    sources.medium = base + ".jpg";

                    photo.updateAttribution();

                    for (index = 0, total = preload.length; index < total; index += 1) {
                        photo.load(preload[index]);
                    }
                }
            }
        ),
        function MockPhoto(json) { //assign function a name to make it easier to identify in supported debuggers
            return this.init(json); 
        }
    );

    var Mock = ZS.create( 
        ZS.prototypes.service,
        function Mock(configuration) { //assign function a name to make it easier to identify in supported debuggers
            return this.init(configuration); 
        }, 
        {
            defaults: {
                preload: false
            },
            getJsonURL: function () {
                return "http://localhost/zs/mock/mock.json?jsoncallback=mock"
            },
            getPhotos: function (context, callback) {
                var mock = this,
                    url = mock.getJsonURL(),
                    cache = mock.cache;

                if (cache[url]) { //not undefined
                    callback(context, cache[url]);
                }
                else {      
                    cache[url] = mock.mapPhotos({"id":"72157623918551670", "primary":"3666755769", "owner":"71768238@N00", "ownername":"Zhao Shouren", "photo":[{"id":"4884497296", "secret":"9a679bf112", "server":"4117", "farm":5, "title":"windows \u2013 2010", "isprimary":"0", "ownername":"Zhao Shouren", "originalsecret":"dd48bc4e2e", "originalformat":"jpg", "o_width":"3456", "o_height":"2304"}, {"id":"4883624486", "secret":"a40e6fa36b", "server":"4093", "farm":5, "title":"windows \u2013 2010", "isprimary":"0", "ownername":"Zhao Shouren", "originalsecret":"f3f651b960", "originalformat":"jpg", "o_width":"3456", "o_height":"2304"}, {"id":"4884496850", "secret":"9ee3ef8bee", "server":"4095", "farm":5, "title":"skylights \u2013 2010", "isprimary":"0", "ownername":"Zhao Shouren", "originalsecret":"67de163462", "originalformat":"jpg", "o_width":"3456", "o_height":"2304"}, {"id":"4883017511", "secret":"d9823125af", "server":"4123", "farm":5, "title":"skylights \u2013 2010", "isprimary":"0", "ownername":"Zhao Shouren", "originalsecret":"9703913f45", "originalformat":"jpg", "o_width":"3456", "o_height":"2304"}, {"id":"4883892989", "secret":"315f5cbb2d", "server":"4080", "farm":5, "title":"skylights \u2013 2010", "isprimary":"0", "ownername":"Zhao Shouren", "originalsecret":"f17ac3d54b", "originalformat":"jpg", "o_width":"3456", "o_height":"2304"}, {"id":"4883011145", "secret":"a089c76408", "server":"4121", "farm":5, "title":"skylights \u2013 2010", "isprimary":"0", "ownername":"Zhao Shouren", "originalsecret":"def992996c", "originalformat":"jpg", "o_width":"3456", "o_height":"2304"}, {"id":"4597270069", "secret":"22f512b354", "server":"4062", "farm":5, "title":"", "isprimary":"0", "ownername":"Zhao Shouren", "originalsecret":"947a7e0398", "originalformat":"jpg", "o_width":"3456", "o_height":"2304"}, {"id":"4597883950", "secret":"eac1cbe43f", "server":"4020", "farm":5, "title":"over the Southwest: desert mountains \u2013 2010", "isprimary":"0", "ownername":"Zhao Shouren", "originalsecret":"a3c70f4bf2", "originalformat":"jpg", "o_width":"3456", "o_height":"2304"}, {"id":"4883891983", "secret":"55c4a6794c", "server":"4137", "farm":5, "title":"windows \u2013 2010", "isprimary":"0", "ownername":"Zhao Shouren", "originalsecret":"609594b591", "originalformat":"jpg", "o_width":"3456", "o_height":"2304"}, {"id":"4597027764", "secret":"6a8eb18f9c", "server":"4070", "farm":5, "title":"windows \u2013 2009", "isprimary":"0", "ownername":"Zhao Shouren", "originalsecret":"d19f6063c6", "originalformat":"jpg", "o_width":"3456", "o_height":"2304"}], "page":"1", "per_page":"10", "perpage":"10", "pages":8, "total":"75"});
                    callback(context, cache[url]);
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
                    mappedPhotos[index] = new MockPhoto(merge({index: index + 1, total: total, owner: owner, preload: preload}, photos[index]));
                }

                return mappedPhotos;
            }
        }
    );
        
    ZS.Mock = Mock; //add to ZS namespace
        
}(ZS));

(function (jQuery, ZS) {
    jQuery.extend(jQuery.photoService, {
        Mock: ZS.Mock
    });
}(jQuery, ZS));



