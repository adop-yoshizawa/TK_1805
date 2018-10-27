import * as React from 'react';
import { Provider } from 'mobx-react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import stores from './stores';
import IndexTest from './pages/IndexTest';
import Poyo from './pages/Poyo';
import Top from './pages/Top';
import Category from './pages/Category';
import Item from './pages/Item';
import OrderConfirm from './pages/OrderConfirm';
import OrderIndex from './pages/OrderIndex';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import CreditCard from './pages/CreditCard';

library.add(faChevronLeft);
library.add(faPlus);
library.add(faMinus);
library.add(faTimes);

export default class App extends React.Component {
  render() {
    return (
      <Provider { ...stores }>
        <BrowserRouter>
          <Switch>
            <Route exact path='/' component={IndexTest} />
            <Route path='/poyo' component={Poyo} />
            <Route exact path='/tables/:tableId' component={Top} />
            <Route path='/tables/:tableId/categories/:categoryId' component={Category} />
            <Route path='/tables/:tableId/items/:itemId' component={Item} />
            <Route exact path='/tables/:tableId/order' component={OrderConfirm} />
            <Route exact path='/tables/:tableId/orders' component={OrderIndex} />
            <Route exact path='/tables/:tableId/pay' component={CreditCard} />
            <Redirect to="/" />
          </Switch>
        </BrowserRouter>
      </Provider>
    );
  }
}
