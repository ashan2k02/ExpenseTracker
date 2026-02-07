import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Input, Select, Alert, Spinner } from '../../components/ui';
import { expenseService, categoryService } from '../../services';
import {
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlinePencil,
  HiOutlineRefresh,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const initialFormState = {
    description: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Payment method options
  const paymentMethods = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'credit_card', label: '💳 Credit Card' },
    { value: 'debit_card', label: '💳 Debit Card' },
    { value: 'bank_transfer', label: '🏦 Bank Transfer' },
    { value: 'upi', label: '📱 UPI / Mobile Payment' },
    { value: 'wallet', label: '👛 Digital Wallet' },
    { value: 'check', label: '📝 Check' },
    { value: 'other', label: '📦 Other' },
  ];

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchExpense();
    } else {
      setFetchingData(false);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const fetchExpense = async () => {
    try {
      setFetchingData(true);
      const response = await expenseService.getById(id);
      const expense = response.data;
      setFormData({
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        categoryId: expense.categoryId?.toString() || '',
        date: expense.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        paymentMethod: expense.paymentMethod || '',
        notes: expense.notes || '',
      });
    } catch (err) {
      setError('Failed to load expense');
    } finally {
      setFetchingData(false);
    }
  };

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'description':
        if (!value.trim()) return 'Title is required';
        if (value.trim().length < 2) return 'Title must be at least 2 characters';
        if (value.trim().length > 100) return 'Title cannot exceed 100 characters';
        return '';
      case 'amount':
        if (!value) return 'Amount is required';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return 'Please enter a valid amount';
        if (numValue <= 0) return 'Amount must be greater than 0';
        if (numValue > 999999999) return 'Amount is too large';
        return '';
      case 'categoryId':
        if (!value) return 'Please select a category';
        return '';
      case 'date':
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (selectedDate > today) return 'Date cannot be in the future';
        return '';
      case 'paymentMethod':
        // Optional field
        return '';
      case 'notes':
        if (value.length > 500) return 'Notes cannot exceed 500 characters';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleReset = () => {
    if (isEdit) {
      fetchExpense();
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
    setTouched({});
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        date: formData.date,
        paymentMethod: formData.paymentMethod || null,
        notes: formData.notes.trim() || null,
      };

      if (isEdit) {
        await expenseService.update(id, data);
        setSuccess('Expense updated successfully!');
        setTimeout(() => navigate('/expenses'), 1500);
      } else {
        await expenseService.create(data);
        setSuccess('Expense added successfully!');
        // Reset form after successful add
        setFormData(initialFormState);
        setTouched({});
        // Navigate to expenses list after a short delay
        setTimeout(() => navigate('/expenses'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id.toString(),
    label: `${cat.icon || '📁'} ${cat.name}`,
  }));

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            {isEdit ? (
              <HiOutlinePencil className="w-6 h-6 text-white" />
            ) : (
              <HiOutlinePlus className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Expense' : 'Add New Expense'}
            </h1>
            <p className="text-gray-500">
              {isEdit ? 'Update your expense details below' : 'Record a new expense transaction'}
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fadeIn">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <HiOutlineCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-green-800 font-medium">{success}</p>
            <p className="text-green-600 text-sm">Redirecting to expenses list...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Form Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Expense Details</h2>
          <p className="text-indigo-100 text-sm">Fill in the information below</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineDocumentText className={`w-5 h-5 ${errors.description && touched.description ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Grocery shopping, Coffee, Rent payment"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.description && touched.description
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400'
                }`}
              />
            </div>
            {errors.description && touched.description && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <HiOutlineExclamationCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Amount and Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineCurrencyDollar className={`w-5 h-5 ${errors.amount && touched.amount ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.amount && touched.amount
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.amount && touched.amount && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <HiOutlineExclamationCircle className="w-4 h-4" />
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineCalendar className={`w-5 h-5 ${errors.date && touched.date ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.date && touched.date
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.date && touched.date && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <HiOutlineExclamationCircle className="w-4 h-4" />
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Category and Payment Method Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineTag className={`w-5 h-5 ${errors.categoryId && touched.categoryId ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white appearance-none cursor-pointer ${
                    errors.categoryId && touched.categoryId
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.categoryId && touched.categoryId && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <HiOutlineExclamationCircle className="w-4 h-4" />
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* Payment Method Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payment Method
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineCreditCard className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-all duration-200 bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={4}
                placeholder="Add any additional notes or details about this expense..."
                maxLength={500}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                  errors.notes && touched.notes
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400'
                }`}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {formData.notes.length}/500
              </div>
            </div>
            {errors.notes && touched.notes && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <HiOutlineExclamationCircle className="w-4 h-4" />
                {errors.notes}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/expenses')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <HiOutlineX className="w-5 h-5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <HiOutlineRefresh className="w-5 h-5" />
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 sm:flex-[2] px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <HiOutlineCheck className="w-5 h-5" />
                  <span>{isEdit ? 'Update Expense' : 'Add Expense'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quick Tips
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use clear titles to easily identify expenses later</li>
          <li>• Categorize expenses to track spending patterns</li>
          <li>• Add notes for receipts or important details</li>
        </ul>
      </div>
    </div>
  );
};

export default ExpenseForm;
