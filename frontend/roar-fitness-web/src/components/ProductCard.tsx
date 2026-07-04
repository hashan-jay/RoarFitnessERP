/**
 * Product card for POS and inventory grids. Shows price, optional stock, and add-to-cart.
 */
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  showStock?: boolean;
}

export function ProductCard({ product, onAddToCart, showStock }: ProductCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="card product-card">
      <div className="product-card__image">📦</div>
      <h3>{product.productName}</h3>
      {product.description && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{product.description}</p>}
      <div className="product-card__price">{formatPrice(product.unitPriceLKR)}</div>
      {showStock && product.quantityOnHand !== undefined && (
        <small style={{ color: 'var(--color-text-muted)' }}>In stock: {product.quantityOnHand}</small>
      )}
      {onAddToCart && (
        <div className="product-card__actions">
          <button className="btn btn--primary btn--sm btn--block" onClick={() => onAddToCart(product)}>
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
