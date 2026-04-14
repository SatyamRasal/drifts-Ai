export function formatValidationMessage(issues: { message: string }[]) {
  const detail = issues.map((issue) => issue.message).filter(Boolean).join('; ');
  if (!detail) {
    return 'This detail is not as per expectation to handle.';
  }
  return `This detail is not as per expectation to handle (${detail}).`;
}

export function formatAuthMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const message = raw.trim();

  if (/already registered|already exists|email.*in use|account exists/i.test(message)) {
    return 'An account with this email already exists. Sign in or reset your password.';
  }

  if (/invalid login credentials|incorrect password|invalid email/i.test(message)) {
    return 'Invalid email or password. Please try again.';
  }

  if (/email not confirmed|verification/i.test(message) && !/session cookie was not created/i.test(message)) {
    return 'Check your inbox and complete the verification step before signing in.';
  }

  if (/session cookie was not created/i.test(message)) {
    return 'Verification completed, but the session was not established. Please sign in again or use password reset.';
  }

  if (!message) {
    return 'Authentication failed. Please try again.';
  }

  return message;
}

export function flashMessageForAdmin(token?: string) {
  switch (token) {
    case 'product_saved':
      return 'Product saved successfully.';
    case 'product_created':
      return 'Product created successfully.';
    case 'product_deleted':
      return 'Product deleted successfully.';
    case 'settings_saved':
      return 'Site settings updated successfully.';
    case 'landing_saved':
      return 'Landing page sections updated successfully.';
    case 'page_saved':
      return 'Page content saved successfully.';
    case 'page_save_failed':
      return 'The page could not be saved. Review the content and try again.';
    case 'lead_updated':
      return 'Lead status updated successfully.';
    case 'chatbot_saved':
      return 'Chatbot knowledge base updated successfully.';
    default:
      return '';
  }
}
