import { formatDate, formatPrice, formatSearchTerm, formatStock, formatUserName } from './formatting';
import { validateEmail, validatePassword, validateProduct, validateUser } from './validation';

test('validates email addresses, passwords, users, and products', () => {
  expect(validateEmail('ada@example.com')).toBe(true);
  expect(validateEmail('invalid-email')).toBe(false);
  expect(validatePassword('Strong123')).toEqual({ errors: [], isValid: true });
  expect(validatePassword('short')).toEqual({
    errors: [
      'Password must be at least 8 characters',
      'Password must contain uppercase',
      'Password must contain number'
    ],
    isValid: false
  });

  expect(
    validateUser({
      firstname: 'Ada',
      lastname: 'Lovelace',
      password: 'Strong123',
      username: 'ada'
    })
  ).toEqual({ errors: {}, isValid: true });
  expect(validateUser({ firstname: '', lastname: '', password: '', username: 'ab' }).isValid).toBe(false);

  expect(validateProduct({ name: 'Desk', price: 10, stock: 4 })).toEqual({ errors: {}, valid: true });
  expect(validateProduct({ name: ' ', price: -1, stock: -2 })).toEqual({
    errors: {
      name: 'Name is required',
      price: 'Price must be positive',
      stock: ['Stock cannot be negative']
    },
    valid: false
  });
  expect(validateProduct({ name: 'Chair', price: 'invalid', stock: 'invalid' }).valid).toBe(false);
});

test('formats dates, prices, stock, user names, and search terms', () => {
  expect(formatDate(null)).toBe('Invalid Date');
  expect(formatDate('2024-01-02T00:00:00')).toMatch(/2\/1\/2024/);
  expect(formatPrice(1234.5)).toBe('$1,234.50');
  expect(formatPrice(0)).toBe('$0.00');
  expect(formatPrice('not a price')).toBe('$0.00');

  expect(formatStock('not a number')).toBe('Out of Stock');
  expect(formatStock(0)).toBe('Out of Stock');
  expect(formatStock(3)).toBe('Low Stock (3 left)');
  expect(formatStock(7)).toBe('Limited Stock (7 available)');
  expect(formatStock(12)).toBe('In Stock (12)');

  expect(formatUserName('', '')).toBe('Unknown User');
  expect(formatUserName('ada', 'lovelace')).toBe('Ada Lovelace');
  expect(formatUserName('ada', '')).toBe('Ada');
  expect(formatUserName('', 'lovelace')).toBe('Lovelace');
  expect(formatSearchTerm('  hello   WORLD ')).toBe('Hello World');
  expect(formatSearchTerm('')).toBe('');
});
