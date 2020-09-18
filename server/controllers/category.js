const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
// const fs = require("fs");
// const formidable = require("formidable");

const Category = require("../models/Category");
const Link = require("../models/Link");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
const s3 = new AWS.S3();

exports.createCategory = async (req, res, next) => {
  try {
    const { name, image, description } = req.body;

    // Process Image data
    const imageBase64Buffer = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const imageType = image.split(";")[0].split("/")[1];

    const s3UploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `category/${uuidv4()}.${imageType}`,
      Body: imageBase64Buffer, // sync -> Make sure file is loaded at the time of update
      ACL: process.env.AWS_S3_BUCKET_ACL, // public-read -> so user do can view image
      ContentType: `image/${imageType}`,
      ContentEncoding: "base64",
    };

    let data;
    try {
      data = await s3.upload(s3UploadParams).promise();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        errors: [{ msg: "Upload image failed, please try again." }],
      });
    }

    // data: { ...,
    //   Location: 'https://tutshare.s3.us-west-2.amazonaws.com/category/37af4ebd-7223-49c6-b7df-56f5f002dd9d',
    //   key: 'category/37af4ebd-7223-49c6-b7df-56f5f002dd9d',
    //   ... }

    // Create the category
    category = await Category.create({
      name,
      image: { url: data.Location, key: data.Key }, // key is used for deleting images
      description,
      postedBy: req.user._id,
    });

    res.status(201).json({
      data: { category },
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(500).json({
        errors: [{ msg: "Sorry, this category name is already in use." }],
      });
    }

    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later." }],
    });
  }
};

exports.listCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      data: { categories },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later" }],
    });
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;

    const category = await Category.findOne({ slug });

    // Handle category does not exist
    if (!category) {
      return res.status(404).json({
        errors: [{ msg: "Category not found." }],
      });
    }

    // Get all links of this category
    const links = await Link.find({ categories: category })
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .skip(skip);

    return res.status(200).json({
      data: {
        category,
        links,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later" }],
    });
  }
};

exports.updateCategory = async (req, res, next) => {};

exports.deleteCategory = async (req, res, next) => {};

/*
exports.createCategory = async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    try {
      console.log({ fields, files });

      if (err) {
        console.err("formidable ERROR", err);
        return res.status(400).json({
          errors: [{ msg: `Upload image failed, please try again.` }],
        });
      }

      const { name, description } = fields;
      const { image } = files;

      // Handle category name already in user
      let category = await Category.findOne({ name });
      if (category) {
        return res.status(500).json({
          errors: [{ msg: `Category name ${name} is already in use.` }],
        });
      }

      // Upload to s3
      // limit image size to 2mb
      if (image.size > 2000000) {
        return res.status(400).json({
          errors: [{ msg: `Image must be less than 2MB` }],
        });
      }

      const s3UploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `category/${uuidv4()}`,
        Body: fs.readFileSync(image.path), // sync -> Make sure file is loaded at the time of update
        ACL: process.env.AWS_S3_BUCKET_ACL, // public-read -> so user do can view image
        ContentType: process.env.AWS_S3_BUCKET_CONTENT_TYPE,
      };

      let data;
      try {
        data = await s3.upload(s3UploadParams).promise();
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          errors: [{ msg: "Upload image failed, please try again." }],
        });
      }


      // data: { ...,
      //   Location: 'https://tutshare.s3.us-west-2.amazonaws.com/category/37af4ebd-7223-49c6-b7df-56f5f002dd9d',
      //   key: 'category/37af4ebd-7223-49c6-b7df-56f5f002dd9d',
      //   ... }


      // Create the category
      category = await Category.create({
        name,
        image: { url: data.Location, key: data.Key }, // key is used for deleting images
        description,
        postedBy: req.user._id,
      });

      res.status(201).json({
        data: { category },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        errors: [{ msg: "Something went wrong, please try again later" }],
      });
    }
  });
};
*/
