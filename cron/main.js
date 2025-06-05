export default {
  async scheduled(event, env, ctx) {
    return await shared(event, env, ctx)
  },
  // for local tests
  async fetch(event, env, ctx) {
    return await shared("test", env, ctx)
  }
}

async function shared(event, env, ctx) {
  const now = new Date();

  // Convert to America/New_York local time using Intl
  const options = { timeZone: "America/New_York", hour: "numeric", weekday: "short" };
  const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(now);
  const weekday = parts.find(p => p.type === "weekday").value; // e.g., "Sun"
  const hour = parseInt(parts.find(p => p.type === "hour").value); // e.g., 1
  const dayPeriod = parts.find(p => p.type === "dayPeriod").value // e.g., PM / AM
  const dayOfMonth = now.getDate();

  if (weekday !== "Sat" || hour !== 1 || dayOfMonth > 7 || dayPeriod !== "PM") {
    console.log("Not the correct time or not first Saturday");
    return new Response('skipped');
  }

  // Base URL
  const baseUrl = "https://deckytasjx2gzief7bp4isnnwq0yugmu.lambda-url.us-east-1.on.aws"

  // Query parameters
  const queryParams = {
    body: "@everyone Your Pilot License Level increased at the end of last session. I'll be joining the voice channel in an hour to assist anyone with level ups. This is very optional, and feel free to work async for your level ups.",
    secret: env.SECRET,
    test: event === "test",
    action: "manual",
  };

  // Build the URL with query parameters
  const url = new URL(baseUrl);
  Object.keys(queryParams).forEach(key => {
    url.searchParams.append(key, queryParams[key]);
  })

  const value = `<a href="${url}">Click link if Level Up session today, in an hour ${event === "test" ? " (test)" : ""}</a>`
  const subject = "Foundry Level Up Notice?"

  const mail = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.API_KEY,
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: "codabool@pm.me", name: "CodaBool" }]
      }],
      from: {
        email: `mail@codabool.com`,
        name: "automated_mail",
      },
      content: [{ type: "text/html", value }],
      subject,
    })
  })
  const text = await mail.text()
  if (!mail.ok || mail.status > 399) {
    console.error(`Error sending email: ${mail.status} ${mail.statusText} ${text}`);
    return new Response("not found", { status: 404 });
  }
  return new Response('email sent' + `${event === "test" ? " (test)" : ""}`)
}
