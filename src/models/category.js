import mongoose from 'mongoose';
import materializedPlugin from 'mongoose-materialized';

const categorySchema = new mongoose.Schema({
  name: String
});

categorySchema.plugin(materializedPlugin);

export default mongoose.model('Category', categorySchema);
