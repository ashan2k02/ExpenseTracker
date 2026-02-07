import { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Alert, Spinner, Select } from '../components/ui';
import { budgetService, categoryService, reportService } from '../services';
import {
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineChartPie,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineRefresh,
  HiOutlineCollection,
  HiOutlineShieldCheck,
  HiOutlineExclamation,
  HiOutlineLightningBolt,
} from 'react-icons/hi';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [modal, setModal] = useState({ open: false, budget: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, budget: null });
  const [formData, setFormData] = useState({
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    categoryId: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [monthlyData, setMonthlyData] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
    fetchMonthlyData();
  }, [selectedPeriod]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetService.getAll({
        month: selectedPeriod.month,
        year: selectedPeriod.year,
      });
      setBudgets(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load budgets' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await reportService.getMonthly(selectedPeriod.year, selectedPeriod.month);
      setMonthlyData(response.data);
    } catch (err) {
      console.error('Failed to fetch monthly data:', err);
    }
  };

  const openModal = (budget = null) => {
    if (budget) {
      setFormData({
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
        categoryId: budget.categoryId || '',
      });
    } else {
      setFormData({
        amount: '',
        month: selectedPeriod.month,
        year: selectedPeriod.year,
        categoryId: '',
      });
    }
    setModal({ open: true, budget });
  };

  const handleSave = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setAlert({ type: 'error', message: 'Please enter a valid budget amount' });
      return;
    }

    setSaving(true);
    try {
      await budgetService.upsert({
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      });
      setAlert({ type: 'success', message: 'Budget saved successfully' });
      setModal({ open: false, budget: null });
      fetchBudgets();
      fetchMonthlyData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to save budget' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (budgetId) => {
    setDeleting(true);
    try {
      await budgetService.delete(budgetId);
      setAlert({ type: 'success', message: 'Budget deleted successfully' });
      setDeleteModal({ open: false, budget: null });
      fetchBudgets();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete budget' });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (budget) => {
    setDeleteModal({ open: true, budget });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatCurrencyDetailed = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const getShortMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const getProgressColor = (percentage) => {
    if (percentage > 100) return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' };
    if (percentage > 80) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-100' };
    if (percentage > 60) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100' };
  };

  const getStatusIcon = (percentage) => {
    if (percentage > 100) return <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />;
    if (percentage > 80) return <HiOutlineExclamation className="w-5 h-5 text-amber-500" />;
    return <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />;
  };

  const getStatusMessage = (percentage, remaining) => {
    if (percentage > 100) return { type: 'danger', message: `Budget exceeded by ${formatCurrency(Math.abs(remaining))}!` };
    if (percentage > 80) return { type: 'warning', message: `Only ${formatCurrency(remaining)} left - ${(100 - percentage).toFixed(0)}% remaining` };
    return { type: 'success', message: `${formatCurrency(remaining)} available to spend` };
  };

  const overallBudget = budgets.find(b => !b.categoryId);
  const categoryBudgets = budgets.filter(b => b.categoryId);

  // Calculate stats
  const totalSpent = monthlyData?.total || 0;
  const budgetAmount = overallBudget ? parseFloat(overallBudget.amount) : 0;
  const remaining = budgetAmount - totalSpent;
  const budgetPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
  const totalCategoryBudgets = categoryBudgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);

  // Count exceeded budgets
  const exceededBudgets = categoryBudgets.filter(budget => {
    const categorySpent = monthlyData?.byCategory?.find(c => c.category?.id === budget.categoryId);
    const spent = parseFloat(categorySpent?.dataValues?.total || categorySpent?.total || 0);
    return spent > parseFloat(budget.amount);
  });

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`,
  }));

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: new Date().getFullYear() - 2 + i,
    label: (new Date().getFullYear() - 2 + i).toString(),
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <HiOutlineCurrencyDollar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Manager</h1>
            <p className="text-gray-500">Set and track your spending limits</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchBudgets(); fetchMonthlyData(); }}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 font-medium"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span className="hidden sm:inline">Set Budget</span>
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Budget Period:</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod.month}
              onChange={(e) => setSelectedPeriod({ ...selectedPeriod, month: parseInt(e.target.value) })}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={selectedPeriod.year}
              onChange={(e) => setSelectedPeriod({ ...selectedPeriod, year: parseInt(e.target.value) })}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {yearOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Alert */}
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Budget Exceeded Warning */}
      {exceededBudgets.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
            <HiOutlineExclamationCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="text-red-800 font-semibold">Budget Alert!</h4>
            <p className="text-red-600 text-sm mt-0.5">
              {exceededBudgets.length} {exceededBudgets.length === 1 ? 'category has' : 'categories have'} exceeded the budget limit.
              {budgetPercentage > 100 && ' Overall budget has also been exceeded!'}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-500">Loading budgets...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Budget */}
            <Card className="p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Total Budget</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(budgetAmount)}</p>
                  <p className="text-indigo-200 text-sm mt-1">
                    {getShortMonthName(selectedPeriod.month)} {selectedPeriod.year}
                  </p>
                </div>
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <HiOutlineCurrencyDollar className="w-5 h-5" />
                </div>
              </div>
            </Card>

            {/* Total Spent */}
            <Card className="p-5 bg-gradient-to-br from-rose-500 to-rose-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-rose-100 text-sm font-medium">Total Spent</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
                  <p className="text-rose-200 text-sm mt-1 flex items-center gap-1">
                    <HiOutlineTrendingUp className="w-4 h-4" />
                    {budgetPercentage.toFixed(0)}% of budget
                  </p>
                </div>
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <HiOutlineChartPie className="w-5 h-5" />
                </div>
              </div>
            </Card>

            {/* Remaining */}
            <Card className={`p-5 bg-gradient-to-br ${remaining >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} text-white`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`${remaining >= 0 ? 'text-emerald-100' : 'text-red-100'} text-sm font-medium`}>
                    {remaining >= 0 ? 'Remaining' : 'Over Budget'}
                  </p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(Math.abs(remaining))}</p>
                  <p className={`${remaining >= 0 ? 'text-emerald-200' : 'text-red-200'} text-sm mt-1 flex items-center gap-1`}>
                    {remaining >= 0 ? (
                      <>
                        <HiOutlineShieldCheck className="w-4 h-4" />
                        Safe to spend
                      </>
                    ) : (
                      <>
                        <HiOutlineExclamation className="w-4 h-4" />
                        Reduce spending
                      </>
                    )}
                  </p>
                </div>
                <div className="p-2.5 bg-white/20 rounded-xl">
                  {remaining >= 0 ? (
                    <HiOutlineTrendingDown className="w-5 h-5" />
                  ) : (
                    <HiOutlineExclamationCircle className="w-5 h-5" />
                  )}
                </div>
              </div>
            </Card>

            {/* Category Budgets Count */}
            <Card className="p-5 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Category Budgets</p>
                  <p className="text-2xl font-bold mt-1">{categoryBudgets.length}</p>
                  <p className="text-amber-200 text-sm mt-1">
                    {formatCurrency(totalCategoryBudgets)} allocated
                  </p>
                </div>
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <HiOutlineCollection className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Overall Budget Card */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <HiOutlineLightningBolt className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Overall Budget
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getMonthName(selectedPeriod.month)} {selectedPeriod.year}
                  </p>
                </div>
              </div>
              {overallBudget && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(overallBudget)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Budget"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(overallBudget)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Budget"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6">
              {overallBudget ? (
                <div className="space-y-6">
                  {/* Status Alert */}
                  {(() => {
                    const status = getStatusMessage(budgetPercentage, remaining);
                    const colorClasses = {
                      danger: 'bg-red-50 border-red-200 text-red-800',
                      warning: 'bg-amber-50 border-amber-200 text-amber-800',
                      success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                    };
                    return (
                      <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${colorClasses[status.type]}`}>
                        {getStatusIcon(budgetPercentage)}
                        <span className="font-medium">{status.message}</span>
                      </div>
                    );
                  })()}

                  {/* Budget Progress */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Amount Spent</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {formatCurrencyDetailed(totalSpent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Budget Limit</p>
                        <p className="text-2xl font-semibold text-gray-600">
                          {formatCurrencyDetailed(budgetAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ease-out ${getProgressColor(budgetPercentage).bg}`}
                          style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                        />
                      </div>
                      {/* Percentage Badge */}
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-bold text-white ${getProgressColor(budgetPercentage).bg}`}
                        style={{ left: `${Math.min(Math.max(budgetPercentage - 5, 2), 92)}%` }}
                      >
                        {budgetPercentage.toFixed(0)}%
                      </div>
                    </div>

                    {/* Progress Markers */}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{budgetPercentage.toFixed(1)}%</p>
                      <p className="text-sm text-gray-500">Used</p>
                    </div>
                    <div className="text-center border-x border-gray-100">
                      <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {(100 - budgetPercentage).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">Remaining</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{monthlyData?.expenseCount || 0}</p>
                      <p className="text-sm text-gray-500">Transactions</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineCurrencyDollar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Overall Budget Set</h4>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Set a monthly budget to track your spending and receive alerts when you're approaching your limit.
                  </p>
                  <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <HiOutlinePlus className="w-5 h-5" />
                    Set Monthly Budget
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Category Budgets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <HiOutlineChartPie className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Category Budgets</h3>
                  <p className="text-sm text-gray-500">Individual spending limits by category</p>
                </div>
              </div>
              <button
                onClick={() => openModal()}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {categoryBudgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {categoryBudgets.map((budget) => {
                  const categorySpent = monthlyData?.byCategory?.find(
                    c => c.category?.id === budget.categoryId
                  );
                  const spent = parseFloat(categorySpent?.dataValues?.total || categorySpent?.total || 0);
                  const budgetAmt = parseFloat(budget.amount);
                  const percentage = (spent / budgetAmt) * 100;
                  const categoryRemaining = budgetAmt - spent;
                  const colors = getProgressColor(percentage);
                  const isExceeded = percentage > 100;

                  return (
                    <Card key={budget.id} className={`p-5 ${isExceeded ? 'ring-2 ring-red-200 bg-red-50/30' : ''}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                            style={{ backgroundColor: `${budget.category?.color}20` }}
                          >
                            {budget.category?.icon || '📁'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{budget.category?.name}</h4>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(spent)} of {formatCurrency(budgetAmt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openModal(budget)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(budget)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${colors.bg}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${colors.text}`}>
                            {percentage.toFixed(0)}% used
                          </span>
                          <span className={`text-sm ${categoryRemaining >= 0 ? 'text-gray-500' : 'text-red-600 font-medium'}`}>
                            {categoryRemaining >= 0 ? (
                              `${formatCurrency(categoryRemaining)} left`
                            ) : (
                              `${formatCurrency(Math.abs(categoryRemaining))} over`
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Exceeded Warning */}
                      {isExceeded && (
                        <div className="mt-3 px-3 py-2 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
                          <HiOutlineExclamationCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span className="text-xs text-red-700 font-medium">
                            Budget exceeded by {formatCurrency(Math.abs(categoryRemaining))}
                          </span>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCollection className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Category Budgets</h4>
                <p className="text-gray-500 mb-6">
                  Set individual budgets for each category to better track your spending.
                </p>
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors font-medium"
                >
                  <HiOutlinePlus className="w-5 h-5" />
                  Add Category Budget
                </button>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Budget Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, budget: null })}
        title={modal.budget ? 'Edit Budget' : 'Set Budget'}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {yearOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Overall Budget (All Categories)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-500">
              Leave empty to set an overall monthly budget
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setModal({ open: false, budget: null })}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Spinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <HiOutlineCheckCircle className="w-5 h-5" />
                  Save Budget
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, budget: null })}
        title="Delete Budget"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineTrash className="w-8 h-8 text-red-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete this budget?</h4>
          <p className="text-gray-500 mb-6">
            {deleteModal.budget?.categoryId ? (
              <>Are you sure you want to delete the budget for <strong>{deleteModal.budget?.category?.name}</strong>?</>
            ) : (
              <>Are you sure you want to delete the overall budget for <strong>{getMonthName(deleteModal.budget?.month)} {deleteModal.budget?.year}</strong>?</>
            )}
            {' '}This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal({ open: false, budget: null })}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteModal.budget?.id)}
              disabled={deleting}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Spinner size="sm" />
                  Deleting...
                </>
              ) : (
                <>
                  <HiOutlineTrash className="w-5 h-5" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Budgets;
