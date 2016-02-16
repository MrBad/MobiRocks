
var Mobi = Mobi || {};
Mobi.Browser = (function () {
	var touchstart, touchmove, touchend, touchcancel,
		orientationEvent, supportDeviceOrientation,
		transitionEndEvent, pixelRatio,
		orientation,
		supports3d,
		vendorPrefix = null,
		hasPushState;

	console.info('Mobi.Browser.init');

	touchstart = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
	touchmove = 'ontouchmove' in window ? 'touchmove' : 'mousemove';
	touchend = 'ontouchend' in window ? 'touchend' : 'mouseup';
	touchcancel = 'ontouchcancel' in window ? 'touchcancel' : 'mouseup';
	orientationEvent = ('onorientationchange' in window ? 'orientationchange'
		//:'ondeviceorientation' in window ? 'deviceorientation'
		: 'onresize' in window ? 'resize' : '');



	supportDeviceOrientation = orientationEvent ? true : false;
	pixelRatio = window.devicePixelRatio || 1;
	hasPushState = ('pushState' in history);




	var vendorPrefixes = ['', 'webkit', 'Moz', 'ms', 'O'],
		test = document.createElement('div'),
		cssTest = 'transform',
		i;

	for (i = vendorPrefixes.length; i--;) {
		var prefix = vendorPrefixes[i],
			t = prefix ? prefix + Mobi.Utils.ucFirst(cssTest) : cssTest;
		if (t in test.style) {
			vendorPrefix = prefix;
		}
	}

	supports3d = (vendorPrefix ? vendorPrefix + 'Perspective' : 'perspective') in test.style;
	//		console.log(this.vendorPrefix);
	//		if(Browser.safari && Browser.version < 6) {
	//			this.supports3d = false;
	//		}
	//console.log('Supports 3d: ' + (supports3d ? 'yes' : 'no'));
	var te = {
		'': 'transitionend',
		'webkit': 'webkitTransitionEnd',
		'Moz': 'transitionend',
		'O': 'oTransitionEnd',
		'ms': 'MSTransitionEnd'
	};

	transitionEndEvent = te[vendorPrefix];
//	Element.NativeEvents[transitionEndEvent] = 2; // register as native event to MooTools

//	console.log('transitionEndEvent is: ' + transitionEndEvent);
//	console.log('touchstart is: ' + touchstart);
//	console.log('orientationChange is: ' + orientationEvent);
//	console.log('pixelRatio: ' + pixelRatio);

	var onOrientationChange = function (e) {
		var sz = $(document.body).getSize();
		var oldOrientation = orientation;
		if (orientationEvent == 'orientationchange') {
			if (Math.abs(window.orientation) == 90) {
				orientation = 'landscape';
			} else {
				orientation = 'portrait';
			}
		}
		else {
			if (sz.x > sz.y) {
				orientation = 'landscape';
			} else {
				orientation = 'portrait';
			}
		}
//		console.log('Orientation changed: x:' + sz.x + ', y:' + sz.y + ' type: ' + orientation);
		$(document.body).removeClass(oldOrientation).addClass(orientation);
		$(window).fireEvent('orientationChange', e);
	};
	//if(this.supportDeviceOrientation) {
	window.addEventListener(orientationEvent, onOrientationChange, false);
	//}
	return {
		touchstart: touchstart,
		touchmove: touchmove,
		touchend: touchend,
		touchcancel: touchcancel,
		orientationEvent: orientationEvent,
		supportDeviceOrientation: supportDeviceOrientation,
		transitionEndEvent: transitionEndEvent,
		pixelRatio: pixelRatio,
		orientation: orientation,
		supports3d: supports3d,
		vendorPrefix: vendorPrefix,
		hasPushState: hasPushState
	}
}).call(Mobi.Browser);


