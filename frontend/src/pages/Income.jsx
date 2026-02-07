import { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaWallet, 
  FaMoneyBillWave, 
  FaBriefcase, 
  FaChartLine,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
  FaSync,
  FaGift,
  FaHome,
  FaBuilding,
  FaEllipsisH
} from 'react-icons/fa';
import { incomeService } from '../services';

// Income source icons mapping
const sourceIcons = {
  salary: FaBriefcase,
  freelance: FaMoneyBillWave,
  investment: FaChartLine,
  rental: FaHome,
  business: FaBuilding,
  gift: FaGift,
  refund: FaSync,
  other: FaEllipsisH,
};

// Income source colors
const sourceColors = {
  salary: '#10B981',      // Green
  freelance: '#3B82F6',   // Blue
  investment: '#8B5CF6',  // Purple
  rental: '#F59E0B',      // Amber
  business: '#EF4444',    // Red
  gift: '#EC4899',        // Pink
  refund: '#06B6D4',      // Cyan
  other: '#6B7280',       // Gray
};

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    source: 'salary',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_frequency: '',
    notes: '',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch incomes
  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await incomeService.getAll({ page, limit: 10 });
      setIncomes(response.data?.incomes || []);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await incomeService.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  useEffect(() => {
    fetchIncomes();
    fetchSummary();
  }, [fetchIncomes]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Open modal for new income
  const handleAddNew = () => {
    setEditingIncome(null);
    setFormData({
      title: '',
      amount: '',
      source: 'salary',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurring_frequency: '',
      notes: '',
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      title: income.title,
      amount: income.amount,
      source: income.source,
      date: income.date,
      is_recurring: income.is_recurring,
      recurring_frequency: income.recurring_frequency || '',
      notes: income.notes || '',
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIncome) {
        await incomeService.update(editingIncome.id, formData);
      } else {
        await incomeService.create(formData);
      }
      setShowModal(false);
      fetchIncomes();
      fetchSummary();
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Failed to save income. Please try again.');
    }
  };

  // Delete income
  const handleDelete = async (id) => {
    try {
      await incomeService.delete(id);
      setDeleteConfirm(null);
      fetchIncomes();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Failed to delete income. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <FaWallet className="text-white" />
            </div>
            Income Management
          </h1>
          <p className="text-gray-400 mt-2">Track and manage your income sources</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
        >
          <FaPlus />
          Add Income
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Income This Month */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">This Month</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(summary?.totalIncome || 0)}
              </p>
              <p className="text-green-100 text-sm mt-2">
                {summary?.incomeCount || 0} transactions
              </p>
            </div>
            <div className="p-4 bg-white/20 rounded-xl">
              <FaMoneyBillWave className="text-3xl" />
            </div>
          </div>
        </div>

        {/* Yearly Total */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">This Year</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(summary?.yearlyTotal || 0)}
              </p>
              <p className="text-blue-100 text-sm mt-2">Total earned</p>
            </div>
            <div className="p-4 bg-white/20 rounded-xl">
              <FaChartLine className="text-3xl" />
            </div>
          </div>
        </div>

        {/* Primary Source */}
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Primary Source</p>
              <p className="text-2xl font-bold mt-1 capitalize">
                {summary?.sourceBreakdown?.[0]?.source || 'N/A'}
              </p>
              <p className="text-purple-100 text-sm mt-2">
                {formatCurrency(summary?.sourceBreakdown?.[0]?.total || 0)}
              </p>
            </div>
            <div className="p-4 bg-white/20 rounded-xl">
              <FaBriefcase className="text-3xl" />
            </div>
          </div>
        </div>

        {/* Income Sources */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Income Sources</p>
              <p className="text-3xl font-bold mt-1">
                {summary?.sourceBreakdown?.length || 0}
              </p>
              <p className="text-amber-100 text-sm mt-2">Active sources</p>
            </div>
            <div className="p-4 bg-white/20 rounded-xl">
              <FaWallet className="text-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Recent Income</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : incomes.length === 0 ? (
          <div className="text-center py-20">
            <FaWallet className="mx-auto text-6xl text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No income records found</p>
            <p className="text-gray-500 mt-2">Click "Add Income" to add your first income</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Recurring
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {incomes.map((income) => {
                  const SourceIcon = sourceIcons[income.source] || FaEllipsisH;
                  const sourceColor = sourceColors[income.source] || '#6B7280';
                  
                  return (
                    <tr key={income.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${sourceColor}20` }}
                          >
                            <SourceIcon style={{ color: sourceColor }} />
                          </div>
                          <span className="text-gray-300 capitalize">{income.source}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{income.title}</span>
                        {income.notes && (
                          <p className="text-gray-500 text-sm truncate max-w-xs">{income.notes}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-400 font-semibold text-lg">
                          +{formatCurrency(income.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {formatDate(income.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {income.is_recurring ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                            <FaSync className="text-xs" />
                            {income.recurring_frequency}
                          </span>
                        ) : (
                          <span className="text-gray-500">One-time</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEdit(income)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors mr-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(income.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-6 border-t border-gray-700">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  page === p
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">
                {editingIncome ? 'Edit Income' : 'Add New Income'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Monthly Salary"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Source & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Source
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="salary">💼 Salary</option>
                    <option value="freelance">💵 Freelance</option>
                    <option value="investment">📈 Investment</option>
                    <option value="rental">🏠 Rental</option>
                    <option value="business">🏢 Business</option>
                    <option value="gift">🎁 Gift</option>
                    <option value="refund">🔄 Refund</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_recurring"
                    checked={formData.is_recurring}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-gray-300">Recurring Income</span>
                </label>

                {formData.is_recurring && (
                  <select
                    name="recurring_frequency"
                    value={formData.recurring_frequency}
                    onChange={handleChange}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select frequency</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional notes..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  <FaCheck />
                  {editingIncome ? 'Update' : 'Add Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-2xl text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Delete Income?</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this income record? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
