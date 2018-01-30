
/* raphael-ext */

/*
 * raphael extensions made by sgurin.
 * 
 * 
 * new shapes: 
 * 
 * printLetters() - print() that return a set of letters and support for text onpath.
 * 
 * 
 * set operations: 
 * 
 * union, intersect, etc
 * 
 * 
 * transformation / filters : 
 * 
 * the only one that support both svg and vml containers are blur() and emboss(). the
 * rest only support SVG, like convolution, color matrix, etc.
 *  
 * @author: sgurin and other raphael extension authors
 */








/*
 * first of all some fixes that can be done with extensions
 */
//(function() {
//})(); 


(function() {
	/**
	 * do the job of putting all letters in a set returned bu printLetters in a
	 * path
	 * 
	 * @param p -
	 *            can be a rpahael path obejct or string
	 */
	var _printOnPath = function(text, paper, p) {
		if (typeof (p) == "string")
			p = paper.path(p).attr({
				stroke : "none"
			});
		for ( var i = 0; i < text.length; i++) {
			var letter = text[i];
			var newP = p.getPointAtLength(letter.getBBox().x);
			var newTransformation = letter.transform() + "T"
					+ (newP.x - letter.getBBox().x) + ","
					+ (newP.y - letter.getBBox().y - letter.getBBox().height);
			// also rotate the letter to correspond the path angle of derivative
			newTransformation += "R"
					+ (newP.alpha < 360 ? 180 + newP.alpha : newP.alpha);
			letter.transform(newTransformation);
		}
		text._rm_topathPath = p;
	};

	/**
	 * print letter by letter, and return the set of letters (paths), just like
	 * the old raphael print() method did.
	 */
	Raphael.fn.printLetters = function(x, y, str, font, size, letter_spacing,
			line_height, onpath) {
		letter_spacing = letter_spacing || size / 1.5;
		line_height = line_height || size;
		this.setStart();
		var x_ = x, y_ = y;
		for ( var i = 0; i < str.length; i++) {
			if (str.charAt(i) != '\n') {
				var letter = this.print(x_, y_, str.charAt(i), font, size);
				x_ += letter_spacing;
			} else {
				x_ = x;
				y_ += line_height;
			}
		}
		var set = this.setFinish();
		if (onpath) {
			_printOnPath(set, this, onpath);
		}
		return set;
	};

})();

/*
 * set operations - very inefficient because raphael sets are arrays and not
 * objects (maps-sets)
 */
(function() {
	/**
	 * so users can change the meaning of belonging to a set
	 * 
	 * @param s1
	 * @param s2
	 * @returns
	 */
	Raphael.st._elEquals = function(s1, s2) {
		return s1 == s2;
	};
	/**
	 * @returns true if this set contains the shape element el. In other case
	 *          returns false.
	 */
	Raphael.st.contains = function(el) {
		for ( var i = 0; i < this.length; i++)
			if (Raphael.st._elEquals(this[i], el))
				return true;
		return false;
	};
	Raphael.st.containsAll = function(other) {
		// TODO
	};
	/**
	 * @returns a new set that is the intersection of this and the other set
	 *          param
	 */
	Raphael.st.intersect = function(other) {
		if (!other)
			return [];
		var ret = this.paper.set();
		for ( var i = 0; i < this.length; i++) {
			if (other.contains(this[i]))
				ret.push(this[i]);
		}
		return ret;
	};
	/**
	 * @returns this plus other set els added. this set will be modified.
	 */
	Raphael.st.add = function(other) {
		if (!other)
			return this;
		for ( var i = 0; i < other.length; i++)
			if (!this.contains(other[i]))
				this.push(other[i]);
		return this;
	};
	
	/**
	 * @returns the size of the set. 
	 */
	Raphael.st.size = function() {
		var s=0;
		this.forEach(function(el, idx) {
			s++; 
			return true; 
		});
		return s;
	};
	
	/**
	 * @returns this with other set els removed
	 */
	Raphael.st.substract = function(other) {
		if (!other)
			return this;
		for ( var i = 0; i < other.length; i++)
			if (this.contains(other[i]))
				this.exclude(other[i]);
		return this;
	};
	/**
	 * @return this set with all elements for which f return true removed.
	 */
	Raphael.st.filter = function(f) {
		var set = this;
		this.forEach(function(el, idx) {
			var result = f(el, idx);
			result = typeof (result) == "object" ? (result + "") == "true"
					: result;
			if (result) {
				set.exclude(el);
			}
			return true;
		});
		return set;
	};

	/**
	 * return the first non-set shape children of this set. will return null if
	 * no non-set children shape is found.
	 */

	Raphael.el.firstShape = function() {
		return this;
	};
	Raphael.st.firstShape = function() {
		var nonSetShape = null;
		this.forEach(function(el, idx) {
			if (el.type != "set") {
				nonSetShape = el;
				return false; // breaks foreach
			} else {
				nonSetShape = el.firstShape();
				if (nonSetShape == null)
					return true;
				else
					return false;
			}
		});
		return nonSetShape;
	};
	Raphael.st.item = function(index) {
		var i = 0;
		var shape = null;
		this.forEach(function(s) {
			if (i == index) {
				shape = s;
				return false;
			}
			i++;
			return true;
		});
		return shape;
	}
	Raphael.el.print = function() {
		return this.type ? this.type : "undef";
	}
	Raphael.st.print = function() {
		var s = "Set(";
		this.forEach(function(shape) {
			s += shape.print() + ", ";
		});
		return s + ")";
	}

})();

(function() {
	Raphael.el.isRemoved = function() {
		return this.node.parentNode == null;
	};
	Raphael.st.isRemoved = function() {
		return true;
	};
})();

/**
 * WRITE functions - export the paper and shapes to object and json string as
 * described in Paper.add() explanation: raphaeljs has paper.add() for importing
 * shapes in json format, but do not have any toJSON for exporting in the same
 * way.
 * 
 * @author: sgurin
 */
(function() {

	var shapeToObject = function(shape, arr) {
		if (shape.type == "set") {
			var aSet = shape;
			shape.forEach(function(shape) {
				shapeToObject(shape, arr)
			});
			return;
		} else {
			var obj = shape.attr();
			obj["type"] = shape.type;
			arr.push(obj);
		}
	};
	/**
	 * @return an array on objects as described in Paper.add()
	 */
	Raphael.el.writeToObject = function() {
		var a = [];
		shapeToObject(this, a);
		return a;
	};
	/**
	 * @return an json string with structure described in Paper.add()
	 */
	Raphael.el.writeToString = function() {
		var a = this.writeToObject();
		var sb = [];
		for ( var i = 0; i < a.length; i++) {
			var shapeDesc = a[i], sb2 = [];
			sb2.push('"type":' + "\"" + shapeDesc.type + "\"");
			for ( var attrName in shapeDesc) {
				val = (shapeDesc[attrName] + "").replace(/\"/g, "\\\"");
				sb2.push('"' + attrName + '":"' + val + "\"");
			}
			var s = "{" + sb2.join(",") + "}";
			if (i < a.length - 1)
				s += ","
			sb.push(s);
		}
		return sb.join(",")
	};
	Raphael.st.writeToObject = function() {
		var a = [];
		this.forEach(function(shape) {
			a = a.concat(shape.writeToObject());
		});
		return a;
	};
	/**
	 * @return a json object just like expected by paper.add
	 */
	Raphael.st.writeToString = function() {
		var a = [];
		this.forEach(function(shape) {
			a = a.concat(shape.writeToString());
		});
		return "[" + a.join(",") + "]";
	};
	/**
	 * @return a json object just like expected by paper.add
	 */
	Raphael.fn.writeToObject = function() {
		var a = [];
		this.forEach(function(shape) {
			a = a.concat(shape.writeToObject());
		});
		return a;
	};
	/**
	 * @return a json object just like expected by paper.add
	 */
	Raphael.fn.writeToString = function() {
		var a = [];
		this.forEach(function(shape) {
			a = a.concat(shape.writeToString());
		});
		return "[" + a.join(",") + "]";
	};
})();

/*
 * named set Usage: 
 * 
 * var ns1 = paper.namedSet(); 
 * ns1.put("f1", paper.rect(0,0,1,11)); 
 * var s1 = paper.set(); 
 * s1.push(paper.circle(0,0,5));
 * ns1.put("s1", s1); ... 
 * ns1.get("s1").attr({fill: "red}); ...
 * ns1.remove("f1");
 * 
 * //iterate the named set for(var i in ns1.data) ns1.get(i).transform(...);
 * 
 * //get the "normal" set from named set: ns1.set.forEach(function(){...});
 * author: sgurin
 */
(function() {
	function NamedSet(paper) {
		this.paper = paper;
		this.set = paper.set();
		this.data = {};
	}
	;
	NamedSet.prototype.put = function(name, shape) {
		this.set.push(shape);
		this.data[name] = shape;
	};
	NamedSet.prototype.putAll = function(ns) {
		for ( var i in ns.data) {
			this.put(i, ns.data[i]);
		}
	};
	NamedSet.prototype.get = function(name) {
		return this.data[name];
	};
	/**
	 * @return removed object
	 */
	NamedSet.prototype.remove = function(name) {
		var obj = this.data[name];
		this.set.excludes(obj)
		this.data[name] = null;
		return obj;
	};
	/**
	 * @return an new named set with key-> values of removed shapes
	 */
	NamedSet.prototype.removeAll = function(ns) {
		var a = new NamedSet(this.paper);
		for ( var i in ns.data) {
			a.put(i, this.remove(i));
		}
		return a;
	};
	/** returns a new empty named set */
	Raphael.fn.namedSet = function() {
		return new NamedSet(this);
	};
})();

// /* path editor */
// (function(){
//
// /**
// * install a new free path editor- only applicable for paths
// @return an object {allShapes: set w all handlers.}
// */
// Raphael.el.pathEditor = function() {
// if(this.type!="path"||!this.attr("path")||this.attr("path")=="")
// return null;
//	
// this.pe={};
// this.pe.createHandler(cmd, cmdIdx) {
//		
// }
// var pe =
// this.pe.allShapes = //ref from shape to the FPE object
// this.paper.set();
//	
// var str = this.attr("path"), cmds = Raphael.parsePathString(str);
// for ( var i = 0; i < cmd.length; i++) {
//		
// }
// return pe;
// };
//
// })();

// /* attribute change notifications. use like this:
// * circle1.addAttrChangeListener("transform", function(attrName, oldValue,
// newValue){
// * ...
// * })
// * */
// (function() {
// Raphael.st._attrChangeListeners = Raphael.el._attrChangeListeners = {};
// Raphael.st.addAttrChangeListener = Raphael.el.addAttrChangeListener =
// function(attr, tl) {
// if(!this._attrChangeListeners[attr])
// this._attrChangeListeners[attr]=[];
// this._attrChangeListeners[attr].push(tl);
// };
//	
// /* now the trik part - override the attr() function -
// * no need to do it for Set because they call individual shape attr() */
// // Raphael.st.___attr = Raphael.st.attr;
// Raphael.el.___attr = Raphael.el.attr;
// Raphael.el.attr = function(name, value) {
// if ( name != null && Raphael.is(name, "object") ) {
// var params = name;
// for(var attr in params) {
// var listeners = this._attrChangeListeners[attr];
// if(listeners) {
// for ( var i = 0; i < listeners.length; i++) {
// listeners[i](attr, this.___attr(attr), params[attr]);
// }
// }
// }
// }
// else if (name!=null && value!=null) {
// var listeners = this._attrChangeListeners[attr];
// if(listeners) {
// for ( var i = 0; i < listeners.length; i++) {
// listeners[i](name, this.___attr(name), value);
// }
// }
// }
// return this.___attr(name, value);
// };
// Raphael.st.attr = function (name, value) {
// //extension - aSet.attr("transform") will return this set's first el attr
// transform
// if(name && !value && Raphael.is(name, "string")) {
//			
// }
// else if (name && R.is(name, array) && R.is(name[0], "object")) {
// // return this.___attr(name, value);
// for (var j = 0, jj = name.length; j < jj; j++) {
// this.items[j].attr(name[j]);
// }
// }
// else {
// for (var i = 0, ii = this.items.length; i < ii; i++) {
// this.items[i].attr(name, value);
// }
// }
// return this;
// };
// })();

// blur plugin: use like shape1.blur(2);
(function() {
	if (Raphael.vml) {
		var reg = / progid:\S+Blur\([^\)]+\)/g;
		Raphael.el.blur = function(size) {
			var s = this.node.style, f = s.filter;
			f = f.replace(reg, "");
			if (size != "none" && size != 0 && size != "0") {
				s.filter = f
						+ " progid:DXImageTransform.Microsoft.Blur(pixelradius="
						+ (+size || 1.5) + ")";
				s.margin = Raphael.format("-{0}px 0 0 -{0}px", Math
						.round(+size || 1.5));
			} else {
				s.filter = f;
				s.margin = 0;
			}
		};
	} else {
		var $ = function(el, attr) {
			if (attr) {
				for ( var key in attr)
					if (attr.hasOwnProperty(key)) {
						el.setAttribute(key, attr[key]);
					}
			} else {
				return document.createElementNS("http://www.w3.org/2000/svg",
						el);
			}
		};
		Raphael.el.blur = function(size) {
			// Experimental. No WebKit support.
			if (size != "none" && size != 0 && size != "0") {
				var fltr = $("filter"), blur = $("feGaussianBlur");
				fltr.id = "r" + (Raphael.idGenerator++).toString(36);
				$(blur, {
					stdDeviation : +size || 1.5
				});
				fltr.appendChild(blur);
				this.paper.defs.appendChild(fltr);
				this._blur = fltr;
				$(this.node, {
					filter : "url(#" + fltr.id + ")"
				});
			} else {
				if (this._blur) {
					this._blur.parentNode.removeChild(this._blur);
					delete this._blur;
				}
				this.node.removeAttribute("filter");
			}
		};
		Raphael.st.blur = function(size) {
			for ( var i = 0; i < this.items.length; i++) {
				this.items[i].blur(size);
			}
		};
	}
})();
// emboss plugin, use like shape1.emboss(1.0)
(function() {
	if (Raphael.vml) {
		var reg = / progid:\S+Emboss\([^\)]+\)/g;
		Raphael.el.emboss = function(bias) {
			var s = this.node.style, f = s.filter;
			f = f.replace(reg, "");
			if (bias != "none") {
				s.filter = f
						+ " progid:DXImageTransform.Microsoft.Emboss(bias="
						+ (bias || 0.0) + ")";
				// s.margin = Raphael.format("-{0}px 0 0 -{0}px",
				// Math.round(+size || 1.5));
			} else {
				s.filter = f;
				// s.margin = 0;
			}
		};
	} else {
		Raphael.el.emboss = function(bias) {

			if (!bias || bias == "0") {
				return this.convolveClear(Raphael.el.emboss.EMBOSS_TRANS_NAME);
			} else {
				var factor = bias;
				var embossKernel =

				[ factor * -1, 0, 0, 0, 1, 0, 0, 0, factor ];

				return this.convolve(Raphael.el.emboss.EMBOSS_TRANS_NAME, 3,
						embossKernel, 1.0, bias, null);
			}
		};
		Raphael.st.emboss = function(bias) {
			for ( var i = 0; i < this.items.length; i++) {
				this.items[i].emboss(bias);
			}
		};
		Raphael.el.emboss.EMBOSS_TRANS_NAME = "embossTransformation";
	}
})();

/*
 * pixel convolution tranformation (only svg). only squeare kernels allowed. you
 * can add many convolutions. Their name must be a valid html id. For example:
 * image.convolve("emboss1", 3, 3, [0.4,0,0,0,1,0,0,0,0.5])
 * image.convolve("conv2", 2,2,[1,2,2,3]) image.convolveClear("emboss1")
 * @author: SebastiÃ¡n Gurin <sgurin @ montevideo DOT com DOT uy>
 */
(function() {
	if (Raphael.vml) {
		// TODO
		Raphael.el.convolve = function(convolutionName, kernelXSize, kernel,
				divisor, bias, preserveAlpha) {
			return this;
		};
		Raphael.el.convolveClear = function(convolutionName) {
			return this;
		};
	} else {
		var $ = function(el, attr) {
			if (attr) {
				for ( var key in attr)
					if (attr.hasOwnProperty(key)) {
						el.setAttribute(key, attr[key]);
					}
			} else {
				return document.createElementNS("http://www.w3.org/2000/svg",
						el);
			}
		};
		Raphael.el.convolve = function(convolutionName, kernelXSize, kernel,
				divisor, bias, preserveAlpha) {

			// debugger;
			// convolution configuration
			var convolveConfig = {
				order : kernelXSize + "",
				kernelMatrix : kernel.join(" ")
			};
			if (divisor)
				convolveConfig["divisor"] = divisor;
			if (bias)
				convolveConfig["bias"] = bias;
			if (preserveAlpha)
				convolveConfig["preserveAlpha"] = preserveAlpha;
			else
				convolveConfig["preserveAlpha"] = "true";

			// if not exists create a main filter element
			if (this.mainFilter == null) {
				this.mainFilter = $("filter");
				this.mainFilter.id = "convolutionMainFilter"
				this.paper.defs.appendChild(this.mainFilter);
				$(this.node, {
					filter : "url(#convolutionMainFilter)"
				});
			}

			// create or gets the filter primitive element feConvolveMatrix:
			var convolveFilter = this._convolutions == null ? null
					: this._convolutions[convolutionName];
			if (convolveFilter == null) {
				convolveFilter = $("feConvolveMatrix");
			}
			this.mainFilter.appendChild(convolveFilter);

			// apply configuration and register
			$(convolveFilter, convolveConfig);
			if (!this._convolutions)
				this._convolutions = {}
			this._convolutions[convolutionName] = convolveFilter;

			return this;
		};
		Raphael.st.convolve = function(convolutionName, kernelXSize, kernel,
				divisor, bias, preserveAlpha) {
			for ( var i = 0; i < this.items.length; i++) {
				this.items[i].convolve(convolutionName, kernelXSize, kernel,
						divisor, bias, preserveAlpha);
			}
		};
		Raphael.el.convolveClear = function(convolutionName) {
			if (this._convolutions != null
					&& this._convolutions[convolutionName] != null
					&& this.mainFilter != null) {
				try {
					this.mainFilter
							.removeChild(this._convolutions[convolutionName]);
					this._convolutions[convolutionName] = null;
				} catch (ex) {
					alert("error removing filter for conv named : "
							+ convolutionName);
				}

			}
			return this;
		};
		Raphael.st.convolveClear = function(convolutionName) {
			for ( var i = 0; i < this.items.length; i++) {
				this.items[i].convolveClear(convolutionName);
			}
		};
		Raphael.el.convolveClearAll = function() {
			if (this.mainFilter != null) {
				this.paper.defs.removeChild(this.mainFilter);
				this.mainFilter = null;
				this._convolutions = null;
				this.node.removeAttribute("filter");
			}
		};
		Raphael.st.convolveClearAll = function() {
			for ( var i = 0; i < this.items.length; i++) {
				this.items[i].convolveClearAll();
			}
		};
	}

})();

