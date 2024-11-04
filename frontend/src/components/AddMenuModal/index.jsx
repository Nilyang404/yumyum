import * as React from 'react';
import {message, Modal, Form, Input, InputNumber, Upload, Image} from 'antd';
import request from '../../axios/request';
import {PlusOutlined} from '@ant-design/icons';
import styled from 'styled-components';

const PreviewImage = styled(Image)({
  display: 'none'
});

export default function AddMenuModal (props) {
  const [form] = Form.useForm();
  const [status, setStatus] = React.useState(props.status);
  const [isSuccess, setIsSuccess] = React.useState(props.status);
  const [params, setParams] = React.useState({});
  const [image, setImage] = React.useState(null);
  const [fileList, setFileList] = React.useState([]);
  const [previewImage, setPreviewImage] = React.useState('');
  const [showPreviewer, setShowPreviewer] = React.useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const uploaderProps = {
    listType: 'picture-card',
    maxCount: 1,
    fileList,
    accept: 'image/png, image/jpeg, image/jpg, image/gif',
    beforeUpload (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const url = typeof reader.result === 'string' ? reader.result : '';
        Object.assign(file, {
          url
        });
        setImage(url);
        setFileList([
          ...fileList,
          file
        ]);
      };
      reader.onerror = () => {
        setFileList([...fileList, file]);
      }
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setImage('');
    },
    onPreview: (file) => {
      setPreviewImage(file.url || file.thumbUrl || '');
      setShowPreviewer(true);
    }
  };

  React.useEffect(() => {
    setStatus(props.status);
    if (props.status) {
      form.setFieldsValue(props.params || {});
      setParams(props.params || {});
      if (props?.params?.image) {
        setFileList([{
          id: '0',
          url: props?.params?.image
        }]);
        setImage(props?.params?.image || '');
      }
    } else {
      form.resetFields();
    }
  }, [props.status]);

  const handleOk = () => {
    form.validateFields().then(
      () => {
        const data = form.getFieldsValue() || null;
        save({
          name: data.name,
          price: data.price,
          description: data.description,
          image
        }, params._id || null);
      },
      () => {
        messageApi.error('Please fill all required fields');
      }
    );
  }

  const save = (data, id) => {
    if (!data) {
      return;
    }
    if (id) {
      request({
        url: `/menu/eatery/edit/${id}`,
        method: 'put',
        data
      }).then((res) => {
        handleCancel();
        setIsSuccess(true);
        messageApi.info(res.message);
      }).catch((_e) => _e);
    } else {
      request({
        url: '/menu/eatery/add',
        method: 'post',
        data
      }).then((res) => {
        handleCancel();
        setIsSuccess(true);
      }).catch((_e) => _e);
    }
  }

  const resetData = () => {
    form.resetFields();
    setImage(null);
    setFileList([]);
  }

  const handleCancel = () => {
    resetData();
    setStatus(false);
  }

  const handlerOpenChange = (open) => {
    props.onHide(open, isSuccess);
    setIsSuccess(false);
    if (!open) {
      resetData();
    }
  }

  return (
    <>
      {contextHolder}
      <PreviewImage
        width={200}
        preview={{
          visible: showPreviewer,
          src: previewImage,
          onVisibleChange: (value) => {
            setShowPreviewer(value);
          },
        }}
      />
      <Modal
        title="Add Menu Item"
        open={status}
        okText="Save"
        onOk={handleOk}
        onCancel={handleCancel}
        afterOpenChange={handlerOpenChange}
        width={720}
      >
        <Form
          horizontal
          form={form}
          labelCol={{ span: 4 }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the name' }]}
          >
            <Input placeholder="Please input the name" />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please input the price' }]}
          >
            <InputNumber placeholder="Please input the price" prefix="$" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the description' }]}
          >
            <Input.TextArea rows={4} placeholder="Please input the description" />
          </Form.Item>
          <Form.Item
            label="Image"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={ (e) => e }
            getValueProps={ (e) => e }
            rules={[{
              required: true,
              validator: async (_rule, value) => {
                if (!fileList?.length) {
                  throw new Error('Please upload one image');
                }
              }
            }]}
          >
            <Upload {...uploaderProps}>
              <div>
                <PlusOutlined />
                <div>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
