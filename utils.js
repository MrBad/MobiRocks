var Mobi = Mobi || {};

Mobi.Utils = Mobi.Utils || {};
Mobi.Utils = (function() {

	var elRe = /element$/,
		typeRe = /\[[^\s]+\s([a-zA-Z]+)\]/;

	/**
	 * Checking the type of an Object by using it's toString prototype
	 * @param obj
	 * @returns {String}
	 */
	function type(obj) {
		return Object.prototype.toString.call(obj).replace(typeRe, '$1').toLowerCase();
	}

	//'DropBox sintaxHighlighter sucks'//

	/**
	 * Check if this is a function
	 * @method isFunction
	 * @param {Object} param
	 * @returns {boolean}
	 */
	var isFunction = function(param) {
		return (type(param) === 'function');
	};

	/**
	 * Check if this is a string
	 * @param {Object} param
	 * @returns {boolean}
	 */
	var isString = function (param) {
		return (type(param) === 'string');
	};

	/**
	 * Check if this is an Object
	 * @param {Object} param
	 * @returns {boolean}
	 */
	var isObject = function (param) {
		return (type(param) === 'object');
	};

	/**
	 * Check if this is a regexp
	 * @param {Object} param
	 * @returns {boolean}
	 */
	var isRegexp = function (param) {
		return (type(param) === 'regexp');
	};

	/**
	 * Checks if this is an HTML element
	 * @param {Object} param
	 * @returns {boolean}
	 */
	var isElement = function(param) {
		return elRe.test(type(param));
	};
	var isNodeList = function(param) {
		return (type(param) === 'nodelist');
	};

	/**
	 * Camelize a string / z-index should become zIndex
	 * @param {String} str
	 * @returns {*|XML|string|void}
	 */
	var camelize = function(str) {
		return str.replace(/\-(.)/g, function(match, el) {
			return el.toUpperCase();
		});
	};

	var ucFirst = function(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	/**
	 * source = {source1: 's1', source2: 's2', over: 'Source'},
	 * target = {target1: 't1', target2: 't2', over: 'Target'}
	 * extend(target, source) == {target1: "t1", target2: "t2", over: "Source", source1: "s1", source2: "s2"}
	 *
	 * @param {Object} target
	 * @param {Object} source
	 * @returns {Object}
	 * TODO: Add multiple objects as source - like extend(target, [obj1, obj2,...*])
	 */
	var extend = function(target, source) {
		var i;
		for(i in source) {
			if(source.hasOwnProperty(i)) {
				target[i] = source[i];
			}
		}
		return target;
	};

	/**
	 * Add methods from the source to the target prototype
	 * @param {Object} target
	 * @param {Object} source
	 * @returns {Object}
	 */
	var implement = function(target, source) {
		var i;
		for(i in source) {
			if(source.hasOwnProperty(i)) {
				target.prototype[i] = source[i];
			}
		}
		return target;
	};

	/**
	 * Inherits methods from parent / aka adding them to the child prototype
	 * @param {Object} child
	 * @param {Object} parent
	 */
	var inherit = function(child, parent){
		var inh = function inh(){
			//this.constructor = child;
			this._parent = parent;
		};
		inh.prototype = parent.prototype;
		child.prototype = new inh();
	};

	/**
	 * Simple Ajax request
	 * @param {String} url url to fetch
	 * @param {Object} opts
	 */
	var xhr = function(url, opts) {
		//console.log('xhr', url);
		opts = opts || {};
		var
			onComplete = isFunction(opts.onComplete) ? opts.onComplete : null,
			method = opts.method || 'get',
			data = opts.data || null,
			update = opts.update ? document.getElementById(opts.update) : null,
			async = opts.async || true,
			scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/gi,
			state,
			xhr;

		xhr = new XMLHttpRequest();
		xhr.open(method, url, async);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

		if(isFunction(opts.onload)) {
			xhr.onload = opts.onload;
		}
		if(isFunction(opts.onloadstart)) {
			xhr.onloadstart = opts.onloadstart;
		}
		if(isFunction(opts.onloadend)) {
			xhr.onloadend = opts.onloadend;
		}
		if(isFunction(opts.onprogress)) {
			xhr.onprogress = opts.onprogress;
		}
		xhr.onreadystatechange = function() {
			state = xhr.readyState;
			if(xhr.readyState == 4) {
				if(xhr.status == 200) {
					if(update) {
						update.innerHTML = xhr.responseText.replace(scriptRe, '');
					}
					if(onComplete) {
						onComplete.call(this, xhr);
					}
				}
			}
		};

		xhr.send(toQueryString(data));

	};
	var toQueryString = function(data) {
		var result = [];
		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				// Add arrays in PHP notation - key[]=value1&key[]=value2
				if (data[key] instanceof Array) {
					for (var i = 0, count = data[key].length; i < count; i++) {
						result.push(key + '[]=' + encodeURIComponent(data[key][i]));
					}
				}
				// Add objects in PHP notation - key[innerKey1]=value1&key[innerKey2]=value2
				else if (typeof(data[key]) == 'object') {
					for (var innerKey in data[key]) {
						if (data.hasOwnProperty(key)) {
							result.push(key + '[' + innerKey + ']=' + encodeURIComponent(data[key][innerKey]));
						}
					}
				}
				else
					result.push(key + '=' + encodeURIComponent(data[key]));
			}
		}
		return result.join('&');
	};

	return {
		type: type,
		isFunction: isFunction,
		isString: isString,
		isObject: isObject,
		isRegexp: isRegexp,
		isElement: isElement,
		isNodeList: isNodeList,
		camelize: camelize,
		ucFirst: ucFirst,
		extend: extend,
		implement: implement,
		inherit: inherit,
		xhr: xhr,
		toQueryString: toQueryString
	};
}).call(Mobi.Utils);

