import $ from "jquery";
window.jQuery = window.$ = $;
// no-sort
import bootstrap from 'bootstrap';
window.bootstrap = bootstrap;

var site = {};

window.site = site;
window.site.common = {
    /** Инициализирует стили и поведение на всех страницах сайта */
    headerHeigth: 0,

    init: async function () {

        initFancybox();
        initAdaptive();
        initPopups();
        initVideoPlayer();
        initCollapseHandler();
        initHrefHandler();
        initTableWrapper();
        // initNewSiteNotice();
        initGoToTop();

        initInteractiveMap();
        initCalculator();
        initYmap();
        initProductFilters();
        initGoogleTranslate();
        initTopBanners();

        require('./comparison');
        require('./sliders');
        require('./search');
        require('./offcanvas');
        require('./moreLoader');
        require('./forms');
        require('./dynamic-content');

        site.common.initTooltips();

        function initTopBanners() {
            if (document.querySelectorAll('.top-banner').length)
                require.async('./top-banner');
        }

        function initFancybox() {
            require.async("./libs/fancybox")
        }

        function initGoogleTranslate() {
            require.async('./google-translate');
        }

        function initProductFilters() {
            if (document.getElementById('product-filters')) require.async('./filters');
        }

        function initYmap() {
            require.async('./ymaps');
        }

        function initCalculator() {
            if (document.querySelectorAll('.container-calculator').length) require.async('./calculation');
        }

        function initInteractiveMap() {
            if (document.getElementById('custom-map')) require.async('./interactive-map');
        }

        function initGoToTop() {

            const toggleGoTopButton = () => {
                $('.go-top').toggleClass('d-none', window.scrollY < window.innerHeight);
            };

            toggleGoTopButton();

            window.addEventListener('scroll', function () {
                toggleGoTopButton();
            }, { passive: true });

            $('.go-top').on('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }

        // function initNewSiteNotice() {
        //     const element = document.getElementById('isNewSite');

        //     if (element && !sessionStorage.getItem('confirmNewSite')) {
        //         const modal = new bootstrap.Modal(element);

        //         element.addEventListener('hidden.bs.modal', function () {
        //             sessionStorage.setItem('confirmNewSite', 1);
        //         });

        //         modal.show();
        //     }
        // }

        function initTableWrapper() {
            $('.content-block table, .text-block table').each((_, el) => {
                const $el = $(el);
                const $wrapper = $('<div class="table-wrapper"></div>');

                $el.after($wrapper);

                $wrapper.append($el);
            });
        }

        function initHrefHandler() {
            $(document).on('click', '[href*="#"]:not(data-fancybox):not(.no-anchor-link)', function (e) {
                e.preventDefault();
                const href = $(this).attr('href');
                site.common.scrollTo($(href));
            });
        }

        function initCollapseHandler() {
            $(`.collapse`).on('shown.bs.collapse', function (e) {

                if (!$(this).is(e.target)) {
                    return;
                }

                const $target = $(e.currentTarget);

                $(`.slick-slider`, $target).slick('refresh');

                // т.к этот слайдер интерактивный, его надо инициализировать токлько когда откроется ее всплывашка
                site.sliders.initInteractiveSlides(e.currentTarget);
                // console.log(e.currentTarget);
                site.moreLoader.initShowMoreButtons();

                // console.log('to target', $target);

            });

            $(`.collapse`).on('show.bs.collapse', (e) => {
                const $target = $(e.currentTarget);
                const $el = $(`[data-bs-target="#${$target.attr("id")}"`);

                // $el.removeClass("active");

                $(`[data-bs-target="#${$target.attr("id")}"`).addClass("active");

                const toggleText = $el.data('toggle-text');

                if (toggleText) {
                    const actualText = $el.find('span').text();
                    $el.data('toggle-text', actualText)
                    $el.find('span').text(toggleText);
                }

                // if($(`[data-bs-target="#${$target.attr("id")}"`).length == 1){
                // 
                // }

            });

            $(`.collapse`).on('hide.bs.collapse', (e) => {
                const $el = $(`[data-bs-target="#${$(e.currentTarget).attr("id")}"`);

                $el.removeClass("active");

                const toggleText = $el.data('toggle-text');
                if (toggleText) {
                    const actualText = $el.find('span').text();
                    $el.data('toggle-text', actualText)
                    $el.find('span').text(toggleText);
                }

                // window.scrollTo(0, $(e.currentTarget).offset().top - site.common.headerHeigth );
            });

        }

        function initVideoPlayer() {
            const PlayerElements = {};

            window.onYouTubeIframeAPIReady = () => {
                document.querySelectorAll(`.youtube-player`).forEach((el) => {
                    const mainBlock = el.closest('.js-video-block');

                    const player = new YT.Player(el, {
                        height: mainBlock.clientHeight,
                        width: '100%',
                        videoId: el.dataset.youtube,
                        playerVars: {
                            playsinline: 1,
                            enablejsapi: 1,
                            controls: 0,
                            disablekb: 0,
                            loop: 1,
                            modestbranding: false,
                            iv_load_policy: false,
                            cc_load_policy: false,
                            showinfo: false,
                            rel: false,
                            mute: 1,
                            autoplay: 1
                        },
                        events: {
                            'onReady': onPlayerReady,
                            'onStateChange': onPlayerStateChange
                        }
                    });

                    PlayerElements[el.id] = player;

                    function onPlayerReady(event) {
                        event.target.playVideo();
                        event.target.mute();
                        console.log('set', el, event, player);

                    }

                    // var done = false;
                    function onPlayerStateChange(event) {
                        console.log('player state', event.data);
                        // if (event.data == YT.PlayerState.PLAYING && !done) {
                        //     setTimeout(stopVideo, 6000);
                        //     done = true;
                        // }
                    }
                    // function stopVideo() {
                    //     player.stopVideo();
                    // }
                })
            }

            if (document.querySelectorAll(`.youtube-player`).length) {
                // 2. This code loads the IFrame Player API code asynchronously.
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                document.body.insertAdjacentElement('beforeend', tag);
            }

            $(document).on('click', '.js-play-video', ({ currentTarget }) => {
                const targetSelector = $(currentTarget).data('target');
                const innerSelector = $(currentTarget).data('inner');
                const video = $(targetSelector).addClass('js-playing').get(0);
                let fullVideoIsShowing = true;

                const animationComplete = () => {
                    if (video.tagName = 'video') {
                        video.muted = false;
                        video.controls = true;
                        video.play();
                    } else {
                        const player = PlayerElements[video.id];
                        player.stopVideo();
                        player.mute();
                    }
                };

                if (video.tagName == 'video') {
                    video.pause();
                    video.currentTime = 0;

                    video.addEventListener('ended', () => {
                        // при окончании видео возвращаем блок в исходное состояние 
                        if (fullVideoIsShowing) {
                            $(innerSelector).fadeIn(600);
                            video.muted = true;
                            video.controls = false;
                            fullVideoIsShowing = false;
                        }

                        video.currentTime = 0;
                        video.play();

                        $(video).removeClass('js-playing');

                    }, false);
                } else {
                    const player = PlayerElements[video.id];
                    player.seekTo(0);
                    player.unMute();
                }

                $(innerSelector).fadeOut({ duration: 600, done: animationComplete });
            })

        }

        function initPopups() {
            $("#thanks").hide();
            $("#thanks").css('opacity', 1);
        }

        function initAdaptive() {
            // site-content offset
            let headerHeight = document.querySelector('.header')?.clientHeight || 71;
            let footerHeight = document.querySelector('.footer')?.clientHeight || 250;

            site.common.headerHeigth = headerHeight;

            $(':root').css('--header-height', `${headerHeight}px`)
            $(':root').css('--footer-height', `${footerHeight}px`)

            // mobile menu
            $('.header__menu').on('shown.bs.collapse', () => {
                headerHeight = $('.header__menu__container').offset().top - $('.header').offset().top;
                let height = window.innerHeight;
                $('.header__menu__container').css('max-height', `${(height - headerHeight)}px`);
                // $('.header__menu__container').addClass('scrollable');
            })

            // Admin quickpanel fix
            $(document).ready(() => {
                if ($("#u-quickpanel").length) {
                    const top = $("#u-quickpanel").outerHeight();
                    $('.header').css('top', `${top}px`);
                }
            });

        }

    },

    getViewport: function () {
        const width = Math.max(
            document.documentElement.clientWidth,
            window.innerWidth || 0
        );

        if (width <= 576) return 'xs';
        if (width <= 768) return 'sm';
        if (width <= 992) return 'md';
        if (width <= 1200) return 'lg';
        if (width <= 1400) return 'xl';
        if (width <= 1920) return 'xxl';

        return '3xl';
    },

    initTooltips: async function () {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        });
    },

    // Global Methods

    numberFormat: function (number, decimals = 0, dec_point = ',', thousands_sep = ' ') {
        number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
        let n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            s,
            toFixedFix = function (n, prec) {
                let k = Math.pow(10, prec);
                return '' + Math.round(n * k) / k;
            };
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    },

    scrollTo: function ($el) {
        $('html,body').animate({ scrollTop: $el.offset().top - site.common.headerHeigth }, { duration: 100, queue: false });
    },

    // Аргументами функции будут:
    // - функция, которую надо «откладывать»;
    // - интервал времени, спустя которое функцию следует вызывать.
    debounce: function (callee, timeoutMs) {
        return function perform(...args) {
            // В переменной previousCall мы будем хранить
            // временную метку предыдущего вызова...
            let previousCall = this.lastCall

            // ...а в переменной текущего вызова —
            // временную метку нынешнего момента.
            this.lastCall = Date.now()

            // Нам это будет нужно, чтобы потом сравнить,
            // когда была функция вызвана в этот раз и в предыдущий.
            // Если разница между вызовами меньше, чем указанный интервал,
            // то мы очищаем таймаут...
            if (previousCall && this.lastCall - previousCall <= timeoutMs) {
                clearTimeout(this.lastCallTimer)
            }

            // ...который отвечает за непосредственно вызов функции-аргумента.
            // Обратите внимание, что мы передаём все аргументы ...args,
            // который получаем в функции perform —
            // это тоже нужно, чтобы нам не приходилось менять другие части кода.
            this.lastCallTimer = setTimeout(() => callee(...args), timeoutMs)

            // Если таймаут был очищен, вызова не произойдёт
            // если он очищен не был, то callee вызовется.
            // Таким образом мы как бы «отодвигаем» вызов callee
            // до тех пор, пока «снаружи всё не подуспокоится».
        }
    }
}

$(function () {
    site.common.init();
    console.log(`%cBy Herrington © Artix (https://artix.pw).\nGitHub: https://github.com/TVGneRd\nVK: https://vk.com/dima_seledkin\nTG: https://t.me/dima_seledkin`, 'font-size:140%;font-weight:700;');
});
