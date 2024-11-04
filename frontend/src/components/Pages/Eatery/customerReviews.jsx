import React, { useState, useEffect } from 'react';
import { Rate, List, Avatar, Card, Pagination } from 'antd';
import dayjs from 'dayjs'; // Used for date formatting
import request from '../../../axios/request'; // Import path for a customized axios instance

// CustomerReviews component that displays reviews from customers
const CustomerReviews = () => {
  // State for storing the list of comments
  const [comments, setComments] = useState([]);
  // State for tracking the current page of the pagination
  const [currentPage, setCurrentPage] = useState(1);
  // State to handle loading status when fetching data
  const [loading, setLoading] = useState(false);
  // Number of comments to be shown per page
  const pageSize = 5;

  // Helper function to format date using dayjs
  const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm');

  // Function to fetch comments from the server
  const fetchComments = () => {
    setLoading(true);
    request({
      url: '/user/comments',
      method: 'get'
    }).then((res) => {
      setLoading(false);
      if (res && Array.isArray(res)) {
        setComments(res);
      } else {
        console.error('Invalid or no data received', res);
        setComments([]);
      }
    }).catch((e) => {
      setLoading(false);
      console.error('Failed to fetch comments:', e);
      setComments([]);
    });
  };

  // Effect hook to fetch comments on component mount
  useEffect(() => {
    fetchComments();
  }, []);

  // Handler for page change in pagination
  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  // Compute the current comments to display based on pagination
  const currentComments = comments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Render the component
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="Customer Reviews">
        {loading
          ? (
            <p>Loading comments...</p>
            )
          : (
            <List
              itemLayout="horizontal"
              dataSource={currentComments}
              renderItem={comment => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={comment.eatery.avatar || 'fallback-avatar-url'} />}
                    title={comment.eatery.username || ' '}
                    description={
                      <>
                        {comment.text}
                        <br />
                        <small>Updated at: {formatDate(comment.updatedAt)}</small>
                      </>
                    }
                  />
                  <Rate disabled value={comment.rating} />
                </List.Item>
              )}
            />
            )}
        <Pagination
          current={currentPage}
          onChange={onPageChange}
          pageSize={pageSize}
          total={comments.length}
          style={{ textAlign: 'center', marginTop: '20px' }}
        />
      </Card>
    </div>
  );
};

export default CustomerReviews;
