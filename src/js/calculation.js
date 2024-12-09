"use strict";

import '../scss/libs/calculator-osmos.scss';


window.site.culculateOsmos = {
	amount: null,
	elementsSelector: '.filter-params-item input, .filter-params-item select, .filter-input-hidden input',
	elements: () => $(site.culculateOsmos.elementsSelector), // 
	output: null,
	prices: {},
	svgDocument: null,
	config: null,
	configUrl: window?.developmentEnv?.culculateOsmos?.configUrl || '/content/getCaluculationConfig/.json',
	activeFilterType: "",
	normal: {}, // обработчик инпутов для обычного филтра
	big: {}, // обработчик инпутов для большыих филтра
};

window.site.culculateOsmos.normal.fn = {
	'productivity': function (elm) {
		return site.culculateOsmos.productivity(elm);
	},
	'membrane_type': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'frame_type': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'brand': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'strapping_type': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'control_panel': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'chemical_cleaning': function (elm) {
		return site.culculateOsmos.toInputCheckbox(elm);
	},
	'dosing_block': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'correction_block': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'conductometer': function (elm) {
		return site.culculateOsmos.toInputCheckbox(elm);
	},
	'packing': function (elm) {
		return site.culculateOsmos.toInputCheckbox(elm);
	}
}

window.site.culculateOsmos.big.fn = {
	'productivity': function (elm) {
		return site.culculateOsmos.productivity(elm);
	},
	'membrane_type': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'brand': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'control_panel': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'dosing_block': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'conductometer': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'correction_block': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'frame_type': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'strapping_type': function (elm) {
		return site.culculateOsmos.toInputHidden(elm);
	},
	'rotameters': function (elm) {
		return site.culculateOsmos.toInputHidden(elm);
	},
	'mulpatronic_filter': function (elm) {
		return site.culculateOsmos.toInputHidden(elm);
	},
	'inlet_flow_meter': function (elm) {
		return site.culculateOsmos.toInputHidden(elm);
	},
	'permeate_flow_meter': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'control_valves': function (elm) {
		return site.culculateOsmos.toInputHidden(elm);
	},
	'membrane_housing': function (elm) {
		return site.culculateOsmos.toInputHidden(elm);
	},
	'automatic_fittings': function (elm) {
		return site.culculateOsmos.toSelect(elm);
	},
	'chemical_washer_capacity': function (elm) {
		return site.culculateOsmos.toInputHidden(elm);
	},
	'pressure_switch': function (elm) {
		return site.culculateOsmos.toInputHidden(elm);
	},
}

/**
 * Производительность
 */
window.site.culculateOsmos.productivity = function (el) {
	var data = $('option:selected', el).attr('data'),
		parse = JSON.parse(data),
		value = parse['property'],
		short_descr = parse['short_descr'],
		price = parseInt(parse['price'], 10),
		imageName = 'osmos-' + value + '-m3.svg';

	if (site.culculateOsmos.output === value)
		return;

	$('#calculator-image').addClass('d-none');
	$('.filter-view')
		.removeClass('prod-' + site.culculateOsmos.output)
		.addClass('prod-' + value + ' loading');

	site.culculateOsmos.output = value;
	site.culculateOsmos.prices[el.name] = price;
	$('#value-' + el.name).text(el.value);
	// $('#short-descr-membrane_count').text(site.culculateOsmos.membraneCount[value]);
	$('#short-descr-' + el.name).text(short_descr);

	$.ajax({
		type: 'get',
		url: '/files/calculator/' + imageName,
		asyn: true,
		dataType: 'text'
	})
		.done(function (responseSvg) {
			$('#calculator-image').html(responseSvg);
		})
		.done(function () {
			site.culculateOsmos.refreshSvg();

			setTimeout(function () {
				$('#calculator-image').removeClass('d-none');
				$('.filter-view').removeClass('loading');
			}, 1000);
		});
}

/**
 * Для элемента <select />
 */
window.site.culculateOsmos.toSelect = function (el) {
	var data = $('option:selected', el).attr('data'),
		parse = JSON.parse(data),
		short_descr = parse['short_descr'],
		price = parse['price'],
		itemPrice = parseInt(price[site.culculateOsmos.output], 10);

	site.culculateOsmos.prices[el.name] = itemPrice;
	$('#value-' + el.name).text(el.value);
	$('#short-descr-' + el.name).text(short_descr);
}
/**
 * Для элемента <input type="checkbox" />
 */
