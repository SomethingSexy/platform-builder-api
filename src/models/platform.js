import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const optionSchema = new Schema({
  type: String,
  label: String
});

const fieldSchema = new Schema({
  type: String,
  label: String,
  options: [optionSchema]
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
  active: { type: Boolean, default: false },
  showCompany: { type: Boolean, default: false },
  showBrands: { type: Boolean, default: false },
  showPeople: { type: Boolean, default: false },
  showTags: { type: Boolean, default: false },
  showPhotos: { type: Boolean, default: false },
  showTransactions: { type: Boolean, default: false },
  allowAdditionalParts: { type: Boolean, default: false },
  fields: [fieldSchema],
  parts: [partSchema]
});

export default mongoose.model('Platform', platformSchema);
