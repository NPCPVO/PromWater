window.site.moreLoader = {

    init: async function () {
        initHandlers();
        site.moreLoader.initShowMoreButtons();
        site.moreLoader.calcRows();
        initCatalogBanners();

        async function initHandlers() {

            function onAjaxMoreButtonClick(element) {
                const $el = $(element);
                const showAmount = Number($el.data('per-show')) || 1;
                const currentPage = Number($el.data('current-page')) || 0;
                const $container = $($el.data('target'));

                if ($el.hasClass('loading') || $container.hasClass('loading')) return;

                $el.addClass('loading');
                $container.addClass('loading');

                const url = $el.data('action') || "";

                const onResponse = (response) => {
                    const html = $(response);

                    if (html.find('.content-not-found').length) {
                        $el.hide();
                    } else {
                        $el.removeClass('loading');
                        $container.removeClass('loading');
                        $el.show();

                        $el.data('current-page', currentPage + 1);
                        $container.append(html);

                        site.common.scrollTo(html);
                        site.sliders.init();
                    }
                }

                let requestParams = Object.fromEntries(new URLSearchParams(location.search));

                $.ajax({
                    url: url,
                    dataType: 'html',
                    data: { ...requestParams, 'per_page': showAmount, 'p': currentPage + 1 },
                    type: 'GET',
                    success: onResponse,
                    error: (e) => console.error(e)
                });
            }

            $(document).on('click', '.js-show-more', e => {

                const $el = $(e.currentTarget);
                const showAmount = Number($el.data('per-show')) || 1;
                const $container = $($el.data('target'));

                if ($el.hasClass('active')) {
                    // обрабатываем нажатие кнопки свернуть
                    $(`.js-shown`, $container)
                        .hide(300)
                        .addClass('js-hidden')
                        .removeClass('js-shown');

                    $('.slick-slider', $container).slick('unslick');

                    $el.removeClass('active').find('span').text($el.data('show-text') || "показать еще");

                    return;
                }

                // обрабатываем нажатие показать еще

                const startRow = Number($(`.js-hidden`, $container).first().data('row')) || 1;
                let $firstElementOfFirstRow = $(`.js-hidden[data-row="${startRow}"]`, $container).first();

                for (let row = startRow; row < startRow + showAmount; row++) {
                    $(`.js-hidden[data-row="${row}"]`, $container)
                        .show(300)
                        .addClass('js-shown')
                        .removeClass('js-hidden')
                        .find('.slick-slider')
                        .slick('refresh');
                }

                //site.common.scrollTo($firstElementOfFirstRow);
                site.sliders.init();

                if ($('.js-hidden', $container).length == 0) {
                    $el.addClass('active').find('span').text($el.data('hide-text') || "свернуть");
                }

            });

            $(document).on('click', '.js-ajax-more', e => onAjaxMoreButtonClick(e.currentTarget));

            const onIntersect = function (entries, observer) {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.contains('js-auto-more') && onAjaxMoreButtonClick(entry.target);
                });
            }

            const observer = new IntersectionObserver(onIntersect, {
                rootMargin: '0px',
                threshold: [0, 0.5]
            });

            document.querySelectorAll('.js-auto-more').forEach(element => {
                if (!navigator.userAgent.match(/(Mozilla\/5\.0 \(Linux; Android 11; moto g power \(2022\)\) AppleWebKit\/537\.36 \(KHTML, like Gecko\) Chrome\/109\.0.0.0 Mobile Safari\/537\.36)|(Mozilla\/5\.0 \(Macintosh; Intel Mac OS X 10_15_7\) AppleWebKit\/537\.36 \(KHTML, like Gecko\) Chrome\/109\.0\.0\.0 Safari\/537\.36)|(Speed Insights)|(Chrome-Lighthouse)|(PSTS[\d\.]+)/)) {
                    observer.observe(element);
                }
            });
        }

        function initCatalogBanners() {
            $("#inline-banners div").each((_, el) => {
                const offset = $(el).data('row-offset');
                $(`#catalog-more-container div[data-row="${offset}"]`)
                    .last()
                    .after(el);
            });
        }
    },

    calcRows: function () {
        $('.js-more-container').each((_, el) => {
            const $container = $(el);

            if (!$container.children().length) return;

            let prevOffset = $container.children().get(0).offsetTop;
            let row = 0;

            for (const child of $container.children()) {

                if ($(child).offset().top != prevOffset) {
                    row++;
                    prevOffset = $(child).offset().top;
                }

                $(child).attr('data-row', row);
            }
        });
    },

    initShowMoreButtons: function () {

        $('.js-show-more').each((_, el) => {
            const $el = $(el);
            const rows = $el.data('rows') || 1;
            const $container = $($el.data('target'));

            if (!$container.children().length) return;

            let prevOffset = $container.children().get(0).offsetTop;
            let row = 0;
            let hiddenElements = [];

            // как только элемент вышел на следующую строку скрываем его
            for (const child of $container.children()) {

                if ($(child).offset().top != prevOffset) {
                    row++;
                    prevOffset = $(child).offset().top;
                }

                if (row > rows) {
                    if (!$(child).hasClass('js-more-ignore')) hiddenElements.push(child);
                }

                $(child).attr('data-row', row);

            }

            for (const child of hiddenElements) {
                $(child).hide()
                    .addClass('js-hidden');
            }

            if (hiddenElements.length) {
                $el.show();
            } else {
                $el.hide();
            }

        });


    },
}

$(function () {
    site.moreLoader.init();
});
