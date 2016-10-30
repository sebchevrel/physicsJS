/*
 
 */
'use strict';

if (!sebz) var sebz = {};

Function.prototype.inheritsFrom = function (parentClassOrObject) {
	if (parentClassOrObject.constructor == Function) {
		//Normal Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} else {
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	}
	return this;
};

sebz.Application = {

	views: [],

	init: function () {},

	update: function (time) {
		this.views.forEach(function () {
			this.update(time);
		});
	},

	layout: function (window) {
		this.views.forEach(function () {
			this.layout(window);
		});
	},

	render: function () {
		this.views.forEach(function () {
			this.render();
		});
	},

	addView: function (view) {
		this.views.push(view);
	},

	removeView: function (view) {
		for (var i = 0, max = this.views.length; i < max; i++) {
			if (this.views[i] == view) this.views.splice(i--, 1);
		}
	}

};

sebz.Model = {

	load: function (url) {}

};

sebz.View = {
	show: function () {

	},
	update: function () {

	},
	layout: function () {

	},
	render: function () {

	}

};

sebz.Dom = {
	removeClass: function (element, className) {
		element.className = element.className.replace(className, '');
	},

	addClass: function (element, className) {
		element.className = element.className.replace(className, '');
		element.className += ' ' + className;
	},

	setText: function (element, text) {
		while (element.firstChild !== null) element.removeChild(element.firstChild);
		element.appendChild(document.createTextNode(text));
	},

	registerTouchEvents: function (obj, Start, onGestureChange) {
		obj.addEventListener('touchstart', Start, false);
		obj.addEventListener('mousedown', Start, false);
		obj.addEventListener('gesturestart', onGestureChange, false);
		obj.addEventListener('gesturechange', onGestureChange, false);
	},

	addTouchEvents: function (e, Move, End, dontUseWindow) {
		if ('touches' in e) {
			e.preventDefault();
			if (Move) e.currentTarget.addEventListener('touchmove', Move, false);
			if (End) {
				e.currentTarget.addEventListener('touchend', End, false);
				e.currentTarget.addEventListener('touchcancel', End, false);
			}
		} else {
			if (dontUseWindow) {
				if (Move) e.currentTarget.addEventListener('mousemove', Move, false);
				if (End) e.currentTarget.addEventListener('mouseup', End, false);
			} else {
				if (Move) window.addEventListener('mousemove', Move, false);
				if (End) {
					window.addEventListener('mouseup', End, false);
					window.addEventListener('mouseleave', End, false);
				}
			}
		}
	},

	removeTouchEvents: function (e, Move, End, dontUseWindow) {
		if ('touches' in e) {
			e.preventDefault();
			if (Move) e.currentTarget.removeEventListener('touchmove', Move);
			if (End) {
				e.currentTarget.removeEventListener('touchend', End);
				e.currentTarget.addEventListener('touchcancel', End);
			}
		} else {
			if (dontUseWindow) {
				if (Move) e.currentTarget.removeEventListener('mousemove', Move);
				if (End) e.currentTarget.removeEventListener('mouseup', End);
			} else {
				if (Move) window.removeEventListener('mousemove', Move);
				if (End) {
					window.removeEventListener('mouseup', End);
					window.removeEventListener('mouseleave', End);
				}
			}
		}
	},

	getEventX: function (e) {

		if (e.hasOwnProperty('touches')) {
			if (e.targetTouches.length) return e.targetTouches[0].clientX;
			else if (e.changedTouches.length) return e.changedTouches[0].clientX;
			else if (e.touches.length) return e.touches[0].clientX;
			else return 0;
		} else {
			return e.clientX;
		}
	},

	getEventY: function (e) {
		if (e.hasOwnProperty('touches')) {
			if (e.targetTouches.length) return e.targetTouches[0].clientY;
			else if (e.changedTouches.length) return e.changedTouches[0].clientY;
			else if (e.touches.length) return e.touches[0].clientY;
			else return 0;
		} else {
			return e.clientY;
		}
	},

	getMouseWheelX: function (e) {
		var multiplier = 1;
		if ('deltaMode' in e) {
			if (e.deltaMode > 0) multiplier = 10;
		}

		if ('deltaX' in e) return -e.deltaX * multiplier;
		else if ('wheelDeltaX' in e) return -e.wheelDeltaX * multiplier;
		else if ('axis' in e && 'detail in e') {
			if (e.axis == 1) return e.detail * multiplier
			else return 0;
		} else if ('wheelDelta' in e) return -e.wheelDelta * multiplier;
		else return 0;
	},

	getMouseWheelY: function (e) {
		var multiplier = 1;
		if ('deltaMode' in e) {
			if (e.deltaMode > 0) multiplier = 10;
		}

		if ('deltaY' in e) return -e.deltaY * multiplier;
		else if ('wheelDeltaY' in e) return -e.wheelDeltaY * multiplier;
		else if ('axis' in e && 'detail in e') {
			if (e.axis == 1) return e.detail * multiplier;
			else return 0;
		} else if ('wheelDelta' in e) return -e.wheelDelta * multiplier;
		else return 0;
	}

};