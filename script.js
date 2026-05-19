// ================================================
// main.js — главный скрипт сайта RS-Motors
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
    (function () {
      const accordionItems = document.querySelectorAll("[data-accordion]");
      let isAnimating = false;
      let activeItem = null;

      const isMobile = () => window.innerWidth <= 992;

      const closeAllAccordionItems = () => {
        accordionItems.forEach((item) => {
          if (item.classList.contains("active")) {
            item.classList.remove("active");
          }
        });
        activeItem = null;
      };

      const handleItemClick = (item, event) => {
        if (
          event.target.closest(".home-why__item-list li") ||
          event.target.closest(".home-why__item-note") ||
          event.target.closest("h4") ||
          event.target.closest("ul, li, p")
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
          setTimeout(() => {
            isAnimating = false;
          }, 450);
        }
      };

      accordionItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          handleItemClick(item, e);
        });

        item.addEventListener(
          "touchstart",
          (e) => {
            if (
              e.target.closest(".home-why__item-list li") ||
              e.target.closest(".home-why__item-note") ||
              e.target.closest("h4") ||
              e.target.closest("ul, li, p")
            ) {
              return;
            }
            e.stopPropagation();
          },
          { passive: false }
        );
      });

      if (isMobile()) {
        const style = document.createElement("style");
        style.textContent = `.home-why__item.active { scroll-margin-top: 0 !important; }`;
        document.head.appendChild(style);
      }

      const allContents = document.querySelectorAll(".home-why__item-content");
      allContents.forEach((content) => {
        content.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      });
    })();

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
    // 5. КАЛЬКУЛЯТОР АВТО (ОБНОВЛЁННЫЙ)
    // --------------------------------------------------------------
    (function () {
      // ПРОВЕРЯЕМ: есть ли на странице элементы калькулятора и парольной защиты
      const overlay = document.getElementById("passwordOverlay");
      const content = document.getElementById("calculatorContent");

      // Если элементов нет - просто выходим, чтобы не было ошибок на других страницах
      if (!overlay || !content) {
        return; // Молча завершаем работу скрипта на страницах без калькулятора
      }

      // ---------- ПАРОЛЬНАЯ ЗАЩИТА ----------
      const correctPassword = "1234"; // Можете сменить на нужный пароль
      const passInput = document.getElementById("passwordInput");
      const unlockBtn = document.getElementById("unlockBtn");
      const errorDiv = document.getElementById("passError");

      // Дополнительная проверка на наличие нужных элементов
      if (passInput && unlockBtn) {
        function unlockCalculator() {
          const entered = passInput.value.trim();
          if (entered === correctPassword) {
            overlay.style.display = "none";
            content.style.display = "block";
            document.body.style.overflow = "auto";
            // после разблокировки инициализируем калькулятор
            if (typeof initCalculator === "function") {
              initCalculator();
            }
          } else {
            if (errorDiv) errorDiv.style.display = "block";
            passInput.value = "";
            passInput.focus();
          }
        }

        unlockBtn.addEventListener("click", unlockCalculator);
        passInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") unlockCalculator();
        });
      }

      // ---------- ДАННЫЕ И ЛОГИКА КАЛЬКУЛЯТОРА (полностью идентичная вашей, но обёрнута в функцию) ----------
      const logisticsData = {
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
        portToDestinationRates: {
          klaipeda: {
            Abilene: { sedan: 835, suv: 835 },
            "ACE - Carson": { sedan: 1250, suv: 1250 },
            "ACE - Perris": { sedan: 1250, suv: 1250 },
            Adamsburg: { sedan: 725, suv: 725 },
            Adelanto: { sedan: 1250, suv: 1250 },
            "ADESA Boston": { sedan: 725, suv: 725 },
            "ADESA Great Lakes": { sedan: 725, suv: 725 },
            "ADESA New Jersey": { sedan: 725, suv: 725 },
            "Adesa PA": { sedan: 725, suv: 725 },
            "ADESA Sioux Falls": { sedan: 875, suv: 975 },
            "ADESA St. John`s": { sedan: 850, suv: 950 },
            "ADESA Wisconsin": { sedan: 875, suv: 975 },
            "Akron-Canton": { sedan: 725, suv: 725 },
            Albany: { sedan: 725, suv: 725 },
            Albuquerque: { sedan: 835, suv: 835 },
            Altoona: { sedan: 725, suv: 725 },
            Amarillo: { sedan: 835, suv: 835 },
            Anaheim: { sedan: 1250, suv: 1250 },
            Anchorage: { sedan: 1725, suv: 1725 },
            Andrews: { sedan: 835, suv: 835 },
            Antelope: { sedan: 1250, suv: 1250 },
            Appleton: { sedan: 875, suv: 975 },
            "Arizona Auto Auction": { sedan: 1250, suv: 1250 },
            Asheville: { sedan: 695, suv: 695 },
            Ashland: { sedan: 875, suv: 975 },
            "Atlanta Auto Auction": { sedan: 695, suv: 695 },
            "Atlanta East": { sedan: 695, suv: 695 },
            "Atlanta North": { sedan: 695, suv: 695 },
            "Atlanta South": { sedan: 695, suv: 695 },
            "Atlanta West": { sedan: 695, suv: 695 },
            Augusta: { sedan: 695, suv: 695 },
            Austin: { sedan: 835, suv: 835 },
            "Avenel New Jersey": { sedan: 725, suv: 725 },
            Bakersfield: { sedan: 1250, suv: 1250 },
            Baltimore: { sedan: 725, suv: 725 },
            Bangor: { sedan: 725, suv: 725 },
            "Baton Rouge": { sedan: 835, suv: 835 },
            "Bay Area": { sedan: 1250, suv: 1250 },
            "Bel-Air Auto Auction": { sedan: 725, suv: 725 },
            Billings: { sedan: 1725, suv: 1725 },
            Birmingham: { sedan: 695, suv: 695 },
            Boise: { sedan: 1725, suv: 1725 },
            Boston: { sedan: 725, suv: 725 },
            "Boston - Shirley": { sedan: 725, suv: 725 },
            "Bowling Green": { sedan: 875, suv: 975 },
            Bridgeport: { sedan: 725, suv: 725 },
            Bridgeview: { sedan: 875, suv: 975 },
            Buckhannon: { sedan: 725, suv: 725 },
            Buffalo: { sedan: 725, suv: 725 },
            Burlington: { sedan: 725, suv: 725 },
            Calgary: { sedan: 850, suv: 950 },
            Candia: { sedan: 725, suv: 725 },
            Cartersville: { sedan: 695, suv: 695 },
            Casper: { sedan: 1725, suv: 1725 },
            "Cedar Rapids": { sedan: 875, suv: 975 },
            "Central Auto Auction": { sedan: 725, suv: 725 },
            "Central New Jersey": { sedan: 725, suv: 725 },
            Chambersburg: { sedan: 725, suv: 725 },
            "Charleston - SC": { sedan: 695, suv: 695 },
            "Charleston - WV": { sedan: 725, suv: 725 },
            Charlotte: { sedan: 695, suv: 695 },
            Chattanooga: { sedan: 695, suv: 695 },
            "Chicago North": { sedan: 875, suv: 975 },
            "Chicago South": { sedan: 875, suv: 975 },
            "Chicago West": { sedan: 875, suv: 975 },
            "China Grove": { sedan: 695, suv: 695 },
            Cicero: { sedan: 875, suv: 975 },
            Cincinnati: { sedan: 725, suv: 725 },
            Clayton: { sedan: 695, suv: 695 },
            Clearwater: { sedan: 695, suv: 695 },
            Cleveland: { sedan: 725, suv: 725 },
            "Cleveland East": { sedan: 725, suv: 725 },
            "Cleveland West": { sedan: 725, suv: 725 },
            Clewiston: { sedan: 695, suv: 695 },
            Clinton: { sedan: 695, suv: 695 },
            "Colorado Springs": { sedan: 1250, suv: 1250 },
            "Columbia MO": { sedan: 875, suv: 975 },
            "Columbia SC": { sedan: 695, suv: 695 },
            "Columbus AL": { sedan: 695, suv: 695 },
            "Columbus OH": { sedan: 725, suv: 725 },
            Concord: { sedan: 695, suv: 695 },
            Cookstown: { sedan: 850, suv: 950 },
            "Corpus Christi": { sedan: 835, suv: 835 },
            "Culpeper,VA": { sedan: 725, suv: 725 },
            Dallas: { sedan: 835, suv: 835 },
            "Dallas South": { sedan: 835, suv: 835 },
            Danville: { sedan: 695, suv: 695 },
            Davenport: { sedan: 875, suv: 975 },
            Dayton: { sedan: 725, suv: 725 },
            "Defuniak Springs": { sedan: 695, suv: 695 },
            Denver: { sedan: 835, suv: 835 },
            "Denver South": { sedan: 835, suv: 835 },
            "Des Moines": { sedan: 875, suv: 975 },
            Detroit: { sedan: 875, suv: 975 },
            Dothan: { sedan: 695, suv: 695 },
            Dundalk: { sedan: 725, suv: 725 },
            Dyer: { sedan: 875, suv: 975 },
            Earlington: { sedan: 695, suv: 695 },
            "East Bay": { sedan: 1250, suv: 1250 },
            "East NC": { sedan: 695, suv: 695 },
            Edmonton: { sedan: 850, suv: 950 },
            "El Paso": { sedan: 835, suv: 835 },
            Eldridge: { sedan: 875, suv: 975 },
            Elkton: { sedan: 725, suv: 725 },
            Englishtown: { sedan: 725, suv: 725 },
            Erie: { sedan: 725, suv: 725 },
            Essex: { sedan: 725, suv: 725 },
            Eugene: { sedan: 1725, suv: 1725 },
            Exeter: { sedan: 725, suv: 725 },
            Fairburn: { sedan: 695, suv: 695 },
            Fargo: { sedan: 875, suv: 975 },
            Fayetteville: { sedan: 835, suv: 835 },
            Flint: { sedan: 875, suv: 975 },
            Florence: { sedan: 695, suv: 695 },
            Fontana: { sedan: 1250, suv: 1250 },
            "Fort Myers": { sedan: 695, suv: 695 },
            "Fort Wayne": { sedan: 875, suv: 975 },
            "Fort Worth North": { sedan: 835, suv: 835 },
            "Four Oaks, NC": { sedan: 695, suv: 695 },
            "Fredericksburg-South": { sedan: 725, suv: 725 },
            Freetown: { sedan: 725, suv: 725 },
            Fremont: { sedan: 1250, suv: 1250 },
            Fresno: { sedan: 1250, suv: 1250 },
            "Ft. Pierce": { sedan: 695, suv: 695 },
            "Ft. Worth": { sedan: 835, suv: 835 },
            "Ft.Lauderdale": { sedan: 695, suv: 695 },
            Gastonia: { sedan: 695, suv: 695 },
            "Glassboro East": { sedan: 725, suv: 725 },
            "Glassboro West": { sedan: 725, suv: 725 },
            "Golden Gate": { sedan: 1250, suv: 1250 },
            "Gr.Rapids": { sedan: 875, suv: 975 },
            Graham: { sedan: 1725, suv: 1725 },
            "Grand Island": { sedan: 725, suv: 725 },
            Grantville: { sedan: 725, suv: 725 },
            "Greater Auto Auction Phoenix": { sedan: 1250, suv: 1250 },
            Greensboro: { sedan: 695, suv: 695 },
            Greenville: { sedan: 695, suv: 695 },
            Greer: { sedan: 695, suv: 695 },
            Grenada: { sedan: 695, suv: 695 },
            "Gulf Coast": { sedan: 695, suv: 695 },
            Gulfport: { sedan: 695, suv: 695 },
            Halifax: { sedan: 850, suv: 950 },
            Hamilton: { sedan: 850, suv: 950 },
            Hammond: { sedan: 875, suv: 975 },
            Hampton: { sedan: 850, suv: 950 },
            "Hampton, VA": { sedan: 725, suv: 725 },
            Harrisburg: { sedan: 725, suv: 725 },
            Hartford: { sedan: 725, suv: 725 },
            "Hartford City": { sedan: 875, suv: 975 },
            "Hartford-South": { sedan: 725, suv: 725 },
            Hatward: { sedan: 875, suv: 975 },
            Hayward: { sedan: 1250, suv: 1250 },
            Helena: { sedan: 1725, suv: 1725 },
            "High Desert": { sedan: 1250, suv: 1250 },
            "High Point": { sedan: 695, suv: 695 },
            Honolulu: { sedan: 1250, suv: 1250 },
            Houston: { sedan: 835, suv: 835 },
            "Houston-North": { sedan: 835, suv: 835 },
            Huntsville: { sedan: 695, suv: 695 },
            Indianapolis: { sedan: 875, suv: 975 },
            Ionia: { sedan: 875, suv: 975 },
            Jackson: { sedan: 695, suv: 695 },
            Jacksonville: { sedan: 695, suv: 695 },
            "Jacksonville East": { sedan: 695, suv: 695 },
            "Jacksonville West": { sedan: 695, suv: 695 },
            "Kansas City": { sedan: 695, suv: 695 },
            Kincheloe: { sedan: 875, suv: 975 },
            Knoxville: { sedan: 695, suv: 695 },
            Lafayette: { sedan: 835, suv: 835 },
            "Lake City": { sedan: 695, suv: 695 },
            Lansing: { sedan: 875, suv: 975 },
            "Las Vegas": { sedan: 1250, suv: 1250 },
            Laurel: { sedan: 725, suv: 725 },
            "Lexington East KY": { sedan: 875, suv: 975 },
            "Lexington SC": { sedan: 695, suv: 695 },
            "Lexington West KY": { sedan: 875, suv: 975 },
            "Lincoln, IL": { sedan: 875, suv: 975 },
            "Lincoln, NE": { sedan: 875, suv: 975 },
            "Little Rock": { sedan: 835, suv: 835 },
            London: { sedan: 850, suv: 950 },
            "Long Beach": { sedan: 1250, suv: 1250 },
            "Long Island": { sedan: 725, suv: 725 },
            Longview: { sedan: 835, suv: 835 },
            "Los Angeles": { sedan: 1250, suv: 1250 },
            "Los Angeles - Adesa": { sedan: 1250, suv: 1250 },
            Louisville: { sedan: 875, suv: 975 },
            Lubbock: { sedan: 835, suv: 835 },
            Lufkin: { sedan: 835, suv: 835 },
            Lumberton: { sedan: 695, suv: 695 },
            Lyman: { sedan: 725, suv: 725 },
            Macon: { sedan: 695, suv: 695 },
            Madison: { sedan: 875, suv: 975 },
            "Madison Heights": { sedan: 725, suv: 725 },
            Manchester: { sedan: 725, suv: 725 },
            "Manheim Albany": { sedan: 725, suv: 725 },
            "Manheim Arena Illinois": { sedan: 875, suv: 975 },
            "Manheim Auto Auction": { sedan: 725, suv: 725 },
            "Manheim Baltimore-Washington": { sedan: 725, suv: 725 },
            "Manheim Bishop Brothers": { sedan: 695, suv: 695 },
            "Manheim California": { sedan: 1250, suv: 1250 },
            "Manheim Carleton": { sedan: 725, suv: 725 },
            "Manheim Central California": { sedan: 1250, suv: 1250 },
            "Manheim Central Florida": { sedan: 695, suv: 695 },
            "Manheim Chicago": { sedan: 875, suv: 975 },
            "Manheim Cincinnati": { sedan: 725, suv: 725 },
            "Manheim Colorado": { sedan: 875, suv: 975 },
            "Manheim Dallas": { sedan: 835, suv: 835 },
            "Manheim Dallas-Ft Worth": { sedan: 835, suv: 835 },
            "Manheim Darlington": { sedan: 695, suv: 695 },
            "Manheim Daytona Beach": { sedan: 695, suv: 695 },
            "Manheim Denver": { sedan: 835, suv: 835 },
            "Manheim Detroit": { sedan: 725, suv: 725 },
            "Manheim Fort Lauderdale": { sedan: 695, suv: 695 },
            "Manheim Fort Myers": { sedan: 695, suv: 695 },
            "Manheim Fort Wayne": { sedan: 875, suv: 975 },
            "Manheim Fredericksburg": { sedan: 725, suv: 725 },
            "Manheim Georgia": { sedan: 695, suv: 695 },
            "Manheim Harrisonburg": { sedan: 725, suv: 725 },
            "Manheim Imperial Auto Auction": { sedan: 695, suv: 695 },
            "Manheim Kentucky": { sedan: 725, suv: 725 },
            "Manheim Lafayette": { sedan: 835, suv: 835 },
            "Manheim Lakeland": { sedan: 695, suv: 695 },
            "Manheim Metro Milwaukee": { sedan: 875, suv: 975 },
            "Manheim Milwaukee": { sedan: 875, suv: 975 },
            "Manheim Mississippi": { sedan: 695, suv: 695 },
            "Manheim Missouri": { sedan: 875, suv: 975 },
            "Manheim Montreal": { sedan: 850, suv: 950 },
            "Manheim Nashville": { sedan: 695, suv: 695 },
            "Manheim Nevada": { sedan: 1250, suv: 1250 },
            "Manheim New England": { sedan: 725, suv: 725 },
            "Manheim New Jersey": { sedan: 725, suv: 725 },
            "Manheim New Mexico": { sedan: 835, suv: 835 },
            "Manheim New Orleans": { sedan: 695, suv: 695 },
            "Manheim New York": { sedan: 725, suv: 725 },
            "Manheim North Carolina": { sedan: 695, suv: 695 },
            "Manheim Northstar Minnesota": { sedan: 875, suv: 975 },
            "Manheim Ohio": { sedan: 725, suv: 725 },
            "Manheim Oklahoma City": { sedan: 835, suv: 835 },
            "Manheim Orlando": { sedan: 695, suv: 695 },
            "Manheim Oshawa": { sedan: 850, suv: 950 },
            "MANHEIM PALM BEACH": { sedan: 695, suv: 695 },
            "Manheim Pennsylvania": { sedan: 725, suv: 725 },
            "Manheim Pensacola": { sedan: 695, suv: 695 },
            "Manheim Philadelphia": { sedan: 725, suv: 725 },
            "Manheim Phoenix": { sedan: 1250, suv: 1250 },
            "Manheim Pittsburg": { sedan: 725, suv: 725 },
            "Manheim Riverside": { sedan: 1250, suv: 1250 },
            "Manheim San Antonio": { sedan: 835, suv: 835 },
            "Manheim San Diego": { sedan: 1250, suv: 1250 },
            "Manheim San Francisco Bay": { sedan: 1250, suv: 1250 },
            "Manheim Seattle": { sedan: 1725, suv: 1725 },
            "Manheim Skyline Auto Auction": { sedan: 725, suv: 725 },
            "Manheim Southern California": { sedan: 1250, suv: 1250 },
            "Manheim St Louis": { sedan: 695, suv: 695 },
            "Manheim St. Pete": { sedan: 695, suv: 695 },
            "Manheim Statesville": { sedan: 700, suv: 695 },
            "MANHEIM TAMPA": { sedan: 695, suv: 695 },
            "Manheim Tennessee": { sedan: 695, suv: 695 },
            "Manheim Texas Hobby": { sedan: 835, suv: 835 },
            "Manheim Toronto": { sedan: 850, suv: 950 },
            "Manheim Tucson": { sedan: 1250, suv: 1250 },
            "Manheim Utah": { sedan: 1250, suv: 1250 },
            "Manheim Virginia (FREDERICKSBURG)": { sedan: 725, suv: 725 },
            Martinez: { sedan: 1250, suv: 1250 },
            MCAllen: { sedan: 835, suv: 835 },
            Mebane: { sedan: 695, suv: 695 },
            Memphis: { sedan: 695, suv: 695 },
            Mentone: { sedan: 1250, suv: 1250 },
            "Metro DC": { sedan: 725, suv: 725 },
            Miami: { sedan: 695, suv: 695 },
            "Miami Central": { sedan: 695, suv: 695 },
            "Miami North": { sedan: 695, suv: 695 },
            "Miami South": { sedan: 695, suv: 695 },
            Middletown: { sedan: 725, suv: 725 },
            Milwaukee: { sedan: 875, suv: 975 },
            Minneapolis: { sedan: 875, suv: 975 },
            "Minneapolis /St. Paul": { sedan: 875, suv: 975 },
            "Minneapolis North": { sedan: 875, suv: 975 },
            Missoula: { sedan: 1725, suv: 1725 },
            Mobile: { sedan: 695, suv: 695 },
            Mocksville: { sedan: 695, suv: 695 },
            Moncton: { sedan: 850, suv: 950 },
            Montgomery: { sedan: 695, suv: 695 },
            Monticello: { sedan: 725, suv: 725 },
            Montreal: { sedan: 850, suv: 950 },
            Napa: { sedan: 1250, suv: 1250 },
            Nashville: { sedan: 695, suv: 695 },
            "National Auto Dealers Exchange": { sedan: 725, suv: 725 },
            "New Castle": { sedan: 725, suv: 725 },
            "New Orleans": { sedan: 695, suv: 695 },
            Newburgh: { sedan: 725, suv: 725 },
            "North Boston": { sedan: 725, suv: 725 },
            "North Charleston - SC": { sedan: 695, suv: 695 },
            "North Hollywood": { sedan: 1250, suv: 1250 },
            "North Seattle": { sedan: 1725, suv: 1725 },
            "Northern New Jersey": { sedan: 725, suv: 725 },
            "Northern Virginia": { sedan: 725, suv: 725 },
            Ocala: { sedan: 695, suv: 695 },
            Ogden: { sedan: 1250, suv: 1250 },
            "Oklahoma City": { sedan: 835, suv: 835 },
            Omaha: { sedan: 875, suv: 975 },
            Orlando: { sedan: 695, suv: 695 },
            "Orlando North": { sedan: 695, suv: 695 },
            "Orlando South": { sedan: 695, suv: 695 },
            Ottawa: { sedan: 850, suv: 950 },
            Paducah: { sedan: 875, suv: 975 },
            Pasco: { sedan: 1725, suv: 1725 },
            Pensacola: { sedan: 695, suv: 695 },
            Peoria: { sedan: 875, suv: 975 },
            "Permian Basin": { sedan: 835, suv: 835 },
            Philadelphia: { sedan: 725, suv: 725 },
            "Philadelphia East": { sedan: 725, suv: 725 },
            Phoenix: { sedan: 1250, suv: 1250 },
            Pittsburg: { sedan: 725, suv: 725 },
            "Pittsburgh South": { sedan: 725, suv: 725 },
            "Port Murray": { sedan: 725, suv: 725 },
            Portage: { sedan: 875, suv: 975 },
            Portland: { sedan: 1725, suv: 1725 },
            "Portland - Gorham": { sedan: 725, suv: 725 },
            "Portland North": { sedan: 1725, suv: 1725 },
            "Portland South": { sedan: 1725, suv: 1725 },
            "Portland West": { sedan: 1725, suv: 1725 },
            Providence: { sedan: 725, suv: 725 },
            Pulaski: { sedan: 725, suv: 725 },
            "Punta Gorda": { sedan: 695, suv: 695 },
            Puyallup: { sedan: 1725, suv: 1725 },
            Quebec: { sedan: 850, suv: 950 },
            "Quebec city": { sedan: 850, suv: 950 },
            Raleigh: { sedan: 695, suv: 695 },
            "Rancho Cucamonga": { sedan: 1250, suv: 1250 },
            "Rapid City": { sedan: 875, suv: 975 },
            Redding: { sedan: 1250, suv: 1250 },
            Regina: { sedan: 850, suv: 950 },
            Reno: { sedan: 1250, suv: 1250 },
            Richmond: { sedan: 725, suv: 725 },
            Riverside: { sedan: 1250, suv: 1250 },
            Roanoke: { sedan: 725, suv: 725 },
            Rochester: { sedan: 725, suv: 725 },
            Rosedale: { sedan: 725, suv: 725 },
            Rutland: { sedan: 725, suv: 725 },
            Sacramento: { sedan: 1250, suv: 1250 },
            Salisbury: { sedan: 725, suv: 725 },
            "Salt Lake City": { sedan: 1250, suv: 1250 },
            "San Antonio": { sedan: 835, suv: 835 },
            "San Bernardino": { sedan: 1250, suv: 1250 },
            "San Diego": { sedan: 1250, suv: 1250 },
            "San Jose": { sedan: 1250, suv: 1250 },
            Sarasota: { sedan: 695, suv: 695 },
            Savannah: { sedan: 695, suv: 695 },
            Sayreville: { sedan: 725, suv: 725 },
            Scranton: { sedan: 725, suv: 725 },
            Seaford: { sedan: 725, suv: 725 },
            Seattle: { sedan: 1725, suv: 1725 },
            "Shady Spring, WV": { sedan: 725, suv: 725 },
            Shreveport: { sedan: 835, suv: 835 },
            Sikeston: { sedan: 875, suv: 975 },
            "Sioux Falls": { sedan: 875, suv: 975 },
            "So Sacramento": { sedan: 1250, suv: 1250 },
            Somerville: { sedan: 725, suv: 725 },
            "South Bend": { sedan: 875, suv: 975 },
            "South Boston": { sedan: 725, suv: 725 },
            "Southern Illinois": { sedan: 695, suv: 695 },
            "Southern New Jersey": { sedan: 725, suv: 725 },
            Spanaway: { sedan: 1725, suv: 1725 },
            Spartanburg: { sedan: 695, suv: 695 },
            Spokane: { sedan: 1725, suv: 1725 },
            Springfield: { sedan: 695, suv: 695 },
            "St. Cloud": { sedan: 875, suv: 975 },
            "St. John's": { sedan: 850, suv: 950 },
            "St. Louis, IL": { sedan: 695, suv: 695 },
            "St. Louis, MO": { sedan: 695, suv: 695 },
            Stockton: { sedan: 1250, suv: 1250 },
            Sudbury: { sedan: 850, suv: 950 },
            Suffolk: { sedan: 725, suv: 725 },
            "Sun Valley": { sedan: 1250, suv: 1250 },
            Syracuse: { sedan: 725, suv: 725 },
            Tallahassee: { sedan: 695, suv: 695 },
            Tampa: { sedan: 695, suv: 695 },
            "Tampa South": { sedan: 695, suv: 695 },
            Tanner: { sedan: 695, suv: 695 },
            Taunton: { sedan: 725, suv: 725 },
            Templeton: { sedan: 725, suv: 725 },
            Tidewater: { sedan: 725, suv: 725 },
            Tifton: { sedan: 695, suv: 695 },
            Toronto: { sedan: 850, suv: 950 },
            "TOTAL RESOURCE AUC CENTRL PENN": { sedan: 725, suv: 725 },
            Trenton: { sedan: 725, suv: 725 },
            Tucson: { sedan: 1250, suv: 1250 },
            Tulsa: { sedan: 835, suv: 835 },
            Vallejo: { sedan: 1250, suv: 1250 },
            "Van Nuys": { sedan: 1250, suv: 1250 },
            Vancouver: { sedan: 850, suv: 950 },
            Waco: { sedan: 835, suv: 835 },
            Walton: { sedan: 875, suv: 975 },
            WashingtonDC: { sedan: 725, suv: 725 },
            Wayland: { sedan: 875, suv: 975 },
            Webster: { sedan: 725, suv: 725 },
            "West Palm Beach": { sedan: 695, suv: 695 },
            "West Warren": { sedan: 725, suv: 725 },
            "Western Colorado": { sedan: 1250, suv: 1250 },
            Wheeling: { sedan: 875, suv: 975 },
            Wichita: { sedan: 835, suv: 835 },
            Wilmington: { sedan: 695, suv: 695 },
            Windham: { sedan: 725, suv: 725 },
            Winnipeg: { sedan: 850, suv: 950 },
            "York Haven": { sedan: 725, suv: 725 },
            "York Springs": { sedan: 725, suv: 725 },
          },
          poti: {
            Abilene: { sedan: 1180, suv: 1180 },
            "ACE - Carson": { sedan: 1595, suv: 1595 },
            "ACE - Perris": { sedan: 1595, suv: 1595 },
            Adamsburg: { sedan: 895, suv: 895 },
            Adelanto: { sedan: 1595, suv: 1595 },
            "ADESA Boston": { sedan: 895, suv: 895 },
            "ADESA Great Lakes": { sedan: 895, suv: 895 },
            "ADESA New Jersey": { sedan: 895, suv: 895 },
            "Adesa PA": { sedan: 895, suv: 895 },
            "ADESA Sioux Falls": { sedan: 1200, suv: 1200 },
            "ADESA St. John`s": { sedan: 1150, suv: 1300 },
            "ADESA Wisconsin": { sedan: 1200, suv: 1200 },
            "Akron-Canton": { sedan: 895, suv: 895 },
            Albany: { sedan: 895, suv: 895 },
            Albuquerque: { sedan: 1180, suv: 1180 },
            Altoona: { sedan: 895, suv: 895 },
            Amarillo: { sedan: 1180, suv: 1180 },
            Anaheim: { sedan: 1595, suv: 1595 },
            Anchorage: { sedan: 1600, suv: 1600 },
            Andrews: { sedan: 1180, suv: 1180 },
            Antelope: { sedan: 1595, suv: 1595 },
            Appleton: { sedan: 1200, suv: 1200 },
            "Arizona Auto Auction": { sedan: 1595, suv: 1595 },
            Asheville: { sedan: 850, suv: 850 },
            Ashland: { sedan: 1200, suv: 1200 },
            "Atlanta Auto Auction": { sedan: 850, suv: 850 },
            "Atlanta East": { sedan: 850, suv: 850 },
            "Atlanta North": { sedan: 850, suv: 850 },
            "Atlanta South": { sedan: 850, suv: 850 },
            "Atlanta West": { sedan: 850, suv: 850 },
            Augusta: { sedan: 850, suv: 850 },
            Austin: { sedan: 1180, suv: 1180 },
            "Avenel New Jersey": { sedan: 895, suv: 895 },
            Bakersfield: { sedan: 1595, suv: 1595 },
            Baltimore: { sedan: 895, suv: 895 },
            Bangor: { sedan: 895, suv: 895 },
            "Baton Rouge": { sedan: 1180, suv: 1180 },
            "Bay Area": { sedan: 1595, suv: 1595 },
            "Bel-Air Auto Auction": { sedan: 895, suv: 895 },
            Billings: { sedan: 1600, suv: 1600 },
            Birmingham: { sedan: 850, suv: 850 },
            Boise: { sedan: 1600, suv: 1600 },
            Boston: { sedan: 895, suv: 895 },
            "Boston - Shirley": { sedan: 895, suv: 895 },
            "Bowling Green": { sedan: 1200, suv: 1200 },
            Bridgeport: { sedan: 895, suv: 895 },
            Bridgeview: { sedan: 1200, suv: 1200 },
            Buckhannon: { sedan: 895, suv: 895 },
            Buffalo: { sedan: 895, suv: 895 },
            Burlington: { sedan: 895, suv: 895 },
            Calgary: { sedan: 1150, suv: 1300 },
            Candia: { sedan: 895, suv: 895 },
            Cartersville: { sedan: 850, suv: 850 },
            Casper: { sedan: 1600, suv: 1600 },
            "Cedar Rapids": { sedan: 1200, suv: 1200 },
            "Central Auto Auction": { sedan: 895, suv: 895 },
            "Central New Jersey": { sedan: 895, suv: 895 },
            Chambersburg: { sedan: 895, suv: 895 },
            "Charleston - SC": { sedan: 850, suv: 850 },
            "Charleston - WV": { sedan: 895, suv: 895 },
            Charlotte: { sedan: 850, suv: 850 },
            Chattanooga: { sedan: 850, suv: 850 },
            "Chicago North": { sedan: 1200, suv: 1200 },
            "Chicago South": { sedan: 1200, suv: 1200 },
            "Chicago West": { sedan: 1200, suv: 1200 },
            "China Grove": { sedan: 850, suv: 850 },
            Cicero: { sedan: 1200, suv: 1200 },
            Cincinnati: { sedan: 895, suv: 895 },
            Clayton: { sedan: 850, suv: 850 },
            Clearwater: { sedan: 850, suv: 850 },
            Cleveland: { sedan: 895, suv: 895 },
            "Cleveland East": { sedan: 895, suv: 895 },
            "Cleveland West": { sedan: 895, suv: 895 },
            Clewiston: { sedan: 850, suv: 850 },
            Clinton: { sedan: 850, suv: 850 },
            "Colorado Springs": { sedan: 1595, suv: 1595 },
            "Columbia MO": { sedan: 1200, suv: 1200 },
            "Columbia SC": { sedan: 850, suv: 850 },
            "Columbus AL": { sedan: 850, suv: 850 },
            "Columbus OH": { sedan: 895, suv: 895 },
            Concord: { sedan: 850, suv: 850 },
            Cookstown: { sedan: 1150, suv: 1300 },
            "Corpus Christi": { sedan: 1180, suv: 1180 },
            "Culpeper,VA": { sedan: 895, suv: 895 },
            Dallas: { sedan: 1180, suv: 1180 },
            "Dallas South": { sedan: 1180, suv: 1180 },
            Danville: { sedan: 850, suv: 850 },
            Davenport: { sedan: 1200, suv: 1200 },
            Dayton: { sedan: 895, suv: 895 },
            "Defuniak Springs": { sedan: 850, suv: 850 },
            Denver: { sedan: 1180, suv: 1180 },
            "Denver South": { sedan: 1180, suv: 1180 },
            "Des Moines": { sedan: 1200, suv: 1200 },
            Detroit: { sedan: 1200, suv: 1200 },
            Dothan: { sedan: 850, suv: 850 },
            Dundalk: { sedan: 895, suv: 895 },
            Dyer: { sedan: 1200, suv: 1200 },
            Earlington: { sedan: 850, suv: 850 },
            "East Bay": { sedan: 1595, suv: 1595 },
            "East NC": { sedan: 850, suv: 850 },
            Edmonton: { sedan: 1150, suv: 1300 },
            "El Paso": { sedan: 1180, suv: 1180 },
            Eldridge: { sedan: 1200, suv: 1200 },
            Elkton: { sedan: 895, suv: 895 },
            Englishtown: { sedan: 895, suv: 895 },
            Erie: { sedan: 895, suv: 895 },
            Essex: { sedan: 895, suv: 895 },
            Eugene: { sedan: 1600, suv: 1600 },
            Exeter: { sedan: 895, suv: 895 },
            Fairburn: { sedan: 850, suv: 850 },
            Fargo: { sedan: 1200, suv: 1200 },
            Fayetteville: { sedan: 1180, suv: 1180 },
            Flint: { sedan: 1200, suv: 1200 },
            Florence: { sedan: 850, suv: 850 },
            Fontana: { sedan: 1595, suv: 1595 },
            "Fort Myers": { sedan: 850, suv: 850 },
            "Fort Wayne": { sedan: 1200, suv: 1200 },
            "Fort Worth North": { sedan: 1180, suv: 1180 },
            "Four Oaks, NC": { sedan: 850, suv: 850 },
            "Fredericksburg-South": { sedan: 895, suv: 895 },
            Freetown: { sedan: 895, suv: 895 },
            Fremont: { sedan: 1595, suv: 1595 },
            Fresno: { sedan: 1595, suv: 1595 },
            "Ft. Pierce": { sedan: 850, suv: 850 },
            "Ft. Worth": { sedan: 1180, suv: 1180 },
            "Ft.Lauderdale": { sedan: 850, suv: 850 },
            Gastonia: { sedan: 850, suv: 850 },
            "Glassboro East": { sedan: 895, suv: 895 },
            "Glassboro West": { sedan: 895, suv: 895 },
            "Golden Gate": { sedan: 1595, suv: 1595 },
            "Gr.Rapids": { sedan: 1200, suv: 1200 },
            Graham: { sedan: 1600, suv: 1600 },
            "Grand Island": { sedan: 895, suv: 895 },
            Grantville: { sedan: 895, suv: 895 },
            "Greater Auto Auction Phoenix": { sedan: 1595, suv: 1595 },
            Greensboro: { sedan: 850, suv: 850 },
            Greenville: { sedan: 850, suv: 850 },
            Greer: { sedan: 850, suv: 850 },
            Grenada: { sedan: 850, suv: 850 },
            "Gulf Coast": { sedan: 850, suv: 850 },
            Gulfport: { sedan: 850, suv: 850 },
            Halifax: { sedan: 1150, suv: 1300 },
            Hamilton: { sedan: 1150, suv: 1300 },
            Hammond: { sedan: 1200, suv: 1200 },
            Hampton: { sedan: 1150, suv: 1300 },
            "Hampton, VA": { sedan: 895, suv: 895 },
            Harrisburg: { sedan: 895, suv: 895 },
            Hartford: { sedan: 895, suv: 895 },
            "Hartford City": { sedan: 1200, suv: 1200 },
            "Hartford-South": { sedan: 895, suv: 895 },
            Hatward: { sedan: 1200, suv: 1200 },
            Hayward: { sedan: 1595, suv: 1595 },
            Helena: { sedan: 1600, suv: 1600 },
            "High Desert": { sedan: 1595, suv: 1595 },
            "High Point": { sedan: 850, suv: 850 },
            Honolulu: { sedan: 1595, suv: 1595 },
            Houston: { sedan: 1180, suv: 1180 },
            "Houston-North": { sedan: 1180, suv: 1180 },
            Huntsville: { sedan: 850, suv: 850 },
            Indianapolis: { sedan: 1200, suv: 1200 },
            Ionia: { sedan: 1200, suv: 1200 },
            Jackson: { sedan: 850, suv: 850 },
            Jacksonville: { sedan: 850, suv: 850 },
            "Jacksonville East": { sedan: 850, suv: 850 },
            "Jacksonville West": { sedan: 850, suv: 850 },
            "Kansas City": { sedan: 850, suv: 850 },
            Kincheloe: { sedan: 1200, suv: 1200 },
            Knoxville: { sedan: 850, suv: 850 },
            Lafayette: { sedan: 1180, suv: 1180 },
            "Lake City": { sedan: 850, suv: 850 },
            Lansing: { sedan: 1200, suv: 1200 },
            "Las Vegas": { sedan: 1595, suv: 1595 },
            Laurel: { sedan: 895, suv: 895 },
            "Lexington East KY": { sedan: 1200, suv: 1200 },
            "Lexington SC": { sedan: 850, suv: 850 },
            "Lexington West KY": { sedan: 1200, suv: 1200 },
            "Lincoln, IL": { sedan: 1200, suv: 1200 },
            "Lincoln, NE": { sedan: 1200, suv: 1200 },
            "Little Rock": { sedan: 1180, suv: 1180 },
            London: { sedan: 1150, suv: 1300 },
            "Long Beach": { sedan: 1595, suv: 1595 },
            "Long Island": { sedan: 895, suv: 895 },
            Longview: { sedan: 1180, suv: 1180 },
            "Los Angeles": { sedan: 1595, suv: 1595 },
            "Los Angeles - Adesa": { sedan: 1595, suv: 1595 },
            Louisville: { sedan: 1200, suv: 1200 },
            Lubbock: { sedan: 1180, suv: 1180 },
            Lufkin: { sedan: 1180, suv: 1180 },
            Lumberton: { sedan: 850, suv: 850 },
            Lyman: { sedan: 895, suv: 895 },
            Macon: { sedan: 850, suv: 850 },
            Madison: { sedan: 1200, suv: 1200 },
            "Madison Heights": { sedan: 895, suv: 895 },
            Manchester: { sedan: 895, suv: 895 },
            "Manheim Albany": { sedan: 895, suv: 895 },
            "Manheim Arena Illinois": { sedan: 1200, suv: 1200 },
            "Manheim Auto Auction": { sedan: 895, suv: 895 },
            "Manheim Baltimore-Washington": { sedan: 895, suv: 895 },
            "Manheim Bishop Brothers": { sedan: 850, suv: 850 },
            "Manheim California": { sedan: 1595, suv: 1595 },
            "Manheim Carleton": { sedan: 895, suv: 895 },
            "Manheim Central California": { sedan: 1595, suv: 1595 },
            "Manheim Central Florida": { sedan: 850, suv: 850 },
            "Manheim Chicago": { sedan: 1200, suv: 1200 },
            "Manheim Cincinnati": { sedan: 895, suv: 895 },
            "Manheim Colorado": { sedan: 1200, suv: 1200 },
            "Manheim Dallas": { sedan: 1180, suv: 1180 },
            "Manheim Dallas-Ft Worth": { sedan: 1180, suv: 1180 },
            "Manheim Darlington": { sedan: 850, suv: 850 },
            "Manheim Daytona Beach": { sedan: 850, suv: 850 },
            "Manheim Denver": { sedan: 1180, suv: 1180 },
            "Manheim Detroit": { sedan: 895, suv: 895 },
            "Manheim Fort Lauderdale": { sedan: 850, suv: 850 },
            "Manheim Fort Myers": { sedan: 850, suv: 850 },
            "Manheim Fort Wayne": { sedan: 1200, suv: 1200 },
            "Manheim Fredericksburg": { sedan: 895, suv: 895 },
            "Manheim Georgia": { sedan: 850, suv: 850 },
            "Manheim Harrisonburg": { sedan: 895, suv: 895 },
            "Manheim Imperial Auto Auction": { sedan: 850, suv: 850 },
            "Manheim Kentucky": { sedan: 895, suv: 895 },
            "Manheim Lafayette": { sedan: 1180, suv: 1180 },
            "Manheim Lakeland": { sedan: 850, suv: 850 },
            "Manheim Metro Milwaukee": { sedan: 1200, suv: 1200 },
            "Manheim Milwaukee": { sedan: 1200, suv: 1200 },
            "Manheim Mississippi": { sedan: 850, suv: 850 },
            "Manheim Missouri": { sedan: 1200, suv: 1200 },
            "Manheim Montreal": { sedan: 1150, suv: 1300 },
            "Manheim Nashville": { sedan: 850, suv: 850 },
            "Manheim Nevada": { sedan: 1595, suv: 1595 },
            "Manheim New England": { sedan: 895, suv: 895 },
            "Manheim New Jersey": { sedan: 895, suv: 895 },
            "Manheim New Mexico": { sedan: 1180, suv: 1180 },
            "Manheim New Orleans": { sedan: 850, suv: 850 },
            "Manheim New York": { sedan: 895, suv: 895 },
            "Manheim North Carolina": { sedan: 850, suv: 850 },
            "Manheim Northstar Minnesota": { sedan: 1200, suv: 1200 },
            "Manheim Ohio": { sedan: 895, suv: 895 },
            "Manheim Oklahoma City": { sedan: 1180, suv: 1180 },
            "Manheim Orlando": { sedan: 850, suv: 850 },
            "Manheim Oshawa": { sedan: 1150, suv: 1300 },
            "MANHEIM PALM BEACH": { sedan: 850, suv: 850 },
            "Manheim Pennsylvania": { sedan: 895, suv: 895 },
            "Manheim Pensacola": { sedan: 850, suv: 850 },
            "Manheim Philadelphia": { sedan: 895, suv: 895 },
            "Manheim Phoenix": { sedan: 1595, suv: 1595 },
            "Manheim Pittsburg": { sedan: 895, suv: 895 },
            "Manheim Riverside": { sedan: 1595, suv: 1595 },
            "Manheim San Antonio": { sedan: 1180, suv: 1180 },
            "Manheim San Diego": { sedan: 1595, suv: 1595 },
            "Manheim San Francisco Bay": { sedan: 1595, suv: 1595 },
            "Manheim Seattle": { sedan: 1600, suv: 1600 },
            "Manheim Skyline Auto Auction": { sedan: 895, suv: 895 },
            "Manheim Southern California": { sedan: 1595, suv: 1595 },
            "Manheim St Louis": { sedan: 850, suv: 850 },
            "Manheim St. Pete": { sedan: 850, suv: 850 },
            "Manheim Statesville": { sedan: 850, suv: 850 },
            "MANHEIM TAMPA": { sedan: 850, suv: 850 },
            "Manheim Tennessee": { sedan: 850, suv: 850 },
            "Manheim Texas Hobby": { sedan: 1180, suv: 1180 },
            "Manheim Toronto": { sedan: 1150, suv: 1300 },
            "Manheim Tucson": { sedan: 1595, suv: 1595 },
            "Manheim Utah": { sedan: 1595, suv: 1595 },
            "Manheim Virginia (FREDERICKSBURG)": { sedan: 895, suv: 895 },
            Martinez: { sedan: 1595, suv: 1595 },
            MCAllen: { sedan: 1180, suv: 1180 },
            Mebane: { sedan: 850, suv: 850 },
            Memphis: { sedan: 850, suv: 850 },
            Mentone: { sedan: 1595, suv: 1595 },
            "Metro DC": { sedan: 895, suv: 895 },
            Miami: { sedan: 850, suv: 850 },
            "Miami Central": { sedan: 850, suv: 850 },
            "Miami North": { sedan: 850, suv: 850 },
            "Miami South": { sedan: 850, suv: 850 },
            Middletown: { sedan: 895, suv: 895 },
            Milwaukee: { sedan: 1200, suv: 1200 },
            Minneapolis: { sedan: 1200, suv: 1200 },
            "Minneapolis /St. Paul": { sedan: 1200, suv: 1200 },
            "Minneapolis North": { sedan: 1200, suv: 1200 },
            Missoula: { sedan: 1600, suv: 1600 },
            Mobile: { sedan: 850, suv: 850 },
            Mocksville: { sedan: 850, suv: 850 },
            Moncton: { sedan: 1150, suv: 1300 },
            Montgomery: { sedan: 850, suv: 850 },
            Monticello: { sedan: 895, suv: 895 },
            Montreal: { sedan: 1150, suv: 1300 },
            Napa: { sedan: 1595, suv: 1595 },
            Nashville: { sedan: 850, suv: 850 },
            "National Auto Dealers Exchange": { sedan: 895, suv: 895 },
            "New Castle": { sedan: 895, suv: 895 },
            "New Orleans": { sedan: 850, suv: 850 },
            Newburgh: { sedan: 895, suv: 895 },
            "North Boston": { sedan: 895, suv: 895 },
            "North Charleston - SC": { sedan: 850, suv: 850 },
            "North Hollywood": { sedan: 1595, suv: 1595 },
            "North Seattle": { sedan: 1600, suv: 1600 },
            "Northern New Jersey": { sedan: 895, suv: 895 },
            "Northern Virginia": { sedan: 895, suv: 895 },
            Ocala: { sedan: 850, suv: 850 },
            Ogden: { sedan: 1595, suv: 1595 },
            "Oklahoma City": { sedan: 1180, suv: 1180 },
            Omaha: { sedan: 1200, suv: 1200 },
            Orlando: { sedan: 850, suv: 850 },
            "Orlando North": { sedan: 850, suv: 850 },
            "Orlando South": { sedan: 850, suv: 850 },
            Ottawa: { sedan: 1150, suv: 1300 },
            Paducah: { sedan: 1200, suv: 1200 },
            Pasco: { sedan: 1600, suv: 1600 },
            Pensacola: { sedan: 850, suv: 850 },
            Peoria: { sedan: 1200, suv: 1200 },
            "Permian Basin": { sedan: 1180, suv: 1180 },
            Philadelphia: { sedan: 895, suv: 895 },
            "Philadelphia East": { sedan: 895, suv: 895 },
            Phoenix: { sedan: 1595, suv: 1595 },
            Pittsburg: { sedan: 895, suv: 895 },
            "Pittsburgh South": { sedan: 895, suv: 895 },
            "Port Murray": { sedan: 895, suv: 895 },
            Portage: { sedan: 1200, suv: 1200 },
            Portland: { sedan: 1600, suv: 1600 },
            "Portland - Gorham": { sedan: 895, suv: 895 },
            "Portland North": { sedan: 1600, suv: 1600 },
            "Portland South": { sedan: 1600, suv: 1600 },
            "Portland West": { sedan: 1600, suv: 1600 },
            Providence: { sedan: 895, suv: 895 },
            Pulaski: { sedan: 895, suv: 895 },
            "Punta Gorda": { sedan: 850, suv: 850 },
            Puyallup: { sedan: 1600, suv: 1600 },
            Quebec: { sedan: 1150, suv: 1300 },
            "Quebec city": { sedan: 1150, suv: 1300 },
            Raleigh: { sedan: 850, suv: 850 },
            "Rancho Cucamonga": { sedan: 1595, suv: 1595 },
            "Rapid City": { sedan: 1200, suv: 1200 },
            Redding: { sedan: 1595, suv: 1595 },
            Regina: { sedan: 1150, suv: 1300 },
            Reno: { sedan: 1595, suv: 1595 },
            Richmond: { sedan: 895, suv: 895 },
            Riverside: { sedan: 1595, suv: 1595 },
            Roanoke: { sedan: 895, suv: 895 },
            Rochester: { sedan: 895, suv: 895 },
            Rosedale: { sedan: 895, suv: 895 },
            Rutland: { sedan: 895, suv: 895 },
            Sacramento: { sedan: 1595, suv: 1595 },
            Salisbury: { sedan: 895, suv: 895 },
            "Salt Lake City": { sedan: 1595, suv: 1595 },
            "San Antonio": { sedan: 1180, suv: 1180 },
            "San Bernardino": { sedan: 1595, suv: 1595 },
            "San Diego": { sedan: 1595, suv: 1595 },
            "San Jose": { sedan: 1595, suv: 1595 },
            Sarasota: { sedan: 850, suv: 850 },
            Savannah: { sedan: 850, suv: 850 },
            Sayreville: { sedan: 895, suv: 895 },
            Scranton: { sedan: 895, suv: 895 },
            Seaford: { sedan: 895, suv: 895 },
            Seattle: { sedan: 1600, suv: 1600 },
            "Shady Spring, WV": { sedan: 895, suv: 895 },
            Shreveport: { sedan: 1180, suv: 1180 },
            Sikeston: { sedan: 1200, suv: 1200 },
            "Sioux Falls": { sedan: 1200, suv: 1200 },
            "So Sacramento": { sedan: 1595, suv: 1595 },
            Somerville: { sedan: 895, suv: 895 },
            "South Bend": { sedan: 1200, suv: 1200 },
            "South Boston": { sedan: 895, suv: 895 },
            "Southern Illinois": { sedan: 850, suv: 850 },
            "Southern New Jersey": { sedan: 895, suv: 895 },
            Spanaway: { sedan: 1600, suv: 1600 },
            Spartanburg: { sedan: 850, suv: 850 },
            Spokane: { sedan: 1600, suv: 1600 },
            Springfield: { sedan: 850, suv: 850 },
            "St. Cloud": { sedan: 1200, suv: 1200 },
            "St. John's": { sedan: 1150, suv: 1300 },
            "St. Louis, IL": { sedan: 850, suv: 850 },
            "St. Louis, MO": { sedan: 850, suv: 850 },
            Stockton: { sedan: 1595, suv: 1595 },
            Sudbury: { sedan: 1150, suv: 1300 },
            Suffolk: { sedan: 895, suv: 895 },
            "Sun Valley": { sedan: 1595, suv: 1595 },
            Syracuse: { sedan: 895, suv: 895 },
            Tallahassee: { sedan: 850, suv: 850 },
            Tampa: { sedan: 850, suv: 850 },
            "Tampa South": { sedan: 850, suv: 850 },
            Tanner: { sedan: 850, suv: 850 },
            Taunton: { sedan: 895, suv: 895 },
            Templeton: { sedan: 895, suv: 895 },
            Tidewater: { sedan: 895, suv: 895 },
            Tifton: { sedan: 850, suv: 850 },
            Toronto: { sedan: 1150, suv: 1300 },
            "TOTAL RESOURCE AUC CENTRL PENN": { sedan: 895, suv: 895 },
            Trenton: { sedan: 895, suv: 895 },
            Tucson: { sedan: 1595, suv: 1595 },
            Tulsa: { sedan: 1180, suv: 1180 },
            Vallejo: { sedan: 1595, suv: 1595 },
            "Van Nuys": { sedan: 1595, suv: 1595 },
            Vancouver: { sedan: 1150, suv: 1300 },
            Waco: { sedan: 1180, suv: 1180 },
            Walton: { sedan: 1200, suv: 1200 },
            WashingtonDC: { sedan: 895, suv: 895 },
            Wayland: { sedan: 1200, suv: 1200 },
            Webster: { sedan: 895, suv: 895 },
            "West Palm Beach": { sedan: 850, suv: 850 },
            "West Warren": { sedan: 895, suv: 895 },
            "Western Colorado": { sedan: 1595, suv: 1595 },
            Wheeling: { sedan: 1200, suv: 1200 },
            Wichita: { sedan: 1180, suv: 1180 },
            Wilmington: { sedan: 850, suv: 850 },
            Windham: { sedan: 895, suv: 895 },
            Winnipeg: { sedan: 1150, suv: 1300 },
            "York Haven": { sedan: 895, suv: 895 },
            "York Springs": { sedan: 895, suv: 895 },
          },
        },
      };

      const extraFees = {
        hybridFee: 150,
        oversizeMultiplier: 1.5,
        autoTransporter: { klaipeda: 1000, poti: 2000 },
        additionalServices: { service1: 100, service2: 250, service3: 450 },
      };

      function getPortRate(city, portType, autoType) {
        if (
          logisticsData.portToDestinationRates[portType] &&
          logisticsData.portToDestinationRates[portType][city]
        ) {
          return logisticsData.portToDestinationRates[portType][city][autoType];
        }
        const baseRates = {
          klaipeda: { sedan: 725, suv: 725 },
          poti: { sedan: 895, suv: 895 },
        };
        return baseRates[portType][autoType];
      }

      async function getUSDBYNRate() {
        const fallback = 3.2;
        try {
          const res = await fetch("https://api.nbrb.by/exrates/rates/431");
          if (res.ok) {
            const data = await res.json();
            if (data?.Cur_OfficialRate) return data.Cur_OfficialRate;
          }
        } catch (e) {}
        try {
          const res2 = await fetch(
            "https://api.exchangerate-api.com/v4/latest/USD"
          );
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2?.rates?.BYN) return data2.rates.BYN;
          }
        } catch (e) {}
        return fallback;
      }

      let calcTimeout = null;
      function initCalculator() {
        const locationSelect = document.getElementById("location");
        const carTypeSelect = document.getElementById("carType");
        const portSelect = document.getElementById("port");
        const isHybridCheckbox = document.getElementById("isHybrid");
        const finalTotal = document.getElementById("finalTotal");
        const finalTotalBYN = document.getElementById("finalTotalBYN");
        const oversizeWarning = document.getElementById("oversizeWarning");

        if (!locationSelect) return;
        const locations = Object.keys(logisticsData.inlandRates).sort();
        locationSelect.innerHTML =
          '<option value="">-- Выберите город или аукцион --</option>';
        locations.forEach((loc) => {
          const opt = document.createElement("option");
          opt.value = loc;
          opt.textContent = loc;
          locationSelect.appendChild(opt);
        });

        carTypeSelect.innerHTML = `<option value="sedan">Седан</option><option value="suv">SUV</option><option value="oversize">Оверсайз (тяжёлый/большой автомобиль)</option>`;

        async function calculate() {
          if (calcTimeout) clearTimeout(calcTimeout);
          calcTimeout = setTimeout(async () => {
            const location = locationSelect.value;
            const carType = carTypeSelect.value;
            const port = portSelect.value;
            const isHybrid = isHybridCheckbox.checked;
            const isOversize = carType === "oversize";

            if (oversizeWarning)
              oversizeWarning.style.display = isOversize ? "block" : "none";
            if (!location || !logisticsData.inlandRates[location]) {
              if (finalTotal) finalTotal.textContent = "— USD";
              if (finalTotalBYN) finalTotalBYN.textContent = "— BYN";
              return;
            }
            const inlandCost = logisticsData.inlandRates[location];
            let portRate = getPortRate(
              location,
              port,
              isOversize ? "sedan" : carType
            );
            if (isOversize) portRate = portRate * extraFees.oversizeMultiplier;
            const hybridFee = isHybrid ? extraFees.hybridFee : 0;
            const autoTransporterCost = extraFees.autoTransporter[port] || 0;
            const additionalServicesTotal =
              extraFees.additionalServices.service1 +
              extraFees.additionalServices.service2 +
              extraFees.additionalServices.service3;
            const finalTotalUSD =
              inlandCost +
              portRate +
              hybridFee +
              autoTransporterCost +
              additionalServicesTotal;
            if (finalTotal)
              finalTotal.textContent =
                Math.round(finalTotalUSD).toLocaleString("ru-RU") + " USD";
            const rate = await getUSDBYNRate();
            if (rate && finalTotalBYN)
              finalTotalBYN.textContent =
                "≈ " +
                Math.round(finalTotalUSD * rate).toLocaleString("ru-RU") +
                " BYN";
            else if (finalTotalBYN)
              finalTotalBYN.textContent = "— BYN (курс временно недоступен)";
          }, 80);
        }

        locationSelect.addEventListener("change", calculate);
        carTypeSelect.addEventListener("change", calculate);
        portSelect.addEventListener("change", calculate);
        isHybridCheckbox.addEventListener("change", calculate);
        calculate();
      }

      window.initCalculator = initCalculator;
    })();

    // --------------------------------------------------------------
    // 5.1 КАЛЬКУЛЯТОР НА ГЛАВНОЙ СТРАНИЦЕ - ОСНОВНОЙ
    // --------------------------------------------------------------
    (function () {
      // ============================================================
      // ПРОВЕРКА: есть ли на странице элементы таможенного калькулятора
      // ============================================================
      const customsAgeEl = document.getElementById("customsAge");
      const customsPriceEl = document.getElementById("customsPrice");

      // Если нет основных элементов - выходим (ошибок не будет)
      if (!customsAgeEl || !customsPriceEl) {
        console.log("Таможенный калькулятор не найден на этой странице");
        return;
      }

      // ============================================================
      // УПРАВЛЕНИЕ КУРСАМИ ВАЛЮТ
      // ============================================================

      // Ключ для хранения курса в localStorage
      const EUR_RATE_STORAGE_KEY = "eur_to_byn_rate";
      const RATE_TIMESTAMP_KEY = "eur_rate_timestamp";

      // Курс по умолчанию (запасной вариант, если API недоступен)
      const DEFAULT_EUR_RATE = 3.5;

      let currentEurRate = DEFAULT_EUR_RATE;

      // Функция получения курса EUR к BYN
      async function fetchEurRate() {
        try {
          const response = await fetch(
            "https://api.exchangerate-api.com/v4/latest/EUR"
          );
          const data = await response.json();
          if (data && data.rates && data.rates.BYN) {
            currentEurRate = data.rates.BYN;
            localStorage.setItem(
              EUR_RATE_STORAGE_KEY,
              currentEurRate.toString()
            );
            localStorage.setItem(RATE_TIMESTAMP_KEY, Date.now().toString());
            console.log("Курс EUR/BYN обновлен:", currentEurRate);
            return currentEurRate;
          } else {
            throw new Error("Курс BYN не найден в ответе API");
          }
        } catch (error) {
          console.warn("Ошибка получения курса:", error);
          const savedRate = localStorage.getItem(EUR_RATE_STORAGE_KEY);
          if (savedRate && !isNaN(parseFloat(savedRate))) {
            currentEurRate = parseFloat(savedRate);
            console.log("Использован сохраненный курс:", currentEurRate);
          } else {
            currentEurRate = DEFAULT_EUR_RATE;
            console.log("Использован курс по умолчанию:", currentEurRate);
          }
          return currentEurRate;
        }
      }

      // ============================================================
      // ТАМОЖЕННЫЙ КАЛЬКУЛЯТОР НА ОСНОВЕ ПРЕДОСТАВЛЕННОЙ ТАБЛИЦЫ
      // ============================================================

      const ageUnder3Rates = [
        { maxPrice: 8500, percent: 54, minPerCubic: 2.5 },
        { maxPrice: 16700, percent: 48, minPerCubic: 3.5 },
        { maxPrice: 42300, percent: 48, minPerCubic: 5.5 },
        { maxPrice: 84500, percent: 48, minPerCubic: 7.5 },
        { maxPrice: 169000, percent: 48, minPerCubic: 15 },
        { maxPrice: Infinity, percent: 48, minPerCubic: 20 },
      ];

      const age3to5Rates = [
        { maxVolume: 1000, ratePerCubic: 1.5 },
        { maxVolume: 1500, ratePerCubic: 1.7 },
        { maxVolume: 1800, ratePerCubic: 2.5 },
        { maxVolume: 2300, ratePerCubic: 2.7 },
        { maxVolume: 3000, ratePerCubic: 3.0 },
        { maxVolume: Infinity, ratePerCubic: 3.6 },
      ];

      const ageOver5Rates = [
        { maxVolume: 1000, ratePerCubic: 3.0 },
        { maxVolume: 1500, ratePerCubic: 3.2 },
        { maxVolume: 1800, ratePerCubic: 3.5 },
        { maxVolume: 2300, ratePerCubic: 4.8 },
        { maxVolume: 3000, ratePerCubic: 5.0 },
        { maxVolume: Infinity, ratePerCubic: 5.7 },
      ];

      const VAT_RATE = 0.2; // 20% НДС для юридических лиц

      // Утилизационный сбор в БЕЛАРУССКИХ РУБЛЯХ (BYN)
      // Для физических лиц
      const UTIL_FEE_PERSON_UNDER_3 = 624.92; // BYN - до 3 лет
      const UTIL_FEE_PERSON_3_TO_5 = 1282.02; // BYN - от 3 до 5 лет
      const UTIL_FEE_PERSON_OVER_5 = 1282.02; // BYN - более 5 лет

      function getDutyRateUnder3(price) {
        for (const rate of ageUnder3Rates) {
          if (price <= rate.maxPrice) {
            return { percent: rate.percent, minPerCubic: rate.minPerCubic };
          }
        }
        return { percent: 48, minPerCubic: 20 };
      }

      function getDutyRate3to5(volume) {
        for (const rate of age3to5Rates) {
          if (volume <= rate.maxVolume) {
            return rate.ratePerCubic;
          }
        }
        return 3.6;
      }

      function getDutyRateOver5(volume) {
        for (const rate of ageOver5Rates) {
          if (volume <= rate.maxVolume) {
            return rate.ratePerCubic;
          }
        }
        return 5.7;
      }

      // Расчет таможенной пошлины для авто с ДВС
      function calculateDutyForFuel(age, price, volume) {
        if (age === 0) {
          // до 3 лет
          const rate = getDutyRateUnder3(price);
          const byPercent = price * (rate.percent / 100);
          const byVolume = volume * rate.minPerCubic;
          return Math.max(byPercent, byVolume);
        } else if (age === 1) {
          // от 3 до 5 лет
          const ratePerCubic = getDutyRate3to5(volume);
          return volume * ratePerCubic;
        } else {
          // старше 5 лет
          const ratePerCubic = getDutyRateOver5(volume);
          return volume * ratePerCubic;
        }
      }

      // Расчёт НДС 20% для юридических лиц (на стоимость ТС + таможенная пошлина)
      function calculateVAT(price, duty, customsEntity) {
        if (customsEntity === "person") return 0; // Для физлиц НДС 0%
        const vatBase = price + duty; // База: стоимость авто + таможенная пошлина
        return vatBase * VAT_RATE;
      }

      // Расчёт утилизационного сбора (В БЕЛАРУССКИХ РУБЛЯХ)
      function calculateUtilFee(age, customsEntity) {
        // Утильсбор одинаковый для физических и юридических лиц
        if (age === 0) {
          return 624.92; // до 3 лет
        } else if (age === 1) {
          return 1282.02; // от 3 до 5 лет
        } else {
          return 1282.02; // более 5 лет
        }
      }

      function validateFields(price, volume, engineType, customsEntity) {
        let isValid = true;
        document.querySelectorAll(".error-message").forEach((el) => {
          el.classList.remove("show");
          el.textContent = "";
        });
        document.querySelectorAll(".form-control").forEach((el) => {
          el.classList.remove("error");
        });

        if (!price || price <= 0) {
          const priceError = document.getElementById("priceError");
          const priceInput = document.getElementById("customsPrice");
          if (priceError) {
            priceError.textContent =
              "Укажите стоимость автомобиля (больше 0 €)";
            priceError.classList.add("show");
          }
          if (priceInput) priceInput.classList.add("error");
          isValid = false;
        } else if (price > 1000000) {
          const priceError = document.getElementById("priceError");
          const priceInput = document.getElementById("customsPrice");
          if (priceError) {
            priceError.textContent = "Стоимость не может превышать 1 000 000 €";
            priceError.classList.add("show");
          }
          if (priceInput) priceInput.classList.add("error");
          isValid = false;
        }

        if (engineType === "fuel") {
          if (!volume || volume <= 0) {
            const volumeError = document.getElementById("volumeError");
            const volumeInput = document.getElementById("customsVolume");
            if (volumeError) {
              volumeError.textContent =
                "Укажите объём двигателя (больше 0 см³)";
              volumeError.classList.add("show");
            }
            if (volumeInput) volumeInput.classList.add("error");
            isValid = false;
          } else if (volume > 10000) {
            const volumeError = document.getElementById("volumeError");
            const volumeInput = document.getElementById("customsVolume");
            if (volumeError) {
              volumeError.textContent = "Объём не может превышать 10 000 см³";
              volumeError.classList.add("show");
            }
            if (volumeInput) volumeInput.classList.add("error");
            isValid = false;
          }
        }
        return isValid;
      }

      function toggleFieldsByEntityAndEngine() {
        const customsEntityRadio = document.querySelector(
          'input[name="customsEntity"]:checked'
        );
        const customsEntity = customsEntityRadio
          ? customsEntityRadio.value
          : "person";
        const engineTypeRadio = document.querySelector(
          'input[name="engineType"]:checked'
        );
        const engineType = engineTypeRadio ? engineTypeRadio.value : "fuel";
        const engineVolumeGroup = document.getElementById("engineVolumeGroup");
        const fuelTypeGroup = document.getElementById("fuelTypeGroup");
        const discountGroup = document.getElementById("discountGroup");
        const entityHint = document.getElementById("entityHint");

        if (engineType === "electric") {
          if (engineVolumeGroup) engineVolumeGroup.style.display = "none";
          // Скрываем льготу 50% для электромобилей
          if (discountGroup) discountGroup.style.display = "none";
          const discountCheckbox = document.getElementById("customsDiscount");
          if (discountCheckbox) discountCheckbox.checked = false;
        } else {
          if (engineVolumeGroup) engineVolumeGroup.style.display = "block";
          // Показываем льготу только для ДВС и только для физлиц
          if (customsEntity === "person") {
            if (discountGroup) discountGroup.style.display = "block";
          }
        }

        if (fuelTypeGroup) fuelTypeGroup.style.display = "none";

        if (entityHint) {
          if (customsEntity === "person") {
            entityHint.textContent =
              "💡 Для физических лиц: НДС отсутствует. Таможенная пошлина рассчитывается по ставкам. Утильсбор в BYN (конвертируется в € для итога).";
          } else {
            entityHint.textContent =
              "💡 Для юридических лиц: НДС 20% начисляется на стоимость автомобиля + таможенную пошлину. Утильсбор в BYN (конвертируется в € для итога).";
          }
        }

        // Для ДВС: показываем льготу только физлицам
        if (engineType !== "electric") {
          if (customsEntity === "person") {
            if (discountGroup) discountGroup.style.display = "block";
          } else {
            if (discountGroup) discountGroup.style.display = "none";
            const discountCheckbox = document.getElementById("customsDiscount");
            if (discountCheckbox) discountCheckbox.checked = false;
          }
        }

        const exciseRow = document.getElementById("exciseRow");
        const vatRow = document.getElementById("vatRow");

        if (customsEntity === "person") {
          if (exciseRow) exciseRow.style.display = "none";
          if (vatRow) vatRow.style.display = "none";
        } else {
          if (exciseRow) exciseRow.style.display = "none";
          if (vatRow) vatRow.style.display = "flex";
        }
      }

      function calculateCustoms() {
        const age = parseInt(document.getElementById("customsAge")?.value) || 0;
        const price =
          parseFloat(document.getElementById("customsPrice")?.value) || 0;
        const customsEntityRadio = document.querySelector(
          'input[name="customsEntity"]:checked'
        );
        const customsEntity = customsEntityRadio
          ? customsEntityRadio.value
          : "person";
        const engineTypeRadio = document.querySelector(
          'input[name="engineType"]:checked'
        );
        const engineType = engineTypeRadio ? engineTypeRadio.value : "fuel";
        const discountCheckbox = document.getElementById("customsDiscount");
        const hasDiscount = discountCheckbox ? discountCheckbox.checked : false;

        let duty = 0;
        let vat = 0;
        let utilFee = 0;
        let total = 0;

        let volume = 0;
        if (engineType === "fuel") {
          const volumeEl = document.getElementById("customsVolume");
          volume = volumeEl ? parseFloat(volumeEl.value) || 0 : 0;
        }

        if (!validateFields(price, volume, engineType, customsEntity)) {
          updateResult(0, 0, 0, 0, customsEntity, price);
          return;
        }

        // Расчет утильсбора в BYN
        utilFee = calculateUtilFee(age, customsEntity);

        // Расчет таможенной пошлины
        if (engineType === "electric") {
          duty = 0;
        } else {
          if (price > 0 && volume > 0) {
            duty = calculateDutyForFuel(age, price, volume);
          }
        }

        // Расчет НДС (для юрлиц 20% от стоимости ТС + пошлина, для физлиц 0)
        vat = calculateVAT(price, duty, customsEntity);

        // Конвертация утильсбора из BYN в EUR для итоговой суммы
        const utilFeeInEUR = utilFee / currentEurRate;

        // Скидка 50% на пошлину для физлиц (только пошлина, не НДС и не утильсбор)
        if (customsEntity === "person" && hasDiscount) {
          duty = duty * 0.5;
        }

        // ИТОГОВАЯ СУММА: БЕЗ стоимости автомобиля! Только пошлина + НДС + утильсбор
        total = duty + vat + utilFeeInEUR;

        updateResult(duty, vat, total, utilFee, customsEntity, price);
      }

      function updateResult(duty, vat, total, utilFee, customsEntity, price) {
        const dutyEl = document.getElementById("dutyAmount");
        const exciseEl = document.getElementById("exciseAmount");
        const vatEl = document.getElementById("vatAmount");
        const totalEl = document.getElementById("totalCustoms");
        const utilFeeEl = document.getElementById("utilFeeAmount");
        const totalBYNEl = document.getElementById("totalBYNAmount");
        const carPriceEl = document.getElementById("carPriceAmount");

        const roundedDuty = Math.round(duty * 100) / 100;
        const roundedVat = Math.round(vat * 100) / 100;
        const roundedUtilFee = Math.round(utilFee * 100) / 100;
        const roundedTotal = Math.round(total * 100) / 100;
        const roundedTotalBYN = Math.round(total * currentEurRate * 100) / 100;
        const roundedPrice = Math.round(price * 100) / 100;

        // Отображаем стоимость автомобиля (только для информации, не участвует в итоге)
        if (carPriceEl) {
          carPriceEl.textContent = roundedPrice.toLocaleString("ru-RU") + " €";
        }

        if (dutyEl)
          dutyEl.textContent = roundedDuty.toLocaleString("ru-RU") + " €";
        if (exciseEl) exciseEl.textContent = "0 €";
        if (vatEl) {
          if (customsEntity === "legal") {
            vatEl.textContent = roundedVat.toLocaleString("ru-RU") + " €";
          } else {
            vatEl.textContent = "0 €";
          }
        }
        if (utilFeeEl)
          utilFeeEl.textContent =
            roundedUtilFee.toLocaleString("ru-RU") + " BYN";
        if (totalEl)
          totalEl.textContent = roundedTotal.toLocaleString("ru-RU") + " €";
        if (totalBYNEl)
          totalBYNEl.textContent =
            roundedTotalBYN.toLocaleString("ru-RU") + " BYN";

        // Детальная информация о расчете НДС для юрлиц
        const vatInfoDetail = document.getElementById("vatInfoDetail");
        if (vatInfoDetail && customsEntity === "legal") {
          const currentPrice =
            price ||
            parseFloat(document.getElementById("customsPrice")?.value) ||
            0;
          const vatBase = currentPrice + duty;
          vatInfoDetail.style.display = "block";
          vatInfoDetail.innerHTML = `<small>💰 НДС 20% начислен на сумму: ${vatBase.toLocaleString(
            "ru-RU"
          )} € (стоимость ТС ${currentPrice.toLocaleString(
            "ru-RU"
          )} € + пошлина ${duty.toLocaleString("ru-RU")} €)</small>`;
        } else if (vatInfoDetail) {
          vatInfoDetail.style.display = "none";
        }
      }

      async function initCustomsCalculator() {
        await fetchEurRate();

        const ageEl = document.getElementById("customsAge");
        const priceEl = document.getElementById("customsPrice");
        const volumeEl = document.getElementById("customsVolume");

        if (ageEl) ageEl.addEventListener("input", calculateCustoms);
        if (priceEl) priceEl.addEventListener("input", calculateCustoms);
        if (volumeEl) volumeEl.addEventListener("input", calculateCustoms);

        document
          .querySelectorAll('input[name="customsEntity"]')
          .forEach((radio) => {
            radio.addEventListener("change", () => {
              toggleFieldsByEntityAndEngine();
              calculateCustoms();
            });
          });

        document
          .querySelectorAll('input[name="engineType"]')
          .forEach((radio) => {
            radio.addEventListener("change", () => {
              toggleFieldsByEntityAndEngine();
              calculateCustoms();
            });
          });

        const discountCheckbox = document.getElementById("customsDiscount");
        if (discountCheckbox) {
          discountCheckbox.addEventListener("change", calculateCustoms);
        }

        toggleFieldsByEntityAndEngine();
        calculateCustoms();
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCustomsCalculator);
      } else {
        initCustomsCalculator();
      }
    })();

    // --------------------------------------------------------------
    // 6. RS-Motors CAR SLIDER
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
  // 11. КНОПКА СКРОЛЛА НАВЕРХ (исправленная версия)
  // --------------------------------------------------------------
  (function initScrollToTop() {
    // Функция создания кнопки
    function createScrollButton() {
      // Проверяем, существует ли уже кнопка
      if (document.getElementById("scrollToTopBtn")) return;

      const btn = document.createElement("button");
      btn.id = "scrollToTopBtn";
      btn.className = "scroll-to-top";
      btn.setAttribute("aria-label", "Прокрутить наверх");
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 4l-8 8h6v8h4v-8h6z" fill="currentColor"/></svg>`;
      document.body.appendChild(btn);
    }

    // Функция прокрутки наверх (универсальная)
    function scrollToTop() {
      // Вариант 1: плавная прокрутка для современных браузеров
      if (window.scrollTo && typeof window.scrollTo === "function") {
        try {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
          return;
        } catch (e) {
          // Если smooth не поддерживается, используем fallback
        }
      }

      // Вариант 2: альтернативная плавная прокрутка через requestAnimationFrame
      const startPosition =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      if (startPosition === 0) return;

      let startTime = null;
      const duration = 500; // длительность анимации в мс

      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        // easing функция для плавности
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const scrollPosition = startPosition * (1 - easeProgress);

        window.scrollTo(0, scrollPosition);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          window.scrollTo(0, 0);
        }
      }

      requestAnimationFrame(animation);
    }

    // Функция для определения видимости кнопки (с учётом разных браузеров)
    function toggleButtonVisibility() {
      const scrollBtn = document.getElementById("scrollToTopBtn");
      if (!scrollBtn) return;

      // Получаем текущую позицию скролла (кросс-браузерно)
      const scrollPosition =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      if (scrollPosition > 400) {
        scrollBtn.classList.add("show");
      } else {
        scrollBtn.classList.remove("show");
      }
    }

    // Функция инициализации
    function init() {
      // Создаём кнопку
      createScrollButton();

      const scrollBtn = document.getElementById("scrollToTopBtn");
      if (!scrollBtn) return;

      // Удаляем старые обработчики, если есть
      const newBtn = scrollBtn.cloneNode(true);
      scrollBtn.parentNode.replaceChild(newBtn, scrollBtn);

      // Добавляем новый обработчик
      newBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        scrollToTop();
      });

      // Слушаем событие скролла с оптимизацией (passive)
      window.addEventListener("scroll", toggleButtonVisibility, {
        passive: true,
      });

      // Также проверяем видимость при загрузке и изменении размера окна
      window.addEventListener("resize", toggleButtonVisibility);

      // Запускаем проверку видимости
      toggleButtonVisibility();
    }

    // Запускаем инициализацию после полной загрузки DOM
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();

  // --------------------------------------------------------------
  // 12 ФУНКЦИИ ДЛЯ МОДАЛЬНОГО ОКНА ФОРМЫ
  // --------------------------------------------------------------

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

  // --------------------------------------------------------------
  // 13. КУРСЫ ВАЛЮТ (АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ)
  // --------------------------------------------------------------
  const currencyWidget = document.getElementById("liveEur");

  if (currencyWidget) {
    // Функция получения курсов с API НБРБ
    async function fetchExchangeRates() {
      try {
        // Используем API Национального банка Республики Беларусь
        const response = await fetch(
          "https://api.nbrb.by/exrates/rates?periodicity=0"
        );

        if (!response.ok) {
          throw new Error("Ошибка загрузки курсов");
        }

        const data = await response.json();

        // Находим курсы EUR и USD
        const eurRate = data.find((rate) => rate.Cur_Abbreviation === "EUR");
        const usdRate = data.find((rate) => rate.Cur_Abbreviation === "USD");

        if (eurRate && usdRate) {
          // Обновляем виджет с курсами
          updateCurrencyDisplay(
            eurRate.Cur_OfficialRate,
            usdRate.Cur_OfficialRate
          );

          // Сохраняем в localStorage для кэширования
          const cacheData = {
            eur: eurRate.Cur_OfficialRate,
            usd: usdRate.Cur_OfficialRate,
            date: new Date().toISOString(),
            eurDate: eurRate.Date,
            usdDate: usdRate.Date,
          };
          localStorage.setItem("currencyRates", JSON.stringify(cacheData));
        } else {
          throw new Error("Курсы не найдены");
        }
      } catch (error) {
        console.error("Ошибка получения курсов:", error);

        // Пытаемся загрузить из кэша
        const cachedData = localStorage.getItem("currencyRates");
        if (cachedData) {
          const cache = JSON.parse(cachedData);
          updateCurrencyDisplay(cache.eur, cache.usd, true);
        } else {
          // Если нет кэша, показываем заглушку
          currencyWidget.innerHTML =
            '<div class="currency-error">Данные временно недоступны</div>';
        }
      }
    }

    // Функция обновления отображения курсов
    function updateCurrencyDisplay(eur, usd, isCached = false) {
      // Форматируем числа (2 знака после запятой)
      const eurFormatted = eur.toFixed(2);
      const usdFormatted = usd.toFixed(2);

      // Получаем текущую дату
      const today = new Date();
      const dateStr = today.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Создаем HTML структуру
      const html = `
          <div class="currency-rates">
            <div class="currency-row">
              <span class="currency-label">🇪🇺 EUR/BYN:</span>
              <strong class="currency-value">${eurFormatted}</strong>
            </div>
            <div class="currency-row">
              <span class="currency-label">🇺🇸 USD/BYN:</span>
              <strong class="currency-value">${usdFormatted}</strong>
            </div>
            <div class="currency-date">
              Актуально на ${dateStr}${isCached ? " (кэшированные данные)" : ""}
            </div>
          </div>
        `;

      currencyWidget.innerHTML = html;
    }

    // Функция проверки необходимости обновления (раз в день)
    function shouldUpdateCache() {
      const cachedData = localStorage.getItem("currencyRates");
      if (!cachedData) return true;

      const cache = JSON.parse(cachedData);
      const cacheDate = new Date(cache.date);
      const today = new Date();

      // Сравниваем даты (игнорируя время)
      return cacheDate.toDateString() !== today.toDateString();
    }

    // Основная функция загрузки с проверкой кэша
    async function loadRates() {
      // Проверяем, нужно ли обновлять данные
      if (shouldUpdateCache()) {
        await fetchExchangeRates();
      } else {
        // Загружаем из кэша
        const cachedData = localStorage.getItem("currencyRates");
        if (cachedData) {
          const cache = JSON.parse(cachedData);
          updateCurrencyDisplay(cache.eur, cache.usd, true);
        } else {
          await fetchExchangeRates();
        }
      }
    }

    // Загружаем курсы при загрузке страницы
    loadRates();

    // Устанавливаем интервал проверки каждый час
    setInterval(() => {
      if (shouldUpdateCache()) {
        fetchExchangeRates();
      }
    }, 3600000); // 1 час
  }
})();
