import React from 'react';
import styled from 'styled-components';
import request from '../../../axios/request';
import {Button, Image, List, message} from 'antd';
import AddMenuModal from '../../AddMenuModal';

const PageContent = styled('div')({
  padding: '16px'
});

const MenuToolbar = styled('div')({
  display: 'flex',
  justifyContent: 'end'
});

const EmptyList = styled('div')({
  height: '10vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const Thumbnail = styled(Image)(() => ({
  objectFit: 'cover',
  width: '160px !important',
  height: '160px !important'
}));

export default function DasNavs (props) {
  const [isMenuModalOpened, setIsMenuModalOpened] = React.useState(false);
  const [editMenuParams, setEditMenuParams] = React.useState({});
  const [menuList, setMenuList] = React.useState([]);
  let userId = '';

  const onModalHide = (status, isSuccess) => {
    setIsMenuModalOpened(status);
    userId = localStorage.getItem('userId');
    if (isSuccess) {
      getMenuList();
    }
  }

  const openAddMenuModal = (item) => {
    setIsMenuModalOpened(true);
    setEditMenuParams(item);
  }

  const getMenuList = () => {
    if (!userId) {
      return;
    }
    request({
      url: '/menu/eatery/info/' + userId,
      method: 'get'
    }).then((res) => {
      setMenuList(res);
    }).catch((e) => e);
  }

  const deleteMenu = (id) => {
    if (!id) {
      return;
    }
    request({
      url: '/menu/eatery/delete/' + id,
      method: 'delete'
    }).then((res) => {
      message.info('Delete successful');
      const tempMenuList = menuList.filter((item) => {
        return item._id !== id
      });
      setMenuList({
        tempMenuList
      });
    }).catch((e) => e);
  }

  React.useEffect(() => {
    userId = localStorage.getItem('userId');
    getMenuList();
  }, []);

  return (
    <PageContent>
      <MenuToolbar>
        <Button type="default" htmlType="button" onClick={ () => { openAddMenuModal() } }>Add</Button>
      </MenuToolbar>
      {
        menuList.length
          ? <List
            itemLayout="horizontal"
            dataSource={menuList}
            renderItem={(item, index) => (
              <List.Item
                actions={[<Button key="list-edit" type="link" onClick={ () => { openAddMenuModal(item) } }>Edit</Button>, <Button type="link" danger key="list-delete" onClick={ () => { deleteMenu(item._id) } }>Delete</Button>]}
              >
                <List.Item.Meta
                  avatar={<Thumbnail src={item.image} />}
                  title={item.name}
                  description={item.description}
                />
                <div>${item.price}</div>
              </List.Item>
            )}
          />
          : <EmptyList>Menu has no items. Please create some items.</EmptyList>
      }
      <AddMenuModal status={isMenuModalOpened} params={editMenuParams} onHide={(open, isSuccess) => { onModalHide(open, isSuccess) }} />
    </PageContent>
  );
}
