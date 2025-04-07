import { render, waitFor, screen, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { act } from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Product, { GET_PRODUCT } from "../pages/product";

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

describe("Product Component", () => {
  describe("Loading and Error States", () => {
    test("should show loading state", async () => {
      const { getByText } = render(
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
      );
      
      expect(getByText("Loading product data...")).toBeInTheDocument();
    });

    test("should show error state", async () => {
      const { getByText } = render(
        <MockedProvider mocks={errorMock} addTypename={false}>
          <Product />
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
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
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
  });

  describe("Quantity Controls", () => {
    test("should disable decrease button at minimum quantity", async () => {
      const { getByText } = render(
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(getByText(productData.name)).toBeInTheDocument();
      });

      const decreaseButton = getByText("-");
      expect(decreaseButton).toBeDisabled();
    });

    test("should disable increase button at maximum quantity", async () => {
      const { getByText, getByTitle } = render(
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
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
  });

  describe("Add to Cart Functionality", () => {
    test("should show loading state while adding to cart", async () => {
      const { getByRole } = render(
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
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

    test("should accumulate basket items correctly", async () => {
      const { getByRole, getByTitle } = render(
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
      });

      // Add 2 items first time
      await act(async () => {
        fireEvent.click(getByRole('button', { name: 'Increase quantity' }));
      });

      const addToCartButton = getByRole('button', { name: 'Add to cart' });
      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Wait for loading state to complete
      await waitFor(() => {
        expect(addToCartButton).not.toBeDisabled();
      });

      // Wait for the first basket update
      await waitFor(() => {
        expect(getByTitle("Basket items")).toHaveTextContent("2");
      });

      // Add 3 more items
      await act(async () => {
        fireEvent.click(getByRole('button', { name: 'Increase quantity' }));
      });

      await act(async () => {
        fireEvent.click(getByRole('button', { name: 'Increase quantity' }));
      });

      // Wait for quantity to update
      await waitFor(() => {
        expect(getByTitle("Current quantity")).toHaveTextContent("4");
      });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Wait for loading state to complete
      await waitFor(() => {
        expect(addToCartButton).not.toBeDisabled();
      });

      // Wait for the second basket update with increased timeout
      await waitFor(() => {
        expect(getByTitle("Basket items")).toHaveTextContent("6");
      }, { timeout: 2000 });
    });
  });

  describe("Accessibility", () => {
    test("should have no accessibility violations", async () => {
      const { container } = render(
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
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
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
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
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
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
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
      );

      await waitFor(() => {
        const logo = screen.getByRole('img', { name: 'Octopus Energy' });
        const basketIcon = screen.getByRole('img', { name: 'Basket' });
        const productImage = screen.getByRole('img', { name: productData.name });

        expect(logo).toBeInTheDocument();
        expect(basketIcon).toBeInTheDocument();
        expect(productImage).toBeInTheDocument();
      });
    });

    test("should have accessible table structure", async () => {
      render(
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
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
        <MockedProvider mocks={successMock} addTypename={false}>
          <Product />
        </MockedProvider>
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
