
var Debug = function(){
	this.container = document.createElement('div');
	this.container.style.cssText =
		'border: 3px solid #C3D9FF; width:50%; height:30%; '+
		'position: fixed; left:0px; bottom:0px; '+
		'background:white; overflow:auto; padding:3px; color:#333333;'+
		'z-index:100000; display:block; font-size:12px; font-family: Consolas';
	document.body.appendChild(this.container);
};

Debug.prototype.format = function(param) {


	var typeRe = /\[[^\s]+\s([a-zA-Z]+)\]/,
		type = Object.prototype.toString.call(param).replace(typeRe, '$1').toLowerCase(),
		span = document.createElement('span'),
		i, j, txt, sp;

	if(type == 'null') {
		span.style.cssText = 'color: blue; font-style:italic;';
		span.innerHTML = 'null';
	}
	else if (type == 'undefined') {
		span.style.cssText = 'color: gray; font-style:italic;';
		span.innerHTML = 'undefined';
	} else if (type == 'boolean') {
		span.style.cssText = 'color: blue; font-style:italic;';
		span.innerHTML = param ? 'true':'false';
	}
	else if(type == 'string') {
		span.style.cssText = 'color: red;';
		span.innerHTML = '"'+param+'"';
	}
	else if(type == 'number') {
		span.style.cssText = 'color: #000088;';
		span.innerHTML = param;
	}
	else if(type == 'function') {
		span.style.cssText = 'color: #006400;';
		span.innerHTML = "function";
	}
	else if(type == 'regexp') {
		span.style.cssText = 'color: #C41A16;';
		span.innerHTML = "RegExp";
	}
	else if(type == 'object') {

		span.style.cssText = 'color: #006400; font-style:italic;';
		txt = document.createTextNode('Object { ');
		span.appendChild(txt);

		for(i in param) {

//			if(param.hasOwnProperty(i)) {
				sp = document.createElement('span');
				sp.style.cssText = 'color: #881391';
				txt = document.createTextNode(i);
				sp.appendChild(txt);
				span.appendChild(sp);

				txt = document.createTextNode(':');
				span.appendChild(txt);
				span.appendChild(this.format(param[i]));
//			}

			txt = document.createTextNode(', ');
			span.appendChild(txt);
			j++;

			if(j > 3) {
				txt = document.createTextNode('more...');
				span.appendChild(txt);
				break;
			}

		}
		txt = document.createTextNode(' }');
		span.appendChild(txt);
	} else {
		span.innerHTML = type;
	}

	return span;
};

Debug.prototype.log =
Debug.prototype.info =
Debug.prototype.warn =
	function() {

	var args = Array.prototype.slice.call(arguments),
		len = args.length,
		line = document.createElement('div'),
		elm;
	line.style.cssText = 'border-bottom:solid 1px #F0F0F0';
	args.forEach(function(param, idx) {

		if((elm = this.format(param))) {
			line.appendChild(elm);
			if(idx < len) {
				line.innerHTML += ", &nbsp;";
			}
		}
	}, this);

	this.container.appendChild(line);
	this.container.scrollTop = this.container.scrollHeight - this.container.clientHeight;
};


//console = new Debug();
//debug.log('aaa', null, 'nnnn', undefined);
//debug.log({a:123123, b: function(){}, z: /aa/i, xx:function(){}});
//debug.log(debug);

