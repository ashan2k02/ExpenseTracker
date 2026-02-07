import { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Alert, Spinner } from '../components/ui';
import { categoryService } from '../services';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#6b7280',
];

const ICONS = ['🍕', '🚗', '🛒', '🎬', '💡', '🏥', '📚', '✈️', '🏠', '💳', '🎮', '👕', '💪', '📦'];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [modal, setModal] = useState({ open: false, category: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null });
  const [formData, setFormData] = useState({ name: '', icon: '📦', color: '#6366f1' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setFormData({ name: category.name, icon: category.icon, color: category.color });
    } else {
      setFormData({ name: '', icon: '📦', color: '#6366f1' });
    }
    setModal({ open: true, category });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'Category name is required' });
      return;
    }

    setSaving(true);
    try {
      if (modal.category) {
        await categoryService.update(modal.category.id, formData);
        setAlert({ type: 'success', message: 'Category updated successfully' });
      } else {
        await categoryService.create(formData);
        setAlert({ type: 'success', message: 'Category created successfully' });
      }
      setModal({ open: false, category: null });
      fetchCategories();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to save category' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await categoryService.delete(deleteModal.category.id);
      setAlert({ type: 'success', message: 'Category deleted successfully' });
      setDeleteModal({ open: false, category: null });
      fetchCategories();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete category' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Organize your expenses by category</p>
        </div>
        <Button onClick={() => openModal()}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </Button>
      </div>

      {/* Alert */}
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    {category.isDefault && (
                      <span className="text-xs text-gray-500">Default category</span>
                    )}
                  </div>
                </div>
                {category.userId && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal(category)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, category })}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, category: null })}
        title={modal.category ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Groceries"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    formData.icon === icon
                      ? 'bg-indigo-100 ring-2 ring-indigo-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setModal({ open: false, category: null })}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} loading={saving}>
              {modal.category ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, category: null })}
        title="Delete Category"
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{deleteModal.category?.name}"? 
          Categories with expenses cannot be deleted.
        </p>
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setDeleteModal({ open: false, category: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
