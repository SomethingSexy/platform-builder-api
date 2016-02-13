import 'babel-polyfill'; // need this for async/await support
import Koa from 'koa';
import routes from '../../src/routes/platform.js';
import supertest from 'supertest';
import chai from 'chai';

const expect = chai.expect;
const assert = chai.assert;

const app = new Koa();
app.use(routes(app));

const request = supertest.agent(app.listen());

describe('Platform Routes', () => {
  describe('post', () => {
    it('should respond with 200', (done) => {
      request
        .post('/api/platform')
        .send({ external: true})
        .expect(200, (err, res) => {
          if (err) return done(err);
          assert.typeOf(res.body, 'object');
          done();
        });
    });
  });
});
