import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  id: string;
  event_id: string;
  user_id: string;
  status: 'present' | 'absent';
  marked_by: string;
  points_awarded: number;
  verified_at: string;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    id: { type: String, required: true, unique: true, index: true },
    event_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
    marked_by: { type: String, required: true },
    points_awarded: { type: Number, default: 0 },
    verified_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

AttendanceSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
