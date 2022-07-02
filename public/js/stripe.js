/* eslint-disable */
import axios from 'axios';
import { notify } from './notify';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51LF036BDIz4JH8n9pSP6H7w1BG27z5XZ6iTLdeSYNP4ABbWZnoxwYKs1YsbhDjnLYgWGkzY6CmvBt7PWbZabqudE003SH46KtQ'
    ); // publishable key
    // Get checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    // Create checkout form & charge card
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    notify('Error processing payment, please try again later.', 'error');
  }
};
