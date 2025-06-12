const mongoose = require("mongoose");

const UserChildrenSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One document per parent
    },

    parentUID: {
      type: String,
      require: true,
    },
    children: [
      {
        childId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        childUID: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserChild", UserChildrenSchema);
