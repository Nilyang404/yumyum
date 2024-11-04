import * as React from 'react';
import {message, Modal, Form, Input, InputNumber, Typography, Upload, Button, Select, Space} from 'antd';
import request from '../../axios/request';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
const jsQR = require('jsqr');

dayjs.extend(customParseFormat);
dayjs.extend(utc);
const { Text } = Typography;

export default function RedeemModal (props) {
  const [form] = Form.useForm();
  const [status, setStatus] = React.useState(props.status);
  const [discountedPrice, setDiscountedPrice] = React.useState(null);
  const [discountPercentage, setDiscountPercentage] = React.useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = React.useState([]);
  const [menuList, setMenuList] = React.useState([]);

  React.useEffect(() => {
    setStatus(props.status);
    form.resetFields();
    if (props.status) {
      getMenuList();
    }
  }, [props.status]);

  React.useEffect(() => {
    getDiscountPrice();
  }, [discountPercentage]);

  const handleOk = () => {
    form.validateFields().then(
      () => {
        const data = form.getFieldsValue() || null;
        save(data.id);
      },
      () => {
        messageApi.error('Please fill all required fields');
      }
    );
  }

  const save = (id) => {
    if (!id) {
      return;
    }
    request({
      url: `/voucher/redeem/${id}`,
      method: 'put',
      data: {
        current_time: dayjs().utc().format()
      }
    }).then((res) => {
      handleCancel();
    }).catch((_e) => _e);
  }

  const resetData = () => {
    form.resetFields();
    setDiscountPercentage(null);
    setDiscountedPrice(null);
  }

  const handleCancel = () => {
    resetData();
    setStatus(false);
  }

  const handlerOpenChange = (open) => {
    props.onHide(open);
    if (!open) {
      resetData();
    }
  }

  const getVoucherInfo = () => {
    const id = form.getFieldValue('id');
    if (!id) {
      setDiscountPercentage(null);
      setDiscountedPrice(null);
      return;
    }
    request({
      url: `/voucher/info/single/${id}`,
      method: 'get'
    }).then((res) => {
      setDiscountPercentage(res.discount);
    }).catch((_e) => _e);
  }

  const getMenuList = () => {
    const userId = localStorage.getItem('userId');
    request({
      url: '/menu/eatery/info/' + userId,
      method: 'get'
    }).then((res) => {
      for (let i = 0; i < res.length; i++) {
        res[i].index = i;
      }
      setMenuList(res);
    }).catch((e) => e);
  }

  const onMenuChanged = (e) => {
    let price = 0
    for (let i = 0; i < e.length; i++) {
      const itemIndex = e[i];
      const item = menuList[itemIndex];
      price += item.price;
    }
    form.setFieldValue('price', price);
  }

  const getDiscountPrice = () => {
    const price = form.getFieldValue('price');
    if (price && discountPercentage) {
      setDiscountedPrice((parseFloat(price) * (100 - discountPercentage) * 0.01).toFixed(2));
    } else {
      setDiscountedPrice(null);
    }
  }

  const uploaderProps = {
    maxCount: 1,
    fileList,
    accept: 'image/png, image/jpeg, image/jpg, image/gif',
    beforeUpload (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const ret = jsQR(imageData.data, canvas.width, canvas.height)?.data;
          if (ret) {
            form.setFieldValue('id', ret);
            getVoucherInfo(ret);
          } else {
            messageApi.error('Unable to recognise the qrcode');
          }
        };
        image.src = event.target.result;
      };
      reader.readAsDataURL(file);
      return false;
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Redeem Voucher"
        open={status}
        okText="Redeem"
        onOk={handleOk}
        onCancel={handleCancel}
        afterOpenChange={handlerOpenChange}
        width={720}
      >
        <div style={{textAlign: 'center', marginBottom: '16px'}}>
          <Upload {...uploaderProps}>
            <Button>Choose the qrcode picture</Button>
          </Upload>
        </div>
        <Form
          horizontal
          form={form}
          labelCol={{ span: 6 }}
        >
          <Form.Item
            label="Voucher code"
            name="id"
            rules={[{ required: true, message: 'Please input the voucher code' }]}
          >
            <Input placeholder="Please scan the qrcode to get the voucher code" onBlur={getVoucherInfo} disabled />
          </Form.Item>
          <Form.Item
            label="Menu"
            name="menu"
          >
            <Select
              mode="multiple"
              placeholder="You can select the menu items in this order"
              optionLabelProp="name"
              options={menuList}
              fieldNames={{
                label: 'name',
                value: 'index'
              }}
              onChange={onMenuChanged}
              optionRender={(option) => (
                <Space>
                  {option.data.name}
                </Space>
              )}
              disabled={!menuList.length}
            />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please input the order price' }]}
          >
            <InputNumber placeholder="Please input the order price" prefix="$" style={{ width: '100%' }} onBlur={getDiscountPrice} disabled={!!menuList.length} />
          </Form.Item>
          <Form.Item
            label="Discount percentage"
            name="discountPercentage"
          >
            {discountPercentage ? discountPercentage + '%' : <Text type="warning">Input voucher code to get the discount percentage</Text>}
          </Form.Item>
          <Form.Item
            label="Discounted price"
            name="discountedPrice"
          >
            {discountedPrice ? '$' + discountedPrice : <Text type="warning">Input voucher code and order price to get the discounted price</Text>}
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