// and now some convolution based transformations

/*
 * emboss2 support constant orientated embossing using prewittCompassGradient
 * 
 * orientation can be any of "north", "north-east", "east", "sourth
 * east","south", "south west", "west", "worth west"
 * 
 * factor can be an integer >1.0
 * 
 * divisor and bias are optional
 */
(function() {
	Raphael.el.emboss2 = function(factor, orientation, divisor, bias) {
		divisor = divisor || 1.0;
		bias = bias || 100;

		var k = null;
		if (orientation == "north") {
			k = [ -factor, 0, 0, 0, 1, 0, 0, 0, factor ];
		} else if (orientation == "north-east") {
			k = [ 0, 0, factor, 0, 1, 0, -factor, 0, 0 ];
		} else if (orientation == "east") {
			k = [ 0, 0, 0, -factor, 1, factor, 0, 0, 0 ];
		} else if (orientation == "south-east") {
			k = [ -factor, 0, 0, 0, 1, 0, 0, 0, factor ];
		} else if (orientation == "south") {
			k = [ 0, -factor, 0, 0, 1, 0, 0, factor, 0 ];
		} else if (orientation == "south-west") {
			k = [ 0, 0, -factor, 0, 1, 0, factor, 0, 0 ];
		} else if (orientation == "west") {
			k = [ 0, 0, 0, factor, 1, -factor, 0, 0, 0 ];
		} else if (orientation == "north-west") {
			k = [ factor, 0, 0, 0, 1, 0, 0, 0, -factor ];
		}
		if (k) {
			this.convolve("prewittCompassGradient1", 3, k, divisor, bias);
		}
		return this;
	}
})();

(function() {
	var multiplyFor = function(data, n, x) {
		var D = [];
		for ( var i = 0; i < n; i++)
			for ( var j = 0; j < n; j++)
				D[i * n + j] = data[i * n + j] * x;
		return D;
	};
	Raphael.el.sobel = function(size, multiplier, divisor, bias) {
		divisor = divisor || 1.0;
		bias = bias || 1.0;

		if (size == 1) {
			this.convolve("sobel1", 3, multiplyFor([ -1, 0, +1, -2, 0, +2, -1,
					0, +1 ], 3, multiplier), divisor, bias);
			this.convolve("sobel2", 3, multiplyFor([ +1, +2, +1, 0, 0, 0, -1,
					-2, -1 ], 3, multiplier), divisor, bias);
		} else if (size == 2) {
			this.convolve("sobel1", 4, multiplyFor([ -1, 0, 0, 1, -2, 0, 0, 2,
					-2, 0, 0, 2, -1, 0, 0, 1 ], 4, multiplier), divisor, bias);
			this.convolve("sobel2", 4,
					multiplyFor([ +1, +2, +2, +1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
							0, 0, -1, -2, -2, -1 ], 4, multiplier), divisor,
					bias);
		} else if (size == 3) {
			this.convolve("sobel1", 5, multiplyFor([ -1, 0, 0, 0, 1, -2, 0, 0,
					0, 2, -3, 0, 0, 0, 3, -2, 0, 0, 0, 2, -1, 0, 0, 0, 1 ], 5,
					multiplier), divisor, bias);
			this.convolve("sobel2", 5, multiplyFor(
					[ +1, +2, +3, +2, +1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
							0, 0, 0, -1, -2, -3, -2, -1 ], 5, multiplier),
					divisor, bias);
		} else if (size == 4) {
			this
					.convolve("sobel1", 6, multiplyFor([ -1, 0, 0, 0, 0, 1, -2,
							0, 0, 0, 0, 2, -3, 0, 0, 0, 0, 3, -3, 0, 0, 0, 0,
							3, -2, 0, 0, 0, 0, 2, -1, 0, 0, 0, 0, 1 ], 6,
							multiplier), divisor, bias);
			this.convolve("sobel2", 6, multiplyFor([ +1, +2, +3, +3, +2, +1, 0,
					0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					0, 0, 0, -1, -2, -3, -3, -2, -1 ], 6, multiplier), divisor,
					bias);
		} else if (size == 5) {
			this.convolve("sobel1", 7, multiplyFor([ -1, 0, 0, 0, 0, 0, 1, -2,
					0, 0, 0, 0, 0, 2, -3, 0, 0, 0, 0, 0, 3, -4, 0, 0, 0, 0, 0,
					4, -3, 0, 0, 0, 0, 0, 3, -2, 0, 0, 0, 0, 0, 2, -1, 0, 0, 0,
					0, 0, 1 ], 7, multiplier), divisor, bias);
			this.convolve("sobel2", 7, multiplyFor([ +1, +2, +3, +4, +3, +2,
					+1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -2,
					-3, -4, -3, -2, -1 ], 7, multiplier), divisor, bias);
		}
		return this;
	};
})();

/*
 * colorMatrix support for raphael. Only available on svg -
 * http://www.w3.org/TR/SVG/filters.html#feColorMatrixElement @author: Sebastian
 * Gurin <sgurin @ montevideo DOT com DOT uy>
 */
(function() {
	if (Raphael.vml) {
		// TODO
	} else {
		var $ = function(el, attr) {
			if (attr) {
				for ( var key in attr)
					if (attr.hasOwnProperty(key)) {
						el.setAttribute(key, attr[key]);
					}
			} else {
				return document.createElementNS("http://www.w3.org/2000/svg",
						el);
			}
		};
		Raphael.el.colorMatrix = function(tname, matrix) {
			var filterConfig = {
				type : "matrix",
				values : matrix.join(" ")
			};
			// if not exists create a main filter element
			if (this.colorMainFilter == null) {
				this.colorMainFilter = $("filter");
				this.colorMainFilter.id = "colorMainFilter"
				this.paper.defs.appendChild(this.colorMainFilter);
				$(this.node, {
					filter : "url(#colorMainFilter)"
				});
			}

			// create or gets the filter primitive element feColorMatrix:
			var colorFilter = this._colorFilters == null ? null
					: this._colorFilters[tname];
			if (colorFilter == null) {
				colorFilter = $("feColorMatrix");
			}
			this.colorMainFilter.appendChild(colorFilter);

			// apply configuration and register
			$(colorFilter, filterConfig);
			if (!this._colorFilters)
				this._colorFilters = {}
			this._colorFilters[tname] = colorFilter;

			return this;
		};

		Raphael.st.colorMatrix = function(tname, matrix) {
			for ( var i = 0; i < this.items.length; i++) {
				this.items[i].colorMatrix(tname, matrix);
			}
		};
		Raphael.el.colorMatrixClear = function(tName) {
			if (this._colorFilters != null && this._colorFilters[tName] != null
					&& this.colorMainFilter != null) {
				try {
					this.colorMainFilter.removeChild(this._colorFilters[tName]);
					this._colorFilters[tName] = null;
				} catch (ex) {
					alert("error removing filter for color matrix named : "
							+ tName);
				}

			}
			return this;
		};
		Raphael.el.colorMatrixClearAll = function() {
			if (this.colorMainFilter != null) {
				this.paper.defs.removeChild(this.colorMainFilter);
				this.colorMainFilter = null;
				this._colorFilters = null;
				this.node.removeAttribute("filter");
			}
		};
	}
})();

/* gray scale - portable - require colorMatrix for svg. */
(function() {
	if (Raphael.vml) {
		Raphael.el.toGrayScale = function() {
			this.node.style = "progid:DXImageTransform.Microsoft.BasicImage(grayScale=1)";
		};
	} else {
		var amount = 0.8;
		Raphael.el.toGrayScale = function() {
			this.colorMatrix("color1", [ amount, amount, amount, 0, 0, amount,
					amount, amount, 0, 0, amount, amount, amount, 0, 0, amount,
					amount, amount, 0, 0 ]);
		};
	}
})();

/*
 * fecomponentTransfer type linear raphael support for
 * http://www.w3.org/TR/SVG/filters.html#feComponentTransfer (SVG ONLY!) in this
 * first version, only type="linear" supported @author: Sebastian Gurin <sgurin @
 * montevideo DOT com DOT uy>
 */
(function() {
	if (Raphael.vml) {
		// TODO - I on't think VML support this.
	} else {
		var $ = function(el, attr) {
			if (attr) {
				for ( var key in attr)
					if (attr.hasOwnProperty(key)) {
						el.setAttribute(key, attr[key]);
					}
			} else {
				return document.createElementNS("http://www.w3.org/2000/svg",
						el);
			}
		};
		/**
		 * sets a named fecomponentTransfer SVG filter of type linear.
		 * fecomponentTransfer objects support attributes slope and intercept.
		 * The implementation is very simple, for each shape there will be a
		 * <filter> element in the paper for this operation
		 * (componentTransferLinear). The id will be var filterId =
		 * "componentTransfersMainFilter_"+this.id+tName; use
		 * Raphael.el.componentTransferClear for uninstall
		 * 
		 * @param tName:
		 *            the filter instance id
		 * @param funcs:
		 *            an object like this:
		 * 
		 * {funcR: {slope, intercept, type}, funcG: {slope, intercept, type},
		 * funcB: {slope, intercept, type}}
		 * 
		 * where slope and intercept are numbers, and type is "linear" TODO:
		 * other values. type is linear by default.
		 * 
		 * usage: el.componentTransferLinear("myTransf1", {funcR: {slope: 4,
		 * intercept: -1}, funcG: {slope: 4, intercept: -1}, funcB: {slope: 4,
		 * intercept: -1}})
		 */
		Raphael.el.componentTransferLinear = function(tName, funcs) {

			// if not exists create a main filter element
			if (this.componentTransfersMainFilter == null) {
				var filterId = "componentTransfersMainFilter_" + this.id
						+ tName;
				// search existance - if so do not add the filter again
				var exists = false;
				if (this.paper.defs) {
					for ( var i = 0; i < this.paper.defs.childNodes.length; i++) {
						if (this.paper.defs.childNodes.item(i).id == filterId) {
							exists = true;
							break;
						}
					}
				}
				if (!exists) { // create
					this.componentTransfersMainFilter = $("filter");
					this.componentTransfersMainFilter.id = filterId;
					this.paper.defs
							.appendChild(this.componentTransfersMainFilter);
					$(this.node, {
						filter : "url(#" + filterId + ")"
					});
				}
			}
			// create or gets the filter primitive element feComponentTransfer
			// with its feFuncX childs:
			var componentTransferFilter = this._componentTransfers == null ? null
					: this._componentTransfers[tName], funcR = null, funcG = null, funcB = null;
			if (!componentTransferFilter) {
				// register
				if (!this._componentTransfers)
					this._componentTransfers = {};
				componentTransferFilter = $("feComponentTransfer");
				this._componentTransfers[tName] = componentTransferFilter;

				funcR = $("feFuncR");
				funcG = $("feFuncG");
				funcB = $("feFuncB");
				componentTransferFilter.appendChild(funcR);
				componentTransferFilter.appendChild(funcG);
				componentTransferFilter.appendChild(funcB);
			} else {
				funcR = componentTransferFilter.childNodes[0];
				funcG = componentTransferFilter.childNodes[1];
				funcB = componentTransferFilter.childNodes[2];
			}
			// debugger;
			$(funcR, funcs["funcR"]);
			// if(!funcs["funcR"]["type"])
			funcR.setAttribute("type", "linear");

			$(funcG, funcs["funcG"]);
			// if(!funcs["funcR"]["type"])
			funcG.setAttribute("type", "linear");

			$(funcB, funcs["funcB"]);
			funcB.setAttribute("type", "linear");
			this.componentTransfersMainFilter
					.appendChild(componentTransferFilter);

			// register
			// if(! this._componentTransfers)
			// this._componentTransfers={}
			// this._componentTransfers[tName] = componentTransferFilter;

			return this;
		};
		// /**
		// * get an object that can be used with other shapes with
		// componentTransferLinearApply and componentTransferLinearUnapply
		// * usage:
		// * aShape.componentTransferLinear("transf1", {...});
		// * var filter1 = aShape.componentTransferLinearGet("transf1");
		// * anOtherShape.aShape.componentTransferLinearApply(filter1);
		// */
		// Raphael.el.componentTransferLinearGet = function(tname) {
		// //TODO:
		// };
		// Raphael.el.componentTransferLinearGet = function(tname) {
		// //TODO: get an object that can be used with other shapes with
		// componentTransferLinearApply and componentTransferLinearUnapply
		// };
		// Raphael.el.componentTransferLinearGet = function(tname) {
		// //TODO: get an object that can be used with other shapes with
		// componentTransferLinearApply and componentTransferLinearUnapply
		// };
		//        
		// Raphael.st.componentTransferLinear = function(tname, funcs) {
		// for ( var i = 0; i < this.items.length; i++) {
		// this.items[i].componentTransferLinear(tname, funcs);
		// }
		// };
		/**
		 * uninstall a filter installed with Raphael.el.componentTransferClear
		 */
		Raphael.el.componentTransferLinearClear = function(tName) {
			if (this._componentTransfers != null
					&& this._componentTransfers[tName] != null
					&& this.componentTransfersMainFilter != null) {
				try {
					this.componentTransfersMainFilter
							.removeChild(this._componentTransfers[tName]);
					this._componentTransfers[tName] = null;
				} catch (ex) {
					alert("error removing filter for conv named : " + tName);
				}

			}
			return this;
		};
		Raphael.el.componentTransferLinearClearAll = function() {
			if (this.componentTransfersMainFilter != null) {
				this.paper.defs.removeChild(this.componentTransfersMainFilter);
				this.componentTransfersMainFilter = null;
				this._componentTransfers = null;
				this.node.removeAttribute("filter");
			}
		};
	}
})();

// /* fecomponentTransfer general raphael support for
// http://www.w3.org/TR/SVG/filters.html#feComponentTransfer (SVG ONLY!)
// * in this first version, only type="linear" supported
// * @author: Sebastian Gurin <sgurin @ montevideo DOT com DOT uy>
// */
// (function () {
// if (Raphael.vml) {
// //TODO - I on't think VML support this.
// }
// else {
// var $ = function (el, attr) {
// if (attr) {
// for (var key in attr) if (attr.hasOwnProperty(key)) {
// el.setAttribute(key, attr[key]);
// }
// } else {
// return document.createElementNS("http://www.w3.org/2000/svg", el);
// }
// };
// /**
// * sets a named fecomponentTransfer SVG filter. the implementation is very
// simple, for each shape there will be a <filter>
// * element in the paper for this operation (componentTransferLinear). The id
// will be var filterId = "componentTransfersMainFilter_"+this.id+tName;
// * use Raphael.el.componentTransferClear for uninstall
// *
// * @param tName: the filter instance id
// * @param funcs: an object like this:
// *
// * {funcR: {slope, intercept, type}, funcG: {slope, intercept, type}, funcB:
// {slope, intercept, type}}
// *
// * where slope and intercept are numbers, and type is "linear" TODO: other
// values. type is linear by default.
// *
// * usage:
// el.componentTransferLinear("myTransf1", {funcR: {slope: 4, intercept: -1},
// funcG: {slope: 4, intercept: -1}, funcB: {slope: 4, intercept: -1}})
// */
// Raphael.el.componentTransfer = function (tName, funcs) {
//        	
// //if not exists create a main filter element
// if(this.componentTransfersMainFilter==null) {
// var filterId = "componentTransfersMainFilter_"+this.id+tName;
// //search existance - if so do not add the filter again
// var exists=false;
// if(this.paper.defs) {
// for(var i = 0; i<this.paper.defs.childNodes.length; i++) {
// if(this.paper.defs.childNodes.item(i).id==filterId) {
// exists=true;
// break;
// }
// }
// }
// if(!exists) { //create
// this.componentTransfersMainFilter = $("filter");
// this.componentTransfersMainFilter.id = filterId;
// this.paper.defs.appendChild(this.componentTransfersMainFilter);
// $(this.node, {filter: "url(#"+filterId+")"});
// }
// }
// //create or gets the filter primitive element feComponentTransfer with its
// feFuncX childs:
// var componentTransferFilter = this._componentTransfers==null ? null :
// this._componentTransfers[tName],
// funcR=null, funcG=null, funcB=null ;
// if(!componentTransferFilter){
// //register
// if(!this._componentTransfers)
// this._componentTransfers={};
// componentTransferFilter = $("feComponentTransfer");
// this._componentTransfers[tName]=componentTransferFilter;
//            	
// funcR = $("feFuncR");
// funcG = $("feFuncG");
// funcB = $("feFuncB");
// componentTransferFilter.appendChild(funcR);
// componentTransferFilter.appendChild(funcG);
// componentTransferFilter.appendChild(funcB);
// }
// else {
// funcR = componentTransferFilter.childNodes[0];
// funcG = componentTransferFilter.childNodes[1];
// funcB = componentTransferFilter.childNodes[2];
// }
// //debugger;
// $(funcR, funcs["funcR"]);
// // if(!funcs["funcR"]["type"])
// funcR.setAttribute("type", "linear");
//            
// $(funcG, funcs["funcG"]);
// // if(!funcs["funcR"]["type"])
// funcG.setAttribute("type", "linear");
//            
// $(funcB, funcs["funcB"]);
// funcB.setAttribute("type", "linear");
// this.componentTransfersMainFilter.appendChild(componentTransferFilter);
//            
// //register
// // if(! this._componentTransfers)
// // this._componentTransfers={}
// // this._componentTransfers[tName] = componentTransferFilter;
//            
// return this;
// };
// // /**
// // * get an object that can be used with other shapes with
// componentTransferLinearApply and componentTransferLinearUnapply
// // * usage:
// // * aShape.componentTransferLinear("transf1", {...});
// // * var filter1 = aShape.componentTransferLinearGet("transf1");
// // * anOtherShape.aShape.componentTransferLinearApply(filter1);
// // */
// // Raphael.el.componentTransferLinearGet = function(tname) {
// // //TODO:
// // };
// // Raphael.el.componentTransferLinearGet = function(tname) {
// // //TODO: get an object that can be used with other shapes with
// componentTransferLinearApply and componentTransferLinearUnapply
// // };
// // Raphael.el.componentTransferLinearGet = function(tname) {
// // //TODO: get an object that can be used with other shapes with
// componentTransferLinearApply and componentTransferLinearUnapply
// // };
// //
// // Raphael.st.componentTransferLinear = function(tname, funcs) {
// // for ( var i = 0; i < this.items.length; i++) {
// // this.items[i].componentTransferLinear(tname, funcs);
// // }
// // };
// /**
// * uninstall a filter installed with Raphael.el.componentTransferClear
// */
// Raphael.el.componentTransferClear = function (tName) {
// if (this._componentTransfers!=null && this._componentTransfers[tName]!=null
// &&
// this.componentTransfersMainFilter!=null) {
// try {
// this.componentTransfersMainFilter.removeChild(this._componentTransfers[tName]);
// this._componentTransfers[tName]=null;
// }catch(ex){alert("error removing filter for conv named : "+tName);}
//        		
// }
// return this;
// };
// Raphael.el.componentTransferClearAll = function() {
// if(this.componentTransfersMainFilter!=null) {
// this.paper.defs.removeChild(this.componentTransfersMainFilter);
// this.componentTransfersMainFilter=null;
// this._componentTransfers=null;
// this.node.removeAttribute("filter");
// }
// };
// }
// })();

