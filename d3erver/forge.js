import { email, increment, getRequestInfo, errObj } from "./util.js"

/*
 * ============================================================
 * Forge Download
 * ============================================================
 *
 * Password-based downloads.
 *
 * module.json contains a secret-bearing "download" URL.
 * Forge serves the private package only after validating
 * the provided secret.
 */

export async function forgeDownload(request, env) {
  const requestId = crypto.randomUUID()
  const url = new URL(request.url)

  const module = url.searchParams.get("module")
  const secret = url.searchParams.get("secret")

  const { country, agent, ip } = getRequestInfo(request)

  const logPrefix = `[forge-download][${requestId}]`

  console.log(`${logPrefix} START`, {
    module,
    ip,
    country,
    agent,
    hasSecret: Boolean(secret),
  })

  // Validate query
  if (!secret || !module) {
    console.warn(`${logPrefix} missing required query`, {
      module,
      hasSecret: Boolean(secret),
      ip,
      country,
    })

    return new Response("missing a query", {
      status: 400,
    })
  }

  // Validate secret
  if (secret !== env.FORGE_SECRET) {
    console.error(`${logPrefix} wrong secret`, {
      module,
      ip,
      country,
    })

    await email(
      "403 /forge",
      [
        "Wrong Forge secret",
        `requestId=${requestId}`,
        `module=${module}`,
        `ip=${ip}`,
        `country=${country}`,
        `agent=${agent}`,
      ].join("\n"),
      "ERROR",
      env,
      logPrefix,
    )

    return new Response("unauthorized", {
      status: 403,
    })
  }

  try {
    console.log(`${logPrefix} secret validated`)

    // Get ZIP from R2
    console.log(`${logPrefix} requesting R2 object`, {
      key: module,
    })

    const zip = await env.R2.get(module)

    console.log(`${logPrefix} R2 request complete`, {
      found: Boolean(zip),
      hasBody: Boolean(zip?.body),
      size: zip?.size ?? null,
      etag: zip?.etag ?? null,
    })

    /*
     * R2.get() returns null when the object does not exist.
     *
     * It is NOT an HTTP Response, so there is no useful
     * zip.status >= 400 check here.
     */

    if (zip === null) {
      console.error(`${logPrefix} R2 object missing`, {
        module,
      })

      await email(
        "404 /forge",
        [
          "Forge module does not exist in R2",
          `requestId=${requestId}`,
          `module=${module}`,
          `ip=${ip}`,
          `country=${country}`,
        ].join("\n"),
        "ERROR",
        env,
        logPrefix,
      )

      return new Response(`module ${module} does not exist`, {
        status: 404,
      })
    }

    /*
     * Determine filename.
     *
     * terminal-v1.2.3 -> terminal
     * map-v1.2.3      -> map
     */

    const name = module.split("-")[0]

    console.log(`${logPrefix} resolved download name`, {
      module,
      name,
    })

    /*
     * Analytics/counter
     *
     * This should NOT prevent somebody from downloading
     * an otherwise valid ZIP.
     */

    try {
      console.log(`${logPrefix} incrementing forge counter`, {
        name,
      })

      await increment(env, "forge", name)

      console.log(`${logPrefix} forge counter incremented`, {
        name,
      })
    } catch (incrementErr) {
      const incrementErrorDetails = errObj(incrementErr, {
        requestId,
        module,
        name,
      })

      console.error(
        `${logPrefix} COUNTER INCREMENT FAILED`,
        incrementErrorDetails,
      )

      await email(
        "500 forge increment",
        incrementErrorDetails,
        "ERROR",
        env,
        logPrefix,
      )

      // Deliberately continue.
      // Counter failure should not break the download.
    }

    console.log(`${logPrefix} SUCCESS`, {
      module,
      name,
      size: zip.size ?? null,
      etag: zip.etag ?? null,
    })

    return new Response(zip.body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${name}.zip"`,
      },
    })
  } catch (err) {
    const errDetails = errObj(err, {
      requestId,
      module,
      ip,
      country,
      agent,
    })

    console.error(`${logPrefix} 500 ERROR`, errDetails)

    await email("500 /forge", errDetails, "ERROR", env, logPrefix)

    return new Response(`server error (${requestId})`, {
      status: 500,
    })
  }
}

/*
 * ============================================================
 * Forge Manifest
 * ============================================================
 *
 * Creates a private module.json dynamically.
 *
 * A public manifest cannot contain the Forge secret, so this
 * endpoint validates the caller and then injects the private
 * manifest/download URLs.
 */

