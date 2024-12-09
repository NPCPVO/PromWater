import $ from "jquery";
import "jquery.cookie";
// no-sort
// import bootstrap from "bootstrap";

window.site.ymaps = {
    /** Инициализирует стили и поведение на всех страницах сайта */

    init: function () {
        initYandexMapHandler();

        function initYandexMapHandler() {
            let mapEl = document.getElementById('ymap');

            let ymapsIsVisibled = false;
            let ymapRaady = false;

            const loadMap = () => {
                console.log("Maps script loaded");

                ymaps.ready(() => {
                    ymapRaady = true;
                    initGeolocation();
                    tryRenderYmap();
                });
            };

            const tryRenderYmap = () => {
                ymapsIsVisibled && ymapRaady && initYandexMap();
            }

            loadScript("https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=5935273e-9faf-472c-a5af-c68e771387e3", loadMap)

            if (mapEl) {
                const onIntersect = function (entries, observer) {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;
                        observer.disconnect();

                        ymapsIsVisibled = true;
                        tryRenderYmap();
                    });
                }
                const observer = new IntersectionObserver(onIntersect, {
                    rootMargin: '0px',
                    threshold: [0, 0.5]
                });

                observer.observe(mapEl);
            }

        }

        async function initGeolocation() {
            let currentCity = await getCurrentCity();
            $.cookie('city_name', currentCity);

            $(".header__link-location span").text(currentCity);

            let sitySelectSelector = document.querySelector('#selectCity');
            let sitySelectModal = bootstrap.Modal.getOrCreateInstance(sitySelectSelector);

            $(document).on('click', '#selectCity .city_item', e => {
                const cityText = $(e.currentTarget).text();
                $(".header__link-location span").text(cityText);

                sitySelectModal.hide();
            });

            $('.cities__search').on('input', async (e) => {
                const searchText = $(e.currentTarget).val().toLowerCase();
                $('.city__group, .city__group li').removeClass('disabled');

                $('.city__group').each((_, group) => {
                    const $group = $(group);
                    const $childs = $group.find('li');

                    $childs.each((_, el) => {
                        const $el = $(el);
                        let text = $(el).text().toLowerCase();

                        if (text.slice(0, searchText.length) !== searchText) {
                            $el.addClass('disabled');
                        }

                    });

                    if ($childs.length == $group.find('.disabled').length) {
                        $group.addClass('disabled');
                    }
                });
            });

            $(document).on('click', '#selectCity .city__item', (el) => {
                $.cookie('city_name', $(el.currentTarget).text(), { expires: 7, path: '/' });
                sitySelectModal.hide();

                location.reload();
            });

            let confirmSelector = document.querySelector('#confirmCity');
            // let confirmModal = bootstrap.Modal.getOrCreateInstance(confirmSelector);

            if ($.cookie && !$.cookie('city_name')) {
                // confirmModal.show();
            }

            $(document).on('click', '.confirm-city__confirm', (el) => {
                $.cookie('city_name', $(el.currentTarget).data('city'), { expires: 7, path: '/' });
            });
        }

        async function getCurrentCity() {
            try {
                const result = await ymaps.geolocation.get({
                    provider: 'yandex',
                    mapStateAutoApply: true
                });

                const firstGeoObject = result.geoObjects.get(0);
                const cityName = firstGeoObject.properties.get('name');

                return cityName;
            } catch (error) {
                return "Московская область";
            }
        }

        function initYandexMap() {
            getCurrentCity();

            if (!document.getElementById('ymap')) return;

            var myMap;

            var zoom = 13;

            if ($(window).width() < 576) {
                zoom = 12;
            } else if ($(window).width() < 768) {
                zoom = 12.5;
            }

            const getGlobalScale = () => Math.max(0.5, Math.min(1.5, $('#ymap').width() / 1920));
            // Создание экземпляра карты и его привязка к контейнеру с
            // заданным id ("map").
            var MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
                '<h3 class="popover-title">$[properties.balloonHeader]</h3>' +
                '<div class="popover-content">$[properties.balloonContent]</div>'
            );

            const pointsScale = 1;

            let center = [0, 0]; // находим центр карты
            let pointsCount = 0;
            let points = [];

            $('.addres__link[data-coordinates]').each((_, el) => {
                const $el = $(el);
                const coordinates = $el.data('coordinates').replace(' ', '').split(',');
                const text = $el.parent().find('.addres__content').text();

                center[0] += Number(coordinates[0]);
                center[1] += Number(coordinates[1]);
                pointsCount++;

                const point = new ymaps.Placemark(coordinates, {
                    balloonHeader: text,
                }, {
                    balloonShadow: false,
                    balloonLayout: MyBalloonLayout(),
                    balloonContentLayout: MyBalloonContentLayout,
                    balloonPanelMaxMapArea: 0,
                    iconLayout: 'default#image',
                    iconImageHref: 'images/sprite.svg#icons--mapPoint',
                    iconImageSize: [38, 38],
                    iconImageOffset: [-38 / 2, -38 / 2],
                    // hideIconOnBalloonOpen: false,
                    zIndex: 201,
                    zIndexActive: 201,
                });

                points.push(point);

                $($el).on('click', () => {
                    site.common.scrollTo($("#ymap"));
                    point.balloon.open();
                });
            });

            center[0] /= pointsCount;
            center[1] /= pointsCount;

            myMap = new ymaps.Map('ymap', {
                // При инициализации карты обязательно нужно указать
                // её центр и коэффициент масштабирования.
                center: center,
                zoom: zoom,
                controls: ['zoomControl']
            }, {
                searchControlProvider: 'yandex#search'
            });

            for (const point of points) {
                myMap.geoObjects.add(point);
            }

            // своя точка
            function MyBalloonLayout(additionalLayoutClass = "") {
                return ymaps.templateLayoutFactory.createClass(
                    '<div class="popover top ' + additionalLayoutClass + '">' +
                    '<div class="popover-inner">' +
                    '<a class="position-absolute popover-close close" role="button">' +
                    '<svg height="24" width="24">' +
                    '    <use xlink:href="images/sprite.svg#header--close"></use>' +
                    '</svg>' +
                    '</a>' +
                    '$[[options.contentLayout  ]]' +
                    '</div>' +
                    '</div>', {
                    /**
                     * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
                     * @function
                     * @name build
                     */
                    build: function () {
                        this.constructor.superclass.build.call(this);

                        this._$element = $('.popover', this.getParentElement());

                        this.applyElementOffset();

                        this._$element.find('.popover-close')
                            .on('click', $.proxy(this.onCloseClick, this));
                    },

                    /**
                     * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name onSublayoutSizeChange
                     */
                    onSublayoutSizeChange: function () {
                        MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);
                        if (!this._isElement(this._$element)) {
                            return;
                        }

                        this.applyElementOffset();

                    },

                    onCloseClick: function (e) {
                        e.preventDefault();

                        this.events.fire('userclose');
                    },

                    /**
                     * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name applyElementOffset
                     */
                    applyElementOffset: function (e) {
                        this._$element.css({
                            right: -0,
                            top: -(this._$element[0].offsetHeight)
                        });
                    },

                    getScale: function () {
                        return getGlobalScale();
                    },

                    /**
                     * Используется для автопозиционирования (balloonAutoPan).
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
                     * @function
                     * @name getClientBounds
                     * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
                     */
                    getShape: function () {
                        // const scale = this.getScale();
                        // console.log('getShape', scale);

                        if (!this._isElement(this._$element)) {
                            return MyBalloonLayout.superclass.getShape.call(this);
                        }

                        var position = this._$element.position();

                        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                            [position.left, position.top], [
                                position.left + this._$element[0].offsetWidth,
                                position.top + this._$element[0].offsetHeight
                            ]
                        ]));
                    },

                    /**
                     * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
                     * @function
                     * @private
                     * @name _isElement
                     * @param {jQuery} [element] Элемент.
                     * @returns {Boolean} Флаг наличия.
                     */
                    _isElement: function (element) {
                        return element && element[0];
                    }
                });
            }

        }

        function loadScript(url, callback) {
            var script = document.createElement("script");

            if (script.readyState) { // IE
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" ||
                        script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else { // Другие браузеры
                script.onload = function () {
                    callback();
                };
            }

            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    },
}


$(function () {
    site.ymaps.init();
});