import { connectToDatabase } from "./lib/mongoose.js";
import { User, Eatery } from "./models/user.js";
import { UserProfile, EateryProfile } from "./models/profile.js";
import { MenuItems } from "./models/menu.js";
import { Voucher } from "./models/voucher.js";
import { setVoucher } from "./models/setVoucher.js";
import mongoose, { disconnect, set } from "mongoose";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

import faker from "faker";

dotenv.config();
connectToDatabase();
// create some mock user and eatery data use faker
async function createMockUserData() {
    const user = new User({
        email: faker.internet.email(),
        password: faker.internet.password(),

    });
    await user.save();
}
async function createMockEateryData() {
    const eatery = new Eatery({
        name: faker.company.companyName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
    });
    await eatery.save();
}
async function createUserProfiles() {
    const users = await User.find();
    for (let i = 0; i < users.length; i++) {
      // Check if a profile already exists for this user
      const existingProfile = await UserProfile.findOne({ userId: users[i]._id });
      if (!existingProfile) {
        const profile = new UserProfile({
          userId: users[i]._id,
          username: faker.internet.userName(),
          // generate more fields as needed
        });
        await profile.save();
      }
    }
  }
async function createEateryProfiles() {
    const eateries = await Eatery.find();
    for (let i = 0; i < eateries.length; i++) {
      // Check if a profile already exists for this user
      const existingProfile = await EateryProfile.findOne({ userId: eateries[i]._id });
      if (!existingProfile) {
        const eateryProfile = new EateryProfile({
          userId: eateries[i]._id,
          username: faker.internet.userName(),
          address: faker.address.streetAddress(),
          geo_coordinates: {
            lat: faker.address.latitude(),
            lng: faker.address.longitude(),
          },
          cuisine: [faker.random.word(), faker.random.word()],
        });
        await eateryProfile.save();
      }
    }
}

async function getUsers() {
    const users = await User.find();
    console.log(users);
}
async function getEateries() {
    const eateries = await Eatery.find();
    console.log(eateries);
}
async function getUserProfiles() {
    const userProfiles = await UserProfile.find();
    console.log(userProfiles);
}
async function getEateryProfiles() {
    const eateryProfiles = await EateryProfile.find();
    console.log(eateryProfiles);
}
// create some mock menu items
async function createMenuItems() {
    const eateries = await Eatery.find();
    for (let i = 0; i < eateries.length; i++) {
      const menuItem = new MenuItems({
        owner: eateries[i]._id,
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        description: faker.commerce.productDescription(),
        image: faker.image.food(),
        });
        await menuItem.save();
    }
}
// create some mock vouchers
async function createVouchers() {
    const eateries = await Eatery.find();
    const setId = uuidv4();
    for (let i = 0; i < eateries.length; i++) {
      const voucher = new Voucher({
        owner: eateries[i]._id,
        discount: faker.datatype.number({ min: 0, max: 99 }),
        start_time: faker.date.recent(),
        // end_time = start_time + 1 week
        end_time: faker.date.future(),
        selected_items: [faker.commerce.productName(), faker.commerce.productName()],
        setid: setId,
        setids: [setId],
        details: faker.lorem.sentence(),
        customer: new mongoose.Types.ObjectId(),
        status: 'claimed',
      });
      await voucher.save();
    }
}
async function resetVouchers() {
    const vouchers = await Voucher.find();
    for (let i = 0; i < vouchers.length; i++) {
        vouchers[i].status = 'claimed';
        vouchers[i].redeemTime = null;
        vouchers[i].redeemLocation = null;
        await vouchers[i].save();
    }
}
async function deletesetVouchers() {
    await setVoucher.deleteMany({});
    console.log('deleted all setVouchers');
}
// get all menu items
async function getMenuItems() {
    const menuItems = await MenuItems.find();
    console.log(menuItems);
}
// get all vouchers
async function getVouchers() {
    const vouchers = await Voucher.find({
        status: 'redeemed'
    });
    console.log(vouchers);
}

for (let i = 0; i < 10; i++) {
    // createMockUserData();
    // createMockEateryData();
}
// delete all menu items
async function deleteMenuItems() {
    await MenuItems.deleteMany({});
}
// delete all vouchers
async function deleteVouchers() {
    await Voucher.deleteMany({});
}

// delete all setVouchers
async function deleteSetVouchers() {
    await setVoucher.deleteMany({});
}

resetVouchers();

// disconnect from the database


