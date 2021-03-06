const AWS = require("aws-sdk");
// const { notifyNewResourceParams } = require("../services/sesEmail");
const { notifyNewResourceParams } = require("../services/nodeMailer");
const nodemailer = require("nodemailer");

const Link = require("../models/Link");
const User = require("../models/User");
const Category = require("../models/Category");

// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_KEY,
//   region: process.env.AWS_REGION,
// });
// const ses = new AWS.SES();

const transporter = nodemailer.createTransport({
  service: process.env.NODE_MAILER_SERVICE,
  auth: {
    user: process.env.NODE_MAILER_GMAIL,
    pass: process.env.NODE_MAILER_PASSWORD,
  },
});

exports.createLink = async (req, res, next) => {
  try {
    const { title, url, categories, isFree, medium } = req.body;
    console.table({ title, url, categories, isFree, medium });

    // Handle link already exists
    let link = await Link.findOne({ url });
    if (link) {
      return res.status(400).json({
        errors: [{ msg: "Sorry, this link has already been shared." }],
      });
    }

    link = await Link.create({
      ...req.body,
      postedBy: req.user._id,
    });

    // Get all users that subscribes to created link
    const users = await User.find({
      interestedIn: { $in: categories },
    });

    // Get all categories of the link
    const categoriesDetail = await Category.find({
      _id: { $in: categories },
    });

    // Send each user an email notification
    for (let user of users) {
      try {
        // ses
        //   .sendEmail(notifyNewResourceParams({ user, link, categoriesDetail }))
        //   .promise();
        transporter.sendMail(
          notifyNewResourceParams({ user, link, categoriesDetail })
        );
        console.log(`Email sent to ${user.name}`);
      } catch (error) {
        console.error("ERROR: send email", error);
        continue;
      }
    }

    res.status(201).json({
      data: { link },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later." }],
    });
  }
};

exports.listLinks = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;

    const links = await Link.find().skip(skip).limit(limit);

    res.status(200).json({
      data: { links },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later." }],
    });
  }
};

// For returning links postedBy a specific user
exports.listUserLinks = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;

    const links = await Link.find({ postedBy: req.user })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      data: { links },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later." }],
    });
  }
};

exports.getLink = async (req, res, next) => {
  try {
  } catch (error) {}
};

exports.updateLink = async (req, res, next) => {
  try {
    // req.link passed in by linkWriteAccess middleware
    let { link } = req;
    link = await Link.findByIdAndUpdate(
      link._id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      data: { link },
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        errors: [{ msg: "This url is already taken." }],
      });
    }

    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later." }],
    });
  }
};

exports.deleteLink = async (req, res, next) => {
  try {
    // req.link passed in by linkWriteAccess middleware
    let { link } = req;
    await Link.findByIdAndDelete(link._id);

    res.status(200).json({
      data: { msg: "Link successfully updated." },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later." }],
    });
  }
};

exports.increaseView = async (req, res, next) => {
  try {
    const { url } = req.body;

    // Handle no url
    if (!url) {
      return res.status(500).json({
        errors: [{ msg: "Url is required." }],
      });
    }

    const link = await Link.findOneAndUpdate(
      { url },
      { $inc: { views: 1 } }, // Increase views by 1
      { runValidators: true, new: true }
    );

    // Handle url not exists
    if (!link) {
      return res.status(500).json({
        errors: [{ msg: `Resource with url: ${url} not found.` }],
      });
    }

    res.status(200).json({
      data: { link },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later." }],
    });
  }
};

exports.getPopularLinks = async (req, res, next) => {
  try {
    const links = await Link.find().sort({ views: -1 }).limit(10);

    // Find 10 most viewed links
    res.status(200).json({
      data: { links },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later" }],
    });
  }
};

exports.getCategoryPopularLinks = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    // Handle category not exists
    if (!category) {
      return res.status(404).json({
        errors: [{ msg: "This category does not exist." }],
      });
    }

    // Find 3 most viewed links in this cateogry
    const links = await Link.find({ categories: category._id })
      .sort({
        views: -1,
      })
      .limit(3);

    res.status(200).json({
      data: { links },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{ msg: "Something went wrong, please try again later" }],
    });
  }
};
