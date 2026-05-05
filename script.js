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
    // --------------------------------------------------------------
    // 1. MOBILE BURGER MENU — мобильное меню (бургер)
    // --------------------------------------------------------------
    const burger = document.getElementById("home-burger-toggle");
    const navMenu = document.getElementById("home-nav-menu");

    if (burger && navMenu) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("active");
        navMenu.classList.toggle("active");

        // Добавляем/удаляем класс на body для блокировки скролла
        if (navMenu.classList.contains("active")) {
          document.body.classList.add("no-scroll");
        } else {
          document.body.classList.remove("no-scroll");
        }
      });

      document.querySelectorAll(".home-nav__link").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth < 993) {
            burger.classList.remove("active");
            navMenu.classList.remove("active");
            document.body.classList.remove("no-scroll"); // Удаляем класс
          }
        });
      });
    }

    // --------------------------------------------------------------
    // 2. АККОРДЕОН ДЛЯ WHY SECTION — плавный без дёрганий (рекомендуемый)
    // --------------------------------------------------------------
    const accordionItems = document.querySelectorAll(".home-why__item");

    if (accordionItems.length) {
      let isAnimating = false;
      let activeItem = null;

      const closeAllAccordionItems = () => {
        accordionItems.forEach((item) => {
          if (item.classList.contains("active")) {
            item.classList.remove("active");
          }
        });
        activeItem = null;
      };

      // Функция для плавного скролла к элементу
      const scrollToElement = (element, offset = 100) => {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      };

      accordionItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          // Игнорируем клики по внутреннему контенту
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
            // Просто закрываем без скролла
            isAnimating = true;
            item.classList.remove("active");
            activeItem = null;

            setTimeout(() => {
              isAnimating = false;
            }, 400);
          } else {
            // Закрываем все и открываем новый
            isAnimating = true;
            closeAllAccordionItems();
            item.classList.add("active");
            activeItem = item;

            // Небольшая задержка перед скроллом для завершения CSS transition
            setTimeout(() => {
              // Проверяем, видна ли карточка полностью
              const rect = item.getBoundingClientRect();
              const isFullyVisible =
                rect.top >= 80 && rect.bottom <= window.innerHeight - 80;

              if (!isFullyVisible) {
                scrollToElement(item, 90);
              }

              setTimeout(() => {
                isAnimating = false;
              }, 500);
            }, 100);
          }
        });
      });

      // При изменении размера окна проверяем активный элемент
      window.addEventListener("resize", () => {
        if (activeItem && window.innerWidth <= 992) {
          setTimeout(() => {
            const rect = activeItem.getBoundingClientRect();
            if (rect.bottom > window.innerHeight || rect.top < 0) {
              scrollToElement(activeItem, 90);
            }
          }, 100);
        }
      });
    }

    // --------------------------------------------------------------
    // 3. COMPARISON SLIDER (Before / After) — слайдер сравнения
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
        'a[href*="contact"], a[href="#contact"], .home-nav__link[href*="contact"]'
      );

      // Функция для безопасной блокировки скролла (учитывая другие блокировки)
      let scrollBlockCounter = 0;

      function lockBodyScroll() {
        const burgerMenu = document.getElementById("home-nav-menu");
        const isBurgerOpen = burgerMenu?.classList.contains("active");

        // Если бургер уже открыт, не перезаписываем его стили
        if (!isBurgerOpen) {
          // Сохраняем текущий scroll position
          const scrollY = window.scrollY;
          document.body.style.position = "fixed";
          document.body.style.top = `-${scrollY}px`;
          document.body.style.width = "100%";
          document.body.style.overflow = "hidden";

          // Сохраняем позицию для восстановления
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
            // Восстанавливаем позицию скролла
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
        lockBodyScroll(); // Используем улучшенную блокировку
      }

      function closeModal() {
        modal.classList.remove("active");
        setTimeout(() => {
          modal.style.display = "none";
          unlockBodyScroll(); // Используем улучшенную разблокировку
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
    // 5. КАЛЬКУЛЯТОР АВТО — расчёт стоимости под ключ
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
          if (
            !elements.country ||
            !elements.price ||
            !elements.currency ||
            !elements.year ||
            !elements.volume ||
            !elements.engineType
          ) {
            return;
          }

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
          if (e.target.matches("input, select")) {
            calculate();
          }
        });
      }

      loadRates();
    }

    // --------------------------------------------------------------
    // 6. KACHOW CAR SLIDER — полностью новый слайдер автомобилей
    // --------------------------------------------------------------
    (function () {
      const track = document.getElementById("illustrationTrack");
      const prevBtn = document.getElementById("illustrationPrevBtn");
      const nextBtn = document.getElementById("illustrationNextBtn");
      const dotsContainer = document.getElementById("illustrationDots");

      // Если слайдера нет на странице — выходим
      if (!track) return;

      const slides = Array.from(track.children);
      const slideCount = slides.length;
      let currentIndex = 0;
      let autoTimer = null;
      let startX = 0;
      let isDragging = false;
      let currentTranslate = 0;

      // Настройки
      const GAP = 24;
      const AUTO_DELAY = 4000;

      // Получаем количество видимых слайдов
      function getVisibleSlides() {
        const width = window.innerWidth;
        if (width <= 480) return 1;
        if (width <= 768) return 2;
        return 3;
      }

      // Вычисляем ширину одного слайда
      function getSlideWidth() {
        const container = track.parentElement;
        const containerWidth = container.clientWidth - 20; // отступы
        const visible = getVisibleSlides();
        return (containerWidth - GAP * (visible - 1)) / visible;
      }

      // Устанавливаем ширину слайдов
      function setSlidesWidth() {
        const slideWidth = getSlideWidth();
        slides.forEach((slide) => {
          slide.style.width = `${slideWidth}px`;
          slide.style.flex = `0 0 ${slideWidth}px`;
        });
      }

      // Перемещение к определённому слайду
      function goToSlide(index, smooth = true) {
        const visible = getVisibleSlides();
        const maxIndex = Math.max(0, slideCount - visible);

        // Ограничиваем индекс
        if (index < 0) index = 0;
        if (index > maxIndex) index = maxIndex;

        currentIndex = index;
        const slideWidth = getSlideWidth();
        const newPosition = -(index * (slideWidth + GAP));

        if (smooth) {
          track.style.transition =
            "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        } else {
          track.style.transition = "none";
        }

        track.style.transform = `translateX(${newPosition}px)`;
        updateDots();
      }

      // Следующий слайд
      function nextSlide() {
        const visible = getVisibleSlides();
        const maxIndex = Math.max(0, slideCount - visible);

        if (currentIndex < maxIndex) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(0);
        }
      }

      // Предыдущий слайд
      function prevSlide() {
        if (currentIndex > 0) {
          goToSlide(currentIndex - 1);
        } else {
          const visible = getVisibleSlides();
          const maxIndex = Math.max(0, slideCount - visible);
          goToSlide(maxIndex);
        }
      }

      // Обновляем индикаторы (dots)
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

      // Автопрокрутка
      function startAutoPlay() {
        stopAutoPlay();
        autoTimer = setInterval(() => {
          if (!isDragging) {
            nextSlide();
          }
        }, AUTO_DELAY);
      }

      function stopAutoPlay() {
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      }

      // Drag and drop для мобильных и ПК
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

      // Обработчик изменения размера окна
      let resizeTimer;
      function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          setSlidesWidth();
          goToSlide(currentIndex, false);
          updateDots();
        }, 200);
      }

      // Обработчики для кнопок
      function setupButtons() {
        if (prevBtn && nextBtn) {
          // Убираем старые обработчики через клонирование
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

      // Инициализация
      function init() {
        setSlidesWidth();
        goToSlide(0, false);
        setupButtons();
        startAutoPlay();

        // Drag and Drop события
        track.addEventListener("mousedown", onDragStart);
        track.addEventListener("mousemove", onDragMove);
        track.addEventListener("mouseup", onDragEnd);
        track.addEventListener("touchstart", onDragStart, { passive: false });
        track.addEventListener("touchmove", onDragMove, { passive: false });
        track.addEventListener("touchend", onDragEnd);

        // Остановка автопрокрутки при наведении
        const slider = document.querySelector(".illustration-cars");
        if (slider) {
          slider.addEventListener("mouseenter", stopAutoPlay);
          slider.addEventListener("mouseleave", startAutoPlay);
        }

        window.addEventListener("resize", handleResize);
      }

      // Ждём загрузки изображений
      const images = track.querySelectorAll("img");
      if (images.length === 0) {
        init();
      } else {
        let loaded = 0;
        const checkInit = () => {
          loaded++;
          if (loaded === images.length) {
            setTimeout(init, 100);
          }
        };

        images.forEach((img) => {
          if (img.complete && img.naturalWidth > 0) {
            checkInit();
          } else {
            img.addEventListener("load", checkInit);
            img.addEventListener("error", checkInit);
          }
        });
      }
    })();

    // --------------------------------------------------------------
    // 7. TESTIMONIALS CAROUSEL — карусель отзывов
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
        const width = window.innerWidth;
        if (width <= 640) return 1;
        if (width <= 992) return 2;
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
        const cardWidth = getCardWidth();
        cards.forEach((card) => {
          card.style.flex = `0 0 ${cardWidth}px`;
        });
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
        autoPlayInterval = setInterval(() => {
          nextSlide();
        }, 5000);
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
    // 8. АНИМАЦИЯ ПОЯВЛЕНИЯ КАРТОЧЕК ПРИ СКРОЛЛЕ
    // --------------------------------------------------------------
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "50px",
    };

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
      card.style.opacity = "0";
      card.style.transform = "translateY(50px) rotateX(-10deg)";
      card.style.transition = "all 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1)";
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
  // 11. КНОПКА СКРОЛЛА НАВЕРХ (левый нижний угол)
  // --------------------------------------------------------------
  (function initScrollToTop() {
    // Функция для создания кнопки, если её нет
    function createScrollButton() {
      const btn = document.createElement("button");
      btn.id = "scrollToTopBtn";
      btn.className = "scroll-to-top";
      btn.setAttribute("aria-label", "Прокрутить наверх");
      btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4l-8 8h6v8h4v-8h6z"/></svg>`;
      document.body.appendChild(btn);

      // Добавляем стили, если их нет
      if (!document.querySelector("#scrollToTopStyles")) {
        const style = document.createElement("style");
        style.id = "scrollToTopStyles";
        style.textContent = `
          .scroll-to-top {
            position: fixed;
            bottom: 30px;
            left: 30px;
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(2px);
          }
          .scroll-to-top:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
            background: linear-gradient(135deg, #c0392b, #a93226);
          }
          .scroll-to-top:active {
            transform: translateY(-2px);
          }
          .scroll-to-top svg {
            width: 26px;
            height: 26px;
            fill: white;
            transition: transform 0.2s;
          }
          .scroll-to-top:hover svg {
            transform: translateY(-3px);
          }
          .scroll-to-top.show {
            opacity: 1;
            visibility: visible;
          }
          @media (max-width: 768px) {
            .scroll-to-top {
              width: 48px;
              height: 48px;
              bottom: 20px;
              left: 20px;
            }
            .scroll-to-top svg {
              width: 24px;
              height: 24px;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }

    // Получаем или создаём кнопку
    let scrollBtn = document.getElementById("scrollToTopBtn");
    if (!scrollBtn) {
      createScrollButton();
      scrollBtn = document.getElementById("scrollToTopBtn");
    }

    const headerElement = document.querySelector(".home-header");

    function scrollToHeader() {
      if (headerElement) {
        headerElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    function toggleButtonVisibility() {
      if (scrollBtn) {
        if (window.scrollY > 400) {
          scrollBtn.classList.add("show");
        } else {
          scrollBtn.classList.remove("show");
        }
      }
    }

    if (scrollBtn) {
      scrollBtn.addEventListener("click", scrollToHeader);
    }
    window.addEventListener("scroll", toggleButtonVisibility);
    toggleButtonVisibility();
  })();
})();
