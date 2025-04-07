import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/CartPreview.module.css';
import { useCart } from '../context/CartContext';

export default function CartPreview() {
  const { cartItems, basketItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Close the preview when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePreview = () => {
    setIsOpen(!isOpen);
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const formattedTotal = (totalPrice / 100).toFixed(2);

  return (
    <div className={styles.cartPreviewContainer} ref={previewRef}>
      <div 
        className={styles.basket} 
        onClick={togglePreview}
        title="View cart"
      >
        <Image src="/basket.svg" alt="Basket" width={24} height={24} />
        {basketItems > 0 && <span className={styles.basketCount}>{basketItems}</span>}
      </div>

      {isOpen && (
        <div className={styles.preview}>
          <h3>Your Cart</h3>
          
          {cartItems.length === 0 ? (
            <p className={styles.emptyCart}>Your cart is empty</p>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.itemImage}>
                      <Image 
                        src={item.img_url || '/philips-plumen.jpg'} 
                        alt={item.name}
                        width={50}
                        height={50}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity}</p>
                      <p className={styles.itemPrice}>£{((item.price * item.quantity) / 100).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.cartSummary}>
                <div className={styles.totalRow}>
                  <span>Total:</span>
                  <span className={styles.totalPrice}>£{formattedTotal}</span>
                </div>
                <Link href="/cart" className={styles.viewCartButton}>
                  View Cart
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 