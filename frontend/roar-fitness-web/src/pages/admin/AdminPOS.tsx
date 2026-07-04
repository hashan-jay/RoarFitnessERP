/**
 * In-gym point-of-sale for walk-in merchandise sales. Creates a bill and
 * decrements inventory on checkout. Role: Admin.
 */
import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { ProductCard } from '../../components/ProductCard';
import { PosBillReceipt } from '../../components/admin/PosBillReceipt';
import { LoadingSpinner } from '../../components/common';
import { formatCurrency } from '../../lib/formatters';
import type { Product, PosBill } from '../../types';

const fallbackProducts: Product[] = [
  { productId: 1, sku: 'SUP-WHEY-1KG', productName: 'Roar Whey Protein 1kg', unitPriceLKR: 12500, quantityOnHand: 50 },
  { productId: 2, sku: 'SUP-PRE-300G', productName: 'Roar Pre-Workout 300g', unitPriceLKR: 6500, quantityOnHand: 30 },
  { productId: 3, sku: 'MER-TSHIRT-M', productName: 'Roar Fitness T-Shirt (M)', unitPriceLKR: 3500, quantityOnHand: 40 },
  { productId: 4, sku: 'MER-HOODIE-L', productName: 'Roar Hoodie (L)', unitPriceLKR: 7500, quantityOnHand: 25 },
];

interface CartEntry {
  product: Product;
  quantity: number;
}

export function AdminPOS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bill, setBill] = useState<PosBill | null>(null);

  useEffect(() => {
    adminService
      .getProducts()
      .then(setProducts)
      .catch(() => setProducts(fallbackProducts))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.productId === product.productId);
      if (existing) {
        return prev.map((i) =>
          i.product.productId === product.productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.productId === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.product.unitPriceLKR * i.quantity, 0);

  /** Submit sale to API, show printable bill, and refresh stock levels. */
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    setMessage('');
    setError('');

    const items = cart.map((i) => ({ productId: i.product.productId, quantity: i.quantity }));

    try {
      const result = await adminService.createPosOrder(items, paymentMethod);
      setBill(result.bill);
      setMessage(`Sale complete. Bill ${result.bill.billReference} generated.`);
      setCart([]);
      adminService.getProducts().then(setProducts).catch(() => undefined);
    } catch {
      setError('Sale could not be completed. Ensure the API is running and stock is available.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>Point of Sale</h1>
        <p>In-gym merchandise sales with printable customer bills.</p>
      </div>

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <div className="pos-layout">
        <div className="pos-products">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid--3">
              {products.map((product) => (
                <ProductCard key={product.productId} product={product} onAddToCart={addToCart} showStock />
              ))}
            </div>
          )}
        </div>

        <div className="pos-cart">
          <h3>Current Sale</h3>
          <div className="pos-cart__items">
            {cart.length === 0 ? (
              <p className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>No items in sale</p>
            ) : (
              cart.map((item) => (
                <div key={item.product.productId} className="cart-item">
                  <div className="cart-item__info">
                    <strong>{item.product.productName}</strong>
                    <br />
                    <small>{formatCurrency(item.product.unitPriceLKR)}</small>
                  </div>
                  <div className="cart-item__qty">
                    <button type="button" onClick={() => updateQty(item.product.productId, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.product.productId, 1)}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className="cart-summary">
                <div className="cart-summary__row cart-summary__total">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <button type="button" className="btn btn--primary btn--block" onClick={handleCheckout} disabled={processing}>
                  {processing ? 'Processing...' : 'Complete Sale & Print Bill'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {bill && (
        <PosBillReceipt
          bill={bill}
          onClose={() => setBill(null)}
        />
      )}
    </>
  );
}
