const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  { timestamps: true }
);

const translationSchema = mongoose.Schema(
  {
    en: { type: String },
    fr: { type: String },
    es: { type: String },
    de: { type: String },
    ru: { type: String },
    ae: { type: String },
    jp: { type: String },
    kr: { type: String },
    cn: { type: String },
    it: { type: String },
  },
  { _id: false }
);

const placeSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: translationSchema, required: true },
  title: { type: translationSchema, required: true },
  description: { type: translationSchema, required: true },
  region: { type: translationSchema, required: true },
  keywords: { type: translationSchema },
  url: { type: String, required: true },
  viewCount: { type: Number, default: 0 },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Product = mongoose.models.Place || mongoose.model('Place', placeSchema);