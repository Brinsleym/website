document.addEventListener("DOMContentLoaded", function () {
  'use strict';

  /* =======================
  // Menu
  ======================= */
  var body = document.querySelector("body"),
  menuOpenIcon = document.querySelector(".nav__icon-menu"),
  menuCloseIcon = document.querySelector(".nav__icon-close"),
  menuList = document.querySelector(".main-nav");

  menuOpenIcon.addEventListener("click", () => {
    menuOpen();
  });

  menuCloseIcon.addEventListener("click", () => {
    menuClose();
  });

  function menuOpen() {
    menuList.classList.add("is-open");
  }

  function menuClose() {
    menuList.classList.remove("is-open");
  }

  /* =======================
  // Animation Load Page
  ======================= */
  setTimeout(function(){
    body.classList.add("is-in");
  },150)

  /* ==================================
  // Stop Animations After All Have Run
  ================================== */
  setTimeout(function(){
    body.classList.add("stop-animations");
  },1500)

  /* ======================================
  // Stop Animations During Window Resizing
  ====================================== */
  let resizeTimer;
  window.addEventListener("resize", () => {
    document.body.classList.add("resize-animation-stopper");
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.body.classList.remove("resize-animation-stopper");
    }, 300);
  });


  /* =======================
  // Responsive Videos
  ======================= */
  reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off)");


  /* =======================
  // Zoom Image
  ======================= */
  const lightense = document.querySelector(".page img, .post img"),
  imageLink = document.querySelectorAll(".page a img, .post a img");

  if (imageLink) {
    for (var i = 0; i < imageLink.length; i++) imageLink[i].parentNode.classList.add("image-link");
    for (var i = 0; i < imageLink.length; i++) imageLink[i].classList.add("no-lightense");
  }

  if (lightense) {
    Lightense(".page img:not(.no-lightense), .post img:not(.no-lightense)", {
    padding: 60,
    offset: 30
    });
  }

  /* ============================
  // Smooth scrolling to section
  ============================ */
  document.querySelectorAll(".works-button").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth"
      });
    });
  });

  /* ============================
  // Smooth scrolling for CTA button
  ============================ */
  document.querySelectorAll(".cta-button").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      
      // Only apply smooth scrolling if it's an anchor link (starts with #)
      if (href && href.startsWith("#")) {
        e.preventDefault();
        
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }
    });
  });


  /* ============================
  // Testimonials Slider
  ============================ */
  if (document.querySelector(".my-slider")) {
    var slider = tns({
      container: ".my-slider",
      items: 3,
      slideBy: 1,
      gutter: 20,
      nav: false,
      mouseDrag: true,
      autoplay: false,
      controlsContainer: "#customize-controls",
      responsive: {
        1024: {
          items: 3,
        },
        768: {
          items: 2,
        },
        0: {
          items: 1,
        }
      }
    });
  }


  /* ============================
  // iTyped
  ============================ */
  if (document.querySelector(".c-subscribe")) {
    var options = {
      strings: itype_text,
      typeSpeed: 100,
      backSpeed: 50,
      startDelay: 200,
      backDelay: 1500,
      loop: true,
      showCursor: true,
      cursorChar: "|",
      onFinished: function(){}
    }

    ityped.init('#ityped', options);
  }


  /* ============================
  // Scroll to top
  ============================ */
  const btnScrollToTop = document.querySelector(".top");

  window.addEventListener("scroll", function () {
    window.scrollY > window.innerHeight ? btnScrollToTop.classList.add("is-active") : btnScrollToTop.classList.remove("is-active");
  });

  btnScrollToTop.addEventListener("click", function () {
    if (window.scrollY != 0) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      })
    }
  });


  /* ============================
  // Contact form entrance animation
  ============================ */
  const contactForm = document.querySelector("#contact");
  
  if (contactForm) {
    if (window.IntersectionObserver) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      };
      
      // Set initial state
      contactForm.style.opacity = "0";
      contactForm.style.transform = "translateY(30px)";
      contactForm.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      observer.observe(contactForm);
    } else {
      // Fallback for browsers without IntersectionObserver support
      contactForm.style.opacity = "1";
      contactForm.style.transform = "translateY(0)";
    }
  }

  /* ======================================
  // Pagination Controls
  ====================================== */
  function initPagination() {
    const paginationElements = document.querySelectorAll('[data-pagebreak-control]');
    
    if (paginationElements.length === 0) return;

    // Initialize pagination state
    let currentPage = 1;
    let totalPages = 1;

    // Function to update pagination visibility
    function updatePaginationControls() {
      const hasPrev = currentPage > 1;
      const hasNext = currentPage < totalPages;

      // Handle prev controls
      const prevControls = document.querySelectorAll('[data-pagebreak-control="prev"]');
      const noPrevControls = document.querySelectorAll('[data-pagebreak-control="!prev"]');
      
      prevControls.forEach(el => el.style.display = hasPrev ? '' : 'none');
      noPrevControls.forEach(el => el.style.display = hasPrev ? 'none' : '');

      // Handle next controls
      const nextControls = document.querySelectorAll('[data-pagebreak-control="next"]');
      const noNextControls = document.querySelectorAll('[data-pagebreak-control="!next"]');
      
      nextControls.forEach(el => el.style.display = hasNext ? '' : 'none');
      noNextControls.forEach(el => el.style.display = hasNext ? 'none' : '');

      // Update page labels
      const currentLabels = document.querySelectorAll('[data-pagebreak-label="current"]');
      const totalLabels = document.querySelectorAll('[data-pagebreak-label="total"]');
      
      currentLabels.forEach(el => el.textContent = currentPage);
      totalLabels.forEach(el => el.textContent = totalPages);
    }

    // For now, set to single page (you can modify this based on actual content)
    totalPages = 1;
    currentPage = 1;
    
    updatePaginationControls();
  }

  // Initialize pagination
  initPagination();

});