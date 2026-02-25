export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Range",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Force image access through Worker-controlled prefix
    if (url.pathname.startsWith("/img/")) {
      // map /img/dnd.webp -> /dnd.webp in assets
      const assetUrl = new URL(request.url);
      assetUrl.pathname = url.pathname.replace(/^\/img/, "");

      const res = await env.ASSETS.fetch(new Request(assetUrl, request));

      const headers = new Headers(res.headers);
      for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
      headers.set("X-Worker", "hit");

      return new Response(res.body, { status: res.status, headers });
    }

    // Everything else can be plain assets (or 404)
    return env.ASSETS.fetch(request);
  },
};
