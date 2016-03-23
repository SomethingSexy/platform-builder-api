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

// this will define part groupings, it will
// just have an array of part ids for now
const partGroupSchema = new Schema({
  name: String,
  description: String,
  parts: [Schema.Types.ObjectId] // these will link up to is from the platform schema parts
});

const platformSchema = new Schema({
  name: {
    type: String,
    required: function nameRequired() {
      return this.active ? true : false;
    }
  },
  description: {
    type: String,
    required: function nameRequired() {
      return this.active ? true : false;
    }
  },
  // if this platform is being added as sub platform use this
  _parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
  // This is the category reference for this platform
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
  // maybe not alll platforms will allow products and they will just be used to organize
  allowProducts: { type: Boolean, default: true },
  fields: [fieldSchema],
  parts: [{ type: Schema.Types.ObjectId, ref: 'PartDefinition' }], // can share part definitions across platforms so make them their own schema
  partGroups: [partGroupSchema] // this will be internal to the platform
});

export default mongoose.model('Platform', platformSchema);
