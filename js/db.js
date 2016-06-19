app.db = (function() {
	var access = function (key, data) {
		if (typeof(data) !== 'undefined') {
			var originalData = get();	// {}
			originalData[key] = data;
			set(originalData);
		}

		return get()[key];
	};

	var set = function (data) {
		data = JSON.stringify(data);
		return localStorage.setItem('storedInfo', data); 
	};

	var get = function () {
		var data = localStorage.getItem('storedInfo');
		return data !== null ? JSON.parse(data) : {};
	};






	var onLoadGet = function () {

		var originalData = get();

		if(!Object.keys(originalData).length) {
			return;
		}

		if(access('hash')) {
			window.setTimeout(function () {
				$('a[href=' + access('hash') + ']').click();
			}, 0);
		}

		app.tab.report.setInfo('quick-reports');
		app.tab.report.setInfo('my-team-folders');


	}
;
	var init = function () {
		onLoadGet();
	};

	return {
		access: access,
		get: get,
		init: init

	};

})();