// ShortCut
//typeOf = type = Mobi.Utils.type;



(function(){

//
//	These methods will be appended to any element fetched by $ or $$ shortcut //
//	Idea here is not to extend native hosted Objects, like Element, which is not supported by every browser,
//		but instead to add these methods to every 'Object' returned by a dom query.
//		Can be inefficient, but should be cross browser compatible
//
ElementExtends = {
	extended: true,

	// Classes
	/**
	 * Does this element have this class?
	 * 		$('#myElement').hasClass('myClass')
	 * @param className
	 * @returns {boolean}
	 */
	hasClass: function(className) {
		var classes = this.getAttribute('class');
		if(!classes) {
			return false;
		}
		classes = classes.split(' ');
		return classes.indexOf(className) > -1;
	},

	/**
	 * Adds a class to an element
	 * 		$('#myElement').addClass('myClass')
	 * @param className
	 * @returns self
	 */
	addClass: function(className) {
		var classStr = this.getAttribute('class');
		var classes = classStr ? classStr.split(' ') : [];
		if(classes.indexOf(className) == -1) {
			classes.push(className);
		}
		this.setAttribute('class', classes.join(' '));
		return this;
	},

	/**
	 * Remove a class from an element / TODO: check for whitespaces, remove attribute class
	 * @param className
	 * @returns self
	 */
	removeClass: function(className) {
		var classStr = this.getAttribute('class');
		if(classStr) {
			classStr = classStr.replace(className, '').replace(/[\s\t]+/, ' ');
			if (classStr == '') {
				this.removeAttribute('class');
			} else {
				this.setAttribute('class', classStr);
			}
		}
		return this;
	},

	toggleClass: function(className) {
		if(this.hasClass(className)) {
			this.removeClass(className);
		} else {
			this.addClass(className);
		}
	},

	// Styles
	/**
	 * Sets a style on an element
	 * @param {String} name
	 * @param {String} value
	 * @returns self
	 */
	setStyle: function(name, value) {
		name = Mobi.Utils.camelize(name);
		this.style[name] = value;
		return this;
	},
	setVendorStyle: function(name, value) {

		var prefixes = ['Webkit', 'Moz','ms','O'];
		prefixes.forEach(function(prefix) {
			this.setStyle(prefix+ Mobi.Utils.ucFirst(name), value);
		}.bind(this));
		return this.setStyle(name, value);
	},
	setVendorStyles: function(styles) {
		for (var style in styles) {
			if(styles.hasOwnProperty(style)) {
				this.setVendorStyle(style, styles[style]);
			}
		}
		return this;
	},
	getComputedStyle: function(className) {},

	// Size
	/**
	 * Returns the size of an element as an x/y object
	 * @returns {{x: number, y: number}}
	 */
	getSize: function(){
		return {
			x: this.offsetWidth,
			y: this.offsetHeight
		}
	},
	getHeight: function(){
		return this.getSize().y;
	},
	getWidth: function(){
		return this.getSize().x;
	},
	getPosition: function(){
		var x= 0,
			y= 0,
			el = this;

		while(true){
			x += el.offsetLeft;
			y += el.offsetTop;
			if(el.offsetParent === null){
				break;
			}
			el = el.offsetParent;
		}
		return {x:x, y:y};
	},
	// DOM Events
	/**
	 * Adds an event to an element
	 * @param {String} event
	 * @param {Function} fn
	 */
	addEvent: function(event, fn) {
		if(! this._events) {
			this._events = {};
		}
		if(! this._events[event]) {
			this._events[event] = [];
		}
		var hasThisEvent = false;
		for(var i = this._events[event].length; i--;) {
			if(this._events[event][i] == fn) {
				hasThisEvent = true;
				break;
			}
		}
		if(!hasThisEvent) {
			this._events[event].push(fn);
//			console.log(this.uid, this.id, this._events);
			this.addEventListener(event, fn);
		} else {
//			console.log('Already added',event, fn);
		}
		return this;
	},
	/**
	 * Removes an event from an element
	 * @param {String} event
	 * @param {Function} fn
	 */
	removeEvent: function(event, fn) {
		// remove from _events too //

		if(this._events[event]) {
			for(var i = this._events[event].length; i--; ) {
				if(this._events[event][i] == fn) {
					this._events[event].splice(i,1);
					break;
				}
			}
		}
		this.removeEventListener(event, fn);
	},
	fireEvent: function(event) {},

	hasEvent: function(event) {
		if(this._events && this._events[event]) {
			if(this._events[event].length > 0) {
				return true;
			}
		}
		return false;
	},

	treeHasEvent: function(event) {
		var parent;
		if (this.hasEvent(event)) {
			return true;
		}
		parent = this.getParent();
		return parent ? parent.treeHasEvent(event) : false;
	},
	empty: function(){
		//TODO - remove events
		this.innerHTML = '';
	},

	// Traverse
	/**
	 * Get the parent of an Element
	 * @returns parent, wrapped
	 */
	getParent: function() {
		return $(this.parentNode);
	},

	find: function(selector) {
		return $(selector);
	}

};

//
//	Append these methods to any element in a NodeList
//		For a list, this method should be added, where it makes sense,
// 		which will loop through all elements
//		and add the method to each element
// 		aka $('.myClass').addEvent() / will loop through every element in the list and add addEvent to each one.
//
var ElementsExtends = {};
// Extend a list element only with the functions that make sense
//	(we do not need things like - NodeList.getSize, but make sense for NodeList.addEvent)
var toExtend = ['addEvent', 'removeEvent', 'addClass', 'removeClass'];

toExtend.forEach(function(funcType) {

	// Like NodeList.addEvent
	ElementsExtends[funcType] = function() {

		// ForEach element in this list
		for(var i = this.length; i--;) {

			// this Element.addEvent is like calling ElementExtends.addEvent
			this[i][funcType] = ElementExtends[funcType].apply(this[i], arguments);
		}
	}
});

// Static var to keep track of extended elements
var uid = 0,
	$;

$ = function (param) {
	var element = null,
		elements = null;

	if (Mobi.Utils.isString(param)) {
		var firstLetter = param[0];

		var idRe = /\s/;

		// Assumes is $('#myDiv something')
		if (idRe.test(param)) {
			elements = document.querySelectorAll(param);
		}

		// Assumes is $('#myDiv')
		else if (firstLetter == '#') {
			element = document.querySelector(param);
		}

		// Assumes it is $('.myClassOfElements')
		else if (firstLetter == '.') {
			elements = document.querySelectorAll(param);
		}
		else {
			elements = document.getElementsByTagName(param);
		}
	}

	// If is already an HTML element
	else if (Mobi.Utils.isElement(param)) {
		element = param;
	}
	// If is a nodeList
	else if(Mobi.Utils.isNodeList(param)) {
		elements = param;
	}

	// If this is an Object... // stupid implm - for things like $(window) ?!?!
	else if (Mobi.Utils.isObject(param) || param === window) {
		element = param;
	}

	// Do we have a NodeList ?
	if (elements) {
		Mobi.Utils.extend(elements, ElementsExtends);
		return elements;
	}

	// Or a single Element that is not extended?
	if (element && !element.extended) {
		Mobi.Utils.extend(element, ElementExtends);
		element.extended = true;
		element.uid = ++uid;
	}
	return element;
};

// export as a shortcut
window.$ = $;

})();
