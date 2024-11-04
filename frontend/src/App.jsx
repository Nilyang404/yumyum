import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/Pages/Login';
import Register from './components/Pages/Register';
import DasNavs from './components/DasNavs';
import EateryListings from './components/Pages/Eatery/eateryListings';
import EateryDetails from './components/Pages/Eatery/eateryDetails';
import CustomerReviews from './components/Pages/Eatery/customerReviews';
import OrderList from './components/Pages/Eatery/orderList';
import Menu from './components/Pages/Menu';
import VouchersSetingPage from './components/Pages/Eatery/vouchersSeting';
import './static/styles/main.css';

function App () {
  const location = useLocation();
  const showNavs = (location.pathname !== '/login' && location.pathname !== '/register');
  const [currentPage, setCurrentPage] = React.useState('');

  return (
    <div>
      {showNavs && <DasNavs selected={currentPage}></DasNavs>}
      <Routes>
        <Route path="/" element={<EateryListings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/eateryLists" element={<EateryListings />} />
        <Route path="/eateryDetails/:eateryId" element={<EateryDetails />} />
        <Route path="/customerReviews" element={<CustomerReviews />} />
        <Route path="/vouchersSeting" element={<VouchersSetingPage />} />
        <Route path="/orderList" element={<OrderList />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </div>
  );
}

export default App;