window.site.culculateOsmos.toInputCheckbox = function (el) {
	var checked = $(el).prop('checked'),
		data = $(el).attr('data'),
		parse = JSON.parse(data),
		short_descr = parse['short_descr'],
		price = parse['price'],
		itemPrice = parseInt(price[site.culculateOsmos.output], 10);

	if (checked) {
		$('#value-' + el.name).text('Есть');
		return site.culculateOsmos.prices[el.name] = itemPrice;
	}

	$('#value-' + el.name).text('-');
	return site.culculateOsmos.prices[el.name] = 0;
}

/**
 * Для скрытого элемента input в котором есть нужные данные
 */
window.site.culculateOsmos.toInputHidden = function (el) {

	var data = $(el).attr('data'),
		parse = JSON.parse(data),
		price = parse['price'],
		itemPrice = parseInt(price[site.culculateOsmos.output], 10);

	return site.culculateOsmos.prices[el.name] = itemPrice;
}

/**
 * Обновить SVG-картинку по элементам калькулятора
 */
/**
 * Обновить SVG-картинку по элементам калькулятора
 */
window.site.culculateOsmos.refreshSvg = function () {
	site.culculateOsmos.toggleDescriptionSVG();

	site.culculateOsmos.elements().each(function (_, elm) {
		site.culculateOsmos.updateSvg(elm);
	});
}

window.site.culculateOsmos.updateSvg = function (elm) {

	switch (site.culculateOsmos.activeFilterType) {
		case "normal":
			if (elm.name === 'conductometer') {
				return site.culculateOsmos.updateSvg.byNameCheckbox(elm);
			}
			if (elm.name === 'control_panel') {
				return site.culculateOsmos.updateSvg.byNameSelectone(elm);
			}
			break;

		case "big":
			if (elm.name === 'control_panel') {
				site.culculateOsmos.updateSvg.selectToSelect(elm, $('.param-name_conductometer')[0]);
			}
			// Связка 'Кондуктометр (солемер)' и 'Щит управления'
			if (elm.name === 'conductometer') {
				site.culculateOsmos.updateSvg.selectToSelect(elm, $('.param-name_control_panel')[0]);
			}
	}

	return site.culculateOsmos.updateSvg.byType[elm.type](elm);
}

window.site.culculateOsmos.updateSvg.byType = {
	'select-one': function (elm) {
		return site.culculateOsmos.updateSvg[site.culculateOsmos.activeFilterType].bySelectone(elm);
	},
	'checkbox': function (elm) {
		return site.culculateOsmos.updateSvg.byCheckbox(elm);
	},
	'hidden': function (elm) {
		return null;
	}
}

window.site.culculateOsmos.updateSvg.normal = {};
window.site.culculateOsmos.updateSvg.big = {};

window.site.culculateOsmos.updateSvg.normal.bySelectone = function (elm) {
	var data = $('option:selected', elm).attr('data'),
		cls = JSON.parse(data)['property'],
		itemId = elm.name,
		text = $('option:selected', elm).text(),
		svg = $('#calculator-image').children('svg'),
		group = $(svg).find('.item-' + itemId),
		count = group.length;

	if ($('.s-description-' + itemId).length && cls !== 'null') {
		$('.s-description-' + itemId)
			.removeClass('d-none')
			.children('text').text(text);
	}

	if ($('.s-description-' + itemId).length && cls === 'null') {
		$('.s-description-' + itemId)
			.addClass('d-none');
	}

	if (count) {
		for (var i = 0; i < count; i++) {
			if ($(group[i]).hasClass(cls)) {
				$(group[i]).removeClass('d-none');
			}
			else {
				$(group[i]).addClass('d-none');
			}
		}
	}
}
window.site.culculateOsmos.updateSvg.big.bySelectone = function (elm) {
	var data = $('option:selected', elm).attr('data'),
		cls = JSON.parse(data)['property'],
		itemId = elm.name,
		text = $('option:selected', elm).text(),
		svg = $('#calculator-image').children('svg'),
		group = $(svg).find('.item-' + itemId),
		count = group.length;

	if ($('.s-description-' + itemId).length && cls !== 'null') {
		$('.s-description-' + itemId)
			.removeClass('d-none');

		/* Исключение для надписи "Кондуктометр" */
		if (itemId === 'conductometer') {
			$('.s-description-' + itemId)
				.children('text').text('Кондуктометр');
		} else {
			$('.s-description-' + itemId)
				.children('text').text(text);
		}
	}

	if ($('.s-description-' + itemId).length && cls === 'null') {
		$('.s-description-' + itemId)
			.addClass('d-none');
	}

	if (count) {
		for (var i = 0; i < count; i++) {
			if ($(group[i]).hasClass(cls)) {
				$(group[i]).removeClass('d-none');
			}
			else {
				$(group[i]).addClass('d-none');
			}
		}
	}
}

