// FROM: https://github.com/stripe/react-stripe-elements#element-groups-elements

// MyStoreCheckout.js
import React from 'react';
import {Elements} from 'react-stripe-elements';

import InjectedCheckoutForm from './CheckoutForm';

class MyStoreCheckout extends React.Component {
  render() {
    return (
      <Elements>
        <InjectedCheckoutForm {...this.props} />
      </Elements>
    );
  }
}

export default MyStoreCheckout;
