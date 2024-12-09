import bootstrap from "bootstrap";

window.site.dynamicContent = {
    init: function () {
        initHandlers();

        function initHandlers() {
            $(document).on('click', '.dynamic-content__toggle', onToggle)
        }

        function onToggle() {
            const $this = $(this);
            const $for = $($this.data('for'));
            const url = $this.data('url');

            const collapse = bootstrap.Collapse.getOrCreateInstance($for);

            if (!$for.hasClass('inited')) {
                $for.get(0).addEventListener('shown.bs.collapse', event => {
                    site.common.scrollTo($for);
                });

                $for.addClass('inited');
            }

            if (collapse) {
                collapse.toggle();
            }

            if (url) {
                loadHtmlContent(url, (responseText) => {
                    $for.html(responseText);
                    site.forms.initInputs();
                });
            }
        }

        function loadHtmlContent(url, onSuccess) {
            $.ajax({
                url: url,
                dataType: 'html',
                type: 'POST',
                success: onSuccess,
                error: (e) => console.error(e)
            });

        }
    }
}

$(function () {
    site.dynamicContent.init();
});