import React from 'react';
import request from '../../../axios/request';
import styled from 'styled-components';
import { Button, Form, Input, Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserTypeController from '../../UserTypeController';

const LoginPage = styled('div')({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  alignContent: 'center'
});

const LoginPageContent = styled('div')({
  flex: '1',
  '& h1': {
    textAlign: 'center'
  }
});

const LoginForm = styled('div')({
  margin: '32px auto',
  width: '360px',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '16px'
});

export default function loginPage () {
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
      <Button type="primary" htmlType="button" block onClick={login} disabled={!submittable}>
        Login
      </Button>
    );
  };

  const login = () => {
    const values = form.getFieldsValue();
    request({
      url: `/${userType}/login`,
      method: 'POST',
      data: values
    }).then((res) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('userId', res.userId);
      localStorage.setItem('email', values.email);
      localStorage.setItem('userType', userType);
      if (userType === 'eatery') {
        navigate('/menu');
      } else {
        navigate('/eateryLists');
      }
    }).catch((e) => {
      console.log(e);
    });
  }

  const navigate = useNavigate();

  const toRegister = () => {
    navigate('/register');
  }

  return (
    <LoginPage>
      <LoginPageContent>
        <h1>YumYum</h1>
        <LoginForm>
          <UserTypeController type={userType} onChange={setUserType}></UserTypeController>
          <Form
            form={form}
            name="loginForm"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{
              sm: { offset: 6, span: 18 }
            }}>
              <Flex vertical gap="small">
                <SubmitButton form={form} />
                <Button type="default" htmlType="button" block onClick={toRegister}>
                  Join Now
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </LoginForm>
      </LoginPageContent>
    </LoginPage>
  );
}
