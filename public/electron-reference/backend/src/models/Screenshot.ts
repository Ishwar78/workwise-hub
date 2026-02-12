import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IScreenshot extends Document {
  user_id: Types.ObjectId;
  company_id: Types.ObjectId;
  session_id: Types.ObjectId;
  timestamp: Date;
  s3_key: string;
  s3_bucket: string;
  file_size: number;
  resolution: { width: number; height: number };
  monitor_id?: string;
  activity_score: number;
  active_window: { title: string; app_name: string };
  blurred: boolean;
}

const ScreenshotSchema = new Schema<IScreenshot>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  session_id: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  timestamp: { type: Date, required: true },
  s3_key: { type: String, required: true },
  s3_bucket: { type: String, required: true },
  file_size: { type: Number, required: true },
  resolution: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  monitor_id: String,
  activity_score: { type: Number, default: 0 },
  active_window: {
    title: { type: String, default: '' },
    app_name: { type: String, default: '' },
  },
  blurred: { type: Boolean, default: false },
}, { timestamps: true });

ScreenshotSchema.index({ company_id: 1, user_id: 1, timestamp: -1 });
ScreenshotSchema.index({ session_id: 1 });
ScreenshotSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 86400 });

export const Screenshot = mongoose.model<IScreenshot>('Screenshot', ScreenshotSchema);
