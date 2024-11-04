// test.js
import request from 'supertest';
import { expect } from 'chai';
import app from './index.js';
// API TESTS
let setVoucherId;
let eateryToken;
let userId;
let encodesetVoucherId

describe('Eatery API Tests', function() {
    let menuItemId;
    
    before(async () => {
      const response = await request(app)
        .post('/api/eatery/login')
        .send({ email: 'users114514@example.com', password: 'password' });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
      eateryToken = response.body.token;
    });

    it('GET /api/profile/eatery/info should return status code 200 and eatery profile', async () => {
      const response = await request(app)
        .get('/api/profile/eatery/info')
        .set('Authorization', `Bearer ${eateryToken}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('username');
    });
    it('PUT /api/profile/eatery/edit should update eatery profile', async () => {
        const response = await request(app)
          .put('/api/profile/eatery/edit')
          .set('Authorization', `Bearer ${eateryToken}`)
          .send({ username: 'updatedEatery', address: '704A George St, Haymarket NSW 2000', cuisine: 'Italian' });
        expect(response.status).to.equal(200);
        expect(response.body.username).to.equal('updatedEatery');
      });
    
      it('POST /api/menu/eatery/add should add a menu item', async () => {
        const response = await request(app)
          .post('/api/menu/eatery/add')
          .set('Authorization', `Bearer ${eateryToken}`)
          .send({ name: 'Pizza', price: '15', description: 'Delicious Italian pizza' });
        expect(response.status).to.equal(201);
        menuItemId = response.body.id;
      });

      it('GET /api/profile/all/eatery should return status code 200 and eateries', async () => {
        const response = await request(app)
          .get('/api/profile/all/eatery')
        expect(response.status).to.equal(200);
      });

      it('PUT /api/menu/eatery/edit/:id should update a menu item', async () => {
        const response = await request(app)
          .put(`/api/menu/eatery/edit/${menuItemId}`)
          .set('Authorization', `Bearer ${eateryToken}`)
          .send({ name: 'Updated Pizza', price: '20', description: 'Super delicious Italian pizza' });
        expect(response.status).to.equal(201);
        expect(response.body.message).to.equal('Menu item updated successfully.');
        menuItemId = response.body.id;

      });

      it('GET /api/menu/item/info/:id should return status code 200 and eatery menu', async () => {
        const response = await request(app)
          .get(`/api/menu/item/info/${menuItemId}`)
          .set('Authorization', `Bearer ${eateryToken}`);
        expect(response.status).to.equal(200);
      });
    
      it('DELETE /api/menu/eatery/delete/:id should delete a menu item', async () => {
        const response = await request(app)
          .delete(`/api/menu/eatery/delete/${menuItemId}`)
          .set('Authorization', `Bearer ${eateryToken}`);
        expect(response.status).to.equal(201);
      });


      it('POST /api/voucher/add should add a voucher', async () => {
        const response = await request(app)
          .post('/api/voucher/add')
          .set('Authorization', `Bearer ${eateryToken}`)
          .send({
            discount: 99,
            start_time: "2024-04-19T00:53:27+10:00",
            end_time: "2024-04-19T23:53:27+10:00",
            details: "This voucher gives you a 99% discount.",
            selected_items: ["item1", "item2", "item3"],
            quantity: 5,
            weeklyRepeat: false
          });
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('setid');
        setVoucherId = response.body.setid;
      });

      it('PUT /api/voucher/edit/:setid should update a voucher', async () => {
        const response = await request(app)
          .put(`/api/voucher/edit/${setVoucherId}`)
          .set('Authorization', `Bearer ${eateryToken}`)
          .set('setid', setVoucherId)
          .send({
            discount: 50,
            start_time: "2024-04-19T01:53:27+10:00",
            end_time: "2024-04-19T23:53:27+10:00",
            details: "This voucher gives you a 50% discount.",
            selected_items: ["item1", "item2"],
            quantity: 6,
            weeklyRepeat: false
          });
        expect(response.status).to.equal(201);
      });

      it('GET /api/voucher/eatery/info should return status code 200 and eatery vouchers', async () => {
        const response = await request(app)
            .get('/api/voucher/eatery/info')
            .set('Authorization', `Bearer ${eateryToken}`);
        expect(response.status).to.equal(200);
      });
      
      
      it('DELETE /api/voucher/delete/:id should delete a voucher', async () => {
        const response = await request(app)
          .delete(`/api/voucher/delete/${setVoucherId}`)
          .set('Authorization', `Bearer ${eateryToken}`);
        expect(response.status).to.equal(201);
      });

      it('GET /api/voucher/info/:setid should return status code 404 and no vouchers found', async () => {
        const response = await request(app)
            .get('/api/voucher/info/${setVoucherId}')
        expect(response.status).to.equal(404);
      });

      it('POST /api/voucher/add should add a voucher', async () => {
        const response = await request(app)
          .post('/api/voucher/add')
          .set('Authorization', `Bearer ${eateryToken}`)
          .send({
            discount: 99,
            start_time: "2024-04-19T01:53:27+10:00",
            end_time: "2024-12-31T23:30:00.000Z",
            details: "This voucher gives you a 99% discount.",
            selected_items: ["item1", "item2", "item3"],
            quantity: 5,
            weeklyRepeat: false
          });
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('setid');
        setVoucherId = response.body.setid[0];
      });

      it('GET /api/voucher/info/:setid should return status code 200', async () => {
        const response = await request(app)
            .get(`/api/voucher/info/${setVoucherId}`)
        expect(response.status).to.equal(200);
      });

    // more tests
    
  });
  
// USER API TESTS
describe('User API Tests', function() {
    let userToken;
  
    before(async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({ email: 'users2@example.com', password: 'password' });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
      userToken = response.body.token;
    });

    it('GET /api/profile/user/info should return status code 200 and user profile', async () => {
      const response = await request(app)
        .get('/api/profile/user/info')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('username');
      userId = response.body.userId;
    });
  
    it('PUT /api/profile/user/edit should return status code 200 and updated user profile', async () => {
      const response = await request(app)
        .put('/api/profile/user/edit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ username: 'updatedTestUser' });
      expect(response.status).to.equal(200);
      expect(response.body.username).to.equal('updatedTestUser');
    });

    it('PUT /api/voucher/claim/:setid should claim a voucher', async () => {
      const response = await request(app)
        .put(`/api/voucher/claim/${setVoucherId}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(response.status).to.equal(201);
      encodesetVoucherId = response.body.voucher.hashcode;
    });

    it ('GET /api/voucher/customer/info should return status code 200 and user vouchers', async () => {
        const response = await request(app)
            .get('/api/voucher/customer/info')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).to.equal(200);
      });
    
    it(' GET /api/voucher/info/single/:hashcode should return status code 200 and voucher details', async () => {
        const response = await request(app)
            .get(`/api/voucher/info/single/${encodesetVoucherId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).to.equal(200);
      });

  });

describe('Redeem API Tests', function() {
  it ('PUT /api/voucher/redeem/:setid should return status code 201 and redeem a voucher', async () => {
    const response = await request(app)
      .put(`/api/voucher/redeem/${encodesetVoucherId}`) // Use template string here
      .set('Authorization', `Bearer ${eateryToken}`)
      .send({ customer: userId, current_time: "2024-04-19T10:53:27+10:00" }) // Use userId variable here
    expect(response.status).to.equal(201);
  });
});