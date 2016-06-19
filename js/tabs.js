app.tabs = (function() {
	var tabItems = $('.tabs-list-li');
	var tabs = $('.tab');
	var searchForm = $('.search-form');
	var dom =  {
		tabItems: tabItems,
		tabs: tabs,
		searchForm: searchForm
	}

	var search = function (e) {
		e.preventDefault();
		var input = $(this).find('input');
		var inputVal = input.val().toLowerCase();
		input.val('');
		var reportInfo = [];
		var report;

		$('option').each(function (index, opt) {
			opt = $(opt);
			var text = opt.text().toLowerCase();
			reportInfo.push({
				text: text,
				url: opt.val(), 
				opt: opt
			});
		});

		report = reportInfo.find(function (element){	
			return element.text.indexOf(inputVal) >= 0;
		});

		if (typeof(report) === 'undefined') {
			app.notification.set('Report ' + inputVal + ' was not found.');
		} else {
			var tabId = report.opt.closest('.tab').attr('id');
			var hash = '#' + tabId;
			var tab = $(hash);
			var select = tab.find('select');
			history.pushState(null, null, hash);
			select.val(report.url);
			$('a[href='+ hash +']').click();
			select.trigger('change');
			app.notification.revertToDefault();
		}
	};

	var hashTrigger = function () {
		$(window).trigger('hashchange');
	};

	var listenToHashChange = function () {
		var hash = $(this).attr('location').hash;
		app.db.access('hash', hash);
	};

	var tabsNavigate = function (e) {
		e.preventDefault();
		dom.tabs.hide();
		var $this = $(this);
		var li = $this.closest('li');
		history.pushState(null, null, $(this).attr('href'));
		hashTrigger();
		$($this.attr('href')).show();
		$('.tabs-list-li.highlighted').removeClass('highlighted');
		li.addClass('highlighted');
	};

	var getTabByChildElement = function (childElement) {
		return childElement.closest(".tab");
	};

	var getIdByElement = function (element) {
		return element.attr('id');
	};

	var bindEvents = function () {
		$(window).on('hashchange', listenToHashChange);
		dom.tabItems.on('click', 'a', tabsNavigate);
		dom.searchForm.on('submit', search);

	};

	var init = function () {
		bindEvents();
	};


	return {
		getTabByChildElement: getTabByChildElement,
		getIdByElement: getIdByElement,
		open: open,
		init: init,
		hashTrigger: hashTrigger
	}

})();