window.site.culculateOsmos.updateSvg.byCheckbox = function (elm) {
	var checked = $(elm).prop('checked'),
		itemId = elm.name,
		svg = $('#calculator-image').children('svg');

	if (checked) {
		$(svg).find('.i-description-' + itemId)
			.removeClass('d-none');
		return $(svg).children('.item-' + itemId)
			.removeClass('d-none');
	}

	$(svg).find('.i-description-' + itemId)
		.addClass('d-none');
	return $(svg).children('.item-' + itemId)
		.addClass('d-none');
}

window.site.culculateOsmos.updateSvg.byNameSelectone = function (elm) {
	var data = $('option:selected', elm).attr('data'),
		itemId = elm.name,
		cls = JSON.parse(data)['property'],
		checked = $('.param-name_conductometer').prop('checked'),
		text = $('option:selected', elm).text(),
		svg = $('#calculator-image').children('svg');

	if ($('.s-description-' + itemId).length) {
		$('.s-description-' + itemId).children('text').text(text);
	}

	if (checked) {
		$(svg).children('.block-control_panel')
			.children('.item-control_panel').addClass('d-none');
		$(svg).children('.block-control_panel')
			.children('.item-conductometer-' + cls).removeClass('d-none');

		return null;
	}

	$(svg).children('.block-control_panel')
		.children('.item-control_panel').addClass('d-none');
	$(svg).children('.block-control_panel')
		.children('.' + cls).removeClass('d-none');
}

window.site.culculateOsmos.updateSvg.byNameCheckbox = function (elm) {
	var checked = $(elm).prop('checked'),
		checkboxCls = elm.name,
		data = $('.param-name_control_panel option:selected').attr('data'),
		selectedСls = JSON.parse(data)['property'],
		svg = $('#calculator-image').children('svg');

	if (checked) {
		$(svg).find('.i-description-' + checkboxCls)
			.removeClass('d-none');
		$(svg).children('.block-control_panel')
			.children('.item-control_panel').addClass('d-none');
		$(svg).children('.block-control_panel')
			.children('.item-' + checkboxCls + '-' + selectedСls).removeClass('d-none');
		$(svg).children('.item-' + checkboxCls)
			.removeClass('d-none');

		return null;
	}

	$(svg).find('.i-description-' + checkboxCls)
		.addClass('d-none');
	$(svg).children('.block-control_panel')
		.children('.item-control_panel').addClass('d-none');
	$(svg).children('.block-control_panel')
		.children('.' + selectedСls).removeClass('d-none');
	$(svg).children('.item-' + checkboxCls)
		.addClass('d-none');
}

window.site.culculateOsmos.updateSvg.selectToSelect = function (firstElm, secondElm) {
	/**
	 * firstElm - основной элемент
	 * secondElm - зависивый элемент
	 */

	var firstData = $('option:selected', firstElm).attr('data');
	var firstId = firstElm.name;
	var firstProp = JSON.parse(firstData)['property'];

	var secondData = $('option:selected', secondElm).attr('data');
	var secondId = secondElm.name;
	var secondProp = JSON.parse(secondData)['property'];

	var svg = $('#calculator-image').children('svg');
	var releToSl = $(svg).find('.item-rele-to-sl');
	var solemer = $(svg).find('.item-conductometer.sl');

	$('select[name="conductometer"]').attr('disabled', false);

	if (
		(firstProp === 'rele' && secondProp === 'sl')
		|| (firstProp === 'sl' && secondProp === 'rele')
	) {
		return releToSl.removeClass('d-none');
	}
	/**
	 * отключить кондуктомер если БУ -> не выбран
	 */
	if (firstId === 'control_panel') {
		if (firstProp === 'null') {
			$('select[name="conductometer"]').attr('disabled', true);
			solemer.addClass('d-none');
			releToSl.addClass('d-none');
			$('.s-description-conductometer').addClass('d-none');
			return null;
		}
		if (secondProp === 'sl') {
			solemer.removeClass('d-none');
			releToSl.addClass('d-none');
			$('.s-description-conductometer').removeClass('d-none');
			return null;
		}
	}
	if (secondId === 'control_panel') {
		if (secondProp === 'null') {
			$('select[name="conductometer"]').attr('disabled', true);
			solemer.addClass('d-none');
			releToSl.addClass('d-none');
			$('.s-description-conductometer').addClass('d-none');
			return null;
		}
		/*if ( firstProp === 'sl' ) {
			solemer.removeClass('d-none');
			releToSl.addClass('d-none');
			return null;
		}*/
	}

	return releToSl.addClass('d-none');
}

