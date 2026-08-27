// increment CloudFlare D1, SQLite for record keeping
export async function increment(env, platform, module) {
  if (env.TEST === "true") return
  try {
    const now = new Date()
    const date = `${now.getFullYear()}-${now.getMonth() + 1}`

    const { meta } = await env.D1.prepare(
      `
				UPDATE downloads
				SET total = total + 1
				WHERE year_month = ?
					AND platform = ?
					AND module = ?
			`,
    )
      .bind(date, platform, module)
      .run()

    if (!meta.changes) {
      await env.D1.prepare(
        `
					INSERT OR IGNORE INTO downloads
						(platform, module, total, year_month)
					VALUES (?, ?, 1, ?)
				`,
      )
        .bind(platform, module, date)
        .run()
    }
  } catch (err) {
    const errorDetails = errObj(err, {
      platform,
      module,
    })

    console.error("[increment] D1 ERROR", errorDetails)

    await email("increment error", errorDetails, "ERROR", env)
  }
}

export function serializeError(err) {
  if (err instanceof Error) {
    return JSON.stringify(
      {
        name: err.name,
        message: err.message,
        stack: err.stack,
        cause: serializeCause(err.cause),
      },
      null,
      2,
    )
  }

  try {
    return JSON.stringify(
      err,
      (key, value) => {
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
            cause: serializeCause(value.cause),
          }
        }

        return value
      },
      2,
    )
  } catch {
    return {}
  }
}

function serializeCause(cause) {
  if (cause instanceof Error) {
    return {
      name: cause.name,
      message: cause.message,
      stack: cause.stack,
    }
  }

  return cause ?? null
}

// email myself
export async function email(subject, rawVal, name, env, logPrefix = "[email]") {
  if (env.TEST === "true") return

  try {
    const value = typeof rawVal === "string" ? rawVal : serializeError(rawVal)

    const mail = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.MAILCHANNEL_API_KEY,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: "codabool@pm.me",
                name: "CodaBool",
              },
            ],
          },
        ],
        from: {
          email: "d3erver@codabool.com",
          name,
        },
        content: [
          {
            type: "text/plain",
            value,
          },
        ],
        subject,
      }),
    })

    const text = await mail.text()

    if (!mail.ok) {
      console.error(`${logPrefix} ERROR SENDING EMAIL`, {
        status: mail.status,
        statusText: mail.statusText,
        response: text,
      })
    }
  } catch (err) {
    console.error(`${logPrefix} EMAIL FETCH FAILED`, {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    })
  }
}

export function getRequestInfo(request) {
  return {
    country: request.headers.get("cf-ipcountry"),
    agent: request.headers.get("user-agent"),
    ip:
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-real-ip"),
  }
}

export function errObj(err, extra = {}) {
  return {
    ...extra,
    name: err?.name ?? "UnknownError",
    message: err?.message ?? String(err),
    stack: err?.stack ?? null,
    cause: err?.cause ?? null,
  }
}
