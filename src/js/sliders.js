import "jquery";
import '../scss/libs/slick-theme.scss';
import '../scss/libs/slick.scss';
import "./libs/slick.min";

window.site.sliders = {

    init: async function () {
        initSliders();

        site.sliders.initInteractiveSlides(document.body);
        site.sliders.initProductPreviewSliders();
        site.sliders.initProductOffcanvasSliders();
        site.sliders.initPartOffcanvasSliders();

        function initSliders() {
            // Сладйер Сравнения
            // $(".comparison-slider").not('.slick-initialized').slick({
            //     slidesToShow: 4,
            //     autoplay: false,
            //     infinite: false,
            //     responsive: [{
            //             breakpoint: 1920,
            //             settings: {
            //                 slidesToShow: 3
            //             }
            //         },
            //         {
            //             breakpoint: 1366,
            //             settings: {
            //                 slidesToShow: 2
            //             }
            //         },
            //         {
            //             breakpoint: 767,
            //             settings: {
            //                 slidesToShow: 1
            //             }
            //         }
            //     ]

            // });

            // слайдер на странице товара
            $(".product__slider").not('.slick-initialized').slick({
                lazyLoad: 'progressive',
                slidesToShow: 5,
                autoplay: true,
                responsive: [

                    {
                        breakpoint: 1920,
                        settings: {
                            slidesToShow: 4
                        }
                    },
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 2
                        }
                    },

                    {
                        breakpoint: 767,
                        settings: {
                            slidesToShow: 1
                        }
                    }
                ]
            });


            $(".four-slide__slider .slider-preview").not('.slick-initialized').slick({
                autoplay: false,
                lazyLoad: 'ondemand',
                slidesToShow: 1,
                asNavFor: '.four-slide__slider .slider-thumb',
                arrows: false,
                draggable: false,
                fade: true,
                responsive: [

                    {
                        breakpoint: 768,
                        settings: {
                            autoplay: 1,
                            arrows: true,
                        }
                    },

                ]
            });

            $(".four-slide__slider .slider-thumb").not('.slick-initialized').slick({
                lazyLoad: 'progressive',
                autoplay: false,
                slidesToShow: 3,
                slidesPerRow: 3,
                infinite: true,
                vertical: true,
                verticalSwiping: true,
                focusOnSelect: true,
                asNavFor: '.four-slide__slider .slider-preview',
                arrows: false,
                draggable: true,
                responsive: [{
                    breakpoint: 1400,
                    settings: {
                        slidesToShow: 3,
                        vertical: false,
                    }
                },]
            });

            $(".sertificates-slider").not('.slick-initialized').slick({
                lazyLoad: 'ondemand',
                slidesToShow: 6,
                autoplay: true,
                responsive: [{
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 6
                    }
                },
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 1
                    }
                }
                ]

            });
        }

    },

    initPartOffcanvasSliders: function () {
        // слайдер в карточке товара
        $(".details-slider").not('.slick-initialized').slick({
            lazyLoad: 'ondemand',
            slidesToShow: 1,
            autoplay: true,
            // infinite: false,
            // responsive: [{
            //     breakpoint: 767,
            //     settings: {
            //         slidesToShow: 1,
            //     }
            // }, ],
        });
    },

    initProductPreviewSliders: function () {
        // слайдер в карточке товара
        $(".product-card__slider").not('.slick-initialized').slick({
            lazyLoad: 'progressive',
            slidesToShow: 1,
            autoplay: false,
        });
    },

    initProductOffcanvasSliders: function () {
        $(".product-offcanvas-slider").not('.slick-initialized').slick({
            lazyLoad: 'ondemand',
            slidesToShow: 1,
            autoplay: true,
        });
    },


    initInteractiveSlides: async function (container) {

        let $elements = $(".interactive-slider", container)
            .not('.collapse:not(.show) .interactive-slider', container)
            .not('.slick-initialized')
            .not('.i_slider-initialize');


        if (!$elements.length) return;

        $elements.addClass('i_slider-initialize');
        $elements.each((_, el) => {

            const $elements = $(el);
            const $container = $elements.closest(".interactive-slider__container");
            const $prevArrow = $(".slider-controll .slick-prev", $container);
            const $nextArrow = $(".slider-controll .slick-next", $container);

            $container.addClass("loading");

            const initSlider = async () => {
                $container.removeClass("loading");
                let stopped = true;
                $elements.slick({
                    slidesToShow: 1,
                    autoplay: false,
                    autoplaySpeed: 120,
                    waitForAnimate: false,
                    // infinite: false,
                    touchMove: false,
                    pauseOnFocus: false,
                    pauseOnHover: false,
                    fade: false,
                    speed: 0,
                    prevArrow: $prevArrow,
                    nextArrow: $nextArrow,

                    responsive: [{
                        breakpoint: 767,
                        settings: {
                            prevArrow: $prevArrow,
                            nextArrow: $nextArrow,
                        }
                    },],
                });

                $elements.on('swipe', function () {
                    stopped = true;
                    $elements.slick('slickPause');
                });

                $container.on('click', () => {
                    stopped = true;
                    $elements.slick('slickPause');
                });

                const onIntersect = function (entries, observer) {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            $elements.slick('slickPause');
                            console.log('Interactive slider pause');
                        } else if (!stopped) {
                            $elements.slick('slickPlay');
                            console.log('Interactive slider play');
                        }
                    });
                }
                const observer = new IntersectionObserver(onIntersect, {
                    rootMargin: '72px',
                    threshold: [0, 0.5]
                });

                $elements.each((_, el) => observer.observe(el));
            };

            // Loader
            const $images = $('img', $elements);
            const slidesCount = $images.length;

            $('.solution-interactive-slide > *', $elements).addClass('d-none');
            let loadedCounter = 0;

            $images.each((_, imgEl) => imgEl.addEventListener('load', (e) => {
                loadedCounter++;
                console.log("Interactive slide loaded", loadedCounter, "/", slidesCount);
                $(".interactive-slider__loader").html(`Загрузка ${Math.round(loadedCounter / slidesCount * 100)}%`);

                if (loadedCounter >= slidesCount) {
                    initSlider();

                    $('.solution-interactive-slide > *', $elements).removeClass('d-none');
                    $($elements).removeClass('skeleton-loading');
                    $('.solution-interactive-slide img', $elements).each((_, el) => initInteractiveSlide(el));
                }
            }));

            $images.each((_, el) => {
                const $el = $(el);
                $el.attr('src', $el.data('src'));
            });

        });

        // Interctinve Points Positioning
        const initInteractiveSlide = (imageEl, recursiveCounter = 1) => {
            const parent = $(imageEl).closest(".solution-interactive");

            const naturalWidth = imageEl.naturalWidth;
            const naturalHeight = imageEl.naturalHeight;

            if (!naturalWidth || !naturalHeight) {
                // попытки дождаться загрузки слайда
                return (recursiveCounter < 100) ? setTimeout(() => initInteractiveSlide(imageEl, recursiveCounter + 1), 300) : console.error("Не удалось загрузить слайд", imageEl);
            }

            const positioning = () => {
                const width = imageEl.width;
                const height = imageEl.height;

                const rWidth = width / naturalWidth;
                const rHeight = height / naturalHeight;

                // console.log("positioning");

                $(".interactive-slide__point", parent).each((_, el) => {
                    const x = $(el).data('x') * rWidth - $(el).width() / 2;
                    const y = $(el).data('y') * rHeight - $(el).height() / 2;

                    const scale = Math.max(rWidth, 0.35);

                    $(el).css('transform', `translate(${x}px, ${y}px) scale(${scale})`)
                });
            }

            if ($(".interactive-slide__point", parent).length) {
                positioning();

                $(window).on('resize', () => setTimeout(positioning, 100));
            }

        }


        // Touch Move 
        const moveTriggerStep = Math.max($(window).width() / 100, 7);

        $elements.on('mousedown touchstart', e => {
            if ($(e.target).hasClass('interactive-slide__point')) return;

            if (e.type == "mousedown" && e.which != 1) return;

            $('body').css('cursor', 'w-resize');
            $elements.find('.interactive-slide__point').fadeOut(100);

            let startPosition = e.type == 'touchstart' ? e.originalEvent.changedTouches[0].pageX : e.originalEvent.pageX;

            const moveCallback = e => {
                const x = e.type == 'touchmove' ? e.originalEvent.changedTouches[0].pageX : e.originalEvent.pageX;
                const delta = startPosition - x;

                if (Math.abs(delta) > moveTriggerStep) {
                    startPosition = x;

                    if (delta > 0) {
                        $elements.slick('slickNext');
                    } else {
                        $elements.slick('slickPrev');
                    }
                }

            };

            const upCallback = e => {
                $('body').css('cursor', '');
                $elements.find('.interactive-slide__point').fadeIn(100);

                $(document).off('mouseup touchend', upCallback);
                $(document).off('mousemove touchmove', moveCallback);
            };

            $(document).on('mouseup touchend', upCallback);
            $(document).on('mousemove touchmove', moveCallback);
        });

    }

}

$(function () {
    setTimeout(site.sliders.init, 0);
});