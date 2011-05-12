/*!
 * Keyboard Listener jQuery Plugin v1.0.RC1
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
/*global jQuery*/
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

(function (jQuery) {
    var defaults = {
            'bubble': true, // events propagate up (bubble) the DOM, when set to false .stopPropagation() is called on the event object before the handler is called
            'delimiter': '_', // delimiter to use to construct key combination in conjuction with keyMap (i.e. CTRL_ALT_O)
            'keyup': {
                //CTRL_ALT_O: function (event) { ... }
                //SPACE: function (event) { ... }
            },
            'keydown': {
                //CTRL_ALT_O: function (event) { ... }
                //SPACE: function (event) { ... }
            }
        },
        key = 'keyboardListener:configuration', // key for use with jQuery.data(key) to store configuration by jQuery object to which plugin has been called upon
        keyMap = {}, // mappings of key codes to arbitrary string (i.e {39: 'RIGHT'})
        keys = [], // stores currently pressed keys by key code
        subscriptions = {
            keydown: {},
            keyup: {}
        };

    function exists(code, keys) {
        var index, limit;
        for (index = 0, limit = keys.length; index < limit; index += 1) {
            if (keys[index] === code) {
                return true;
            }
        }
        return false;
    }

    function process($this, event, configuration) {
        var currentKeys = jQuery.map(keys, function (code) {
                return keyMap[code];
            }).join(configuration.delimiter) || keyMap[event.which],
            eventType = event.type,
            defaultHandler,
            subscription,
            index,
            limit;
                
        defaultHandler = configuration[eventType][currentKeys];
        
        if (!configuration.bubble) {
            event.stopPropagation();
        }

        if (typeof(defaultHandler) === 'function') {
            defaultHandler.call($this, event);
        }
        
        if ($this.is('document')) {
            subscription = subscriptions[eventType][currentKeys];

            for (index = 0, limit = subscription.length; index < limit; index += 1) {
                subscription[index].trigger(eventType + ':' + currentKeys);
            }
        }
    }

    jQuery.fn.extend({
        'keyboardListener': function (new_configuration) {
            var $this = this, //equivalent to jQuery(this)
                configuration = jQuery.extend(true, {}, defaults, $this.data(key), new_configuration);

            $this.data(key, configuration);

            $this.keyboardListenerDetach = function () {
                $this.unbind('.keyboardListener');

                return $this;
            };

            $this.keyboardListenerRemove = function (eventType, keyCombination) {
                delete configuration[eventType][keyCombination];
                $this.data(key, configuration);

                return $this;
            };
            
            return $this.bind({
                'keydown.keyboardListener': function (event) {
                    var code = event.which;

                    if (!exists(code, keys)) {
                        keys.push(code);
                    }

                    process($this, event, configuration);
                },
                'keyup.keyboardListener': function (event) {
                    var code = event.which,
                        index,
                        total;

                    process($this, event, configuration);
                     
                    for (index = 0, total = keys.length; index < total; index += 1) {
                        if (keys[index] === code) {
                            keys.splice(index, 1);
                            break;
                        }
                    }
                }
            });
        }
    });


    jQuery.extend({
        'keyboardListener': {
            'getConfiguration': function (jQueryObject) {
                return (jQueryObject && jQueryObject.data) ? jQueryObject.data(key) : defaults;
            },
            'defaults': function (new_configuration) {
                return jQuery.extend(true, defaults, new_configuration);
            },
            'keyMap': function (new_keyMap) {
                return jQuery.extend(keyMap, new_keyMap);
            },
            'subscribe': function (eventType, keyCombination, subscriber) {
                var subscription = subscriptions[eventType][keyCombination] || [];
                subscriptions[eventType][keyCombination] = subscription.concat([subscriber]);
            },
            'unsubscribe': function (eventType, keyCombination, subscriber) {
                var subscription = subscriptions[eventType][keyCombination],
                    index,
                    limit;
                    
                for(index = 0, limit = subscription.length; index < limit; index += 1) {
                    if (subscription[index] === subscriber) {
                        subscription.splice(index, 1);
                        break;
                    }
                }
            }
            
        }
    });
}(jQuery));
