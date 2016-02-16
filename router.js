
var Mobi = Mobi || {};

Mobi.History = Mobi.History || {};
Mobi.History = (function() {

	var length = history.length,
		state = history.state,
		push, popCallback, replace;

	push = function(obj, title, url) {
		history.pushState(obj, title, url);
	};

	replace = function(obj, title, url){
		history.pushState(obj, title, url);
	};

	popCallback = function(e) {
		// this router route popped state | value | title
		//console.log('POPSTATE: ', document.location.pathname, JSON.stringify(e.state));
		var state = e.state;
		if(e.state) {
			Mobi.Router.route(document.location.pathname);
		} else {
			//console.warn('state is null');
		}
	};

	// and add the event listener to popCallback
	window.addEventListener('popstate', popCallback, false);

	return {
		length: length,
		state: state,
		push: push,
		replace: replace,
		popCallback: popCallback
	}
}).call(Mobi.History);


Mobi.Router = Mobi.Router || {};
Mobi.Router = (function () {
	//
	//  routes = [
	//      {rule1, fn1, context1},
	//      {rule2, fn2, context2}
	// ]
	//

	var isString = Mobi.Utils.isString,
		isRegexp = Mobi.Utils.isRegexp,
		isFunction = Mobi.Utils.isFunction,
		routes = [],
		History = Mobi.History;

	var addRoute = function (rule, fn, context) {

		if (!isFunction(fn)) {
			console.log('Not a function fn');
			return false;
		}
		routes.push({
			rule: rule,
			fn: fn,
			context: context
		});
		return true;
	};

	var addRoutes = function (args) {
		if(!args) return;
		var i, max;
		for (i = 0, max = args.length; i < max; i++) {
			addRoute(args[i].rule, args[i].fn, args[i].context || undefined);
		}
	};

	var delRule = function (rule) {
		var i;
		for (i = routes.length; i--;) {
			if (routes[i].rule === rule) {
				routes[i] = null;
			}
		}

	};

	var route = function (url) {
		var args, m, r, i, max;

		if ((r = findRoute(url)) !== false) {
			if (isString(r.rule)) {
				r.fn.call(r.context);
			}
			else {
				m = url.match(r.rule);
				args = [];
				for (i = 1, max = m.length; i < max; i++) {
					args.push(m[i]);
				}
				if(document.location.pathname !== url) { // hmmmm can create problems on back button?!
					History.push({}, '', url);
				}

				r.fn.apply(r.context, args);
			}
		}
		// route is not defined,
		// try defaults
		else {
			console.warn('No route found for: ' + url);
		}
		return false;
	};

	var findRoute = function (url) {
		var i, r, max = routes.length;
		for (i = 0; i < max; i++) {
			if (!routes[i]) {
				continue;
			}
			if (r = routes[i].rule) {
				if (isString(r) && r === url) {
					return routes[i];
				}
				else if (isRegexp(r)) {
					if (r.test(url)) {
						return routes[i];
					}
				}
			}
		}
		return false;
	};

	// export //
	return {
		addRoute: addRoute,
		addRoutes: addRoutes,
		delRule: delRule,
		route: route
	}
}).call(Mobi.Router);