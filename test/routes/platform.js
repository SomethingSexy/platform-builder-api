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
          expect(res.body._category.name).to.equal('balls');
          expect(res.body._category.description).to.equal(undefined);
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

    it('should add and remove a field', (done) => {
      addTestPlatform({ name: 'balls', fields: [{type: 'input', label: 'Stuff'}]}, (err, res) => {
        request
          .put('/api/platform/' + res.body._id)
          .send({ fields: [{type: 'textarea', label: 'WHAT'}]})
          .expect(200, (err, res) => {
            if (err) return done(err);
            expect(res.body.fields).to.be.an('array');
            expect(res.body.fields.length).to.eql(1);
            expect(res.body.fields[0].type).to.eql('textarea');
            done();
          });
      });
    });
    it('should add, remove, and keep a field', (done) => {
      // remove stuff, add WHAT and keep balls
      addTestPlatform({ name: 'balls', fields: [{type: 'input', label: 'Stuff'}, {type: 'input', label: 'balls'}]}, (err, res) => {
        request
          .put('/api/platform/' + res.body._id)
          .send({ fields: [{type: 'textarea', label: 'WHAT'}, {_id: res.body.fields[1]._id, type: 'input', label: 'balls'}]})
          .expect(200, (err, res) => {
            if (err) return done(err);
            expect(res.body.fields).to.be.an('array');
            expect(res.body.fields.length).to.eql(2);
            done();
          });
      });
    });

    it('should update the category with the new name and description', (done) => {
      addTestPlatform({ name: 'balls', description: 'big balls', active: true}, (err, res) => {
        request
          .put('/api/platform/' + res.body._id)
          .send({ description: 'my balls'})
          .expect(200, (err, res) => {
            if (err) return done(err);
            assert.typeOf(res.body, 'object');
            expect(res.body._id).to.be.a('string');
            expect(res.body.description).to.equal('my balls');
            expect(res.body._category.description).to.equal('my balls');
            done();
          });
      });
    });

    it('should active the platform and create a category', (done) => {
      addTestPlatform({ name: 'balls', description: 'big balls'}, (err, res) => {
        request
          .put('/api/platform/' + res.body._id)
          .send({ active: true })
          .expect(200, (err, res) => {
            if (err) return done(err);
            expect(res.body._category.name).to.equal('balls');
            expect(res.body._category.description).to.equal('big balls');
            done();
          });
      });
    });
  });
});
