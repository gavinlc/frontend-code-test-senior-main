import { render, waitFor, screen, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { act } from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProductDetail, { GET_PRODUCT } from "../pages/[id]";
import { CartProvider } from '../context/CartContext';
import { useRouter } from 'next/router';

expect.extend(toHaveNoViolations);

const productData = {
  id: 1,
  name: "Energy saving light bulb",
  power: "25W",
  description: "Available in 7 watts, 9 watts, 11 watts Spiral Light bulb in B22, bulb switches on instantly, no wait around warm start and flicker free features make for a great all purpose bulb",
  price: 1299,
  quantity: 4,
  brand: "Philips",
  weight: 77,
  height: 12.6,
  width: 6.2,
  length: 6.2,
  model_code: "E27 ES",
  colour: "Cool daylight",
  img_url: "https://i.ibb.co/2nzwxnQ/bulb.png"
};

const successMock = [
  {
    request: {
      query: GET_PRODUCT,
      variables: { id: "1" }
    },
    result: {
      data: {
        Product: productData
      }
    }
  }
];

const errorMock = [
  {
    request: {
      query: GET_PRODUCT,
      variables: { id: "1" }
    },
    error: new Error("An error occurred")
  }
];

// Mock the router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockRouter = {
  push: jest.fn(),
  query: { id: '1' }
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

// Wrapper component to provide CartContext
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockedProvider mocks={successMock} addTypename={false}>
      <CartProvider>
        {children}
      </CartProvider>
    </MockedProvider>
  );
};

