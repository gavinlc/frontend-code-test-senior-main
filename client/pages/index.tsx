import Image from 'next/image';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ProductsData } from '../types';

export const GET_PRODUCTS = gql`
  query GetProducts {
    allProducts {
      id
      name
      power
      price
      img_url
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery<ProductsData>(GET_PRODUCTS);

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
                
        <h1 className={styles.title}>
          Welcome to the Octopus Energy Frontend code test!
        </h1>

        {loading && <p>Loading products...</p>}
        
        {error && <p>Error loading products: {error.message}</p>}
        
        {data?.allProducts && data.allProducts.length > 0 && (
          <div className={styles.products}>
            <h2>Our Products</h2>
            <div className={styles.productGrid}>
              {data.allProducts.map((product) => (
                <Link href={`/${product.id}`} key={product.id} className={styles.productCard}>
                  <div className={styles.productImage}>
                    <Image
                      src={product.img_url || '/philips-plumen.jpg'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.power}</p>
                  <p className={styles.price}>£{(product.price / 100).toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
        

      </main>

      <Footer />
    </div>
  );
}
