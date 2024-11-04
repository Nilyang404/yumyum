import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  EnvironmentOutlined,
  StarOutlined, TagOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import {
  List,
  Avatar,
  Pagination,
  Button,
  Image,
  message,
  Space,
  Tag,
  Rate,
  Input,
  Tooltip,
  Modal,
  Divider,
  Row,
  Col,
  Card,
  Typography
} from 'antd';
import DisplayRating from '../../../components/DisplayRating/index.jsx';
import menuFood from '../../../static/images/food.png';
import discountImg from '../../../static/images/discount.png';
import request from '../../../axios/request';
import styles from './index.module.css';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

// Component to display the star rating with hover effects
const StarRating = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);

  // Function to return the color based on the rating value
  const getRateColor = (rate) => {
    if (rate <= 1) return 'red';
    if (rate <= 2) return 'orange';
    if (rate <= 3) return 'yellowgreen';
    if (rate <= 4) return 'lightgreen';
    return 'green';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
      <Rate
        value={rating}
        onChange={setRating}
        onHoverChange={setHoverRating}
        style={{ color: getRateColor(hoverRating || rating), margin: '5px' }}
      />
      {hoverRating
        ? (
          <Tooltip title={`Rating: ${hoverRating} stars`}>
            <div style={{ marginLeft: 10 }}>{hoverRating}.0</div>
          </Tooltip>
          )
        : (
          <div style={{ marginLeft: 10 }}>{rating}.0</div>
          )}
    </div>
  );
};

