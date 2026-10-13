import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  points_earned: number;
  created_at: string;
}

const ActivitySchema = new Schema<IActivity>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    points_earned: { type: Number, default: 0 },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

export const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
