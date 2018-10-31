import * as React from 'react';
import { inject, observer } from 'mobx-react';
import styled from 'styled-components';
import { Order } from '../types/order';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import anime from 'animejs';
import Initializer from '../components/Initializer';

type Props = {
  itemMap: any,
  tableId: string,
  orders: Order[],
  history: any,
  match: any,
};

@inject(({ store, order }) => ({
  orders: order.orders,
  items: store.items,
  itemMap: store.itemMap,
  tableId: store.tableId,
  storeId: store.storeId,
  groupId: store.groupId,
}))
@observer
export default class OrderIndex extends React.Component<Props> {
  state = {
    showModal: false,
    canMakePayment: false,
  };

  get totalPrice() {
    return this.props.orders.reduce((sum, order) => {
      const item = this.props.itemMap[order.itemId];

      if (!item) {
        return sum;
      }

      return sum + item.price * order.count;
    }, 0);
  }

  onClickSelectPaymentMethod() {
    this.setState({ showModal: true });
  }

  render() {
    const items = this.props.orders.slice().map((order, index) => {
      const item = this.props.itemMap[order.itemId];

      if (!item) {
        return <div key={index} />;
      }

      return (
        <ListItem key={index}>
          <ItemLink to={`/tables/${this.props.tableId}/items/${item.id}`}>
            { item.name }
          </ItemLink>

          <Counter>
            x { order.count }
          </Counter>

          <Price>
            { item.price * order.count }円
          </Price>
        </ListItem>
      );
    });

    return (
      <Container>
        <Initializer match={this.props.match} />

        <Header title='注文一覧' history={this.props.history} />

        <List>
          { items }
        </List>

        <TotalPriceContainer>
          <span>小計</span>
          <span>¥{ this.totalPrice }円</span>
        </TotalPriceContainer>

        <PayButton
          style={this.state.showModal ? { display: 'none'} : {}}
          onClick={this.onClickSelectPaymentMethod.bind(this)}
        >
          お支払い方法を選択する
        </PayButton>

        { this.state.showModal && this.renderButtons() }
      </Container>
    );
  }

  renderButtons() {
    const overlayFunc = ref => {
      anime({
        targets: ref,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        easing: 'easeInSine',
        duration: 300,
      })
    };

    return (
      <Overlay onClick={ () => this.setState({ showModal: false }) } ref={overlayFunc}>
        <CloseButton onClick={ () => this.setState({ showModal: false })}>✕</CloseButton>

        <StyledLink
          to={`/tables/${this.props.tableId}/pay/applePay`}
          color='#9B9B9B'
        >
          Apple Pay or Google Pay
        </StyledLink>

        <StyledLink
          to={`/tables/${this.props.tableId}/pay/creditCard`}
          color='#4A90E2'
        >
          クレジットカード
        </StyledLink>

        <StyledLink
          to={`/tables/${this.props.tableId}/pay/linePay`}
          color='#7ED321'
        >
          LINE Pay
        </StyledLink>

        <StyledLink
          to={`/tables/${this.props.tableId}/pay/cash`}
          color='#FFFFFF'
          textcolor='#4A4A4A'
        >
          現金でお支払い
        </StyledLink>
      </Overlay>
    );
  }
}

const Container = styled.article`
  display: flex;
  flex-direction: column;
  margin-bottom: 100px;
`;

const List = styled.ul`
  width: calc(100% - 48px);
  padding: 0 24px;
  list-style: none;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const ItemLink = styled(Link)`
  flex: 1;
  color: #FF8100;
`;

const OrderName = styled.span`
  flex: 1;
  color: #FF8100;
`;

const Counter = styled.span`
  padding: 0 12px;
  color: #4A4A4A;
  background-color: #D8D8D8;
  border-radius: 24px;
  margin-right: 12px;
  width: 28px;
  text-align: center;
`;

const Price = styled.span`
  width: 58px;
  text-align: right;
  color: #4A4A4A;
`;

const TotalPriceContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 90%;
  align-self: center;
  font-size: 24px;
  font-weight: bold;
  color: #4A4A4A;
  border-bottom: 1px solid #4A4A4A;
`;

const PayButton = styled.div`
  position: fixed;
  background: #FF8100;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
  bottom: 28px;
  align-self: center;
  color: white;
  font-size: 18px;
  padding: 5px 40px;
  font-weight: bold;
  border-radius: 50px;

  &:hover {
    cursor: pointer;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  padding-bottom: 28px;
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  height: 36px;
  background-color: ${props => props.color};
  color: ${props => props.textcolor || 'white'};
  border-radius: 114px;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  font-size: 18px;
  padding: 5px auto;
  margin-bottom: 28px;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.10);
`;

const CloseButton = styled.div`
  background: #F0F0F0;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.10);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