/**
 * Считаем сумму выбранной комплектации
 */
window.site.culculateOsmos.calc = function () {

	site.culculateOsmos.elements().each(function (_, el) {
		var name = $(el)[0].name;
		site.culculateOsmos[site.culculateOsmos.activeFilterType].fn[name](el);
	});

	//var strapping_type = site.culculateOsmos.fn['strapping_type'](document.getElementsByName('value-strapping_type'));

	site.culculateOsmos.calc.amount();
}

window.site.culculateOsmos.calc.amount = function () {
	site.culculateOsmos.amount = 0;

	for (var item in site.culculateOsmos.prices) {
		site.culculateOsmos.amount += site.culculateOsmos.prices[item];
	}

	const curriency = (site.culculateOsmos.activeFilterType == 'big') ? 85 : 1;

	$('.result-price_value').text(site.common.numberFormat(site.culculateOsmos.amount * curriency));
	$('[name="complectation"]').val($('.result-complect').html());
}

/**
 * Увеличить/исходный размер картинки осмоса
 */
window.site.culculateOsmos.zoomOnOff = function () {
	$(document).on('click', '.zoom-on-off', function () {
		console.log('click');
		$('.container-calculator').toggleClass('zoom-on');
		$('.zoom-on-off').toggleClass('disabled');
	});
}

/**
 * Показать/скрыть подписи к SVG картинке
 */
window.site.culculateOsmos.toggleDescriptionSVG = function () {
	const checkboxStatus = $('.on-off-description').is(":checked");
	const $container = $('.container-calculator');
	const $description = $('#calculator-image').children('svg').children('.description');

	if (checkboxStatus) {
		$container.addClass('description-on');
		$description.addClass('d-block');
	} else {
		$container.removeClass('description-on');
		$description.removeClass('d-block');
	}
}


/**
 * Распечатать
 */
window.site.culculateOsmos.printOut = function () {
	$('.print-out').on('click', function () {
		var _css = '<link rel="stylesheet" href="/templates/design/styles/print.css" type="text/css" />';
		var _print = $('.result-complect').html();
		var _svg = $('#calculator-image')[0].innerHTML;
		var _iframe = $('<iframe />', {
			'id': 'printFrame'
		});

		$('body').append(_iframe);
		var doc = $('#printFrame')[0].contentDocument || $('#printFrame')[0].contentWindow.document;
		var win = $('#printFrame')[0].contentWindow || $('#printFrame')[0];
		doc.getElementsByTagName('head')[0].innerHTML = _css;
		doc.getElementsByTagName('body')[0].innerHTML = '<h1>Компания ООО «НПЦ ПромВодОчистка». Калькулятор обратного осмоса.</h1>';
		doc.getElementsByTagName('body')[0].innerHTML += '<p>ООО «НПЦ ПромВодОчистка»<br />ИНН 5262153268, г. Нижний Новгород<br />Телефон: +7 (831) 262-15-90<br />E-mail: info@prom-water.ru<br />https://prom-water.ru</p>';
		doc.getElementsByTagName('body')[0].innerHTML += '<h3>Выбранная комплектация осмоса.</h3>';
		doc.getElementsByTagName('body')[0].innerHTML += _print;
		doc.getElementsByTagName('body')[0].innerHTML += _svg;
		win.print();
		setTimeout(function () {
			_iframe.remove();
		}, 10000);
	});
}