export async function forgeManifest(request, env) {
  const requestId = crypto.randomUUID()
  const url = new URL(request.url)

  const moduleName = url.searchParams.get("module")
  const secret = url.searchParams.get("secret")

  /*
   * Currently unused, but retained since you already have
   * beta/forge behavior commented out elsewhere.
   */

  const beta = url.searchParams.get("beta")
  const forge = url.searchParams.get("forge")

  const possibleModules = ["terminal", "map"]

  const { country, agent, ip } = getRequestInfo(request)

  const logPrefix = `[manifest][${requestId}]`

  console.log(`${logPrefix} START`, {
    moduleName,
    beta,
    forge,
    ip,
    country,
    agent,
    hasSecret: Boolean(secret),
  })

  // Validate query
  if (!secret || !moduleName) {
    console.warn(`${logPrefix} missing required query`, {
      moduleName,
      hasSecret: Boolean(secret),
      ip,
      country,
    })

    return new Response("missing a query", {
      status: 400,
    })
  }

  // Validate secret
  if (secret !== env.FORGE_SECRET) {
    console.error(`${logPrefix} wrong secret`, {
      ip,
      country,
      moduleName,
    })

    await email(
      "403 /manifest",
      [
        "Wrong manifest secret",
        `requestId=${requestId}`,
        `module=${moduleName}`,
        `ip=${ip}`,
        `country=${country}`,
        `agent=${agent}`,
      ].join("\n"),
      "ERROR",
      env,
      logPrefix,
    )

    return new Response("unauthorized", {
      status: 403,
    })
  }

  try {
    console.log(`${logPrefix} secret validated`)

    // Validate module
    if (!possibleModules.includes(moduleName)) {
      console.error(`${logPrefix} invalid module`, {
        moduleName,
        ip,
        country,
      })

      await email(
        "400 /manifest",
        [
          "Possible invalid/injection manifest request",
          `requestId=${requestId}`,
          `module=${moduleName}`,
          `ip=${ip}`,
          `country=${country}`,
          `agent=${agent}`,
        ].join("\n"),
        "ERROR",
        env,
        logPrefix,
      )

      return new Response("bad module", {
        status: 400,
      })
    }

    // Query D1
    console.log(`${logPrefix} querying D1`, {
      moduleName,
    })

    const res = await env.D1.prepare("SELECT * FROM manifests WHERE module = ?")
      .bind(moduleName)
      .first()

    console.log(`${logPrefix} D1 query complete`, {
      found: Boolean(res),
      hasData: Boolean(res?.data),
    })

    if (!res) {
      console.warn(`${logPrefix} module not found in D1`, {
        moduleName,
      })

      return new Response("cannot find module", {
        status: 404,
      })
    }

    // Validate D1 data
    if (typeof res.data !== "string") {
      throw new TypeError(
        `Manifest data for ${moduleName} is not a string; got ${typeof res.data}`,
      )
    }

    console.log(`${logPrefix} parsing manifest JSON`, {
      dataType: typeof res.data,
      dataLength: res.data.length,
    })

    // Parse stored manifest
    let template

    try {
      template = JSON.parse(res.data)
    } catch (parseErr) {
      console.error(`${logPrefix} MANIFEST JSON PARSE FAILED`, {
        moduleName,
        dataLength: res.data.length,
        error: parseErr?.message,
      })

      throw new Error(`Invalid JSON stored in D1 for manifest ${moduleName}`, {
        cause: parseErr,
      })
    }

    console.log(`${logPrefix} manifest parsed`, {
      id: template?.id,
      title: template?.title,
      version: template?.version,
    })

    /*
     * Make sure version exists before constructing download URL.
     */

    if (!template?.version) {
      throw new Error(`Manifest ${moduleName} does not contain a version`)
    }

    /*
     * Dynamically inject private URLs.
     */

    template.manifest =
      `https://${env.DOMAIN}/manifest` +
      `?secret=${encodeURIComponent(secret)}` +
      `&module=${encodeURIComponent(moduleName)}`

    template.download =
      `https://${env.DOMAIN}/forge` +
      `?secret=${encodeURIComponent(env.FORGE_SECRET)}` +
      `&module=${encodeURIComponent(`${moduleName}-v${template.version}`)}`

    console.log(`${logPrefix} private URLs generated`, {
      moduleName,
      version: template.version,

      /*
       * Don't log URLs themselves because they contain secrets.
       */
      hasManifestUrl: Boolean(template.manifest),
      hasDownloadUrl: Boolean(template.download),
    })

    /*
     * Serialize final manifest
     */

    const secretJSON = JSON.stringify(template, null, 2)

    console.log(`${logPrefix} SUCCESS`, {
      moduleName,
      version: template.version,
      responseBytes: secretJSON.length,
    })

    return new Response(secretJSON, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (err) {
    const errorDetails = errObj(err, {
      requestId,
      moduleName,
      ip,
      country,
      agent,
    })

    console.error(`${logPrefix} 500 ERROR`, errorDetails)

    await email("500 /manifest", errorDetails, "ERROR", env, logPrefix)

    return new Response(`server error (${requestId})`, {
      status: 500,
    })
  }
}

/*
 * ============================================================
 * Forge Latest
 * ============================================================
 *
 * Gets the current module version from D1, constructs its
 * R2 key, and serves the corresponding ZIP.
 */

export async function forgeLatest(request, env) {
  const requestId = crypto.randomUUID()
  const url = new URL(request.url)

  const module = url.searchParams.get("module")
  const secret = url.searchParams.get("secret")

  const { country, agent, ip } = getRequestInfo(request)

  const logPrefix = `[forge-latest][${requestId}]`

  console.log(`${logPrefix} START`, {
    module,
    ip,
    country,
    agent,
    hasSecret: Boolean(secret),
  })

  // Validate query
  if (!secret || !module) {
    console.warn(`${logPrefix} missing required query`, {
      module,
      hasSecret: Boolean(secret),
      ip,
      country,
    })

    return new Response("missing a query", {
      status: 400,
    })
  }

  // Validate secret
  if (secret !== env.FORGE_SECRET) {
    console.error(`${logPrefix} wrong secret`, {
      ip,
      country,
      module,
    })

    await email(
      "403 /forge/latest",
      [
        "Wrong Forge latest secret",
        `requestId=${requestId}`,
        `module=${module}`,
        `ip=${ip}`,
        `country=${country}`,
        `agent=${agent}`,
      ].join("\n"),
      "ERROR",
      env,
      logPrefix,
    )

    return new Response("unauthorized", {
      status: 403,
    })
  }

  try {
    console.log(`${logPrefix} secret validated`)

    // Get current manifest from D1
    console.log(`${logPrefix} querying D1`, {
      module,
    })

    const row = await env.D1.prepare("SELECT * FROM manifests WHERE module = ?")
      .bind(module)
      .first()

    console.log(`${logPrefix} D1 query complete`, {
      found: Boolean(row),
      hasData: Boolean(row?.data),
    })

    if (!row) {
      console.warn(`${logPrefix} manifest not found`, {
        module,
      })

      return new Response(`manifest ${module} does not exist`, {
        status: 404,
      })
    }

    if (typeof row.data !== "string") {
      throw new TypeError(
        `Manifest data for ${module} is not a string; got ${typeof row.data}`,
      )
    }

    // Parse manifest
    console.log(`${logPrefix} parsing manifest`, {
      dataLength: row.data.length,
    })

    let manifest

    try {
      manifest = JSON.parse(row.data)
    } catch (parseErr) {
      console.error(`${logPrefix} MANIFEST JSON PARSE FAILED`, {
        module,
        dataLength: row.data.length,
        error: parseErr?.message,
      })

      throw new Error(`Invalid JSON stored in D1 for manifest ${module}`, {
        cause: parseErr,
      })
    }

    console.log(`${logPrefix} manifest parsed`, {
      id: manifest?.id,
      title: manifest?.title,
      version: manifest?.version,
    })

    if (!manifest?.version) {
      throw new Error(`Manifest for ${module} does not contain a version`)
    }

    // Construct R2 key
    const r2Key = `${module}-v${manifest.version}`

    console.log(`${logPrefix} requesting R2 object`, {
      r2Key,
    })

    // Fetch ZIP
    const zip = await env.R2.get(r2Key)

    console.log(`${logPrefix} R2 request complete`, {
      found: Boolean(zip),
      hasBody: Boolean(zip?.body),
      size: zip?.size ?? null,
      etag: zip?.etag ?? null,
    })

    if (zip === null) {
      console.error(`${logPrefix} R2 object missing`, {
        module,
        version: manifest.version,
        r2Key,
      })

      await email(
        "404 /forge/latest",
        [
          "Latest module ZIP missing from R2",
          `requestId=${requestId}`,
          `module=${module}`,
          `version=${manifest.version}`,
          `r2Key=${r2Key}`,
          `ip=${ip}`,
          `country=${country}`,
        ].join("\n"),
        "ERROR",
        env,
        logPrefix,
      )

      return new Response(`module ${module} does not exist`, {
        status: 404,
      })
    }

    console.log(`${logPrefix} SUCCESS`, {
      module,
      version: manifest.version,
      r2Key,
      size: zip.size ?? null,
      etag: zip.etag ?? null,
    })

    return new Response(zip.body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${module}.zip"`,
      },
    })
  } catch (err) {
    const errorDetails = errObj(err, {
      requestId,
      module,
      ip,
      country,
      agent,
    })

    console.error(`${logPrefix} 500 ERROR`, errorDetails)

    await email("500 /forge/latest", errorDetails, "ERROR", env, logPrefix)

    return new Response(`server error (${requestId})`, {
      status: 500,
    })
  }
}
