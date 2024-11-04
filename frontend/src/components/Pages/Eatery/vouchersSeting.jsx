import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Slider, Switch, InputNumber, DatePicker, TimePicker, Collapse } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import request from '../../../axios/request';

dayjs.extend(customParseFormat);

const { Panel } = Collapse;

const mainPartStyle = {
  height: 'calc(100vh - 64px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#001529'
};
const middlePartStyle = {
  width: '460px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white'
};
const cardStyle = {
  height: '40%',
  width: '400px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#f7f7f7',
  padding: '20px',
  margin: '10px 0',
};
const voucherDisplayStyle = {
  height: '85%',
  width: '100%',
  borderRadius: '8px',
  border: '1px solid #ddd',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  backgroundColor: 'white',
  padding: '20px',
  margin: '10px 0',
  overflowY: 'auto'
};

const VouchersSetingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [form] = Form.useForm();

  const getVouchersFetch = () => {
    request({
      url: '/voucher/eatery/info',
      method: 'GET',
    }).then((res) => {
      setVouchers(res);
    }).catch((e) => {
      console.log(e);
    });
  };
  const POSTvoucherAddFetch = (bodyinfo) => {
    request({
      url: '/voucher/add',
      method: 'POST',
      data: bodyinfo
    }).then((res) => {
      getVouchersFetch();
    }).catch((e) => {
      console.log(e);
    });
  };
  useEffect(() => {
    getVouchersFetch();
  }, []);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleDeleteVoucher = id => {
    request({
      url: `/voucher/delete/${id}`,
      method: 'DELETE',
    }).then((res) => {
      getVouchersFetch();
    }).catch((e) => {
      console.log(e);
    });
  };
  const displayHistoryVoucher = (voucher) => {
    const startTime = new Date(voucher.start_time);
    const endTime = new Date(voucher.end_time);
    const sydneyStartTime = startTime.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });
    const sydneyEndTime = endTime.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });
    const date = sydneyStartTime.split(', ')[0];
    const startTimePart = sydneyStartTime.split(', ')[1];
    const endTimePart = sydneyEndTime.split(', ')[1];
    const details = voucher.details;
    const discount = voucher.discount;
    const quantity = voucher.quantity;
    const timeRange = `${startTimePart} - ${endTimePart}`;
    const dayOfWeek = new Date(voucher.start_time).toLocaleDateString('en-US', { weekday: 'long' });
    return (
      <>
        <p>Date: {date}</p>
        <p>Day of week: {dayOfWeek}</p>
        <p>Time Range: {timeRange}</p>
        <p>Detail: {details}</p>
        <p>Discount: {discount}%</p>
        <p>Quantity: {quantity}</p>
        <Button onClick={() => handleDeleteVoucher(voucher.setid)} icon={<DeleteOutlined />} />
      </>
    );
  };
  const transformVoucher = (voucher) => {
    const date = voucher.datePick.$d;
    const startTime = voucher.timeRange[0].$d;
    const endTime = voucher.timeRange[1].$d;
    const startDateTime = dayjs(dayjs(date).format('YYYY-MM-DD') + ' ' + dayjs(startTime).format('HH:mm'));
    const endDateTime = dayjs(dayjs(date).format('YYYY-MM-DD') + ' ' + dayjs(endTime).format('HH:mm'));
    const quantity = Number(voucher.voucherQuantity);
    return {
      discount: voucher.discountRate,
      start_time: startDateTime,
      end_time: endDateTime,
      details: voucher.detailDescription,
      quantity,
      weeklyRepeat: voucher.repeatWeekly
    };
  }
  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        setIsModalOpen(false);
        form.resetFields();
        return transformVoucher(values);
      })
      .then(bodyinfo => {
        POSTvoucherAddFetch(bodyinfo);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().startOf('day');
  };
  return (
    <div style={mainPartStyle}>
      <div style={middlePartStyle}>
        <Button type="primary" onClick={showModal}>
          Add voucher
        </Button>
        <Modal title="YumYum" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
          <Form form={form} layout="vertical" initialValues={{ repeatWeekly: true, voucherQuantity: 1 }}>
            <Form.Item
              label="Discount rate"
              name="discountRate"
              rules={[{ required: true, message: 'Please input the discount rate!' }]}
            >
              <Slider />
            </Form.Item>
            <Form.Item
              label="Date"
              name="datePick"
              rules={[{ required: true, message: 'Please select the date!' }]}
            >
              <DatePicker disabledDate={disabledDate} />
            </Form.Item>
            <Form.Item
              label="Time range"
              name="timeRange"
              rules={[{ required: true, message: 'Please select the time range!' }]}
            >
              <TimePicker.RangePicker format="HH:mm" />
            </Form.Item>
            <Form.Item
              label="Repeat weekly"
              name="repeatWeekly"
              valuePropName="checked"
              rules={[{ required: true, message: 'Please specify if this should repeat weekly!' }]}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Detail description"
              name="detailDescription"
              rules={[{ required: true, message: 'Please enter a detail description!' }]}
            >
              <Input.TextArea placeholder="Enter your description" />
            </Form.Item>
            <Form.Item
              label="Voucher Quantity"
              name="voucherQuantity"
              rules={[
                { required: true, message: 'Please enter the voucher quantity!' },
                { type: 'number', min: 1, message: 'Quantity must be greater than zero!' }
              ]}
            >
              <InputNumber placeholder="Enter the quantity" min={1} />
            </Form.Item>
          </Form>
        </Modal>
        <div style={cardStyle}>
          <h2>Weekly Repeated Vouchers</h2>
          <div style={voucherDisplayStyle}>
            <Collapse accordion>
              {vouchers.length > 0 && vouchers.filter(voucher => voucher.repeated).map((voucher, index) => (
                <Panel header={`Voucher: ${voucher.discount}% Quantity:${voucher.quantity}`} key={index}>
                  {displayHistoryVoucher(voucher)}
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
        <div style={cardStyle}>
          <h2>Not Repeated Vouchers</h2>
          <div style={voucherDisplayStyle}>
            <Collapse accordion>
              {vouchers.length > 0 && vouchers.filter(voucher => !voucher.repeated).map((voucher, index) => (
                <Panel header={`Voucher: ${voucher.discount}% Quantity:${voucher.quantity}`} key={index}>
                  {displayHistoryVoucher(voucher)}
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VouchersSetingPage;
