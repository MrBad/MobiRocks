
var AutoCompleter = function(opts) {

	this.target = $(opts.target);
	this.queryUrl = opts.queryUrl;
	this.delay = opts.delay || 500;
	this.aUid++;
	this.lastVal = '';

	this.container = $(document.createElement('div'));
	this.container.setAttribute('id', 'auto'+this.aUid);
	this.container.addClass('autoCompleter');

	var parent = this.target.getParent();
	parent.appendChild(this.container);
	parent.setStyle('position', 'relative');

	var tH = this.target.getHeight();
	this.container.setStyle('top', tH+'px');

	this.timer = null;

	this.target.addEvent('focus', this.onFocus.bind(this));
	this.target.addEvent('blur', this.onBlur.bind(this));
	this.target.addEvent('keyup', this.onKey.bind(this));


};

Mobi.Utils.implement(AutoCompleter, {

//	target: null,
//	queryUrl: '',
	aUid: 1,

	onFocus: function(e) {
//		this.show();
	},
	onBlur: function(e) {
		//console.log(e.target);
		//this.hide();
	},
	onKey: function(e) {
		switch(e.keyCode) {
			case 27:
				this.cancelSearch();
				break;
			case 13:
				this.search();
				break;
		}
		//console.log('onKey', e.keyCode, this.target.value);
		clearTimeout(this.timer);
		if(this.lastVal != this.target.value) {
			this.lastVal = this.target.value;
			this.timer = setTimeout(this.search.bind(this), this.delay);
		}
	},
	show: function(){
		this.container.setStyle('visibility', 'visible');
	},
	hide: function(){
		this.container.setStyle('visibility', 'hidden');
	},
	cancelSearch: function() {
		this.target.value = '';
	},
	search: function(){
		console.log(this.queryUrl + this.target.value);
		Mobi.Utils.xhr(this.queryUrl, {
			data: {
				search: this.target.value
			},
			method: 'post',
			onComplete: function(ret){
				var items = JSON && JSON.parse(ret.responseText),
					numItems = items.length, i;
				this.container.empty();
				for(i=0; i < numItems; i++){
					this.insertItem(items[i]);
				}
				if(numItems > 0) {
					this.show();
				} else {
					this.hide();
				}
			}.bind(this)
		});
	},
	insertItem: function(item) {
		var txt, li;
		li = $(document.createElement('li'));
		li.setAttribute('data-val', item.id);
		txt = document.createTextNode(item.val);
		li.appendChild(txt);
		var sp = document.createElement('span');
		sptxt = document.createTextNode('(' + item.num_items + ')');
		sp.appendChild(sptxt);
		li.appendChild(sptxt);
		this.container.appendChild(li);
		//console.log(item.id, item.val, item.num_items);
		li.addEvent('touch', this.onSelect.bind(this));
	},

	onSelect: function(e) {
		var cityId = e.target.getAttribute('data-val');
		this.target.setAttribute('value', e.target.childNodes[0].nodeValue);
		this.target.value = e.target.childNodes[0].nodeValue;
		this.target.setAttribute('data-val', cityId);
		this.hide();
	}

});