/*
 * 'feMorphology' support for raphael. Only available on svg use
 * shape1.morphology(morphname, operator, radius) where operator cah be "erode"
 * or "dilate" and radius an int. morphname is the name of your transformation
 * and can be used later for unregistering the transf using
 * shape1.morphologyClear(morphname). @author: SebastiÃ¡n Gurin <sgurin @
 * montevideo DOT com DOT uy>
 */
(function() {
	if (Raphael.vml) {
		// TODO
	} else {
		var $ = function(el, attr) {
			if (attr) {
				for ( var key in attr)
					if (attr.hasOwnProperty(key)) {
						el.setAttribute(key, attr[key]);
					}
			} else {
				return document.createElementNS("http://www.w3.org/2000/svg",
						el);
			}
		};
		Raphael.el.morphology = function(tname, operator, radius) {
			var filterConfig = {
				"operator" : operator,
				"radius" : radius
			};
			// if not exists create a main filter element
			if (this.morphologyMainFilter == null) {
				this.morphologyMainFilter = $("filter");
				this.morphologyMainFilter.id = "morphologyMainFilter"
				this.paper.defs.appendChild(this.morphologyMainFilter);
				$(this.node, {
					filter : "url(#morphologyMainFilter)"
				});
			}

			// create or gets the filter primitive element feColorMatrix:
			var morphologyFilter = this._morphologyFilters == null ? null
					: this._morphologyFilters[tname];
			if (morphologyFilter == null) {
				morphologyFilter = $("feMorphology");
			}
			this.morphologyMainFilter.appendChild(morphologyFilter);

			// apply configuration and register
			$(morphologyFilter, filterConfig);
			if (!this._morphologyFilters)
				this._morphologyFilters = {}
			this._morphologyFilters[tname] = morphologyFilter;

			return this;
		};

		Raphael.el.morphologyClear = function(tName) {
			if (this._morphologyFilters != null
					&& this._morphologyFilters[tName] != null
					&& this.morphologyMainFilter != null) {
				try {
					this.morphologyMainFilter
							.removeChild(this._morphologyFilters[tName]);
					this._morphologyFilters[tName] = null;
				} catch (ex) {
					alert("error removing filter for morphology named : "
							+ tName);
				}

			}
			return this;
		};
		Raphael.el.morphologyClearAll = function() {
			if (this.morphologyMainFilter != null) {
				this.paper.defs.removeChild(this.morphologyMainFilter);
				this.morphologyMainFilter = null;
				this._morphologyFilters = null;
				this.node.removeAttribute("filter");
			}
		};

		Raphael.st.morphology = function(tname, operator, radius) {
			for ( var i = 0; i < this.items.length; i++) {
				this.items[i].morphology(tname, operator, radius);
			}
		}
	}
})();



/**
  CSS - like extension fopr raphaeljs - sgurin
  
  Can parse CSS code using a CSS subset for selecting raphael shapes and raphael attribute names 
  as css properties. Supports the following raphael shape selectors  
  
  1) select by shape type - rect{fill: #ededed} 
  
  2) select by attribute setted with raphael's data() like
  rect1.data("class1", "valwer") then rect[class1=walver]{fill: #ededed} 
  
  3) a default "class" key for example circle1.data("class", "button"); and css: .button1 {stroke: blue}
  
  4) multiple selector comma separated. Ex: [class123=value234], text {font-size: 16px; stroke-dasharray: -.}
 
 This is not CSS !  rules will override previous ones but there is no rule priority.
 Also there is no smart - auto stylization. If you create new shapes and call data()
 the previously applyed CSS astyle will not be applied for those. You have to manually call
 paper.styleApply(stySheetName) or  paper.styleApply(stySheetName, [checkedShapes]). 
  
  
  class do not support multiple classes space-separated. only one class.
  
 Sets are not supported in the selectors. !
 
  Full example: 
  

var paper = Raphael(0,0,600,600); 
var rect1 = paper.rect(10,120,120,50,3).attr({fill: "red"});
rect1.data("class", "pepe"); 
var path1 = paper.path("m10,10,l100,160,l200,10z").attr({"stroke-width": 3}); 
var c1 = paper.circle(190,80, 60).data("class123", "value234");
var text = paper.text(300,100,"HELLO"); 
var css1 = 
	"rect, path {fill: #ededed}"+
	".pepe {stroke: red; stroke-width: 12}"+
	"[class123=value234], text {font-size: 16px; stroke-dasharray: -.}"; 
var styleName1 = "sty1"; 
paper.styleAdd(styleName1, css1, true);

alert("now modify the stylesheets and re-apply the style programatically"); 
//get ths stylesheet object
var sty1 = paper.styleGet(styleName1); 
//get the first rule object - it is an array [selector:string, rule:obj]
var rule1 = sty1[0]; //this is the rule rect, path...
var rule1Value = rule1[1];  //the rule 1 value part
rule1Value["stroke"]="yellow"; //change it!

//now remove the second rule (.pepe {...})
sty1.splice(1, 1); 

//finnaly re-apply the stylesheet to reflect changes in the paper. 
paper.styleApply(styleName1); 

 */
