import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    // Title-only tasks still return a description string to the UI.
    description: { type: String, trim: true, default: '', maxlength: 2000 },
    done: { type: Boolean, default: false },
  },
  // Let Mongoose maintain createdAt and updatedAt.
  { timestamps: true, versionKey: false },
);
export const Todo = mongoose.model('Todo', schema);
