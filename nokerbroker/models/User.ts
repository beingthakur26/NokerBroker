// models/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name:              { type: String, required: true },
  email:             { type: String, required: true, unique: true },
  whatsappNumber:    { type: String, required: true, unique: true },
  passwordHash:      { type: String },
  whatsappVerified:  { type: Boolean, default: false },
  emailVerified:     { type: Boolean, default: false },
  avatarUrl:         { type: String },
  city:              { type: String },
  locality:          { type: String },
}, { timestamps: true });

export default models.User || model("User", UserSchema);