import 'babel-polyfill'; // need this for async/await support
import Koa from 'koa';
import routes from '../../src/routes/platform.js';
import supertest from 'supertest';
import chai from 'chai';
import bodyParser from 'koa-bodyparser';

const expect = chai.expect;
const assert = chai.assert;

const app = new Koa();
app.use(bodyParser());
app.use(routes(app));

const request = supertest.agent(app.listen());

function addTestPlatform(platform, callback) {
  return request
    .post('/api/platform')
    .send(platform)
    .end(callback);
}

describe('Platform Routes', () => {
  describe('post', () => {
    it('should respond with 200', (done) => {
      request
        .post('/api/platform')
        .send({ name: 'balls'})
        .expect(200, (err, res) => {
          if (err) return done(err);
          assert.typeOf(res.body, 'object');
          expect(res.body._id).to.be.a('string');
          // should not have a category attached
          expect(res.body._category).to.equal(undefined);
          done();
        });
    });
  });

  describe('post active', () => {
    it('should respond with 200', (done) => {
      request
        .post('/api/platform')
        .send({ active: true, name: 'balls'})
        .expect(200, (err, res) => {
          if (err) return done(err);
          assert.typeOf(res.body, 'object');
          expect(res.body._category).to.be.a('string');
          done();
        });
    });
  });

  describe('put', () => {
    it('should respond with 200', (done) => {
      addTestPlatform({ name: 'balls'}, (err, res) => {
        request
          .put('/api/platform/' + res.body._id)
          .send({ description: 'my balls'})
          .expect(200, (err, res) => {
            if (err) return done(err);
            assert.typeOf(res.body, 'object');
            expect(res.body._id).to.be.a('string');
            expect(res.body.description).to.equal('my balls');
            done();
          });
      });
    });
  });
});