const EateryDetailsPage = () => {
  const { eateryId } = useParams();
  const username = localStorage.getItem('username'); // Retrieve username from local storage
  const avatar = localStorage.getItem('avatar');
  const [eateryDetails, setEateryDetails] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState([]);
  const [cuisine, setCuisine] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [voucherList, setVoucherList] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [modalVisible, setModalVisible] = useState(false);
  const [comments, setComments] = useState('');
  const [eateryAvatar, setEateryAvatar] = useState('');
  const [comid, setComid] = useState('');
  // averageRating
  const [averageRating, setAverageRating] = useState(0);
  const [ratingQuantity, setRatingQuantity] = useState(0);
  const [eateryComments, setEateryComments] = useState([]);
  // comment optimize
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(5);
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = eateryComments.slice(indexOfFirstComment, indexOfLastComment);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  // Fetch eatery details and menu items
  const getDetail = (id) => {
    request({
      url: '/profile/eatery/' + id,
      method: 'get'
    }).then((res) => {
      setName(res.username);
      setComid(res._id);
      setEateryAvatar(res.avatar);
      setAddress(res.address);
      if (res.opening_hours.length) {
        setOpeningHours([dayjs(res.opening_hours[0]).format('HH:mm'), dayjs(res.opening_hours[1]).format('HH:mm')]);
      }
      setCuisine(res.cuisine || []);
      setEateryDetails(res);
    }).catch((e) => e);
  }

  // Handle click on menu item to display its details in a modal
  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setModalVisible(true);
  };

  // Close the modal and reset selected menu item
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedMenuItem(null);
  };

  const getVouchersFetch = (id) => {
    request({
      url: '/voucher/user/' + id,
      method: 'get'
    }).then((res) => {
      setVoucherList(res);
    }).catch((e) => e);
  }
  /// eatery/comments/
  const getComments = (id) => {
    request({
      url: '/eatery/comments/' + id, // Make sure to include '/api' if it's part of the endpoint
      method: 'get'
    }).then((res) => {
      setComments(res); // Ensure you are accessing the correct property
      setAverageRating(parseFloat(res.rating_average.toFixed(1)));
      setRatingQuantity(res.rating_quantity);
      setEateryComments(res.comments);
    }).catch((e) => {
      console.error('Failed to fetch comments:');
    });
  };

  // Fetch menu list for the eatery
  const getMenus = (id) => {
    request({
      url: '/menu/eatery/info/' + id,
      method: 'get'
    }).then((res) => {
      setMenuList(res);
    }).catch((e) => e);
  }
  const submitComment = () => {
    const commentData = {
      // profileId: eateryId,
      eateryId: comid, // Make sure this ID is obtained from URL parameters or appropriate state
      text: feedback, // User-entered comment
      rating // Rating given by the user
    };

    // Print data before sending

    if (!feedback.trim() || rating === 0) {
      // Use message.error to display error message
      message.error('Please provide feedback and select a rating before submitting.');
      return; // Terminate function execution if not filled or selected
    }

    request({
      url: '/user/comments',
      method: 'post',
      data: commentData,
    })
      .then(response => {
        messageApi.open({
          type: 'success',
          content: 'Your comment has been posted successfully!',
        });
        // After successful comment submission, clear input fields
        setFeedback('');
        setRating(0);
        // After successfully submitting comments, retrieve comment data again
        getComments(comid);
      })
      .catch(error => {
        console.error(error);
        messageApi.open({
          type: 'error',
          content: 'Failed to post your comment: ' + (error.response?.data?.message || error.message)
        });
      });
  };

  useEffect(() => {
    if (comid) { // Only call getVouchersFetch if eateryId is not undefined
      getComments(comid);
    }
  }, [comid]);

  // Fetch eatery details and menu items on component mount
  useEffect(() => {
    if (eateryId) { // Only call getVouchersFetch if eateryId is not undefined
      getDetail(eateryId);
      getMenus(eateryId);
      getVouchersFetch(eateryId);
    }
  }, [eateryId]);

  if (!eateryDetails) {
    return <div>Loading...</div>;
  }

  // Handle voucher submission
  const handleSubmitVoucher = (id) => {
    request({
      url: `/voucher/claim/${id}`,
      method: 'put',
    }).then((res) => {
      messageApi.open({
        type: 'success',
        content: 'Booking confirmed!',
      });
    }).catch((error) => {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: error,
      });
    });
  }

  const formatDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm')
  };

  // Component rendering
  return (
    <div className={styles.eateryDetailsPage}>
      {contextHolder}

      <section className={styles.section1}>
        <div className={styles.section1Left}>
          <h2 className={styles.heading}>{name}</h2>
          <p className={styles.text}> <EnvironmentOutlined style={{ color: 'green', marginRight: '8px' }} />{address || ''}</p>
          <p className={styles.text}> <ClockCircleOutlined style={{ color: 'cadetblue', marginRight: '8px' }} />{openingHours.join(' - ') || ''}</p>
          <p>
            {cuisine.map((tag) => (
              <Tag color="blue" key={tag}>
                {tag}
              </Tag>
            ))}
          </p>
          <p style={{ display: 'flex', alignItems: 'center' }}> <StarOutlined style={{ marginRight: '8px' }} />{averageRating || ''} <DisplayRating style={{ margin: '0px 5px' }} rating={averageRating.toFixed(1)} />  {ratingQuantity || ''} Ratings</p>
        </div>
        <div className={styles.section1Right}>
          <img src={eateryAvatar || menuFood} alt="Eatery" className={styles.image} />
        </div>
      </section>
      {/* Menu Section */}

      <section className={styles.section}>
        <h2 className={styles.heading}>Menu</h2>
        <div className={styles.divider}></div>
        <Row gutter={[60, 15]}> {/* Adding gutters for spacing between grid items */}
          {menuList.length > 0
            ? (menuList.map((menuItem, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
                <div
                  className={styles.menuItem}
                  onClick={() => handleMenuItemClick(menuItem)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={menuItem.image || menuFood}
                    alt={menuItem.name}
                    style={{
                      width: '170px', // Make image responsive within the column
                      height: '170px', // Maintain aspect ratio
                      objectFit: 'cover',
                      borderRadius: '4px' // Optional: Adds border radius to images
                    }}
                  />

                </div>
              </Col>
              )))

            : (
              <Col span={50}><div>This eatery has no menu items.</div></Col>
              )}
        </Row>
      </section>

      {/* Popup */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>{selectedMenuItem ? selectedMenuItem.name || 'No name available' : 'No name available'}</Title>}
        visible={modalVisible}
        onCancel={handleCloseModal}
        footer={[<Button key="close" onClick={handleCloseModal}>Close</Button>]}
        width={500}
        className="custom-modal"
      >
        <Row gutter={24} align="middle">
          <Col span={12}>
            <Image
              src={selectedMenuItem ? selectedMenuItem.image || 'fallback-image-url' : 'fallback-image-url'}
              alt="Menu Item"
              style={{ width: '95%', borderRadius: '4px' }}
            />
          </Col>
          <Col span={12}>
            <Paragraph>
              <InfoCircleOutlined style={{ color: 'cadetblue', marginRight: 8 }} />
              Description: {selectedMenuItem ? selectedMenuItem.description || 'No description available' : 'No description available'}
            </Paragraph>

            <Divider />
            <Title level={5} style={{ margin: 0 }}>
              <DollarCircleOutlined style={{ color: 'green', marginRight: 8 }} />
              Price: <strong>${selectedMenuItem ? selectedMenuItem.price || 'No price available' : 'No price available'}</strong>
            </Title>
          </Col>
        </Row>
      </Modal>

      <section className={styles.section}>
        <h2 className={styles.heading}>Comments</h2>
        <div className={styles.divider}></div>
        <List
          itemLayout="horizontal"
          dataSource={currentComments}
          renderItem={comment => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={comment.user.avatar} />}
                title={<a href="#!">{comment.user.username}</a>}
                description={comment.text}

              />

              <div style={{ marginTop: '10px' }}>
                <p className={styles.cuisineType}> <StarOutlined style={{ marginRight: '6px' }} /><span style={{ paddingBottom: '3px' }}>{comment.rating}</span> <DisplayRating style={{ marginLeft: '5px', paddingTop: '2px' }} rating={comment.rating} /> </p>
                <p><small>{formatDate(comment.updatedAt)}</small></p>
              </div>
            </List.Item>
          )}
        />
        <Pagination
          current={currentPage}
          total={eateryComments.length}
          pageSize={commentsPerPage}
          onChange={paginate}
          style={{ textAlign: 'center', marginTop: '20px' }}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Vouchers</h2>
        <div className={styles.divider}></div>
        <Row gutter={[16, 16]}>
          {voucherList.map((voucherItem, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6} xl={6} style={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                hoverable
                style={{
                  width: '100%',
                  maxWidth: '250px',
                  borderRadius: '10px',
                  marginTop: '16px', // Optional: Adds some space between the cards and the top of the column
                }}
                cover={
                  <img
                    alt="discount_img"
                    src={discountImg}
                    style={{
                      width: '85%',
                      display: 'block',
                      margin: '10px auto',
                      borderTopLeftRadius: '10px',
                      borderTopRightRadius: '10px'
                    }}
                  />
                }
                actions={[
                  <Button key="book" type="primary" onClick={() => handleSubmitVoucher(voucherItem.setid)}>Book</Button>
                ]}
              >
                <Card.Meta
                  title={<div><TagOutlined /> Voucher Details</div>}
                  description={
                    <>
                      <p><ClockCircleOutlined /> {`${dayjs(voucherItem.end_time).format('YYYY-MM-DD')} ${dayjs(voucherItem.start_time).format('HH:mm')} to ${dayjs(voucherItem.end_time).format('HH:mm')}`}</p>
                      <p><DollarCircleOutlined /> Discount: {voucherItem.discount} %</p>
                      <Tooltip title={voucherItem.details}>
                        <p><InfoCircleOutlined /> {voucherItem.details}</p>
                      </Tooltip>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className={styles.section}>
        <div className={styles.text}>Have you been to the {name}? Share your experience with everyone!</div>
        <div className={styles.feedbackContainer}>
          <img src={avatar} alt="Eatery" className={styles.avatar} />
          <div className={styles.rightSide}>
            <div className={styles.username}>{username}</div>
            <TextArea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave a comment..."
              autoSize={{ minRows: 3, maxRows: 5 }}
              className={styles.input}
            />
            <StarRating rating={rating} setRating={setRating} />
            <Space style={{ marginTop: '10px' }}>
              <Button onClick={submitComment}>Submit</Button>
            </Space>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EateryDetailsPage;
