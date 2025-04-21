import puppeteer from "@cloudflare/puppeteer"
import { createCanvas } from "canvas"; // Software Canvas
import gl from "gl"; // Headless WebGL

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    // const secret = url.searchParams.get("secret")
    const map = url.searchParams.get("map")
    const uuid = url.searchParams.get("uuid")
    const z = url.searchParams.get("z")
    const lng = url.searchParams.get("lng")
    const lat = url.searchParams.get("lat")
    if (!z || !map || !uuid) {
      return new Response('begone 🤖')
    }
    const stargazer = new URL(`https://starlazer.vercel.app/${map}/${uuid}`)
    stargazer.searchParams.set('z', z)
    if (lng) stargazer.searchParams.set('lng', lng)
    if (lat) stargazer.searchParams.set('lat', lat)
    stargazer.searchParams.set('mini', 1)


    const browser = await puppeteer.launch(env.BROWSER)
    // const browser = await puppeteer.launch(env.BROWSER, {
    //   args: [
    //     "--disable-gpu",                 // Disable GPU acceleration
    //     "--disable-web-security",        // Allow cross-origin
    //     "--disable-features=WebGL",      // Try disabling hardware WebGL (sometimes needed)
    //     "--enable-features=VaapiVideoDecoder", // Enable some software decoding
    //     "--use-gl=swiftshader"           // Use software-based rendering
    //   ]
    // });
    // const browser = await puppeteer.launch({
    //   args: [
    //     "--use-gl=swiftshader"
    //   ],
    //   defaultViewport: { width: 3840, height: 2160, deviceScaleFactor: 2 },
    //   headless: true
    // });
    const page = await browser.newPage()
    // await page.setViewport({
    //   width: 3840,  // 4K Width
    //   height: 2160, // 4K Height (16:9 aspect ratio)
    //   deviceScaleFactor: 2 // Increase rendering scale
    // })
    console.log("url =", stargazer.toString())
    await page.goto(stargazer.toString(), { waitUntil: 'networkidle2' })

    // Inject a software WebGL context
    await page.evaluate(() => {
      window.WebGLRenderingContext = gl(3840, 2160, { preserveDrawingBuffer: true });
      window.OffscreenCanvas = createCanvas(3840, 2160);
    });

    // gl(mock_canvas_width, mock_canvas_height, { preserveDrawingBuffer: true })
    // context = gl(width, height, { canvas, preserveDrawingBuffer: true });
    //
    const webglSupport = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!gl;
    });

    console.log("WebGL Supported:", webglSupport);
    await page.waitForSelector('canvas.maplibregl-canvas', { visible: true })


    // await page.waitForSelector('foreignObject.location', { visible: true })
    // await page.waitForNetworkIdle({ idleTime: 15000 })
    // await page.waitForNavigation({ idleTime: 15000 })
    // await page.waitForFunction(() => {
    //   const canvas = document.querySelector("canvas.maplibregl-canvas");
    //   return canvas && canvas.width > 0 && canvas.height > 0;
    // }, { timeout: 20000 });
    const screenshotBuffer = await page.screenshot({ type: 'webp' });
    await browser.close()
    return new Response(screenshotBuffer, {
      status: 200,
      headers: { 'Content-Type': 'image/webp' }
    })
    // return Response.json(metrics);
  },
}
