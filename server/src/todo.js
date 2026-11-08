import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, default: '', maxlength: 2000 },
  done: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });
export const Todo = mongoose.model('Todo', schema);
