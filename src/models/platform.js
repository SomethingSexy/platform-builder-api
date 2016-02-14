import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const fieldSchema = new Schema({
  type: String,
  label: String,
  options: [{
    type: String,
    label: String
  }]
});

const partSchema = new Schema({
  name: String,
  description: String,
  type: String,
  fields: [fieldSchema],
  createdPlatformId: { type: String, index: true }
});

const platformSchema = new Schema({
  name: String,
  description: String,
  _category: { type: Schema.Types.ObjectId, ref: 'Category' },
  // determines if the platform is active or not
  active: Boolean,
  showCompany: Boolean,
  showBrands: Boolean,
  showPeople: Boolean,
  showTags: Boolean,
  showPhotos: Boolean,
  showTransactions: Boolean,
  allowAdditionalParts: Boolean,
  fields: [fieldSchema],
  parts: [partSchema]
});

export default mongoose.model('Platform', platformSchema);
