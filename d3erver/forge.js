import { email, increment } from './util.js'

/*         The Forge         */
// password based downloads by providing a secret in module.json "download" URL
// Forge removes the "download" URL prop, making this secure (TM)

export async function forgeDownload(request, env) {
  const url = new URL(request.url)
	const module = url.searchParams.get("module")
	const secret = url.searchParams.get("secret")

	// debug
	const country = request.headers.get('cf-ipcountry')
	const agent = request.headers.get('user-agent')
	const ip = request.headers.get('x-real-ip')
	// console.log(`country=${country} agent=${agent} ip=${ip}`)

	if (!secret || !module) {
		// ============ DEBUG
		// console.log(`url missing a query, likely a bot. ip=${ip} agent=${agent} country=${country} secret=${secret} module=${module}`)
		// await email("400 /forge", `url missing a query ${url} req ${JSON.stringify(request, null, 2)}`, "DEBUG")
		return new Response('missing a query', { status: 400 })
	}

	if (secret !== env.FORGE_SECRET) {
		console.error(`403 /forge wrong secret ${secret} from ${ip} country=${country}`)
		await email("403 /forge", `wrong secret ${secret} from ${ip} country=${country}`, "ERROR", env)
		return new Response("unauthorized", { status: 403 })
	}

	try {
		const zip = await env.R2.get(module)
	
		if (zip === null) {
			console.error("Forge server asked for module", module, "which does not exist")
			await email("404 /forge", `module ${module} does not exist`, "ERROR", env)
			return new Response(`module ${module} does not exist`, { status: 404 })
		}
	
		if (zip.status >= 400) {
			console.error(zip)
			await email("500 /forge", `couldn't get module ${module} from R2 ${JSON.stringify(zip, null, 2)}`, "ERROR", env)
			return new Response('Error fetching the zip file', { status: 500 })
		}
	
		const name = module.slice(0, -7)
		await increment(env, "forge", name)
	
		return new Response(zip.body, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${name}.zip"`,
			}
		})
	} catch(err) {
		console.error("/forge", err, module)
		await email("500 /forge", typeof err === 'object' ? JSON.stringify(err, null ,2) : err, "ERROR", env)
		return new Response("server error", { status: 500 })
	}
}






/*         The Forge              */
// custom module.json for private packages, since a download and manifest contain secrets
// this cannot be public so it is dynamically created after validation

export async function forgeManifest(request, env) {
  const url = new URL(request.url)
	const moduleName = url.searchParams.get("module")
	const secret = url.searchParams.get("secret")
	const beta = url.searchParams.get("beta")
	const forge = url.searchParams.get("forge")

	// debug
	const country = request.headers.get('cf-ipcountry')
	const agent = request.headers.get('user-agent')
	const ip = request.headers.get('x-real-ip')

	// if (ip !== "15.235.53.129" || agent !== "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)" || country !== "CA") {
	// }

	if (!secret || !moduleName) {
		// ============ DEBUG
		// console.log(`url missing a query, likely a bot. ip=${ip} agent=${agent} country=${country}`)
		return new Response('missing a query', { status: 400 })
	}

	if (secret !== env.FORGE_SECRET) {
		console.error(`403 /manifest wrong secret ${secret} from ${ip} country=${country}`)
		await email("403 /manifest", `wrong secret ${secret} from ${ip} country=${country}`, "ERROR", env)
		return new Response("unauthorized", { status: 403 })
	}

	try {
		// D1 will have values updated from module Github Actions
		let res
		if (forge) {
			res = await env.D1.prepare("SELECT * FROM manifests WHERE module='codabool-terminal-test'").first()
		} else {
			res = await env.D1.prepare("SELECT * FROM manifests WHERE module='terminal'").first()
		}
    
		// append manifest and download props with secrets
		const template = JSON.parse(res.data)
		template.manifest = `https://${env.DOMAIN}/manifest?secret=${secret}&module=${moduleName}`
		template.download = `https://${env.DOMAIN}/forge?secret=${env.FORGE_SECRET}&module=terminal-v${template.version}`

		if (beta) {
			// append manifest and download props with secrets
			template.manifest = `https://${env.DOMAIN}/manifest?secret=${secret}&module=${moduleName}&beta=true`
			template.download = `https://${env.DOMAIN}/forge?secret=${env.FORGE_SECRET}&module=terminal-v0.0.0`
			template.version = "0.0.0"
			if (forge) {
				template.version = forge
				template.manifest = `https://${env.DOMAIN}/manifest?secret=${secret}&module=${moduleName}&beta=true&forge=true`
				template.title = "codabool-terminal-test"
				template.id = "codabool-terminal-test"
			}
		}
	
		const secretJSON = JSON.stringify(template, null, 2)
	
		return new Response(secretJSON, {
			headers: {
				'Content-Type': 'application/json',
			}
		})
	} catch(err) {
		console.error("/manifest", err)
		await email("500 /manifest", typeof err === 'object' ? JSON.stringify(err, null ,2) : err, "ERROR", env)
		return new Response("server error", { status: 500 })
	}
}

/*         The Forge              */
// downloads latest zip of the module
export async function forgeLatest(request, env) {
  const url = new URL(request.url)
	const module = url.searchParams.get("module")
	const secret = url.searchParams.get("secret")

	// debug
	const country = request.headers.get('cf-ipcountry')
	const agent = request.headers.get('user-agent')
	const ip = request.headers.get('x-real-ip')

	if (!secret || !module) {
		// ============ DEBUG
		// console.log(`url missing a query, likely a bot. ip=${ip} agent=${agent} country=${country}`)
		return new Response('missing a query', { status: 400 })
	}

	if (secret !== env.FORGE_SECRET) {
		console.error(`403 /manifest wrong secret ${secret} from ${ip} country=${country}`)
		await email("403 /manifest", `wrong secret ${secret} from ${ip} country=${country}`, "ERROR", env)
		return new Response("unauthorized", { status: 403 })
	}

	try {
		// get latest version
		const { data } = await env.D1.prepare("SELECT * FROM manifests WHERE module='terminal'").first()
		const manifest = JSON.parse(data)

		const zip = await env.R2.get(`${module}-v${manifest.version}`)
	
		if (zip === null) {
			console.error("Forge server asked for module", module, "which does not exist")
			await email("404 /latest", `module ${module} does not exist`, "ERROR", env)
			return new Response(`module ${module} does not exist`, { status: 404 })
		}
	
		if (zip.status >= 400) {
			console.error(zip)
			await email("500 /latest", `couldn't get module ${module} from R2 ${JSON.stringify(zip, null, 2)}`, "ERROR", env)
			return new Response('Error fetching the zip file', { status: 500 })
		}
	
		return new Response(zip.body, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${module}.zip"`,
			}
		})
	} catch(err) {
		console.error("/latest", err)
		await email("500 /latest", typeof err === 'object' ? JSON.stringify(err, null ,2) : err, "ERROR", env)
		return new Response("server error", { status: 500 })
	}
}