(function() {
	if (!String.prototype.trim)
		String.prototype.trim = function() {
			return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		};

	/**
	 * returns a set of shapes of given type in an js object {elId: Id}
	 */
	Raphael.fn.selectByType = function(type, shapes) {
		var a = {}, el = null;
		if(!shapes) {
			el = this.bottom; 
			while (el != null) {
				if (el.type == type && !a[el.id])
					a[el.id] = el;
				el = el.next;
			}
		}
		else {
			for ( var i = 0; i < shapes.length; i++) {
				el = shapes[i]; 
				if (el.type == type && !a[el.id])
					a[el.id] = el;
			}
		}
		return a; 
	}
	Raphael.fn.selectByDataEquals = function(key, val, shapes) {
		var el = this.bottom, a = {};
		while (el != null) {
			if (el.data(key) == val)
				a[el.id] = el;
			el = el.next;
		}
		return a;
	}
	/**
	 * small CSS syntax selector for raphael paper - it supports by type, and by
	 * data() like described above.
	 * 
	 * @returns a javascript object shapeId->shape w the selected shapes that
	 *          match the selector on this paper.
	 */
	Raphael.fn.selectShapes = function(selector, shapes) {		
		var sels = selector.split(","), ret = {};
		for ( var i = 0; i < sels.length; i++) {
			var sel = sels[i].trim(), thisSel = {};			
			if (!sel || sel.length == 0)
				continue;
			var first = sel.substring(0, 1);
			if (first == "[") { // by attr
				var last = sel.substring(sel.length-1, sel.length); 
				if(last != "]") 
					continue;//error 
				var arr = sel.substring(1, sel.length-1).split("="); 
				if(arr.length!=2)
					continue; //error
				var key = arr[0], val = arr[1]; 
				thisSel = this.selectByDataEquals(key, val, shapes);
				
			} else if (first == ".") {// by class attr
				var c = sel.substring(1, sel.length);
				thisSel = this.selectByDataEquals("class", c, shapes);
			} else { // by type
				thisSel = this.selectByType(sel, shapes);
			}
			//copy values to main object
			for ( var j in thisSel) {
				if (!ret[j])
					ret[j] = thisSel[j];
			}
		}
		return ret;
	}
	Raphael.fn.styleAdd = function(styleSheetName, cssStr, apply) {
		if (!this._css_styles)
			this._css_styles = {};
		var rules = _parseCSS(cssStr);
		this._css_styles[styleSheetName] = rules;
		if (apply)
			this.styleApply(styleSheetName);

	};
	/** 
	 * @return a single or all style sheets registered. You can modify the returned object values 
	 * and call styleApply for re-apply the changes.
	 */
	Raphael.fn.styleGet = function(styleSheetName) {
		var obj = this._css_styles[styleSheetName];
		return obj; 
	}; 
	/**
	 * @return an object with all the stylesheets by name. You can modify the returned object values 
	 * and call styleApply for re-apply the changes.
	 */
	Raphael.fn.styleGetAll = function(styleSheetName) {
		return this._css_styles; 
	}; 
	/**
	 * apply an already registered stylesheet in this paper.
	 */
	Raphael.fn.styleApply = function(styleSheetName, shapes) {
		if(!this._css_styles)
			return; 
		var rules = this._css_styles[styleSheetName]; 
		
		for ( var i = 0; i < rules.length; i++) {
			var sel = rules[i][0], val = rules[i][1];
			var shapes = this.selectShapes(sel, shapes);
			for(var shapeId in shapes) {
				shapes[shapeId].attr(val); 
			}
		}
	};
	
//	//class management for shapes
//	Raphael.el._classInit = function() {
//		if(!this.data("class"))
//			this.data("class", ""); 
//	}; 
//	Raphael.el.addClass = function(c) {
//		this._classInit(); 
//		var cl = this.data("class").split(" "); 
//		var idx = cl.indexOf(c); 
//		if(idx==-1)
//			this.data("class", cl.concat([c]).join(" ")); 
//	}; 
//	Raphael.el.removeClass = function(c) {
//		this._classInit(); 
//		var cl = this.data("class").split(" ");
//		var idx = cl.indexOf(c)
//		if(idx >= 0)
//			this.data("class", cl.splice(idx, 1).join(" ")); 
//	}; 

	// utilities
	/** @return an array with the rules parsed like [["rect", {fill: blue...}], [".class1, path", {....}]]
	 * simple CSS lke parser - for a mor serius CSS support more sofisticated
	 * CSS parsers should be take in consideration like
	 * http://www.glazman.org/JSCSSP/ - dom oriented not just parsing
	 */
	_parseCSS = function(css) {
		var rules = [];
		css = _removeComments(css);
		var blocks = css.split('}');
		blocks.pop();
		var len = blocks.length;
		for ( var i = 0; i < len; i++) {
			var pair = blocks[i].split('{');
			var sel = (pair[0] + "").trim();
			var parsed = _parseCSSBlock(pair[1]);
			rules.push([sel, parsed]);
		}
		return rules;
	};
	_parseCSSBlock = function(css) {
		var rule = {};
		var declarations = css.split(';');
		var len = declarations.length;
		for ( var i = 0; i < len; i++) {
			var loc = declarations[i].indexOf(':');
			if (loc == -1)
				continue;
			var property = declarations[i].substring(0, loc).trim(); 
			var value = declarations[i].substring(loc + 1).trim();
			if (property != "" && value != "") {
				rule[property] = value;
			}
		}
		return rule;
	};
	_removeComments = function(css) {
		return css.replace(/\/\*(\r|\n|.)*\*\//g, "");
	};

})();

// SVG export extension from https://github.com/ElbertF/Raphael.Export

/**
 * Raphael.Export https://github.com/ElbertF/Raphael.Export
 * 
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 * 
 */

(function(R) {
	/**
	 * Escapes string for XML interpolation
	 * 
	 * @param value
	 *            string or number value to escape
	 * @returns string escaped
	 */
	function escapeXML(s) {
		if (typeof s === 'number')
			return s.toString();

		var replace = {
			'&' : 'amp',
			'<' : 'lt',
			'>' : 'gt',
			'"' : 'quot',
			'\'' : 'apos'
		};

		for ( var entity in replace) {
			s = s.replace(new RegExp(entity, 'g'), '&' + replace[entity] + ';');
		}

		return s;
	}

	/**
	 * Generic map function
	 * 
	 * @param iterable
	 *            the array or object to be mapped
	 * @param callback
	 *            the callback function(element, key)
	 * @returns array
	 */
	function map(iterable, callback) {
		var mapped = new Array;

		for ( var i in iterable) {
			if (iterable.hasOwnProperty(i)) {
				var value = callback.call(this, iterable[i], i);

				if (value !== null)
					mapped.push(value);
			}
		}

		return mapped;
	}

	/**
	 * Generic reduce function
	 * 
	 * @param iterable
	 *            array or object to be reduced
	 * @param callback
	 *            the callback function(initial, element, i)
	 * @param initial
	 *            the initial value
	 * @return the reduced value
	 */
	function reduce(iterable, callback, initial) {
		for ( var i in iterable) {
			if (iterable.hasOwnProperty(i)) {
				initial = callback.call(this, initial, iterable[i], i);
			}
		}

		return initial;
	}

	/**
	 * Utility method for creating a tag
	 * 
	 * @param name
	 *            the tag name, e.g., 'text'
	 * @param attrs
	 *            the attribute string, e.g., name1="val1" name2="val2" or
	 *            attribute map, e.g., { name1 : 'val1', name2 : 'val2' }
	 * @param content
	 *            the content string inside the tag
	 * @returns string of the tag
	 */
	function tag(name, attrs, matrix, content) {
		if (typeof content === 'undefined' || content === null) {
			content = '';
		}

		if (typeof attrs === 'object') {
			attrs = map(attrs, function(element, name) {
				if (name === 'transform')
					return;

				return name + '="' + escapeXML(element) + '"';
			}).join(' ');
		}

		return '<'
				+ name
				+ (matrix ? ' transform="matrix('
						+ matrix.toString().replace(/^matrix\(|\)$/g, '')
						+ ')" ' : ' ') + attrs + '>' + content + '</' + name
				+ '>';
	}

	/**
	 * @return object the style object
	 */
	function extractStyle(node) {
		return {
			font : {
				family : node.attrs.font.replace(/^.*?"(\w+)".*$/, '$1'),
				size : typeof node.attrs['font-size'] === 'undefined' ? null
						: node.attrs['font-size']
			}
		};
	}

	/**
	 * @param style
	 *            object from style()
	 * @return string
	 */
	function styleToString(style) {
		// TODO figure out what is 'normal'
		return 'font: normal normal normal 10px/normal '
				+ style.font.family
				+ (style.font.size === null ? '' : '; font-size: '
						+ style.font.size + 'px');
	}

	/**
	 * Computes tspan dy using font size. This formula was empircally determined
	 * using a best-fit line. Works well in both VML and SVG browsers.
	 * 
	 * @param fontSize
	 *            number
	 * @return number
	 */
	function computeTSpanDy(fontSize, line, lines) {
		if (fontSize === null)
			fontSize = 10;

		// return fontSize * 4.5 / 13
		return fontSize * 4.5 / 13 * (line - .2 - lines / 2) * 3.5;
	}

	var serializer = {
		'text' : function(node) {
			style = extractStyle(node);

			var tags = new Array;

			map(node.attrs['text'].split('\n'), function(text, iterable, line) {
				line = line || 0;
				tags.push(tag('text', reduce(node.attrs, function(initial,
						value, name) {
					if (name !== 'text' && name !== 'w' && name !== 'h') {
						if (name === 'font-size')
							value = value + 'px';

						initial[name] = escapeXML(value.toString());
					}

					return initial;
				}, {
					style : 'text-anchor: middle; ' + styleToString(style)
							+ ';'
				}), node.matrix, tag('tspan', {
					dy : computeTSpanDy(style.font.size, line + 1,
							node.attrs['text'].split('\n').length)
				}, null, text)));
			});

			return tags;
		},
		'path' : function(node) {
			var initial = (node.matrix.a === 1 && node.matrix.d === 1) ? {} : {
				'transform' : node.matrix.toString()
			};

			return tag('path', reduce(node.attrs,
					function(initial, value, name) {
						if (name === 'path')
							name = 'd';

						initial[name] = value.toString();

						return initial;
					}, {}), node.matrix);
		}
	// Other serializers should go here
	};

	R.fn.toSVG = function() {
		var paper = this, restore = {
			svg : R.svg,
			vml : R.vml
		}, svg = '<svg style="overflow: hidden; position: relative;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'
				+ paper.width
				+ '" version="1.1" height="'
				+ paper.height
				+ '">';

		R.svg = true;
		R.vml = false;

		for ( var node = paper.bottom; node != null; node = node.next) {
			if (node.node.style.display === 'none')
				continue;

			var attrs = '';

			// Use serializer
			if (typeof serializer[node.type] === 'function') {
				svg += serializer[node.type](node);

				continue;
			}

			switch (node.type) {
			case 'image':
				attrs += ' preserveAspectRatio="none"';
				break;
			}

			for (i in node.attrs) {
				var name = i;

				switch (i) {
				case 'src':
					name = 'xlink:href';

					break;
				case 'transform':
					name = '';

					break;
				}

				if (name) {
					attrs += ' ' + name + '="'
							+ escapeXML(node.attrs[i].toString()) + '"';
				}
			}

			svg += '<' + node.type + ' transform="matrix('
					+ node.matrix.toString().replace(/^matrix\(|\)$/g, '')
					+ ')"' + attrs + '></' + node.type + '>';
		}

		svg += '</svg>';

		R.svg = restore.svg;
		R.vml = restore.vml;

		return svg;
	};
})(window.Raphael);

/* import svg plugin from https://github.com/sanojian/raphael-svg-import */
/*
 * Raphael SVG Import 0.0.1 - Extension to Raphael JS
 * 
 * Copyright (c) 2009 Wout Fierens Licensed under the MIT
 * (http://www.opensource.org/licenses/mit-license.php) license.
 * 
 * 
 * 2011-12-08 modifications by Jonas Olmstead - added support for radial and
 * linear gradients - added support for paths - removed prototype.js
 * dependencies (I can't read that stuff) - changed input parameter to svg xml
 * file - added support for text elements - added support for nested groups -
 * added support for transforms and scaling applied to groups - svg elements
 * returned as a set
 * 
 */
Raphael.fn.importSVGStr = function(svgString) { // added by sgurin
	var xmlDoc = null;
	if (window.DOMParser) {
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(svgString, "text/xml");
	} else {
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(svgString);
	}
	if (xmlDoc)
		return this.importSVG(xmlDoc);
	else
		return null;
};
Raphael.fn.importSVG = function(svgXML) {
	try {

		// create a set to return
		var m_myNewSet = this.set();

		var strSupportedShapes = "|rect|circle|ellipse|path|image|text|polygon|";

		// collect all gradient colors
		var linGrads = svgXML.getElementsByTagName("linearGradient");
		var radGrads = svgXML.getElementsByTagName("radialGradient");

		this.doFill = function(strNode, attr, mNodeName, mNodeValue) {
			// check if linear gradient
			if (mNodeValue.indexOf("url") == 0) {
				var opacity;
				var gradID = mNodeValue.substring("url(#".length,
						mNodeValue.length - 1);
				for ( var l = 0; l < radGrads.length; l++)
					if (radGrads.item(l).getAttribute("id") == gradID) {
						// get stops
						var stop1, stop2;
						for ( var st = 0; st < radGrads.item(l).childNodes.length; st++)
							if (radGrads.item(l).childNodes.item(st).nodeName == "stop") {
								if (stop1)
									stop2 = radGrads.item(l).childNodes
											.item(st);
								else
									stop1 = radGrads.item(l).childNodes
											.item(st);
							}

						if (!stop1)
							return; // could not parse stops

						// TODO: implement radial offset
						// radial gradients not supported for paths, so do
						// linear
						if (strNode == "path")
							attr[mNodeName] = 90 + "-"
									+ stop1.getAttribute("stop-color") + "-"
									+ stop2.getAttribute("stop-color") + ":50-"
									+ stop1.getAttribute("stop-color");
						else
							attr[mNodeName] = "r("
									+ radGrads.item(l).getAttribute("fx") + ","
									+ radGrads.item(l).getAttribute("fx") + ")"
									+ stop1.getAttribute("stop-color") + "-"
									+ stop2.getAttribute("stop-color");

						if (stop1.getAttribute("stop-opacity"))
							opacity = stop1.getAttribute("stop-opacity")
					}

				for ( var l = 0; l < linGrads.length; l++)
					if (linGrads.item(l).getAttribute("id") == gradID) {
						// get angle
						var b = parseFloat(linGrads.item(l).getAttribute("y2"))
								- parseFloat(linGrads.item(l)
										.getAttribute("y1"));
						var c = parseFloat(linGrads.item(l).getAttribute("x2"))
								- parseFloat(linGrads.item(l)
										.getAttribute("x1"));
						var angle = Math.atan(b / c);
						if (c < 0)
							angle = angle - Math.PI;

						angle = parseInt(Raphael.deg(angle) + 360) % 360;

						// get stops
						var stop1, stop2;
						for ( var st = 0; st < linGrads.item(l).childNodes.length; st++)
							if (linGrads.item(l).childNodes.item(st).nodeName == "stop") {
								if (stop1)
									stop2 = linGrads.item(l).childNodes
											.item(st);
								else
									stop1 = linGrads.item(l).childNodes
											.item(st);
							}

						if (!stop1)
							return; // could not parse stops

						// TODO: hardcoded offset value of 50
						attr[mNodeName] = angle + "-"
								+ stop1.getAttribute("stop-color") + "-"
								+ stop2.getAttribute("stop-color") + ":50-"
								+ stop1.getAttribute("stop-color");
						if (stop1.getAttribute("stop-opacity"))
							opacity = stop1.getAttribute("stop-opacity")
					}
				if (opacity)
					attr["opacity"] = opacity;
			} else {
				attr[mNodeName] = mNodeValue;
			}

		};

		this.parseElement = function(elShape, myNewSet) {
			var node = elShape.nodeName;

			if (node == "g") {
				// this is a group, parse the children and add to set
				var groupSet = this.set();

				for ( var o = 0; o < elShape.childNodes.length; o++)
					this.parseElement(elShape.childNodes.item(o), groupSet);

				// now apply transforms and attributes to set
				for ( var k = 0; k < elShape.attributes.length; k++) {
					var m = elShape.attributes[k];
					if (m.nodeName == "transform" && groupSet.transform) {
						var actions = m.nodeValue.split(')');
						for ( var a = 0; a < actions.length; a++) {
							if (actions[a].indexOf("matrix") == 0)
								groupSet.transform("m"
										+ actions[a].substring(actions[a]
												.indexOf("(") + 1));
							else if (actions[a])
								eval("groupSet." + actions[a] + ")");
						}
					} else
						groupSet.attr(m.nodeName, m.nodeValue);
				}
				myNewSet.push(groupSet);
				return;
			}

			if (node && strSupportedShapes.indexOf("|" + node + "|") >= 0) {

				var attr = {
					"stroke-width" : 0,
					"fill" : "#fff"
				};
				var shape;
				var style;
				// find the id
				var nodeID = elShape.getAttribute("id");

				m_font = "";
				for ( var k = 0; k < elShape.attributes.length; k++) {
					var m = elShape.attributes[k];

					switch (m.nodeName) {
					case "stroke-dasharray":
						attr[m.nodeName] = "- ";
						break;
					case "style":
						// TODO: handle gradient fills within a style
						style = m.nodeValue.split(";");
						for ( var l = 0; l < style.length; l++)
							if (style[l].split(":")[0] == "fill")
								this.doFill(node, attr, style[l].split(":")[0],
										style[l].split(":")[1]);
							else
								attr[style[l].split(":")[0]] = style[l]
										.split(":")[1];
						break;
					case "fill":
						this.doFill(node, attr, m.nodeName, m.nodeValue);
						break;
					case "font-size":
						m_font = m.nodeValue + "px " + m_font;
						attr[m.nodeName] = m.nodeValue;
						break;
					case "font-family":
						m_font = m_font + "\"" + m.nodeValue + "\"";
						break;
					case "x":
					case "y":
					case "cx":
					case "cy":
					case "rx":
					case "ry":
						// use numbers for location coords
						attr[m.nodeName] = parseFloat(m.nodeValue);
						break;
					case "text-anchor":
						// skip these due to bug in text scaling
						break;
					default:
						attr[m.nodeName] = m.nodeValue;
						break;
					}

				}

				switch (node) {
				case "rect":
					if (attr["rx"])
						shape = this.rect(attr["x"], attr["y"], elShape
								.getAttribute("width"), elShape
								.getAttribute("height"), attr["rx"]);
					else
						shape = this.rect();
					break;
				case "circle":
					// changed to ellipse, we are not doing circles today
					shape = this.ellipse();
					attr["rx"] = attr["r"];
					attr["ry"] = attr["r"];
					break;
				case "ellipse":
					shape = this.ellipse();
					break;
				case "path":
					shape = this.path(attr["d"]);
					break;
				case "polygon":
					// convert polygon to a path
					var point_string = attr["points"].trim();
					var aryPoints = point_string.split(" ");
					var strNewPoints = "M";
					for ( var i in aryPoints) {
						if (i > 0)
							strNewPoints += "L";
						strNewPoints += aryPoints[i];
					}
					strNewPoints += "Z";
					shape = this.path(strNewPoints);
					break;
				case "image":
					shape = this.image();
					break;
				case "text":
					shape = this.text(attr["x"], attr["y"], elShape.text
							|| elShape.textContent);
					shape.attr("font", m_font);
					shape.attr("stroke", "none");
					shape.origFontPt = parseInt(attr["font-size"]);
					break;
				}

				// put shape into set
				myNewSet.push(shape);

				// apply attributes
				shape.attr(attr);

				// apply transforms
				for ( var k = 0; k < elShape.attributes.length; k++) {
					var m = elShape.attributes[k];

					if (m.nodeName == "transform" && shape.transform) {
						var actions = m.nodeValue.split(')');
						for ( var a = 0; a < actions.length; a++) {
							if (actions[a].indexOf("matrix") == 0)
								shape.transform("m"
										+ actions[a].substring(actions[a]
												.indexOf("(") + 1));
							else if (actions[a])
								eval("shape." + actions[a] + ")");
						}
					}
				}

			}
		};

		var elShape;
		var m_font;
		var elSVG = svgXML.getElementsByTagName("svg")[0];
		elSVG.normalize();
		for ( var i = 0; i < elSVG.childNodes.length; i++) {
			elShape = elSVG.childNodes.item(i);

			this.parseElement(elShape, m_myNewSet);

		}

	} catch (error) {
		alert("The SVG data you entered was invalid! (" + error + ")");
	}

	// return our new set
	return m_myNewSet;

};

/**
 * nt_translate/nt_scale - translate and scale without using transformation (nt ==
 * no transform) Methods for moving/ scaling any object using the same api
 * without changing its transform attr
 * 
 * 
 * @author: sgurin
 */
(function() {
	/** define 2 custom attributes translateNT and scaleNT (relative attributes) */
	var initCA = function(shape) {
		if(!shape.paper.customAttributes["translateNT"]) {
			
			shape.paper.customAttributes["translateNT"] = function(dx, dy) {
				if (this.type == "circle" || this.type == "ellipse") {
					return {
						"cx" : this.attr("cx") + dx,
						"cy" : this.attr("cy") + dy
					};
				} else if (this.type == "rect" || this.type == "text"
						|| this.type == "image") {
					return {
						"x" : this.attr("x") + dx,
						"y" : this.attr("y") + dy
					};
				} else if (this.type == "path") {
					var matrix = Raphael.matrix(1, 0, 0, 1, 0, 0);
					matrix.translate(dx, dy);
					var newPath = Raphael.mapPath(this.attr("path"), matrix);
					this.attr({
						"path" : newPath
					});
				}			
			}; 			
			
			shape.paper.customAttributes["scaleNT"] = function(dx, dy) {
			
				if (this.type == "circle") {
					return {
						"r" : this.attr("r") * Math.max(dx, dy)
					};
				} else if (this.type == "ellipse") {
					return {
						"rx" : this.attr("rx") * dx,
						"ry" : this.attr("ry") * dy
					};
				} else if (this.type == "rect" || this.type == "image") {
					return {
						"width" : this.attr("width") * dx,
						"height" : this.attr("height") * dy
					};
				} else if (this.type == "text") {
					var fs = parseInt(this.attr("font-size") + "");
					return {
						"font-size" : fs * Math.max(dx, dy)
					};
				} else if (this.type == "path") {
					var bb = this.getBBox(), cx = bb.x + bb.width / 2, cy = bb.y
							+ bb.height / 2;
					var matrix = Raphael.matrix(1, 0, 0, 1, 0, 0);
					matrix.scale(dx, dy, cx, cy);
					var newPath = Raphael.mapPath(this.attr("path"), matrix);
					return {
						"path" : newPath
					};
				}
			}
			
			
		}
	}; 
	Raphael.el.nt_translate = function(dx, dy) {
		initCA(this); 
		if (this.type == "circle" || this.type == "ellipse") {
			this.attr({
				"cx" : this.attr("cx") + dx,
				"cy" : this.attr("cy") + dy
			});
		} else if (this.type == "rect" || this.type == "text"
				|| this.type == "image") {
			this.attr({
				"x" : this.attr("x") + dx,
				"y" : this.attr("y") + dy
			});
		} else if (this.type == "path") {
			var matrix = Raphael.matrix(1, 0, 0, 1, 0, 0);
			matrix.translate(dx, dy);
			var newPath = Raphael.mapPath(this.attr("path"), matrix);
			this.attr({
				"path" : newPath
			});
		}
		return this; 
	};
	Raphael.el.nt_scale = function(dx, dy) {
		initCA(this);
		if (this.type == "circle") {
			this.attr({
				"r" : this.attr("r") * Math.max(dx, dy)
			});
		} else if (this.type == "ellipse") {
			this.attr({
				"rx" : this.attr("rx") * dx,
				"ry" : this.attr("ry") * dy
			});
		} else if (this.type == "rect" || this.type == "image") {
			this.attr({
				"width" : this.attr("width") * dx,
				"height" : this.attr("height") * dy
			});
		} else if (this.type == "text") {
			var fs = parseInt(this.attr("font-size") + "");
			this.attr({
				"font-size" : fs * Math.max(dx, dy)
			});
		} else if (this.type == "path") {
			var bb = this.getBBox(), cx = bb.x + bb.width / 2, cy = bb.y
					+ bb.height / 2;
			var matrix = Raphael.matrix(1, 0, 0, 1, 0, 0);
			matrix.scale(dx, dy, cx, cy);
			var newPath = Raphael.mapPath(this.attr("path"), matrix);
			this.attr({
				"path" : newPath
			});
		}
		return this; 
	}

	Raphael.st.nt_translate = function(dx, dy) {
		initCA(this);
		this.forEach(function(shape, idx) {
			shape.nt_translate(dx, dy);
			return true;
		});
		return this; 
	};
	Raphael.st.nt_scale = function(dx, dy) {
		initCA(this);
		this.forEach(function(shape, idx) {
			shape.nt_scale(dx, dy);
			return true;
		});
		return this; 
	};
	
	

})();

/*
 * path editor extension a path editor for be able of edit the path commands
 * dragging its points.
 * 
 * TODO: -visual feedback of the path segment / command being edited.
 * 
 * @author: sgurin
 */
(function() {
	/**
	 * installs a new path editor on this path.
	 * 
	 * cfg is an object with following parameters : commandEditors - colors and
	 * names for each path cmd dragThrottle - the dragThrottle in ms - default
	 * 80.
	 * 
	 */
	Raphael.el.installPathEditor = function(cfg) {
		cfg = !cfg ? {} : cfg;
		if (!this.type || this.type != "path" || !this.attr("path"))
			return;
		var pathObject = Raphael.parsePathString(this.attr("path"));

		var context = {
			"pathObject" : pathObject,
			"shape" : this,
			"commandEditors" : cfg.commandEditors ? cfg.commandEditors
					: commandEditors,
			"dragThrottle" : cfg.dragThrottle ? dragThrottle : 80
		}
		var editorSet = this.paper.set(), legendSet = this.paper.set();
		for ( var i = 0; i < pathObject.length; i++) {
			var cmd = pathObject[i];
			cmd.cmdIndex = i;
			var cmdEditShape = buildPathCmdEditorFor(context, cmd);
		}

		// build legend set
		var y = 10;
		for ( var i in context.commandEditors) {
			var c1 = paper.circle(10, y, 5).attr({
				fill : context.commandEditors[i]["bgColor"]
			});
			var t1 = paper
					.text(30, y, context.commandEditors[i]["description"])
					.attr({
						"text-anchor" : "start"
					});
			y += 25;
			legendSet.push(c1);
			legendSet.push(t1);
		}
		return {
			"editor" : editorSet,
			"legend" : legendSet,
		};
	};
	// default editor config
	var commandEditors = {
		"L" : {
			"bgColor" : "#ededed",
			"textColor" : "black",
			"name" : "L",
			description : "line to"
		},
		"M" : {
			"bgColor" : "#111111",
			"textColor" : "white",
			"name" : "M",
			description : "move to"
		},
		"H" : {
			"bgColor" : "#ff1111",
			"textColor" : "yellow",
			"name" : "H",
			description : "horizontal line to"
		},
		"V" : {
			"bgColor" : "#ffff11",
			"textColor" : "yellow",
			"name" : "V",
			description : "vertical line to"
		},
		"C" : {
			"bgColor" : "#55ee55",
			"textColor" : "black",
			"name" : "C",
			description : "curve to"
		},
		"S" : {
			"bgColor" : "#1111ff",
			"textColor" : "black",
			"name" : "S",
			description : "smooth curve to"
		},
		"Q" : {
			"bgColor" : "orange",
			"textColor" : "black",
			"name" : "Q",
			description : "quadratic Bézier curve to"
		},
		"T" : {
			"bgColor" : "purple",
			"textColor" : "black",
			"name" : "T",
			description : "smooth quadratic Bézier curve to"
		},
		"R" : {
			"bgColor" : "brown",
			"textColor" : "black",
			"name" : "R",
			description : "Catmull-Rom curve to"
		}
	};
	var buildPathCmdEditorFor = function(context, cmd) {
		if (!cmd || cmd.length < 1)
			return;

		var ed = null;

		if (cmd[0] == "L" && cmd.length == 3) {
			ed = buildLineToCmdEditor(context, cmd);
		} else if (cmd[0] == "M" && cmd.length == 3) {
			ed = buildMoveToCmdEditor(context, cmd);
		} else if (cmd[0] == "H" && cmd.length == 2) {
			ed = buildHLineToCmdEditor(context, cmd);
		} else if (cmd[0] == "V" && cmd.length == 2) {
			ed = buildVLineToCmdEditor(context, cmd);
		} else if (cmd[0] == "C" && cmd.length == 7) {
			ed = buildCurveToCmdEditor(context, cmd);
		} else if (cmd[0] == "S" && cmd.length == 5) {
			ed = buildSCurveToCmdEditor(context, cmd);
		} else if (cmd[0] == "Q" && cmd.length == 5) {
			ed = buildQCurveToCmdEditor(context, cmd);
		} else if (cmd[0] == "T" && cmd.length == 3) {
			ed = buildSQBCurveToCmdEditor(context, cmd);
		} else if (cmd[0] == "R" && cmd.length == 5) {
			ed = buildCRCurveToCmdEditor(context, cmd);
		} else if (cmd[0] == "Z") {

		} else {
			throw "Path Command " + cmd[0] + " not supported";
		}

		return ed;
	};

	// L - lineto
	var buildLineToCmdEditor = function(context, cmd) {
		var paper = context.shape.paper;
		var c = paper.circle(cmd[1], cmd[2], 5).attr({
			fill : context.commandEditors["L"]["bgColor"]
		});
		// var pathSegmentFeedback = paper.circle(cmd[1], cmd[2],
		// 50).attr({opacity: 0.5, fill: "red"}).toBack().hide(); ;
		var ctx = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c,
			"cmd" : cmd
		// , "pathSegmentFeedback": pathSegmentFeedback
		};
		c.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[1] = x;
			this.cmd[2] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			// this.pathSegmentFeedback.attr({"cx": x, "cy": y});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
			// this.pathSegmentFeedback.attr({"cx": this.feedback.attr("cx"),
			// "cy": this.feedback.attr("cy")});
			// this.pathSegmentFeedback.show().toBack();
		}, function() { /* ends */
			// this.pathSegmentFeedback.hide();
		}, ctx, ctx, ctx);
		return c;
	};

	// T - quadratic Bézier curveto
	var buildSQBCurveToCmdEditor = function(context, cmd) {
		var paper = context.shape.paper;
		var c = paper.circle(cmd[1], cmd[2], 5).attr({
			fill : context.commandEditors["T"]["bgColor"]
		});
		var ctx = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c,
			"cmd" : cmd
		};
		c.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[1] = x;
			this.cmd[2] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx, ctx, ctx);
		return c;
	};

	// M - moveto
	var buildMoveToCmdEditor = function(context, cmd) {
		var paper = context.shape.paper;
		var c = paper.circle(cmd[1], cmd[2], 5).attr({
			fill : context.commandEditors["M"]["bgColor"]
		});
		var ctx = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c,
			"cmd" : cmd
		}
		c.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[1] = x;
			this.cmd[2] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx, ctx, ctx);
		return c;
	};

	// H horizontal line
	var buildHLineToCmdEditor = function(context, cmd) {
		var paper = context.shape.paper;
		var c = paper.circle(cmd[1], 50, 5).attr({
			fill : context.commandEditors["H"]["bgColor"]
		});
		var ctx = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c,
			"cmd" : cmd
		}
		c.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[1] = x;
			// this.cmd[2]=y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx, ctx, ctx);
		return c;
	};

	// V - vertical line
	var buildVLineToCmdEditor = function(context, cmd) {
		var paper = context.shape.paper;
		var c = paper.circle(50, cmd[1], 5).attr({
			fill : context.commandEditors["V"]["bgColor"]
		});
		var ctx = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c,
			"cmd" : cmd
		}
		c.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			// this.cmd[1]=x;
			this.cmd[1] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx, ctx, ctx);
		return c;
	};

	// C - curveto
	var buildCurveToCmdEditor = function(context, cmd) {
		var paper = context.shape.paper;
		var set = paper.set();
		var c1 = paper.circle(cmd[1], cmd[2], 5).attr({
			fill : context.commandEditors["C"]["bgColor"]
		});
		var ctx1 = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c1,
			"cmd" : cmd
		}
		c1.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[1] = x;
			this.cmd[2] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx1, ctx1, ctx1);
		set.push(c1);

		var c2 = paper.circle(cmd[3], cmd[4], 5).attr({
			fill : context.commandEditors["C"]["bgColor"]
		});
		var ctx2 = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c2,
			"cmd" : cmd
		}
		c2.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[3] = x;
			this.cmd[4] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx2, ctx2, ctx2);
		set.push(c2);
		var c3 = paper.circle(cmd[5], cmd[6], 5).attr({
			fill : context.commandEditors["C"]["bgColor"]
		});
		var ctx3 = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c3,
			"cmd" : cmd
		}
		c3.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[5] = x;
			this.cmd[6] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx3, ctx3, ctx3);
		set.push(c3);
		return set;
	};

	// S - smooth curveto
	var buildSCurveToCmdEditor = function(context, cmd) {
		var paper = context.shape.paper;
		var set = paper.set();
		var c1 = paper.circle(cmd[1], cmd[2], 5).attr({
			fill : context.commandEditors["S"]["bgColor"]
		});
		var ctx1 = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c1,
			"cmd" : cmd
		}
		c1.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[1] = x;
			this.cmd[2] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx1, ctx1, ctx1);
		set.push(c1);

		var c2 = paper.circle(cmd[3], cmd[4], 5).attr({
			fill : context.commandEditors["S"]["bgColor"]
		});
		var ctx2 = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c2,
			"cmd" : cmd
		}
		c2.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[3] = x;
			this.cmd[4] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx2, ctx2, ctx2);
		set.push(c2);

		return set;
	};

	// R - Catmull-Rom curveto
	var buildCRCurveToCmdEditor = function(context, cmd) {
		var paper = context.shape.paper;
		var set = paper.set();
		var c1 = paper.circle(cmd[1], cmd[2], 5).attr({
			fill : context.commandEditors["R"]["bgColor"]
		});
		var ctx1 = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c1,
			"cmd" : cmd
		}
		c1.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[1] = x;
			this.cmd[2] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx1, ctx1, ctx1);
		set.push(c1);

		var c2 = paper.circle(cmd[3], cmd[4], 5).attr({
			fill : context.commandEditors["R"]["bgColor"]
		});
		var ctx2 = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c2,
			"cmd" : cmd
		}
		c2.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[3] = x;
			this.cmd[4] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx2, ctx2, ctx2);
		set.push(c2);

		return set;
	};

	// Q - quadratic Bézier curveto
	var buildQCurveToCmdEditor = function(context, cmd) {
		var paper = context.shape.paper;
		var set = paper.set();
		var c1 = paper.circle(cmd[1], cmd[2], 5).attr({
			fill : context.commandEditors["Q"]["bgColor"]
		});
		var ctx1 = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c1,
			"cmd" : cmd
		}
		c1.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[1] = x;
			this.cmd[2] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx1, ctx1, ctx1);
		set.push(c1);

		var c2 = paper.circle(cmd[3], cmd[4], 5).attr({
			fill : context.commandEditors["Q"]["bgColor"]
		});
		var ctx2 = {
			"pathObject" : context.pathObject,
			"shape" : context.shape,
			"feedback" : c2,
			"cmd" : cmd
		}
		c2.drag(function_throttle(context.dragThrottle, function(dx, dy) { /* move */
			var x = this.ox + dx, y = this.oy + dy;
			this.cmd[3] = x;
			this.cmd[4] = y;
			this.feedback.attr({
				"cx" : x,
				"cy" : y
			});
			this.shape.attr({
				"path" : this.pathObject
			});
		}), function(x, y) { /* drag start */
			this.ox = this.feedback.attr("cx");
			this.oy = this.feedback.attr("cy");
		}, function() { /* ends */

		}, ctx2, ctx2, ctx2);
		set.push(c2);

		return set;
	};

	var function_throttle = function(delay, no_trailing, callback,
			debounce_mode) {
		var timeout_id, last_exec = 0;
		if (typeof no_trailing !== 'boolean') {
			debounce_mode = callback;
			callback = no_trailing;
			no_trailing = undefined;
		}
		;
		function wrapper() {
			var that = this, elapsed = +new Date() - last_exec, args = arguments;
			function exec() {
				last_exec = +new Date();
				callback.apply(that, args);
			}
			;
			function clear() {
				timeout_id = undefined;
			}
			;
			if (debounce_mode && !timeout_id) {
				exec();
			}
			timeout_id && clearTimeout(timeout_id);
			if (debounce_mode === undefined && elapsed > delay) {
				exec();

			} else if (no_trailing !== true) {
				timeout_id = setTimeout(debounce_mode ? clear : exec,
						debounce_mode === undefined ? delay - elapsed : delay);
			}
		}
		;
		return wrapper;
	};

})();

