import 'babel-polyfill'; // need this for async/await support
import Koa from 'koa';
import routes from '../../src/routes/platform.js';
import supertest from 'supertest-as-promised';
import chai from 'chai';
import bodyParser from 'koa-bodyparser';

const expect = chai.expect;
const assert = chai.assert;

const app = new Koa();
app.use(bodyParser());
app.use(routes(app));

const request = supertest.agent(app.listen());

function addTestPlatform(platform) {
  return request
    .post('/api/platforms')
    .send(platform);
}

function getTestPlatform(platformid) {
  return request
    .get('/api/platforms/' + platformid);
}

describe('Platform Routes', () => {
  describe('get', () => {
    it('should return a single platform', async (done) => {
      const savedPlatform = await addTestPlatform({ name: 'balls'});
      const platform = await request
        .get('/api/platforms/' + savedPlatform.body._id)
        .expect(200);
      assert.typeOf(platform.body, 'object');
      expect(platform.body._id).to.be.a('string');
      done();
    });

    it('should return multiple platforms', async (done) => {
      const platform = await request
        .get('/api/platforms')
        .expect(200);
      assert.typeOf(platform.body, 'array');
      assert.ok(platform.body.length > 0);
      done();
    });
  });

  describe('post', () => {
    it('should respond with 200', (done) => {
      request
        .post('/api/platforms')
        .send({ name: 'balls'})
        .expect(200)
        .then(res => {
          assert.typeOf(res.body, 'object');
          expect(res.body._id).to.be.a('string');
          // should not have a category attached
          expect(res.body._category).to.equal(undefined);
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it('should create active platform with a category', (done) => {
      request
        .post('/api/platforms')
        .send({ active: true, name: 'balls'})
        .expect(200)
        .then(res => {
          assert.typeOf(res.body, 'object');
          expect(res.body._category.name).to.equal('balls');
          expect(res.body._category.description).to.equal(undefined);
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it('should create platform with a field', (done) => {
      request
        .post('/api/platforms')
        .send({ name: 'balls', fields: [{type: 'input', label: 'Stuff'}]})
        .expect(200)
        .then(res => {
          assert.typeOf(res.body, 'object');
          expect(res.body.fields).to.be.an('array');
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it('should fail because name is not defined when passing active', (done) => {
      request
        .post('/api/platforms')
        .send({ active: true})
        .expect(400)
        .then(res => {
          assert.typeOf(res.body, 'array');
          expect(res.body[0].field).to.equal('name');
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  describe('put', () => {
    it('should respond with 200', (done) => {
      addTestPlatform({ name: 'balls'}).then(res => {
        request
          .put('/api/platforms/' + res.body._id)
          .send({ description: 'my balls', showCompany: true})
          .expect(200)
          .then(res => {
            assert.typeOf(res.body, 'object');
            expect(res.body._id).to.be.a('string');
            expect(res.body.description).to.equal('my balls');
            expect(res.body.showCompany).to.equal(true);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });

    it('should add a field', (done) => {
      addTestPlatform({ name: 'balls'}).then(res => {
        request
          .put('/api/platforms/' + res.body._id)
          .send({ fields: [{type: 'input', label: 'Stuff'}]})
          .expect(200)
          .then(res => {
            expect(res.body.fields).to.be.an('array');
            expect(res.body.fields.length).to.eql(1);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });

    it('should remove a field', (done) => {
      addTestPlatform({ name: 'balls', fields: [{type: 'input', label: 'Stuff'}]}).then(res => {
        request
          .put('/api/platforms/' + res.body._id)
          .send({ fields: []})
          .expect(200)
          .then(res => {
            expect(res.body.fields).to.be.an('array');
            expect(res.body.fields.length).to.eql(0);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });

    it('should add and remove a field', (done) => {
      addTestPlatform({ name: 'balls', fields: [{type: 'input', label: 'Stuff'}]}).then(res => {
        request
          .put('/api/platforms/' + res.body._id)
          .send({ fields: [{type: 'textarea', label: 'WHAT'}]})
          .expect(200)
          .then(res => {
            expect(res.body.fields).to.be.an('array');
            expect(res.body.fields.length).to.eql(1);
            expect(res.body.fields[0].type).to.eql('textarea');
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });
    it('should add, remove, and keep a field', (done) => {
      // remove stuff, add WHAT and keep balls
      addTestPlatform({ name: 'balls', fields: [{type: 'input', label: 'Stuff'}, {type: 'input', label: 'balls'}]}).then(res => {
        request
          .put('/api/platforms/' + res.body._id)
          .send({ fields: [{type: 'textarea', label: 'WHAT'}, {_id: res.body.fields[1]._id, type: 'input', label: 'balls'}]})
          .expect(200)
          .then(res => {
            expect(res.body.fields).to.be.an('array');
            expect(res.body.fields.length).to.eql(2);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });

    it('should update the category with the new name and description', (done) => {
      addTestPlatform({ name: 'balls', description: 'big balls', active: true}).then(res => {
        request
          .put('/api/platforms/' + res.body._id)
          .send({ description: 'my balls'})
          .expect(200)
          .then(res => {
            assert.typeOf(res.body, 'object');
            expect(res.body._id).to.be.a('string');
            expect(res.body.description).to.equal('my balls');
            expect(res.body._category.description).to.equal('my balls');
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });

    it('should active the platform and create a category', (done) => {
      addTestPlatform({ name: 'balls', description: 'big balls'}).then(res => {
        request
          .put('/api/platforms/' + res.body._id)
          .send({ active: true })
          .expect(200)
          .then(res => {
            expect(res.body._category.name).to.equal('balls');
            expect(res.body._category.description).to.equal('big balls');
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });
  });

  describe('post part', () => {
    it('should respond with 200', (done) => {
      addTestPlatform({ name: 'gun'}).then(platformRes => {
        const platformId = platformRes.body._id;
        request
          .post('/api/platforms/' + platformRes.body._id + '/part')
          .send({ name: 'my part', description: 'stuff'})
          .expect(200)
          .then(res => {
            // response should be the part
            expect(res.body._id).to.be.a('string');
            expect(res.body._createdPlatformId).to.equal(platformId);

            // now fetch the platform again to make sure it returned
            getTestPlatform(platformId).then(fetchRes => {
              expect(fetchRes.body.parts).to.be.a('array');
              expect(fetchRes.body.parts.length).to.equal(1);
              expect(fetchRes.body.parts[0].name).to.equal('my part');
              expect(fetchRes.body.parts[0].description).to.equal('stuff');
              done();
            });
          })
          .catch(err => {
            done(err);
          });
      });
    });
  });
});
