import '../scss/libs/leaflet.css';
import Leafnet from './libs/leaflet';
import './libs/leaflet.markercluster';

window.site.imap = {
	mapOffcanvas: null,
	apiUrl: window?.developmentEnv?.imap?.apiUrl || '/udata://catalog/getSmartCatalog/null/325/all/0/3//0/.json?extProps=project_coordinates',

	init: async function () {

		initMapToProjects();

		function initOffcanvasSlider() {
			$(".map-offcanvas .slider-preview").slick({
				autoplay: false,
				lazyLoad: 'ondemand',
				slidesToShow: 1,
				asNavFor: '.map-offcanvas .slider-thumb',
				arrows: false,
				draggable: false,
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
			$(".map-offcanvas .slider-thumb").slick({
				lazyLoad: 'ondemand',
				autoplay: false,
				slidesToShow: 3,
				slidesPerRow: 3,
				infinite: true,
				vertical: true,
				verticalSwiping: true,
				focusOnSelect: true,
				asNavFor: '.map-offcanvas .slider-preview',
				arrows: false,
				draggable: true,
			});
		}

		function openProjectOffcanvas(projectId) {

			if (!projectId) return;

			const offcanvasElement = document.getElementById('project-offcanvas');
			const url = "/content/getProjectOffcanvas/" + projectId;

			const successCallback = () => {
				initOffcanvasSlider();
			};

			site.offcanvas.openDynamicOffcanvas(offcanvasElement, url, successCallback);
		}

		function umiPointToLatLng(point) {
			return L.latLng(JSON.parse('[' + point + ']'))
		}

		function initMapToProjects() {
			const mapEl = document.getElementById('custom-map');
			if (!mapEl) return;

			const onIntersect = function (entries, observer) {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					initMap();
					observer.disconnect();
				});
			}
			const observer = new IntersectionObserver(onIntersect, {
				rootMargin: '0px',
				threshold: [0, 0.5]
			});

			observer.observe(mapEl);

			const initMap = () => {
				var mapL = leafletMap();
				var markers = L.markerClusterGroup({ chunkedLoading: true });
				getAllProjectsToMap()
					.done(function (result) {
						for (var key in result.lines.item) {
							const project = result.lines.item[key];
							const { id, text } = project;

							if (project.extended.properties.property[0].id) {
								const point = project.extended.properties.property[0].value.value;

								const marker = L.marker(umiPointToLatLng(point), {
									icon: pwIcon(),
									title: text
								});

								marker.on({
									'click': (e) => {
										mapL.setZoomAround(e.target._latlng, 12, { animate: true });
										openProjectOffcanvas(id);
									},
								});

								markers.addLayer(marker);
							}
						};

						mapL.addLayer(markers);
					});
			}
		}

		function leafletMap() {
			console.log('leaf map innited');

			var map = Leafnet.map('custom-map');
			const focusTo = $('#custom-map').data('focus-to');

			if (focusTo) { // focus point
				map.setView(umiPointToLatLng(focusTo), 12);
			} else { // default point
				map.setView([56.281594, 73.949126], 4);
			}


			L.tileLayer('https://mt1.google.com/vt/lyrs=m@129&hl=ru&x={x}&y={y}&z={z}&s=Galileo', {
				minZoom: 3,
				maxZoom: 18
			}).addTo(map);

			map.scrollWheelZoom.disable();

			return map;
		}

		function getAllProjectsToMap() {
			return (
				$.ajax({
					type: 'get',
					url: site.imap.apiUrl,
					dataType: 'json'
				})
			);
		}

		function pwIcon() {
			return L.divIcon({ className: 'onepoint ', html: "1" });
		}
	}

}

$(function () {
	if ($("#custom-map").length) {
		site.imap.init();
	}
});
