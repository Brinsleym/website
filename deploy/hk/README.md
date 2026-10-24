# Hosting: Cloudflare Pages + Hong Kong VPS

The site lives at `https://www.brinsleymorrison.com`. AliDNS gives different
answers depending on where the visitor's DNS resolver is:

| Name | Mainland China | Everywhere else |
| --- | --- | --- |
| `www` | Hong Kong VPS (`CNAME` to `cn`) | Cloudflare Pages (`CNAME` to `<project>.pages.dev`) |
| `@` (bare domain) | Hong Kong VPS | Hong Kong VPS |
| `cn` | Hong Kong VPS (`A`) | Hong Kong VPS (`A`) |

- **Cloudflare Pages** builds `master` by itself (`cloudflare/pages-build.sh`).
  `functions/_middleware.js` does the language redirect and country cookie.
- **Hong Kong VPS** gets `master` from `.github/workflows/deploy-hk.yml`.
  nginx (`deploy/hk/nginx.conf`) does what the middleware does, fixed to China.
  The bare domain only redirects to `www`, for everyone.
- **TLS on the VPS** comes from Let's Encrypt through acme.sh. Let's Encrypt
  checks from outside China, where `www` leads to Pages, so Pages redirects
  `/.well-known/acme-challenge/*` to the bare domain, which is the VPS.

## Setting up the VPS

The VPS is Debian with Apache serving the old setup (behind Cloudflare, with
a Cloudflare Origin CA certificate that browsers don't trust). nginx is
prepared next to it and switched in once everything is ready.

1. Make a deploy key: `ssh-keygen -t ed25519 -N "" -f hk_deploy -C github-deploy`.
2. On the VPS, as root, with `setup.sh` and `hk_deploy.pub` copied over:
   `bash setup.sh hk_deploy.pub cloudflare` (with `CF_Token` exported, while
   Cloudflare still runs the domain's DNS), or `webroot` once AliDNS does.
3. Add the repository secrets listed at the top of
   `.github/workflows/deploy-hk.yml`, then run the workflow by hand once
   (Actions -> Deploy to Hong Kong -> Run workflow).
4. `bash switch-to-nginx.sh` (`bash switch-to-nginx.sh back` undoes it).

## Checking

```sh
# What China sees, from anywhere: ask for www but connect to the VPS
curl -sI --resolve www.brinsleymorrison.com:443:<HK IP> https://www.brinsleymorrison.com/
```

From inside China, use https://www.itdog.cn/http/ or https://boce.aliyun.com/.

## Rolling back a deploy on the VPS

```sh
cd /var/www/brinsleymorrison
ls -1dt releases/*/            # newest first
ln -sfn releases/<sha> current.new && mv -T current.new current
```
