// Cloudflare Pages middleware: runs in front of every page (static/_routes.json
// keeps it off images, audio, video and other static files).
//
// It sends first-time visitors at the domain root to their language version,
// but never overrides a language the visitor has chosen. The site's language
// switcher sets a `lang` cookie (en | ja | zh) on every page view and when a
// language is picked. English lives at "/", so without the cookie check a
// visitor in China who picks English is sent to "/" and immediately
// redirected back to "/zh/".
//
// It also tells the page which country the visitor is in, through a
// `country` cookie on HTML responses. The audio players read it to skip
// SoundCloud, which is blocked in mainland China, and play the site's own
// copy straight away (assets/js/self-hosted-audio.js).
//
// static/_headers is not applied to responses that pass through a Function,
// so the page headers are set here instead.
//
// Mainland China is served by the Hong Kong VPS instead (AliDNS gives China a
// different answer for www), and the bare domain points at that VPS for
// everyone. Let's Encrypt checks the VPS's certificate from outside China,
// where www leads here, so its challenge requests are sent on to the bare
// domain. See deploy/hk/README.md.

const COUNTRY_LANGUAGE = { CN: 'zh', JP: 'ja' };
const SUPPORTED_LANGUAGES = new Set(['en', 'ja', 'zh']);
const DEFAULT_LANGUAGE = 'en';

const PAGE_HEADERS = {
  // Browsers revalidate pages, so a new deploy shows up straight away.
  'Cache-Control': 'public, max-age=0, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const country = (request.cf && request.cf.country) || request.headers.get('CF-IPCountry');

  if (url.pathname.startsWith('/.well-known/acme-challenge/')) {
    return Response.redirect(`http://brinsleymorrison.com${url.pathname}`, 302);
  }

  if (url.pathname === '/') {
    const chosen = getCookie(request.headers.get('Cookie'), 'lang');
    const language = SUPPORTED_LANGUAGES.has(chosen)
      ? chosen
      : COUNTRY_LANGUAGE[country] || DEFAULT_LANGUAGE;

    // Baidu's site verification needs a 200 at "/", not a redirect to /zh/.
    if (language !== DEFAULT_LANGUAGE && !/baidu/i.test(request.headers.get('User-Agent') || '')) {
      url.pathname = `/${language}/`;
      // 302 + no-store: the right destination depends on the visitor's cookie
      // and country, so browsers and caches must not remember this redirect.
      return new Response(null, {
        status: 302,
        headers: {
          Location: url.toString(),
          'Cache-Control': 'private, no-store',
          Vary: 'Cookie',
        },
      });
    }
  }

  const response = await context.next();
  const type = response.headers.get('Content-Type') || '';
  if (!type.startsWith('text/html')) return response;

  const page = new Response(response.body, response);
  for (const [name, value] of Object.entries(PAGE_HEADERS)) {
    page.headers.set(name, value);
  }
  // Agent discovery (RFC 8288): point each homepage at the site's
  // machine-readable guides. The site has no API, so there is no api-catalog
  // or service-desc to list. /sitemap.xml is the index covering every language.
  const home = /^\/(?:(ja|zh)\/)?$/.exec(url.pathname);
  if (home) {
    const prefix = home[1] ? `/${home[1]}` : '';
    page.headers.append('Link', `<${prefix}/llms.txt>; rel="describedby"; type="text/markdown", ` +
      '</sitemap.xml>; rel="sitemap"; type="application/xml"');
  }
  // The pages.dev address is for previews only: keep it out of search results.
  if (url.hostname.endsWith('.pages.dev')) {
    page.headers.set('X-Robots-Tag', 'noindex');
  }
  // Readable by the page's scripts, so not HttpOnly. A day long, so that a
  // visitor who travels is not misjudged for long.
  if (/^[A-Z]{2}$/.test(country || '') &&
      getCookie(request.headers.get('Cookie'), 'country') !== country) {
    page.headers.append('Set-Cookie', `country=${country}; Path=/; Max-Age=86400; SameSite=Lax; Secure`);
  }
  return page;
}

function getCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key !== name) continue;
    // A malformed value would otherwise throw and fail the whole request.
    try {
      return decodeURIComponent(value.join('='));
    } catch (e) {
      return null;
    }
  }
  return null;
}
