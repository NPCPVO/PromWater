import bootstrap from "bootstrap";

window.site.offcanvas = {

    init: function () {
        initHandlers();

        function initHandlers() {
            $(document).on('click', '.js-open-product-offcanvas', openProductOffcanvas);
            $(document).on('click', '.js-open-part-offcanvas', openPartOffcanvas);
            $(document).on('show.bs.offcanvas', '#order-product-offcanvas, #get-price-product-offcanvas', onOpenOrderProductForm);
        }

        function onOpenOrderProductForm(e) {
            const $el = $(this);
            const $triggerEl = $(e.relatedTarget);
            const productId = $triggerEl.data('product-id');

            if (productId) {
                $el.find('input[name="product"]').val(productId);
            }
        }

        function openPartOffcanvas() {
            const $el = $(this);
            const part = $el.data('element');

            if (!part) return;

            const offcanvasElement = document.getElementById('part-offcanvas');
            const url = "/content/getPartOffcanvas/" + part;

            const successCallback = () => {
                $('.detail-offcanvas__title__number', offcanvasElement).text($el.data('num'));
                site.sliders.initPartOffcanvasSliders();
            };

            site.offcanvas.openDynamicOffcanvas(offcanvasElement, url, successCallback);

        }

        function openProductOffcanvas(event) {
            if (event.target.classList.contains('slick-arrow')) return;

            const $el = $(this);
            const product = $el.data('product');

            if (!product) return;

            const offcanvasElement = document.getElementById('product-addition-offcanvas');
            const url = "/content/getProductOffcanvas/" + product;

            const successCallback = () => {
                site.sliders.initProductOffcanvasSliders();
            };

            site.offcanvas.openDynamicOffcanvas(offcanvasElement, url, successCallback, { backdrop: true });
        }

    },

    openDynamicOffcanvas: function (offcanvasElement, url, successCallback = () => { }, options = {}) {
        const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement, options);

        bsOffcanvas.show();
        $('.js-load-container', offcanvasElement).fadeIn(0);
        $('.offcanvas-body > *', offcanvasElement).not('.js-load-container').remove();

        const onSuccess = function (response) {
            $('.js-load-container', offcanvasElement).fadeOut(0);
            $('.offcanvas-body', offcanvasElement).append(response);

            $(`[data-bs-toggle="tooltip"]`, offcanvasElement).each((_, el) => {
                new bootstrap.Tooltip(el);
            });

            successCallback();
        }

        $.ajax({
            url: url,
            dataType: 'html',
            type: 'POST',
            success: onSuccess,
            error: (e) => console.error(e)
        });

    }
}

$(function () {
    site.offcanvas.init();
});
