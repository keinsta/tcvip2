const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema({
  companyRevue: { type: String },
});

module.exports = mongoose.model("Revenue", revenueSchema);
