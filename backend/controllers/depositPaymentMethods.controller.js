const DepositPaymentMethod = require("../models/DepositPaymentMethod");
const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");
const path = require("path");
// Add a new payment method
exports.createDepositPaymentMethod = async (req, res) => {
  try {
    const { type, bonus, status, bonusStatus } = req.body;

    const newMethod = new DepositPaymentMethod({
      type,
      bonus,
      status,
      bonusStatus,
    });

    await newMethod.save();
    res.status(201).json(newMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all payment methods
exports.getAllDepositPaymentMethods = async (req, res) => {
  try {
    const methods = await DepositPaymentMethod.find();
    res.status(200).json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ ONE
exports.getDepositPaymentMethod = async (req, res) => {
  try {
    const method = await DepositPaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ error: "Not found" });
    res.json(method);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE a payment method
exports.updateDepositPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, bonus, status, bonusStatus } = req.body;
    let updateData = { type, bonus, status, bonusStatus };

    const updatedMethod = await DepositPaymentMethod.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE a payment method
exports.deleteDepositPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    await DepositPaymentMethod.findByIdAndDelete(id);
    res.status(200).json({ message: "Payment method deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDepositPaymentMethodOption = async (req, res) => {
  const { methodId, detailId } = req.params;

  try {
    const updatedMethod = await DepositPaymentMethod.findByIdAndUpdate(
      methodId,
      { $pull: { details: { _id: detailId } } }, // Remove matching detail
      { new: true } // Return updated document
    );

    if (!updatedMethod) {
      return res.status(404).json({ message: "Method not found" });
    }

    res.status(200).json({
      message: "Detail deleted successfully",
      updatedMethod,
    });
  } catch (err) {
    console.error("Error deleting detail:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add a detail to a payment method
exports.addDetailsToDepositPaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const { name, accountAddress, range, bonus, initialDepositAmount } =
      req.body;
    let imageUrl = "";

    // Upload image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // remove temporary file
    }

    const detail = {
      name,
      accountAddress,
      range,
      bonus,
      initialDepositAmount: JSON.parse(initialDepositAmount),
      image: imageUrl,
    };

    const updatedMethod = await DepositPaymentMethod.findByIdAndUpdate(
      methodId,
      { $push: { details: detail } },
      { new: true }
    );

    res.status(200).json(updatedMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a detail in a payment method
exports.updateDetailsInDepositPaymentMethod = async (req, res) => {
  try {
    const { methodId, detailId } = req.params;
    const { name, accountAddress, range, bonus, initialDepositAmount } =
      req.body;
    let updateData = {
      "details.$.name": name,
      "details.$.accountAddress": accountAddress,
      "details.$.range": range,
      "details.$.bonus": bonus,
      "details.$.initialDepositAmount": JSON.parse(initialDepositAmount),
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData["details.$.image"] = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updatedMethod = await DepositPaymentMethod.findOneAndUpdate(
      { _id: methodId, "details._id": detailId },
      { $set: updateData },
      { new: true }
    );

    res.status(200).json(updatedMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a detail from a payment method
exports.deleteDetailsFromPaymentMethod = async (req, res) => {
  try {
    const { methodId, detailId } = req.params;

    const updatedMethod = await DepositPaymentMethod.findByIdAndUpdate(
      methodId,
      { $pull: { details: { _id: detailId } } },
      { new: true }
    );

    res.status(200).json(updatedMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
