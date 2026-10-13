import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  id: string;
  user_id: string;
  badge_name: string;
  badge_icon: string;
  description: string;
  points_threshold: number;
  awarded_at: string;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    badge_name: { type: String, required: true },
    badge_icon: { type: String, required: true },
    description: { type: String, required: true },
    points_threshold: { type: Number, default: 0 },
    awarded_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

export const Achievement = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
