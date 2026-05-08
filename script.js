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
    // const calculatorExists = document.getElementById("calculator");

    // if (calculatorExists) {
    //   let eurRate = 3.33;
    //   let usdRate = 2.82;
    //   let calculationTimeout = null;

    //   const elements = {
    //     country: document.getElementById("country"),
    //     price: document.getElementById("price"),
    //     currency: document.getElementById("currency"),
    //     year: document.getElementById("year"),
    //     volume: document.getElementById("volume"),
    //     engineType: document.getElementById("engineType"),
    //     evQuota: document.getElementById("evQuota"),
    //     discount50: document.getElementById("discount50"),
    //     totalByn: document.getElementById("totalByn"),
    //     finalTotal: document.getElementById("finalTotal"),
    //     breakdown: document.getElementById("breakdown"),
    //     liveEur: document.getElementById("liveEur"),
    //     rateInfo: document.getElementById("rateInfo"),
    //   };

    //   async function loadRates() {
    //     try {
    //       const res = await fetch(
    //         "https://api.nbrb.by/exrates/rates?periodicity=0"
    //       );
    //       const data = await res.json();
    //       const eurObj = data.find((item) => item.Cur_Abbreviation === "EUR");
    //       const usdObj = data.find((item) => item.Cur_Abbreviation === "USD");
    //       if (eurObj) eurRate = eurObj.Cur_OfficialRate;
    //       if (usdObj) usdRate = usdObj.Cur_OfficialRate;
    //       if (elements.liveEur)
    //         elements.liveEur.textContent = eurRate.toFixed(4);
    //       if (elements.rateInfo) {
    //         elements.rateInfo.innerHTML = `Курс НБРБ на ${new Date().toLocaleDateString(
    //           "ru-RU"
    //         )} • EUR ${eurRate.toFixed(4)} • USD ${usdRate.toFixed(4)}`;
    //       }
    //       calculate();
    //     } catch (e) {
    //       console.warn("API НБРБ недоступен — используем резервный курс");
    //       calculate();
    //     }
    //   }

    //   function calculate() {
    //     if (calculationTimeout) clearTimeout(calculationTimeout);
    //     calculationTimeout = setTimeout(() => {
    //       if (!elements.country || !elements.price) return;
    //       const country = elements.country.value;
    //       let priceInput = parseFloat(elements.price.value) || 0;
    //       const inputCurrency = elements.currency.value;
    //       const year = parseInt(elements.year.value) || 2026;
    //       const volume = parseFloat(elements.volume.value) || 0;
    //       const engineType = elements.engineType.value;
    //       const isEV = elements.evQuota?.checked && engineType === "electric";
    //       const has50Discount = elements.discount50?.checked;
    //       const age = Math.max(0, 2026 - year);
    //       let priceByn = priceInput;
    //       if (inputCurrency === "EUR") priceByn = priceInput * eurRate;
    //       else if (inputCurrency === "USD") priceByn = priceInput * usdRate;
    //       const deliveryRates = {
    //         europe: 1800 * eurRate,
    //         usa: 3400 * eurRate,
    //         china: 2400 * eurRate,
    //         korea: 2100 * eurRate,
    //       };
    //       let deliveryByn = deliveryRates[country] || 2600 * eurRate;
    //       let dutyEur = 0;
    //       if (!isEV) {
    //         const priceEur = priceByn / eurRate;
    //         if (age < 3) {
    //           if (priceEur <= 8500)
    //             dutyEur = Math.max(priceEur * 0.54, volume * 2.5);
    //           else if (priceEur <= 16700)
    //             dutyEur = Math.max(priceEur * 0.48, volume * 3.5);
    //           else if (priceEur <= 42300)
    //             dutyEur = Math.max(priceEur * 0.48, volume * 5.5);
    //           else if (priceEur <= 84500)
    //             dutyEur = Math.max(priceEur * 0.48, volume * 7.5);
    //           else dutyEur = Math.max(priceEur * 0.48, volume * 15);
    //         } else if (age < 5) {
    //           if (volume <= 1000) dutyEur = volume * 1.5;
    //           else if (volume <= 1500) dutyEur = volume * 1.7;
    //           else if (volume <= 1800) dutyEur = volume * 2.5;
    //           else if (volume <= 2300) dutyEur = volume * 2.7;
    //           else if (volume <= 3000) dutyEur = volume * 3.0;
    //           else dutyEur = volume * 3.6;
    //         } else {
    //           if (volume <= 1000) dutyEur = volume * 3.0;
    //           else if (volume <= 1500) dutyEur = volume * 3.2;
    //           else if (volume <= 1800) dutyEur = volume * 3.5;
    //           else if (volume <= 2300) dutyEur = volume * 4.8;
    //           else if (volume <= 3000) dutyEur = volume * 5.0;
    //           else dutyEur = volume * 5.7;
    //         }
    //       }
    //       if (has50Discount) dutyEur *= 0.5;
    //       const dutyByn = dutyEur * eurRate;
    //       const ndsByn = (priceByn + dutyByn) * 0.2;
    //       const utilByn = age < 3 ? 544.5 : 1089;
    //       const customsByn = 120;
    //       const totalByn = Math.round(
    //         priceByn + deliveryByn + dutyByn + ndsByn + utilByn + customsByn
    //       );
    //       const formattedTotal = totalByn.toLocaleString("ru-RU") + " BYN";
    //       if (elements.totalByn) elements.totalByn.textContent = formattedTotal;
    //       if (elements.finalTotal)
    //         elements.finalTotal.textContent = formattedTotal;
    //       if (elements.breakdown) {
    //         elements.breakdown.innerHTML = `
    //           <div class="breakdown-row"><span>Стоимость автомобиля</span><span>${priceByn.toLocaleString(
    //             "ru-RU"
    //           )} BYN</span></div>
    //           <div class="breakdown-row"><span>Доставка</span><span>${Math.round(
    //             deliveryByn
    //           ).toLocaleString("ru-RU")} BYN</span></div>
    //           <div class="breakdown-row"><span>Таможенная пошлина ${
    //             has50Discount ? "(−50%)" : ""
    //           }</span><span>${Math.round(dutyByn).toLocaleString(
    //           "ru-RU"
    //         )} BYN</span></div>
    //           <div class="breakdown-row"><span>НДС 20%</span><span>${Math.round(
    //             ndsByn
    //           ).toLocaleString("ru-RU")} BYN</span></div>
    //           <div class="breakdown-row"><span>Утилизационный сбор</span><span>${utilByn.toFixed(
    //             0
    //           )} BYN</span></div>
    //           <div class="breakdown-row"><span>Таможенный сбор</span><span>${customsByn} BYN</span></div>
    //         `;
    //       }
    //     }, 100);
    //   }

    //   const calculator = document.getElementById("calculator");
    //   if (calculator) {
    //     calculator.addEventListener("input", (e) => {
    //       if (e.target.matches("input, select")) calculate();
    //     });
    //   }
    //   loadRates();
    // }

    // --------------------------------------------------------------
    // 5. КАЛЬКУЛЯТОР АВТО (ОБНОВЛЁННЫЙ - убрана двойная цена)
    // --------------------------------------------------------------
    const calculatorExists = document.getElementById("calculator");

    if (calculatorExists) {
      // Данные из таблицы (сокращённый вариант, для полной версии нужно добавить все города)
      const logisticsData = {
        // Базовые цены на инленд (перевозка по США до порта)
        inlandRates: {
          Abilene: 400,
          "ACE - Carson": 200,
          "ACE - Perris": 325,
          Adamsburg: 450,
          Adelanto: 325,
          "ADESA Boston": 425,
          "ADESA Great Lakes": 575,
          "ADESA New Jersey": 200,
          "Adesa PA": 300,
          "ADESA Sioux Falls": 600,
          "ADESA St. John`s": 1950,
          "ADESA Wisconsin": 300,
          "Akron-Canton": 600,
          Albany: 325,
          Albuquerque: 650,
          Altoona: 500,
          Amarillo: 575,
          Anaheim: 230,
          Anchorage: 1950,
          Andrews: 475,
          Antelope: 425,
          Appleton: 375,
          "Arizona Auto Auction": 400,
          Asheville: 425,
          Ashland: 550,
          "Atlanta Auto Auction": 325,
          "Atlanta East": 325,
          "Atlanta North": 325,
          "Atlanta South": 325,
          "Atlanta West": 325,
          Augusta: 300,
          Austin: 300,
          "Avenel New Jersey": 200,
          Bakersfield: 350,
          Baltimore: 325,
          Bangor: 425,
          "Baton Rouge": 350,
          "Bay Area": 350,
          "Bel-Air Auto Auction": 425,
          Billings: 850,
          Birmingham: 400,
          Boise: 500,
          Boston: 425,
          "Boston - Shirley": 425,
          "Bowling Green": 475,
          Bridgeport: 270,
          Bridgeview: 200,
          Buckhannon: 625,
          Buffalo: 550,
          Burlington: 525,
          Calgary: 1450,
          Candia: 425,
          Cartersville: 350,
          Casper: 1250,
          "Cedar Rapids": 425,
          "Central Auto Auction": 250,
          "Central New Jersey": 225,
          Chambersburg: 400,
          "Charleston - SC": 325,
          "Charleston - WV": 625,
          Charlotte: 325,
          Chattanooga: 400,
          "Chicago North": 200,
          "Chicago South": 230,
          "Chicago West": 200,
          "China Grove": 325,
          Cicero: 425,
          Cincinnati: 600,
          Clayton: 325,
          Clearwater: 325,
          Cleveland: 600,
          "Cleveland East": 550,
          "Cleveland West": 550,
          Clewiston: 350,
          Clinton: 480,
          "Colorado Springs": 700,
          "Columbia MO": 420,
          "Columbia SC": 325,
          "Columbus AL": 450,
          "Columbus OH": 600,
          Concord: 325,
          Cookstown: 700,
          "Corpus Christi": 325,
          "Culpeper,VA": 400,
          Dallas: 325,
          "Dallas South": 325,
          Danville: 425,
          Davenport: 375,
          Dayton: 600,
          "Defuniak Springs": 350,
          Denver: 700,
          "Denver South": 700,
          "Des Moines": 425,
          Detroit: 425,
          Dothan: 400,
          Dundalk: 325,
          Dyer: 200,
          Earlington: 585,
          "East Bay": 450,
          "East NC": 450,
          Edmonton: 1450,
          "El Paso": 475,
          Eldridge: 375,
          Elkton: 325,
          Englishtown: 225,
          Erie: 550,
          Essex: 365,
          Eugene: 425,
          Exeter: 400,
          Fairburn: 325,
          Fargo: 650,
          Fayetteville: 525,
          Flint: 475,
          Florence: 300,
          Fontana: 230,
          "Fort Myers": 325,
          "Fort Wayne": 350,
          "Fort Worth North": 325,
          "Four Oaks, NC": 250,
          "Fredericksburg-South": 375,
          Freetown: 425,
          Fremont: 450,
          Fresno: 425,
          "Ft. Pierce": 400,
          "Ft. Worth": 325,
          "Ft.Lauderdale": 280,
          Gastonia: 350,
          "Glassboro East": 250,
          "Glassboro West": 250,
          "Golden Gate": 375,
          "Gr.Rapids": 425,
          Graham: 175,
          "Grand Island": 750,
          Grantville: 300,
          "Greater Auto Auction Phoenix": 400,
          Greensboro: 325,
          Greenville: 300,
          Greer: 325,
          Grenada: 475,
          "Gulf Coast": 375,
          Gulfport: 400,
          Halifax: 1200,
          Hamilton: 450,
          Hammond: 200,
          Hampton: 400,
          "Hampton, VA": 400,
          Harrisburg: 325,
          Hartford: 275,
          "Hartford City": 250,
          "Hartford-South": 275,
          Hatward: 1040,
          Hayward: 450,
          Helena: 750,
          "High Desert": 350,
          "High Point": 325,
          Honolulu: 1650,
          Houston: 250,
          "Houston-North": 250,
          Huntsville: 450,
          Indianapolis: 300,
          Ionia: 425,
          Jackson: 425,
          Jacksonville: 275,
          "Jacksonville East": 275,
          "Jacksonville West": 275,
          "Kansas City": 600,
          Kincheloe: 800,
          Knoxville: 450,
          Lafayette: 325,
          "Lake City": 325,
          Lansing: 425,
          "Las Vegas": 350,
          Laurel: 325,
          "Lexington East KY": 475,
          "Lexington SC": 350,
          "Lexington West KY": 475,
          "Lincoln, IL": 350,
          "Lincoln, NE": 500,
          "Little Rock": 500,
          London: 550,
          "Long Beach": 180,
          "Long Island": 300,
          Longview: 325,
          "Los Angeles": 200,
          "Los Angeles - Adesa": 200,
          Louisville: 475,
          Lubbock: 500,
          Lufkin: 325,
          Lumberton: 325,
          Lyman: 475,
          Macon: 300,
          Madison: 350,
          "Madison Heights": 420,
          Manchester: 400,
          "Manheim Albany": 325,
          "Manheim Arena Illinois": 200,
          "Manheim Auto Auction": 280,
          "Manheim Baltimore-Washington": 300,
          "Manheim Bishop Brothers": 240,
          "Manheim California": 220,
          "Manheim Carleton": 525,
          "Manheim Central California": 300,
          "Manheim Central Florida": 275,
          "Manheim Chicago": 200,
          "Manheim Cincinnati": 600,
          "Manheim Colorado": 500,
          "Manheim Dallas": 325,
          "Manheim Dallas-Ft Worth": 325,
          "Manheim Darlington": 275,
          "Manheim Daytona Beach": 325,
          "Manheim Denver": 700,
          "Manheim Detroit": 650,
          "Manheim Fort Lauderdale": 280,
          "Manheim Fort Myers": 300,
          "Manheim Fort Wayne": 350,
          "Manheim Fredericksburg": 375,
          "Manheim Georgia": 300,
          "Manheim Harrisonburg": 400,
          "Manheim Imperial Auto Auction": 300,
          "Manheim Kentucky": 600,
          "Manheim Lafayette": 325,
          "Manheim Lakeland": 300,
          "Manheim Metro Milwaukee": 275,
          "Manheim Milwaukee": 275,
          "Manheim Mississippi": 375,
          "Manheim Missouri": 425,
          "Manheim Montreal": 500,
          "Manheim Nashville": 400,
          "Manheim Nevada": 325,
          "Manheim New England": 400,
          "Manheim New Jersey": 200,
          "Manheim New Mexico": 575,
          "Manheim New Orleans": 475,
          "Manheim New York": 300,
          "Manheim North Carolina": 325,
          "Manheim Northstar Minnesota": 400,
          "Manheim Ohio": 450,
          "Manheim Oklahoma City": 400,
          "Manheim Orlando": 300,
          "Manheim Oshawa": 175,
          "MANHEIM PALM BEACH": 300,
          "Manheim Pennsylvania": 250,
          "Manheim Pensacola": 375,
          "Manheim Philadelphia": 270,
          "Manheim Phoenix": 400,
          "Manheim Pittsburg": 450,
          "Manheim Riverside": 225,
          "Manheim San Antonio": 350,
          "Manheim San Diego": 215,
          "Manheim San Francisco Bay": 350,
          "Manheim Seattle": 225,
          "Manheim Skyline Auto Auction": 150,
          "Manheim Southern California": 225,
          "Manheim St Louis": 525,
          "Manheim St. Pete": 300,
          "Manheim Statesville": 300,
          "MANHEIM TAMPA": 290,
          "Manheim Tennessee": 450,
          "Manheim Texas Hobby": 150,
          "Manheim Toronto": 425,
          "Manheim Tucson": 450,
          "Manheim Utah": 425,
          "Manheim Virginia (FREDERICKSBURG)": 375,
          Martinez: 450,
          MCAllen: 400,
          Mebane: 325,
          Memphis: 500,
          Mentone: 250,
          "Metro DC": 325,
          Miami: 400,
          "Miami Central": 400,
          "Miami North": 400,
          "Miami South": 400,
          Middletown: 325,
          Milwaukee: 275,
          Minneapolis: 450,
          "Minneapolis /St. Paul": 450,
          "Minneapolis North": 450,
          Missoula: 650,
          Mobile: 450,
          Mocksville: 325,
          Moncton: 1275,
          Montgomery: 450,
          Monticello: 275,
          Montreal: 500,
          Napa: 450,
          Nashville: 450,
          "National Auto Dealers Exchange": 170,
          "New Castle": 300,
          "New Orleans": 475,
          Newburgh: 275,
          "North Boston": 425,
          "North Charleston - SC": 325,
          "North Hollywood": 230,
          "North Seattle": 225,
          "Northern New Jersey": 210,
          "Northern Virginia": 325,
          Ocala: 325,
          Ogden: 600,
          "Oklahoma City": 450,
          Omaha: 500,
          Orlando: 300,
          "Orlando North": 300,
          "Orlando South": 300,
          Ottawa: 475,
          Paducah: 525,
          Pasco: 400,
          Pensacola: 425,
          Peoria: 350,
          "Permian Basin": 500,
          Philadelphia: 270,
          "Philadelphia East": 270,
          Phoenix: 400,
          Pittsburg: 450,
          "Pittsburgh South": 500,
          "Port Murray": 225,
          Portage: 350,
          Portland: 275,
          "Portland - Gorham": 475,
          "Portland North": 300,
          "Portland South": 300,
          "Portland West": 300,
          Providence: 400,
          Pulaski: 425,
          "Punta Gorda": 350,
          Puyallup: 225,
          Quebec: 600,
          "Quebec city": 625,
          Raleigh: 325,
          "Rancho Cucamonga": 230,
          "Rapid City": 1100,
          Redding: 700,
          Regina: 1350,
          Reno: 600,
          Richmond: 400,
          Riverside: 230,
          Roanoke: 475,
          Rochester: 500,
          Rosedale: 375,
          Rutland: 500,
          Sacramento: 450,
          Salisbury: 350,
          "Salt Lake City": 700,
          "San Antonio": 350,
          "San Bernardino": 250,
          "San Diego": 250,
          "San Jose": 450,
          Sarasota: 300,
          Savannah: 150,
          Sayreville: 200,
          Scranton: 300,
          Seaford: 375,
          Seattle: 225,
          "Shady Spring, WV": 625,
          Shreveport: 365,
          Sikeston: 475,
          "Sioux Falls": 600,
          "So Sacramento": 450,
          Somerville: 210,
          "South Bend": 300,
          "South Boston": 425,
          "Southern Illinois": 575,
          "Southern New Jersey": 250,
          Spanaway: 225,
          Spartanburg: 325,
          Spokane: 400,
          Springfield: 600,
          "St. Cloud": 450,
          "St. John's": 1950,
          "St. Louis, IL": 575,
          "St. Louis, MO": 575,
          Stockton: 450,
          Sudbury: 475,
          Suffolk: 400,
          "Sun Valley": 230,
          Syracuse: 375,
          Tallahassee: 325,
          Tampa: 325,
          "Tampa South": 325,
          Tanner: 475,
          Taunton: 425,
          Templeton: 425,
          Tidewater: 350,
          Tifton: 300,
          Toronto: 425,
          "TOTAL RESOURCE AUC CENTRL PENN": 300,
          Trenton: 250,
          Tucson: 450,
          Tulsa: 525,
          Vallejo: 450,
          "Van Nuys": 230,
          Vancouver: 1950,
          Waco: 375,
          Walton: 475,
          WashingtonDC: 325,
          Wayland: 425,
          Webster: 450,
          "West Palm Beach": 400,
          "West Warren": 425,
          "Western Colorado": 900,
          Wheeling: 200,
          Wichita: 600,
          Wilmington: 400,
          Windham: 500,
          Winnipeg: 1300,
          "York Haven": 325,
          "York Springs": 325,
        },

        // Стоимость доставки от порта (базовые ставки)
        portToDestination: {
          klaipeda: { sedan: 725, suv: 725 }, // Для Клайпеды — одинаковая цена
          poti: { sedan: 895, suv: 895 }, // Для Грузии — базовая (коэффициенты применятся отдельно)
        },
      };

      // Дополнительные сборы
      const extraFees = {
        hybridFee: 150, // $ для гибридов и электро
        oversizeMultiplier: 1.5, // коэффициент для SUV/кроссоверов через Грузию
        // Стоимость автовоза по направлениям (привязана к порту)
        autoTransporter: {
          klaipeda: 1000, // Литва
          poti: 2000, // Грузия
        },
        // Стоимость дополнительных услуг
        additionalServices: {
          service1: 100, // Доступ 1
          service2: 250, // Доступ 2
          service3: 450, // Доступ 3
        },
        // Альтернативные цены для некоторых регионов (если отличаются от базовых)
        specialPortRates: {
          Abilene: {
            klaipeda: { sedan: 835, suv: 835 },
            poti: { sedan: 1180, suv: 1180 },
          },
          "ACE - Carson": {
            klaipeda: { sedan: 1250, suv: 1250 },
            poti: { sedan: 1595, suv: 1595 },
          },
          "ACE - Perris": {
            klaipeda: { sedan: 1250, suv: 1250 },
            poti: { sedan: 1595, suv: 1595 },
          },
          Adamsburg: {
            klaipeda: { sedan: 725, suv: 725 },
            poti: { sedan: 895, suv: 895 },
          },
          Adelanto: {
            klaipeda: { sedan: 1250, suv: 1250 },
            poti: { sedan: 1595, suv: 1595 },
          },
          "ADESA Boston": {
            klaipeda: { sedan: 725, suv: 725 },
            poti: { sedan: 895, suv: 895 },
          },
          "ADESA Great Lakes": {
            klaipeda: { sedan: 725, suv: 725 },
            poti: { sedan: 895, suv: 895 },
          },
          Albuquerque: {
            klaipeda: { sedan: 835, suv: 835 },
            poti: { sedan: 1180, suv: 1180 },
          },
          Amarillo: {
            klaipeda: { sedan: 835, suv: 835 },
            poti: { sedan: 1180, suv: 1180 },
          },
          Anchorage: {
            klaipeda: { sedan: 1725, suv: 1725 },
            poti: { sedan: 1600, suv: 1600 },
          },
          Billings: {
            klaipeda: { sedan: 1725, suv: 1725 },
            poti: { sedan: 1600, suv: 1600 },
          },
          Boise: {
            klaipeda: { sedan: 1725, suv: 1725 },
            poti: { sedan: 1600, suv: 1600 },
          },
        },
      };

      let calculationTimeout = null;

      // Получаем элементы
      const locationSelect = document.getElementById("location");
      const carTypeSelect = document.getElementById("carType");
      const portSelect = document.getElementById("port");
      const isHybridCheckbox = document.getElementById("isHybrid");
      const additionalServiceSelect =
        document.getElementById("additionalService");

      const finalTotalElement = document.getElementById("finalTotal");
      const breakdownElement = document.getElementById("breakdown");

      // Заполняем select с локациями
      function populateLocationSelect() {
        if (!locationSelect) return;
        const locations = Object.keys(logisticsData.inlandRates).sort();
        locationSelect.innerHTML =
          '<option value="">-- Выберите город или аукцион --</option>';
        locations.forEach((location) => {
          const option = document.createElement("option");
          option.value = location;
          option.textContent = location;
          locationSelect.appendChild(option);
        });
      }

      // Получить стоимость инленда для локации
      function getInlandRate(location) {
        return logisticsData.inlandRates[location] || null;
      }

      // Получить стоимость доставки от порта с учётом oversize для SUV через Грузию
      function getPortToDestinationRate(location, port, carType) {
        // Проверяем особые тарифы
        let baseRate;
        if (
          extraFees.specialPortRates[location] &&
          extraFees.specialPortRates[location][port]
        ) {
          baseRate = extraFees.specialPortRates[location][port][carType];
        } else {
          // Стандартные тарифы
          const standardRate = logisticsData.portToDestination[port];
          baseRate = standardRate ? standardRate[carType] : 895;
        }

        // Применяем коэффициент oversize (1.5) для SUV/кроссоверов только через порт Грузии (poti)
        if (port === "poti" && carType === "suv") {
          return baseRate * extraFees.oversizeMultiplier;
        }

        return baseRate;
      }

      // Получить стоимость автовоза (привязана к порту)
      function getAutoTransporterRate(port) {
        return extraFees.autoTransporter[port] || 0;
      }

      // Получить стоимость дополнительной услуги
      function getAdditionalServiceRate(serviceValue) {
        switch (serviceValue) {
          case "service1":
            return extraFees.additionalServices.service1;
          case "service2":
            return extraFees.additionalServices.service2;
          case "service3":
            return extraFees.additionalServices.service3;
          default:
            return 0;
        }
      }

      // Получить название дополнительной услуги
      function getAdditionalServiceName(serviceValue) {
        switch (serviceValue) {
          case "service1":
            return "Доступ 1";
          case "service2":
            return "Доступ 2";
          case "service3":
            return "Доступ 3";
          default:
            return "";
        }
      }

      // Основная функция расчёта
      function calculate() {
        if (calculationTimeout) clearTimeout(calculationTimeout);
        calculationTimeout = setTimeout(() => {
          // Получаем значения
          const location = locationSelect?.value;
          const carType = carTypeSelect?.value;
          const port = portSelect?.value;
          const isHybrid = isHybridCheckbox?.checked || false;
          const additionalServiceValue =
            additionalServiceSelect?.value || "none";

          // Проверяем выбранную локацию
          if (!location || !logisticsData.inlandRates[location]) {
            finalTotalElement.textContent = "— USD";
            breakdownElement.innerHTML =
              '<div class="breakdown-row"><span style="color: #e74c3c;">❌ Выберите место стоянки</span></div>';
            return;
          }

          // 1. Инленд (перевозка по США)
          const inlandCost = getInlandRate(location);

          // 2. Доставка от порта (с учётом oversize для SUV через Грузию)
          let portDelivery = getPortToDestinationRate(location, port, carType);

          // 3. Сбор за гибрид/электро
          const hybridFee = isHybrid ? extraFees.hybridFee : 0;

          // 4. Стоимость автовоза (привязана к порту)
          const autoTransporterCost = getAutoTransporterRate(port);

          // 5. Стоимость дополнительной услуги
          const additionalServiceCost = getAdditionalServiceRate(
            additionalServiceValue
          );
          const additionalServiceName = getAdditionalServiceName(
            additionalServiceValue
          );

          // Итоговая стоимость (все услуги включены)
          const finalTotal =
            inlandCost +
            portDelivery +
            hybridFee +
            autoTransporterCost +
            additionalServiceCost;

          // Форматируем
          const formatUSD = (value) =>
            Math.round(value).toLocaleString("ru-RU") + " USD";

          // Определяем название типа авто для отображения
          const carTypeName =
            carType === "sedan" ? "Седан/Хэтчбек" : "SUV/Кроссовер";

          // Определяем был ли применён oversize
          const isOversizeApplied = port === "poti" && carType === "suv";

          // Название порта
          const portName =
            port === "klaipeda" ? "Клайпеда (Литва)" : "Поти/Батуми (Грузия)";

          // Обновляем UI
          finalTotalElement.textContent = formatUSD(finalTotal);

          // Расшифровка
          let breakdownHTML = `
            <div class="breakdown-row">
              <span>🚛 Инленд (${location})</span>
              <span>${inlandCost.toLocaleString("ru-RU")} USD</span>
            </div>
            <div class="breakdown-row">
              <span>⚓ Морская доставка до ${portName} (${carTypeName})${
            isOversizeApplied
              ? " <span style='color:#e67e22;'>(×1.5 SUV коэф.)</span>"
              : ""
          }</span>
              <span>${portDelivery.toLocaleString("ru-RU")} USD</span>
            </div>`;

          if (isHybrid) {
            breakdownHTML += `<div class="breakdown-row"><span>🔋 Сбор за гибрид/электро</span><span>${hybridFee} USD</span></div>`;
          }

          breakdownHTML += `
            <div class="breakdown-row">
              <span>🚚 Автовоз (${
                port === "klaipeda" ? "Литва" : "Грузия"
              })</span>
              <span>${autoTransporterCost.toLocaleString("ru-RU")} USD</span>
            </div>`;

          if (additionalServiceCost > 0) {
            breakdownHTML += `<div class="breakdown-row"><span>🛠️ ${additionalServiceName}</span><span>${additionalServiceCost.toLocaleString(
              "ru-RU"
            )} USD</span></div>`;
          }

          breakdownHTML += `
            <div class="breakdown-row total-row" style="border-top: 2px solid #ddd; margin-top: 8px; padding-top: 8px; font-weight: 700;">
              <span>💰 Итого</span>
              <span>${finalTotal.toLocaleString("ru-RU")} USD</span>
            </div>
          `;

          breakdownElement.innerHTML = breakdownHTML;
        }, 100);
      }

      // Навешиваем обработчики
      function bindEvents() {
        const elements = [
          locationSelect,
          carTypeSelect,
          portSelect,
          isHybridCheckbox,
          additionalServiceSelect,
        ];
        elements.forEach((el) => {
          if (el) el.addEventListener("input", calculate);
          if (el && el.type !== "checkbox" && el.type !== "select-one") {
            if (el.addEventListener) el.addEventListener("change", calculate);
          }
        });
      }

      // Инициализация
      populateLocationSelect();
      bindEvents();
      calculate();
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
