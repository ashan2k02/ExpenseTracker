import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Modal, Alert } from '../../components/ui';
import { expenseService, categoryService } from '../../services';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineFilter,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineRefresh,
  HiOutlineX,
  HiOutlineExclamationCircle,
  HiOutlineDotsVertical,
  HiOutlineDownload,
} from 'react-icons/hi';

const ExpenseList = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    categoryId: '',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'date',
    sortOrder: 'DESC',
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, expense: null });
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Payment method labels
  const paymentMethodLabels = {
    cash: { label: 'Cash', icon: '💵', color: 'bg-green-100 text-green-700' },
    credit_card: { label: 'Credit Card', icon: '💳', color: 'bg-blue-100 text-blue-700' },
    debit_card: { label: 'Debit Card', icon: '💳', color: 'bg-purple-100 text-purple-700' },
    bank_transfer: { label: 'Bank Transfer', icon: '🏦', color: 'bg-indigo-100 text-indigo-700' },
    upi: { label: 'UPI', icon: '📱', color: 'bg-orange-100 text-orange-700' },
    wallet: { label: 'Wallet', icon: '👛', color: 'bg-pink-100 text-pink-700' },
    check: { label: 'Check', icon: '📝', color: 'bg-gray-100 text-gray-700' },
    other: { label: 'Other', icon: '📦', color: 'bg-slate-100 text-slate-700' },
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getAll(filters);
      setExpenses(response.data || []);
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to fetch expenses' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await expenseService.delete(deleteModal.expense.id);
      setAlert({ type: 'success', message: 'Expense deleted successfully' });
      setDeleteModal({ open: false, expense: null });
      fetchExpenses();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete expense' });
    } finally {
      setDeleting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : value }));
  };

  const handleSort = (field) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      page: 1,
      limit: 10,
      categoryId: '',
      startDate: '',
      endDate: '',
      search: '',
      sortBy: 'date',
      sortOrder: 'DESC',
    });
  };

  const hasActiveFilters = filters.categoryId || filters.startDate || filters.endDate || filters.search;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field) {
      return <HiOutlineChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return filters.sortOrder === 'ASC' ? (
      <HiOutlineChevronUp className="w-4 h-4 text-indigo-600" />
    ) : (
      <HiOutlineChevronDown className="w-4 h-4 text-indigo-600" />
    );
  };

  // Calculate totals
  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all your expenses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchExpenses}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/expenses/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 font-medium"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Expense</span>
          </Link>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title or notes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle More Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all ${
              showFilters || hasActiveFilters
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <HiOutlineFilter className="w-5 h-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-indigo-600 rounded-full" />
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-all"
            >
              <HiOutlineX className="w-5 h-5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineCalendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineCalendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="description">Title</option>
                <option value="createdAt">Created</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="DESC">Newest First</option>
                <option value="ASC">Oldest First</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.totalItems || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Page Total</p>
          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Current Page</p>
          <p className="text-2xl font-bold text-gray-900">
            {pagination.currentPage || 1} / {pagination.totalPages || 1}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Per Page</p>
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Expense Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-500">Loading expenses...</p>
            </div>
          </div>
        ) : expenses.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        <SortIcon field="date" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center gap-2">
                        Title
                        <SortIcon field="description" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th
                      className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Amount
                        <SortIcon field="amount" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {expenses.map((expense, index) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                            <HiOutlineCalendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatDate(expense.date)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(expense.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">
                            {expense.description}
                          </p>
                          {expense.notes && (
                            <p className="text-sm text-gray-500 truncate mt-0.5">
                              {expense.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                          style={{
                            backgroundColor: `${expense.category?.color || '#6366f1'}15`,
                            color: expense.category?.color || '#6366f1',
                          }}
                        >
                          <span>{expense.category?.icon || '📁'}</span>
                          {expense.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="px-6 py-4">
                        {expense.paymentMethod ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              paymentMethodLabels[expense.paymentMethod]?.color || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span>{paymentMethodLabels[expense.paymentMethod]?.icon || '📦'}</span>
                            {paymentMethodLabels[expense.paymentMethod]?.label || expense.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit expense"
                          >
                            <HiOutlinePencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, expense })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete expense"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Showing{' '}
                  <span className="font-medium">
                    {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalItems}</span> expenses
                </p>
                <div className="flex items-center gap-2">
                  {/* First Page */}
                  <button
                    onClick={() => handleFilterChange('page', 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                  {/* Previous */}
                  <button
                    onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiOutlineChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleFilterChange('page', pageNum)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                            pagination.currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-700 hover:bg-white border border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Current Page (Mobile) */}
                  <span className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>

                  {/* Next */}
                  <button
                    onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <HiOutlineChevronRight className="w-4 h-4" />
                  </button>
                  {/* Last Page */}
                  <button
                    onClick={() => handleFilterChange('page', pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <HiOutlineCurrencyDollar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No expenses match your current filters. Try adjusting your search criteria."
                : "Get started by adding your first expense to track your spending."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
                Clear Filters
              </button>
            ) : (
              <Link
                to="/expenses/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-indigo-500/30"
              >
                <HiOutlinePlus className="w-5 h-5" />
                Add Your First Expense
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, expense: null })}
        title="Delete Expense"
      >
        <div className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <HiOutlineExclamationCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Delete "{deleteModal.expense?.description}"?
          </h3>
          <p className="text-gray-500">
            This action cannot be undone. The expense record will be permanently removed from your account.
          </p>
          {deleteModal.expense && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(deleteModal.expense.amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Date:</span>
                <span className="text-gray-900">
                  {formatDate(deleteModal.expense.date)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button
            onClick={() => setDeleteModal({ open: false, expense: null })}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <HiOutlineTrash className="w-5 h-5" />
                <span>Delete Expense</span>
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ExpenseList;
