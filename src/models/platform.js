import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const platformSchema = new Schema({
  name: String,
  description: String,
  _categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  configuration: {
    showCompany: Boolean,
    showBrands: Boolean,
    showPeople: Boolean,
    showTags: Boolean,
    showPhotos: Boolean,
    showTransactions: Boolean,
    allowAdditionalParts: Boolean,
    fields: [{
      type: String,
      label: String,
      options: [{
        type: String,
        label: String
      }]
    }]
  },
  parts: [{
    name: String,
    description: String,
    type: String,
    fields: [{
      type: String,
      label: String,
      options: [{
        type: String,
        label: String
      }]
    }],
    createdPlatformId: { type: String, index: true }
  }]
});

export default mongoose.model('Platform', platformSchema);
