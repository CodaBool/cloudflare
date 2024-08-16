# example
https://email.codabool.workers.dev/?subject=subject&body=hello,%20first%20test&to=codabool%40pm.me&name=codabool&from=docker&secret=HIDDEN


# MailChannel CF Worker deprecation
1. add TXT record of `_mailchannels` with value `v=mc1 auth=codabool`. (use account ID for auth value) There will be extra security by locking down to just api-key, but MailChannel is still in beta.
2. Login to the [console](https://console.mailchannels.com) and use an API_KEY
3. add to worker and use the `x-api-key` header

### Articles
- https://support.mailchannels.com/hc/en-us/articles/16918954360845-Secure-your-domain-name-against-spoofing-with-Domain-Lockdown
