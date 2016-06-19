var UTILS = (function () {

	return {
		/**
		 * Check if a given value is a plain Object
		 *
		 * @param  {*}       o Any value to be checked
		 * @return {Boolean}   true if it's an Object
		 */
		isObject: function (o) {
			var toString = Object.prototype.toString;
			return (toString.call(o) === toString.call({}));
		},

		addEvent: function(el, type, handler) {
			return el.addEventListener(type , handler); 
		},

		removeEvent: function(el, type, handler) {
			return el.removeEventListener(type , handler); 
		}
    
	};
}());