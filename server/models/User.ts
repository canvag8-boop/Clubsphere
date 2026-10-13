import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'coordinator' | 'admin';
  student_id?: string;
  department?: string;
  year?: number;
  section?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  points: number;
  created_at: string;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'coordinator', 'admin'], default: 'student' },
    student_id: { type: String },
    department: { type: String },
    year: { type: Number, default: 1 },
    section: { type: String, default: 'A' },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    avatar: { type: String },
    points: { type: Number, default: 0 },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        delete ret._id;
        delete ret.password;
        return ret;
      },
    },
  }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
