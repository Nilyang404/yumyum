import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../../../axios/request';
import { cuisineTypes } from '../../constants';
import {
  UnorderedListOutlined,
  LoginOutlined,
  LogoutOutlined,
  SelectOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  Breadcrumb,
  Layout,
  Menu,
  theme,
  Space,
  Table,
  Tag,
  Typography,
  Card,
  Input,
  Rate,
  Button,
  Collapse,
  Select,
  TimePicker,
  Slider,
  Row,
  Col,
  Form
} from 'antd';

import binchickenLogo from '../../../static/images/binchicken.png';
import hotIcon from '../../../static/images/hot_tr.png';
import newIcon from '../../../static/images/new.png';
import loadGoogleMapsScript from '../../GoogleMapsComponent/loadGoogleMapsScript';
import ChatBot from '../../ChatBot/index';
import { resetStorage } from '../../../utils/utils';
import styled from 'styled-components';
dayjs.extend(customParseFormat);
const { Content, Footer, Sider } = Layout;

const PageLayout = styled(Layout)({
  overflow: 'hidden',
  height: 'calc(100vh - 64px)'
});

const PageSider = styled(Sider)({
  height: 'calc(100vh - 64px)',
  '> .ant-layout-sider-children': {
    display: 'flex',
    flexDirection: 'column'
  }
});

const PageContent = styled(Content)({
  overflowY: 'scroll'
});

