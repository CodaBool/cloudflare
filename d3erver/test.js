import * as chai from 'chai'
const { expect } = chai
import chaiHttp, { request } from 'chai-http'
chai.use(chaiHttp)
import dotenv from 'dotenv'

dotenv.config({ path: './.dev.vars' })

// local server, requires starting a dev server with 'bun run dev'
// const HOST = "http://localhost:8787"

// can also test on the live server
const HOST = "https://d3erver.codabool.workers.dev"

describe('d3erver', () => {
  it('/GET 400 on mising query', done => {
    request.execute(HOST)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(400)
        done()
      })
  })
  it('/GET 403 on bad token', done => {
    request.execute(HOST)
      .get('/')
      .query({ token: "test", module: "test" })
      .end((err, res) => {
        expect(res).to.have.status(403)
        done()
      })
  })

  let token
  let module

  it('/POST 200 Foundryvtt.com', done => {
    request.execute(HOST)
      .post('/')
      .send({ api_key: process.env.FOUNDRY_SECRET, package_name: 'terminal', user_id: "test", version: "1.0.0" })
      .end((err, res) => {
        expect(res).to.have.status(200)
        const url = new URL(res.body.download)
        token = url.searchParams.get("token")
        module = url.searchParams.get("module")
        done()
      });
  });

  it('/GET 404 authed but non-existant module', done => {
    request.execute(HOST)
      .get('/')
      .query({ token, module: "test" })
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
  })

  it('/GET 200 client uses the download URL', done => {
    request.execute(HOST)
      .get('/')
      .query({ token, module })
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res).to.have.header('content-type', 'application/zip')
        done()
      })
  })

  // FORGE
  it('/forge 400 missing query', done => {
    request.execute(HOST)
      .get('/forge')
      .end((err, res) => {
        expect(res).to.have.status(400)
        done()
      })
  })
  it('/forge 403 bad secret', done => {
    request.execute(HOST)
      .get('/forge')
      .query({ secret: "test", module: "test" })
      .end((err, res) => {
        expect(res).to.have.status(403)
        done()
      })
  })
  it('/forge 404 bad module', done => {
    request.execute(HOST)
      .get('/forge')
      .query({ secret: process.env.FORGE_SECRET, module: "test" })
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
  })


  // MANIFEST
  it('/manifest 400 missing queries', done => {
    request.execute(HOST)
      .get('/manifest')
      .end((err, res) => {
        expect(res).to.have.status(400)
        done()
      })
  })
  it('/manifest 403 bad secret', done => {
    request.execute(HOST)
      .get('/manifest')
      .query({ secret: "test", module: "test" })
      .end((err, res) => {
        expect(res).to.have.status(403)
        done()
      })
  })
  it('/manifest 200 secret injected module.json', done => {
    request.execute(HOST)
      .get('/manifest')
      .query({ secret: process.env.FORGE_SECRET, module: "terminal" })
      .end((err, res) => {
        expect(res).to.have.status(200)
        const manifest = JSON.parse(res.text)
        expect(manifest).to.have.property('manifest').that.is.a('string').and.equal(`https://d3erver.codabool.workers.dev/manifest?secret=${process.env.FORGE_SECRET}&module=terminal`)
        expect(manifest.download.substring(0, 108)).to.equal(`https://d3erver.codabool.workers.dev/forge?secret=${process.env.FORGE_SECRET}&module=terminal-v`);
        // expect(manifest).to.have.property('download').that.is.a('string').and.equal(`https://d3erver.codabool.workers.dev/forge?secret=${process.env.FORGE_SECRET}&module=terminal-v1.0.0`)
        done()
      })
  })
})
