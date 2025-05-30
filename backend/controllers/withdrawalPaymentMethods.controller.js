const WithdrawalPaymentMethod = require("../models/WithdrawalPaymentMethod");

exports.getAllWithdrawalPaymentMethods = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const methods = await WithdrawalPaymentMethod.find(filter).sort({
      createdAt: -1,
    });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.createWithdrawalPaymentMethod = async (req, res) => {
  try {
    const { type, value, status } = req.body;

    if (!type || !value) {
      return res.status(400).json({ message: "Type and value are required" });
    }

    const exists = await WithdrawalPaymentMethod.findOne({ value });
    if (exists) {
      return res.status(400).json({ message: "Method already exists" });
    }

    const newMethod = new WithdrawalPaymentMethod({ type, value, status });
    await newMethod.save();

    res.status(201).json(newMethod);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.updateWithdrawalPaymentMethod = async (req, res) => {
  try {
    const { type, value, status } = req.body;

    const method = await WithdrawalPaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ message: "Method not found" });

    // Prevent duplicate values for different entries
    const exists = await WithdrawalPaymentMethod.findOne({
      value,
      _id: { $ne: method._id },
    });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Another method with this value already exists" });
    }

    method.type = type || method.type;
    method.value = value || method.value;
    if (typeof status === "boolean") method.status = status;

    await method.save();
    res.json(method);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleWithdrawalPaymentMethodStatus = async (req, res) => {
  try {
    const method = await WithdrawalPaymentMethod.findById(req.params.id);
    if (!method) {
      return res.status(404).json({ message: "Method not found" });
    }

    method.status = !method.status;
    await method.save();

    res.json(method);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /admin/withdrawal-payment-methods/:id
exports.deleteWithdrawalPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const method = await WithdrawalPaymentMethod.findByIdAndDelete(id);
    if (!method) {
      return res.status(404).json({ message: "Method not found" });
    }

    res.json({ message: "Withdrawal payment method deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
