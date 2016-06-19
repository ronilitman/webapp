app.tab = (function() {

	var form = (function () {
		var form = $('.settings-form');
		var formInputs = form.find('input');
		var settingsBtn = $('.settings-btn');
		var settingsWrap = $('.settings');
		var cancelBtn = $('.settings-cancel');
		var expandBtn = $('.expand-btn');

		var dom = {
			cancelBtn: cancelBtn,
			expandBtn: expandBtn,
			form: form,
			formInputs: formInputs,
			settingsBtn: settingsBtn,
			settingsWrap: settingsWrap
		};

		var submit = function (event) {
			event.preventDefault();
			var form = $(this);
			var tab = app.tabs.getTabByChildElement(form);
			var tabId = app.tabs.getIdByElement(tab);
			var sites = [];
			tab.find(dom.settingsBtn).removeClass('highlighted');
			form.closest(dom.settingsWrap).hide();
			// tab.find(app.tab.select.dom.selectSiteList).focus();
			dom.settingsBtn.find('img').toggleClass('settings-btn-transform');
			form.find(".report-list-li").each(function (i, row) {
				row = $(row);
				var website = row.find(".website-input").filter(app.tab.input.fulfilledInputFilter);
				var url = row.find(".url-input").filter(app.tab.input.fulfilledInputFilter);

				if (!website.length || !url.length) {
					return;
				}

				sites.push({
					name: website.val(),
					url: url.val()
				});
			});

			app.db.access(tabId, sites);
			app.tab.select.create(tabId);
			var select = tab.find('select');

			elementsVisibility(tab);
			select.trigger('change');
		};

		var validate = function () {
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
		};

		var elementsVisibility = function (tab, isFromStorage) {
			var iframe = tab.find('iframe');
			var select = tab.find('select');
			var wrap = tab.find(app.tab.select.dom.selectWrap);
			iframe.removeAttr('src');
			wrap.addClass('hidden');
			var inputsNotEmpty = select.children().length > 0; 
			tab.find(dom.expandBtn).toggle(inputsNotEmpty);

			if (inputsNotEmpty) {
			wrap.removeClass('hidden');
			iFrame.navigateTo.call(iframe, select.find('option').val());
			iFrame.show.call(iframe);
			}

			if (isFromStorage === true) {
				var settingsBtn = tab.find('.settings-btn');
				var settingsWrap = tab.find('.settings');
				wrap.removeClass('hidden');
				settingsBtn.removeClass('highlighted');
				settingsWrap.hide();
			}
		};

		var settingsBtnHandler = function () {
			var btn = $(this);
			btn.toggleClass('highlighted');
			var img = btn.find('img');
			img.toggleClass('settings-btn-transform');
			app.tabs.getTabByChildElement(btn).find(dom.settingsWrap).toggle();
		};

		var cancelBtnHandler = function () {
			settingsWrap.hide();
			settingsBtn.removeClass('highlighted');
		};

		var expandBtnHandler = function () {
			window.open(app.tabs.getTabByChildElement($(this)).find('iframe').attr('src'), "WindowName");
		};

		var bindEvents = function () {
			dom.form.on('submit', submit);
			dom.formInputs.on('input', validate);
			dom.settingsBtn.on('click', settingsBtnHandler);
			dom.cancelBtn.on('click', cancelBtnHandler);
			dom.expandBtn.on('click', expandBtnHandler);

		};

		

		return  {
			bindEvents: bindEvents,
			elementsVisibility: elementsVisibility
		};

	})();

	var input = (function () {

		var fulfilledInputFilter = function () {
			return $(this).val(); 
		};

		var inputsFullfill = function (tab, tabName) {
			var li = tab.find('.report-list-li');
			var sites = app.db.access(tabName);
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
		};

		return {
			fulfilledInputFilter: fulfilledInputFilter,
			fill: inputsFullfill
		};

	}());

	var select = (function () {
		var selectWrap = $('.select-site');
		var selectSiteList = $('select');
		var dom = {
			selectWrap: selectWrap,
			selectSiteList: selectSiteList
		};

		var storageSelectHandler = function(tab, tabKey) {
			var select = tab.find('select');
			var selectValue = app.db.access(tabKey);
			select.val(selectValue);
			select.trigger('change');
		};

		var navigate = function () {
			var url = $(this).val();
			var tab = app.tabs.getTabByChildElement($(this));
			var iframe = tab.find('iframe');
			var tabId = app.tabs.getIdByElement(tab);
			iFrame.navigateTo.call(iframe, url);
			dataSave(tabId, url);
		};

		var dataSave = function (tabId, data) {
			var key = tabId + '-selectedVal';
			if (typeof(app.db.access(tabId)) !== 'undefined' && app.db.access(tabId).length) {
				app.db.access(key, data);
			}
		}

		var create = function (tabId) {
			var tab = $('#' + tabId)
			var element = null;
			var wrap = tab.find('.select-site');
			var sites = app.db.access(tabId);
			element = tab.find('select');

			if (element.length) {
				element.remove();
			}

			var select = $('<select></select>');

			for(var i = 0; i < sites.length; i++) {
			var option = $('<option></option>');
			option.text(sites[i].name);
			option.attr('value', sites[i].url);
			select.append(option);
			}

			wrap.append(select);
		};

		var bindEvents = function () {
			$(document).on('change', 'select', navigate);
			
		};

		

		return  {
			bindEvents: bindEvents,
			create: create,
			dom: dom,
			navigate: navigate,
			selectHandler: storageSelectHandler
		};

	})();

	var iFrame = (function () {
		var navigateTo = function (url) {
			$(this).attr('src', url);
		};

		var show = function () {
			$(this).show();
		};

		return  {
			navigateTo: navigateTo,
			show: show
		};
	})();

	var report = (function () {
		var setInfo = function (tabName) {
			if (typeof(app.db.access(tabName)) !== 'undefined' && app.db.access(tabName).length) {
				var tab = $('#' + tabName);
				var tabKey = tabName + '-selectedVal';
				input.fill(tab, tabName);
				select.create(tabName);
				form.elementsVisibility(tab, true);

			}

			if (typeof(app.db.access(tabKey)) !== 'undefined' && app.db.access(tabKey).length) {
				select.selectHandler(tab, tabKey);
			}
		};

		return {
			setInfo: setInfo
		}

	}());

	var bindEvents = function () {
		form.bindEvents();
		select.bindEvents();
	}
	var init = function () {
		bindEvents();	
	};

	return {
		init: init,
		select: select,
		form: form,
		input: input,
		iFrame: iFrame,
		report: report
		
	};

})();
