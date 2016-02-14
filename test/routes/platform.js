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

    it('should create active platform with a category', (done) => {
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

    it('should create platform with a field', (done) => {
      request
        .post('/api/platform')
        .send({ name: 'balls', fields: [{type: 'input', label: 'Stuff'}]})
        .expect(200, (err, res) => {
          if (err) return done(err);
          assert.typeOf(res.body, 'object');
          expect(res.body.fields).to.be.an('array');
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

    it('should add a field', (done) => {
      addTestPlatform({ name: 'balls'}, (err, res) => {
        request
          .put('/api/platform/' + res.body._id)
          .send({ fields: [{type: 'input', label: 'Stuff'}]})
          .expect(200, (err, res) => {
            if (err) return done(err);
            expect(res.body.fields).to.be.an('array');
            expect(res.body.fields.length).to.eql(1);
            done();
          });
      });
    });

    it('should remove a field', (done) => {
      addTestPlatform({ name: 'balls', fields: [{type: 'input', label: 'Stuff'}]}, (err, res) => {
        request
          .put('/api/platform/' + res.body._id)
          .send({ fields: []})
          .expect(200, (err, res) => {
            if (err) return done(err);
            expect(res.body.fields).to.be.an('array');
            expect(res.body.fields.length).to.eql(0);
            done();
          });
      });
    });
  });
});
