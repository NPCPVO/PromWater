function initTopBanners() {
    const onIntersect = function (entries, observer) {
        entries.forEach((entry) => {
            if (entry.boundingClientRect.top < 0) {
                if (!entry.isIntersecting) {
                    // entered viewport at the top edge, hence scroll direction is up
                    entry.target.querySelector('.top-banner__wrapper')?.classList.add('top-banner--fixed');
                } else {
                    // left viewport at the top edge, hence scroll direction is down
                    entry.target.querySelector('.top-banner__wrapper')?.classList.remove('top-banner--fixed');
                }
            }
        });
    }
    const observer = new IntersectionObserver(onIntersect, {
        rootMargin: window.getComputedStyle(document.body).getPropertyValue('--header-height'),
        threshold: [0, 1]
    });

    document.querySelectorAll('.top-banner').forEach((el) => {
        observer.observe(el);
    });

}

initTopBanners();