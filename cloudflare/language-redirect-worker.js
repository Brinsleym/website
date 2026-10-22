// Cloudflare Worker: send first-time visitors at the domain root to their
// language version, but never override a language the visitor has chosen.
//
// The site's language switcher sets a `lang` cookie (en | ja | zh) on every
// page view and when a language is picked. English lives at "/", so without
// the cookie check a visitor in China who picks English is sent to "/" and
// immediately redirected back to "/zh/".
//
// It also tells the page which country the visitor is in, through a
// `country` cookie on HTML responses. The audio players read it to skip
// SoundCloud, which is blocked in mainland China, and play the site's own
// copy straight away (assets/js/self-hosted-audio.js). It only reaches the
// paths this worker's route covers; elsewhere the players fall back on the
// browser's time zone.

const COUNTRY_LANGUAGE = { CN: 'zh', JP: 'ja' };
const SUPPORTED_LANGUAGES = new Set(['en', 'ja', 'zh']);
const DEFAULT_LANGUAGE = 'en';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname !== '/') {
    return withCountryCookie(request, await fetch(request));
  }

  const chosen = getCookie(request.headers.get('Cookie'), 'lang');
  const language = SUPPORTED_LANGUAGES.has(chosen)
    ? chosen
    : COUNTRY_LANGUAGE[request.headers.get('CF-IPCountry')] || DEFAULT_LANGUAGE;

  if (language === DEFAULT_LANGUAGE) {
    return withCountryCookie(request, await fetch(request));
  }

  url.pathname = `/${language}/`;
  // 302 + no-store: the right destination depends on the visitor's cookie and
  // country, so browsers and caches must not remember this redirect.
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      'Cache-Control': 'private, no-store',
      Vary: 'Cookie',
    },
  });
}

// Readable by the page's scripts, so not HttpOnly. A day long, so that a
// visitor who travels is not misjudged for long.
function withCountryCookie(request, response) {
  const country = request.headers.get('CF-IPCountry');
  const type = response.headers.get('Content-Type') || '';
  if (!/^[A-Z]{2}$/.test(country || '') || !type.startsWith('text/html') ||
      getCookie(request.headers.get('Cookie'), 'country') === country) {
    return response;
  }

  const tagged = new Response(response.body, response);
  tagged.headers.append('Set-Cookie', `country=${country}; Path=/; Max-Age=86400; SameSite=Lax; Secure`);
  return tagged;
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
