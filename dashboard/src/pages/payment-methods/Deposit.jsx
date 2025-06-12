import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import { Landmark, Coins, Wallet } from "lucide-react";
import toast from "react-hot-toast";
export default function DepositMethodManager() {
  const [methods, setMethods] = useState([]);
  const [form, setForm] = useState({
    bonus: 0,
    type: "Wallet",
    status: "active",
    bonusStatus: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [editingDetail, setEditingDetail] = useState(null); // detail being edited
  const [detailsForm, setDetailsForm] = useState({
    name: "",
    accountAddress: "",
    range: "",
    bonus: false,
    initialDepositAmount: "",
  });
  const [selectedMethodId, setSelectedMethodId] = useState(null);

  const fetchMethods = async () => {
    try {
      const res = await axiosInstance.get(
        "/admin/deposit-payment-methods/get-all-methods"
      );
      setMethods(Array.isArray(res.data) ? res.data : []);
      // console.log("Fetched methods:", res.data);
    } catch (error) {
      toast.error("Error Fetching Deposit Methods");
    }
  };
  const confirmDelete = async (methodId, detailId) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/deposit-payment-methods/delete-method-option/${methodId}/details/${detailId}`
      );
      fetchMethods();
      toast.success(response.data.message);
      // refresh list or show success
    } catch (error) {
      toast.error("Error deleting detail");
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleCreateOrUpdateMethod = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (editingId) {
      await axiosInstance.put(
        `/admin/deposit-payment-methods/update-method/${editingId}`,
        formData
      );
    } else {
      await axiosInstance.post(
        "/admin/deposit-payment-methods/add-method",
        formData
      );
    }

    setForm({
      bonus: 0,
      type: "Wallet",
      status: "active",
      bonusStatus: false,
    });
    setEditingId(null);
    fetchMethods();
  };

  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    const amounts = detailsForm.initialDepositAmount
      .split(",")
      .map((s) => s.trim());

    const formData = new FormData();
    formData.append("name", detailsForm.name);
    formData.append("accountAddress", detailsForm.accountAddress);
    formData.append("range", detailsForm.range);
    formData.append("bonus", detailsForm.bonus);
    formData.append("initialDepositAmount", JSON.stringify(amounts));

    if (detailsForm.image) {
      formData.append("image", detailsForm.image);
    }

    if (editingDetail?._id) {
      // Edit existing detail
      await axiosInstance.put(
        `/admin/deposit-payment-methods/update-details-of-method/${selectedMethodId}/${editingDetail._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } else {
      // Add new detail
      await axiosInstance.post(
        `/admin/deposit-payment-methods/add-details-to-deposit-payment-method/${selectedMethodId}/details`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    }

    // Reset form
    setDetailsForm({
      name: "",
      accountAddress: "",
      range: "",
      bonus: false,
      initialDepositAmount: "",
    });
    setSelectedMethodId(null);
    setEditingDetail(null);
    fetchMethods();
  };

  const handleEdit = (method) => {
    setEditingId(method._id);
    setForm({
      bonus: method.bonus,
      type: method.type,
      status: method.status,
      bonusStatus: method.bonusStatus,
    });
  };

  return (
    <div className="space-y-10">
      {/* Deposit Method Form */}
      <form
        onSubmit={handleCreateOrUpdateMethod}
        className="rounded shadow space-y-4 max-w-2xl"
      >
        <h2 className="text-xl font-bold">
          {editingId ? "Update" : "Add"} Deposit Method
        </h2>

        <div>
          <label
            htmlFor="method-type"
            className="block text-sm font-medium mb-1"
          >
            Type
          </label>
          <select
            id="method-type"
            className="w-full p-2 border rounded-md bg-gray-800"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="Wallet">Wallet</option>
            <option value="Bank">Bank</option>
            <option value="USDT">USDT</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="method-status"
            className="block text-sm font-medium mb-1"
          >
            Status
          </label>
          <select
            id="method-status"
            className="w-full p-2 border rounded-md bg-gray-800"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="method-bonus"
            className="block text-sm font-medium mb-1"
          >
            Bonus %
          </label>
          <input
            id="method-bonus"
            className="w-full p-2 border rounded-md bg-transparent"
            placeholder="Bonus %"
            type="number"
            value={form.bonus}
            onChange={(e) => setForm({ ...form, bonus: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="bonus-status"
            type="checkbox"
            checked={form.bonusStatus}
            onChange={(e) =>
              setForm({ ...form, bonusStatus: e.target.checked })
            }
          />
          <label htmlFor="bonus-status" className="text-sm">
            Bonus Active
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update" : "Create"}
        </button>
      </form>

      {/* Add Detail Form */}
      {selectedMethodId && (
        <form
          onSubmit={handleDetailSubmit}
          className="rounded shadow max-w-2xl space-y-4"
        >
          <h3 className="text-lg font-bold">
            {editingDetail ? "Edit Detail" : "Add Detail"}
          </h3>

          <div>
            <label
              htmlFor="detail-name"
              className="block text-sm font-medium mb-1"
            >
              Name
            </label>
            <input
              id="detail-name"
              className="w-full p-2 border rounded-md bg-transparent"
              placeholder="Name"
              value={detailsForm.name}
              onChange={(e) =>
                setDetailsForm({ ...detailsForm, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label
              htmlFor="detail-accountAddress"
              className="block text-sm font-medium mb-1"
            >
              Account Number / Wallet Address
            </label>
            <input
              id="detail-accountAddress"
              className="w-full p-2 border rounded-md bg-transparent"
              placeholder="Acc Address"
              value={detailsForm.accountAddress}
              onChange={(e) =>
                setDetailsForm({
                  ...detailsForm,
                  accountAddress: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <label
              htmlFor="detail-image"
              className="block text-sm font-medium mb-1"
            >
              {editingDetail ? "Update Image (optional)" : "Upload Image"}
            </label>
            <input
              id="detail-image"
              type="file"
              onChange={(e) =>
                setDetailsForm({ ...detailsForm, image: e.target.files[0] })
              }
              //   required
            />
          </div>

          <div>
            <label
              htmlFor="detail-range"
              className="block text-sm font-medium mb-1"
            >
              Range (e.g., 100-50000)
            </label>
            <input
              id="detail-range"
              className="w-full p-2 border rounded-md bg-transparent"
              placeholder="Range (e.g., 100-50000)"
              value={detailsForm.range}
              onChange={(e) =>
                setDetailsForm({ ...detailsForm, range: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label
              htmlFor="initial-deposit-amounts"
              className="block text-sm font-medium mb-1"
            >
              Initial Deposit Amounts (comma-separated)
            </label>
            <input
              id="initial-deposit-amounts"
              className="w-full p-2 border rounded-md bg-transparent"
              placeholder="Initial Deposit Amounts (comma-separated)"
              value={detailsForm.initialDepositAmount}
              onChange={(e) =>
                setDetailsForm({
                  ...detailsForm,
                  initialDepositAmount: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="detail-bonus"
              type="checkbox"
              checked={detailsForm.bonus}
              onChange={(e) =>
                setDetailsForm({ ...detailsForm, bonus: e.target.checked })
              }
            />
            <label htmlFor="detail-bonus" className="text-sm">
              Bonus
            </label>
          </div>

          <div className="flex space-x-2 mt-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {editingDetail ? "Update" : "Add"} Detail
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMethodId(null);
                setEditingDetail(null);
                setDetailsForm({
                  name: "",
                  range: "",
                  bonus: false,
                  initialDepositAmount: "",
                });
              }}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Deposit Methods List */}
      <div className="space-y-6">
        {methods.map((method) => (
          <div key={method._id} className="bg-gray-700 p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {method.type === "Wallet" && (
                  <Wallet className="text-yellow-500 inline w-6 h-6 mr-1" />
                )}
                {method.type === "Bank" && (
                  <Landmark className="text-yellow-500 inline w-6 h-6 mr-1" />
                )}
                {method.type === "USDT" && (
                  <Coins className="text-yellow-500 inline w-6 h-6 mr-1" />
                )}
                {method.type}
              </h3>
              <button
                onClick={() => handleEdit(method)}
                className="text-sm font-bold text-gray-200"
              >
                Edit
              </button>
            </div>
            <p className="text-sm">
              Bonus: {method.bonus}% | Status: {method.status} | Bonus Active:{" "}
              {method.bonusStatus ? "Yes" : "No"}
            </p>
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold">Details</h4>
              <table className="w-full text-sm text-left border border-gray-600 mt-2">
                <thead className="bg-gray-800 text-gray-200">
                  <tr>
                    <th className="px-2 py-1 border border-gray-600">Name</th>
                    <th className="px-2 py-1 border border-gray-600">Range</th>
                    <th className="px-2 py-1 border border-gray-600">Bonus</th>
                    <th className="px-2 py-1 border border-gray-600">
                      Amounts
                    </th>
                    <th className="px-2 py-1 border border-gray-600">
                      Acc Address
                    </th>
                    <th className="px-2 py-1 border border-gray-600">Acc QR</th>
                    <th className="px-2 py-1 border border-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {method.details?.map((d, i) => (
                    <tr key={i} className="bg-gray-700 text-white">
                      <td className="px-2 py-1 border border-gray-600">
                        {d.name}
                      </td>
                      <td className="px-2 py-1 border border-gray-600">
                        {d.range}
                      </td>
                      <td className="px-2 py-1 border border-gray-600">
                        {d.bonus ? "Yes" : "No"}
                      </td>
                      <td className="px-2 py-1 border border-gray-600">
                        {d.initialDepositAmount.join(", ")}
                      </td>
                      <td className="px-2 py-1 border border-gray-600">
                        {d.accountAddress}
                      </td>
                      <td className="px-2 py-1 border border-gray-600">
                        {/* {d.image ? ( */}
                        {d.image && (
                          <img
                            src={d.image}
                            alt={d.name}
                            className="w-12 h-12"
                          />
                        )}
                        {/* <img
                          src={`${d.image}?v=${new Date().getTime()}`}
                          alt={d.name}
                          className="w-12 h-12"
                        /> */}

                        {/* ) : (
                          "No Image"
                        )} */}
                      </td>

                      <td className="px-2 py-1 border border-gray-600">
                        <button
                          className="text-blue-400 text-xs mr-4"
                          onClick={() => {
                            setSelectedMethodId(method._id);
                            setEditingDetail(d); // set detail for editing
                            setDetailsForm({
                              name: d.name,
                              accountAddress: d.accountAddress,
                              range: d.range,
                              bonus: d.bonus,
                              initialDepositAmount:
                                d.initialDepositAmount.join(", "),
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 text-xs"
                          onClick={() => {
                            confirmDelete(method._id, d._id);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={() => setSelectedMethodId(method._id)}
                className="mt-2 text-sm text-green-600"
              >
                + Add Detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
