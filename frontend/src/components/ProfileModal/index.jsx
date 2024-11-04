import * as React from 'react';
import {message, Modal, Descriptions, Form, Input, Select, Space, TimePicker, Switch, Upload} from 'antd';
import request from '../../axios/request';
import { cuisineTypes } from '../constants';
import loadGoogleMapsScript from '../GoogleMapsComponent/loadGoogleMapsScript';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import styled from 'styled-components';
import {PlusOutlined} from '@ant-design/icons';

dayjs.extend(customParseFormat);

const AvatarContent = styled('div')(() => ({
  textAlign: 'center'
}));

export default function ProfileModal (props) {
  const userType = localStorage.getItem('userType');
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');
  const address = localStorage.getItem('address');
  const isPublic = localStorage.getItem('is_public') === 'true';
  const isSubscribed = localStorage.getItem('is_subscribed') === 'true';
  const avatar = localStorage.getItem('avatar');
  let openingHours = [];
  let openingHoursStr = '';
  let preferences = [];
  let cuisine = [];
  if (userType === 'eatery') {
    try {
      cuisine = JSON.parse(localStorage.getItem('cuisine')) || [];
      openingHours = JSON.parse(localStorage.getItem('opening_hours') || []);
      openingHours = openingHours.map((item) => dayjs(item));
      openingHoursStr = openingHours.length ? dayjs(openingHours[0]).format('HH:mm') + ' - ' + dayjs(openingHours[1]).format('HH:mm') : '';
    } catch (e) {}
  } else {
    try {
      preferences = JSON.parse(localStorage.getItem('preferences')) || [];
    } catch (e) {}
  }
  const [form] = Form.useForm();
  const [status, setStatus] = React.useState(props.status);
  const [isEdit, setIsEdit] = React.useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const defaultFileList = avatar
    ? [
        {
          id: '0',
          url: avatar
        }
      ]
    : [];
  const [fileList, setFileList] = React.useState(defaultFileList);
  const uploaderProps = {
    listType: 'picture-circle',
    maxCount: 1,
    accept: 'image/png, image/jpeg, image/jpg, image/gif',
    fileList,
    beforeUpload (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const url = typeof reader.result === 'string' ? reader.result : '';
        Object.assign(file, {
          url
        });
        setFileList([file]);
        save({
          avatar: url
        }, true);
      };
      reader.onerror = () => {
        setFileList([...fileList, file]);
      }
      return false;
    },
    onRemove: () => {
      setFileList([]);
    }
  };

  React.useEffect(() => {
    setStatus(props.status);
  }, [props.status]);

  const handleOk = () => {
    if (isEdit) {
      form.validateFields().then(
        () => {
          const data = form.getFieldsValue() || null;
          save(data);
        },
        () => {
          messageApi.error('Please fill all required fields');
        }
      );
    } else {
      setIsEdit(true);
    }
  }

  const save = (data, isAvatar = false) => {
    if (!data) {
      return;
    }
    request({
      url: `/profile/${userType}/edit`,
      method: 'PUT',
      data
    }).then((res) => {
      if (!isAvatar) {
        localStorage.setItem('username', data.username || '');
        if (userType === 'user') {
          localStorage.setItem('preferences', JSON.stringify(data.preferences || []));
        } else {
          localStorage.setItem('address', data.address || '');
          localStorage.setItem('cuisine', JSON.stringify(data.cuisine || []));
          localStorage.setItem('opening_hours', JSON.stringify(res.opening_hours || []));
          localStorage.setItem('is_public', data.is_public || false);
          localStorage.setItem('is_subscribed', data.is_subscribed || false);
        }
        setIsEdit(false);
      } else {
        localStorage.setItem('avatar', res.avatar || '');
        props.onAvatarChanged(res.avatar);
      }
    }).catch((_e) => _e);
  }

  const handleCancel = () => {
    form.resetFields();
    if (isEdit) {
      setIsEdit(false);
    } else {
      setStatus(false);
    }
  }

  const handlerOpenChange = (open) => {
    props.onHide(open);
    if (!open) {
      setIsEdit(false);
      form.resetFields();
    }
  }

  const customerItems = [
    {
      key: '1',
      label: 'UserName',
      children: username,
    },
    {
      key: '2',
      label: 'Email',
      children: email,
    },
    {
      key: '3',
      label: 'Preference',
      children: preferences.join(', '),
    }
  ]

  const eateryItems = [
    {
      key: '1',
      label: 'Name',
      children: username,
    },
    {
      key: '2',
      label: 'Address',
      children: address,
    },
    {
      key: '3',
      label: 'Cuisine',
      children: cuisine.join(', '),
    },
    {
      key: '4',
      label: 'Opening hours',
      children: openingHoursStr,
    },
    {
      key: '5',
      label: 'Status',
      children: isPublic ? 'Online' : 'Offline'
    },
    {
      key: '6',
      label: 'Subscribe',
      children: isSubscribed ? 'Subscribed' : 'Unsubscribed'
    }
  ]

  const items = userType === 'eatery' ? eateryItems : customerItems;

  const customerDefaultValues = {
    username,
    preferences
  }

  const eateryDefaultValues = {
    username,
    address,
    cuisine,
    opening_hours: openingHours,
    is_public: isPublic,
    is_subscribed: isSubscribed
  }

  const CustomerForm = () => {
    return (
      <Form
        horizontal
        form={form}
        initialValues={customerDefaultValues}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input the username' }]}
        >
          <Input placeholder="Please input the username" />
        </Form.Item>
        <Form.Item
          label="Preference"
          name="preferences"
          rules={[{ required: true, message: 'Please select your preference' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select your preference"
            optionLabelProp="label"
            options={cuisineTypes}
            optionRender={(option) => (
              <Space>
                {option.data.label}
              </Space>
            )}
          />
        </Form.Item>
      </Form>
    )
  }

  const EateryForm = () => {
    React.useEffect(() => {
      const addressField = form.getFieldInstance('address');
      loadGoogleMapsScript(() => {
        if (!addressField.input) return;
        const autocomplete = new window.google.maps.places.Autocomplete(
          addressField.input,
          {types: ['geocode'], componentRestrictions: {country: 'au'}} // restrict to au
        );
        autocomplete.setFields(['address_components', 'geometry', 'icon', 'name', 'formatted_address']);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          form.setFieldsValue({
            address: place.formatted_address
          });
          addressField.input.value = place.formatted_address;
        });
      });
    }, [form]);
    return (
      <Form
        horizontal
        form={form}
        initialValues={eateryDefaultValues}
      >
        <Form.Item
          label="Name"
          name="username"
          rules={[{ required: true, message: 'Please input the name' }]}
        >
          <Input placeholder="Please input the username" />
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Please input the address' }]}
        >
          <Input
            type="text"
            placeholder="Please input the address"
            style={{ width: '100%', maxWidth: '600px' }}
          />
        </Form.Item>
        <Form.Item
          label="Cuisine"
          name="cuisine"
          rules={[{ required: true, message: 'Please select the cuisines' }]}
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
          label="Opening Hours"
          name="opening_hours"
          rules={[{ required: true, message: 'Please select the opening hours' }]}
        >
          <TimePicker.RangePicker format={'HH:mm'} />
        </Form.Item>
        <Form.Item
          label="Status"
          name="is_public"
          valuePropName="checked"
        >
          <Switch checkedChildren="Online" unCheckedChildren="Offline" />
        </Form.Item>
        <Form.Item
          label="Subscribe"
          name="is_subscribed"
          valuePropName="checked"
        >
          <Switch checkedChildren="Subscribed" unCheckedChildren="Unsubscribed" />
        </Form.Item>
      </Form>
    )
  }

  return (
    <>
      {contextHolder}
      <Modal
        title="Profile"
        open={status}
        okText={isEdit ? 'Save' : 'Edit'}
        onOk={handleOk}
        onCancel={handleCancel}
        afterOpenChange={handlerOpenChange}
        width={720}
      >
        {
          isEdit
            ? (userType === 'user' ? <CustomerForm /> : <EateryForm />)
            : <>
              <AvatarContent>
                <Upload {...uploaderProps}>
                  <div>
                    <PlusOutlined />
                    <div>Upload</div>
                  </div>
                </Upload>
              </AvatarContent>
              <Descriptions layout="vertical" items={items} column={1} />
            </>
        }
      </Modal>
    </>
  )
}
