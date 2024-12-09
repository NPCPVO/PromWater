import $ from "jquery";
import "jquery.cookie";


window.site.filters = {
    apiUrl: '/content/getCatalog/',
    categoryId: -1,
    $form: $("#product-filters"),
    $catalogConatiner: $("#catalog-more-container"),
    // params: {},

    init: function () {

        initSort();
        initProductViewChangeButton();
        if (site.filters.$form.length) {
            initFilter();
            initFiltersGroups();
            initRangeSlider();
        };

        function initProductViewChangeButton() {
            const buttons = document.querySelectorAll('.select-products-view-style__button');
            buttons.forEach((element) => {
                element.addEventListener('click', () => {
                    if (element.classList.contains('select-products-view-style__button--active')) return;

                    buttons.forEach(el => el.classList.remove('select-products-view-style__button--active'));

                    element.classList.add('select-products-view-style__button--active');

                    $.cookie('product_view_mode', element.dataset.viewAs, { path: '/', expires: new Date(new Date().getTime() + 365 * 24 * 60 * 1000) });
                    window.location.reload();
                })
            });
        }

        function initSort() {
            $('.category-sort').on('change', function () {

                const value = this.value.split('=');
                const fieldName = value[0] || '';
                const direction = value[1] || '';
                if ($.cookie) {
                    $.cookie('sort_field', fieldName, { path: '/' });
                    $.cookie('sort_direction_is_ascending', direction, { path: '/' });

                    site.filters.prepareRequestAndSend();
                }

            });

        }

        function initFilter() {
            site.filters.categoryId = site.filters.$form.data('category-id');

            var fieldList = site.filters.getAllFields();
            site.filters.forEachField(fieldList, bindValueChangeHandler);

            $(document).on('click', '.js-reset-filter-field', resetFilterFieldHandler)
        }

        function initFiltersGroups() {
            site.filters.$form.find('.filters__more').each(
                (_, el) => {
                    const $el = $(el);
                    const $parent = $(el).parent();
                    const $hiddenParams = $parent.find('.filter__param:nth-child(n + 4)').not('.active');
                    $hiddenParams.fadeOut(0);

                    $el.on('click', () => {
                        $hiddenParams.fadeIn();
                        $el.remove();
                    });
                }
            );
        }

        function resetFilterFieldHandler() {
            const $el = $(this);
            const filedName = $el.data('field');
            $(`input[name^="${filedName}"]`).each((_, el) => $(el).prop('checked', false));
            $el.addClass('active');
            site.filters.prepareRequestAndSend();
        }

        /** Назначает обработчик событий выбора значения в фильтре для полей разных типов */
        function bindValueChangeHandler() {
            var $field = this;
            var fieldType = site.filters.getFieldType($field);

            switch (true) {
                case fieldType.tag === 'input' && (fieldType.type === 'radio' || fieldType.type === 'checkbox'): {
                    $field.click(site.filters.onChange);
                    break;
                }

                case $field.parents('.date_field').length > 0: {
                    $field.change(site.filters.onChange);
                    break;
                }
            }
        }

        function initRangeSlider() {

            if (!$('.filters-slider-field').length) return;

            Promise.all([
                require.async("../scss/libs/jquery-ui.css"),
                require.async("./libs/jquery-ui.min"),
                require.async("./libs/jquery.ui.touch-punch.min")
            ]).then((scripts) => {
                // console.log(scripts);

                $('.filters-slider-field').each((_, el) => {
                    const $min = $(el).find('input.min');
                    const $max = $(el).find('input.max');

                    const min = $min.data('minimum');
                    const max = $max.data('maximum');

                    const tooltips = [];
                    const viewport = site.common.getViewport();

                    jQuery('.filter-range', el).slider({
                        range: true,
                        values: [min, max],
                        min: min,
                        animate: false,
                        max: max,
                        orientation: ['xs', 'sm'].indexOf(viewport) !== -1 ? 'vertical' : 'horizontal',

                        stop: function (event, ui) {
                            const index = ui.handleIndex;
                            jQuery(tooltips[index].tip).find('.tooltip-inner input').val(ui.value);
                            tooltips[index].update();
                        },

                        slide: function (event, ui) {
                            const index = ui.handleIndex;
                            jQuery(tooltips[index].tip).find('.tooltip-inner input').val(ui.value);
                            tooltips[index].update();
                        },

                        create: function (event, ui) {
                            const $instance = jQuery(event.target);

                            const tooltipConfig = {
                                placement: ['xs', 'sm'].indexOf(viewport) !== -1 ? 'left' : 'top',
                                trigger: 'manual',
                                html: true,
                                customClass: 'filter-range__tooltip',
                            };

                            const createTooltip = (element) => {
                                const input = document.createElement('input');
                                input.value = tooltips.length ? max : min;
                                input.dataset.index = tooltips.length;

                                input.classList.add('filter-range__input', 'text-center', 'w-100', 'h-100');

                                input.addEventListener('change', (e) => {
                                    const value = Math.max(min, Math.min(max, parseInt(e.target.value)));
                                    const values = [$min.val(), $max.val()];

                                    values[input.dataset.index] = value;

                                    $instance.slider('values', values.sort((a, b) => a - b));

                                    setTimeout(() => {
                                        tooltips.forEach(t => t.update());
                                    }, 10)
                                })

                                const tooltip = bootstrap.Tooltip.getOrCreateInstance(element, {
                                    ...tooltipConfig,
                                    title: input
                                });
                                tooltip.show();
                                tooltips.push(tooltip);
                            };

                            const corners = $(event.target).find('.ui-slider-handle');

                            createTooltip(corners[0]);
                            createTooltip(corners[1]);
                        },

                        change: function (event, ui) {
                            tooltips.forEach(t => t.update());

                            $min.val(ui.values[0]);
                            $max.val(ui.values[1]);

                            site.filters.onChange();
                        }
                    });
                });
            })
        }
    },

    onChange: function () {
        const $el = $(this);
        const $container = $el.closest('.category-filters__group');
        const $allBtn = $container.find('.js-reset-filter-field');

        if ($allBtn) {
            if ($container.find('input:checked').length != 0) {
                $allBtn.removeClass('active');
            } else {
                $allBtn.addClass('active');
            }
        }

        site.filters.prepareRequestAndSend();
    },

    prepareRequestAndSend: function () {
        site.filters.$catalogConatiner.addClass("skeleton-loading");
        site.filters.$catalogConatiner.addClass("loading");
        site.filters.$catalogConatiner.html("");

        if (site.filters.$catalogConatiner.data('selector'))
            $(`.show-more-link[data-target="${site.filters.$catalogConatiner.data('selector')}"]`).hide();

        const data = site.filters.$form.serialize();
        const url = site.filters.apiUrl + site.filters.categoryId + "/";

        var newRelativePathQuery = window.location.pathname + '?' + data;
        history.pushState(null, '', newRelativePathQuery);

        site.filters.requestFilteredProducts(url, data, site.filters.onProductsLoad);
    },

    onProductsLoad: function (response) {

        site.filters.$catalogConatiner.removeClass("skeleton-loading");
        site.filters.$catalogConatiner.removeClass("loading");

        if (site.filters.$catalogConatiner.data('selector'))
            $(`.show-more-link[data-target="${site.filters.$catalogConatiner.data('selector')}"]`).show();

        site.filters.$catalogConatiner.html(response);

        $('.js-products-meta .js-product-meta', site.filters.$catalogConatiner).each((_, item) => {
            switch (item?.dataset?.mode) {
                case 'replace':
                    $(item?.dataset?.for).html($(item).html());
                    break;
                case 'show-more-btn':
                    item?.dataset?.for && $(`.show-more-link[data-target="${item?.dataset?.for}"]`).show();
                    break;
                case 'hide-more-btn':
                    item?.dataset?.for && $(`.show-more-link[data-target="${item?.dataset?.for}"]`).hide();
                    break;
                default:
                    console.error("Unknown meta mode");
                    break;
            }
        });


        site.sliders.init(); // реинициализируем слайдеры
    },

    requestFilteredProducts: function (url, data, callback) {
        $.ajax({
            url: url,
            data: data,
            dataType: 'html',
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            success: callback,
            error: (e) => console.error(e)
        });
    },

    /**
     * Возвращает объект с именем тега и типом (атрибут type) поля
     * @param {jQuery} $field поле
     */
    getFieldType: function ($field) {
        var tag = $field.prop('tagName').toLowerCase();
        var type = $field.attr('type') || null;

        return {
            tag: tag,
            type: type
        };
    },

    /**
     * Возвращает все поля формы
     * @returns {jQuery}
     */
    getAllFields: function () {
        return $('input[name]', this.$form);
    },

    /**
     * Выполняет функцию callback для всех полей fieldList, которые соответствуют критерию filter
     * @param {jQuery} fieldList объект содержащий данные о полях формы фильтрации
     * @param {Function} callback функция, которая будет выполнена для каждого поля
     * @param {Function} [filter] функция, которая выступает в качестве критерия для отбора полей
     */
    forEachField: function (fieldList, callback, filter) {
        filter = (typeof filter === 'function') ? filter : function () {
            return true;
        };

        var extraArgs = Array.prototype.slice.call(arguments, 3);

        fieldList.each(function (i, field) {
            var $field = $(field);
            if (filter($field)) {
                callback.apply($field, extraArgs);
            }
        });
    }
}

$(function () {
    site.filters.init();
});