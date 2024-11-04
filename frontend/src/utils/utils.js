const resetStorage = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('username');
  localStorage.removeItem('address');
  localStorage.removeItem('cuisine');
  localStorage.removeItem('preferences');
  localStorage.removeItem('userType');
}

export { resetStorage };