(function(){

	var touchstart = Mobi.Browser.touchstart,
		touchmove = Mobi.Browser.touchmove,
		touchend = Mobi.Browser.touchend,
		touchcancel = Mobi.Browser.touchcancel;

	var getPos = function(e) {

		if(e.type.match(/touch/)) {
			var touch = e.changedTouches[0];
			return {
				page: {
					x: touch.pageX, y: touch.pageY
				}
			};
		}
		else {
			return {
				page: {
					x: e.pageX, y: e.pageY
				}
			};
		}
	};

	var computeDelta = function(lastPos, previousPos){
		return {
			x: lastPos.page.x - previousPos.page.x,
			y: lastPos.page.y - previousPos.page.y
		};
	};

	var whoBubbled = function(element, event) {
		if(!element) {return null;}
		if(! element.hasEvent(event)){
			element = whoBubbled(element.getParent(), event);
		}
		return element;
	};
	var Touch = function() {
		var instance = this;

		this.touchStarted = false;
		this.isTouch = true; // assume touch //
		this.isSwipe = false;
		this.startPos = null;
		this.lastPos = null;
		this.target = null;
		this.swipeType = '';

		$(document.body).addEvent(touchstart, this);

		// Singleton
		Touch = function(){
			return instance;
		}
	};

	Touch.prototype.handleEvent = function(e) {

		if (e.type == touchstart) {
			this.onTouchStart(e);
		} else if (e.type == touchmove) {
			this.onTouchMove(e);
		} else if (e.type == touchend) {
			this.onTouchEnd(e);
		} else if (e.type == 'click') {
			this.preventClick(e);
		} else {
			this.onTouchCancel();
		}

	};

	Touch.prototype.onTouchStart = function(e) {
//		console.log('Ts');
		this.touchStarted = true;
		this.isTouch = true; // assume touch //
		this.startPos = this.lastPos = getPos(e);

		this.target = $(e.target);
		if( ! this.target.treeHasEvent('touch') &&
			! this.target.treeHasEvent('swipeX') &&
			! this.target.treeHasEvent('swipeY')) {
			return;
		}

		this.target.addEvent(touchend, this);
		this.target.addEvent(touchmove, this);
		this.target.addEvent(touchcancel, this);
		this.target.addEvent('click', this);

	};


	Touch.prototype.onTouchMove = function(e) {

		if(!this.touchStarted) { // prevent desktop fire
			return;
		}

		if(e.type=='touchmove') {
			if(e.changedTouches.length > 1) { // accept only one finger :)
				this._cleanUp();
				return;
			}
		}

		this.lastPos = getPos(e);
		var delta = computeDelta(this.lastPos, this.startPos);

		var adx = Math.abs(delta.x);
		var ady = Math.abs(delta.y);

		if(adx < 3 && ady < 3) return;
		if(adx > ady) {
			this.swipeType = 'swipeX';
		}
		else {
			this.swipeType = 'swipeY';
		}
		if(! this.target.treeHasEvent(this.swipeType)) {
			console.log('swipe cancel',this.target, this.swipeType);
			this._cleanUp();
			return;
		}
		if(this.isSwipe == false) {
			e.preventDefault(); // Stop //
			this.isSwipe = true;
			this.isTouch = false;
		}

		this.fireEvent(this.swipeType, e, [this.startPos, delta]);
	};

	Touch.prototype.onTouchEnd = function(e) {
//		console.log('Te');
		if(!this.touchStarted) {
			return;
		}
		if (this.isTouch) {
			this.fireEvent('touch', e);
		}
		else {
			var delta = computeDelta(this.lastPos, this.startPos);
			this.fireEvent(this.swipeType, e, [this.startPos, delta]);
			this.fireEvent('swipeEnd', e, [this.startPos, delta]);
		}
		this._cleanUp();
	};

	Touch.prototype.onTouchCancel = function () {
		this._cleanUp();
	};

	Touch.prototype._cleanUp = function() {
		this.target.removeEvent(touchend, this);
		this.target.removeEvent(touchmove, this);
		this.target.removeEvent(touchcancel, this);

		this.touchStarted = false;
		this.isTouch = true;
		this.isSwipe = false;
		this.startPos = null;
		this.lastPos = null;
		this.target = null;
		this.swipeType = '';
	};

	Touch.prototype.fireEvent = function(type, e, arr) {
//		console.log(this.target, type);
		var ev = new CustomEvent(type, {
				bubbles: true,
				cancelable: true,
				detail: arr
		});
		var el = whoBubbled(this.target, type);
		if(el) {
			el.dispatchEvent(ev);
		}
	};

	Touch.prototype.preventClick = function(e) {
		e.stopPropagation();
		e.preventDefault();
	};

	new Touch();

})();
