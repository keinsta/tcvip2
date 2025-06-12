import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axiosInstance";

import { Switch } from "@headlessui/react";
import { PlusCircle } from "lucide-react";

export default function AdminWithdrawalMethods() {
  const [type, setType] = useState("Bank");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState(true);
  const [methods, setMethods] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await axiosInstance.get(
        "/admin/withdrawal-payment-methods/get-all-methods-by-type"
      );
      setMethods(res.data);
    } catch (err) {
      toast.error("Failed to fetch methods");
    }
  };

  const handleAddOrUpdate = async () => {
    if (!value.trim()) {
      return toast.error("Please enter a value");
    }

    const payload = { type, value, status };

    try {
      if (editingId) {
        // console.log(payload, editingId);
        await axiosInstance.put(
          `/admin/withdrawal-payment-methods/update-method/${editingId}`,
          payload
        );
        toast.success("Method updated");
        setEditingId(null);
      } else {
        await axiosInstance.post(
          "/admin/withdrawal-payment-methods/add-new-method",
          payload
        );
        toast.success("Method added");
      }
      setValue("");
      setStatus(true);
      fetchMethods();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save method");
    }
  };

  const handleEdit = (method) => {
    setType(method.type);
    setValue(method.value);
    setStatus(method.status);
    setEditingId(method._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this method?")) return;
    try {
      await axiosInstance.delete(
        `/admin/withdrawal-payment-methods/delete-method/${id}`
      );
      toast.success("Method deleted");
      fetchMethods();
    } catch (err) {
      toast.error("Failed to delete method");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axiosInstance.patch(
        `/admin/withdrawal-payment-methods/toggle-method-status/${id}`
      );
      toast.success("Status toggled");
      fetchMethods();
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const renderTable = (label, filtered) => (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">{label} Methods</h3>
      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full text-sm border">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="border px-3 py-2 w-[50%]">Value</th>
              <th className="border px-3 py-2 w-[15%]">Status</th>
              <th className="border px-3 py-2 w-[35%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m._id}>
                <td className="border px-3 py-2">{m.value}</td>
                <td className="border px-3 py-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      m.status
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {m.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="border px-3 py-2">
                  <div className="flex justify-evenly flex-wrap gap-1">
                    <button
                      onClick={() => handleToggleStatus(m._id)}
                      className="text-blue-500 text-sm hover:underline"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleEdit(m)}
                      className="text-yellow-500 text-sm hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Only try to group/filter if it's really an array
  const grouped = Array.isArray(methods)
    ? {
        Bank: methods.filter((m) => m.type === "Bank"),
        Wallet: methods.filter((m) => m.type === "Wallet"),
        USDT: methods.filter((m) => m.type === "USDT"),
      }
    : { Bank: [], Wallet: [], USDT: [] };

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold mb-4">Manage Withdrawal Methods</h2>

      {/* Form */}
      <div className="space-y-4 border p-4 rounded-lg shadow-sm mb-6">
        <div className="flex gap-4 items-center">
          <label className="font-semibold">Type:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border px-3 py-2 rounded bg-gray-800"
          >
            <option value="Bank">Bank</option>
            <option value="Wallet">Wallet</option>
            <option value="USDT">USDT</option>
          </select>
        </div>

        <div className="flex gap-4 items-center">
          <label className="font-semibold">Value:</label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`e.g. ${
              type === "Bank"
                ? "YES BANK"
                : type === "Wallet"
                ? "PAYTM"
                : "TRC20"
            }`}
            className="border px-3 py-2 rounded w-full bg-transparent"
          />
        </div>

        <div className="flex gap-4 items-center">
          <label className="font-semibold">Status:</label>
          <Switch
            checked={status}
            onChange={setStatus}
            className={`${
              status ? "bg-green-500" : "bg-gray-300"
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span
              className={`${
                status ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform bg-white rounded-full transition`}
            />
          </Switch>
        </div>

        <button
          onClick={handleAddOrUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusCircle className="w-4 h-4" />
          {editingId ? "Update Method" : "Add Method"}
        </button>
      </div>

      {/* Tables */}
      {renderTable("Bank", grouped.Bank)}
      {renderTable("Wallet", grouped.Wallet)}
      {renderTable("USDT", grouped.USDT)}
    </div>
  );
}
