export default {
  async scheduled(event, env, ctx) {
    await env.worker.fetch(new Request('http://127.0.0.1'))
  }
}
