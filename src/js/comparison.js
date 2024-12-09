window.site.comparison = {
	addUrl: '/udata://emarket/addToCompare/',
	removeUrl: '/udata://emarket/removeFromCompare/',
	comparisonValue: 0,

	init: function () {
		initСomparison();

		function initСomparison() {
			site.comparison.comparisonValue = Number($('#comparison-value').data('value'));
			$(document).on('click', '.product__comparison-input', onChache);
			$(document).on('click', '.comparison-remove', removeComparisonProduct)
			$(document).on('click', '.comparison__prev', () => comparisonSlideTo(-1));
			$(document).on('click', '.comparison__next', () => comparisonSlideTo(1));

			if (site.comparison.comparisonValue == 0) {
				$(`.comparison__arrow`).remove();
			}
		}

		/**
		 * Переход на следующий/предыдущий слайд в сравнении
		 * @param {number} target Напрвление 1 - вперед, -1 - назад
		 */
		function comparisonSlideTo(target) {
			const $blockElement = $('.comparison__products >:first-child');
			if (!$blockElement.length) {
				return;
			}

			const width = $blockElement.outerWidth();
			const $scrollable = $('.comparison__wrap');

			$scrollable.animate({
				scrollLeft: $scrollable.scrollLeft() + width * target
			}, 400);
		}

		function onChache(e) {
			const value = e.target.checked;
			const url = value ? site.comparison.addUrl : site.comparison.removeUrl;

			const id = e.target.dataset.id;
			if (!id) throw new Error('Нет ID товара!');

			$(e.target).closest('.product__comparison').addClass('loading');

			$.ajax({
				url: url + '.json',
				data: {
					'redirect_disallow': 1,
					'param0': id
				},
				type: 'get',
				dataType: 'json',
				success: (response) => {
					if (response?.error) {
						alert(response?.error);
						e.target.checked = !value;
						return;
					}

					$(e.target).closest('.product__comparison').removeClass('loading');

					setComporisonCounter(site.comparison.comparisonValue + (value ? 1 : -1));

					if (value) { // если это добавление, вывдодим сообщение
						const name = $(e.target).closest('.product-card').find('.product-card__name').text();
						if (name) {
							const ID = Math.round(Math.random() * 1e9);

							$('.comprison-message__title').text(name);
							$('.comprison-message').attr('data-openId', ID).fadeIn(500);

							setTimeout(() => {
								$(`.comprison-message[data-openId="${ID}"]`).fadeOut(300);
							}, 5000);
						}
					}

				},
				error: (err) => {
					console.error(err);
					alert("При выполнении запроса возникла ошибка.");
					e.target.checked = !value;
				}
			});
		}

		function removeComparisonProduct(e) {
			const url = site.comparison.removeUrl;
			const id = e.target.dataset.id;

			if (!id) throw new Error('Нет ID товара!');

			$.ajax({
				url: url + '.json',
				data: {
					'redirect_disallow': 1,
					'param0': id
				},
				type: 'get',
				dataType: 'json',
				success: (response) => {
					if (response?.error) {
						alert(response?.error);
						return;
					}

					$(`[data-comparison-id=${id}]`).remove();
					// Удаляем последние элементы заголовков таблицы, делаем это с конца т.к у первого элемента есть текст
					$(`.comparison__table-titles`).each((_, el) => $(el).children().last().remove());

					setComporisonCounter(site.comparison.comparisonValue - 1);
				},
				error: (err) => {
					console.error(err);
					alert("При выполнении запроса возникла ошибка.");
					e.target.checked = !value;
				}
			});
		}

		function setComporisonCounter(value) {
			site.comparison.comparisonValue = value;
			$('.comparison-value').text(value).data('value', value).css({ display: value ? 'block' : 'none' });
		}
	}
}

$(function () {
	site.comparison.init();
});
