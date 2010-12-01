Crafty.extend({		randRange: function(from, to) {		return Math.round(Math.random() * (to - from) + from);	},		/**	* Sprite generator.	*	* Extends Crafty for producing components	* based on sprites and tiles	*/	sprite: function(tile, url, map) {		var pos, temp, x, y, w, h;				//if no tile value, default to 16		if(typeof tile === "string") {			map = url;			url = tile;			tile = 1;		}				for(pos in map) {			if(!map.hasOwnProperty(pos)) continue;						temp = map[pos];			x = temp[0] * tile;			y = temp[1] * tile;			w = temp[2] * tile || tile;			h = temp[3] * tile || tile;						//create a component for the sprite			Crafty.c(pos, {				__image: url,				__coord: [x,y,w,h],				__tile: tile,								init: function() {					this.addComponent("sprite");					if(this.has("canvas")) {						this.img = new Image();						this.img.src = this.__image;						//draw when ready						Crafty.addEvent(this, this.img, 'load', function() {							DrawBuffer.add(this); //send to buffer to keep Z order						});					}					this.w = this.__coord[2];					this.h = this.__coord[3];				},								sprite: function(x,y,w,h) {					this.__coord = [x*this.__tile,y*this.__tile,w*this.__tile || this.__tile,h*this.__tile || this.__tile];				},								crop: function(x,y,w,h) {					this.__coord[0] += x;					this.__coord[1] += y;					this.__coord[2] = w;					this.__coord[3] = h;										this.w = w;					this.h = h;					return this;				}			});		}				return this;	},		_events: {},		/**	* Window Events credited to John Resig	* http://ejohn.org/projects/flexible-javascript-events	*/	addEvent: function(ctx, obj, type, fn) {		if(arguments.length === 3) {			fn = type;			type = obj;			obj = window;		}				//save anonymous function to be able to remove		var afn = function(e) { fn.call(ctx,e) };		this._events[obj+type+fn] = afn;				if (obj.attachEvent) { //IE			obj.attachEvent('on'+type, afn);		} else { //Everyone else			obj.addEventListener(type, afn, false);		}	},		removeEvent: function(ctx, obj, type, fn) {		if(arguments.length === 3) {			fn = type;			type = obj;			obj = window;		}				//retrieve anonymouse function		var afn = this._events[obj+type+fn];		delete this._events[obj+type+fn];				if (obj.detachEvent) {			obj.detachEvent('on'+type, obj[type+fn]);		} else obj.removeEventListener(type, afn, false);	},		window: {		width: window.innerWidth || (window.document.documentElement.clientWidth || window.document.body.clientWidth),		height: window.innerHeight || (window.document.documentElement.clientHeight || window.document.body.clientHeight)	},		background: function(color) {		var body = document.body;		body.style.background = color;	},		/**	* Map key names to key codes	*/	keys: {'BSP':8, 'TAB':9, 'ENT':13, 'SHF':16, 'CTR':17, 'ALT':18, 'PAU':19, 'CAP':20, 'ESC':27, 'SP':32, 'PGU':33, 'PGD':34, 'END':35, 'HOM':36, 'LA':37, 'UA':38, 'RA':39, 'DA':40, 'INS':45, 'DEL':46, 'D0':48, 'D1':49, 'D2':50, 'D3':51, 'D4':52, 'D5':53, 'D6':54, 'D7':55, 'D8':56, 'D9':57, 'SEM':59, 'EQL':61, 'A':65, 'B':66, 'C':67, 'D':68, 'E':69, 'F':70, 'G':71, 'H':72, 'I':73, 'J':74, 'K':75, 'L':76, 'M':77, 'N':78, 'O':79, 'P':80, 'Q':81, 'R':82, 'S':83, 'T':84, 'U':85, 'V':86, 'W':87, 'X':88, 'Y':89, 'Z':90, 'LWN':91, 'RWN':92, 'SEL':93, 'N0':96, 'N1':97, 'N2':98, 'N3':99, 'N4':100, 'N5':101, 'N6':102, 'N7':103, 'N8':104, 'N9':105, 'MUL':106, 'ADD':107, 'SUB':109, 'DEC':110, 'DIV':111, 'F1':112, 'F2':113, 'F3':114, 'F4':115, 'F5':116, 'F6':117, 'F7':118, 'F8':119, 'F9':120, 'F10':121, 'F11':122, 'F12':123, 'NUM':144, 'SCR':145, 'COM':188, 'PER':190, 'FSL':191, 'ACC':192, 'OBR':219, 'BSL':220, 'CBR':221, 'QOT':222}});var DrawBuffer = {	add: function add(obj, old) {		//redraw old position that was cleared		this.redraw(obj,old); 				//redraw obj in new position		this.redraw(obj); 	},		/**	* Find all objects intersected by this	* and redraw them in order of Z	*/	redraw: function redraw(obj, old) {		var q, 			i = 0, 			j = 0, 			keylength,			zlength,			box, 			z, 			layer,			total = 0,			keys = [],			redrawSelf = false,			sorted = {}; //bucket sort				if(!old) redrawSelf = true; //redraw self if no old param passed		old = old || obj; //default old x & y to obj				q = Crafty.map.search(old);				for(i=0;i<q.length;i++) {			box = q[i];						//if found is canvas			if(box.isCanvas) {				if(box === obj && !redrawSelf) continue; //TAKE HEED, don't return dear lord				if(!sorted[box.z]) sorted[box.z] = [];								sorted[box.z].push(box);				total++;			}		};				//for each z index, push into array of keys		for(z in sorted) {			if(!sorted.hasOwnProperty(z)) continue;			keys.push(+z);		}		keylength = keys.length;		keys.sort(function(a,b) {return a-b;}); //FFS!				//loop over sorted Z keys		for(i=0;i<keylength;i++) {				layer = sorted[keys[i]];			zlength = layer.length;						//loop over all objects with current Z index			for(j=0;j<zlength;j++) {				var todraw = layer[j];				if(!('draw' in todraw)) console.log(todraw);				//only draw visible area				if(todraw[0] !== obj[0]) { //don't redraw partial self					var x = (old.x - todraw.x <= 0) ? 0 : (old.x - todraw.x),						y = Math.ceil(old.y - todraw.y < 0 ? 0 : (old.y - todraw.y)),						w = Math.min(todraw.w - x, old.w - (todraw.x - old.x), old.w),						h = Math.ceil(Math.min(todraw.h - y, old.h - (todraw.y - old.y), old.h));										if(h === 0 || w === 0) continue; //don't bother drawing with h or w as 0					layer[j].draw(x,y,w,h);									} else layer[j].draw(); //redraw self			}		}	},		remove: function(obj) {		this.redraw(obj,obj);	}};