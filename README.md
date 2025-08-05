# Personal Website

This repository contains the source code for my portfolio website, which is live at [brinsleymorrison.com](https://brinsleymorrison.com).

## About

This site is forked from the [Vonge Hugo Bookshop Template](https://github.com/CloudCannon/vonge-hugo-bookshop-template) by CloudCannon. It has been significantly modified including the addition of:
- Full Multilingual support & language switcher menu for English, Japanese and Chinese (Simplified).
- A custom audio player with playlist functionality using Soundcloud API
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

[![](https://data.jsdelivr.com/v1/package/gh/Brinsleym/website/badge)](https://www.jsdelivr.com/package/gh/Brinsleym/website)

---

## License

Please refer to the original template's licensing terms for usage guidelines.
