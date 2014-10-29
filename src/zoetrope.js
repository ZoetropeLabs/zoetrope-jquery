

(function(factory){
  // AMD, CommonJS and no loader compatibility
  var
	amd= typeof define == 'function' && define.amd && (define(['jquery'], factory) || true),
	commonjs= !amd && typeof module == 'object' && typeof module.exports == 'object' && (module.exports= factory),
	plain= !amd && !commonjs && factory()

})(function(){ return jQuery.reel || (function($, window, document, undefined){

	//jQuery 1.4.3 for proper .data() availibility
	 if (!$) return;
	var version = $ && $().jquery.split(/\./);
	if (!version || +(twochar(version[0])+twochar(version[1])+twochar(version[2] || '')) < 10403)
		return error('Your jQuery version is not supported by Zoetrope. Please upgrade your jQuery to version 1.4.3 or higher');

	var
		name = 'zoe',
		pre = name+'-',

		// Use the $.zoetrope name space to store zoetropes belonginings
		zoe = $.zoetrope = {

		// Version String
		version: '3.0.0-beta',

		//the event prefix name
		name : name,

		//The link displayed in help
		helpLink: 'http://zoetrope.io',

		brand: 'Interactive 3D photography by Zoetrope',

		brandShort : 'by Zoetrope',

		// CSS classes used by the zoetrope
		cls : {
			wrapper : pre+'engage-wrapper',
			mini : pre+'mini',
			inline : pre+'inline',
			engage : pre+'engage-image',
			loaded : pre+'engage-loaded-image',
			processed : pre+'processed',

			trigger : pre+'engage-trigger',
			triggerCta : pre+'trigger-cta',

			progressWrapper : pre+'progress-wrapper',
			progress : pre+'progress',

			helpOverlay : pre+'help-overlay',
			helpWrapper : pre+'help-wrapper',
			help : pre+'help',
			helpTile : pre+'help-tile',
			helpSection : pre+'help-section',
			helpSpacer: pre+'help-spacer',
			helpColumnPad : pre+'help-pad',
			helpImage: pre+'help-image',
			helpText: pre+'help-text',
			helpSections: {
				brand : pre+'help-brand',
				rotate : pre+'help-rotate',
				elevate : pre+'help-elevate',
				zoom : pre+'help-zoom',
			},
			helpPointer : pre+'help-triangle',

			overlayUnhide : pre+'unhide',

			zoom : pre+'zoom',
			zoomFrame: pre+'zoom-frame',
			cta : pre+'interact-cta',
			button: pre+'btn',
			buttonActive : pre+'btn-active',
			buttonArea: pre+'btn-wrapper',
			buttonHotSpot : pre+'btn-hot-spot',
			zoomWrapper: pre+'zoom-wrapper',
			newFrame: pre+'new-frame',
			frame: pre+'frame',
			frameIndicator: pre+'frame-',
			frameCover : pre+'frame-cover',
			zboxOuter : pre+'zbox-outer',
			galleryContainer : pre+'gallery',
			galleryImage : pre+'gallery-image',
			hasGallery : pre+'gallery'
		},

		id :{
			zboxOverlay : pre+'zbox-overlay',
			zboxContent : pre+'zbox-content'
		},

		html:{
			widget : '<div class="<%=zoe.cls.wrapper%>"></div>',
			buttonWrapper : '<div class="<%=zoe.cls.buttonHotSpot%>"><div class="<%=zoe.cls.buttonArea%>"></div></div>',
			button: '<a class="<%=zoe.cls.button%> <%=obj.buttonClass%>" title="<%=obj.buttonText%>" ><%=obj.buttonText%></a>',
			zoomWrapper : '<div class="<%=zoe.cls.zoomWrapper%>"></div>',
			help: '<div class="<%=zoe.cls.helpOverlay%>" > \
					<div class="<%=zoe.cls.helpPointer%>"></div> \
					<div class="<%=zoe.cls.helpWrapper%>"> \
						<% for(var i=0; i < obj.sections.length; i++){ %> \
							<div class="<%=zoe.cls.helpTile%> <%=obj.sections[i][\'class\']%>"> \
								<% if(typeof obj.sections[i].image !== "undefined") { %> \
									<%=obj.sections[i].image %>\
								<% } else { %>\
									<div class="<%=zoe.cls.helpImage%>"> </div> \
								<% } %>\
								<div class="<%=zoe.cls.helpText%>"><%=obj.sections[i].text%></div> \
								</div> \
						<% } %>',
			zoom: '<div class="<%=zoe.cls.zoom%>"></div>',
			progress: '<div class="<%=zoe.cls.progressWrapper%>"> \
				<div class="zoe-progress-z zoe-background">&nbsp;</div> \
				<div class="zoe-progress-z <%=zoe.cls.progress%>">&nbsp;</div> \
				</div>',
			cta : '<div class="<%=zoe.cls.cta%>"><%=zoe.strs.callToAction[$.browser.mobile ? "mobile" : "desktop"]%></div>',
			trigger : '<div class="<%=zoe.cls.trigger%>">\
							<div class="<%=zoe.cls.triggerCta%>"><span>&nbsp;</span><%=zoe.strs.inlineCallToAction[$.browser.mobile ? "mobile" : "desktop"]%></div>\
						</div>',
			zboxOverlay : '<div id="<%=zoe.id.zboxOverlay%>">&nbsp;</div>',
			zboxContent : '<div class="<%=zoe.cls.zboxOuter%>"><div id="<%=zoe.id.zboxContent%>"></div></div>',
			galleryContainer : '<div class="<%=zoe.cls.galleryContainer%>"></div>',
			galleryImage : '<img class="<%=zoe.cls.galleryImage%>" />'
		},

		// language strings, `strs` will contain the active language
		languages : /* languages.json */,
		strs : false,

		// Settings are objects with keys:
		// {
		//   type: {string|number|boolean}, // defaults to boolean
		//   init: value, // the default value
		//   process: bool, // if this should be overriden. if false, the init value will always be used
		//   required: bool, // fail if this is not provided in the init
		// }
		defaultSettings: {
			'image' : {type: 'string', required: true},
			'startPosition' : {type: 'number', init: 0},
			'showCta': {init :true}, //show call to action
			'inline': {init :true}, //show in palce (true) or in a popup (false)
			'preload' : {init :true},
			'loadspin' : {init :false}, //Do one revolution on load
			'loadspinLength' : {type:'number', init:3000, process: false}, //the number of millis to spend on the load spin
			'idleAnimate' : {init :false},  //animate the reel when idle
			'buttons' : {init: true}, // Show buttons - if you disable no zoom or help will be shown. mainly for auto-animate sitations.
			'gallery' : {init: false}, //show gallery
			'galleryImages' : {init : [], type: 'array'},
			'cdn' : {type: 'string', init: '{{image-cdn:url}}'},
			'break' : {type: 'number', init: 2500},
			'lang': {type: 'string', init: (window.navigator.userLanguage || window.navigator.language)},
			'size' : {type: 'enum', init: 0, options:[0,250,500,1000]}
		},

		// The initial state of the element
		initState : {
			interactive: false, // True when the user is interacting
			velocity: 0,
			delta_cursor: [0,0], //used to store the last two deltas which are used for velocity calulation on `up`.
			lastPanCursor : {x :0, y:0},
			row: 0, //degrees [0-360]
			col: 0, //degrees [0-90]
			rowCount: 3,
			colCount: 36,
			idleTimeout: null,
			updated : true, //used to sync `pan` with `tick.zoetrope`, for performance reasons
			blittedFrameIndex: null,
			frames: [], // stores the frames DOM.
			zoomed: false, //true when zoomed
			zoomUpdated: true, //used to sync zoom with ticker
			resizeUpdated: true,
			touchstart: null, //used for pinch zoom
			animate: true, // If animation is enabled.
			preloadProgress : 0, //index
			preloadStartTime : 0, // start time for end time estimation
			progressPercentage : 0, //set separately for the progress bar
			progressMax : false, // the frame to use as 100% on the preload
			loaded : false
		},

		//pool for binding events to
		pool: $(window),

		ns : '.zoe',

		fps : 35,

		analytics : /* analytics.js */,

		// ### $.zoetrope.scan() Method
		// Will init all Zoetrope images on the page on load
		// anything with the class `zoe-engage-image` will be
		// loaded.
		scan: function(){
			return $(dot(zoe.cls.engage)+':not('+dot(zoe.cls.processed)+')').zoetrope()
		},

		// The only exposed functions are Zoetrope and unZoetrope
		fn:{


			// the main event
			// All state information is stored using $.data()
			zoetrope: function(){
				//drop out if we're not compatible
				if(!zoeCompatible()) return;

				var $this = $(this),
					$applicable = $this.filter('img:not('+dot(zoe.cls.processed)+')[data-zoe-image]').each(function(){
						var $this = $(this),
							//cache original markup
							$original = $this.clone(),
							// simple get/set interface for state, bound to scope
							get = function(key){ return $this.data(key); },
							set = function(key, value){ return $this.data(key,value).data(key);},
							getImageSrc = function(index){
								var size = get('size'),
									state = get('state'),
									m = 36/state.colCount;
									row = floor(index*m / 36),
									col = index*m % 36,
									rowPart = row * 36,
									// on small reels, we may need to offset to get the start position correct
									colPart = (col + (m != 1 ? get('startPosition')%2 : 0)) % 36,
									index = (rowPart + colPart) % 108;


								if(arguments.length == 2){
									size = arguments[1];
								}
								// Normalise - there are 36 images per row normally, sometimes we want to offset to make sure
								// we can use odd starting positions too.


								return get('cdn')+'/'+get('image')+'/'+size+'/'+index+'.jpg';
							},
							getZoomSrc = function(index){
								return getImageSrc(index,1000);
							},

						on = {

							// Setup init's the zoetrope reel - what we do here changes a lot dependant
							// on if it's going to be in an overlay
							setup: function(){

								// Make settings from data-* and defaults.
								parseSettings($this, zoe.defaultSettings);
								setLangage($this);

								//add markup and move this up to it.
								var data = $this.data();
								$wrapper = tmpl(zoe.html.widget);
								$wrapper.data(data);

								//set the size of the wrapper based on the size of the img
								$wrapper.width($this.width() || 500);

								//normal - load with page
								if(get('inline')){
									$this.wrap($wrapper);
									$this = $this.parent();

									if(!get('preload')){
										var $trigger = tmpl(zoe.html.trigger);
										$trigger.width($this.width() || 500);
										//insert the trigger markup
										$this.before($trigger);
										$trigger.prepend($this);
										$trigger.on('click', function(){
											$trigger.before($this);
											$trigger.remove();
											$this.trigger('setup');
										})
									}
								}
								// Load in zbox
								else{

									// Add trigger wrapper
									var $trigger = tmpl(zoe.html.trigger);
									//insert the trigger markup
									$this.before($trigger);
									$trigger.prepend($this);

									$wrapper.append($this.clone());
									$this = $wrapper;
									// Attach tiggers
									on.zbox.attach();
									$trigger.on(evns(['mouseup', 'touchstart'], 'zbox'), on.zbox.open);

									//save this as the inital state
									$original = $this.clone(true);
								}


								//bind all instance handlers
								$this.on(on.instance);

								if(get('inline') && get('preload')){
									$this.trigger('setup');
								}

							},

							//instance events which are bound to the element
							instance: {

								//destroy the instance
								'teardown.zoetrope' : function(){
									$this.stop(true, true);
									zoe.pool.off(on.pool);
									$(window).off(on.window);
									$this.replaceWith($original);
									delete $this;
								},

								// Does most of the setup, following from on.setup()
								// Creates the actual reel
								setup : function(){
									// Init the instances state
									var state = set('state', $.extend(true, {}, zoe.initState)),
										startPosition = get('startPosition'); //start position needs to be set from the settings

									//set the protocol on the CDN if it doesn't contain
									//a protocol already.
									var cdn = get('cdn')
									if(cdn.indexOf('://') == -1){
										var prepend = (window.location.protocol == 'https://' ? 'https:' : 'http:');
										if(cdn.indexOf('//') != 0) prepend += '//';
										cdn = prepend + cdn;
									}
									set('cdn', cdn);


									//Choose an image size - accounts for mobile
									// Sometimes size will be forced by the viewer options
									if(!get('size')){
										$this.data('size', imageSize());
									}

									// Mobile mode?
									if($.browser.mobile){
										state.colCount = 18; //half images
										zoe.fps = 25; // reduce frame rate (less than 1/3rd of normal)
										state.animate = false; // No animation to make it more responsive.
									}

									// take frame and work out angle
									state.col = (startPosition % 36) * 10;
									state.row = floor(startPosition / 36) * 30;
									//bind global stuff
									addInstance($this);
									zoe.pool.on(on.pool);
									$(window).on(on.window);

									// bind analytics
									var analytics_events = zoe.analytics(get);
									$.each(analytics_events, function(key, ev){
										$this.on(evns(key, 'analytics'), ev);
									})


									if(get('buttons')){
										// Add button container.
										var $buttonArea = tmpl(zoe.html.buttonWrapper),
											buttonNames = ['help'];

										//only zoom when it's not already massive!
										if($this.width() < 1000){
											buttonNames.unshift('zoom');
										}

										if(!get('inline')){
											buttonNames.unshift('close');
										}

										$this.append($buttonArea);

										// Create the buttons. buttons trigger '{name}Start' on odd clicks and '{name}End' on even clicks
										$.each(buttonNames, function(i, name){
											var contents = {
													buttonClass: pre+'btn-'+name,
													buttonText: name,
												},
												oddClickName = name+'OddClick',
												$btn = tmpl(zoe.html.button, contents);

											$btn.data(oddClickName, true);
											$btn.on('mouseup touchstart',function(){
												//callbacks that add the event triggering on $this
												$this.stop(); //cancel animations
												if($btn.data(oddClickName)){
													$(this).addClass(zoe.cls.buttonActive);
													//deactivate other buttons
													$btn.siblings(dot(zoe.cls.buttonActive)).mouseup();
													$this.trigger(name+'Start');
												}
												else{
													$btn.removeClass(zoe.cls.buttonActive);
													$this.trigger(name+'End');
												}
												$btn.data(oddClickName, !$btn.data(oddClickName));
												return false;
											});
											$buttonArea.hide()
											$buttonArea.find(dot(zoe.cls.buttonArea)).append($btn);
											// jQuery adds 'style="display:inline;' for some reason, but we really don't want that
											$btn.removeAttr('style');
											//run the setup handler for this
											$this.trigger(name+'Setup');
										});
									}

									// Gallery images
									if(get('gallery') && get('galleryImages').length){
										//add the class now so that page reflows sooner
										$this.addClass(zoe.cls.hasGallery);

										$this.on('preloadEnd', function(){
											var $gallery = tmpl(zoe.html.galleryContainer),
												images = get('galleryImages');

											$gallery.hide();
											$this.append($gallery);

											// Will only show first 4 at the moment
											$.each(images, function(k,v){
												if(k > 3) return;
												// convert index to angle, then using state
												// convert back to being an index so that we
												// compensate for differences in the number of frames etc
												var pos = + v.position,
													angleCol = (pos % 36) * 10,
													angleRow = floor(pos / 36) * 30,
													col = floor(angleCol/(360 / state.colCount)),
													row = angleRow/(90/state.rowCount),
													index = col + row*state.colCount,
													$image = state.frames[index]
																.clone()
																.attr('class','')
																.addClass(zoe.cls.galleryImage),
													url = getImageSrc(index);

												$image.attr('src', url);
												$gallery.append($image);
												//animation bind
												$image.on('touchstart mouseover', function(){
													//Disable any active buttons
													$(dot(zoe.cls.buttonArea) + ' ' + dot(zoe.cls.buttonActive)).mouseup();
													$this.stop(true).animate({'zoetropeImage' : pos}, 500);
												});
											});
											$gallery.fadeIn(300);
										});
									}

									$this.trigger('zoetropeResize');
									$this.trigger('preload');

									//optionally show the CTA. don't show if we're autospining, wait until we're done
									if(!get('loadspin') && get('showCta'))
										$this.trigger('showCta');
								},

								//loads all the required images
								preload : function(){
									var state = get('state'),
										frames = state.colCount * state.rowCount;

									//init the frames state on the first event fire
									if(!state.frames.length){
										for(var i = 0; i < frames; i++){
											state.frames[i] = null;
										}
										state.currentlyLoading = 0;
										state.preloadStartTime = +new Date();
										state.progressMax = frames;
										$this.append(tmpl(zoe.html.progress));
									}
									else{
										state.currentlyLoading--;
									}

									var index = getNextIndex(state);
									while(state.currentlyLoading < 4 && index !== -1){
										// we actually create the images which will be shown here
										state.currentlyLoading++;
										var	$img = $('<img>')
														.addClass(zoe.cls.frame).addClass(zoe.cls.frameIndicator+index)
														.attr('src', getImageSrc(index))
														.attr('draggable', 'false')
														.load(function(){ $this.trigger('preload') } );
										state.frames[index] = $img;
										state.preloadProgress++;
										index = getNextIndex(state);
									}
									if(!state.currentlyLoading && index === -1) $this.trigger('preloadEnd');
									else $this.trigger('preloadProgress');

									function getNextIndex(state){

										if(typeof state.preload === 'undefined'){
											var startPosition = get('startPosition'),
												col = (startPosition % 36) * 10,
												row = floor(startPosition / 36) * 30;

											state.preload = {
												col: floor(col/(360 / state.colCount)),
												row: row/(90/state.rowCount),
											};
										}
										var ret_index;

										//We spilt the frames into the 3 layers to allow us to load
										//A complete layer for the load spin without waiting for everything.
										//This bit ensures we keep choosing images from the right layer,
										//even if the start position is half way through a layer
										for(i=0; i < 3; i++){
											var rowChoice = (state.preload.row + i) % 3;
											var arrSlice = state.frames.slice(rowChoice*state.colCount, (rowChoice+1)*state.colCount);
											//start from the startingPosition, so that animation can begine ASAP
											ret_index = $.inArray(null, arrSlice, state.preload.col);
											if( ret_index === -1){
												ret_index = $.inArray(null, arrSlice);
											}
											if( ret_index !== -1){
												ret_index = ret_index + rowChoice*state.colCount;
												return ret_index;
											}
										}
										return -1;
									}
								},

								preloadProgress : function(){
									var state = get('state'),
										progress = state.preloadProgress,
										total = (state.colCount * state.rowCount);

									//use this time to estimate the rest of the frames
									// we only need to wait for the first row to load, which is 1/3rd of the total
									// we use the fist
									if(get('loadspin') && progress == total/9){
										var start = state.preloadStartTime,
											now = +new Date(),
											diff = now - start,
											// we're 1/9th of the way through, the remaining 2/9ths should be this long.
											// (which will mean we're 1/3rd complete, the first row will be loaded)
											projectedTotal = diff*1,
											//based on this, we can start the animation so that it wont overtake the furthest loaded frame.
											//that might be right away if browser cache is involved
											startSpinner = max(0, projectedTotal - get('loadspinLength'));

											//update the 100% position on the spinner
											state.progressMax = (startSpinner/diff) * (total/9) + total/9;

											setTimeout(function(){
												$this.trigger('progressHide');
												$this.animate({zoetropeColDelta:360}, get('loadspinLength'),function(){
													if(get('showCta')) $this.trigger('showCta');
													$this.trigger('showButtons');
												});
											}, startSpinner);
									}

									//update the progress bar
									state.progressPercentage = min(100, (100 * (progress/state.progressMax)));
									var height = $this.find(dot(zoe.cls.progressWrapper)).height();
									$this.find(dot(zoe.cls.progress)).height((state.progressPercentage/100)*height);
								},

								progressHide: function(){
									var $progress = $this.find(dot(zoe.cls.progressWrapper))
									$this.find(dot(zoe.cls.progress)).css('height', '100%');
									// zoom fade
									$progress.animate(
									{
										opacity : 0,
										width : 160,
										height : 160,
										marginLeft : -80,
										marginTop : -80,
									},
									250, function(){ $progress.hide(); });
								},

								//called when a frame is loaded - used to perform early animation
								preloadEnd : function(e, frame){
									var state = get('state');
									state.loaded = true;
									$this.trigger('progressHide');
									if(!get('loadspin')){
										$this.trigger('showButtons');
									}
								},

								// down psudeo event, which fired by either mousedown or touchstart
								down : function(e, x, y, ev){
									var state = get('state');

									// Ensure this wasn't a gallery click.
									if(ev && $(ev.target).hasClass(zoe.cls.galleryImage)) return;

									$this.stop(true);
									if(state.idleTimeout) clearTimeout(state.idleTimeout);
									//make sure buttons come in when we start doing stuff
									$this.trigger('showButtons');

									state.interactive = true;
									state.lastPanCursor = {x:x, y:y};
									state.delta_cursor = [0, 0];
									state.velocity = 0;
									zoe.pool.on(evns(['mousemove','touchmove']), drag);
									zoe.pool.one(evns('mouseup'), lift);
									zoe.pool.one(evns(['touchend', 'touchcancel', 'touchleave']), lift);
									function drag(e){ return $this.trigger('pan', [pointer(e).clientX, pointer(e).clientY, e]) && e.give; }
									function lift(e){ return $this.trigger('up', [e]) && e.give; }
								},

								'mousedown touchstart': function(e){
									var state = get('state');
									if(typeof state == 'undefined' || state.zoomed) return;
									return $this.trigger('down', [pointer(e).clientX, pointer(e).clientY, e]) && e.give;
								},

								// called when the user stops interacting
								up : function(e, ev){
									var state = get('state'),
										width = $this.width();

									zoe.pool.off(evns());
									state.interactive = false;

									// `state.delta_cursor` holds the last 2 deltas
									state.velocity = (state.delta_cursor[0] + state.delta_cursor[1]) / 0.2;

									//the delay before idle is 800ms, at which point we
									//trigger the idle event
									setTimeout(function(){$this.trigger('idle')}, 800);
								},

								pan: function(e, x, y, ev){
									var state = get('state');

									// used to timer sync
									if(!state.updated){
										ev && (ev.give = false);
										return;
									}
									state.updated = false;

									var lastPanCursor = state.lastPanCursor,
										delta = { x: x - lastPanCursor.x, y: y - lastPanCursor.y },
										abs_delta = { x: abs(delta.x), y: abs(delta.y) },
										width = $this.width(),
										height = $this.height();

									if (abs_delta.x > 0){
										if(abs_delta.x > 5) // vetical tolerance
											ev && (ev.give = false);
										state.lastPanCursor.x = x;
										//column change
										var change = delta.x / (width/360),
											// Add 360 to prevent it ever going negative.
											newCol = (state.col + change + 360) % 360;
										state.col = newCol;
										// update for velocity calcs
										state.delta_cursor.push(delta.x)
										state.delta_cursor.shift()
									}
									if (abs_delta.y > 0){
										state.lastPanCursor.y = y;
										//row change
										var change = delta.y / (width/250),
											newRow = min_max(0, 90, state.row + change);
										//pass on the event if no change (helps with page scrolling)
										if((state.row != 0 && delta.y < 0)
											|| (state.row != 90 && delta.y > 0))
											ev && (ev.give = false);
										state.row =  newRow;
									}
								},


								// called when the canvas is idle
								idle : function(){

								},

								showCta : function(){
									var $markup = tmpl(zoe.html.cta);
									$markup.hide();
									$this.prepend($markup);
									$markup.fadeIn(250);
									$this.one(evns(['mousedown', 'touchstart', 'mousewheel'], 'cta'), function(){
										$markup.fadeOut(100, function(){
											$markup.remove();
										});
									});
								},

								showButtons : function(){
									$this.find(dot(zoe.cls.buttonHotSpot)).fadeIn(200);
									$this.off('showButtons');
								},

								helpSetup: function(){
									var sections = [],
										tiles = ['rotate', 'elevate', 'zoom', 'brand'];

									for(var i=0; i< tiles.length; i++){
										var name = tiles[i],
										settings = {
											'class' : zoe.cls.helpSections[name],
											text : zoe.strs[name],
										};
										if(name == 'brand'){
											settings.text = $('<a>').text(zoe.brandShort).attr('href', zoe.helpLink)[0].outerHTML;
											settings.image = $('<a>').addClass(zoe.cls.helpImage).text(zoe.brand)
																		.attr('title', zoe.brand).attr('href', zoe.helpLink)[0].outerHTML;
										}
										sections.push(settings);
									}

									//add mouse handler to close help on click

									var $help = tmpl(zoe.html.help, {sections: sections});
									$help.click(function(){ $this.trigger('helpEnd')});
									$help.find(dot(zoe.cls.helpWrapper)).click(function(e){ e.stopPropagation(); });
									$help.hide();
									$this.append($help);
								},

								// Show the help area
								helpStart: function(){
									var $help = $this.find(dot(zoe.cls.helpOverlay));
									//position triangle
									var top = $this.find(dot(pre+'btn-help')).offset().top - $this.find(dot(zoe.cls.buttonArea)).offset().top;
									$this.find(dot(zoe.cls.helpPointer)).css('top', top);
									$help.fadeIn();
									//Odd IE quirk that needs to reevaluate CSS
									$(dot(zoe.cls.helpImage), $help).attr('data-id', 'background-update');
								},

								helpEnd: function(){
									var $help = $this.find(dot(zoe.cls.helpOverlay));
									$help.fadeOut();
								},

								// Bonus scroll handler
								mousewheel: function(e){
									var state = get('state');
									if(typeof state == 'undefined') return;
									if (e.originalEvent.wheelDelta >= 0) {
										if(!state.zoomed && $this.find(dot(pre+'btn-zoom')).length){
											$this.find(dot(pre+'btn-zoom')).mouseup();
											return false;
										}
									}
									else if(state.zoomed){
										$this.find(dot(pre+'btn-zoom')).mouseup();
										return false;
									}
								},

								'touchstart.zoom': function(e){
									var state = get('state');
									if(typeof state == 'undefined') return;
									state.touchstart = e.originalEvent.touches;
								},

								'touchend.zoom' : function(e){
									var state = get('state');
									if(typeof state == 'undefined') return;
									state.touchstart = null;
								},

								'touchmove.zoom': function(e){
									var state = get('state');
									if(typeof state == 'undefined') return;
									if(state.touchstart && e.originalEvent.touches.length == 2){
										var pinch1_f1 = state.touchstart[0],
											pinch1_f2 = state.touchstart[1],
											pinch2_f1 = e.originalEvent.touches[0],
											pinch2_f2 = e.originalEvent.touches[1],
											pinch1_size = sqrt(sq(pinch1_f1.clientX - pinch1_f2.clientX) + sq(pinch1_f1.clientY - pinch1_f2.clientY)),
											pinch2_size = sqrt(sq(pinch2_f1.clientX - pinch2_f2.clientX) + sq(pinch2_f1.clientY - pinch2_f2.clientY)),
											scaleUp = pinch2_size > (pinch1_size+20),
											scaleDown = pinch2_size < (pinch1_size-20); //20's a threshold

										if (scaleUp && !state.zoomed) {
											$this.find(dot(pre+'btn-zoom')).mouseup();
										}
										else if(state.zoomed && scaleDown){
											$this.find(dot(pre+'btn-zoom')).mouseup();
										}
									}
								},

								// Zoom
								zoomSetup: function(){
									var $zoomDiv = tmpl(zoe.html.zoom);
									$zoomDiv.hide();
									$this.append($zoomDiv);
								},

								zoomStart: function(){
									var state = get('state'),
										$zoomDiv = $this.find(dot(zoe.cls.zoom)),
										zoomUrl = getZoomSrc(state.blittedFrameIndex),
										offset = $this.offset(),
										size = $this.outerWidth();

									$this.trigger('showButtons');

									//add the image to zoom
									$('<img>')
										.attr('src', zoomUrl)
										.addClass(zoe.cls.zoomFrame)
										.appendTo($zoomDiv);

									//show the zoom div
									$zoomDiv.stop().css('display', 'block').fadeTo(100, 1);

									//events on the zoom area
									$zoomDiv.on(evns(['mouseleave'],'zoom'), leave);
									$zoomDiv.on(evns(['mouseenter'],'zoom'), enter);
									$zoomDiv.on(evns(['mousemove'], 'zoom'), move);
									$zoomDiv.on(evns(['touchmove'], 'zoom'), invertedMove);
									//prevent touches effecting position
									$zoomDiv.on(evns('mousedown', 'capture'), capture);

									//move to the buttons zoom position
									$this.trigger('zoomMove', [size/2, size/2, true]);

									state.zoomed = true;

									function move(e){ var offset = $this.offset(); $this.trigger('zoomMove', [pointer(e).pageX - offset.left, pointer(e).pageY - offset.top, false, e]); return false;}
									function invertedMove(e){ var offset = $this.offset(); $this.trigger('zoomMove', [pointer(e).pageX - offset.left, pointer(e).pageY - offset.top, true, e]); return false;}
									function leave(){ $this.trigger('zoomLeave'); return false; }
									function enter(){ $this.trigger('zoomEnter'); return false; }
									function capture(){ return false;}
								},

								zoomEnd: function(){
									var state = get('state'),
										$zoomDiv = $this.find(dot(zoe.cls.zoom));
									$zoomDiv.stop().fadeTo(100, 0, function(){
										$zoomDiv.css('display', 'none').empty(); // Delete the zoom image
									});
									$this.off(evns(false,'zoom'));
									state.zoomed = false;
								},

								// Set the image margins etc
								// There are some shortcuts because we know the image is square.
								// Also synced with the page timer
								zoomMove: function(e, x, y, invert){
									// syncing
									var state = get('state');
									if(!state.zoomUpdated) return;
									state.zoomUpdated = false;
									// offset calcs
									var $zoomDiv = $this.find(dot(zoe.cls.zoom)),
										$img = $zoomDiv.find('img'),
										sourceSize = $img.outerWidth(),
										size = $zoomDiv.outerWidth(),
										offset = $zoomDiv.offset(),
										ratio = (sourceSize - size) / size;

									if(invert){
										var xoff = (x - size) * ratio;
										var yoff = (y - size) * ratio;
									}
									else{
										var xoff = (x * -ratio);
										var yoff = (y * -ratio);
									}
									$img.css('left', min_max(-sourceSize+size, 0, xoff) + 'px');
									$img.css('top', min_max(-sourceSize+size, 0, yoff) + 'px');
								},

								zoomEnter: function(){
									var $zoomDiv = $this.find(dot(zoe.cls.zoom));
									$zoomDiv.stop().fadeTo(100, 1);
								},

								zoomLeave: function(){
									// TODO add animation back to center
									var $zoomDiv = $this.find(dot(zoe.cls.zoom));
									$zoomDiv.stop().fadeTo(100, 0);
								},

								//close button only has a start action
								closeStart: function(){
									on.zbox.close();
								},

								stepRight: function(){
									var state = get('state');
										state.col = (state.col + 1) % 36;
								},

								stepLeft: function(){
									var state = get('state');
										state.col = (state.col - 1) % 36;
								},

								stepUp: function(){
									var state = get('state');
										state.row = min((state.row + 1), 2);
								},

								stepDown: function(){
									var state = get('state');
										state.row = max((state.row - 1),0);
								},

								// Resize event, also called on init. Make sure the area is square, based on width
								// limited to `zoe.fps` Hz.
								zoetropeResize: function(){
									var state = get('state');

									if(!state.resizeUpdated) return;
									state.resizeUpdated = false;

									$this.height($this.outerWidth());
								}
							},

							// Events bound to the lightbox aspects - if required.
							zbox : {
								attach: function(){
									//add the markup if it's not already in
									if(!$(hash(zoe.id.zboxContent)).length){
										var $zboxOverlay = tmpl(zoe.html.zboxOverlay),
											$zboxContent = tmpl(zoe.html.zboxContent);
										$zboxOverlay.append($zboxContent);
										$('body').append($zboxOverlay);
										$zboxContent.click(function(){return false;}); //isolate child from propogating clicks
									}
								},
								'open': function(ev){
									var $zboxOverlay = $(hash(zoe.id.zboxOverlay)),
										$zboxContent = $(hash(zoe.id.zboxContent));

									//certain things need hiding for the zbox
									$('embed:visible, object:visible').addClass(zoe.cls.overlayUnhide).css('visibility', 'hidden');
									$zboxOverlay.css('display','block').fadeIn(200, 0.6);
									$zboxContent.append($this);
									$zboxOverlay.on(evns(['mousedown', 'touchstart'], 'zbox'), function(e){ on.zbox.close(e); });

									//attach events if required
									if(!$._data($this[0], 'events'))
											$this.on(on.instance);


									$this.trigger('setup');
								},
								'close': function(ev){
									var $zboxOverlay = $(hash(zoe.id.zboxOverlay)),
										$zboxContent = $(hash(zoe.id.zboxContent));

									// If we're forcing the event, or if the event was not on
									// the overlay, don't exit.
									var actionable = !ev || $zboxOverlay.is(ev.target);
									if(!actionable) return;

									$this.trigger('teardown');
									$zboxOverlay.fadeOut(200, function(){
										$zboxContent.empty();
									});
									$('embed.unhideThis, object.unhideThis').removeClass(zoe.cls.overlayUnhide).css('visibility', 'visible');
									//make a copy of the original ready for another open
									$this = $original.clone(true);
								}
							},

							//pool events are bound to the page
							pool :{

								// The tick event is actually quite simple. When the shown frame
								// does not match the state's desired frame, the new frame ($jQ DOM)
								// is picked from the state and faded in over 50ms, at which point the
								// previous frame is removed
								'tick.zoetrope' : function(){
									var state = get('state');

									//if state has gone, we need to
									if($.type(state) === 'undefined'){
										$this.trigger('teardown');
										return;
									}

									var	blittedFrameIndex = state.blittedFrameIndex,
										displayIndex = floor(state.col / (360/state.colCount)) + min_max(0, 2, floor(state.row / (90/state.rowCount)))*state.colCount;

									// `pan` syncing
									state.updated = true;
									state.zoomUpdated = true;
									state.resizeUpdated = true;

									//we need to wait for preloading sometimes
									if(typeof state.frames[displayIndex] === 'undefined') return;

									//see if there's an update to do
									if(state.blittedFrameIndex != displayIndex && state.blittedFrameIndex !== null){
										var $newFrame = state.frames[displayIndex],
											$oldFrame = state.frames[blittedFrameIndex];

										if($newFrame == null || $oldFrame == null) return;
										$newFrame.addClass(zoe.cls.newFrame);

										// Sometimes we might not animate to increase performance.
										if(state.animate){
											// Animation setup.
											$newFrame.hide();
											$oldFrame.stop(true, true);
											$this.prepend($newFrame);
											state.blittedFrameIndex = displayIndex;

											$newFrame.fadeIn({
												duration: 39,
												easing : 'linear',
												queue: false,
												complete: function(){
													$oldFrame.detach();
													$newFrame.removeClass(zoe.cls.newFrame);
													$this.trigger('framechange',[state.blittedFrameIndex]);
												}
											});
										}
										else{
											// No animation version.
											$this.prepend($newFrame);
											state.blittedFrameIndex = displayIndex;
											$oldFrame.detach();
											$newFrame.removeClass(zoe.cls.newFrame);
										}


									}
									//wait until preloading is progressing
									else if(state.blittedFrameIndex === null){
										var $newFrame = state.frames[displayIndex];
										$this.find('img:not('+dot(zoe.cls.frame)+')').remove();
										$this.prepend($newFrame);
										// add a div which will catch touches
										$newFrame.after($('<div>').addClass(zoe.cls.frameCover).text(''));
										state.blittedFrameIndex = displayIndex
									}
								},

								//	Controls deceleration when there is velocity
								'tick.velocity' : function(){
									var state = get('state');

									//if state has gone, we need to
									if($.type(state) === 'undefined'){
										return;
									}

									var	deltaV = get('break');
									if(!state.interactive && state.velocity){
										if(state.velocity > 0){
											state.velocity = state.velocity - deltaV / zoe.fps;
										}
										else{
											state.velocity = state.velocity + deltaV / zoe.fps;
										}

										// to prevent ocillations
										if(abs(state.velocity) < deltaV*1.1/zoe.fps)
											state.velocity = 0;

										state.col = (state.col + state.velocity/zoe.fps + 360) % 360;
									}
								},

								// IE fix
								dragstart : function(e){
									if($(e.target).hasClass(zoe.cls.frame))
										return false;
								}

							},
							window:{
								resize : function(){
									$this.trigger('zoetropeResize');
								},
							}

						}

						on.setup();
					});

				//setup the ticker
				zoe.ticker = zoe.ticker || (function tick(){
					var start= +new Date();
					zoe.pool.trigger('tick');
					zoe.cost= (+new Date() + zoe.cost - start) / 2; //running average
					var timeout = 1000 / zoe.fps - zoe.cost;
					//magical frame rate halving slowing down on devices which are not keeping up very well.
					if(zoe.cost > 10){ //10ms found by experimentation (takes 2ms in chrome on 3 year old i5)
						timeout = timeout/2;
					}
					return ticker = setTimeout(tick, max(4, 1000 / zoe.fps - zoe.cost));
				})();

				return $applicable;
			},

			unZoetrope: function(){
				return this.trigger('teardown.zoetrope');
			}
		},
		// holds all the active instances on the page
		instances: $(),
		// the cost of running an update - used to keep the framerate constant
		cost: 0,
		//ticker is the global ticker
		ticker : null,
		//template Cache
		tpl_cache : {}
	};


	// Animations
	/* Animate to an image index - do not use with any other animation properties
	 *
	 * Use with an integer argument between 0-107
	 *
	 * e.g. $('zoetrope-engage-image').animate({'zoetropeImage': 20});
	 */
	$.fx.step.zoetropeImage = function(fx){
		//quit if it's not a zoetrope image
		if(!isInstance(fx.elem)) return;

		var state = $(fx.elem).data('state');
		if( !fx.zoeInit ){
			fx.zoeStart = {col : state.col, row: state.row};
			fx.zoeEnd = toZoetropePosition(fx.end % 108);
			fx.diff = zoetropeDiff(fx.zoeStart, fx.zoeEnd);
			fx.zoeInit = true;
		}

		state.col = (fx.zoeStart.col + fx.diff.col * fx.pos) % 360;
		state.row = fx.zoeStart.row + fx.diff.row * fx.pos;

		function toZoetropePosition(index){
			//these are always in the 0-107 form, even on mobile versions
			return {col : ((+index) % 36) * 10, row: floor((+index) / 36) * 30};
		}
		function zoetropeDiff(a,b){
			return { col : b.col - a.col, row : b.row - a.row };
		}
	};

	/* Animate through an angle delta, in degrees
	 * Useful for arbitrary spins from the current position
	 */
	$.fx.step.zoetropeColDelta = function(fx){
		//quit if it's not a zoetrope image
		if(!isInstance(fx.elem)) return;

		var state = $(fx.elem).data('state');
		if( !fx.zoeInit ){
			fx.zoeStart = state.col;
			fx.zoeEnd = fx.zoeStart + fx.end;
			fx.diff = fx.end;
			fx.zoeInit = true;
		}
		state.col = (fx.zoeStart + fx.diff * fx.pos) % 360;
	};

	/*
	 * Animate a row delta
	 */
	$.fx.step.zoetropeRowDelta = function(fx){
		//quit if it's not a zoetrope image
		if(!isInstance(fx.elem)) return;

		var state = $(fx.elem).data('state');
		if( !fx.zoeInit ){
			fx.zoeStart = state.row; //this will not be set normally
			fx.zoeEnd = fx.zoeStart + fx.end;
			fx.diff = fx.end;
			fx.zoeInit = true;
		}
		state.row = fx.zoeStart + fx.diff * fx.pos;
	};

	// Helper functions
	var math= Math,
	round= math.round, floor= math.floor, ceil= math.ceil,
	min= math.min, max= math.max, abs= math.abs, sqrt= math.sqrt, sq = function(x){ return x*x; };

	$.extend($.fn, zoe.fn) && $(zoe.scan);
	return zoe;

	//returns some very basic browser info, used to detect older
	// versions of IE.
	function browser(){
		var ua = navigator.userAgent,
			tem,
			M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];
		if(/trident/i.test(M[1])){
			tem=  /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
			return ['MSIE ', (tem[1] || '')];
		}
		M = M[2]? [M[1], M[2]]:[navigator.appName, navigator.appVersion, '-?'];
		if((tem = ua.match(/version\/([\.\d]+)/i))!== null) M[2]= tem[1];
		return M;
	};
	// Returns false for old versions of IE.
	function zoeCompatible(){
		var browserDetails = browser();
		if(browserDetails[0] == "MSIE" && (+browserDetails[1]) <= 6)
			return false;
		return true;
	}

	// parses the settings
	function parseSettings($element, defaultSettings){
		$.each(defaultSettings, function(key, value){
			var dataValue = $element.data(dataPrefix(key));
			$element.data(key, processSetting(defaultSettings[key], dataValue, key));
		});
	}
	function processSetting(setting, elemData, key){
		var type = setting.type || 'boolean',
			init = setting.init || (type == 'number' ? 0 : (type == 'boolean' ? false : '')),
			process = setting.process || true,
			required = setting.required || false,
			options = setting.options || [],
			ret;

		if(!process)
			return init;

		switch(type){
			case 'number' : init = init || 0; break;
			case 'boolean' : init = init || false; break;
			case 'string' : init = init || ''; break;
			case 'enum' : init = init || options[0]; break;
			case 'array' : init = init || []; break;
			case 'object' : init = init || {}; break;
		}
		ret = typeof elemData !== 'undefined' ? elemData : init;

		if(type === 'enum' && $.inArray(ret, options) === -1)
			error('the setting '+key+' is needs to be one of '+options);


		if(required && $.type(elemData) === 'undefined')
			error('the setting '+key+' is required for Zoetrope to work');

		if(type !== 'enum' && $.type(ret) !== type)
			error('the setting '+key+' is of type '+(typeof ret)+' but should be a '+type);

		return ret;
	}
	function dataPrefix(name){ return 'zoe-' + name || ''; }

	function hasTouch(){
		/* http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript */
		return (('ontouchstart' in window) || // works on most browsers
			(navigator.msMaxTouchPoints > 0));
	}

	function addInstance($instance){ return (zoe.instances.push($instance[0])) && $instance; }
	function removeInstance($instance){ return (zoe.instances= zoe.instances.not($instance[0])) && $instance; }
	function isInstance($elem){ return zoe.instances.is($elem) || false; }
	function leader(key){ return zoe.instances.first().data(key) }
	function embedded(image){ return 'data:image/gif;base64,R0lGODlh' + image }
	function tag(string){ return '<' + string + '/>' }
	function dot(string){ return '.' + (string || '') }
	function cdn(path){ return path.replace(_cdn_, zoe.cdn) }

	// Event namespace - parse null for namespace or string to get namespaced event or array of events for $.fn.on() compatible string
	function evns(name, subNs){
		if(typeof name === 'object' && name instanceof Array){
			var events = ''
			for(var i=0; i < name.length; i++){
				events += evns(name[i], subNs) + ' ';
			}
			return events;
		}
		return (name || '') + zoe.ns + (subNs || '');
	}
	function min_max(minimum, maximum, number){ return max(minimum, min(maximum, number)) }
	function button(cls, title){ return $('<a>').addClass(zoe.cls.button).addClass(cls).attr('title', title || ''); }
	function pointer(e){ return e.touch || e.originalEvent.touches && e.originalEvent.touches[0] || e }
	function url(location){ return 'url(\'' + reen(location) + '\')' }
	function px(value){ return value === undefined ? 0 : typeof value == _string_ ? value : value + 'px' }
	function hash(value){ return '#' + value }
	function pad(string, len, fill){ while (string.length < len) string= fill + string; return string }
	function twochar(string){ return pad(string, 2, '0') }
	function reen(uri){ return encodeURI(decodeURI(uri)) }
	function error(message){ try{ console.error('[ Zoetrope ] '+message) }catch(e){} }

	function setLangage(element){ zoe.strs = zoe.languages[element.data('lang')] || zoe.languages[element.data('lang').substring(0,2)] || zoe.languages['en']; };

	//templating engine - http://ejohn.org/blog/javascript-micro-templating
	function tmpl(str, data){
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = zoe.tpl_cache[str];

		if(typeof fn === 'undefined'){
			// Generate a reusable function that will serve as a template
			// generator (and which will be cached).
			fn = new Function("obj, zoe, $",
				"var p=[],print=function(){p.push.apply(p,arguments);};" +

				// Introduce the data as local variables using with(){}
				"p.push('" +

				// Convert the template into pure JavaScript
				str
				  .replace(/[\r\t\n]/g, " ")
				  .split("<%").join("\t")
				  .replace(/((^|%>)[^\t]*)'/g, "$1\r")
				  .replace(/\t=(.*?)%>/g, "',$1,'")
				  .split("\t").join("');")
				  .split("%>").join("p.push('")
				  .split("\r").join("\\'")
				+ "'); return p.join('');"
			);

			zoe.tpl_cache[str] = fn;
		}
		// Provide some basic currying to the user
		return $(fn(data || {}, zoe, $));
	};

	function imageSize(){
		var hasRetina = window.devicePixelRatio > 1.5,
			mobile = $.browser.mobile;
		return !mobile ? (hasRetina ? 1000 : 500) : (hasRetina ? 500 : 250)
	}

// AMD wrapper end
})(jQuery, window, document);
});