/* raphael-svg-filter */

/* Raphael extensions to support SVG filters on Raphael shapes. 
 * 
 * @author: Sebastián Gurin (sg - sgurin - cancerbero_sgx)
 * 
 * The api consist on  a general API for administer "filter". the API for this is general and is very similar to SVG: 
 * Concepts: 
 * 
 * Filter: define a filter for one or more shapes to use. Each filter is added in paper.defs
 * 	and one or more shapes can use this filter. A filter contains one or more FilterOperations. 
 * 
 * FilterOperation: a filter contains an array of FilterOperations that correspond to one SVG filter operation like 
 * feSpecularLighting, feComposwite, etc. 
 * 
 * FilterOperationParams - an object that contains the filter operation parameters. 
 * 
 *  Use case
 *  var paper = Raphael(...); 
 *  var filter1 = paper.filterCreate("filter1");
 *  
 *  var fop1Params = {funcR: {..}, ...}, //def of a svg componentTransfer
 *  	fop1 = Raphael.filter.componentTransfer(fop1Params); //the filteroperation object
 *  
 *  //add the filter operation to the filter object
 *  filter1.appendOperation(fop1); 
 *  
 *  var img1 = paper.image(...)
 *  img1.filterInstall(filter1); 
 *  ..
 *  aSet.filterUninstall(filter1); 
 *  ..
 *  img1.filterUninstall(filter1); 
 *  
 *  
 *  
 *  Reference: 
 *  
 *  - Filter: an object{filterId}  
 *  
 *  - FilterOperation: an object {name, appendToFilterEl, filter} - where name is 
 *  the name of the filter operation such as feGaussianBlur, feSpecularLighting, etc. 
 *  and where appendToFilterEl is a function that appends  a SVG filter 
 *  operation inside the passed SVG filter element.
 *  Note: SVG filter operations are currently expressed as XML elements. 
 *  the appendToFilterEl defines de filter operation by creating this element according to the
 *  FilterOperationParams object. So the user work with json objects that 
 *  currently will create the svg filter children.  
 *   
 *  TODO: svg filter common attributes, and filter output, referencing and composing....
 *  
 *  common attributes sollution: 
 * */

