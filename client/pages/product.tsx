import { useState } from 'react';
import Image from 'next/image';
import { gql, useQuery } from '@apollo/client';
import styles from '../styles/Product.module.css';

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    Product(id: $id) {
      id
      name
      power
      description
      price
      quantity
      brand
      weight
      height
      width
      length
      model_code
      colour
      img_url
    }
  }
`;

interface Product {
  id: number;
  name: string;
  power: string;
  description: string;
  price: number;
  quantity: number;
  brand: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  model_code: string;
  colour: string;
  img_url: string;
}

interface ProductData {
  Product: Product;
}

export default function Product() {
  const [quantity, setQuantity] = useState(1);
  const [basketItems, setBasketItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { loading, error, data } = useQuery<ProductData>(GET_PRODUCT, {
    variables: { id: "1" }
  });

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

  if (loading) return (
    <div className={styles.container}>
      <div style={{ padding: '2rem', color: 'white' }}>Loading product data...</div>
    </div>
  );
  
  if (error) return (
    <div className={styles.container}>
      <div style={{ padding: '2rem', color: 'white' }}>
        Error loading product: {error.message}
      </div>
    </div>
  );

  if (!data?.Product) return (
    <div className={styles.container}>
      <div style={{ padding: '2rem', color: 'white' }}>
        No product data available. Data received: {JSON.stringify(data)}
      </div>
    </div>
  );

  const product = data.Product;
  const formattedPrice = (product.price / 100).toFixed(2);
  const dimensions = `${product.height} x ${product.width} x ${product.length}`;

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
            src={product.img_url || '/philips-plumen.jpg'} 
            alt={product.name}
            width={500}
            height={500}
            style={{ objectFit: 'contain' }}
            priority
            onError={(e) => {
              // Fallback to local image if external image fails
              const imgElement = e.target as HTMLImageElement;
              if (imgElement.src !== '/philips-plumen.jpg') {
                imgElement.src = '/philips-plumen.jpg';
              }
            }}
          />
        </div>

        <div className={styles.productInfo}>
          <h1>{product.name}</h1>
          <p className={styles.subtitle}>{`${product.power} // Packet of ${product.quantity}`}</p>
          
          <div className={styles.priceControlsContainer}>
            <div className={styles.price}>£{formattedPrice}</div>
            <div className={styles.controls}>
              <div className={styles.qtyLabel}>Qty</div>
              <div className={styles.controlsRow}>
                <button 
                  onClick={decreaseQuantity} 
                  className={styles.quantityButton} 
                  disabled={quantity === 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span title="Current quantity" className={styles.quantity}>{quantity}</span>
                <button 
                  onClick={increaseQuantity} 
                  className={styles.quantityButton} 
                  disabled={quantity === 99}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={addToCart} 
            className={styles.addToCart}
            disabled={isLoading}
            aria-label="Add to cart"
          >
            {isLoading ? 'Adding...' : 'Add to cart'}
          </button>

          <div className={styles.description}>
            <h2>Description</h2>
            <p>{product.description}</p>
          </div>

          <div className={styles.specifications}>
            <h2>Specifications</h2>
            <table>
              <tbody>
                <tr>
                  <th scope="row">Brand</th>
                  <td>{product.brand}</td>
                </tr>
                <tr>
                  <th scope="row">Item weight (g)</th>
                  <td>{product.weight}</td>
                </tr>
                <tr>
                  <th scope="row">Dimensions (cm)</th>
                  <td>{dimensions}</td>
                </tr>
                <tr>
                  <th scope="row">Item Model number</th>
                  <td>{product.model_code}</td>
                </tr>
                <tr>
                  <th scope="row">Colour</th>
                  <td>{product.colour}</td>
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
