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
  _createdPlatformId: { type: Schema.Types.ObjectId, index: true }
});

export default mongoose.model('PartDefinition', partSchema);