(function() {

	var $ = function(el, attr) {
		if (attr) {
			for ( var key in attr)
				if (attr.hasOwnProperty(key)) {
					el.setAttribute(key, attr[key]);
				}
		} else {
			return document.createElementNS("http://www.w3.org/2000/svg", el);
		}
	};

	Raphael.fn.filterCreate = function(filterId) {
		var paper = this;
		if (!paper._filters)
			paper._filters = {};

		var filterEl = $("filter");
		paper._filters[filterId] = filterEl;
		$(filterEl, {
			id : filterId
		});
		paper.defs.appendChild(filterEl);
		return {
			"paper" : paper,
			"filterId" : filterId,
			"appendOperation" : function(filterOp) {
				this.paper.filterAddOperation(this, filterOp);
			},
			"removeOperation" : function(filterOp) {
				this.paper.filterRemoveOperation(this, filterOp);
			}
		};
	};
	Raphael.fn.filterRemove = function(filter) {
		this.node.style.filter = null; // TODO: test
	};
	Raphael._filterOpCounter = 0;

	Raphael.fn.filterAddOperation = function(filter, filterOperation) {
		var paper = this;
		var filterEl = paper._filters[filter.filterId];
		var opEl = filterOperation.appendToFilterEl(filterEl);
		if (opEl) {
			Raphael._filterOpCounter++;
			var opId = "svgfilterop" + Raphael._filterOpCounter;
			opEl.setAttribute("id", opId);
			filterOperation.filterOperationId = opId;
		}
		filterOperation.filter = filter;
	};
	Raphael.fn.filterRemoveOperation = function(filter, filterOperation) {
		var paper = this;
		var filterEl = paper._filters[filter.filterId];
		for ( var i = 0; i < filterEl.childNodes.length; i++) {
			var child = filterEl.childNodes[i];
			if (child.getAttribute("id") == filterOperation.filterOperationId)
				filterEl.removeChild(child);
		}
	};
	/**
	 * installs a filter to this shape.
	 */
	Raphael.el.filterInstall = function(filter) {
		$(this.node, {
			filter : "url(#" + filter.filterId + ")"
		});
	};
	/**
	 * removes the filter from the shape. TODO: warning this removes all filters
	 */
	Raphael.el.filterUninstall = function(filter) {
		$(this.node, {
			filter : ""
		});
	};

	// now filter operations definitions

	Raphael.filterOps = {};

	/**
	 * a general svg filter applicator function - usable by attribute-only
	 * filters
	 */
	Raphael.filterOps.svgFilter = function(filterName, params) {
		// params._filterName = filterName;
		return {
			"params" : params,
			appendToFilterEl : function(filterEl) {
				var filterOpEl = $(filterName);
				for ( var i in this.params) {
					try {
						filterOpEl.setAttribute(i, this.params[i]);
					} catch (ex) {
						alert("invalid parameter " + i + " value: "
								+ this.params[i] + ". Error: " + ex);
					}
				}
				filterEl.appendChild(filterOpEl);
				return filterOpEl;
			}
		};
	};

	/**
	 * feGaussianBlur-
	 * http://www.w3.org/TR/SVG/filters.html#feGaussianBlurElement This filter
	 * primitive performs a Gaussian blur on the input image.
	 * 
	 * The Gaussian blur kernel is an approximation of the normalized
	 * convolution
	 * 
	 * @param params -
	 *            concrete params: stdDeviation - an array with one or two
	 *            numbers. The standard deviation for the blur operation. If two
	 *            <number>s are provided, the first number represents a standard
	 *            deviation value along the x-axis of the coordinate system
	 *            established by attribute ‘primitiveUnits’ on the ‘filter’
	 *            element. The second value represents a standard deviation in
	 *            Y. If one number is provided, then that value is used for both
	 *            X and Y. A negative value is an error (see Error processing).
	 *            A value of zero disables the effect of the given filter
	 *            primitive (i.e., the result is the filter input image). If
	 *            ‘stdDeviation’ is 0 in only one of X or Y, then the effect is
	 *            that the blur is only applied in the direction that has a
	 *            non-zero value. If the attribute is not specified, then the
	 *            effect is as if a value of 0 were specified.
	 * 
	 * 
	 * svg example: <filter id="MyFilter" filterUnits="userSpaceOnUse" x="0"
	 * y="0" width="200" height="120"> <feGaussianBlur in="SourceAlpha"
	 * stdDeviation="4" result="blur"/>
	 * 
	 */
	Raphael.filterOps.feGaussianBlur = function(params) {
		return Raphael.filterOps.svgFilter("feGaussianBlur", params);
	};

	/**
	 * feColorMatrix -
	 * http://www.w3.org/TR/SVG/filters.html#feColorMatrixElement
	 * 
	 * concrete parameters:
	 * 
	 * type - "matrix | saturate | hueRotate | luminanceToAlpha". Indicates the
	 * type of matrix operation. The keyword 'matrix' indicates that a full 5x4
	 * matrix of values will be provided. The other keywords represent
	 * convenience shortcuts to allow commonly used color operations to be
	 * performed without specifying a complete matrix. If attribute ‘type’ is
	 * not specified, then the effect is as if a value of matrix were specified.
	 * 
	 * values an array of numbers - The contents of ‘values’ depends on the
	 * value of attribute ‘type’:
	 * 
	 */
	Raphael.filterOps.feColorMatrix = function(params) {
		return Raphael.filterOps.svgFilter("feColorMatrix", params);
	};

	/**
	 * feComponentTransferElement -
	 * @see http://www.w3.org/TR/SVG/filters.html#feComponentTransferElement
	 * 
	 * @param params -
	 *            an object with the format {funcR: {‘type’, ‘tableValues’,
	 *            ‘slope’, ‘intercept’, ‘amplitude’, ‘exponent’, ‘offset’},
	 *            funcG: {the same}, funcB: {the same}, funcA: {the same}}
	 */
	Raphael.filterOps.feComponentTransfer = function(params) {
		return {
			"params" : params,
			appendToFilterEl : function(filterEl) {
				var filterOpEl = $("feComponentTransfer");
				for ( var funcName in this.params) {
					var el = $(funcName);
					for ( var i in this.params[funcName]) {
						el.setAttribute(i, this.params[funcName][i]);
					}
					filterOpEl.appendChild(el);
				}
				filterEl.appendChild(filterOpEl);
				return filterOpEl;
			}
		};
	};

	/**
	 * feConvolveMatrixElement -
	 * http://www.w3.org/TR/SVG/filters.html#feConvolveMatrixElement
	 * 
	 * @param params -
	 *            an object with all the transformation parameters. The params
	 *            object will be modified. Concrete feConvolveMatrix parameters
	 *            are:
	 * 
	 * mandatory parameters: order, kernelMatrix and bias, for example:
	 * 
	 * var cmop1 = {order: 3, kernelMatrix: [0, 1, 1, -1, 0, 1, -1, -1,
	 * 0].join(" "), bias: 1}, cm1 = Raphael.filterOps.feConvolveMatrix(cmop1);
	 * filter1.appendOperation(cm1);
	 * 
	 * @param order -
	 *            an array of 1 or 2 numbers - Indicates the number of cells in
	 *            each dimension for ‘kernelMatrix’. The values provided must be
	 *            <integer>s greater than zero. The first number, <orderX>,
	 *            indicates the number of columns in the matrix. The second
	 *            number, <orderY>, indicates the number of rows in the matrix.
	 *            If <orderY> is not provided, it defaults to <orderX>. A
	 *            typical value is order="3". It is recommended that only small
	 *            values (e.g., 3) be used; higher values may result in very
	 *            high CPU overhead and usually do not produce results that
	 *            justify the impact on performance. If the attribute is not
	 *            specified, the effect is as if a value of 3 were specified.
	 * 
	 * @param kernelMatrix
	 *            array of numbers - The list of <number>s that make up the
	 *            kernel matrix for the convolution. Values are separated by
	 *            space characters and/or a comma. The number of entries in the
	 *            list must equal <orderX> times <orderY>.
	 * 
	 * @param divisor -
	 *            number After applying the ‘kernelMatrix’ to the input image to
	 *            yield a number, that number is divided by ‘divisor’ to yield
	 *            the final destination color value. A divisor that is the sum
	 *            of all the matrix values tends to have an evening effect on
	 *            the overall color intensity of the result. It is an error to
	 *            specify a divisor of zero. The default value is the sum of all
	 *            values in kernelMatrix, with the exception that if the sum is
	 *            zero, then the divisor is set to 1.
	 * 
	 * bias - a number After applying the ‘kernelMatrix’ to the input image to
	 * yield a number and applying the ‘divisor’, the ‘bias’ attribute is added
	 * to each component. One application of ‘bias’ is when it is desirable to
	 * have .5 gray value be the zero response of the filter. The bias property
	 * shifts the range of the filter. This allows representation of values that
	 * would otherwise be clamped to 0 or 1. If ‘bias’ is not specified, then
	 * the effect is as if a value of 0 were specified.
	 * 
	 * targetX - a number - Determines the positioning in X of the convolution
	 * matrix relative to a given target pixel in the input image. The leftmost
	 * column of the matrix is column number zero. The value must be such that:
	 * 0 <= targetX < orderX. By default, the convolution matrix is centered in
	 * X over each pixel of the input image (i.e., targetX = floor ( orderX / 2
	 * )).
	 * 
	 * targetY - a number - Determines the positioning in Y of the convolution
	 * matrix relative to a given target pixel in the input image. The topmost
	 * row of the matrix is row number zero. The value must be such that: 0 <=
	 * targetY < orderY. By default, the convolution matrix is centered in Y
	 * over each pixel of the input image (i.e., targetY = floor ( orderY / 2
	 * )).
	 * 
	 * edgeMode - one of "duplicate | wrap | none" - Determines how to extend
	 * the input image as necessary with color values so that the matrix
	 * operations can be applied when the kernel is positioned at or near the
	 * edge of the input image. "duplicate" indicates that the input image is
	 * extended along each of its borders as necessary by duplicating the color
	 * values at the given edge of the input image.
	 * 
	 * kernelUnitLength - array of 1 or two numbers - The first number is the
	 * <dx> value. The second number is the <dy> value. If the <dy> value is not
	 * specified, it defaults to the same value as <dx>. Indicates the intended
	 * distance in current filter units (i.e., units as determined by the value
	 * of attribute ‘primitiveUnits’) between successive columns and rows,
	 * respectively, in the ‘kernelMatrix’. By specifying value(s) for
	 * ‘kernelUnitLength’, the kernel becomes defined in a scalable, abstract
	 * coordinate system. If ‘kernelUnitLength’ is not specified, the default
	 * value is one pixel in the offscreen bitmap, which is a pixel-based
	 * coordinate system, and thus potentially not scalable. For some level of
	 * consistency across display media and user agents, it is necessary that a
	 * value be provided for at least one of ‘filterRes’ and ‘kernelUnitLength’.
	 * In some implementations, the most consistent results and the fastest
	 * performance will be achieved if the pixel grid of the temporary offscreen
	 * images aligns with the pixel grid of the kernel. A negative or zero value
	 * is an error (see Error processing).
	 * 
	 * preserveAlpha - boolean - A value of false indicates that the convolution
	 * will apply to all channels, including the alpha channel.A value of true
	 * indicates that the convolution will only apply to the color channels. In
	 * this case, the filter will temporarily unpremultiply the color component
	 * values, apply the kernel, and then re-premultiply at the end.If
	 * ‘preserveAlpha’ is not specified, then the effect is as if a value of
	 * false were specified.
	 */
	Raphael.filterOps.feConvolveMatrix = function(params) {
		return Raphael.filterOps.svgFilter("feConvolveMatrix", params);
	};

	/**
	 * This filter primitive performs "fattening" or "thinning" of artwork. It
	 * is particularly useful for fattening or thinning an alpha channel.
	 * 
	 * The dilation (or erosion) kernel is a rectangle with a width of
	 * 2*x-radius and a height of 2*y-radius. In dilation, the output pixel is
	 * the individual component-wise maximum of the corresponding R,G,B,A values
	 * in the input image's kernel rectangle. In erosion, the output pixel is
	 * the individual component-wise minimum of the corresponding R,G,B,A values
	 * in the input image's kernel rectangle.
	 * 
	 * Frequently this operation will take place on alpha-only images, such as
	 * that produced by the built-in input, SourceAlpha. In that case, the
	 * implementation might want to optimize the single channel case.
	 * 
	 * If the input has infinite extent and is constant (e.g FillPaint where the
	 * fill is a solid color), this operation has no effect. If the input has
	 * infinite extent and the filter result is the input to an ‘feTile’, the
	 * filter is evaluated with periodic boundary conditions.
	 * 
	 * Because ‘feMorphology’ operates on premultipied color values, it will
	 * always result in color values less than or equal to the alpha channel.
	 * 
	 * @param operator =
	 *            "erode | dilate" A keyword indicating whether to erode (i.e.,
	 *            thin) or dilate (fatten) the source graphic. If attribute
	 *            ‘operator’ is not specified, then the effect is as if a value
	 *            of erode were specified.
	 * 
	 * @param radius = "
	 *            <number-optional-number>" The radius (or radii) for the
	 *            operation. If two <number>s are provided, the first number
	 *            represents a x-radius and the second value represents a
	 *            y-radius. If one number is provided, then that value is used
	 *            for both X and Y. The values are in the coordinate system
	 *            established by attribute ‘primitiveUnits’ on the ‘filter’
	 *            element. A negative value is an error (see Error processing).
	 *            A value of zero disables the effect of the given filter
	 *            primitive (i.e., the result is a transparent black image). If
	 *            the attribute is not specified, then the effect is as if a
	 *            value of 0 were specified.
	 */
	Raphael.filterOps.feMorphology = function(params) {
		return Raphael.filterOps.svgFilter("feMorphology", params);
	};

	/**
	 * http://www.w3.org/TR/SVG/filters.html#feTurbulenceElement
	 * 
	 * This filter primitive creates an image using the Perlin turbulence
	 * function. It allows the synthesis of artificial textures like clouds or
	 * marble. For a detailed description the of the Perlin turbulence function,
	 * see "Texturing and Modeling", Ebert et al, AP Professional, 1994. The
	 * resulting image will fill the entire filter primitive subregion for this
	 * filter primitive.
	 * 
	 * It is possible to create bandwidth-limited noise by synthesizing only one
	 * octave.
	 * 
	 * The C code below shows the exact algorithm used for this filter effect.
	 * 
	 * For fractalSum, you get a turbFunctionResult that is aimed at a range of
	 * -1 to 1 (the actual result might exceed this range in some cases). To
	 * convert to a color value, use the formula colorValue =
	 * ((turbFunctionResult * 255) + 255) / 2, then clamp to the range 0 to 255.
	 * 
	 * For turbulence, you get a turbFunctionResult that is aimed at a range of
	 * 0 to 1 (the actual result might exceed this range in some cases). To
	 * convert to a color value, use the formula colorValue =
	 * (turbFunctionResult * 255), then clamp to the range 0 to 255.
	 * 
	 * The following order is used for applying the pseudo random numbers. An
	 * initial seed value is computed based on attribute ‘seed’. Then the
	 * implementation computes the lattice points for R, then continues getting
	 * additional pseudo random numbers relative to the last generated pseudo
	 * random number and computes the lattice points for G, and so on for B and
	 * A.
	 * 
	 * The generated color and alpha values are in the color space determined by
	 * the value of property ‘color-interpolation-filters’:
	 * 
	 * 
	 * @param baseFrequency = "
	 *            <number-optional-number>" The base frequency (frequencies)
	 *            parameter(s) for the noise function. If two <number>s are
	 *            provided, the first number represents a base frequency in the
	 *            X direction and the second value represents a base frequency
	 *            in the Y direction. If one number is provided, then that value
	 *            is used for both X and Y. A negative value for base frequency
	 *            is an error (see Error processing). If the attribute is not
	 *            specified, then the effect is as if a value of 0 were
	 *            specified.
	 * 
	 * @param numOctaves = "
	 *            <integer>" The numOctaves parameter for the noise function. If
	 *            the attribute is not specified, then the effect is as if a
	 *            value of 1 were specified.
	 * 
	 * @param seed = "
	 *            <number>" The starting number for the pseudo random number
	 *            generator. If the attribute is not specified, then the effect
	 *            is as if a value of 0 were specified. When the seed number is
	 *            handed over to the algorithm above it must first be truncated,
	 *            i.e. rounded to the closest integer value towards zero.
	 * 
	 * @param stitchTiles =
	 *            "stitch | noStitch" If stitchTiles="noStitch", no attempt it
	 *            made to achieve smooth transitions at the border of tiles
	 *            which contain a turbulence function. Sometimes the result will
	 *            show clear discontinuities at the tile borders. If
	 *            stitchTiles="stitch", then the user agent will automatically
	 *            adjust baseFrequency-x and baseFrequency-y values such that
	 *            the feTurbulence node's width and height (i.e., the width and
	 *            height of the current subregion) contains an integral number
	 *            of the Perlin tile width and height for the first octave. The
	 *            baseFrequency will be adjusted up or down depending on which
	 *            way has the smallest relative (not absolute) change as
	 *            follows: Given the frequency, calculate
	 *            lowFreq=floor(width*frequency)/width and
	 *            hiFreq=ceil(width*frequency)/width. If frequency/lowFreq <
	 *            hiFreq/frequency then use lowFreq, else use hiFreq. While
	 *            generating turbulence values, generate lattice vectors as
	 *            normal for Perlin Noise, except for those lattice points that
	 *            lie on the right or bottom edges of the active area (the size
	 *            of the resulting tile). In those cases, copy the lattice
	 *            vector from the opposite edge of the active area. If attribute
	 *            ‘stitchTiles’ is not specified, then the effect is as if a
	 *            value of noStitch were specified.
	 * 
	 * @param type =
	 *            "fractalNoise | turbulence" Indicates whether the filter
	 *            primitive should perform a noise or turbulence function. If
	 *            attribute ‘type’ is not specified, then the effect is as if a
	 *            value of turbulence were specified.
	 * 
	 * 
	 * 
	 */
	Raphael.filterOps.feTurbulence = function(params) {
		return Raphael.filterOps.svgFilter("feTurbulence", params);
	};

	/**
	 * This filter primitive offsets the input image relative to its current
	 * position in the image space by the specified vector.
	 * 
	 * This is important for effects like drop shadows.
	 * 
	 * When applying this filter, the destination location may be offset by a
	 * fraction of a pixel in device space. In this case a high quality viewer
	 * should make use of appropriate interpolation techniques, for example
	 * bilinear or bicubic. This is especially recommended for dynamic viewers
	 * where this interpolation provides visually smoother movement of images.
	 * For static viewers this is less of a concern. Close attention should be
	 * made to the ‘image-rendering’ property setting to determine the authors
	 * intent.
	 * 
	 * @param dx = "
	 *            <number>" The amount to offset the input graphic along the
	 *            x-axis. The offset amount is expressed in the coordinate
	 *            system established by attribute ‘primitiveUnits’ on the
	 *            ‘filter’ element. If the attribute is not specified, then the
	 *            effect is as if a value of 0 were specified.
	 * 
	 * @param dy = "
	 *            <number>" The amount to offset the input graphic along the
	 *            y-axis. The offset amount is expressed in the coordinate
	 *            system established by attribute ‘primitiveUnits’ on the
	 *            ‘filter’ element. If the attribute is not specified, then the
	 *            effect is as if a value of 0 were specified.
	 */
	Raphael.filterOps.feOffset = function(params) {
		return Raphael.filterOps.svgFilter("feOffset", params);
	};

	
	Raphael.filterOps.feComposite = function(params) {
		return Raphael.filterOps.svgFilter("feComposite", params);
	};
	
	
	/**
	 * feMerge
	 * @see http://www.w3.org/TR/SVG/filters.html#feMergeElement
	 * 
	 * @param params -
	 *            an array of the ids of filters / sources to merge, for
	 *            example:
	 * 
	 * <pre>
	 * var blur1 = Raphael.filterOps.feGaussianBlur({stdDeviation: "0.5", "in":
	 * "SourceAlpha", result: "blur1"}); 
	 * 
	 * var offset1 = Raphael.filterOps.feOffset({"in": "blur1", dx: 1, dy: 1, result:
	 * "offsetBlur"}); 
	 * 
	 * var merge1 = Raphael.filterOps.feMerge({merge: ["offsetBlur",
	 * "SourceGraphic"]});
	 * </pre>
	 * 
	 * 
	 * This filter primitive composites input image layers on top of each other
	 * using the over operator with Input1 (corresponding to the first
	 * ‘feMergeNode’ child element) on the bottom and the last specified input,
	 * InputN (corresponding to the last ‘feMergeNode’ child element), on top.
	 * 
	 * Many effects produce a number of intermediate layers in order to create
	 * the final output image. This filter allows us to collapse those into a
	 * single image. Although this could be done by using n-1 Composite-filters,
	 * it is more convenient to have this common operation available in this
	 * form, and offers the implementation some additional flexibility.
	 * 
	 * Each ‘feMerge’ element can have any number of ‘feMergeNode’ subelements,
	 * each of which has an ‘in’ attribute.
	 * 
	 * The canonical implementation of feMerge is to render the entire effect
	 * into one RGBA layer, and then render the resulting layer on the output
	 * device. In certain cases (in particular if the output device itself is a
	 * continuous tone device), and since merging is associative, it might be a
	 * sufficient approximation to evaluate the effect one layer at a time and
	 * render each layer individually onto the output device bottom to top.
	 * 
	 * If the topmost image input is SourceGraphic and this ‘feMerge’ is the
	 * last filter primitive in the filter, the implementation is encouraged to
	 * render the layers up to that point, and then render the SourceGraphic
	 * directly from its vector description on top.
	 * 
	 * 
	 */
	Raphael.filterOps.feMerge = function(params) {
		return {
			"params" : params,
			appendToFilterEl : function(filterEl) {
				var filterOpEl = $("feMerge");
				if(this.params.merge) for ( var i = 0; i < this.params.merge.length; i++) {
					var node = $("feMergeNode");
					node.setAttribute("in", this.params.merge[i]);
					filterOpEl.appendChild(node);
				}
				filterEl.appendChild(filterOpEl);
				return filterOpEl;
			}
		};
	};

	
	
	/**
	 * feSpecularLighting -
	 * 
	 * params should be something like:
	 *  
	 * <pre>
	 * params = {specularExponent: 25, "lightning-color": "white", 
	 * 	lightSource: {lightSourceName: "fePointLight", x: 400, y: 100, z: 100}
	 * }</pre>
	 * 
	 * @see http://www.w3.org/TR/SVG/filters.html#feSpecularLightingElement
	 * 
	 * @param surfaceScale = "
	 *            <number>" height of surface when Ain = 1. If the attribute is
	 *            not specified, then the effect is as if a value of 1 were
	 *            specified.
	 * 
	 * @param specularConstant = "
	 *            <number>" ks in Phong lighting model. In SVG, this can be any
	 *            non-negative number. If the attribute is not specified, then
	 *            the effect is as if a value of 1 were specified.
	 * 
	 * @param specularExponent = "
	 *            <number>" Exponent for specular term, larger is more "shiny".
	 *            Range 1.0 to 128.0. If the attribute is not specified, then
	 *            the effect is as if a value of 1 were specified.
	 * 
	 * @param kernelUnitLength = "
	 *            <number-optional-number>" The first number is the <dx> value.
	 *            The second number is the <dy> value. If the <dy> value is not
	 *            specified, it defaults to the same value as <dx>. Indicates
	 *            the intended distance in current filter units (i.e., units as
	 *            determined by the value of attribute ‘primitiveUnits’) for dx
	 *            and dy, respectively, in the surface normal calculation
	 *            formulas. By specifying value(s) for ‘kernelUnitLength’, the
	 *            kernel becomes defined in a scalable, abstract coordinate
	 *            system. If ‘kernelUnitLength’ is not specified, the dx and dy
	 *            values should represent very small deltas relative to a given
	 *            (x,y) position, which might be implemented in some cases as
	 *            one pixel in the intermediate image offscreen bitmap, which is
	 *            a pixel-based coordinate system, and thus potentially not
	 *            scalable. For some level of consistency across display media
	 *            and user agents, it is necessary that a value be provided for
	 *            at least one of ‘filterRes’ and ‘kernelUnitLength’. Discussion
	 *            of intermediate images are in the Introduction and in the
	 *            description of attribute ‘filterRes’. A negative or zero value
	 *            is an error.
	 */
	Raphael.filterOps.feSpecularLighting = function(params) {
		return {
			"params" : params,
			appendToFilterEl : function(filterEl) {
				var filterOpEl = $("feSpecularLighting");
				for(var i in this.params)
					if(i!="lightSource") 
						filterOpEl.setAttribute(i, this.params[i]); 
					
				if(this.params.lightSource && this.params.lightSource.lightSourceName) {
					var el = $(this.params.lightSource.lightSourceName);
					for(var i in this.params.lightSource) 
						if(i!="lightSourceName")
							el.setAttribute(i, this.params.lightSource[i]); 
					filterOpEl.appendChild(el);
				}
				filterEl.appendChild(filterOpEl);
				return filterOpEl;
			}
		};
	};

	
	
	/**
	 * feDiffuseLighting 
	 * @see http://www.w3.org/TR/SVG/filters.html#feDiffuseLightingElement
	 * 
	 * params should be something like:
	 *  
	 * <pre>
	 * params = {diffuseConstant: 2, "lightning-color": "white", 
	 * 	lightSource: {lightSourceName: "fePointLight", x: 400, y: 100, z: 100}
	 * }</pre>
	 * 
	 * 
	 * @param surfaceScale = "
	 *            <number>" height of surface when Ain = 1. If the attribute is
	 *            not specified, then the effect is as if a value of 1 were
	 *            specified.
	 * 
	 * @param diffuseConstant = "
	 *            <number>" ks in Phong lighting model. In SVG, this can be any
	 *            non-negative number. If the attribute is not specified, then
	 *            the effect is as if a value of 1 were specified.
	 * 
	 * @param kernelUnitLength = "
	 *            <number-optional-number>" The first number is the <dx> value.
	 *            The second number is the <dy> value. If the <dy> value is not
	 *            specified, it defaults to the same value as <dx>. Indicates
	 *            the intended distance in current filter units (i.e., units as
	 *            determined by the value of attribute ‘primitiveUnits’) for dx
	 *            and dy, respectively, in the surface normal calculation
	 *            formulas. By specifying value(s) for ‘kernelUnitLength’, the
	 *            kernel becomes defined in a scalable, abstract coordinate
	 *            system. If ‘kernelUnitLength’ is not specified, the dx and dy
	 *            values should represent very small deltas relative to a given
	 *            (x,y) position, which might be implemented in some cases as
	 *            one pixel in the intermediate image offscreen bitmap, which is
	 *            a pixel-based coordinate system, and thus potentially not
	 *            scalable. For some level of consistency across display media
	 *            and user agents, it is necessary that a value be provided for
	 *            at least one of ‘filterRes’ and ‘kernelUnitLength’. Discussion
	 *            of intermediate images are in the Introduction and in the
	 *            description of attribute ‘filterRes’. A negative or zero value
	 *            is an error.
	 */
	Raphael.filterOps.feDiffuseLighting = function(params) {
		return {
			"params" : params,
			appendToFilterEl : function(filterEl) {
				var filterOpEl = $("feDiffuseLighting");
				for(var i in this.params)
					if(i!="lightSource") 
						filterOpEl.setAttribute(i, this.params[i]); 
					
				if(this.params.lightSource && this.params.lightSource.lightSourceName) {
					var el = $(this.params.lightSource.lightSourceName);
					for(var i in this.params.lightSource) 
						if(i!="lightSourceName")
							el.setAttribute(i, this.params.lightSource[i]); 
					filterOpEl.appendChild(el);
				}
				filterEl.appendChild(filterOpEl);
				return filterOpEl;
			}
		};
	};
	
	
	// /**
	// * feBlend http://www.w3.org/TR/SVG/filters.html#feBlendElement
	// *
	// * @param mode "normal | multiply | screen | darken | lighten".
	// * One of the image blending modes (see table below). If attribute ‘mode’
	// is not specified, then the effect is as if a value of normal were
	// specified.
	// *
	// * @param input1 - the first input image to the blending operation.
	// *
	// * @param input2 The second input image to the blending operation. This
	// attribute can take on the same values as the ‘in’ attribute.
	// *
	// */
	// Raphael.filterOps.feBlend = function(mode, input1, input2) {
	// return Raphael.filterOps.svgFilter("feBlend", {"mode": mode, "in":
	// input1, "in2": input2});
	// };

	// /**
	// * feDistantLightElement -
	// http://www.w3.org/TR/SVG/filters.html#feDistantLightElement
	// *
	// * @param azimut Direction angle for the light source on the XY plane
	// (clockwise), in degrees from the x axis.
	// * If the attribute is not specified, then the effect is as if a value of
	// 0 were specified.
	// *
	// * @param elevation Direction angle for the light source from the XY plane
	// towards the z axis, in degrees. Note the positive Z-axis points towards
	// the viewer of the content.
	// * If the attribute is not specified, then the effect is as if a value of
	// 0 were specified.
	// */
	// Raphael.filterOps.feDistantLight = function(azimuth, elevation) {
	// return Raphael.filterOps.svgFilter("feDistantLight", {"azimuth": azimuth,
	// "elevation": elevation});
	// };

})(); // end of extension

