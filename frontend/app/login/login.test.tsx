import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from './page';

// Mock the Next Router and NextAuth
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: jest.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login page with all elements', () => {
    render(<LoginPage />);

    expect(screen.getByText('Web3 Fraud Detection')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('calls signIn with "google" when the Google sign-in button is clicked', () => {
    const { signIn } = require('next-auth/react');
    render(<LoginPage />);

    fireEvent.click(screen.getByText('Continue with Google'));
    expect(signIn).toHaveBeenCalledWith('google');
  });

  it('calls signIn with "credentials" and the provided email and password when the form is submitted', () => {
    const { signIn } = require('next-auth/react');
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByText('Sign In'));

    expect(signIn).toHaveBeenCalledWith('credentials', { username: 'testuser', password: 'testpassword' });
  });
});