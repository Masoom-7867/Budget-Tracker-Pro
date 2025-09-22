import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CategorySection = ({ 
  title, 
  categories, 
  onAddCategory, 
  onEditCategory, 
  onDeleteCategory,
  searchTerm,
  onSearchChange,
  type 
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDescription, setEditCategoryDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const filteredCategories = categories?.filter(category =>
    category?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleAddCategory = () => {
    if (newCategoryName?.trim()) {
      onAddCategory({
        name: newCategoryName?.trim(),
        description: newCategoryDescription?.trim(),
        type
      });
      setNewCategoryName('');
      setNewCategoryDescription('');
      setIsAddingCategory(false);
    }
  };

  const handleEditCategory = (id) => {
    onEditCategory(id, {
      name: editCategoryName?.trim(),
      description: editCategoryDescription?.trim()
    });
    setEditingId(null);
    setEditCategoryName('');
    setEditCategoryDescription('');
  };

  const startEdit = (category) => {
    setEditingId(category?.id);
    setEditCategoryName(category?.name);
    setEditCategoryDescription(category?.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCategoryName('');
    setEditCategoryDescription('');
  };

  const handleDeleteConfirm = (id) => {
    onDeleteCategory(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${type === 'income' ? 'bg-success/10' : 'bg-error/10'}`}>
            <Icon 
              name={type === 'income' ? 'TrendingUp' : 'TrendingDown'} 
              size={20} 
              color={type === 'income' ? 'var(--color-success)' : 'var(--color-error)'} 
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{filteredCategories?.length} categories</p>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          iconName="Plus"
          iconPosition="left"
          onClick={() => setIsAddingCategory(true)}
        >
          Add Category
        </Button>
      </div>
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder={`Search ${title?.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e?.target?.value)}
          className="w-full"
        />
      </div>
      {/* Add Category Form */}
      {isAddingCategory && (
        <div className="bg-muted rounded-lg p-4 mb-4 border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Add New Category</h3>
          <div className="space-y-3">
            <Input
              label="Category Name"
              type="text"
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e?.target?.value)}
              required
            />
            <Input
              label="Description (Optional)"
              type="text"
              placeholder="Enter category description"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e?.target?.value)}
            />
            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleAddCategory}
                disabled={!newCategoryName?.trim()}
              >
                Add Category
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Categories List */}
      <div className="space-y-3">
        {filteredCategories?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FolderOpen" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No categories found matching your search.' : `No ${title?.toLowerCase()} yet.`}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setIsAddingCategory(true)}
              >
                Add Your First Category
              </Button>
            )}
          </div>
        ) : (
          filteredCategories?.map((category) => (
            <div key={category?.id} className="bg-background rounded-lg border border-border p-4">
              {editingId === category?.id ? (
                <div className="space-y-3">
                  <Input
                    label="Category Name"
                    type="text"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e?.target?.value)}
                    required
                  />
                  <Input
                    label="Description (Optional)"
                    type="text"
                    value={editCategoryDescription}
                    onChange={(e) => setEditCategoryDescription(e?.target?.value)}
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleEditCategory(category?.id)}
                      disabled={!editCategoryName?.trim()}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${type === 'income' ? 'bg-success/10' : 'bg-error/10'}`}>
                        <Icon 
                          name={category?.icon} 
                          size={16} 
                          color={type === 'income' ? 'var(--color-success)' : 'var(--color-error)'} 
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{category?.name}</h3>
                        {category?.description && (
                          <p className="text-sm text-muted-foreground">{category?.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {category?.transactionCount} transactions
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Last used: {category?.lastUsed}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(category)}
                    >
                      <Icon name="Edit2" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDeleteConfirm(category?.id)}
                    >
                      <Icon name="Trash2" size={16} color="var(--color-error)" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Delete Category</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this category? This action cannot be undone and may affect existing transactions.
            </p>
            <div className="flex items-center space-x-3">
              <Button
                variant="destructive"
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
              >
                Delete Category
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySection;