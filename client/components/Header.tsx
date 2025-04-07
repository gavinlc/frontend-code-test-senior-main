import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Header.module.css';
import CartPreview from './CartPreview';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <Image src="/octopus-logo.svg" alt="Octopus Energy" width={40} height={40} />
      </Link>
      <CartPreview />
    </header>
  );
} 