describe("Product Detail Component", () => {
  describe("Loading and Error States", () => {
    test("should show loading state", async () => {
      const { getByText } = render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );
      
      expect(getByText("Loading product data...")).toBeInTheDocument();
    });

    test("should show error state", async () => {
      const { getByText } = render(
        <MockedProvider mocks={errorMock} addTypename={false}>
          <CartProvider>
            <ProductDetail />
          </CartProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(getByText(/Error loading product/)).toBeInTheDocument();
      });
    });
  });

  describe("Product Display", () => {
    test("should display correct product information", async () => {
      const { getByText, getByRole } = render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );

      await waitFor(() => {
        expect(getByText(productData.name)).toBeInTheDocument();
      });

      expect(getByText(`£${(productData.price / 100).toFixed(2)}`)).toBeInTheDocument();
      expect(getByText(productData.description)).toBeInTheDocument();
      expect(getByText(productData.brand)).toBeInTheDocument();
      
      // Check specifications table
      const table = getByRole('table');
      expect(table).toBeInTheDocument();
      expect(getByText(`${productData.height} x ${productData.width} x ${productData.length}`)).toBeInTheDocument();
    });

    test("should display product image", async () => {
      render(<ProductDetail />, { wrapper: AllTheProviders });

      await waitFor(() => {
        const image = screen.getByAltText(productData.name);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('alt', productData.name);
      });
    });
  });

  describe("Quantity Controls", () => {
    test("should disable decrease button at minimum quantity", async () => {
      const { getByText } = render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );

      await waitFor(() => {
        expect(getByText(productData.name)).toBeInTheDocument();
      });

      const decreaseButton = getByText("-");
      expect(decreaseButton).toBeDisabled();
    });

    test("should disable increase button at maximum quantity", async () => {
      const { getByText, getByTitle } = render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );

      await waitFor(() => {
        expect(getByText(productData.name)).toBeInTheDocument();
      });

      const increaseButton = getByText("+");
      const currentQuantity = getByTitle("Current quantity");

      // Click until max (99)
      for (let i = 1; i < 99; i++) {
        await act(async () => {
          fireEvent.click(increaseButton);
        });
      }

      expect(increaseButton).toBeDisabled();
      expect(currentQuantity).toHaveTextContent("99");
    });

    test("should start with quantity 1", async () => {
      render(<ProductDetail />, { wrapper: AllTheProviders });

      await waitFor(() => {
        expect(screen.getByTitle('Current quantity')).toHaveTextContent('1');
      });
    });

    test("should increase quantity when clicking plus button", async () => {
      render(<ProductDetail />, { wrapper: AllTheProviders });

      await waitFor(() => {
        const plusButton = screen.getByRole('button', { name: /increase/i });
        fireEvent.click(plusButton);
        expect(screen.getByTitle('Current quantity')).toHaveTextContent('2');
      });
    });

    test("should decrease quantity when clicking minus button", async () => {
      render(<ProductDetail />, { wrapper: AllTheProviders });

      await waitFor(() => {
        const plusButton = screen.getByRole('button', { name: /increase/i });
        const minusButton = screen.getByRole('button', { name: /decrease/i });
        
        fireEvent.click(plusButton);
        fireEvent.click(minusButton);
        
        expect(screen.getByTitle('Current quantity')).toHaveTextContent('1');
      });
    });

    test("should not decrease quantity below 1", async () => {
      render(<ProductDetail />, { wrapper: AllTheProviders });

      await waitFor(() => {
        const minusButton = screen.getByRole('button', { name: /decrease/i });
        fireEvent.click(minusButton);
        expect(screen.getByTitle('Current quantity')).toHaveTextContent('1');
      });
    });
  });

  describe("Add to Cart Functionality", () => {
    test("should show loading state while adding to cart", async () => {
      const { getByRole } = render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );

      await waitFor(() => {
        expect(getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
      });

      const addToCartButton = getByRole('button', { name: 'Add to cart' });
      
      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // The button is still accessible as "Add to cart" but is disabled and shows "Adding..."
      const loadingButton = getByRole('button', { name: 'Add to cart' });
      expect(loadingButton).toBeDisabled();
      expect(loadingButton).toHaveTextContent('Adding...');
      
      await waitFor(() => {
        const finalButton = getByRole('button', { name: 'Add to cart' });
        expect(finalButton).not.toBeDisabled();
        expect(finalButton).toHaveTextContent('Add to cart');
      });
    });

    test("should add product to cart when clicking add to cart button", async () => {
      render(<ProductDetail />, { wrapper: AllTheProviders });

      await waitFor(() => {
        const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
        fireEvent.click(addToCartButton);
        
        // Check that cart icon shows updated count
        const cartIcon = screen.getByTitle('View cart');
        expect(cartIcon).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    test("should add correct quantity to cart", async () => {
      render(<ProductDetail />, { wrapper: AllTheProviders });

      await waitFor(() => {
        const plusButton = screen.getByRole('button', { name: /increase/i });
        const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
        
        fireEvent.click(plusButton);
        fireEvent.click(addToCartButton);
        
        // Check that cart icon shows updated count
        const cartIcon = screen.getByTitle('View cart');
        expect(cartIcon).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    test("should have no accessibility violations", async () => {
      const { container } = render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: productData.name })).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("should have proper heading hierarchy", async () => {
      render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );

      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toHaveTextContent(productData.name);
        
        const h2s = screen.getAllByRole('heading', { level: 2 });
        expect(h2s).toHaveLength(2);
        expect(h2s[0]).toHaveTextContent('Description');
        expect(h2s[1]).toHaveTextContent('Specifications');
      });
    });

    test("should have proper button labels and ARIA attributes", async () => {
      render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );

      await waitFor(() => {
        const decreaseButton = screen.getByRole('button', { name: 'Decrease quantity' });
        const increaseButton = screen.getByRole('button', { name: 'Increase quantity' });
        const addToCartButton = screen.getByRole('button', { name: 'Add to cart' });

        expect(decreaseButton).toBeInTheDocument();
        expect(increaseButton).toBeInTheDocument();
        expect(addToCartButton).toBeInTheDocument();
      });
    });

    test("should have proper image alt text", async () => {
      render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );

      await waitFor(() => {
        const logo = screen.getByRole('img', { name: 'Octopus Energy' });
        const productImage = screen.getByRole('img', { name: productData.name });

        expect(logo).toBeInTheDocument();
        expect(productImage).toBeInTheDocument();
      });
    });

    test("should have accessible table structure", async () => {
      render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );

      await waitFor(() => {
        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');
        
        // Check table headers are properly labeled
        rows.forEach(row => {
          const header = within(row).getByRole('rowheader');
          expect(header).toHaveAttribute('scope', 'row');
        });
      });
    });

    test("should maintain focus management during interactions", async () => {
      render(
        <AllTheProviders>
          <ProductDetail />
        </AllTheProviders>
      );

      await waitFor(() => {
        const addToCartButton = screen.getByRole('button', { name: 'Add to cart' });
        expect(addToCartButton).toBeInTheDocument();
      });

      const addToCartButton = screen.getByRole('button', { name: 'Add to cart' });
      addToCartButton.focus();
      
      // Click add to cart and verify focus is maintained
      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      expect(document.activeElement).toBe(addToCartButton);
      
      // Wait for loading state to complete
      await waitFor(() => {
        expect(addToCartButton).not.toBeDisabled();
      });

      // Focus should still be on the button after loading
      expect(document.activeElement).toBe(addToCartButton);
    });
  });
}); 