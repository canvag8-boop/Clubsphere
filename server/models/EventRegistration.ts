import mongoose, { Schema, Document } from 'mongoose';

export interface IEventRegistration extends Document {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  status: 'registered' | 'attended' | 'cancelled';
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    id: { type: String, required: true, unique: true, index: true },
    event_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    registered_at: { type: String, default: () => new Date().toISOString() },
    status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' },
  },
  {
    timestamps: true,
  }
);

EventRegistrationSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

export const EventRegistration = mongoose.models.EventRegistration || mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);
