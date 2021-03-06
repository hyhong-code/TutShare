const mongoose = require("mongoose");
// const slugify = require("slugify");

const linkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      max: 256,
    },
    url: {
      type: String,
      trim: true,
      required: true,
      max: 256,
      unique: true,
      index: true,
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    categories: {
      type: [
        { type: mongoose.Schema.ObjectId, ref: "Category", required: true },
      ],
      required: true,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    medium: {
      type: String,
      enum: ["video", "book", "e-book", "article"],
      default: "video",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// linkSchema.pre("validate", async function (next) {
//   if (!(this.isNew || this.isModified("title"))) {
//     return next();
//   }
//   this.slug = slugify(this.title);
//   next();
// });

// Return posted by user upon query
linkSchema.pre(/^find/, function (next) {
  this.populate({
    path: "postedBy",
    select: "-password -__v -resetPasswordToken",
  });
  next();
});

module.exports = mongoose.model("Link", linkSchema);
