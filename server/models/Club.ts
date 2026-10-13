import mongoose, { Schema, Document } from 'mongoose';

export interface IClub extends Document {
  id: string;
  name: string;
  category: string;
  description: string;
  lead_coordinator_id?: string;
  logo_icon: string;
  banner_gradient: string;
  location: string;
  meeting_schedule: string;
  member_count: number;
  created_at: string;
}

const ClubSchema = new Schema<IClub>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    lead_coordinator_id: { type: String, index: true },
    logo_icon: { type: String, default: 'Users' },
    banner_gradient: { type: String, default: 'from-blue-600 to-indigo-700' },
    location: { type: String, required: true },
    meeting_schedule: { type: String, required: true },
    member_count: { type: Number, default: 0 },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
  }
);

export const Club = mongoose.models.Club || mongoose.model<IClub>('Club', ClubSchema);
