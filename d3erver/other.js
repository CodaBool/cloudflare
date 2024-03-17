import { email } from './util.js'

export async function emailMe(request, env) {
    const url = new URL(request.url)
    const version = url.searchParams.get("version")
    const module = url.searchParams.get("module").replace("-", " ")
    const active = url.searchParams.get("active")
    const text = await request.text()

    // debug
    const country = request.headers.get('cf-ipcountry')
    const agent = request.headers.get('user-agent')
    const ip = request.headers.get('x-real-ip')
    const origin = request.headers.get("origin")
    // console.log(`country=${country} agent=${agent} ip=${ip} origin=${origin}`)

    if (!version || !module || !active || !text) {
        console.log(`url missing a query, likely a bot. ip=${ip} agent=${agent} country=${country} origin=${origin} body=${text}`)
        return new Response('missing a query', { status: 400 })
    }

    try {
        const activePretty = active.replaceAll(";", " ")
        await email(`${module} feedback`, `country=${country} agent=${agent} ip=${ip} origin=${origin}\n\nActive modules: ${activePretty}\nFoundry Version: ${version}\n\n${text}`, "Feedback", env)
        return new Response('email sent', { status: 200 })
    } catch(err) {
        console.error("/email", err, module, version, active)
        await email("500 /email", typeof err === 'object' ? JSON.stringify(err, null ,2) : err, "ERROR", env)
        return new Response("server error", { status: 500 })
    }
}