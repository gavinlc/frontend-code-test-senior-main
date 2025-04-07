import { useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Product.module.css';

export default function Product() {
  const [quantity, setQuantity] = useState(1);
  const [basketItems, setBasketItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const addToCart = async () => {
    setIsLoading(true);
    try {
      setBasketItems(prev => prev + quantity);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/octopus-logo.svg" alt="Octopus Energy" width={40} height={40} />
        </div>
        <div className={styles.basket} title="Basket items">
          <Image src="/basket.svg" alt="Basket" width={24} height={24} />
          <span>{basketItems}</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.productImage}>
          <Image 
            src="/philips-plumen.jpg" 
            alt="Energy saving light bulb"
            width={500}
            height={500}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <div className={styles.productInfo}>
          <h1>Energy saving light bulb</h1>
          <p className={styles.subtitle}>25W // Packet of 4</p>
          
          <div className={styles.priceControlsContainer}>
            <div className={styles.price}>£12.99</div>
            <div className={styles.controls}>
              <div className={styles.qtyLabel}>Qty</div>
              <div className={styles.controlsRow}>
                <button onClick={decreaseQuantity} className={styles.quantityButton} disabled={quantity === 1}>-</button>
                <span title="Current quantity" className={styles.quantity}>{quantity}</span>
                <button onClick={increaseQuantity} className={styles.quantityButton} disabled={quantity === 99}>+</button>
              </div>
            </div>
          </div>

          <button 
            onClick={addToCart} 
            className={styles.addToCart}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add to cart'}
          </button>

          <div className={styles.description}>
            <h2>Description</h2>
            <p>
              Available in 7 watts, 9 watts, 11 watts Spiral Light bulb in B22, bulb switches on instantly,
              no wait around warm start and flicker free features make for a great all purpose bulb
            </p>
          </div>

          <div className={styles.specifications}>
            <h2>Specifications</h2>
            <table>
              <tbody>
                <tr>
                  <td>Brand</td>
                  <td>Phillips</td>
                </tr>
                <tr>
                  <td>Item weight (g)</td>
                  <td>77</td>
                </tr>
                <tr>
                  <td>Dimensions (cm)</td>
                  <td>12.6 x 6.2 x 6.2</td>
                </tr>
                <tr>
                  <td>Item Model number</td>
                  <td>E27 ES</td>
                </tr>
                <tr>
                  <td>Colour</td>
                  <td>Cool daylight</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Octopus Energy Ltd is a company registered in England and Wales.
          Registered number: 09263424. Registered office: 33 Holborn,
          London, EC1N 2HT. Trading office: 20-24 Broadwick Street, London,
          W1F 8HT
        </p>
      </footer>
    </div>
  );
}
