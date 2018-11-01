import * as React from 'react';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Category } from '../types/category';
import FireStorageImage from '../components/FireStorageImage';
import MenuFooter from '../components/MenuFooter';
import { DateTime } from 'luxon';
import Initializer from '../components/Initializer';

type Props = {
  categories: Category[],
  storeName: string,
  match: any,
  tableId: string,
  enterTime: DateTime,
};

@inject(({ store }) => ({
  storeName: store.name,
  categories: store.categories,
  tableId: store.tableId,
  enterTime: store.enterTime,
}))
@observer
export default class Top extends React.Component<Props> {
  render() {
    console.log(toJS(this.props.categories));
    const items = this.props.categories.slice().map(category => (
      <CategoryPanel key={category.id} tableId={this.props.tableId} category={category} />
    ));

    return (
      <main>
        <Initializer match={this.props.match} />

        <Header>
          <StoreName>
            { this.props.storeName }
          </StoreName>

          <EnterTime>
            入店 { this.props.enterTime && this.props.enterTime.toFormat('T') }
          </EnterTime>
        </Header>

        <Main>
          { items }
        </Main>

        <MenuFooter tableId={this.props.tableId} />
      </main>
    )
  }
}

const __CategoryPanelContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const __CategoryPanelName = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  font-weight: bold;
  text-decoration: none;
  padding: 4px 0;

  &:visited {
    color: black;
    text-decoration: none;
  }
`;

const CategoryPanel = ({ tableId, category }) => (
  <Link to={`/tables/${tableId}/categories/${category.id}`} style={{ ...styles.link, boxSizing: 'border-box' }}>
    <__CategoryPanelContainer>
      <img src={category.photo.url} style={styles.image} />
      <__CategoryPanelName>{category.name}</__CategoryPanelName>
    </__CategoryPanelContainer>
  </Link>
);

const StoreName = styled.span`
  font-size: 22px;
  font-weight: bold;
`;

const EnterTime = styled.span`
  font-size: 16px;
  color: grey;
`;

const Header = styled.header`
  width: 100%;
  box-sizing: border-box;
  padding: 26px 24px;
  justify-content: space-between;
  display: flex;
  align-items: center;
  font-weight: bold;
`;

const Main = styled.main`
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 100px;
`;

const styles = {
  link: {
    marginBottom: 12,
    textDecoration: 'none',
    padding: 10,
    width: '50%',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4,
  }
}
