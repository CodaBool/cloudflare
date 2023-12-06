// import 'dotenv/config'


import dotenv from 'dotenv'
dotenv.config({ path: './.dev.vars' })
// import assert from 'assert'
import chai from 'chai'
import chaiHttp from 'chai-http'


// console.log("start", process.env)
// import { Miniflare } from "miniflare"

// const mf = new Miniflare({
//   modules: true,
//   script: "",
//   // script: `
//   // export default {
//   //   async fetch(request, env, ctx) {
//   //     const object = await env.R2.get("terminal-v1.0.0")
//   //     await env.R2.put("test", value.toString())
//   //     return new Response(value.toString())
//   //   }
//   // }
//   // `,
//   r2Buckets: ["R2"],
// })

// const bucket = await mf.getR2Bucket("R2")
// await bucket.put("terminal-v1.0.0", "test")


const expect = chai.expect
chai.use(chaiHttp)

// describe('Array', function () {
//   describe('#indexOf()', function () {
//     it('should return -1 when the value is not present', async function () {
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     })
//   })
// })

// assert.equal([1, 2, 3].indexOf(4), -1)

const HOST = "http://localhost:8787"

describe('d3erver', () => {
  it('/GET 400 on mising query', done => {
    chai.request(HOST)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(400)
        done()
      })
  })
  it('/GET 403 on bad token', done => {
    chai.request(HOST)
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
    chai.request(HOST)
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
    chai.request(HOST)
      .get('/')
      .query({ token, module: "test" })
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
  })

  it('/GET 200 client uses the download URL', done => {
    chai.request(HOST)
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
    chai.request(HOST)
      .get('/forge')
      .end((err, res) => {
        expect(res).to.have.status(400)
        done()
      })
  })
  it('/forge 403 bad secret', done => {
    chai.request(HOST)
      .get('/forge')
      .query({ secret: "test", module: "test" })
      .end((err, res) => {
        expect(res).to.have.status(403)
        done()
      })
  })
  it('/forge 404 bad module', done => {
    chai.request(HOST)
      .get('/forge')
      .query({ secret: process.env.FORGE_SECRET, module: "test" })
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
  })


  // MANIFEST
  it('/manifest 400 missing queries', done => {
    chai.request(HOST)
      .get('/manifest')
      .end((err, res) => {
        expect(res).to.have.status(400)
        done()
      })
  })
  it('/manifest 403 bad secret', done => {
    chai.request(HOST)
      .get('/manifest')
      .query({ secret: "test", module: "test" })
      .end((err, res) => {
        expect(res).to.have.status(403)
        done()
      })
  })
  it('/manifest 200 secret injected module.json', done => {
    chai.request(HOST)
      .get('/manifest')
      .query({ secret: process.env.FORGE_SECRET, module: "terminal" })
      .end((err, res) => {
        expect(res).to.have.status(200)
        const manifest = JSON.parse(res.text)
        expect(manifest).to.have.property('manifest').that.is.a('string').and.equal(`https://d3erver.codabool.workers.dev/manifest?secret=${process.env.FORGE_SECRET}&module=terminal`)
        expect(manifest).to.have.property('download').that.is.a('string').and.equal(`https://d3erver.codabool.workers.dev/forge?secret=${process.env.FORGE_SECRET}&module=terminal-v1.0.0`)
        done()
      })
  })
})