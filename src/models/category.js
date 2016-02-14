import mongoose from 'mongoose';
import materializedPlugin from 'mongoose-materialized';

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: String,
  description: String,
  _platformId: { type: Schema.Types.ObjectId, ref: 'Platform', index: true } // not sure we need the ref here to be honest
});

categorySchema.plugin(materializedPlugin);

export default mongoose.model('Category', categorySchema);
