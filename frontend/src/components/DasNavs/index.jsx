import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, ConfigProvider } from 'antd';
import styled from 'styled-components';
import defaultAvatar from '../../static/images/default-avatar.png';
import request from '../../axios/request';
import ProfileModal from '../ProfileModal';
import LogoAvatar from '../../static/images/logo.jpg';
import { resetStorage } from '../../utils/utils';
import RedeemModal from '../RedeemModal';

const { Header } = Layout;

const Logo = styled('div')({
  cursor: 'pointer',
  '& img': {
    width: '160px'
  }
});

const UserTypeTag = styled('div')({
  fontWeight: '500',
  marginLeft: '16px',
  fontSize: '18px',
  position: 'relative',
  '&:before': {
    content: '""',
    background: '#333',
    width: '2px',
    display: 'block',
    height: '60%',
    position: 'absolute',
    top: '20%'
  },
  '& span': {
    paddingLeft: '16px'
  }
});

const StyledHeader = styled(Header)(() => ({
  borderBottom: '1px solid #eee',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const StyledMenu = styled(Menu)({
  flex: '1',
  justifyContent: 'end',
  background: '#fedc00'
});

const StyledDropdown = styled(Dropdown)(() => ({
  display: 'flex',
}));

const StyledAvatar = styled(Avatar)(() => ({
  cursor: 'pointer',
}));

export default function DasNavs (props) {
  const navigate = useNavigate();
  let token = localStorage.getItem('token');
  const toHome = () => {
    navigate('/eateryLists');
  }

  const userType = localStorage.getItem('userType');
  const [avatar, setAvatar] = React.useState(defaultAvatar);
  const eateryDetailsFetch = () => {
    request({
      url: `/profile/${userType}/info`,
      method: 'GET',
    }).then((res) => {
      localStorage.setItem('username', res.username || '');
      localStorage.setItem('userId', res.userId || '');
      localStorage.setItem('avatar', res.avatar || '');
      setAvatar(res.avatar);
      if (userType === 'user') {
        localStorage.setItem('preferences', JSON.stringify(res.preferences || []));
      } else {
        localStorage.setItem('address', res.address || '');
        localStorage.setItem('cuisine', JSON.stringify(res.cuisine || []));
        localStorage.setItem('is_public', res.is_public || false);
        localStorage.setItem('is_subscribed', res.is_subscribed || false);
        localStorage.setItem('opening_hours', JSON.stringify(res.opening_hours || []));
      }
    }).catch((e) => {
      console.log(e);
    });
  }
  React.useEffect(() => {
    if (userType && localStorage.getItem('token')) {
      eateryDetailsFetch();
    }
  }, []);

  let items;
  const menuItems = [];

  if (userType === 'eatery') {
    menuItems.push({
      label: 'Menu',
      key: 'menu',
    }, {
      label: 'Redeem',
      key: 'redeem',
    });
  } else {
    menuItems.push({
      label: 'Dashboard',
      key: 'eateryLists',
    });
  }

  if (token) {
    items = [
      {
        label: localStorage.getItem('email'),
        key: 'email'
      },
      {
        label: 'Profile',
        key: 'profile'
      }
    ];
    if (userType === 'eatery') {
      items = [
        ...items,
        {
          label: 'Menu',
          key: 'menu'
        },
        {
          label: 'Voucher',
          key: 'vouchersSeting'
        }
      ]
    } else if (userType === 'user') {
      items = [
        ...items,
        {
          label: 'Review',
          key: 'review'
        },
      ]
    }
    items = [
      ...items,
      {
        type: 'divider',
      },
      {
        label: 'Logout',
        key: 'logout',
      }
    ]
  } else {
    items = [
      {
        label: 'Sign up',
        key: 'register',
      },
      {
        label: 'Login',
        key: 'login',
      }
    ];
  }
  /*
  const logout = () => {
    request({
      url: '/user/auth/logout',
      method: 'POST',
    }).then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      navigate('/');
    }).catch((e) => {
      console.log(e);
    });
  } */
  const logout = () => {
    resetStorage();
    token = null;
    navigate('/login');
  }

  const onDropdownMenuClick = (e) => {
    if (e.key === 'logout') {
      logout();
      return;
    }
    if (e.key === 'email') {
      return;
    }
    if (e.key === 'profile') {
      setIsProfileModalOpened(true);
      return;
    }
    if (e.key === 'review') {
      navigate('/' + 'customerReviews');
      return;
    }
    navigate('/' + e.key);
  };

  const onMenuClick = (e) => {
    if (e.key === 'redeem') {
      setIsRedeemModalOpened(true);
    } else {
      navigate('/' + e.key);
    }
  };

  const onProfileModalHide = (status) => {
    setIsProfileModalOpened(status);
  }

  const onRedeemModalHide = (status) => {
    setIsRedeemModalOpened(status);
  }

  const [currentPage, setCurrentPage] = React.useState('');
  const [isProfileModalOpened, setIsProfileModalOpened] = React.useState(false);
  const [isRedeemModalOpened, setIsRedeemModalOpened] = React.useState(false);

  React.useEffect(() => {
    setCurrentPage(props.selected || '');
  }, [props]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerBg: '#fedc00'
          },
        },
      }}
    >
      <StyledHeader>
        <Logo onClick={toHome}>
          <img src={LogoAvatar} alt="binchicken Logo" />
        </Logo>
        <UserTypeTag>
          {
            userType
              ? <span>{userType === 'eatery' ? 'Eatery' : 'Customer'}</span>
              : ''
          }
        </UserTypeTag>
        <StyledMenu onClick={onMenuClick} mode="horizontal" items={menuItems} selectedKeys={currentPage ? [currentPage] : []} />
        <StyledDropdown menu={{ items, onClick: onDropdownMenuClick }}>
          <StyledAvatar
            size={40}
            src={avatar}
          />
        </StyledDropdown>
        <ProfileModal status={isProfileModalOpened} onHide={(open) => { onProfileModalHide(open) }} onAvatarChanged={(avatar) => { setAvatar(avatar) }}></ProfileModal>
        <RedeemModal status={isRedeemModalOpened} onHide={(open) => { onRedeemModalHide(open) }}></RedeemModal>
      </StyledHeader>
    </ConfigProvider>
  );
}
