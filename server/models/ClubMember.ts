import mongoose, { Schema, Document } from 'mongoose';

export interface IClubMember extends Document {
  id: string;
  club_id: string;
  user_id: string;
  role: 'member' | 'lead' | 'coordinator';
  joined_at: string;
}

const ClubMemberSchema = new Schema<IClubMember>(
  {
    id: { type: String, required: true, unique: true, index: true },
    club_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    role: { type: String, default: 'member' },
    joined_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

ClubMemberSchema.index({ club_id: 1, user_id: 1 }, { unique: true });

export const ClubMember = mongoose.models.ClubMember || mongoose.model<IClubMember>('ClubMember', ClubMemberSchema);
