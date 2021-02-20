/*!
 * Handlebars.js for jQuery
 * A templating engine for jQuery based on Handlebars.js
 * by Alberto La Rocca <a71104@gmail.com> (https://github.com/71104)
 * Released under the MIT license, copyright 2013 Alberto La Rocca
 */
/* eslint-disable */
(function ($) {'use strict';var cache = {};var defaultSettings = {templatePath: '', templateExtension: 'handlebars', partialPath: '', partialExtension: 'partial'};var settings = $.extend({}, defaultSettings);function resolvePath (basePath, name, extension) {basePath = basePath.replace(/[(^\s)(\s$)]/g, '');if (basePath.length) {return basePath + '/' + name + '.' + extension;} else {return name + '.' + extension;}}function resolveTemplatePath (name) {return resolvePath(settings.templatePath, name, settings.templateExtension);}function resolvePartialPath (name) {return resolvePath(settings.partialPath, name, settings.partialExtension);}function registerPartial (path, name) {$.get(resolvePartialPath(path), function (partial) {Handlebars.registerPartial(name, partial);}, 'text');}$.handlebars = function () {if (typeof arguments[0] !== 'string') {var options = arguments[0];settings = $.extend(defaultSettings, options);settings.templatePath = settings.templatePath.replace(/\\\/$/, '');settings.partialPath = settings.partialPath.replace(/\\\/$/, '');if (options.hasOwnProperty('partials')) {var names;if (typeof options.partials !== 'string') {names = options.partials;} else {names = options.partials.split(/\s+/g);}for (var i = 0; i < names.length; i++) {registerPartial(names[i], names[i]);}}} else {switch (arguments[0]) {case 'partial':if (arguments.length < 3) {registerPartial(arguments[1], arguments[1]);} else {registerPartial(arguments[1], arguments[2]);}break;case 'helper':Handlebars.registerHelper(arguments[1], arguments[2]);break;default:throw 'invalid action specified to jQuery.handlebars: ' + arguments[0];}}};
	$.fn.hbRender = function (templateName, data, append) {
		var url = resolveTemplatePath(templateName);
		if (cache.hasOwnProperty(url)) {
			if (append) {
				this.append(cache[url](data)).trigger("render.handlebars", [templateName, data]);
			} else {
				this.html(cache[url](data)).trigger("render.handlebars", [templateName, data]);
			}
		} else {
			var $this = this;
			$.get(url, function (template) {
				cache[url] = Handlebars.compile(template);
				if (append) {
					$this.append(cache[url](data)).trigger("render.handlebars", [templateName, data]);
				} else {
					$this.html(cache[url](data)).trigger("render.handlebars", [templateName, data]);
				}
			}, "text");
		}
		return this;
	};
}(jQuery));
/* eslint-enable */

$.handlebars({
	templatePath: 'handlebars/templates',
	templateExtension: 'hbs',
	partialPath: 'handlebars/templates',
	partialExtension: 'hbs'
});

// ========= HANDLEBARS HELPERS

//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}
$.handlebars('helper', 'dateFormat', function (context, block) {
	if (window.moment) {
		var f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
		return moment(context).format(f); // had to remove Date(context)
	} else {
		return context; //  moment plugin not available. return data as is.
	}
});

// extended "if" block helper
// usage {{#ifCond var1 '==' var2}}
$.handlebars('helper', 'ifCond', function (v1, operator, v2, options) {
	switch (operator) {
	case '==':
		return (v1 == v2) ? options.fn(this) : options.inverse(this);
	case '===':
		return (v1 === v2) ? options.fn(this) : options.inverse(this);
	case '!==':
		return (v1 !== v2) ? options.fn(this) : options.inverse(this);
	case '<':
		return (v1 < v2) ? options.fn(this) : options.inverse(this);
	case '<=':
		return (v1 <= v2) ? options.fn(this) : options.inverse(this);
	case '>':
		return (v1 > v2) ? options.fn(this) : options.inverse(this);
	case '>=':
		return (v1 >= v2) ? options.fn(this) : options.inverse(this);
	case '&&':
		return (v1 && v2) ? options.fn(this) : options.inverse(this);
	case '||':
		return (v1 || v2) ? options.fn(this) : options.inverse(this);
	default:
		return options.inverse(this);
	}
});

/**
 * The {{#exists var}} helper checks if a variable is defined.
 */
$.handlebars('helper', 'exists', function (variable, options) {
	if (typeof variable !== 'undefined') {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

/**
 * The {{#inRange number}} helper checks if a number is in range.
 */
$.handlebars('helper', 'inRange', function (number, range, options) {
	if (typeof number !== 'undefined') {
		var _range = range.split(',');
		var _min = parseInt(_range[0]);
		var _max = parseInt(_range[1]);
		return ((parseInt(number) >= _min) && (parseInt(number) <= _max)) ? options.fn(this) : options.inverse(this);
	} else {
		return options.inverse(this);
	}
});

/**
 * The {{ var | truncate }} helper to truncate text
 */
$.handlebars('helper', 'truncate', function (str, len, stripHTML) {
	if (stripHTML) {
		var tmp = document.createElement("DIV");
		tmp.innerHTML = str;
		str = tmp.textContent || tmp.innerText || "";
	}
	if (str.length > len && str.length > 0) {
		var new_str = str + " ";
		new_str = str.substr(0, len);
		new_str = str.substr(0, new_str.lastIndexOf(" "));
		new_str = (new_str.length > 0) ? new_str : str.substr(0, len);
		return new Handlebars.SafeString(new_str + '...');
	}
	return str;
});

$.handlebars('helper', 'if_even', function (conditional, options) {
	if ((conditional % 2) == 0) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

Handlebars.registerHelper('isdefined', function (value) {
	return value !== undefined;
});

Handlebars.registerHelper('if_isRTL', function(block) {
	var getComputedStyle = window.getComputedStyle || function (element) {
		return element.currentStyle;
	};
	var style = getComputedStyle(scutum.$html[0]);
	if (style.direction === 'rtl') {
		return block.fn(this);
	} else {
		return block.inverse(this);
	}
});
Handlebars.registerHelper('unless_isRTL', function(block) {
	var getComputedStyle = window.getComputedStyle || function (element) {
		return element.currentStyle;
	};
	var style = getComputedStyle(scutum.$html[0]);
	if (style.direction !== 'rtl') {
		return block.fn(this);
	} else {
		return block.inverse(this);
	}
});

$.handlebars('helper', 'debug', function (optionalValue) {
	console.log("Current Context");
	console.log("====================");
	console.log(this);
	if (optionalValue) {
		console.log("Value");
		console.log("====================");
		console.log(optionalValue);
	}
});

//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat date format="MMMM YYYY"}}
Handlebars.registerHelper('dateFormat', function(context, block) {
	if (window.moment) {
		var f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
		return moment(context).format(f); //had to remove Date(context)
	} else {
		return context; //  moment plugin not available. return data as is.
	}
});
