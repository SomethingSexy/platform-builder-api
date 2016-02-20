import 'babel-polyfill'; // need this for async/await support
import mongoose from 'mongoose';
import Category from '../../src/models/category.js';
import chai from 'chai';

const expect = chai.expect;
const assert = chai.assert;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_DB_URI || 'mongodb://localhost/platformbuilder-test');

// drop the categories, mainly here when running locally
if (mongoose.connection.collections.categories) {
  mongoose.connection.collections.categories.drop((err) => {
    console.log('collection dropped');
  });
}

let rootId = null;

describe('Model Category', () => {
  describe('insert', () => {
    it('show insert category without parentId', done => {
      const instance = new Category({ name: 'Test', parentId: null });
      instance.save()
      .then((doc) => {
        rootId = doc._id;
        // just verifying this plugin is working as expected
        assert.strictEqual(doc.path, '');
        assert.strictEqual(doc.parentId, null);
        assert.strictEqual(doc.depth, 0);
        done();
      });
    });

    it('should insert 1 level 1st child element', (done) => {
      const instance = new Category({ name: 'Test2', parentId: rootId });
      instance.save()
      .then((doc) => {
        assert.strictEqual(doc.parentId, rootId);
        assert.strictEqual(doc.path, ',' + rootId);
        assert.strictEqual(doc.depth, 1);
        done();
      });
    });
  });

  describe('GetFullArrayTree', () => {
    it('should return an array tree with children', async (done) => {
      try {
        const response = await Category.GetFullArrayTree();
        expect(response).to.be.a('array');
        expect(response[0].children).to.be.a('array');
        done();
      } catch(err) {
        done(err);
      }
    });
  });
});