/* raphael.free_transform */

/*
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

Raphael.fn.freeTransform = function(subject, options, callback) {
	// Enable method chaining
	if ( subject.freeTransform ) { return subject.freeTransform; }

	// Add Array.map if the browser doesn't support it
	if ( !Array.prototype.hasOwnProperty('map') ) {
		Array.prototype.map = function(callback, arg) {
			var i, mapped = [];

			for ( i in this ) {
				if ( this.hasOwnProperty(i) ) { mapped[i] = callback.call(arg, this[i], i, this); }
			}

			return mapped;
		};
	}

	// Add Array.indexOf if not builtin
	if ( !Array.prototype.hasOwnProperty('indexOf') ) {
		Array.prototype.indexOf = function(obj, start) {
			for ( var i = (start || 0), j = this.length; i < j; i++ ) {
				if ( this[i] === obj ) { return i; }
			}
			return -1;
		}
	}

	var
		paper = this,
		bbox  = subject.getBBox(true)
		;

	var ft = subject.freeTransform = {
		// Keep track of transformations
		attrs: {
			x: bbox.x,
			y: bbox.y,
			size: { x: bbox.width, y: bbox.height },
			center: { x: bbox.x + bbox.width  / 2, y: bbox.y + bbox.height / 2 },
			rotate: 0,
			scale: { x: 1, y: 1 },
			translate: { x: 0, y: 0 }
			},
		axes: null,
		bbox: null,
		callback: null,
		items: [],
		handles: { center: null, x: null, y: null },
		offset: {
			rotate: 0,
			scale: { x: 1, y: 1 },
			translate: { x: 0, y: 0 }
			},
		opts: {
			animate: false,
			attrs: { fill: '#fff', stroke: '#000' },
			boundary: { x: paper._left || 0, y: paper._top || 0, width: paper.width, height: paper.height },
			distance: 1.3,
			drag: true,
			draw: false,
			keepRatio: false,
			range: { rotate: [ -180, 180 ], scale: [ 0, 99999 ] },
			rotate: true,
			scale: true,
			snap: { rotate: 0, scale: 0, drag: 0 },
			snapDist: { rotate: 0, scale: 0, drag: 7 },
			size: 5
			},
		subject: subject
		};

	/**
	 * Update handles based on the element's transformations
	 */
	ft.updateHandles = function() {
		if ( ft.handles.bbox || ft.opts.rotate.indexOf('self') >= 0 ) {
			var corners = getBBox();
		}

		// Get the element's rotation
		var rad = {
			x: ( ft.attrs.rotate      ) * Math.PI / 180,
			y: ( ft.attrs.rotate + 90 ) * Math.PI / 180
			};

		var radius = {
			x: ft.attrs.size.x / 2 * ft.attrs.scale.x,
			y: ft.attrs.size.y / 2 * ft.attrs.scale.y
			};

		ft.axes.map(function(axis) {
			if ( ft.handles[axis] ) {
				var
					cx = ft.attrs.center.x + ft.attrs.translate.x + radius[axis] * ft.opts.distance * Math.cos(rad[axis]),
					cy = ft.attrs.center.y + ft.attrs.translate.y + radius[axis] * ft.opts.distance * Math.sin(rad[axis])
					;

				// Keep handle within boundaries
				if ( ft.opts.boundary ) {
					cx = Math.max(Math.min(cx, ft.opts.boundary.x + ft.opts.boundary.width),  ft.opts.boundary.x);
					cy = Math.max(Math.min(cy, ft.opts.boundary.y + ft.opts.boundary.height), ft.opts.boundary.y);
				}

				ft.handles[axis].disc.attr({ cx: cx, cy: cy });

				ft.handles[axis].line.toFront().attr({
					path: [ [ 'M', ft.attrs.center.x + ft.attrs.translate.x, ft.attrs.center.y + ft.attrs.translate.y ], [ 'L', ft.handles[axis].disc.attrs.cx, ft.handles[axis].disc.attrs.cy ] ]
					});

				ft.handles[axis].disc.toFront();
			}
		});

		if ( ft.bbox ) {
			ft.bbox.toFront().attr({
				path: [
					[ 'M', corners[0].x, corners[0].y ],
					[ 'L', corners[1].x, corners[1].y ],
					[ 'L', corners[2].x, corners[2].y ],
					[ 'L', corners[3].x, corners[3].y ],
					[ 'L', corners[0].x, corners[0].y ]
					]
				});

			// Allowed x, y scaling directions for bbox handles
			var bboxHandleDirection = [
				[ -1, -1 ], [ 1, -1 ], [ 1, 1 ], [ -1, 1 ],
				[  0, -1 ], [ 1,  0 ], [ 0, 1 ], [ -1, 0 ]
				];

			if ( ft.handles.bbox ) {
				ft.handles.bbox.map(function (handle, i) {
					var cx, cy, j, k;

					if ( i < 4 ) {	// corner handles
						cx = corners[i].x;
						cy = corners[i].y;
					} else { // side handles
						j  = i % 4;
						k  = ( j + 1 ) % corners.length;
						cx = ( corners[j].x + corners[k].x ) / 2;
						cy = ( corners[j].y + corners[k].y ) / 2;
					}

					handle.element.toFront()
						.attr({
							x: cx - ft.opts.size,
							y: cy - ft.opts.size
							})
						.transform('R' + ft.attrs.rotate)
						;

					handle.x = bboxHandleDirection[i][0];
					handle.y = bboxHandleDirection[i][1];
				});
			}
		}

		if ( ft.circle ) {
			ft.circle.attr({
				cx: ft.attrs.center.x + ft.attrs.translate.x,
				cy: ft.attrs.center.y + ft.attrs.translate.y,
				r:  Math.max(radius.x, radius.y) * ft.opts.distance
				});
		}

		if ( ft.handles.center ) {
			ft.handles.center.disc.toFront().attr({
				cx: ft.attrs.center.x + ft.attrs.translate.x,
				cy: ft.attrs.center.y + ft.attrs.translate.y
				});
		}

		if ( ft.opts.rotate.indexOf('self') >= 0 ) {
			radius = Math.max(
				Math.sqrt(Math.pow(corners[1].x - corners[0].x, 2) + Math.pow(corners[1].y - corners[0].y, 2)),
				Math.sqrt(Math.pow(corners[2].x - corners[1].x, 2) + Math.pow(corners[2].y - corners[1].y, 2))
				) / 2;
		}
	};

	/**
	 * Add handles
	 */
	ft.showHandles = function() {
		ft.hideHandles();

		ft.axes.map(function(axis) {
			ft.handles[axis] = {};

			ft.handles[axis].line = paper
				.path([ 'M', ft.attrs.center.x, ft.attrs.center.y ])
				.attr({
					stroke: ft.opts.attrs.stroke,
					'stroke-dasharray': '- ',
					opacity: .5
					})
				;

			ft.handles[axis].disc = paper
				.circle(ft.attrs.center.x, ft.attrs.center.y, ft.opts.size)
				.attr(ft.opts.attrs)
				;
		});

		if ( ft.opts.draw.indexOf('bbox') >= 0 ) {
			ft.bbox = paper
				.path('')
				.attr({
					stroke: ft.opts.attrs.stroke,
					'stroke-dasharray': '- ',
					opacity: .5
					})
				;

			ft.handles.bbox = [];

			var i;

			for ( i = ( ft.opts.scale.indexOf('bboxCorners') >= 0 ? 0 : 4 ); i < ( ft.opts.keepRatio || ft.opts.scale.indexOf('bboxSides') === -1 ? 4 : 8 ); i ++ ) {
				ft.handles.bbox[i] = {};

				ft.handles.bbox[i].element = paper
					.rect(ft.attrs.center.x, ft.attrs.center.y, ft.opts.size * 2, ft.opts.size * 2)
					.attr(ft.opts.attrs)
					;
			}
		}

		if ( ft.opts.draw.indexOf('circle') >= 0 ) {
			ft.circle = paper
				.circle(0, 0, 0)
				.attr({
					stroke: ft.opts.attrs.stroke,
					'stroke-dasharray': '- ',
					opacity: .3
					})
				;
		}

		if ( ft.opts.drag.indexOf('center') >= 0 ) {
			ft.handles.center = {};

			ft.handles.center.disc = paper
				.circle(ft.attrs.center.x, ft.attrs.center.y, ft.opts.size)
				.attr(ft.opts.attrs)
				;
		}

		// Drag x, y handles
		ft.axes.map(function(axis) {
			if ( !ft.handles[axis] ) { return; }

			var
				rotate = ft.opts.rotate.indexOf('axis' + axis.toUpperCase()) >= 0,
				scale  = ft.opts.scale .indexOf('axis' + axis.toUpperCase()) >= 0
				;

			ft.handles[axis].disc.drag(function(dx, dy) {
				// viewBox might be scaled
				if ( ft.o.viewBoxRatio ) {
					dx *= ft.o.viewBoxRatio.x;
					dy *= ft.o.viewBoxRatio.y;
				}

				var
					cx = dx + ft.handles[axis].disc.ox,
					cy = dy + ft.handles[axis].disc.oy
					;

				var mirrored = {
					x: ft.o.scale.x < 0,
					y: ft.o.scale.y < 0
					};

				if ( rotate ) {
					var rad = Math.atan2(cy - ft.o.center.y - ft.o.translate.y, cx - ft.o.center.x - ft.o.translate.x);

					ft.attrs.rotate = rad * 180 / Math.PI - ( axis === 'y' ? 90 : 0 );

					if ( mirrored[axis] ) { ft.attrs.rotate -= 180; }
				}

				// Keep handle within boundaries
				if ( ft.opts.boundary ) {
					cx = Math.max(Math.min(cx, ft.opts.boundary.x + ft.opts.boundary.width),  ft.opts.boundary.x);
					cy = Math.max(Math.min(cy, ft.opts.boundary.y + ft.opts.boundary.height), ft.opts.boundary.y);
				}

				var radius = Math.sqrt(Math.pow(cx - ft.o.center.x - ft.o.translate.x, 2) + Math.pow(cy - ft.o.center.y - ft.o.translate.y, 2));

				if ( scale ) {
					if ( ft.opts.keepRatio ) {
						ft.attrs.scale = {
							x: radius / ( ft.o.size[axis] / 2 * ft.opts.distance ),
							y: radius / ( ft.o.size[axis] / 2 * ft.opts.distance )
							};
					} else {
						ft.attrs.scale = {
							x: axis === 'x' ? radius / ( ft.o.size.x / 2 * ft.opts.distance ) : ft.o.scale.x,
							y: axis === 'y' ? radius / ( ft.o.size.y / 2 * ft.opts.distance ) : ft.o.scale.y
							};
					}

					if ( mirrored[axis] ) { ft.attrs.scale[axis] *= -1; }
				}

				applyLimits();

				if ( ft.attrs.scale.x && ft.attrs.scale.y ) { ft.apply(); }

				asyncCallback([ rotate ? 'rotate' : null, scale ? 'scale' : null ]);
			}, function() {
				// Offset values
				ft.o = cloneObj(ft.attrs);

				if ( paper._viewBox ) {
					ft.o.viewBoxRatio = {
						x: paper._viewBox[2] / paper.width,
						y: paper._viewBox[3] / paper.height
						};
				}

				ft.handles[axis].disc.ox = this.attrs.cx;
				ft.handles[axis].disc.oy = this.attrs.cy;

				asyncCallback([ rotate ? 'rotate start' : null, scale ? 'scale start' : null ]);
			}, function() {
				asyncCallback([ rotate ? 'rotate end'   : null, scale ? 'scale end'   : null ]);
			});
		});

		// Drag bbox corner handles
		if ( ft.opts.draw.indexOf('bbox') >= 0 && ( ft.opts.scale.indexOf('bboxCorners') >= 0 || ft.opts.scale.indexOf('bboxSides') >= 0 ) ) {
			ft.handles.bbox.map(function(handle) {
				handle.element.drag(function(dx, dy) {
					var rx, ry, rdx, rdy, mx, my, sx, sy;

					var
						sin = ft.o.rotate.sin,
						cos = ft.o.rotate.cos
						;

					// viewBox might be scaled
					if ( ft.o.viewBoxRatio ) {
						dx *= ft.o.viewBoxRatio.x;
						dy *= ft.o.viewBoxRatio.y;
					}

					// First rotate dx, dy to element alignment
					rx = dx * cos - dy * sin;
					ry = dx * sin + dy * cos;

					// Then clip to scale restriction
					if ( ft.opts.keepRatio ) { rx = ry * ( handle.x * handle.y < 0 ? -1 : 1 ); }

					rx *= Math.abs(handle.x);
					ry *= Math.abs(handle.y);

					// And finally rotate back to canvas alignment
					rdx = rx *   cos + ry * sin;
					rdy = rx * - sin + ry * cos;

					ft.attrs.translate = {
						x: ft.o.translate.x + rdx / 2,
						y: ft.o.translate.y + rdy / 2
						};

					// Mouse position, relative to element center after translation
					mx = ft.o.handlePos.cx + dx - ft.attrs.center.x - ft.attrs.translate.x;
					my = ft.o.handlePos.cy + dy - ft.attrs.center.y - ft.attrs.translate.y;

					// Position rotated to align with element
					rx = mx * cos - my * sin;
					ry = mx * sin + my * cos;

					// Scale element so that handle is at mouse position
					sx = rx * 2 * handle.x / ft.o.size.x;
					sy = ry * 2 * handle.y / ft.o.size.y;

					ft.attrs.scale = {
						x: sx || ft.o.scale.x,
						y: sy || ft.o.scale.y
						};

					applyLimits();

					ft.apply();

					asyncCallback([ 'scale' ]);
				}, function() {
					var
						rotate = ( ( 360 - ft.attrs.rotate ) % 360 ) / 180 * Math.PI,
						handlePos = handle.element.attr(['x', 'y']);

					// Offset values
					ft.o = cloneObj(ft.attrs);

					ft.o.handlePos = {
						cx: handlePos.x + ft.opts.size,
						cy: handlePos.y + ft.opts.size
						};

					// Pre-compute rotation sin & cos for efficiency
					ft.o.rotate = {
						sin: Math.sin(rotate),
						cos: Math.cos(rotate)
						};

					if ( paper._viewBox ) {
						ft.o.viewBoxRatio = {
							x: paper._viewBox[2] / paper.width,
							y: paper._viewBox[3] / paper.height
						};
					}

					asyncCallback([ 'scale start' ]);
				}, function() {
					asyncCallback([ 'scale end'   ]);
				});
			});
		}

		// Drag element and center handle
		var draggables = [];

		if ( ft.opts.drag.indexOf('self')   >= 0 && ft.opts.scale.indexOf('self') === -1 && ft.opts.rotate.indexOf('self') === -1 ) { draggables.push(subject); }
		if ( ft.opts.drag.indexOf('center') >= 0 ) { draggables.push(ft.handles.center.disc); }

		draggables.map(function(draggable) {
			draggable.drag(function(dx, dy) {
				// viewBox might be scaled
				if ( ft.o.viewBoxRatio ) {
					dx *= ft.o.viewBoxRatio.x;
					dy *= ft.o.viewBoxRatio.y;
				}

				ft.attrs.translate.x = ft.o.translate.x + dx;
				ft.attrs.translate.y = ft.o.translate.y + dy;

				var bbox = cloneObj(ft.o.bbox);

				bbox.x += dx;
				bbox.y += dy;

				applyLimits(bbox);

				ft.apply();

				asyncCallback([ 'drag' ]);
			}, function() {
				// Offset values
				ft.o = cloneObj(ft.attrs);

				if ( ft.opts.snap.drag ) { ft.o.bbox = subject.getBBox(); }

				// viewBox might be scaled
				if ( paper._viewBox ) {
					ft.o.viewBoxRatio = {
						x: paper._viewBox[2] / paper.width,
						y: paper._viewBox[3] / paper.height
						};
				}

				ft.axes.map(function(axis) {
					if ( ft.handles[axis] ) {
						ft.handles[axis].disc.ox = ft.handles[axis].disc.attrs.cx;
						ft.handles[axis].disc.oy = ft.handles[axis].disc.attrs.cy;
					}
				});

				asyncCallback([ 'drag start' ]);
			}, function() {
				asyncCallback([ 'drag end'   ]);
			});
		});

		var
			rotate = ft.opts.rotate.indexOf('self') >= 0,
			scale  = ft.opts.scale .indexOf('self') >= 0
			;

		if ( rotate || scale ) {
			subject.drag(function(dx, dy, x, y) {
				if ( rotate ) {
					var rad = Math.atan2(y - ft.o.center.y - ft.o.translate.y, x - ft.o.center.x - ft.o.translate.x);

					ft.attrs.rotate = ft.o.rotate + ( rad * 180 / Math.PI ) - ft.o.deg;
				}

				var mirrored = {
					x: ft.o.scale.x < 0,
					y: ft.o.scale.y < 0
					};

				if ( scale ) {
					var radius = Math.sqrt(Math.pow(x - ft.o.center.x - ft.o.translate.x, 2) + Math.pow(y - ft.o.center.y - ft.o.translate.y, 2));

					ft.attrs.scale.x = ft.attrs.scale.y = ( mirrored.x ? -1 : 1 ) * ft.o.scale.x + ( radius - ft.o.radius ) / ( ft.o.size.x / 2 );

					if ( mirrored.x ) { ft.attrs.scale.x *= -1; }
					if ( mirrored.y ) { ft.attrs.scale.y *= -1; }
				}

				applyLimits();

				ft.apply();

				asyncCallback([ rotate ? 'rotate' : null, scale ? 'scale' : null ]);
			}, function(x, y) {
				// Offset values
				ft.o = cloneObj(ft.attrs);

				ft.o.deg = Math.atan2(y - ft.o.center.y - ft.o.translate.y, x - ft.o.center.x - ft.o.translate.x) * 180 / Math.PI;

				ft.o.radius = Math.sqrt(Math.pow(x - ft.o.center.x - ft.o.translate.x, 2) + Math.pow(y - ft.o.center.y - ft.o.translate.y, 2));

				// viewBox might be scaled
				if ( paper._viewBox ) {
					ft.o.viewBoxRatio = {
						x: paper._viewBox[2] / paper.width,
						y: paper._viewBox[3] / paper.height
						};
				}

				asyncCallback([ rotate ? 'rotate start' : null, scale ? 'scale start' : null ]);
			}, function() {
				asyncCallback([ rotate ? 'rotate end'   : null, scale ? 'scale end'   : null ]);
			});
		}

		ft.updateHandles();
	};

	/**
	 * Remove handles
	 */
	ft.hideHandles = function() {
		ft.items.map(function(item) {
			item.el.undrag();
		});

		if ( ft.handles.center ) {
			ft.handles.center.disc.remove();

			ft.handles.center = null;
		}

		[ 'x', 'y' ].map(function(axis) {
			if ( ft.handles[axis] ) {
				ft.handles[axis].disc.remove();
				ft.handles[axis].line.remove();

				ft.handles[axis] = null;
			}
		});

		if ( ft.bbox ) {
			ft.bbox.remove();

			ft.bbox = null;

			if ( ft.handles.bbox ) {
				ft.handles.bbox.map(function(handle) {
					handle.element.remove();
				});

				ft.handles.bbox = null;
			}
		}

		if ( ft.circle ) {
			ft.circle.remove();

			ft.circle = null;
		}
	};

	// Override defaults
	ft.setOpts = function(options, callback) {
		ft.callback = typeof callback === 'function' ? callback : false;

		var i, j;

		for ( i in options ) {
			if ( options[i] && options[i].constructor === Object ) {
				for ( j in options[i] ) {
					if ( options[i].hasOwnProperty(j) ) {
						ft.opts[i][j] = options[i][j];
					}
				}
			} else {
				ft.opts[i] = options[i];
			}
		}

		if ( ft.opts.animate === true ) { ft.opts.animate = { delay:   700, easing: 'linear' }; }
		if ( ft.opts.drag    === true ) { ft.opts.drag    = [ 'center', 'self' ]; }
		if ( ft.opts.rotate  === true ) { ft.opts.rotate  = [ 'axisX', 'axisY' ]; }
		if ( ft.opts.scale   === true ) { ft.opts.scale   = [ 'axisX', 'axisY', 'bboxCorners', 'bboxSides' ]; }

		[ 'drag', 'draw', 'rotate', 'scale' ].map(function(option) {
			if ( ft.opts[option] === false ) ft.opts[option] = [];
		});

		if ( !ft.opts.scale ) { ft.opts.keepRatio = true; }

		ft.axes = [];

		if ( ft.opts.rotate.indexOf('axisX') >= 0 || ft.opts.scale.indexOf('axisX') >= 0 ) { ft.axes.push('x'); }
		if ( ft.opts.rotate.indexOf('axisY') >= 0 || ft.opts.scale.indexOf('axisY') >= 0 ) { ft.axes.push('y'); }

		[ 'drag', 'rotate', 'scale' ].map(function(option) {
			if ( !ft.opts.snapDist[option] ) ft.opts.snapDist[option] = ft.opts.snap[option];
		});

		// Force numbers
		ft.opts.range = {
			rotate: [ parseFloat(ft.opts.range.rotate[0]), parseFloat(ft.opts.range.rotate[1]) ],
			scale:  [ parseFloat(ft.opts.range.scale[0]),  parseFloat(ft.opts.range.scale[1])  ]
			};

		ft.opts.snap = {
			drag:   parseFloat(ft.opts.snap.drag),
			rotate: parseFloat(ft.opts.snap.rotate),
			scale:  parseFloat(ft.opts.snap.scale)
			};

		ft.opts.snapDist = {
			drag:   parseFloat(ft.opts.snapDist.drag),
			rotate: parseFloat(ft.opts.snapDist.rotate),
			scale:  parseFloat(ft.opts.snapDist.scale)
			};

		ft.opts.size = parseInt(ft.opts.size);

		ft.showHandles();

		asyncCallback([ 'init' ]);
	};

	ft.setOpts(options, callback);

	/**
	 * Apply transformations, optionally update attributes manually
	 */
	ft.apply = function() {
		ft.items.map(function(item, i) {
			// Take offset values into account
			var
				center = {
					x: ft.attrs.center.x + ft.offset.translate.x,
					y: ft.attrs.center.y + ft.offset.translate.y
				},
				rotate    = ft.attrs.rotate - ft.offset.rotate,
				scale     = {
					x: ft.attrs.scale.x / ft.offset.scale.x,
					y: ft.attrs.scale.y / ft.offset.scale.y
				},
				translate = {
					x: ft.attrs.translate.x - ft.offset.translate.x,
					y: ft.attrs.translate.y - ft.offset.translate.y
				};

			if ( ft.opts.animate ) {
				asyncCallback([ 'animate start' ]);

				item.el.animate(
					{ transform: [
						'R', rotate, center.x, center.y,
						'S', scale.x, scale.y, center.x, center.y,
						'T', translate.x, translate.y
						] + ft.items[i].transformString },
					ft.opts.animate.delay,
					ft.opts.animate.easing,
					function() {
						asyncCallback([ 'animate end' ]);

						ft.updateHandles();
					}
				);
			} else {
				item.el.transform([
					'R', rotate, center.x, center.y,
					'S', scale.x, scale.y, center.x, center.y,
					'T', translate.x, translate.y
					] + ft.items[i].transformString);

				asyncCallback([ 'apply' ]);

				ft.updateHandles();
			}
		});
	};

	/**
	 * Clean exit
	 */
	ft.unplug = function() {
		var attrs = ft.attrs;

		ft.hideHandles();

		// Goodbye
		delete subject.freeTransform;

		return attrs;
	};

	// Store attributes for each item
	( subject.type === 'set' ? subject.items : [ subject ] ).map(function(item) {
		ft.items.push({
			el: item,
			attrs: {
				rotate:    0,
				scale:     { x: 1, y: 1 },
				translate: { x: 0, y: 0 }
				},
			transformString: item.matrix.toTransformString()
			});
	});

	// Get the current transform values for each item
	ft.items.map(function(item, i) {
		if ( item.el._ && item.el._.transform ) {
			item.el._.transform.map(function(transform) {
				if ( transform[0] ) {
					switch ( transform[0].toUpperCase() ) {
						case 'T':
							ft.items[i].attrs.translate.x += transform[1];
							ft.items[i].attrs.translate.y += transform[2];

							break;
						case 'S':
							ft.items[i].attrs.scale.x *= transform[1];
							ft.items[i].attrs.scale.y *= transform[2];

							break;
						case 'R':
							ft.items[i].attrs.rotate += transform[1];

							break;
					}
				}
			});
		}
	});

	// If subject is not of type set, the first item _is_ the subject
	if ( subject.type !== 'set' ) {
		ft.attrs.rotate    = ft.items[0].attrs.rotate;
		ft.attrs.scale     = ft.items[0].attrs.scale;
		ft.attrs.translate = ft.items[0].attrs.translate;

		ft.items[0].attrs = {
			rotate:    0,
			scale:     { x: 1, y: 1 },
			translate: { x: 0, y: 0 }
			};

		ft.items[0].transformString = '';
	}

	/**
	 * Get rotated bounding box
	 */
	function getBBox() {
		var rad = {
			x: ( ft.attrs.rotate      ) * Math.PI / 180,
			y: ( ft.attrs.rotate + 90 ) * Math.PI / 180
			};

		var radius = {
			x: ft.attrs.size.x / 2 * ft.attrs.scale.x,
			y: ft.attrs.size.y / 2 * ft.attrs.scale.y
			};

		var
			corners = [],
			signs   = [ { x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 } ]
			;

		signs.map(function(sign) {
			corners.push({
				x: ( ft.attrs.center.x + ft.attrs.translate.x + sign.x * radius.x * Math.cos(rad.x) ) + sign.y * radius.y * Math.cos(rad.y),
				y: ( ft.attrs.center.y + ft.attrs.translate.y + sign.x * radius.x * Math.sin(rad.x) ) + sign.y * radius.y * Math.sin(rad.y)
				});
		});

		return corners;
	}

	/**
	 * Apply limits
	 */
	function applyLimits(bbox) {
		// Snap to grid
		if ( bbox && ft.opts.snap.drag ) {
			var
				x    = bbox.x,
				y    = bbox.y,
				dist = { x: 0, y: 0 },
				snap = { x: 0, y: 0 }
				;

			[ 0, 1 ].map(function() {
				// Top and left sides first
				dist.x = x - Math.round(x / ft.opts.snap.drag) * ft.opts.snap.drag;
				dist.y = y - Math.round(y / ft.opts.snap.drag) * ft.opts.snap.drag;

				if ( Math.abs(dist.x) <= ft.opts.snapDist.drag ) { snap.x = dist.x; }
				if ( Math.abs(dist.y) <= ft.opts.snapDist.drag ) { snap.y = dist.y; }

				// Repeat for bottom and right sides
				x += bbox.width  - snap.x;
				y += bbox.height - snap.y;
			});

			ft.attrs.translate.x -= snap.x;
			ft.attrs.translate.y -= snap.y;
		}

		// Keep center within boundaries
		if ( ft.opts.boundary ) {
			var b = ft.opts.boundary;

			if ( ft.attrs.center.x + ft.attrs.translate.x < b.x            ) { ft.attrs.translate.x += b.x -            ( ft.attrs.center.x + ft.attrs.translate.x ); }
			if ( ft.attrs.center.y + ft.attrs.translate.y < b.y            ) { ft.attrs.translate.y += b.y -            ( ft.attrs.center.y + ft.attrs.translate.y ); }
			if ( ft.attrs.center.x + ft.attrs.translate.x > b.x + b.width  ) { ft.attrs.translate.x += b.x + b.width  - ( ft.attrs.center.x + ft.attrs.translate.x ); }
			if ( ft.attrs.center.y + ft.attrs.translate.y > b.y + b.height ) { ft.attrs.translate.y += b.y + b.height - ( ft.attrs.center.y + ft.attrs.translate.y ); }
		}

		// Maintain aspect ratio when scaling
		if ( ft.opts.keepRatio ) { ft.attrs.scale.x = ft.attrs.scale.y; }

		// Snap to angle, rotate with increments
		dist = Math.abs(ft.attrs.rotate % ft.opts.snap.rotate);
		dist = Math.min(dist, ft.opts.snap.rotate - dist);

		if ( dist < ft.opts.snapDist.rotate ) {
			ft.attrs.rotate = Math.round(ft.attrs.rotate / ft.opts.snap.rotate) * ft.opts.snap.rotate;
		}

		// Snap to scale, scale with increments
		dist = {
			x: Math.abs(( ft.attrs.scale.x * ft.attrs.size.x ) % ft.opts.snap.scale),
			y: Math.abs(( ft.attrs.scale.y * ft.attrs.size.x ) % ft.opts.snap.scale)
			};

		dist = {
			x: Math.min(dist.x, ft.opts.snap.scale - dist.x),
			y: Math.min(dist.y, ft.opts.snap.scale - dist.y)
			};

		if ( dist.x < ft.opts.snapDist.scale ) {
			ft.attrs.scale.x = Math.round(ft.attrs.scale.x * ft.attrs.size.x / ft.opts.snap.scale) * ft.opts.snap.scale / ft.attrs.size.x;
		}

		if ( dist.y < ft.opts.snapDist.scale ) {
			ft.attrs.scale.y = Math.round(ft.attrs.scale.y * ft.attrs.size.y / ft.opts.snap.scale) * ft.opts.snap.scale / ft.attrs.size.y;
		}

		// Limit range of rotation
		if ( ft.opts.range.rotate ) {
			var deg = ( 360 + ft.attrs.rotate ) % 360;

			if ( deg > 180 ) { deg -= 360; }

			if ( deg < ft.opts.range.rotate[0] ) { ft.attrs.rotate += ft.opts.range.rotate[0] - deg; }
			if ( deg > ft.opts.range.rotate[1] ) { ft.attrs.rotate += ft.opts.range.rotate[1] - deg; }
		}

		// Limit scale
		if ( ft.opts.range.scale ) {
			if ( ft.attrs.scale.x * ft.attrs.size.x < ft.opts.range.scale[0] ) {
				ft.attrs.scale.x = ft.opts.range.scale[0] / ft.attrs.size.x;
			}

			if ( ft.attrs.scale.y * ft.attrs.size.y < ft.opts.range.scale[0] ) {
				ft.attrs.scale.y = ft.opts.range.scale[0] / ft.attrs.size.y;
			}

			if ( ft.attrs.scale.x * ft.attrs.size.x > ft.opts.range.scale[1] ) {
				ft.attrs.scale.x = ft.opts.range.scale[1] / ft.attrs.size.x;
			}

			if ( ft.attrs.scale.y * ft.attrs.size.y > ft.opts.range.scale[1] ) {
				ft.attrs.scale.y = ft.opts.range.scale[1] / ft.attrs.size.y;
			}
		}
	}

	/**
	 * Recursive copy of object
	 */
	function cloneObj(obj) {
		var i, clone = {};

		for ( i in obj ) {
			clone[i] = typeof obj[i] === 'object' ? cloneObj(obj[i]) : obj[i];
		}

		return clone;
	}

	var timeout = false;

	/**
	 * Call callback asynchronously for better performance
	 */
	function asyncCallback(e) {
		if ( ft.callback ) {
			// Remove empty values
			var events = [];

			e.map(function(e, i) { if ( e ) { events.push(e); } });

			clearTimeout(timeout);

			setTimeout(function() { if ( ft.callback ) { ft.callback(ft, events); } }, 1);
		}
	}

	ft.updateHandles();

	// Enable method chaining
	return ft;
};

