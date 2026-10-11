class ImageSlider {
    constructor(containerElement) {
        this.container = containerElement;
        this.track = this.container.querySelector('.slider-track');
        this.slides = Array.from(this.track.children);
        this.nextBtn = this.container.querySelector('#nextBtn');
        this.prevBtn = this.container.querySelector('#prevBtn');
        this.dotsContainer = this.container.querySelector('#sliderDots');

        this.currentIndex = 0;
        this.slideCount = this.slides.length;
        this.isTransitioning = false;

        this.init();
    }

    init() {
        this.setupClones(); // Essential for seamless infinite boundary wrapping
        this.createDots();
        this.updateSlidePosition(false);
        this.bindEvents();
    }

    // Clone first and last slides to enable smooth infinite loop wrapping
    setupClones() {
        this.firstClone = this.slides[0].cloneNode(true);
        this.lastClone = this.slides[this.slideCount - 1].cloneNode(true);

        this.firstClone.id = 'first-clone';
        this.lastClone.id = 'last-clone';

        this.track.appendChild(this.firstClone);
        this.track.insertBefore(this.lastClone, this.slides[0]);

        // Adjust total items count tracked in DOM
        this.allSlides = Array.from(this.track.children);
        this.currentIndex = 1; // Start at real first slide (index 1 due to prepended clone)
    }

    createDots() {
        for (let i = 0; i < this.slideCount; i++) {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            
            dot.addEventListener('click', () => {
                if (this.isTransitioning) return;
                this.currentIndex = i + 1; // Offset by 1 for clone
                this.updateSlidePosition(true);
                this.updateDots();
            });
            
            this.dotsContainer.appendChild(dot);
        }
        this.dots = Array.from(this.dotsContainer.children);
    }

    bindEvents() {
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.prevBtn.addEventListener('click', () => this.prevSlide());

        // Handle hardware-accelerated clean boundary snap after transition finishes
        this.track.addEventListener('transitionend', () => {
            this.isTransitioning = false;
            
            // If on the prepended clone of the last slide, jump instantly (no transition) to the real last slide
            if (this.allSlides[this.currentIndex].id === 'last-clone') {
                this.track.style.transition = 'none';
                this.currentIndex = this.slideCount;
                this.updateSlidePosition(false);
            }

            // If on the appended clone of the first slide, jump instantly to the real first slide
            if (this.allSlides[this.currentIndex].id === 'first-clone') {
                this.track.style.transition = 'none';
                this.currentIndex = 1;
                this.updateSlidePosition(false);
            }
        });

        // Window resize handling to maintain layout math synchronization
        window.addEventListener('resize', () => this.updateSlidePosition(false));
    }

    nextSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex++;
        this.updateSlidePosition(true);
        this.updateDots();
    }

    prevSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex--;
        this.updateSlidePosition(true);
        this.updateDots();
    }

    updateSlidePosition(withTransition = true) {
        if (withTransition) {
            this.track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
            this.track.style.transition = 'none';
        }
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;
    }

    updateDots() {
        let activeDotIndex = this.currentIndex - 1;
        
        // Handle wrapper boundaries mapping for dot states
        if (activeDotIndex >= this.slideCount) activeDotIndex = 0;
        if (activeDotIndex < 0) activeDotIndex = this.slideCount - 1;

        this.dots.forEach((dot, index) => {
            if (index === activeDotIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

// Initialize Component on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    const sliderElement = document.querySelector('.slider-container');
    new ImageSlider(sliderElement);
});