window.site.culculateOsmos.load = function () {

	const filterType = $(".js-change-filter-type .tab-link.active").data('filter-type');
	site.culculateOsmos.activeFilterType = filterType;

	const complite = (data) => {
		site.culculateOsmos.prices = {};

		let $params = $(renderPropItem(data.params));
		let $options = $(renderPropItem(data.options));
		let $resultParams = $(renderResultPropItem(data.params));
		let $resultOptions = $(renderResultPropItem(data.options));

		$('.container-calculator .filter-params .row').html($params);
		$('.container-calculator .filter-options .row').html($options);

		if ($options.length) {
			$('.container-calculator .filter-options').show();
		} else {
			$('.container-calculator .filter-options').hide();
		}

		$('.result-calculator .result-complect').html("");
		$('.result-calculator .result-complect').append($resultParams);
		$('.result-calculator .result-complect').append($resultOptions);

		site.common.initTooltips();

		site.culculateOsmos.calc();
		site.culculateOsmos.printOut();
	}

	const loadConfig = () => {
		$.ajax({
			type: 'get',
			url: site.culculateOsmos.configUrl,
			asyn: true,
			dataType: 'JSON',
			success: (data) => {
				site.culculateOsmos.config = data;
				complite(data[filterType])
			}
		})
	};

	if (site.culculateOsmos.config) {
		complite(site.culculateOsmos.config[filterType])
	} else {
		loadConfig();
	}

}

window.site.culculateOsmos.init = function () {
	site.culculateOsmos.load();
	site.culculateOsmos.zoomOnOff();

	$(document).on('click', ".js-change-filter-type .tab-link:not(.active)", function (e) {
		$(".js-change-filter-type .tab-link.active").removeClass('active');
		$(this).addClass('active');
		site.culculateOsmos.load(); // reload calculator
	});

	$(document).on('change', site.culculateOsmos.elementsSelector, function (e) {
		site.culculateOsmos.calc();
		site.culculateOsmos.updateSvg(e.target);
	});

	$('.on-off-description').on('change', site.culculateOsmos.toggleDescriptionSVG);
}

function renderPropItem(itemData) {
	let tpl = "";
	let i = 0;

	const typesClasess = {
		select: 'filter-params-item__select',
		checkbox: 'filter-params-item__checkbox',
		hidden: 'filter-input-hidden d-none'
	}

	for (let item of itemData) {
		tpl += `<div class="d-flex filter-params-item col-12 col-md-6 col-lg-12 ${typesClasess[item['type']]}">`;
		tpl += `<div class="filter-params-title">`;
		tpl += item['title'];
		if (item['tooltip']) {
			tpl += `<i class="icon-tooltip" data-bs-toggle="tooltip" data-bs-placement="right" title='${item['tooltip']}'>?</i>`;
		}
		tpl += '</div>';

		// view select, input[type=text], input[type=radio], input[type=checkbox]
		tpl += '<div class="filter-params-props">';

		switch (item['type']) {
			case 'select':
				tpl += `<select class="filter-params-select param-name_${item['name']} select" name="${item['name']}">`;
				for (let i of item['items']) {
					let json = JSON.stringify({ property: i['property'], price: i['price'], short_descr: i['short_descr'] });

					tpl += `<option class="filter-element" data='${json}'>`;
					tpl += i['value'];
					tpl += '</option>';
				}
				tpl += '</select>';
				break;
			case 'checkbox': {

				let json = JSON.stringify({ price: item['items']['price'] });

				tpl += `<input name="${item['name']}" `;
				tpl += `class="filter-element filter-params-input param-name_${item['name']} checkbox" `;
				tpl += 'type="checkbox" ';
				tpl += (item['items']['value'] ? 'checked ' : ' ');
				tpl += `value="${(item['items']['value'] ? 1 : 0)}" `;
				tpl += `data='${json}' id="param-name_${item['name']}-${i}"/>`;
				tpl += `<label for="param-name_${item['name']}-${i}"></label>`
				break;
			}
			case 'hidden': {
				let json = JSON.stringify({ price: item['price'] });

				tpl += `<input name="${item['name']}" `;
				tpl += `class="filter-element filter-params-input param-name_${item['name']}" `;
				tpl += 'type="hidden" ';
				tpl += `data='${json}' id="param-name_${item['name']}-${i}"/>`;
				break;
			}

			default:
				tpl += '';
		}
		tpl += '</div>';

		tpl += '</div>';

		i++;
	}

	return tpl;
}

function renderResultPropItem(itemData) {
	let tpl = "";
	let i = 0;
	for (let item of itemData) {
		tpl +=
			`<div class="col-md-6">
			<div class="d-flex result-complect_item">
				<span class="result-complect_title">${item['title']}:</span>
				<span class="result-complect_value" id="value-${item['name']}"></span>
			</div>
		</div>`;
	}

	return tpl;
}


$(function () {
	if ($('.container-calculator').length) {
		site.culculateOsmos.init()
	}
});