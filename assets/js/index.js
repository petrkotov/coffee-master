document.addEventListener('DOMContentLoaded', function () {
	const galleryLinks = Array.from(document.querySelectorAll('.recent-work-thumb'));
	const lightbox = document.getElementById('product-lightbox');

	if (!galleryLinks.length || !lightbox) return;

	const lightboxImage = lightbox.querySelector('.product-lightbox-image');
	const lightboxCounter = lightbox.querySelector('.product-lightbox-counter');
	const closeButton = lightbox.querySelector('.product-lightbox-close');
	const prevButton = lightbox.querySelector('.product-lightbox-prev');
	const nextButton = lightbox.querySelector('.product-lightbox-next');

	const images = galleryLinks.map(function (link) {
		const img = link.querySelector('img');
		return {
			src: link.getAttribute('href'),
			alt: img ? (img.getAttribute('alt') || '') : ''
		};
	});

	let activeIndex = 0;

	function renderLightbox() {
		const item = images[activeIndex];
		lightboxImage.src = item.src;
		lightboxImage.alt = item.alt;
		lightboxCounter.textContent = (activeIndex + 1) + ' / ' + images.length;
	}

	function openLightbox(index) {
		activeIndex = index;
		renderLightbox();
		lightbox.classList.add('is-open');
		lightbox.setAttribute('aria-hidden', 'false');
		document.body.classList.add('lightbox-open');
	}

	function closeLightbox() {
		lightbox.classList.remove('is-open');
		lightbox.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('lightbox-open');
	}

	function changeSlide(step) {
		activeIndex = (activeIndex + step + images.length) % images.length;
		renderLightbox();
	}

	galleryLinks.forEach(function (link, index) {
		link.addEventListener('click', function (e) {
			e.preventDefault();
			openLightbox(index);
		});
	});

	closeButton.addEventListener('click', closeLightbox);
	prevButton.addEventListener('click', function () {
		changeSlide(-1);
	});
	nextButton.addEventListener('click', function () {
		changeSlide(1);
	});

	lightbox.addEventListener('click', function (e) {
		if (e.target === lightbox) {
			closeLightbox();
		}
	});

	document.addEventListener('keydown', function (e) {
		if (!lightbox.classList.contains('is-open')) return;

		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowLeft') changeSlide(-1);
		if (e.key === 'ArrowRight') changeSlide(1);
	});
});