const eateryDetailsPage = () => {
  const [eateries, setEateries] = React.useState([]);
  const [recommendedEateries, setRecommendedEateries] = React.useState([]);
  const eateryDetailsFetch = (searchQuery) => {
    request({
      url: '/search/eatery',
      method: 'GET',
      params: searchQuery
    }).then((res) => {
      const firstPageEateries = res.filter(eatery => eatery.is_public === true);
      setEateries(firstPageEateries);
    }).catch((e) => {
      console.log(e);
    });
  }
  const recommendedEateryDetailsFetch = () => {
    request({
      url: '/recommendation',
      method: 'GET',
    }).then((res) => {
      setRecommendedEateries(res);
    }).catch((e) => {
      console.log(e);
    });
  }
  const { Search } = Input;
  const latLngRef = React.useRef({ lat: '', lng: '' });
  const [triggerRequest, setTriggerRequest] = useState(false);
  const [queryInfo, setQueryInfo] = useState({
    keywords: '',
    cuisineType: [],
    lat: '',
    lng: '',
    distance: 50,
  });

  useEffect(() => {
    eateryDetailsFetch(queryInfo);
    recommendedEateryDetailsFetch();
  }, []);
  const handleSetClick = (values) => {
    let lat = latLngRef.current.lat;
    let lng = latLngRef.current.lng;
    if (!values.address) {
      lat = '';
      lng = '';
    }
    const queryinfo = {
      keywords: '',
      cuisineType: values.cuisine,
      lat,
      lng,
      distance: values.distance,
    };

    setQueryInfo(queryinfo);
    setTriggerRequest(true);
  };
  const handleSearch = (value) => {
    setQueryInfo(prevState => ({
      ...prevState,
      keywords: value
    }));
    setTriggerRequest(true);
  };
  useEffect(() => {
    if (triggerRequest) {
      eateryDetailsFetch(queryInfo);
      setTriggerRequest(false);
    }
  }, [triggerRequest]);
  // =====================================================================================
  const slidermarks = {
    50: 'unlimit',
  };
  // =====================================================================================
  const { Panel } = Collapse;
  // ========================================================================================
  function getItem (label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label,
    };
  }
  let token = localStorage.getItem('token');
  let menuItems;
  let funcItems;
  if (token) {
    menuItems = [
      getItem('Order Lists', '1', <UnorderedListOutlined />),
    ];
    funcItems = [
      getItem('Logout', '3', <LogoutOutlined />),
    ]
  } else {
    menuItems = [];
    funcItems = [
      getItem('Login', '4', <LoginOutlined />),
      getItem('Sign Up', '5', <SelectOutlined />),
    ]
  }
  const handleMenuClick = (item) => {
    switch (item.key) {
      case '1':
        navigate('/orderList');
        break;
      case '2':
        break;
      case '3':
        resetStorage();
        token = null;
        navigate('/eateryLists');
        break;
      case '4':
        navigate('/login');
        break;
      case '5':
        navigate('/register');
        break;
    }
  }
  const Column = Table;
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const toDetailEatery = (eateryId) => {
    navigate(`/eateryDetails/${eateryId}`);
  }
  // ============================================================================================
  const convertEateriesToData = (eateries) => {
    const data = eateries.map((eatery, index) => ({
      key: (index + 1).toString(),
      name: eatery.username,
      rating: eatery.rating_quantity === 0 ? 0 : eatery.rating_average,
      avatar: eatery.avatar,
      address: eatery.address,
      tags: eatery.cuisine,
      eateryId: eatery.userId,
    }));
    return data;
  }
  // ============================================================================================
  const { Meta } = Card;
  const RecommendedEateries = ({ eateries }) => {
    return eateries.map((eatery, index) => (
      <Col key={index} span={8}>
        <Card
          style={{ flex: 1, height: '100%', position: 'relative' }}
          cover={
            <>
              <img
                style={{ height: 300, width: '100%', objectFit: 'cover', objectPosition: 'center' }}
                alt={eatery.name}
                src={eatery.avatar}
              />
              <img
                src={index < 2 ? hotIcon : newIcon}
                alt="icon"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100px',
                  width: '100px',
                }}
              />
            </>
          }
          onClick={() => toDetailEatery(eatery.eateryId)}
        >
          <Meta
            title={eatery.name}
          />
          <div>
            <p>Location: {eatery.address}</p>
          </div>
          <Rate disabled allowHalf value={eatery.rating} /><br />
          {eatery.tags.map(tag => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </Card>
      </Col>
    ));
  }
  const data = convertEateriesToData(eateries);
  const recommendedData = convertEateriesToData(recommendedEateries);
  // -----------------------------------------------------------------------------------------
  const [form] = Form.useForm();
  const FilterForm = () => {
    React.useEffect(() => {
      const addressField = form.getFieldInstance('address');
      loadGoogleMapsScript(() => {
        if (!addressField.input) return;
        const autocomplete = new window.google.maps.places.Autocomplete(
          addressField.input,
          { types: ['geocode'], componentRestrictions: { country: 'au' } } // restrict to au
        );
        autocomplete.setFields(['address_components', 'geometry', 'icon', 'name', 'formatted_address']);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          form.setFieldsValue({
            address: place.formatted_address
          });
          addressField.input.value = place.formatted_address;
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          latLngRef.current = { lat, lng };
        });
      });
    }, [form]);
    return (
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSetClick}
        initialValues={{
          cuisine: [],
          address: '',
          distance: 50,
          timeRange: ['', ''],
        }}
      >
        <Form.Item
          label="Cuisine"
          name="cuisine"
        >
          <Select
            mode="multiple"
            placeholder="Select the cuisines"
            optionLabelProp="label"
            options={cuisineTypes}
            optionRender={(option) => (
              <Space>
                {option.data.label}
              </Space>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
        >
          <Input
            type="text"
            placeholder="Please input the address"
            style={{ width: '100%', maxWidth: '600px' }}
          />
        </Form.Item>

        <Form.Item
          label="Distance"
          name="distance"
        >
          <Slider
            marks={slidermarks}
            step={1}
            min={1}
            max={50}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">Set</Button>
        </Form.Item>
      </Form>
    )
  }
  // ==============================================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <PageLayout>
      <PageSider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <img style={{ maxWidth: '80%', margin: '50px 0' }} src={binchickenLogo} alt="binchicken Logo" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: '1' }}
        />
        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={funcItems}
          onClick={handleMenuClick}
        />
      </PageSider>
      <PageContent>
        <div
          style={{
            padding: '0',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div style={{
            padding: '8px'
          }}>
            <Search
              placeholder="keywords..."
              onSearch={handleSearch}
              size='large'
              enterButton="Search"
              style={{ minWidth: 300 }}
            />
          </div>
          <div style={{ width: '100%' }}>
            <Collapse style={{ width: '100%' }} bordered={false}>
              <Panel header="Set filter" key="1">
                <FilterForm />
              </Panel>
            </Collapse>
          </div>
        </div>
        <Content
          style={{
            margin: '0 16px',
          }}
        >
          <Breadcrumb
            style={{
              margin: '16px 0',
            }}
          >
            {/* <Breadcrumb.Item>Eatery Lists</Breadcrumb.Item> */}
          </Breadcrumb>
          <div
            style={{
              padding: 24,
              minHeight: 100,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Typography.Title level={4}>Recommended Eatery</Typography.Title>
            <Row
              gutter={[16, 24]}
              style={{
                padding: '16px 6px',
                minHeight: 100,
                background: '#ffcc1e',
                borderRadius: borderRadiusLG,
                alignItems: 'stretch'
              }}
            >
              <RecommendedEateries eateries={recommendedData} />
            </Row>
          </div>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Table
              dataSource={data}
              pagination={{
                pageSize,
                current: currentPage,
                pageSizeOptions: ['5', '10', '20', '30'],
                showQuickJumper: true,
                showSizeChanger: true
              }}
              onChange={handleTableChange}
            >
              <Column
                title="Avatar"
                dataIndex="avatar"
                key="avatar"
                render={(text) => <img src={text} alt="avatar" style={{ height: '50px', width: '50px', objectFit: 'cover', objectPosition: 'center' }} />}
              />
              <Column title="Name" dataIndex="name" key="name" />
              <Column
                title="Avg Rating"
                dataIndex="rating"
                key="rating"
                render={(rating) => (
                  <>
                    <Rate disabled allowHalf value={rating} /><br />
                  </>
                )}
              />
              <Column title="Address" dataIndex="address" key="address" />
              <Column
                title="Tags"
                dataIndex="tags"
                key="tags"
                render={(tags) => (
                  <>
                    {tags.map((tag) => (
                      <Tag color="blue" key={tag}>
                        {tag}
                      </Tag>
                    ))}
                  </>
                )}
              />
              <Column
                title="Action"
                key="action"
                render={(_, record) => {
                  const { eateryId } = record;
                  return (
                    <Space size="middle">
                      <a onClick={() => toDetailEatery(eateryId)}>View</a>
                    </Space>
                  );
                }}
              />
            </Table>
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          YumYum ©{new Date().getFullYear()} Created by BinChicken
        </Footer>
      </PageContent>
      <ChatBot />
    </PageLayout>
  );
};
export default eateryDetailsPage;
