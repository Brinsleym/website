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
- Full Multilingual support & language switcher menu for English, Japanese and Chinese (Simplified).
- A custom audio player with playlist functionality using Soundcloud API
  - With advanced error handling, detection of privacy-blocking extensions, complience for iOS Safari audio playback policies, custom cover arguments and proper loading states.

- Asset provisioning through JSDelivr's CDN,
- Javascript lazy image loading,

Server-side features:
- Cloudflare DNS & Proxy with worker support to automatically detect user language and serve the relevant page
- Snapshot caching at ```archive.org```, to show a recent snapshot of the page in the event of a server faliure.

Other notable changes:
- Ionicons v7 (upgraded from v4)
- Many small css improvements (especially for mobile pages)


## Development

For local development, use the dev configuration which serves assets locally:

```bash
hugo server --config config.dev.toml
```


## Future to-do

- Add copy to clipboard js when clicking on the mail icon & email adress text

---

## License

Please refer to the original template's licensing terms for usage guidelines.
