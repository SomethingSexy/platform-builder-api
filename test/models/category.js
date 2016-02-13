import mongoose from 'mongoose';
import assert from 'assert';
import Category from '../../src/models/category.js';

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_DB_URI || 'mongodb://localhost/platformbuilder-test');

describe('Model Category', () => {
  describe('insert', () => {
    it('show insert category without parentId', done => {
      const instance = new Category({ name: 'Test', parentId: null });
      instance.save()
      .then((doc) => {
        // just verifying this plugin is working as expected
        assert.strictEqual(doc.path, '');
        assert.strictEqual(doc.parentId, null);
        assert.strictEqual(doc.depth, 0);
        done();
      });
    });
  });
});


