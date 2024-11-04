import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Tabs, Button, Modal, Descriptions } from 'antd';
import { EnvironmentOutlined, EyeOutlined, ClockCircleOutlined, PercentageOutlined, CalendarOutlined } from '@ant-design/icons';
import { ReactComponent as CouponSvg } from '../../../static/images/coupon.svg';
import request from '../../../axios/request';
import dayjs from 'dayjs';

// create coupon image
const CouponIcon = () => (
  <span style={{ marginRight: '8px' }}>
    <CouponSvg />
  </span>
);

const { TabPane } = Tabs;

const OrderModalContent = ({ order }) => {
  return (
    <Descriptions column={1} bordered>
      <Descriptions.Item label="Discount" span={3}>
        <CouponIcon />{`${order.discount}`}

        <PercentageOutlined style={{ color: 'green', marginLeft: '2px', marginRight: '10px' }} />
      </Descriptions.Item>
      <Descriptions.Item label="Valid Time" span={3}>
        <ClockCircleOutlined style={{ color: 'lightblue', marginRight: '10px' }} />
        {' '}
        {dayjs(order.end_time).format('YYYY-MM-DD')} {dayjs(order.start_time).format('HH:mm')} to {dayjs(order.end_time).format('HH:mm')}
      </Descriptions.Item>
      <Descriptions.Item label="Code" span={3}>

        <div>
          <QRCode value={order.hashcode} />
        </div>

      </Descriptions.Item>
    </Descriptions>
  );
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [merchantNames, setMerchantNames] = useState({});
  const [openingHours, setOpeningHours] = useState([]);

  const showModal = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const getVoucher = () => {
    request({
      url: '/voucher/customer/info/',
      method: 'get'
    }).then((res) => {
      setOrders(res);
    }).catch((e) => e);
  };

  const getDetail = (id) => {
    return request({
      url: '/profile/eatery/' + id,
      method: 'get'
    });
  };

  useEffect(() => {
    getVoucher();
  }, []);

  useEffect(() => {
    const fetchMerchantNames = async () => {
      const names = {};
      for (const order of orders) {
        if (!merchantNames[order.owner]) {
          const response = await getDetail(order.owner);
          // Store merchant details in merchantNames
          names[order.owner] = response;
          if (response.opening_hours.length) {
            setOpeningHours([dayjs(response.opening_hours[0]).format('HH:mm'), dayjs(response.opening_hours[1]).format('HH:mm')]);
          }
        }
      }
      setMerchantNames(names);
    };
    fetchMerchantNames();
  }, [orders]);

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const formatDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm')
  };

  const unusedOrders = orders.filter(order => order.status === 'claimed');
  const redeemedOrders = orders.filter(order => order.status === 'redeemed');

  const renderOrders = (orders, isUnused) => (
    <>
      {orders.map((order, index) => (
        <div key={index} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>

          <p><strong>{merchantNames[order.owner]?.username}</strong></p>

          <p><EyeOutlined style={{ marginRight: '8px', color: 'green' }} />{order.details}</p>
          <p><EnvironmentOutlined style={{ marginRight: '8px', color: 'orange' }} />{merchantNames[order.owner]?.address}</p>
          <p> <ClockCircleOutlined style={{ color: 'cadetblue', marginRight: '8px' }} />{openingHours.join(' - ') || 'Unknown'}</p>
          {isUnused && <Button onClick={() => showModal(order)}>View Tickets</Button>}
          {!isUnused && (
            <>

              <p><CalendarOutlined style={{ marginRight: '8px', color: 'cyan' }} />Redeemed on <span style={{ color: '#d36b6c', fontWeight: 'bolder' }}>{formatDate(order.redeemTime)}</span></p>
            </>
          )}
        </div>
      ))}
    </>
  );

  return (
    <div style={{ width: '90%', padding: '20px', margin: '0 auto' }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Available" key="1">
          {renderOrders(unusedOrders, true)}
        </TabPane>
        <TabPane tab="Redeemed" key="2">
          {renderOrders(redeemedOrders, false)}
        </TabPane>
      </Tabs>
      <Modal
        title={<><CalendarOutlined style={{ color: 'cyan', marginRight: '8px' }} />Order Details</>}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <OrderModalContent order={selectedOrder} />
      </Modal>
    </div>
  );
};

export default OrderHistory;
