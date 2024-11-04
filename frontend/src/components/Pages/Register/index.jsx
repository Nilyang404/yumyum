import React from 'react';
import request from '../../../axios/request';
import styled from 'styled-components';
import { Button, Form, Input, Flex, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import UserTypeController from '../../UserTypeController';

const RegisterPage = styled('div')({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  alignContent: 'center'
});

const RegisterPageContent = styled('div')({
  flex: '1',
  '& h1': {
    textAlign: 'center'
  }
});

const RegisterForm = styled('div')({
  margin: '32px auto',
  width: '380px',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '16px'
});

export default function registerPage () {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const [userType, setUserType] = React.useState('user');

  const SubmitButton = () => {
    const [submittable, setSubmittable] = React.useState(false);

    const values = Form.useWatch([], form);

    React.useEffect(() => {
      form.validateFields({ validateOnly: true }).then(
        () => {
          setSubmittable(true);
        },
        () => {
          setSubmittable(false);
        },
      );
    }, [values]);

    return (
      <Button type="primary" htmlType="button" block onClick={register} disabled={!submittable}>
        Register
      </Button>
    );
  };

  const onConfirmPasswordBlur = () => {
    form.validateFields({ validateOnly: true }).then(
      (e) => {
        console.log(e);
      },
      (e) => {
        if (e.values.password !== e.values.confirmPassword) {
          messageApi.error('The new password that you entered do not match');
        }
      }
    );
  }

  const register = () => {
    const values = form.getFieldsValue();
    request({
      url: `/${userType}/register`,
      method: 'POST',
      data: {
        email: values.email,
        password: values.password,
        username: values.username
      }
    }).then((res) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('userId', res.userId);
      localStorage.setItem('email', values.email);
      localStorage.setItem('userType', userType);
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        if (userType === 'eatery') {
          navigate('/menu');
        } else {
          navigate('/eateryLists');
        }
      }
    }).catch((e) => {
      console.log(e);
    });
  }

  const navigate = useNavigate();
  const location = useLocation();

  const toLogin = () => {
    navigate('/login');
  }

  const [redirectUrl, setRedirectUrl] = React.useState('');

  React.useEffect(() => {
    const redirect = new URLSearchParams(location.search).get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, []);

  return (
    <RegisterPage>
      {contextHolder}
      <RegisterPageContent>
        <h1>YumYum</h1>
        <RegisterForm>
          <UserTypeController type={userType} onChange={setUserType}></UserTypeController>
          <Form
            form={form}
            name="registerForm"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
              validateTrigger="onBlur"
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Name"
              name="username"
              rules={[{ required: true, message: 'Please input your name!' }]}
              validateTrigger="onBlur"
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
              validateTrigger="onBlur"
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Confirm password"
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!'
                },
                ({ getFieldValue }) => ({
                  validator (_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The new password that you entered do not match!'));
                  },
                })
              ]}
              validateTrigger="onBlur"
            >
              <Input.Password onBlur={onConfirmPasswordBlur} />
            </Form.Item>

            <Form.Item wrapperCol={{
              sm: { offset: 10, span: 14 }
            }}>
              <Flex vertical gap="small">
                <SubmitButton form={form} />
                <Button type="default" htmlType="button" block onClick={toLogin}>
                  Sign in
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </RegisterForm>
      </RegisterPageContent>
    </RegisterPage>
  );
}
