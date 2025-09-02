# Portfolio Site: [brinsleymorrison.com](https://brinsleymorrison.com)


This repository contains the source code for my portfolio website, which is live at [brinsleymorrison.com](https://brinsleymorrison.com).
<p align="center">
 </a>
 <a href="https://github.com/brinsleym/website/blob/master/LICENSE">
  <img src="https://img.shields.io/badge/License-MIT-brightgreen.svg?style=flat-square" alt="MIT License">
 </a>
  <a href="https://gohugo.io">
  <img src="https://img.shields.io/badge/hugo-v0.149.0-blue?logo=hugo&style=flat-square" alt="Hugo v0.149.0">
  </a>
 <a href="https://www.jsdelivr.com/package/gh/Brinsleym/website">
  <img src="https://data.jsdelivr.com/v1/package/gh/Brinsleym/website/badge" alt="JSDelivr">
 </a>
 
</p>

## About

This site is forked from the [Vonge Hugo Bookshop Template](https://github.com/CloudCannon/vonge-hugo-bookshop-template) by CloudCannon. It has been significantly modified including the addition of:

### Core Features

- **Full Multilingual Support** & language switcher menu for English, Japanese and Chinese (Simplified)
- **CloudCannon CMS Integration** with visual editing capabilities and automated builds
- **Hugo Bookshop Component System** for modular, reusable content blocks

### Advanced Audio Features

- **Custom SoundCloud Player** with playlist functionality using SoundCloud API
  - Advanced error handling and detection of privacy-blocking extensions
  - iOS Safari audio playback policy compliance with automatic initialization
  - Custom background image support for enhanced visual presentation
  - Touch and mouse drag support for progress and volume controls
  - Visual feedback for volume controls and loading states
  - Accessibility features with proper ARIA labels
  - Privacy extension detection with user-friendly error messaging

### Content Management & Structure

- **Portfolio Sections**: Projects, compositions, and testimonials with rich media support
- **Contact Form** with email integration
- **CV/Resume Embedding** via iframe with PDF viewer
- **Bookshop Components**: Blog cards, hero sections, testimonial cards, project cards, and more

### Performance & User Experience

- **Asset Provisioning** through JSDelivr's CDN for optimized global delivery
- **JavaScript Lazy Image Loading** with Lightense image viewer integration
- **Image Optimization** with WebP format and responsive sizing
- **Responsive Video Embeds** using reframe.js
- **Smooth Scrolling** with polyfill for cross-browser compatibility
- **Typewriter Effects** using iTyped library for dynamic text displays

### Server-side Features

- **Cloudflare DNS & Proxy** with worker support to automatically detect user language and serve the relevant page
- **Snapshot Caching** at `archive.org`, to show a recent snapshot of the page in the event of a server failure

### Technical Improvements

- **Ionicons v7** (upgraded from v4) with modern icon support
- **Advanced CSS/SCSS Structure** with component-based styling
- **Tiny Slider Integration** for responsive carousels and galleries
- **Mobile-Optimized Design** with extensive CSS improvements for mobile devices
- **Build System Integration** with npm scripts and Bookshop generation


## Development

### Prerequisites

- [Hugo](https://gohugo.io/installation/) (v0.149.0 or later)
- [Node.js](https://nodejs.org/) and npm for Bookshop components
- Git for version control

### Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Brinsleym/website.git
   cd website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   hugo server --config config.dev.toml
   ```
   This serves assets locally and enables hot reloading for development.

4. **For Bookshop component development**:
   ```bash
   npm run bookshop-browser
   ```

### Build Process

The site uses a multi-step build process:

1. **Hugo Build**: Generates static site files
2. **Bookshop Generation**: Processes component library with `npx "@bookshop/generate"`
3. **Post-processing**: Optimizes assets with `npx @pagebreak/cli`

### CloudCannon Integration

This site is configured for CloudCannon CMS with:
- Visual editing capabilities
- Component-based content management
- Automated builds and deployments
- Multi-language content management


## Technical Stack

### Core Technologies
- **[Hugo](https://gohugo.io)** - Static site generator (v0.149.0)
- **[Hugo Bookshop](https://github.com/CloudCannon/bookshop)** - Component-based content management
- **[CloudCannon](https://cloudcannon.com)** - Git-based CMS with visual editing

### Frontend Libraries
- **[Ionicons v7](https://ionic.io/ionicons)** - Modern icon library
- **[Lightense Images](https://github.com/sparanoid/lightense-images)** - Responsive image lightbox
- **[Tiny Slider](https://github.com/ganlanyuan/tiny-slider)** - Lightweight carousel/slider
- **[iTyped](https://github.com/luisvinicius167/ityped)** - Typewriter effect animations
- **[reframe.js](https://github.com/yowainwright/reframe.js)** - Responsive video embeds
- **Smooth Scroll Polyfill** - Cross-browser smooth scrolling

### Audio Integration
- **SoundCloud Widget API** - Custom audio player implementation
- **Advanced Error Handling** - Privacy extension detection and iOS compatibility

### Performance & Optimization
- **[JSDelivr CDN](https://www.jsdelivr.com/)** - Global asset delivery
- **WebP Image Format** - Modern image optimization
- **Lazy Loading** - Progressive image loading
- **CSS/SCSS Modules** - Component-based styling

### Deployment & Infrastructure
- **[Cloudflare](https://cloudflare.com)** - DNS, proxy, and workers
- **[Archive.org](https://archive.org)** - Backup snapshots
- **Automated Builds** - CI/CD integration

## Future to-do

- Add copy to clipboard js when clicking on the mail icon & email address text
- Implement dark mode theme switching
- Add search functionality for compositions and projects
- Enhance accessibility features with keyboard navigation improvements

---

## License

Please refer to the original template's licensing terms for usage guidelines.
