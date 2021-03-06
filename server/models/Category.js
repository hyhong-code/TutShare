const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxlength: 32,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      maxlength: 32,
      index: true,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      key: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
      minlength: 25,
      maxlength: 1000,
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Slug the category name
categorySchema.pre("validate", async function (next) {
  if (!(this.isNew || this.isModified("name"))) {
    return next();
  }
  this.slug = slugify(this.name);
  next();
});

// Return posted by user upon query
categorySchema.pre(/^find/, function (next) {
  this.populate({
    path: "postedBy",
    select: "-password -__v -resetPasswordToken",
  });
  next();
});

// Slugify new name if name is updated
categorySchema.pre("findOneAndUpdate", async function (next) {
  // To get a reference of doc to be updated
  const doc = await this.model.findOne(this.getFilter());

  // Slugify new name
  const newName = this._update.name;
  if (newName && newName !== doc.name) {
    doc.name = slugify(newName);
    await doc.save();
  }

  next();
});

module.exports = mongoose.model("Cateogry", categorySchema);
