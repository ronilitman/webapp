(function() {
	var settingsBtn = $('.settings-btn');
	var cancelBtn = $('.settings-cancel');
	var expandBtn = $('.expand-btn');
	var settingsWrap = $('.settings');
	var settingsForms = $('.settings-form');
	var tabs = $('.tab');
	var tabItems = $('.tabs-list-li');
	var selectSite = $('.select-site');
	var selectSiteList = $('.select-site-list');
	var formList = $('.report-list');
	var inputs = tabs.find('input');
	var searchForm = $('.search-form');
	var storage = {};
	var storedInfo = 'storedInfo';




	var notification = (function() {
		var element = $('.utf-update');
		var defaultContent = null;

		var setPadding = function () {
			var shouldHavePadding = element.text().trim() !== '';
			element.toggleClass('notification-padding', shouldHavePadding);
		};

		var setContent = function(value, isForceDefault) {
			if (isForceDefault || defaultContent === null) {
				defaultContent = value;
			}

			element.html(value);
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

		return {
			fetch: getFromServer,
			set: setContent,
			revertToDefault: revertToDefault
		};
	})();

	notification.fetch();

	function bindFunctions () {
		$(window).on('hashchange', function () {
			var hash = $(this).attr('location').hash;
			storage['hash'] = hash;
			storeInfo();
			
		})
///----------------------Done
		inputs.on('input', function () {
			var input = $(this).closest('li').find('input');
			input.prop('required', true);
			var arrayedInputs = [].slice.call(input);
			var isEmpty = arrayedInputs.every(function (el) {
				el = $(el);
				return !el.val();
			});

			if (isEmpty) {
				input.removeAttr('required');
			}
		});
///-------------------------Done
		searchForm.on('submit', function(e) {
			e.preventDefault();
			tabSearch.call($(this));
		});
///-------------------------Done

		settingsBtn.on('click', function () {
		var btn = $(this);
		btn.toggleClass('highlighted');
		var img = btn.find('img');
		img.toggleClass('settings-btn-transform');
		btn.closest('.tab').find(settingsWrap).toggle();
		});

///-------------------------Done

		cancelBtn.on('click', function (e) {
			settingsWrap.hide();
			settingsBtn.removeClass('highlighted');
		});
///-------------------------Done

		expandBtn.on('click', function (e) { 
			window.open($(this).closest('.tab').find('iframe').attr('src'), "WindowName");
		})
			
		$(".tab").keydown(function(e) { //ESC handler
			if (e.keyCode === 27) {
				$(this).find(settingsWrap).hide();
				$(this).find(settingsBtn).removeClass('highlighted');
			}
		});
///-------------------------Done
		tabItems.on('click', 'a', function (e) {
			tabs.hide();
			e.preventDefault();
			var $this = $(this);
			var li = $this.closest('li');
			history.pushState(null, null, $(this).attr('href'));
			hashTrigger();
			$($this.attr('href')).show();
			$('.tabs-list-li.highlighted').removeClass('highlighted');
			li.addClass('highlighted');
		});

///-------------------------Done
		settingsForms.on('submit', function (e) {
		e.preventDefault();
		submitForm.apply($(this));
		});
///-------------------------Done
		tabs.on('settingsDetailTrans', function (event, sites) {
		addOption($(this).find('.select-site-list'), sites); //[[]]
		});

	}

	bindFunctions();

	function getStoredInfo () {
		var data = localStorage.getItem(storedInfo);
		var savedVal = JSON.parse(data);
		if (savedVal) {
			storage = savedVal;
		}

		if (storage['hash']) {
			// $('a[href=' + storage['hash'] + ']').click();

			window.setTimeout(function () {
				$('a[href=' + storage['hash'] + ']').click();
			}, 0);
			
		}

		getReportInfo('quick-reports');
		getReportInfo('my-team-folders');
	}

	function getReportInfo(tabName) {
		if (typeof(storage[tabName]) !== 'undefined' && storage[tabName].length) {
			var tab = $('#' + tabName);
			storageInputFullfill(tab, tabName);
			var tabKey = tabName + '-selectedVal';
			storageOptionHandler(tab, tabName);
			if (typeof(storage[tabKey]) !== 'undefined' && storage[tabKey].length) {
				storageSelectHandler(tab, tabKey);
			}
		}
	} 

	function storageSelectHandler(tab, tabKey) {
		var select = tab.find('select');
		var selectValue = storage[tabKey];
		select.val(selectValue);
		select.trigger('change');
	}

	function storageOptionHandler(tab, tabKey) {
		var _settingsBtn = tab.find('.settings-btn');
		var _settingsWrap = tab.find(settingsWrap);
		var sites = storage[tabKey];
		var select = tab.find('select');
		var selectWrap = tab.find('.select-site');
		addOption(select, sites);
		selectWrap.removeClass('hidden');
		_settingsBtn.removeClass('highlighted');
		_settingsWrap.hide();
		elementsVisibility(tab);
	}

	function storageInputFullfill (tab, tabName) {
		var li = tab.find('.report-list-li');
		var sites = storage[tabName];
			li.each(function (i, row) {
			row = $(row);
			var website = row.find(".website-input");
			var url = row.find(".url-input");

			if(!sites[i]) {
				return false;
			}

			website.val(sites[i].name);
			url.val(sites[i].url);
			});
	}
//////////Not Needed-----------------
	function storeInfo (data) {
		var _storage = JSON.stringify(storage);
		var info = localStorage.setItem(storedInfo, _storage);
		return info; 
	}

//////////Not Needed-------------
	function tabSearch () {
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


		if (report === undefined) {
			notification.set('Report ' + inputVal + ' was not found.');
		} else {
			var tabId = report.opt.closest('.tab').attr('id');
			var hash = '#' + tabId;
			var tab = $(hash);
			var select = tab.find('select');
			history.pushState(null, null, hash);
			select.val(report.url);
			$('a[href='+ hash +']').click();
			select.trigger('change');
			notification.revertToDefault();
		}
	}

	function hashTrigger () {
		$(window).trigger('hashchange');
	}

	function fulfilledInputFilter () {
		return $(this).val(); 
	}

	function elementsVisibility(tab) {

		var iframe = tab.find('iframe');
		var select = tab.find('select');
		var selectWrap = tab.find(selectSite);
		iframe.removeAttr('src');
		selectWrap.addClass('hidden');
		var inputsNotEmpty = select.children().length > 0; 
		tab.find(expandBtn).toggle(inputsNotEmpty);

		if (inputsNotEmpty) {
			selectWrap.removeClass('hidden');
			iframe
				.attr('src', select.find('option').val())
				.show();
		}
	}

	function submitForm () {
		var form = $(this);
		var tab = form.closest('.tab');
		var tabId = tab.attr('id')
		var iframe = tab.find('iframe');
		var sites = [];
		var select = tab.find('select');
		tab.find(settingsBtn).removeClass('highlighted');
		form.closest(settingsWrap).hide();
		tab.find(selectSiteList).focus();
		settingsBtn.find('img').toggleClass('settings-btn-transform');

		form.find(".report-list-li").each(function (i, row) {
			row = $(row);
			var website = row.find(".website-input").filter(fulfilledInputFilter);
			var url = row.find(".url-input").filter(fulfilledInputFilter);

			if (!website.length || !url.length) {
				return;
			}

			sites.push({
				name: website.val(),
				url: url.val()
			});
		});

		if (sites) {
			storage[tabId] = sites;
			storeInfo();
		}

		tab.trigger('settingsDetailTrans', [sites]);
		select.trigger('change');
		elementsVisibility(tab);
	}


	function addOption (select, sites) {
		select.children().remove();
		for(var i = 0; i < sites.length; i++) {
			var option = $('<option></option>');
			option.text(sites[i].name);
			option.attr('value', sites[i].url);
			select.append(option);
		}
	}

	function getHrefElement(selector) {
		return $('a[href=' + selector + ']');
	}

	selectSiteList.change(function() {
		var tab = $(this).closest('.tab')
		var iframe = tab.find('iframe');
		var id = tab.attr('id');
		var selectedVal = id + '-selectedVal';
		storage[selectedVal] = $(this).val();
		storeInfo();
 		iframe.attr("src", $(this).val());
	});
	getStoredInfo();
}());