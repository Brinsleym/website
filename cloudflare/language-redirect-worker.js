// Cloudflare Worker: send first-time visitors at the domain root to their
// language version, but never override a language the visitor has chosen.
//
// The site's language switcher sets a `lang` cookie (en | ja | zh) on every
// page view and when a language is picked. English lives at "/", so without
// the cookie check a visitor in China who picks English is sent to "/" and
// immediately redirected back to "/zh/".

const COUNTRY_LANGUAGE = { CN: 'zh', JP: 'ja' };
const SUPPORTED_LANGUAGES = new Set(['en', 'ja', 'zh']);
const DEFAULT_LANGUAGE = 'en';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname !== '/') {
    return fetch(request);
  }

  const chosen = getCookie(request.headers.get('Cookie'), 'lang');
  const language = SUPPORTED_LANGUAGES.has(chosen)
    ? chosen
    : COUNTRY_LANGUAGE[request.headers.get('CF-IPCountry')] || DEFAULT_LANGUAGE;

  if (language === DEFAULT_LANGUAGE) {
    return fetch(request);
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

function getCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return null;
}
