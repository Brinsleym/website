document.addEventListener("DOMContentLoaded", function () {
  'use strict';

  /* ============================
  // Lazy loading for images function
  ============================ */
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if (lazyImages.length > 0) {
      if (window.IntersectionObserver) {
        const imageObserverOptions = {
          threshold: 0.1,
          rootMargin: "-100px 0px -100px 0px"
        };
        
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.remove('lazy-load');
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          });
        }, imageObserverOptions);
        
        lazyImages.forEach(img => {
          // Add lazy class for CSS transition
          img.classList.add('lazy');
          
          // Handle load event to show image
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
          
          imageObserver.observe(img);
        });
      } else {
        // Fallback for browsers without IntersectionObserver support
        lazyImages.forEach(img => {
          img.src = img.dataset.src;
          img.classList.remove('lazy-load');
          img.classList.add('loaded');
        });
      }
    }
  }

  /* =======================
  // Menu
  ======================= */
  var body = document.querySelector("body"),
  menuOpenIcon = document.querySelector(".nav__icon-menu"),
  menuCloseIcon = document.querySelector(".nav__icon-close"),
  menuList = document.querySelector(".main-nav");

  function menuOpen() {
    if (menuList) menuList.classList.add("is-open");
  }

  function menuClose() {
    if (menuList) menuList.classList.remove("is-open");
  }

  // Guarded: a page without the menu markup must not stop
  // everything below this point from being set up.
  if (menuOpenIcon) menuOpenIcon.addEventListener("click", menuOpen);
  if (menuCloseIcon) menuCloseIcon.addEventListener("click", menuClose);

  // Close the menu on Escape, and when a link inside it is followed.
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.keyCode === 27) && menuList &&
        menuList.classList.contains("is-open")) {
      menuClose();
    }
  });

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
  if (typeof reframe !== 'undefined') {
    reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off)");
  }


  /* =======================
  // Zoom Image
  //
  // Replaces the Lightense library, which had two
  // faults. It triggered the opening transform from a
  // 20ms timer, so on a busy frame the browser painted
  // both states at once and the image jumped straight
  // to full size instead of animating. And it moved the
  // image into a wrapper element, restoring it 300ms
  // after a close from a timer that read shared state,
  // so closing and reopening quickly unwrapped the
  // newly opened image and stranded it half zoomed.
  //
  // Here the transform is committed on an animation
  // frame after a forced reflow, and the image is never
  // moved in the DOM, so neither fault can occur.
  ======================= */
  const imageLink = document.querySelectorAll(".page a img, .post a img");

  for (let i = 0; i < imageLink.length; i++) {
    imageLink[i].parentNode.classList.add("image-link");
    imageLink[i].classList.add("no-zoom");
  }

  function initImageZoom() {
    const SELECTOR = ".page img:not(.no-zoom), .post img:not(.no-zoom)";
    const DURATION = 300;      // must match the CSS transition
    const PADDING = 60;        // breathing room around the zoomed image
    const SCROLL_CLOSE = 30;   // px of scrolling that dismisses it
    const RADIUS = 8;          // visual corner radius while zoomed

    const images = document.querySelectorAll(SELECTOR);
    if (!images.length) return;

    const reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const backdrop = document.createElement("div");
    backdrop.className = "img-zoom-backdrop";
    document.body.appendChild(backdrop);

    let openImage = null;
    let startScroll = 0;
    let lastFocus = null;
    let session = 0; // invalidates the pending teardown of an earlier zoom

    function close() {
      if (!openImage) return;

      const img = openImage;
      const mine = ++session;
      openImage = null;

      img.style.transform = "";
      img.style.borderRadius = "";
      img.classList.remove("is-zoomed");
      img.setAttribute("aria-expanded", "false");
      backdrop.classList.remove("is-open");

      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);

      // Hold the stacking context until the image has shrunk back,
      // but only if no new zoom has started in the meantime.
      window.setTimeout(function () {
        if (session === mine) img.classList.remove("is-zooming");
      }, reduceMotion ? 0 : DURATION);

      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
      lastFocus = null;
    }

    function open(img) {
      if (openImage === img) { close(); return; }
      if (openImage) close();

      const rect = img.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = document.documentElement.clientHeight || window.innerHeight;
      const availW = Math.max(vw - PADDING * 2, 1);
      const availH = Math.max(vh - PADDING * 2, 1);

      // Fit the image inside the viewport. This can be below 1 for a tall
      // image that is already wider than the screen can show, which is the
      // point: the zoom is there to reveal the whole picture.
      let scale = Math.min(availW / rect.width, availH / rect.height);
      // Never enlarge past the file's own resolution. naturalWidth is 0 until
      // the file has decoded, in which case there is nothing to cap against.
      if (img.naturalWidth) scale = Math.min(scale, img.naturalWidth / rect.width);
      if (!isFinite(scale) || scale <= 0) scale = 1;

      const dx = Math.round(vw / 2 - (rect.left + rect.width / 2));
      const dy = Math.round(vh / 2 - (rect.top + rect.height / 2));

      session++;
      openImage = img;
      startScroll = window.scrollY || window.pageYOffset || 0;
      lastFocus = document.activeElement;

      img.classList.add("is-zooming", "is-zoomed");
      img.setAttribute("aria-expanded", "true");
      backdrop.classList.add("is-open");

      // Force the starting state to be recalculated before the transform is
      // set. Reading offsetWidth flushes the pending style change, so the two
      // states land in separate recalculations and the transition runs. The
      // old library used a 20ms timer for this, which could fire before the
      // first state had been committed and made the zoom jump instantly.
      // A layout read is used rather than requestAnimationFrame because rAF
      // does not fire in a hidden tab, which would leave the image untouched.
      void img.offsetWidth;

      img.style.transform =
        "translate3d(" + dx + "px, " + dy + "px, 0) scale(" + scale + ")";
      // Divide by the scale so the corners look the same however far the
      // image has been enlarged.
      img.style.borderRadius = (RADIUS / scale).toFixed(2) + "px";

      window.addEventListener("scroll", onScroll, false);
      window.addEventListener("resize", close, false);
      document.addEventListener("keydown", onKey, false);
    }

    function onScroll() {
      const now = window.scrollY || window.pageYOffset || 0;
      if (Math.abs(startScroll - now) >= SCROLL_CLOSE) close();
    }

    function onKey(e) {
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        close();
      }
    }

    backdrop.addEventListener("click", close, false);

    images.forEach(img => {
      if (!img.getAttribute("src")) return;

      img.classList.add("img-zoom-target");
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-expanded", "false");

      img.addEventListener("click", function (e) {
        // Ctrl or Cmd click opens the file itself, as the old library did.
        if (e.metaKey || e.ctrlKey) {
          window.open(img.src, "_blank", "noopener");
          return;
        }
        e.preventDefault();
        open(img);
      });

      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          open(img);
        }
      });
    });
  }

  initImageZoom();

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
  const sliderElement = document.querySelector(".my-slider");
  
  if (sliderElement && typeof tns !== 'undefined') {
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
    
    // Initialize lazy loading after slider is set up
    setTimeout(() => {
      initLazyLoading();
    }, 200);
  } else {
    // Initialize lazy loading immediately if no slider
    initLazyLoading();
  }


  /* ============================
  // iTyped
  ============================ */
  if (document.querySelector(".c-subscribe") && typeof ityped !== 'undefined') {
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

  if (btnScrollToTop) {
    window.addEventListener("scroll", function () {
      btnScrollToTop.classList.toggle("is-active", window.scrollY > window.innerHeight);
    }, { passive: true });

    btnScrollToTop.addEventListener("click", function () {
      if (window.scrollY != 0) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth"
        })
      }
    });
  }


  /* ============================
  // Contact section entrance animation
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

    // Update pagination visibility
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

    totalPages = 1;
    currentPage = 1;
    
    updatePaginationControls();
  }

  initPagination();

  /* ============================
  // Remove image-specific context menu options
  ============================ */
    function removeImageContextOptions() {
        
        const style = document.createElement('style');
        style.textContent = `
            img {
                pointer-events: none !important;
            }

            /* Re-enable for images inside links (like jsdelivr-figure) that should be clickable */
            a img {
                pointer-events: auto !important;
            }

            /* Re-enable for zoomable images */
            .page img:not(.no-zoom),
            .post img:not(.no-zoom) {
                pointer-events: auto !important;
            }

            /* Disable for card component images */
            .c-project-card a img,
            .c-blog-card a img,
            .c-compositions-card a img,
            .c-testimonial-card a img {
                pointer-events: none !important;
            }

            /* Re-enable on hover for accessibility (screen readers, etc.) */
            img:hover,
            .c-project-card a img:hover,
            .c-blog-card a img:hover,
            .c-compositions-card a img:hover,
            .c-testimonial-card a img:hover {
                pointer-events: auto !important;
            }
        `;
        document.head.appendChild(style);
    }
  removeImageContextOptions();

  /* ============================
  // Email copy to clipboard functionality
  ============================ */
  function initEmailCopyToClipboard() {
    const copyButton = document.getElementById('copy-button');
    const emailAddress = document.getElementById('email-address');
    const copyFeedback = document.getElementById('copy-feedback');
    
    if (copyButton && emailAddress && copyFeedback) {
      copyButton.addEventListener('click', async function(e) {
        // Ensure we have a user gesture
        e.preventDefault();
        const email = emailAddress.textContent.trim();
        
        
        // For mobile browsers, try a more direct approach first
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // On mobile, try the fallback method first as it's more reliable
          fallbackCopyToClipboard(email);
          return;
        }
        
        // For desktop, try modern clipboard API first
        try {
          if (navigator.clipboard?.writeText) {
            // Add timeout for clipboard operations
            const clipboardPromise = navigator.clipboard.writeText(email);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Clipboard timeout')), 3000)
            );
            
            await Promise.race([clipboardPromise, timeoutPromise]);
            showCopySuccess();
          } else {
            fallbackCopyToClipboard(email);
          }
        } catch (err) {
          fallbackCopyToClipboard(email);
        }
      });
    }
    
    function fallbackCopyToClipboard(text) {
      
      // Create a temp textarea element that's visible but off-screen for mobile compatibility
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Position the textarea in a way that works better on mobile
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.fontSize = '16px'; // Prevent zoom on iOS
      textArea.style.zIndex = '-1';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      
      document.body.appendChild(textArea);
      
      // On mobile, we need to ensure the element is properly focused and selected
      textArea.focus();
      textArea.setSelectionRange(0, text.length);
      
      // For mobile Safari specifically
      if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        textArea.contentEditable = true;
        textArea.readOnly = false;
        const range = document.createRange();
        range.selectNodeContents(textArea);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        textArea.setSelectionRange(0, 999999);
      } else {
        textArea.select();
      }

      // Try to copy
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          showCopySuccess();
        } else {
          selectEmailText();
        }
      } catch (err) {
        selectEmailText();
      } finally {
        document.body.removeChild(textArea);
      }
    }
    
    function selectEmailText() {
      // Select email text for manual copying
      const emailElement = document.getElementById('email-address');
      if (emailElement) {
        const range = document.createRange();
        range.selectNodeContents(emailElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        emailElement.focus();
        
        // Show a message to help the user
        const copyFeedback = document.getElementById('copy-feedback');
        if (copyFeedback) {
          copyFeedback.textContent = 'Email selected - press Copy to copy';
          copyFeedback.classList.add('show');
          
          setTimeout(() => {
            copyFeedback.classList.remove('show');
            copyFeedback.textContent = 'Copied to clipboard!'; // Reset text
          }, 3000);
        }
      }
    }
    
    function showCopySuccess() {
      const copyButton = document.getElementById('copy-button');
      const emailBox = copyButton.closest('.c-contact-email__email-box');
      const copyFeedback = document.getElementById('copy-feedback');
      const emailAddress = document.getElementById('email-address');

      // Hide email address with zoom out effect
      emailAddress.classList.add('hide');
      
      // Success classes
      copyButton.classList.add('copied');
      emailBox.classList.add('copied');
      
      // Show feedback message
      copyFeedback.classList.add('show');
      
      // Remove classes after animation
      setTimeout(() => {
        copyButton.classList.remove('copied');
        emailBox.classList.remove('copied');
        copyFeedback.classList.remove('show');
        // Show email address again
        emailAddress.classList.remove('hide');
      }, 1500);
    }
  }
  
  initEmailCopyToClipboard();

  /* ============================
  // Header & Footer mail icon copy to clipboard (for desktop)
  ============================ */
  
  // Global handler function for mail click events
  function handleMailClick(e) {
    if (!window.matchMedia('(min-width: 769px)').matches) {
      return; // Allow default mailto behavior on mobile/tablet
    }
    
    e.preventDefault();
    const email = this.getAttribute('data-email');
    if (!email) return;
    
    copyEmailToClipboard(email, this);
  }

  async function copyEmailToClipboard(email, linkElement) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        showSocialCopySuccess(linkElement);
      } else {
        fallbackCopyToClipboard(email, linkElement);
      }
    } catch (err) {
      fallbackCopyToClipboard(email, linkElement);
    }
  }
  
  function fallbackCopyToClipboard(email, linkElement) {
    // Create a temp textarea element that's visible but off-screen for mobile compatibility
    const textArea = document.createElement('textarea');
    textArea.value = email;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showSocialCopySuccess(linkElement);
      }
    } catch (err) {
    } finally {
      document.body.removeChild(textArea);
    }
  }
  
  function showSocialCopySuccess(linkElement) {
    const socialItem = linkElement.closest('.social__item--mail');
    const feedback = socialItem?.querySelector('.social__copy-feedback');
    
    if (!feedback) return;
    
    // Show feedback
    feedback.classList.add('show');
    
    // Hide after 1.5 seconds
    setTimeout(() => {
      feedback.classList.remove('show');
    }, 1500);
  }

  function initSocialMailCopy() {
    const socialMailLinks = document.querySelectorAll('.social__link--mail');
    
    // Remove existing event listeners by cloning elements
    socialMailLinks.forEach(mailLink => {
      const newMailLink = mailLink.cloneNode(true);
      mailLink.parentNode.replaceChild(newMailLink, mailLink);
    });
    
    const isDesktop = window.matchMedia('(min-width: 769px)').matches;
    
    if (!isDesktop) {
      return; // Default for mobile/tablet
    }
    
    // Add event listeners to fresh elements
    const freshMailLinks = document.querySelectorAll('.social__link--mail');
    freshMailLinks.forEach(mailLink => {
      mailLink.addEventListener('click', handleMailClick);
    });
  }
  
  initSocialMailCopy();

  // Resize handling with debouncing and media query listener
  let resizeTimeout;
  const mediaQuery = window.matchMedia('(min-width: 769px)');

  function onBreakpointChange() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initSocialMailCopy, 150);
  }

  // Watch the breakpoint rather than every resize event. addEventListener on a
  // MediaQueryList is the modern form; Safari below 14 only has addListener.
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', onBreakpointChange);
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(onBreakpointChange);
  } else {
    window.addEventListener('resize', onBreakpointChange, { passive: true });
  }

});