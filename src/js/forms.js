import bootstrap from "bootstrap";
import IMask from 'imask';
import "./libs/jquery.autocomplete.min";

window.site.forms = {

    init: function () {
        site.forms.initInputs();

        initOtherCheckBox();
        initSelectHandler();
        initAjaxForm();

        function initSelectHandler() {
            $(document).on('change', '.select-handle', (e) => site.forms.updateSelectHandle(e.target));
            site.forms.updateAllSelectsHandle();
        }

        function initOtherCheckBox() {
            $(document).on('change', '.other-checkbox', function () {
                const selector = $(this).data('for');
                $(selector).toggleClass('d-none', !this.checked);
            });
        }

        function initAjaxForm() {
            $(document).on('submit', '.js-ajax-form', (e) => {
                e.preventDefault();

                const $form = $(e.currentTarget);
                const $submitButton = $('input[type="submit"], button[type="submit"]', $form)
                $submitButton.prop('disabled', 'disabled');

                $form.find('.invalid-feedback').remove();
                $form.find('input, textarea').each((_, el) => el.setCustomValidity(''));
                $form.removeClass('was-validated');

                const onSuccess = (response) => {
                    $form.addClass('was-validated');
                    $submitButton.prop('disabled', '');

                    if (!response) return;

                    if (response.status === 'ok' || response?.data && !response?.data?.error) {
                        site.forms.showThanksPopup();

                        if ($form.data('redirect-on-success')) {
                            setTimeout(() => window.location.replace($form.data('redirect-on-success')), 4000);
                        }

                        if ($form.data('track') && typeof window.ym == 'function') {
                            window.ym(13792897, 'reachGoal', $form.data('track'));
                        }

                        const $offcanvas = $form.closest('.offcanvas');
                        if ($offcanvas.length) bootstrap.Offcanvas.getOrCreateInstance($offcanvas).hide();

                        return;
                    }

                    if (response?.data?.error) {
                        alert(response?.data?.error);
                    }

                    if (response.status === 'error' && response.payload) {
                        const { alertErrors, fieldsErrors } = response.payload;

                        if (alertErrors) {
                            for (const alertMessage of alertErrors) {
                                alert(alertMessage);
                            }
                        }

                        if (fieldsErrors) {

                            for (const fieldName in fieldsErrors) {
                                const $field = $(`input[name="${fieldName}"], textarea[name="${fieldName}"]`, $form);
                                $field.get(0).setCustomValidity('Поле заполнено некорректно');

                                for (const message of fieldsErrors[fieldName]) {
                                    $field.after(`
                                        <div class="invalid-feedback fs-7 text-center">
                                            ${message}
                                        </div>`
                                    );
                                }
                            }

                        }

                        return;
                    }

                };

                const onError = (response) => {
                    alert('Возникла ошибка на стороне сервера. Обратитесь к разработчику.');
                    console.error(response);
                    $submitButton.prop('disabled', '');
                };

                const url = $form.attr('action');

                $.ajax({
                    url: url,
                    data: new FormData(e.currentTarget),
                    dataType: 'json',
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    success: onSuccess,
                    error: onError
                });
            });
        }


    },

    initInputs: function () {

        const maskInstances = new Map();

        require.async('../scss/libs/phone-country-flags.scss');

        const countries = {
            ru: { name: "Россия", code: "+7", mask: "+7 (000) 000-00-00" },
            am: { name: "Армения ", code: "+374", mask: "+374 00-000-000" },
            by: { name: "Беларусь", code: "+375", mask: "+375 (00) 000-00-00" },
            kz: { name: "Казахстан", code: "+7", mask: "+7 (000) 00-00-00" },
            kg: { name: "Кыргызстан ", code: "+996", mask: "+996 (000) 000-000" },
            tj: { name: "Таджикистан ", code: "+992", mask: "+992 00-000-0000" },
            uz: { name: "Узбекистан ", code: "+998", mask: "+998 00-000-0000" },
        }

        document.querySelectorAll(".js-phone-input:not(.initiated)").forEach(input => {
            input.classList.add('initiated');

            const groupEl = input.closest('.input-group');
            const selectCountryEl = groupEl.querySelector('.phone-select-country');
            const togglerEl = groupEl.querySelector('.phone-select-country__toggle');

            $(selectCountryEl, groupEl).append(Object.entries(countries).map(([country, value]) => {
                return `<li class="phone-select-country__item d-flex align-items-center px-2" data-country="${country}">
                            <span class="pcf__flag pcf__${country}"></span>
                            <span class="ms-2 me-5">${value.name}</span>
                            <b class="ms-auto">${value.code}</b>
                        </li>`;
            }));

            $('.phone-select-country__item', selectCountryEl).on('click', function () {
                initImask(this.dataset.country);
            });

            initImask(Object.keys(countries)[0]);

            function initImask(country) {
                input.placeholder = countries[country].mask.replace(/0/g, '_')

                togglerEl.innerHTML = `<span class="pcf__flag pcf__${country}"></span>`;

                if (maskInstances.has(input)) maskInstances.get(input).destroy();

                maskInstances.set(input, new IMask(input, {
                    mask: countries[country].mask,
                    lazy: false,
                    overwrite: true,
                }))
            }
        });

        $(document).on('change', '.js-file-input', (e) => {
            let fileName = '';
            const $el = $(e.currentTarget);
            const id = $el.attr('id');

            fileName = $el.val().split(/(\\|\/)/gm).pop();

            $(`label[for="${id}"]`).text(fileName);

        });
    },

    updateAllSelectsHandle: function () {
        $('.select-handle').each((_, element) => site.forms.updateSelectHandle(element));
    },

    updateSelectHandle: function (selectElement) {
        const targetSelector = $(selectElement).data('enable');
        const $target = $(targetSelector);
        const dataValue = String($(selectElement).data('enable-value'));
        const values = dataValue.includes('|') ? (dataValue || '').split('|') : [dataValue];

        if ($target.length == 0) return;

        if (values.includes($(selectElement).val())) {
            $target.fadeIn(100);
        } else {
            $target.fadeOut(100);
        }
    },

    showThanksPopup: function () {
        $("#thanks").fadeIn(300);
        setTimeout(() => $("#thanks").fadeOut(800), 3000);
    }
}

$(function () {
    site.forms.init();
});
