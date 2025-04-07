import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { CartProvider, useCart } from '../context/CartContext';
import CartPreview from '../components/CartPreview';

// Mock component to test the context
const TestComponent = () => {
  const { addToCart, clearCart, cartItems, basketItems } = useCart();
  
  return (
    <div>
      <button onClick={() => addToCart({ 
        id: 1, 
        name: 'Test Product', 
        price: 1000, 
        img_url: 'https://example.com/test.jpg' 
      }, 1)}>
        Add Item
      </button>
      <button onClick={clearCart}>Clear Cart</button>
      <div data-testid="cart-count">{basketItems}</div>
      <div data-testid="cart-items">{cartItems.length}</div>
      <CartPreview />
    </div>
  );
};

describe('CartContext', () => {
  describe('CartProvider', () => {
    test('should provide initial empty cart state', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
    });

    test('should add items to cart', async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByText('Add Item');
      
      await act(async () => {
        fireEvent.click(addButton);
      });

      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
    });

    test('should clear cart', async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // Add item first
      const addButton = screen.getByText('Add Item');
      await act(async () => {
        fireEvent.click(addButton);
      });

      // Then clear it
      const clearButton = screen.getByText('Clear Cart');
      await act(async () => {
        fireEvent.click(clearButton);
      });

      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
    });

    test('should update quantity when adding same item', async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByText('Add Item');
      
      // Add same item twice
      await act(async () => {
        fireEvent.click(addButton);
      });
      await act(async () => {
        fireEvent.click(addButton);
      });

      expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
    });
  });

  describe('CartPreview', () => {
    test('should toggle visibility when clicking cart icon', async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // Initially hidden
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Click cart icon to show
      const cartIcon = screen.getByTitle('View cart');
      await act(async () => {
        fireEvent.click(cartIcon);
      });

      // Should be visible
      expect(screen.getByText('Your Cart')).toBeInTheDocument();

      // Click cart icon again to hide
      await act(async () => {
        fireEvent.click(cartIcon);
      });

      // Should be hidden again
      expect(screen.queryByText('Your Cart')).not.toBeInTheDocument();
    });

    test('should display cart items correctly', async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // Add an item
      const addButton = screen.getByText('Add Item');
      await act(async () => {
        fireEvent.click(addButton);
      });

      // Show cart preview
      const cartIcon = screen.getByTitle('View cart');
      await act(async () => {
        fireEvent.click(cartIcon);
      });

      // Check item details
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Qty: 1')).toBeInTheDocument();
      
      // Check price in item details
      const itemPrice = screen.getByText('£10.00', { selector: '.itemPrice' });
      expect(itemPrice).toBeInTheDocument();
    });

    test('should close when clicking outside', async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // Show cart preview
      const cartIcon = screen.getByTitle('View cart');
      await act(async () => {
        fireEvent.click(cartIcon);
      });

      // Click outside
      await act(async () => {
        fireEvent.mouseDown(document.body);
      });

      // Should be hidden
      expect(screen.queryByText('Your Cart')).not.toBeInTheDocument();
    });

    test('should not close when clicking inside', async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // Show cart preview
      const cartIcon = screen.getByTitle('View cart');
      await act(async () => {
        fireEvent.click(cartIcon);
      });

      // Click inside
      const dialog = screen.getByText('Your Cart').parentElement;
      await act(async () => {
        fireEvent.mouseDown(dialog);
      });

      // Should still be visible
      expect(screen.getByText('Your Cart')).toBeInTheDocument();
    });
  });
}); 