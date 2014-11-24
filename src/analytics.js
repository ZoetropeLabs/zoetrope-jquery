function(get){
    var state = get('state'),
        uuid = get('image'),
        startPosition = get('startPosition'),
        frameNormaliser = function(index){return index * (36 / state.colCount);},
        openTime,
        lastFrame,
        timeToWait = 500,
        // Cookie names
        USER_UUID_NAME = 'zoetrope-quality-anon',
        SESSION_UUID_NAME = 'zoetrope-session-anon',
        // reel properties - a few handy bits to always know about
        reelProperties = {
            UUID: uuid,
            isMiniViewer: $.browser.mobile,
            imageSize: get('size'), // Added in v3
            inline : get('inline'), // Also added in v3
        },

        viewID = Math.uuid(), // Pageview UUID

        // Configure the client object with your Project ID and (optional) access keys.
        keenConfig = {
            protocol: document.location.protocol,
            projectId: '{{keen-project-id}}',
            writeKey: '{{keen-write-key}}' // required for sending events
        },
        client = new Keen(keenConfig);

    state.analytics = {
        frameChangeTimeoutId : null,
        startFrame : startPosition,
        frameTracker : [],
        frameDiff : 0,
        zoomTracker : {
            trackingData :[]
        },
    };

    var instance = {

        zoetropeGlobalProperties : function() {
            var parser = $('<a>').attr('href', window.location.href)[0],
                url = {
                        protocol : parser.protocol,
                        domain :parser.hostname,
                        port : parser.port,
                        pathname : parser.pathname,
                        search : parser.search,
                        hash : parser.hash,
                        host : parser.host
                };

            instance.cookies();

            return function(eventCollection) {
                //Global properties to be sent with every event
                var globalProperties = {
                    ReelProperties: reelProperties,
                    permanent_tracker: state.analytics.permanentTracker,
                    session_id: state.analytics.sessionID,
                    ua_string: "$ua_string",
                    view_id : viewID,
                    url: url,
                    keen: {
                        addons : [
                            {
                                name : "keen:ip_to_geo",
                                input : {ip : "ip_address"},
                                output : "ip_geo_info"
                            },
                            {
                                name : "keen:ua_parser",
                                input : {
                                    ua_string : "user_agent"
                                },
                                output : "parsed_user_agent"
                            }
                        ]
                    },
                    ip_address : "${keen.ip}",
                    user_agent : "${keen.user_agent}",
                    timestamp : new Date().getTime()
                };
                return globalProperties;
            };
        },

        init : function() {
            // only runs onces
            if($('body').hasClass('zoe-analtics-inited')) return;
            $('body').addClass('zoe-analtics-inited');

            //Add information about the referrer of the same format as the current page
            var referrer = document.referrer;
            var referrerObject = null;
            var eventProperties = {};

            if(referrer !== undefined){
                var referrerParser = document.createElement('a');
                referrerParser.href = document.referrer;

                referrerObject = {
                    protocol : referrerParser.protocol,
                    domain :referrerParser.hostname,
                    port : referrerParser.port,
                    pathname : referrerParser.pathname,
                    search : referrerParser.search,
                    hash : referrerParser.hash,
                    host : referrerParser.host
                };
            }

            eventProperties.referrer = referrerObject;
            client.addEvent("pageviews", eventProperties);
        },

        cookies : function(){
            //Don't try to set a cookie if we're using file:// protocol (developer)
            if (document.location.protocol === "file:") {
                state.analytics.sessionID = state.analytics.permanentTracker = "untracked";
                return;
            }
            //Configure the jQuery cookie plugin to use JSON.
            $.cookie.json = true;

            //Set the amount of time a session should last.
            var sessionExpireTime = new Date();
            sessionExpireTime.setMinutes(sessionExpireTime.getMinutes()+30);

            //Check if we have a session cookie:
            var session_cookie = $.cookie(SESSION_UUID_NAME);

            //If it is undefined, set a new one.
            if(session_cookie === undefined){
                $.cookie(SESSION_UUID_NAME, {
                    id: Math.uuid()
                }, {
                    expires: sessionExpireTime,
                    path: "/" //Makes this cookie readable from all pages
                });
            }
            //If it does exist, delete it and set a new one with new expiration time
            else{
                $.removeCookie(SESSION_UUID_NAME, {
                    path: "/"
                });
                $.cookie(SESSION_UUID_NAME, session_cookie, {
                    expires: sessionExpireTime,
                    path: "/"
                });
            }

            var permanent_cookie = $.cookie(USER_UUID_NAME);

            //If it is undefined, set a new one.
            if(permanent_cookie === undefined){
                $.cookie(USER_UUID_NAME, {
                    id: Math.uuid()
                }, {
                    expires: 365, //10 year expiration date
                    path: "/" //Makes this cookie readable from all pages
                });
            }
            state.analytics.permanentTracker = $.cookie(USER_UUID_NAME).id;
            state.analytics.sessionID = $.cookie(SESSION_UUID_NAME).id;
        },

        // Events which should be called on widget actions
        on: {
            setup : function(){
                state.analytics.loadStart = +new Date();
            },
            preloadEnd : function(){
                state.analytics.loadEnd = +new Date();
                var openData = {
                    OpenStartTime: state.analytics.loadStart,
                    OpenEndTime: state.analytics.loadEnd,
                    OpenLoadTime: state.analytics.loadEnd - state.analytics.loadStart,
                };
            },


            // framechange
            pan : function(){
                //track the change
                var frame = frameNormaliser(state.blittedFrameIndex);

                if(frame != state.analytics.previousFrame){
                    state.analytics.frameTracker.push({
                        frame : frame,
                        timestamp : +new Date(),
                    });
                }
                state.analytics.previousFrame = frame;

                clearTimeout(state.analytics.frameChangeTimeoutId);
                state.analytics.frameChangeTimeoutId = setTimeout(function() {
                    if(frame != state.analytics.startFrame || state.analytics.frameTracker.length){
                        var viewData = {
                            startFrame : state.analytics.startFrame,
                            stopFrame: frame,
                            frameTracker: state.analytics.frameTracker,
                        };
                        console.log(state.analytics.frameTracker);
                        client.addEvent("viewChange", viewData);
                        state.analytics.startFrame = frame;
                    }
                    state.analytics.frameTracker = [];
                }, timeToWait);
            },

            zoomStart : function(){
                var zoomData = {
                    zoomState: true,
                };
                client.addEvent("zoom", zoomData);
            },
            zoomMove : function(e, x, y){
                if(!state.zoomUpdated) return;
                state.analytics.zoomTracker.trackingData.push({
                    x: x,
                    y: y,
                    timestamp: +new Date()
                });
            },
            zoomEnd : function(){
                var zoomData = {
                    zoomState: false,
                };
                console.log(state.analytics.zoomTracker);
                client.addEvent("zoomTracking", state.analytics.zoomTracker, function(){
                    state.analytics.zoomTracker.trackingData = [];
                });
                client.addEvent("zoom", zoomData);
            },

            helpStart : function(){
                var helpData = {
                    helpState: true,
                };
                state.analytics.helpOpenTime = +new Date();
                client.addEvent("help", helpData);
            },

            helpEnd : function(){
                var helpData = {
                    helpState: false,
                    helpDuration : +new Date() - state.analytics.helpOpenTime,
                };
                client.addEvent("help", helpData);
            },

            //called when the close button is pressed
            closeStart : function(){
                var timeNow = +new Date();
                var closeData = {
                    closeTime: timeNow,
                    timeOpen: timeNow - state.analytics.loadEnd,
                };
                client.addEvent("OpenClose",closeData);
            },
        },

    };

    // set global properties for this instance
    client.setGlobalProperties(instance.zoetropeGlobalProperties());
    instance.init();

    return instance.on;
}
