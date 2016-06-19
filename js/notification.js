app.notification = (function() {
	var dom = function() {
		if (typeof(dom._elem) === "undefined") {
			dom._elem = $('.utf-update');
		}

		return dom._elem;
	};
	var defaultContent = null;
	var setPadding = function () {
		var shouldHavePadding = dom().text().trim() !== '';
		dom().toggleClass('notification-padding', shouldHavePadding);
	};

	var setContent = function(value, isForceDefault) {
		if (isForceDefault || defaultContent === null) {
			defaultContent = value;
		}

		dom().html(value);
		setPadding();
	};

	var revertToDefault = function () {
		setContent(defaultContent);
	};

	var getFromServer = function () {
		$.get("data/config.json").done(function(data) {
			if (typeof(data.notification) !== "string" || data.notification === "") {
				return;
			}

			setContent(data.notification, true);
		});
	};

	var init = function () {
		getFromServer();
	};

	return {
		init: init,
		fetch: getFromServer,
		set: setContent,
		revertToDefault: revertToDefault
	};

})();
