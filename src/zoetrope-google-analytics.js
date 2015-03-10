

(function(factory){
	// AMD, CommonJS and no loader compatibility
	var
		amd= typeof define == 'function' && define.amd && (define(['jquery'], factory) || true),
		commonjs= !amd && typeof module == 'object' && typeof module.exports == 'object' && (module.exports= factory),
		plain= !amd && !commonjs && factory()

})(function(){ return jQuery.zoetropeGoogleAnalytics || (function($, window, document, undefined){
	var GAObject = {};

	var state = {
		userInteracted : false
	}
	
	//Checks whether the user interacted state is false; if it is, we haven't
	//sent an interaction event and should now send one.
	//Ensures interaction event is only sent once.
	function interaction() {
		if (!state.userInteracted) {
			GAObject('send', 'event', 'zoetrope-viewer', 'interaction');
			state.userInteracted = true;
		}
	}

	//Each function is bound to it's corresponding event	
	var GAEvents = {
		helpStart : function() {
			GAObject('send', 'event', 'zoetrope-viewer', 'viewHelp' );
			interaction();
		},

		pan : function() {
			interaction();
		},
		
		zoomStart : function() {
			 GAObject('send', 'event', 'zoetrope-viewer', 'zoomIn' );
			 interaction();
		},


		preloadEnd : function() {
			state['loadEnd'] = +new Date();
			var loadTime = (state.loadEnd - state.loadStart)/1000;
			GAObject('send', 'event', 'zoetrope-viewer', 'loaded', 'timeToLoadSeconds', Math.round(loadTime), {'nonInteraction' : 1});
			console.log("Loaded in " + loadTime + " seconds");
		},

		closeStart: function() {
			GAObject('send', 'event', 'zoetrope-viewer', 'close' );
			interaction();
		},

		widgetSetup: function() {
			state['loadStart'] = +new Date();
		},
	};

		
	$.zoeGA = function(gaObject) {
		$(function() {
			$("body").on("setup.zoeanalytics",   function(event) {
				//It seems there's no way to AND namespaces, so we have to check it
				//to make sure this doesn't fire multiple times on the same widget
				if (event.namespace == 'zoeanalytics') {
					var target = $(event.target);
					GAObject = gaObject;
					GAEvents.widgetSetup() //Call this extraordinarily
					$.each(GAEvents, function(key, ev) {
						target.on(key, GAEvents[key]);
					});
				}



			})
		});
	}

// AMD wrapper end
})(jQuery, window, document);
});
