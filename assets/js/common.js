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
  if (typeof reframe !== 'undefined') {
    reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off)");
  }


  /* =======================
  // Zoom Image
  ======================= */
  const lightense = document.querySelector(".page img, .post img"),
  imageLink = document.querySelectorAll(".page a img, .post a img");

  if (imageLink) {
    for (var i = 0; i < imageLink.length; i++) imageLink[i].parentNode.classList.add("image-link");
    for (var i = 0; i < imageLink.length; i++) imageLink[i].classList.add("no-lightense");
  }

  if (lightense && typeof Lightense !== 'undefined') {
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

            /* Re-enable for Lightense images */
            .page img:not(.no-lightense),
            .post img:not(.no-lightense) {
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
        
        // Debug logging for mobile
        console.log('Copy button clicked, email:', email);
        console.log('User agent:', navigator.userAgent);
        console.log('Clipboard API available:', !!navigator.clipboard?.writeText);
        
        // For mobile browsers, try a more direct approach first
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          console.log('Mobile detected, using fallback method');
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
          console.log('Copy failed, using fallback method:', err);
          fallbackCopyToClipboard(email);
        }
      });
    }
    
    function fallbackCopyToClipboard(text) {
      console.log('Using fallback copy method for text:', text);
      
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
        console.log('iOS detected, using iOS-specific selection method');
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
        console.log('execCommand copy result:', successful);
        if (successful) {
          showCopySuccess();
        } else {
          console.log('execCommand failed, showing email text for manual copy');
          selectEmailText();
        }
      } catch (err) {
        console.log('Fallback copy failed:', err);
        selectEmailText();
      } finally {
        document.body.removeChild(textArea);
      }
    }
    
    function selectEmailText() {
      console.log('Selecting email text for manual copy');
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
      console.log('Social mail copy failed:', err);
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
      console.log('Fallback social copy failed:', err);
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
  
  // Handle media query changes (more efficient than resize events)
  mediaQuery.addEventListener('change', (e) => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initSocialMailCopy();
    }, 150);
  });

  // Fallback resize handler for browsers that don't support media query listeners
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initSocialMailCopy();
    }, 250);
  });

});