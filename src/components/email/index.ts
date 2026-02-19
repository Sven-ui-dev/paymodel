export { generateWelcomeEmailContent, type WelcomeEmailProps } from './WelcomeEmail';
export { generatePaymentConfirmationEmailContent, type PaymentConfirmationEmailProps } from './PaymentConfirmationEmail';
export { generatePaymentFailedEmailContent, type PaymentFailedEmailProps } from './PaymentFailedEmail';
export { generateSubscriptionRenewedEmailContent, type SubscriptionRenewedEmailProps } from './SubscriptionRenewedEmail';
export { generatePriceAlertEmailContent, type PriceAlertEmailProps } from './PriceAlertEmail';

export function html(strings: TemplateStringsArray, ...values: any[]): string {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] || '');
  }, '');
}

export function text(strings: TemplateStringsArray, ...values: any[]): string {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] || '');
  }, '');
}