/* raphael4gwt */

/**
 * native javascript for raphael4gwt
 * @author sgurin
 */

(function(){

window.r4g = {
	
//_firebug : function() {
//	debugger;
//},		
_castToBoolean : function(o) {
	if(typeof(o)=="object")
		return (o+"")=="true";
	else
		return o;
},

dump : function(o, wVal) {
	var s = "{";
	for(var i in o) {
		if(wVal) {
			s+=i+": "+o[i]+", ";
		}
		else {
			s+=i+", ";
		}
	}
	return s+"}";
},	

_isPointInside : function (r,x,y) {
	return x>r.x && x<r.x+r.width && 
		y>r.y && y<r.y+r.height;
},
			
	
/** taken from http://benalman.com/projects/jquery-throttle-debounce-plugin/ */
function_throttle : function( delay, no_trailing, callback, debounce_mode ) {
    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeout_id,
      
      // Keep track of the last time `callback` was executed.
      last_exec = 0;
    
    // `no_trailing` defaults to falsy.
    if ( typeof no_trailing !== 'boolean' ) {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }
    
    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    function wrapper() {
      var that = this,
        elapsed = +new Date() - last_exec,
        args = arguments;
      
      // Execute `callback` and update the `last_exec` timestamp.
      function exec() {
        last_exec = +new Date();
        callback.apply( that, args );
      };
      
      // If `debounce_mode` is true (at_begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeout_id = undefined;
      };
      
      if ( debounce_mode && !timeout_id ) {
        // Since `wrapper` is being called for the first time and
        // `debounce_mode` is true (at_begin), execute `callback`.
        exec();
      }
      
      // Clear any existing timeout.
      timeout_id && clearTimeout( timeout_id );
      
      if ( debounce_mode === undefined && elapsed > delay ) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();
        
      } else if ( no_trailing !== true ) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        // 
        // If `debounce_mode` is true (at_begin), schedule `clear` to execute
        // after `delay` ms.
        // 
        // If `debounce_mode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
      }
    };
    
//    // Set the guid of `wrapper` function to the same of original callback, so
//    // it can be removed in jQuery 1.4+ .unbind or .die by using the original
//    // callback as a reference.
//    if ( $.guid ) {
//      wrapper.guid = callback.guid = callback.guid || $.guid++;
//    }
    
    // Return the wrapper function.
    return wrapper;
  },
  
  
  "":""
	  
}

})();