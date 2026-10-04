import { billingApi } from './api';
import { billingReturnUrls } from './billingHelpers';

/** Sends the signed-in user straight to the Stripe checkout page. */
export async function startWebProCheckout(): Promise<void> {
  const { successUrl, cancelUrl } = billingReturnUrls('/plans');
  const response = await billingApi.createCheckoutSession(successUrl, cancelUrl);
  window.location.assign(response.data.checkout_url);
}
