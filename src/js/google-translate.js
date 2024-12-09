/*!***************************************************
 * google-translate.js v1.0.3
 * https://Get-Web.Site/
 * author: Vitalii P.
 *****************************************************/

import $ from "jquery";
import "jquery.cookie";

const googleTranslateConfig = {
    /* Original language */
    lang: "ru",
    /* The language we translate into on the first visit*/
    /* Язык, на который переводим при первом посещении */
    // langFirstVisit: 'en',
    /* Если скрипт не работает на поддомене, 
    раскомментируйте и
    укажите основной домен в свойстве domain */
    domain: "prom-water.ru"
};

function TranslateInit() {
    console.debug('TranslateInit');
    if (googleTranslateConfig.langFirstVisit && !$.cookie('googtrans')) {
        // Если установлен язык перевода для первого посещения и куки не назначены
        TranslateCookieHandler("/auto/" + googleTranslateConfig.langFirstVisit);
    }

    let code = TranslateGetCode();

    // Находим флаг с выбранным языком для перевода и добавляем к нему активный класс
    if (document.querySelector('[data-google-lang="' + code + '"]') !== null) {
        document.querySelector('[data-google-lang="' + code + '"]').classList.add('active');
    }
    if (document.querySelector('[data-google-lang-icon="' + code + '"]') !== null) {
        document.querySelector('[data-google-lang-icon="' + code + '"]').classList.add('active');
    }
    if (code == googleTranslateConfig.lang) {
        // Если язык по умолчанию, совпадает с языком на который переводим
        // То очищаем куки
        //TranslateCookieHandler(null, googleTranslateConfig.domain);
    } else {
        console.debug('init google-translate.js');

        require.async("./libs/google-translate.js").then(() => {
            // Инициализируем виджет с языком по умолчанию
            new window.google.translate.TranslateElement({
                pageLanguage: googleTranslateConfig.lang,
            });
        })
    }

    // Вешаем событие  клик на флаги

    TranslateEventHandler('click', '[data-google-lang]', function (e) {

        TranslateCookieHandler("/" + googleTranslateConfig.lang + "/" + e.getAttribute("data-google-lang"), googleTranslateConfig.domain);
        // Перезагружаем страницу
        window.location.reload();
    });
}


function TranslateGetCode() {
    // Если куки нет, то передаем дефолтный язык
    let lang = ($.cookie('googtrans') != undefined && $.cookie('googtrans') != "null") ? $.cookie('googtrans') : googleTranslateConfig.lang;
    return lang.match(/(?!^\/)[^\/]*$/gm)[0];
}

function TranslateCookieHandler(val, domain) {
    $.cookie('googtrans', val, { path: '/' });
    $.cookie("googtrans", val, {
        domain: "." + window.location.hostname,
        path: '/'
    });

    if (domain == "undefined") return;
    // записываем куки для домена, если он назначен в конфиге
    $.cookie("googtrans", val, {
        domain: domain,
        path: '/'
    });

    $.cookie("googtrans", val, {
        domain: "." + domain,
        path: '/'
    });

}

function TranslateEventHandler(event, selector, handler) {
    document.addEventListener(event, function (e) {
        let el = e.target.closest(selector);
        if (el) handler(el);
    });
}

TranslateInit();