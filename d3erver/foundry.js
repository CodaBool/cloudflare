import { email, increment } from './util.js'

/*         Clients         */
// downloads ZIP after token validation
// / GET

export async function foundryClient(request, env) {
	const url = new URL(request.url)
	const token = url.searchParams.get("token")
	const module = url.searchParams.get("module")
	const country = request.headers.get('cf-ipcountry')
	const agent = request.headers.get('user-agent')
	const ip = request.headers.get('x-real-ip')

	if (!token || !module) {
		// ============ DEBUG
		// console.log(`url missing a query, likely a bot. ip=${ip} agent=${agent} country=${country} token=${token} module=${module}`)
		return new Response('missing a query', { status: 400 })
	}

	const name = module.slice(0, -7)

	try {
		const tokenExists = await env.KV.get(token)
	
		if (!tokenExists) {
			console.log(`403 /GET expired token ${token} from ${ip} country=${country} agent=${agent}`)
			// ============ DEBUG
			await email("403 /GET", `expired token ${token} from ${ip} country=${country} agent=${agent}`, "ERROR", env)
			return new Response("expired token", { status: 403 })
		}
	
		const zip = await env.R2.get(module)

		if (zip === null) {
			console.error("Foundry client asked for module", module, "which does not exist")
			await email("404 /GET", `module ${module} does not exist`, "ERROR", env)
			return new Response(`module ${module} does not exist`, { status: 404 })
		}
	
		if (zip.status >= 400) {
			console.error(zip)
			await email("500 /GET", `couldn't get module ${module} from R2 ${JSON.stringify(zip, null, 2)}`, "ERROR", env)
			return new Response('Error fetching the zip file', { status: 500 })
		}
	
		await increment(env, "foundry", name)
	
		// Return the zip file
		return new Response(zip.body, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${name}.zip"`,
			}
		})
	} catch(err) {
		console.error("/GET", err, module)
		await email("500 /GET", typeof err === 'object' ? JSON.stringify(err, null ,2) : err, "ERROR", env)
		return new Response("server error", { status: 500 })
	}
}




/*         Foundry Server         */
// creates a token in KV and returns JSON with a timed download URL
// / POST

export async function foundryServer(req, env) {
  const body = await req.json()

	if (body?.api_key !== env.FOUNDRY_SECRET) {
		console.error("unauthorized", body)
		await email("403 /POST (Foundry)", `auth=${body?.api_key} ip=${req.headers.get('x-real-ip')} country=${req.headers.get('cf-ipcountry')}`, "WARN", env)
		return new Response("unauthorized", { status: 403 })
	}

	
	const uuid = await crypto.randomUUID()

	try {
    // 4h timed token
		await env.KV.put(uuid, body.user_id, { expirationTtl: 14400 })
	
		const data = JSON.stringify({
			download: `https://${env.DOMAIN}/?token=${uuid}&module=${body.package_name}-v${body.version}`,
			package_name: body.package_name,
			version: body.version,
		}, null, 2)
	
		return new Response(data, {
			headers: { 'Content-Type': 'application/json' }
		})
	} catch(err) {
		console.error("/POST", err, body)
		await email("500 /POST (Foundry)", typeof err === 'object' ? JSON.stringify(err, null ,2) : err, "ERROR", env)
		return new Response("server error", { status: 500 })
	}
}
