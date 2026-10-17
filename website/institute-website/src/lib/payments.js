/*
 * Payment integration placeholder.
 *
 * No payment provider is connected yet.
 * Do not grant access to paid resources through this module
 * until a real payment provider verifies the transaction
 * on the server.
 */

export async function createPaymentSession() {
  return {
    configured: false,
    message: "Online payments have not been configured yet.",
  };
}

export async function verifyPayment() {
  return {
    verified: false,
    message: "Payment verification has not been configured yet.",
  };
}
