import React from 'react';
import styled from 'styled-components';
import { Radio } from 'antd';

const LoginTypeContent = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  '& div': {
    borderRight: '2px solid #000'
  },
  '& div:last-child': {
    borderRight: 'none'
  },
  '& .active': {
    cursor: 'default',
    color: 'inherit'
  }
});

export default function UserTypeController (props) {
  const [type, setType] = React.useState(props.type);
  const handleTypeChange = (e) => {
    setType(e.target.value);
    props.onChange(e.target.value);
  };

  return (
    <LoginTypeContent>
      <Radio.Group value={type} onChange={handleTypeChange}>
        <Radio.Button value="user">Customer</Radio.Button>
        <Radio.Button value="eatery">Eatery</Radio.Button>
      </Radio.Group>
    </LoginTypeContent>
  );
}
