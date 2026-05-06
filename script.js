// ================================================
// main.js — главный скрипт сайта KACHOW
// Все функционалы объединены в один файл
// ================================================

(function () {
  "use strict";

  // ====================== УТИЛИТЫ ======================
  const debounce = (fn, delay) => {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const throttle = (fn, delay) => {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= delay) {
        fn.apply(this, args);
        last = now;
      }
    };
  };

  // ====================== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ======================
  document.addEventListener("DOMContentLoaded", function () {
    // MOBILE BURGER MENU
    const burger = document.getElementById("home-burger-toggle");
    const navMenu = document.getElementById("home-nav-menu");
    const headerContacts = document.querySelector(".header-contacts");

    // Функция клонирования контактов в мобильное меню
    function cloneContactsToMobile() {
      const mobileContainer = document.querySelector(".mobile-contacts-block");
      if (!mobileContainer || !headerContacts) return;

      const clone = headerContacts.cloneNode(true);
      clone.classList.add("mobile-contacts-clone");
      mobileContainer.innerHTML = "";
      mobileContainer.appendChild(clone);
    }

    if (burger && navMenu) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("active");
        navMenu.classList.toggle("active");

        if (navMenu.classList.contains("active")) {
          cloneContactsToMobile();
          document.body.classList.add("no-scroll");
        } else {
          document.body.classList.remove("no-scroll");
        }
      });

      document.querySelectorAll(".home-nav__link").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 768) {
            burger.classList.remove("active");
            navMenu.classList.remove("active");
            document.body.classList.remove("no-scroll");
          }
        });
      });
    }

    // При ресайзе закрываем меню если стало больше 768px
    window.addEventListener("resize", () => {
      if (
        window.innerWidth > 768 &&
        navMenu &&
        navMenu.classList.contains("active")
      ) {
        navMenu.classList.remove("active");
        if (burger) burger.classList.remove("active");
        document.body.classList.remove("no-scroll");
      }
    });

    // --------------------------------------------------------------
    // 2. АККОРДЕОН ДЛЯ WHY SECTION
    // --------------------------------------------------------------
    const accordionItems = document.querySelectorAll(".home-why__item");

    if (accordionItems.length) {
      let isAnimating = false;
      let activeItem = null;

      const isMobile = () => window.innerWidth <= 992;

      const getHeaderOffset = () => {
        const header = document.querySelector("header, .header, .home-header");
        if (header) {
          return header.offsetHeight + 20;
        }
        return 90;
      };

      const closeAllAccordionItems = () => {
        accordionItems.forEach((item) => {
          if (item.classList.contains("active")) {
            item.classList.remove("active");
          }
        });
        activeItem = null;
      };

      const scrollToElement = (element, options = {}) => {
        const { offset = null, behavior = "smooth" } = options;
        let offsetPosition;

        if (isMobile()) {
          const headerOffset = getHeaderOffset();
          const elementPosition = element.getBoundingClientRect().top;
          offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        } else {
          const customOffset = offset !== null ? offset : 100;
          const elementPosition = element.getBoundingClientRect().top;
          offsetPosition = elementPosition + window.pageYOffset - customOffset;
        }

        window.scrollTo({
          top: offsetPosition,
          behavior: behavior,
        });
      };

      const scrollToContentOnMobile = (item) => {
        if (!isMobile()) return;
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          const headerOffset = getHeaderOffset();
          const offsetPosition = rect.top + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 150);
      };

      accordionItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          if (
            e.target.closest(".home-why__item-list li") ||
            e.target.closest(".home-why__item-note") ||
            e.target.closest("h4")
          ) {
            return;
          }

          if (isAnimating) return;

          const isActive = item.classList.contains("active");

          if (isActive) {
            isAnimating = true;
            item.classList.remove("active");
            activeItem = null;
            setTimeout(() => {
              isAnimating = false;
            }, 400);
          } else {
            isAnimating = true;
            closeAllAccordionItems();
            item.classList.add("active");
            activeItem = item;

            if (isMobile()) {
              scrollToContentOnMobile(item);
            } else {
              setTimeout(() => {
                const rect = item.getBoundingClientRect();
                const isFullyVisible =
                  rect.top >= 80 && rect.bottom <= window.innerHeight - 80;
                if (!isFullyVisible) {
                  scrollToElement(item, { offset: 90 });
                }
                setTimeout(() => {
                  isAnimating = false;
                }, 500);
              }, 100);
            }

            if (isMobile()) {
              setTimeout(() => {
                isAnimating = false;
              }, 600);
            }
          }
        });
      });

      window.addEventListener("resize", () => {
        if (activeItem && isMobile()) {
          setTimeout(() => {
            const rect = activeItem.getBoundingClientRect();
            const headerOffset = getHeaderOffset();
            if (rect.top < headerOffset || rect.bottom > window.innerHeight) {
              scrollToElement(activeItem, { offset: headerOffset });
            }
          }, 100);
        }
      });

      if (isMobile()) {
        let touchStartY = 0;
        document.addEventListener("touchstart", (e) => {
          touchStartY = e.touches[0].clientY;
        });
        document.addEventListener("touchend", (e) => {
          const touchEndY = e.changedTouches[0].clientY;
          const deltaY = touchEndY - touchStartY;
          if (deltaY < -50 && activeItem && isMobile()) {
            setTimeout(() => {
              const rect = activeItem.getBoundingClientRect();
              const headerOffset = getHeaderOffset();
              if (rect.top < headerOffset) {
                scrollToElement(activeItem, { offset: headerOffset });
              }
            }, 50);
          }
        });
      }
    }

    // --------------------------------------------------------------
    // 3. COMPARISON SLIDER (Before / After)
    // --------------------------------------------------------------
    const comparisonContainer = document.getElementById("comparisonContainer");
    const divider = document.getElementById("divider");
    const handle = document.getElementById("handle");

    if (comparisonContainer && divider && handle) {
      const rightImage = comparisonContainer.querySelector(
        ".comparison-slider__img--right"
      );
      let isDragging = false;
      let rafId = null;

      function moveSlider(clientX) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = comparisonContainer.getBoundingClientRect();
          let x = Math.max(0, Math.min(clientX - rect.left, rect.width));
          const percent = (x / rect.width) * 100;
          divider.style.left = percent + "%";
          if (rightImage) {
            rightImage.style.clipPath = `inset(0 0 0 ${percent}%)`;
          }
          rafId = null;
        });
      }

      const startDragging = (e) => {
        isDragging = true;
        e.preventDefault();
      };

      const stopDragging = () => {
        isDragging = false;
      };

      const drag = throttle((e) => {
        if (isDragging) {
          e.preventDefault();
          moveSlider(e.clientX);
        }
      }, 16);

      const startTouch = (e) => {
        isDragging = true;
        e.preventDefault();
      };

      const dragTouch = throttle((e) => {
        if (isDragging) {
          e.preventDefault();
          moveSlider(e.touches[0].clientX);
        }
      }, 16);

      handle.addEventListener("mousedown", startDragging);
      document.addEventListener("mouseup", stopDragging);
      document.addEventListener("mousemove", drag);
      handle.addEventListener("touchstart", startTouch, { passive: false });
      document.addEventListener("touchend", stopDragging);
      document.addEventListener("touchmove", dragTouch, { passive: false });

      const initialPercent = 50;
      divider.style.left = initialPercent + "%";
      if (rightImage) {
        rightImage.style.clipPath = `inset(0 0 0 ${initialPercent}%)`;
      }
    }

    // --------------------------------------------------------------
    // 4. CONTACT MODAL — модальное окно с контактами
    // --------------------------------------------------------------
    const modal = document.getElementById("contactModal");
    if (modal) {
      const overlay = document.getElementById("modalOverlay");
      const closeBtn = document.getElementById("modalClose");
      const floatingContactBtn = document.getElementById("floatingContactBtn");

      const contactLinks = document.querySelectorAll(
        'a[href="#contact"], .home-nav__link[href*="contact"]'
      );

      let scrollBlockCounter = 0;

      function lockBodyScroll() {
        const burgerMenu = document.getElementById("home-nav-menu");
        const isBurgerOpen = burgerMenu?.classList.contains("active");

        if (!isBurgerOpen) {
          const scrollY = window.scrollY;
          document.body.style.position = "fixed";
          document.body.style.top = `-${scrollY}px`;
          document.body.style.width = "100%";
          document.body.style.overflow = "hidden";
          document.body.dataset.scrollY = scrollY;
        } else {
          document.body.style.overflow = "hidden";
        }
        scrollBlockCounter++;
      }

      function unlockBodyScroll() {
        scrollBlockCounter--;
        if (scrollBlockCounter === 0) {
          const burgerMenu = document.getElementById("home-nav-menu");
          const isBurgerOpen = burgerMenu?.classList.contains("active");
          if (!isBurgerOpen) {
            const scrollY = document.body.dataset.scrollY;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            if (scrollY) {
              window.scrollTo(0, parseInt(scrollY));
              delete document.body.dataset.scrollY;
            }
          } else {
            document.body.style.overflow = "";
          }
        }
      }

      function openModal() {
        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("active"), 20);
        lockBodyScroll();
      }

      function closeModal() {
        modal.classList.remove("active");
        setTimeout(() => {
          modal.style.display = "none";
          unlockBodyScroll();
        }, 400);
      }

      contactLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          if (link.getAttribute("href")?.includes("#contact")) {
            e.preventDefault();
          }
          openModal();
        });
      });

      if (floatingContactBtn) {
        floatingContactBtn.addEventListener("click", (e) => {
          e.preventDefault();
          openModal();
        });
      }

      closeBtn?.addEventListener("click", closeModal);
      overlay?.addEventListener("click", closeModal);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
          closeModal();
        }
      });
    }

    // --------------------------------------------------------------
    // 5. КАЛЬКУЛЯТОР АВТО
    // --------------------------------------------------------------
    const calculatorExists = document.getElementById("calculator");

    if (calculatorExists) {
      let eurRate = 3.33;
      let usdRate = 2.82;
      let calculationTimeout = null;

      const elements = {
        country: document.getElementById("country"),
        price: document.getElementById("price"),
        currency: document.getElementById("currency"),
        year: document.getElementById("year"),
        volume: document.getElementById("volume"),
        engineType: document.getElementById("engineType"),
        evQuota: document.getElementById("evQuota"),
        discount50: document.getElementById("discount50"),
        totalByn: document.getElementById("totalByn"),
        finalTotal: document.getElementById("finalTotal"),
        breakdown: document.getElementById("breakdown"),
        liveEur: document.getElementById("liveEur"),
        rateInfo: document.getElementById("rateInfo"),
      };

      async function loadRates() {
        try {
          const res = await fetch(
            "https://api.nbrb.by/exrates/rates?periodicity=0"
          );
          const data = await res.json();
          const eurObj = data.find((item) => item.Cur_Abbreviation === "EUR");
          const usdObj = data.find((item) => item.Cur_Abbreviation === "USD");
          if (eurObj) eurRate = eurObj.Cur_OfficialRate;
          if (usdObj) usdRate = usdObj.Cur_OfficialRate;
          if (elements.liveEur)
            elements.liveEur.textContent = eurRate.toFixed(4);
          if (elements.rateInfo) {
            elements.rateInfo.innerHTML = `Курс НБРБ на ${new Date().toLocaleDateString(
              "ru-RU"
            )} • EUR ${eurRate.toFixed(4)} • USD ${usdRate.toFixed(4)}`;
          }
          calculate();
        } catch (e) {
          console.warn("API НБРБ недоступен — используем резервный курс");
          calculate();
        }
      }

      function calculate() {
        if (calculationTimeout) clearTimeout(calculationTimeout);
        calculationTimeout = setTimeout(() => {
          if (!elements.country || !elements.price) return;
          const country = elements.country.value;
          let priceInput = parseFloat(elements.price.value) || 0;
          const inputCurrency = elements.currency.value;
          const year = parseInt(elements.year.value) || 2026;
          const volume = parseFloat(elements.volume.value) || 0;
          const engineType = elements.engineType.value;
          const isEV = elements.evQuota?.checked && engineType === "electric";
          const has50Discount = elements.discount50?.checked;
          const age = Math.max(0, 2026 - year);
          let priceByn = priceInput;
          if (inputCurrency === "EUR") priceByn = priceInput * eurRate;
          else if (inputCurrency === "USD") priceByn = priceInput * usdRate;
          const deliveryRates = {
            europe: 1800 * eurRate,
            usa: 3400 * eurRate,
            china: 2400 * eurRate,
            korea: 2100 * eurRate,
          };
          let deliveryByn = deliveryRates[country] || 2600 * eurRate;
          let dutyEur = 0;
          if (!isEV) {
            const priceEur = priceByn / eurRate;
            if (age < 3) {
              if (priceEur <= 8500)
                dutyEur = Math.max(priceEur * 0.54, volume * 2.5);
              else if (priceEur <= 16700)
                dutyEur = Math.max(priceEur * 0.48, volume * 3.5);
              else if (priceEur <= 42300)
                dutyEur = Math.max(priceEur * 0.48, volume * 5.5);
              else if (priceEur <= 84500)
                dutyEur = Math.max(priceEur * 0.48, volume * 7.5);
              else dutyEur = Math.max(priceEur * 0.48, volume * 15);
            } else if (age < 5) {
              if (volume <= 1000) dutyEur = volume * 1.5;
              else if (volume <= 1500) dutyEur = volume * 1.7;
              else if (volume <= 1800) dutyEur = volume * 2.5;
              else if (volume <= 2300) dutyEur = volume * 2.7;
              else if (volume <= 3000) dutyEur = volume * 3.0;
              else dutyEur = volume * 3.6;
            } else {
              if (volume <= 1000) dutyEur = volume * 3.0;
              else if (volume <= 1500) dutyEur = volume * 3.2;
              else if (volume <= 1800) dutyEur = volume * 3.5;
              else if (volume <= 2300) dutyEur = volume * 4.8;
              else if (volume <= 3000) dutyEur = volume * 5.0;
              else dutyEur = volume * 5.7;
            }
          }
          if (has50Discount) dutyEur *= 0.5;
          const dutyByn = dutyEur * eurRate;
          const ndsByn = (priceByn + dutyByn) * 0.2;
          const utilByn = age < 3 ? 544.5 : 1089;
          const customsByn = 120;
          const totalByn = Math.round(
            priceByn + deliveryByn + dutyByn + ndsByn + utilByn + customsByn
          );
          const formattedTotal = totalByn.toLocaleString("ru-RU") + " BYN";
          if (elements.totalByn) elements.totalByn.textContent = formattedTotal;
          if (elements.finalTotal)
            elements.finalTotal.textContent = formattedTotal;
          if (elements.breakdown) {
            elements.breakdown.innerHTML = `
              <div class="breakdown-row"><span>Стоимость автомобиля</span><span>${priceByn.toLocaleString(
                "ru-RU"
              )} BYN</span></div>
              <div class="breakdown-row"><span>Доставка</span><span>${Math.round(
                deliveryByn
              ).toLocaleString("ru-RU")} BYN</span></div>
              <div class="breakdown-row"><span>Таможенная пошлина ${
                has50Discount ? "(−50%)" : ""
              }</span><span>${Math.round(dutyByn).toLocaleString(
              "ru-RU"
            )} BYN</span></div>
              <div class="breakdown-row"><span>НДС 20%</span><span>${Math.round(
                ndsByn
              ).toLocaleString("ru-RU")} BYN</span></div>
              <div class="breakdown-row"><span>Утилизационный сбор</span><span>${utilByn.toFixed(
                0
              )} BYN</span></div>
              <div class="breakdown-row"><span>Таможенный сбор</span><span>${customsByn} BYN</span></div>
            `;
          }
        }, 100);
      }

      const calculator = document.getElementById("calculator");
      if (calculator) {
        calculator.addEventListener("input", (e) => {
          if (e.target.matches("input, select")) calculate();
        });
      }
      loadRates();
    }

    // --------------------------------------------------------------
    // 6. KACHOW CAR SLIDER
    // --------------------------------------------------------------
    (function () {
      const track = document.getElementById("illustrationTrack");
      const prevBtn = document.getElementById("illustrationPrevBtn");
      const nextBtn = document.getElementById("illustrationNextBtn");
      const dotsContainer = document.getElementById("illustrationDots");
      if (!track) return;
      const slides = Array.from(track.children);
      const slideCount = slides.length;
      let currentIndex = 0;
      let autoTimer = null;
      let startX = 0;
      let isDragging = false;
      let currentTranslate = 0;
      const GAP = 24;
      const AUTO_DELAY = 4000;
      function getVisibleSlides() {
        const width = window.innerWidth;
        if (width <= 480) return 1;
        if (width <= 768) return 2;
        return 3;
      }
      function getSlideWidth() {
        const container = track.parentElement;
        const containerWidth = container.clientWidth - 20;
        const visible = getVisibleSlides();
        return (containerWidth - GAP * (visible - 1)) / visible;
      }
      function setSlidesWidth() {
        const slideWidth = getSlideWidth();
        slides.forEach((slide) => {
          slide.style.width = `${slideWidth}px`;
          slide.style.flex = `0 0 ${slideWidth}px`;
        });
      }
      function goToSlide(index, smooth = true) {
        const visible = getVisibleSlides();
        const maxIndex = Math.max(0, slideCount - visible);
        if (index < 0) index = 0;
        if (index > maxIndex) index = maxIndex;
        currentIndex = index;
        const slideWidth = getSlideWidth();
        const newPosition = -(index * (slideWidth + GAP));
        track.style.transition = smooth
          ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          : "none";
        track.style.transform = `translateX(${newPosition}px)`;
        updateDots();
      }
      function nextSlide() {
        const visible = getVisibleSlides();
        const maxIndex = Math.max(0, slideCount - visible);
        if (currentIndex < maxIndex) goToSlide(currentIndex + 1);
        else goToSlide(0);
      }
      function prevSlide() {
        if (currentIndex > 0) goToSlide(currentIndex - 1);
        else {
          const visible = getVisibleSlides();
          const maxIndex = Math.max(0, slideCount - visible);
          goToSlide(maxIndex);
        }
      }
      function updateDots() {
        if (!dotsContainer) return;
        const visible = getVisibleSlides();
        const dotsCount = Math.ceil(slideCount / visible);
        const activeDotIndex = Math.floor(currentIndex / visible);
        dotsContainer.innerHTML = "";
        for (let i = 0; i < dotsCount; i++) {
          const dot = document.createElement("button");
          dot.className = "illustration-cars__dot";
          if (i === activeDotIndex) dot.classList.add("active");
          dot.addEventListener("click", () => {
            stopAutoPlay();
            goToSlide(i * visible);
            startAutoPlay();
          });
          dotsContainer.appendChild(dot);
        }
      }
      function startAutoPlay() {
        stopAutoPlay();
        autoTimer = setInterval(() => {
          if (!isDragging) nextSlide();
        }, AUTO_DELAY);
      }
      function stopAutoPlay() {
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      }
      function onDragStart(e) {
        stopAutoPlay();
        isDragging = true;
        startX = e.type === "mousedown" ? e.pageX : e.touches[0].clientX;
        currentTranslate = currentIndex * (getSlideWidth() + GAP);
        track.style.transition = "none";
      }
      function onDragMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const currentX =
          e.type === "mousemove" ? e.pageX : e.touches[0].clientX;
        const diff = currentX - startX;
        const newTranslate = currentTranslate - diff;
        track.style.transform = `translateX(${-newTranslate}px)`;
      }
      function onDragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        const endX =
          e.type === "mouseup"
            ? e.pageX
            : e.changedTouches?.[0]?.clientX || startX;
        const diff = endX - startX;
        const movedSlides = Math.round(diff / (getSlideWidth() + GAP));
        let newIndex = currentIndex - movedSlides;
        const visible = getVisibleSlides();
        const maxIndex = Math.max(0, slideCount - visible);
        newIndex = Math.max(0, Math.min(newIndex, maxIndex));
        goToSlide(newIndex, true);
        startAutoPlay();
      }
      let resizeTimer;
      function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          setSlidesWidth();
          goToSlide(currentIndex, false);
          updateDots();
        }, 200);
      }
      function setupButtons() {
        if (prevBtn && nextBtn) {
          const newPrev = prevBtn.cloneNode(true);
          const newNext = nextBtn.cloneNode(true);
          prevBtn.parentNode.replaceChild(newPrev, prevBtn);
          nextBtn.parentNode.replaceChild(newNext, nextBtn);
          newPrev.addEventListener("click", (e) => {
            e.preventDefault();
            stopAutoPlay();
            prevSlide();
            startAutoPlay();
          });
          newNext.addEventListener("click", (e) => {
            e.preventDefault();
            stopAutoPlay();
            nextSlide();
            startAutoPlay();
          });
        }
      }
      function init() {
        setSlidesWidth();
        goToSlide(0, false);
        setupButtons();
        startAutoPlay();
        track.addEventListener("mousedown", onDragStart);
        track.addEventListener("mousemove", onDragMove);
        track.addEventListener("mouseup", onDragEnd);
        track.addEventListener("touchstart", onDragStart, { passive: false });
        track.addEventListener("touchmove", onDragMove, { passive: false });
        track.addEventListener("touchend", onDragEnd);
        const slider = document.querySelector(".illustration-cars");
        if (slider) {
          slider.addEventListener("mouseenter", stopAutoPlay);
          slider.addEventListener("mouseleave", startAutoPlay);
        }
        window.addEventListener("resize", handleResize);
      }
      const images = track.querySelectorAll("img");
      if (images.length === 0) init();
      else {
        let loaded = 0;
        const checkInit = () => {
          loaded++;
          if (loaded === images.length) setTimeout(init, 100);
        };
        images.forEach((img) => {
          if (img.complete && img.naturalWidth > 0) checkInit();
          else {
            img.addEventListener("load", checkInit);
            img.addEventListener("error", checkInit);
          }
        });
      }
    })();

    // --------------------------------------------------------------
    // 7. TESTIMONIALS CAROUSEL
    // --------------------------------------------------------------
    const testimonialsCarousel = document.getElementById(
      "testimonialsCarousel"
    );
    const prevTestimonialBtn = document.getElementById("prevTestimonialBtn");
    const nextTestimonialBtn = document.getElementById("nextTestimonialBtn");
    const progressContainer = document.getElementById("progressDots");
    if (testimonialsCarousel && prevTestimonialBtn && nextTestimonialBtn) {
      let cards = Array.from(
        document.querySelectorAll(".home-testimonials__card")
      );
      let currentIndex = 0;
      let autoPlayInterval;
      let isTransitioning = false;
      function getCardsPerView() {
        const w = window.innerWidth;
        if (w <= 640) return 1;
        if (w <= 992) return 2;
        return 3;
      }
      function getCardWidth() {
        const container = testimonialsCarousel.parentElement;
        const gap = 30;
        const cardsPerView = getCardsPerView();
        const containerWidth = container.clientWidth - 40;
        return (containerWidth - gap * (cardsPerView - 1)) / cardsPerView;
      }
      function updateCardWidths() {
        const w = getCardWidth();
        cards.forEach((c) => (c.style.flex = `0 0 ${w}px`));
      }
      function updateCarousel(animate = true) {
        if (isTransitioning && animate) return;
        const cardWidth = getCardWidth();
        const gap = 30;
        const offset = currentIndex * (cardWidth + gap);
        if (animate) {
          isTransitioning = true;
          testimonialsCarousel.style.transition =
            "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          testimonialsCarousel.style.transform = `translateX(-${offset}px)`;
          setTimeout(() => {
            isTransitioning = false;
          }, 500);
        } else {
          testimonialsCarousel.style.transition = "none";
          testimonialsCarousel.style.transform = `translateX(-${offset}px)`;
          setTimeout(() => {
            testimonialsCarousel.style.transition =
              "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          }, 50);
        }
        updateProgressDots();
      }
      function nextSlide() {
        if (isTransitioning) return;
        const cardsPerView = getCardsPerView();
        const maxIndex = cards.length - cardsPerView;
        if (currentIndex < maxIndex) {
          currentIndex++;
          updateCarousel(true);
        } else if (currentIndex >= maxIndex) {
          currentIndex = 0;
          updateCarousel(false);
          setTimeout(() => updateCarousel(true), 50);
        }
      }
      function prevSlide() {
        if (isTransitioning) return;
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel(true);
        } else if (currentIndex === 0) {
          const cardsPerView = getCardsPerView();
          const maxIndex = cards.length - cardsPerView;
          currentIndex = maxIndex;
          updateCarousel(false);
          setTimeout(() => updateCarousel(true), 50);
        }
      }
      function updateProgressDots() {
        if (!progressContainer) return;
        const cardsPerView = getCardsPerView();
        const totalDots = Math.ceil(cards.length / cardsPerView);
        const activeDot = Math.floor(currentIndex / cardsPerView);
        progressContainer.innerHTML = "";
        for (let i = 0; i < totalDots; i++) {
          const dot = document.createElement("div");
          dot.classList.add("home-testimonials__dot");
          if (i === activeDot) dot.classList.add("active");
          dot.addEventListener("click", () => {
            if (isTransitioning) return;
            currentIndex = i * cardsPerView;
            updateCarousel(true);
            resetAutoPlay();
          });
          progressContainer.appendChild(dot);
        }
      }
      function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => nextSlide(), 5000);
      }
      function stopAutoPlay() {
        if (autoPlayInterval) {
          clearInterval(autoPlayInterval);
          autoPlayInterval = null;
        }
      }
      function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
      }
      function initTestimonialsCarousel() {
        updateCardWidths();
        updateCarousel(false);
        startAutoPlay();
        let resizeTimer;
        window.addEventListener("resize", () => {
          stopAutoPlay();
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            updateCardWidths();
            updateCarousel(false);
            startAutoPlay();
          }, 200);
        });
        const wrapper = document.querySelector(
          ".home-testimonials__carousel-wrapper"
        );
        if (wrapper) {
          wrapper.addEventListener("mouseenter", stopAutoPlay);
          wrapper.addEventListener("mouseleave", startAutoPlay);
        }
        prevTestimonialBtn.addEventListener("click", (e) => {
          e.preventDefault();
          stopAutoPlay();
          prevSlide();
          startAutoPlay();
        });
        nextTestimonialBtn.addEventListener("click", (e) => {
          e.preventDefault();
          stopAutoPlay();
          nextSlide();
          startAutoPlay();
        });
      }
      initTestimonialsCarousel();
    }

    // --------------------------------------------------------------
    // 8. АНИМАЦИЯ ПОЯВЛЕНИЯ КАРТОЧЕК ПРИ СКРОЛЛЕ (стили в CSS)
    // --------------------------------------------------------------
    const observerOptions = { threshold: 0.2, rootMargin: "50px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0) rotateX(0)";
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    document.querySelectorAll(".why-choose__card").forEach((card) => {
      observer.observe(card);
    });

    // --------------------------------------------------------------
    // 9. ПАРАЛЛАКС ЭФФЕКТ ДЛЯ КАРТОЧЕК
    // --------------------------------------------------------------
    const cards = document.querySelectorAll(".why-choose__card");
    if (cards.length) {
      const handleMouseMove = throttle((card, e) => {
        if (!card.isConnected) return;
        const rect = card.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        requestAnimationFrame(() => {
          card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
      }, 30);
      cards.forEach((card) => {
        card.addEventListener("mousemove", (e) => handleMouseMove(card, e));
        card.addEventListener("mouseleave", () => {
          card.style.transform = "translateY(0) rotateX(0) rotateY(0)";
        });
      });
    }

    // --------------------------------------------------------------
    // 10. LAZY LOADING ДЛЯ ИЗОБРАЖЕНИЙ
    // --------------------------------------------------------------
    const lazyImages = document.querySelectorAll("img:not([loading])");
    lazyImages.forEach((img) => {
      img.loading = "lazy";
    });
  });

  // --------------------------------------------------------------
  // 11. КНОПКА СКРОЛЛА НАВЕРХ (стили в CSS)
  // --------------------------------------------------------------
  (function initScrollToTop() {
    function createScrollButton() {
      const btn = document.createElement("button");
      btn.id = "scrollToTopBtn";
      btn.className = "scroll-to-top";
      btn.setAttribute("aria-label", "Прокрутить наверх");
      btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 4l-8 8h6v8h4v-8h6z"/></svg>`;
      document.body.appendChild(btn);
    }
    let scrollBtn = document.getElementById("scrollToTopBtn");
    if (!scrollBtn) {
      createScrollButton();
      scrollBtn = document.getElementById("scrollToTopBtn");
    }
    const headerElement = document.querySelector(".home-header");
    function scrollToHeader() {
      if (headerElement)
        headerElement.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
    function toggleButtonVisibility() {
      if (scrollBtn) {
        if (window.scrollY > 400) scrollBtn.classList.add("show");
        else scrollBtn.classList.remove("show");
      }
    }
    if (scrollBtn) scrollBtn.addEventListener("click", scrollToHeader);
    window.addEventListener("scroll", toggleButtonVisibility);
    toggleButtonVisibility();
  })();

  // ====================== ФУНКЦИИ ДЛЯ МОДАЛЬНОГО ОКНА ФОРМЫ ======================
  function attachFormHandler(form) {
    if (!form) return;
    const oldHandler = form._submitHandler;
    if (oldHandler) form.removeEventListener("submit", oldHandler);
    const submitHandler = async function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const submitButton = form.querySelector(".send-button");
      if (!submitButton) return;
      const originalButtonHTML = submitButton.innerHTML;
      const name = form.querySelector('input[name="name"]')?.value.trim() || "";
      const phone =
        form.querySelector('input[name="phone"]')?.value.trim() || "";
      const email =
        form.querySelector('input[name="email"]')?.value.trim() || "";
      if (!name || name.length < 2) {
        alert("👤 Пожалуйста, введите корректное имя (минимум 2 символа)");
        return;
      }
      if (!phone || phone.length < 10) {
        alert("📞 Пожалуйста, введите корректный номер телефона");
        return;
      }
      if (!email || !email.includes("@") || !email.includes(".")) {
        alert("✉️ Пожалуйста, введите корректный Email");
        return;
      }
      submitButton.disabled = true;
      submitButton.innerHTML = "⏳ ОТПРАВКА... 🏁";
      try {
        const response = await fetch("telegram.php", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
        const result = await response.json();
        if (result.success) {
          form.style.display = "none";
          const thanksBlock = form.parentElement?.querySelector("#thanksBlock");
          if (thanksBlock) thanksBlock.style.display = "block";
          form.reset();
          setTimeout(() => {
            const modal = document.getElementById("modalForm");
            if (modal && modal.style.display === "block") {
              modal.style.display = "none";
              document.body.style.overflow = "auto";
            }
          }, 3000);
        } else {
          const errorMsg = result.errors
            ? result.errors.join("\n")
            : "Произошла ошибка";
          alert("❌ Ошибка:\n" + errorMsg);
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHTML;
        }
      } catch (error) {
        console.error("Ошибка:", error);
        let errorMessage = "⚠️ Ошибка соединения. ";
        if (error.message.includes("405"))
          errorMessage +=
            "Сервер не отвечает. Убедитесь, что PHP сервер запущен.";
        else if (error.message.includes("Failed to fetch"))
          errorMessage += "Не удалось соединиться с сервером.";
        else errorMessage += "Попробуйте позже.";
        alert(errorMessage);
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHTML;
      }
    };
    form._submitHandler = submitHandler;
    form.addEventListener("submit", submitHandler);
  }

  // Открытие модального окна с формой
  document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("modalForm");
    const modalContainer = document.getElementById("modalFormContainer");
    const ctaButton = document.querySelectorAll(".home-hero__cta");
    const closeBtn = document.querySelector(".modal-close");

    // Убираем селектор originalForm, так как форма скрыта

    // Привязываем обработчик к оригинальной форме (если она есть на странице)
    const originalFormElement = document.getElementById("feedbackForm");
    if (originalFormElement) attachFormHandler(originalFormElement);

    if (ctaButton && modal && modalContainer) {
      ctaButton.forEach((btn) => {
        btn.addEventListener("click", function (e) {
          e.preventDefault();

          // Каждый раз при клике создаем свежую копию формы
          // Ищем оригинальную форму (она скрыта на странице)
          const sourceForm = document.getElementById("formFeedbackContainer");
          if (sourceForm) {
            modalContainer.innerHTML = "";
            const formClone = sourceForm.cloneNode(true);
            modalContainer.appendChild(formClone);

            // Делаем клон видимым
            const clonedFormContainer =
              modalContainer.querySelector(".form-feedback");
            if (clonedFormContainer) {
              clonedFormContainer.style.display = "block";
            }

            // Привязываем обработчик к клонированной форме
            const clonedForm = modalContainer.querySelector("#feedbackForm");
            if (clonedForm) attachFormHandler(clonedForm);
          }

          modal.style.display = "block";
          document.body.style.overflow = "hidden";
        });
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        const modalElem = document.getElementById("modalForm");
        if (modalElem) {
          modalElem.style.display = "none";
          document.body.style.overflow = "auto";
        }
      });
    }

    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          modal.style.display = "none";
          document.body.style.overflow = "auto";
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      const modalElem = document.getElementById("modalForm");
      if (
        e.key === "Escape" &&
        modalElem &&
        modalElem.style.display === "block"
      ) {
        modalElem.style.display = "none";
        document.body.style.overflow = "auto";
      }
    });
  });
})();
