window.site.search = {
	apiUrl: window?.developmentEnv?.search?.apiUrl || '/udata://search/search_do/.json',

	searchRequest: site.common.debounce((request, successCallback) => {
		$.ajax({
			url: site.search.apiUrl,
			type: 'get',
			dataType: 'json',
			data: request,
			success: successCallback,
			error: (err) => {
				console.error(err);
				alert("При выполнении запроса возникла ошибка.");
			}
		});
	}, 300),

	init: function () {
		initSearch();

		function initSearch() {
			$('.header__search-button').on('click', searchOn);
			$('.header__search-close').on('click', searchOff);
			$('.header__search-input').on('input', onInput);
			$('.header__search-input').on('keyup', onKeyup);
			$('.header__search-input').on('blur', searchOff);
		}

		function onKeyup(e) {
			if (e.key === 'Enter' || e.keyCode === 13) {
				const searchString = $('.header__search-input').val();

				window.location.href = `/search/?search_string=${searchString}&search_types=56&search_branches=228`;
			}
		}

		function searchOn() {
			$('.search-off').removeClass('search-off').addClass('search-on');
			$('.header__search-wrap').animate({ width: "100%" }, { duration: 400 });
			$('.header__search-input').focus();
		}

		function searchOff() {
			$('.search-on').removeClass('search-on').addClass('search-off');
			$('.header__search-wrap').css({ width: 0 });
			$('.header__search-input').focus();
			$('.search-result').fadeOut(300);
		}

		function onInput(e) {
			const value = e.target.value;

			if (value.length > 2) {
				const request = {
					search_branches: "228 315 325", // товары, статьи, референт 
					search_types: "56 29", // объект каталога, ность (статья)
					search_string: value,
					per_page: 10
				};

				$('.header__search-close').addClass('loading');

				site.search.searchRequest(request, onResult);
			}
		}

		function onResult(result) {
			const searchString = $('.header__search-input').val();

			const moreHtml = `<a href="/search/?search_string=${searchString}&search_types=56%2029&search_branches=228%20315%20325" class="d-block text-center">Показать все</a>`;

			const html = result?.items?.item && Object.keys(result?.items?.item).length ? Object.values(result.items.item).map(item => `
				<a href="${item.link}">${item.name}</a>
			`).join('') + moreHtml
				: `<div class="text-center">По вашему запросу результатов не найдено</div>`;

			$('.search-result__list').html(html);
			$('.search-result').fadeIn(300).css({ maxHeight: (window.innerHeight - $('.search-result').get(0).offsetTop) + 'px' });

			$('.header__search-close').removeClass('loading');

		}
	}
}

$(function () {
	site.search.init();
});
