document.addEventListener('DOMContentLoaded', function () {
	const galleries = Array.from(document.querySelectorAll('.product-gallery'));

	if (!galleries.length) return;

	const lightbox = document.getElementById('product-lightbox');
	const hasLightbox = !!lightbox;

	let lightboxImage = null;
	let lightboxCounter = null;
	let closeButton = null;
	let prevButton = null;
	let nextButton = null;

	if (hasLightbox) {
		lightboxImage = lightbox.querySelector('.product-lightbox-image');
		lightboxCounter = lightbox.querySelector('.product-lightbox-counter');
		closeButton = lightbox.querySelector('.product-lightbox-close');
		prevButton = lightbox.querySelector('.product-lightbox-prev');
		nextButton = lightbox.querySelector('.product-lightbox-next');
	}

	let activeGallery = null;
	let activeIndex = 0;

	function normalizeSrc(src) {
		const link = document.createElement('a');
		link.href = src;
		return link.href;
	}

	function buildGalleryImages(gallery) {
		if (gallery._galleryImages) return gallery._galleryImages;

		const mainImage = gallery.querySelector('.product-main-image');
		const thumbs = Array.from(gallery.querySelectorAll('.product-thumb'));
		const images = [];
		const seen = new Set();

		if (!mainImage) {
			gallery._galleryImages = images;
			return images;
		}

		const originalMainSrc = mainImage.getAttribute('src');
		const originalMainAlt = mainImage.getAttribute('alt') || '';

		function addImage(src, alt) {
			if (!src) return;

			const normalized = normalizeSrc(src);
			if (seen.has(normalized)) return;

			seen.add(normalized);
			images.push({
				src: src,
				alt: alt || ''
			});
		}

		addImage(originalMainSrc, originalMainAlt);

		thumbs.forEach(function (thumb, thumbIndex) {
			const thumbImg = thumb.querySelector('img');
			const src = thumb.dataset.image || (thumbImg ? thumbImg.getAttribute('src') : '');
			const alt = thumb.dataset.alt || (thumbImg ? thumbImg.getAttribute('alt') : '') || '';

			thumb.dataset.imageIndex = String(images.length);
			addImage(src, alt);

			// если вдруг картинка не добавилась из-за дубля, всё равно корректно проставим индекс
			const normalized = normalizeSrc(src);
			const actualIndex = images.findIndex(function (item) {
				return normalizeSrc(item.src) === normalized;
			});

			thumb.dataset.imageIndex = String(actualIndex);
		});

		gallery._galleryImages = images;
		return images;
	}

	function updateThumbState(gallery, index) {
		const thumbs = Array.from(gallery.querySelectorAll('.product-thumb'));

		thumbs.forEach(function (thumb) {
			const thumbIndex = Number(thumb.dataset.imageIndex);
			thumb.classList.toggle('is-active', thumbIndex === index);
		});
	}

	function setMainImage(gallery, index) {
		const images = buildGalleryImages(gallery);
		const mainImage = gallery.querySelector('.product-main-image');

		if (!mainImage || !images.length) return;
		if (index < 0 || index >= images.length) return;

		const item = images[index];

		mainImage.src = item.src;
		mainImage.alt = item.alt || '';
		gallery.dataset.currentIndex = String(index);

		updateThumbState(gallery, index);
	}

	function openLightbox(gallery, index) {
		if (!hasLightbox) return;

		const images = buildGalleryImages(gallery);
		if (!images.length) return;

		activeGallery = gallery;
		activeIndex = index;

		renderLightbox();

		lightbox.classList.add('is-open');
		lightbox.setAttribute('aria-hidden', 'false');
		document.body.classList.add('lightbox-open');
	}

	function closeLightbox() {
		if (!hasLightbox) return;

		lightbox.classList.remove('is-open');
		lightbox.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('lightbox-open');

		activeGallery = null;
	}

	function renderLightbox() {
		if (!hasLightbox || !activeGallery) return;

		const images = buildGalleryImages(activeGallery);
		if (!images.length) return;

		const item = images[activeIndex];

		lightboxImage.src = item.src;
		lightboxImage.alt = item.alt || '';
		lightboxCounter.textContent = (activeIndex + 1) + ' / ' + images.length;
	}

	function changeSlide(step) {
		if (!hasLightbox || !activeGallery) return;

		const images = buildGalleryImages(activeGallery);
		if (!images.length) return;

		activeIndex = (activeIndex + step + images.length) % images.length;

		renderLightbox();
		setMainImage(activeGallery, activeIndex);
	}

	galleries.forEach(function (gallery) {
		const mainImage = gallery.querySelector('.product-main-image');
		const thumbs = Array.from(gallery.querySelectorAll('.product-thumb'));
		const images = buildGalleryImages(gallery);

		if (!mainImage || !images.length) return;

		gallery.dataset.currentIndex = '0';
		updateThumbState(gallery, 0);

		thumbs.forEach(function (thumb) {
			thumb.addEventListener('click', function () {
				const index = Number(thumb.dataset.imageIndex);
				setMainImage(gallery, index);
			});
		});

		mainImage.addEventListener('click', function () {
			const currentIndex = Number(gallery.dataset.currentIndex || '0');
			openLightbox(gallery, currentIndex);
		});

		mainImage.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				const currentIndex = Number(gallery.dataset.currentIndex || '0');
				openLightbox(gallery, currentIndex);
			}
		});
	});

	if (hasLightbox) {
		closeButton.addEventListener('click', function () {
			closeLightbox();
		});

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

			if (e.key === 'Escape') {
				closeLightbox();
				return;
			}

			if (e.key === 'ArrowLeft') {
				changeSlide(-1);
				return;
			}

			if (e.key === 'ArrowRight') {
				changeSlide(1);
			}
		});
	}
});