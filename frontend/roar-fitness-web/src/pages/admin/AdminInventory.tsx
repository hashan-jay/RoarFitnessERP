/**
 * Inventory management for supplements and merchandise sold via in-gym POS.
 */
import { useEffect, useState, type FormEvent, Fragment } from 'react';
import { adminService } from '../../services';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { formatCurrency } from '../../lib/formatters';
import type { Product, ProductCategory, CreateProductRequest, UpdateProductRequest } from '../../types';

const emptyForm: CreateProductRequest = {
  categoryId: 0,
  sku: '',
  productName: '',
  description: '',
  unitPriceLKR: 0,
  initialQuantity: 0,
  reorderLevel: 5,
  imageUrl: '',
};

export function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<CreateProductRequest>(emptyForm);
  const [adjustingId, setAdjustingId] = useState<number | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    // Load inventory and categories independently so partial API failure still shows data.
    let itemsOk = false;
    let catsOk = false;

    try {
      setProducts(await adminService.getInventory());
      itemsOk = true;
    } catch {
      setProducts([]);
    }

    try {
      const cats = await adminService.getCategories();
      setCategories(cats);
      catsOk = true;
      if (cats.length > 0) {
        setForm((prev) => (prev.categoryId ? prev : { ...prev, categoryId: cats[0].categoryId }));
      }
    } catch {
      setCategories([]);
    }

    if (!itemsOk) {
      setError('Could not load inventory. Ensure the API is running and restart it after updates.');
    } else if (!catsOk) {
      setError('Categories could not be loaded. Product list is available; restart the API to add new items.');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.categoryId ?? 0,
    });
    setModalOpen(true);
    setError('');
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      categoryId: product.categoryId ?? categories[0]?.categoryId ?? 0,
      sku: product.sku,
      productName: product.productName,
      description: product.description ?? '',
      unitPriceLKR: product.unitPriceLKR,
      initialQuantity: product.quantityOnHand ?? 0,
      reorderLevel: product.reorderLevel ?? 5,
      imageUrl: product.imageUrl ?? '',
    });
    setModalOpen(true);
    setError('');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        const update: UpdateProductRequest = {
          categoryId: form.categoryId,
          sku: form.sku,
          productName: form.productName,
          description: form.description,
          unitPriceLKR: form.unitPriceLKR,
          reorderLevel: form.reorderLevel,
          isActive: editing.isActive !== false,
          imageUrl: form.imageUrl,
        };
        await adminService.updateProduct(editing.productId, update);
        setMessage('Product updated.');
      } else {
        await adminService.createProduct(form);
        setMessage('Product added to inventory.');
      }
      setModalOpen(false);
      loadData();
    } catch {
      setError('Could not save product. Check SKU uniqueness and required fields.');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Remove "${product.productName}" from inventory?`)) return;
    try {
      await adminService.deleteProduct(product.productId);
      setMessage('Product removed.');
      loadData();
    } catch {
      setError('Could not remove product.');
    }
  };

  const handleClear = async (product: Product) => {
    const reason = window.prompt(`Reason for clearing stock of "${product.productName}":`);
    if (!reason) return;
    try {
      await adminService.clearStock(product.productId, reason);
      setMessage('Stock cleared.');
      loadData();
    } catch {
      setError('Could not clear stock.');
    }
  };

  const handleAdjust = async (e: FormEvent, productId: number) => {
    e.preventDefault();
    try {
      await adminService.adjustInventory(productId, adjustQty, adjustReason);
      setMessage('Inventory adjusted.');
      setAdjustingId(null);
      setAdjustQty(0);
      setAdjustReason('');
      loadData();
    } catch {
      setError('Could not adjust inventory.');
    }
  };

  return (
    <>
      <div className="page-title page-title--row">
        <div>
          <h1>Inventory</h1>
          <p>Add, edit, and manage stock for supplements and merchandise sold at the gym POS.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          Add Item
        </button>
      </div>

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState message="No inventory items found. Add your first product." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Reorder</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <Fragment key={item.productId}>
                  <tr className={item.isActive === false ? 'row--muted' : undefined}>
                    <td><strong>{item.sku}</strong></td>
                    <td>{item.productName}</td>
                    <td>{item.categoryName}</td>
                    <td>{formatCurrency(item.unitPriceLKR)}</td>
                    <td>{item.quantityOnHand ?? 0}</td>
                    <td>{item.reorderLevel ?? 5}</td>
                    <td>
                      {item.isActive === false ? (
                        <span className="badge badge--neutral">Removed</span>
                      ) : (item.quantityOnHand ?? 0) <= (item.reorderLevel ?? 5) ? (
                        <span className="badge badge--warning">Low Stock</span>
                      ) : (
                        <span className="badge badge--success">OK</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => openEdit(item)}>Edit</button>
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => setAdjustingId(adjustingId === item.productId ? null : item.productId)}>Adjust</button>
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => handleClear(item)}>Clear</button>
                        {item.isActive !== false && (
                          <button type="button" className="btn btn--outline btn--sm" onClick={() => handleDelete(item)}>Remove</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {adjustingId === item.productId && (
                    <tr>
                      <td colSpan={9}>
                        <form onSubmit={(e) => handleAdjust(e, item.productId)} className="inline-form">
                          <div className="form-group">
                            <label>Qty Change (+/-)</label>
                            <input type="number" required value={adjustQty || ''} onChange={(e) => setAdjustQty(Number(e.target.value))} />
                          </div>
                          <div className="form-group">
                            <label>Reason</label>
                            <input required value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Restock, damage, etc." />
                          </div>
                          <button type="submit" className="btn btn--primary btn--sm">Save</button>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Unit Price (LKR)</label>
                  <input type="number" min="0" step="0.01" required value={form.unitPriceLKR || ''} onChange={(e) => setForm({ ...form, unitPriceLKR: Number(e.target.value) })} />
                </div>
                {!editing && (
                  <div className="form-group">
                    <label>Initial Quantity</label>
                    <input type="number" min="0" required value={form.initialQuantity || ''} onChange={(e) => setForm({ ...form, initialQuantity: Number(e.target.value) })} />
                  </div>
                )}
                <div className="form-group">
                  <label>Reorder Level</label>
                  <input type="number" min="0" required value={form.reorderLevel || ''} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL (optional)</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">{editing ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
