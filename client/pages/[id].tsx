import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import styles from '../styles/Product.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { Product, ProductData } from '../types';

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

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  
  const { loading, error, data } = useQuery<ProductData>(GET_PRODUCT, {
    variables: { id },
    skip: !id, // Skip the query until we have an ID
  });

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleAddToCart = async () => {
    if (!data?.Product) return;
    
    setIsLoading(true);
    try {
      addToCart({
        id: data.Product.id,
        name: data.Product.name,
        price: data.Product.price,
        img_url: data.Product.img_url
      }, quantity);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return (
    <div className={styles.container}>
      <Header />
      <div style={{ padding: '2rem', color: 'white' }}>Loading product data...</div>
      <Footer />
    </div>
  );
  
  if (error) return (
    <div className={styles.container}>
      <Header />
      <div style={{ padding: '2rem', color: 'white' }}>
        Error loading product: {error.message}
      </div>
      <Footer />
    </div>
  );

  if (!data?.Product) return (
    <div className={styles.container}>
      <Header />
      <div style={{ padding: '2rem', color: 'white' }}>
        Product not found. Please check the URL and try again.
      </div>
      <Footer />
    </div>
  );

  const product = data.Product;
  const formattedPrice = (product.price / 100).toFixed(2);
  const dimensions = `${product.height} x ${product.width} x ${product.length}`;

  return (
    <div className={styles.container}>
      <Header />

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
            onClick={handleAddToCart} 
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

      <Footer />
    </div>
  );
} 