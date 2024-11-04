import React, { useState } from 'react';
import { Button, Input, message, Avatar } from 'antd';
import styled from 'styled-components';
import { SendOutlined } from '@ant-design/icons';
import userAvatar from '../../static/images/manAva.png';
import botImg from '../../static/images/colorBinchicken.png';
import request from '../../axios/request';

const ChatIcon = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ChatWindow = styled.div`
  position: fixed;
  bottom: 60px;
  right: 20px;
  width: 400px;
  height: 400px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 10px;
  z-index: 1000;
`;

const MessageArea = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
  padding: 10px;
`;

const MessageInput = styled(Input)`
  margin-top: 10px;
`;

const MessageBubble = styled.div`
  display: flex;
  max-width: 70%;
  padding: 10px;
  border-radius: 8px;
  margin: 4px;
  color: white;
`;

const UserMessage = styled(MessageBubble)`
  background-color: #1890ff;
  margin-left: auto;
  align-items: center;
`;

const BotMessage = styled(MessageBubble)`
  background-color: #ff4d4f;
  margin-right: auto;
  align-items: center;
`;

const StyledAvatar = styled(Avatar)`
  margin: 0 4px;
`;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);

  const toggleChat = () => setIsOpen(!isOpen);
  // send msg to backend
  const sendMessage = async () => {
    if (!messageText) return;

    const newMessages = [...messages, { text: messageText, sender: 'user' }];
    setMessages(newMessages);
    setMessageText('');

    try {
      const textData = {
        text: messageText
      };

      request({
        url: '/help',
        method: 'POST',
        data: textData
      }).then((res) => {
        setMessages([...newMessages, { text: res.text, sender: 'bot' }]);
      });
    } catch (error) {
      message.error('Failed to send message');
    }
  };

  return (
    <>
      <ChatIcon>
        <Button shape="circle" icon={<SendOutlined />} size="large" onClick={toggleChat} />
      </ChatIcon>
      {isOpen && (
        <ChatWindow>
          <MessageArea>
            {messages.map((msg, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                <StyledAvatar src={msg.sender === 'user' ? userAvatar : botImg} size="large" />
                {msg.sender === 'user'
                  ? <UserMessage>{msg.text}</UserMessage>
                  : <BotMessage>{msg.text}</BotMessage>
                }
              </div>
            ))}
          </MessageArea>
          <MessageInput
            onPressEnter={sendMessage}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            suffix={<Button icon={<SendOutlined />} onClick={sendMessage} />}
          />
        </ChatWindow>
      )}
    </>
  );
};

export default ChatBot;
