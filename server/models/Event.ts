import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  id: string;
  club_id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  points_value: number;
  max_capacity: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  banner_color: string;
  created_by?: string;
  created_at: string;
}

const EventSchema = new Schema<IEvent>(
  {
    id: { type: String, required: true, unique: true, index: true },
    club_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    points_value: { type: Number, default: 50 },
    max_capacity: { type: Number, default: 100 },
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
    banner_color: { type: String, default: '#3B82F6' },
    created_by: { type: String },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
