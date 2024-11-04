import express from 'express'; // for creating the server
import bodyParser from 'body-parser'; // for parsing incoming request
import morgan from 'morgan'; // for logging
import fetch from 'node-fetch'; // for fetch data from internet
import dotenv from 'dotenv'; // for global .env file
import bcrypt from 'bcryptjs'; // for password hashing
import jwt from 'jsonwebtoken'; // for token generation
import authenticateToken from './middleware/authtoken.js';
import cors from 'cors'; // handle cors problem
import { connectToDatabase } from './lib/mongoose.js';
import { User, Eatery } from './models/user.js';
import { UserProfile, EateryProfile } from './models/profile.js';
import { Comment } from './models/comment.js';
import { MenuItems } from './models/menu.js';
import { Voucher } from './models/voucher.js';
import { setVoucher } from './models/setVoucher.js';
import mongoose from 'mongoose';
import cron from 'node-cron';
import geolib from 'geolib';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetchAndSendEmail from './ses_script.js';

// always use import rather than require here
const app = express();
const port = 3000;
dotenv.config();
//app.use(cors()); // cross origin resource sharing
app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
  }),
);

// connect todatabase
connectToDatabase();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// request handler
app.get('/', (req, res) => {
  res.send(
    '<h1>YumYum API</h1> <p>Usage https://9900yumyumbackend.vercel.app/{route}</p>',
  );
});

app.get('/test', (req, res) => {
  res.send('<h1>Hello Test</h1>');
});

app.get('/about', (req, res) => {
  res.send('<h1>About</h1>');
});

//Easter eggs
app.get('/api/dragonball', async (req, res) => {
  const imageUrl =
    'https://m.media-amazon.com/images/M/MV5BYzI0YjYxY2UtNzRjNS00NTZiLTgzMDItNGEzMjU5MmE0ZWJmXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UY3000_.jpg';
  try {
    const response = await fetch(imageUrl);
    if (response.ok) {
      res.setHeader('Content-Type', response.headers.get('Content-Type'));
      response.body.pipe(res);
    } else {
      res.status(404).send('Image not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

// Register User
app.post('/api/user/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // make sure email and password are provided
    if (!email || !password || !username) {
      return res.status(400).send('Username, Email and password are required.');
    }

    // check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email is already in use.');
    }

    // encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a new user
    const user = new User({
      email,
      password: hashedPassword,
    });
    await user.save();

    const userProfile = new UserProfile({
      userId: user._id,
      username,
    });
    userProfile.profileId = userProfile._id;
    await userProfile.save();
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // make sure to use the same secret as the one used in the middleware
      { expiresIn: '720h' }, // token will expire in 720 hours
    );
    res.status(201).json({ token: token, userId: user._id });
    fetchAndSendEmail(userProfile.username, [user.email]);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred during the registration process.');
  }
});

// Register Eatery
app.post('/api/eatery/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // make sure email and password are provided
    if (!email || !password || !username) {
      return res.status(400).send('Username, Email and password are required.');
    }

    // check if the user already exists
    const existingUser = await Eatery.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email is already in use.');
    }

    // encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a new user
    const eatery = new Eatery({
      email,
      password: hashedPassword,
    });

    await eatery.save();

    const eateryProfile = new EateryProfile({
      userId: eatery._id,
      username,
    });
    eateryProfile.profileId = eateryProfile._id;

    console.log(eateryProfile.profileId, eateryProfile._id);
    await eateryProfile.save();

    const token = jwt.sign(
      { userId: eatery._id, email: eatery.email },
      process.env.JWT_SECRET, // make sure to use the same secret as the one used in the middleware
      { expiresIn: '720h' }, // token will expire in 720 hours
    );
    fetchAndSendEmail(eateryProfile.username, [eatery.email]);
    res.status(201).json({ token: token, userId: eatery._id });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred during the registration process.');
  }
});
//Login user
app.post('/api/user/login', async (req, res) => {
  try {
    // get email and password from request body
    const { email, password } = req.body;
    if (email && password) {
      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        // if user exists and password is correct, generate a token
        if (!process.env.JWT_SECRET) {
          console.log('JWT_SECRET is missing in .env file');
          return res
            .status(500)
            .send('Server error: JWT secret is not configured.');
        }
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET, // make sure to use the same secret as the one used in the middleware
          { expiresIn: '720h' }, // token will expire in 720 hours
        );
        res.status(200).json({ token: token, userId: user._id });
      } else {
        // if user does not exist or password is incorrect
        res.status(400).send('Invalid email or password');
      }
    } else {
      res.status(400).send('Email and password are required.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

//login eatery
app.post('/api/eatery/login', async (req, res) => {
  try {
    // find the eatery by email
    const { email, password } = req.body;
    if (email && password) {
      const eatery = await Eatery.findOne({ email });
      if (eatery && (await bcrypt.compare(password, eatery.password))) {
        // if eatery exists and password is correct, generate a token
        if (!process.env.JWT_SECRET) {
          console.log('JWT_SECRET is missing in .env file');
          return res
            .status(500)
            .send('Server error: JWT secret is not configured.');
        }
        const token = jwt.sign(
          { userId: eatery._id, email: eatery.email },
          process.env.JWT_SECRET, // make sure to use the same secret as the one used in the middleware
          { expiresIn: '720h' }, // token will expire in 720 hours
        );
        res.status(200).json({ token: token, userId: eatery._id });
      } else {
        // if user does not exist or password is incorrect
        res.status(400).send('Invalid email or password');
      }
    } else {
      res.status(400).send('Email and password are required.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// view user profile
app.get('/api/profile/user/info', authenticateToken, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      userId: req.user.userId,
    }).exec();
    if (!profile) {
      return res.status(404).send('Profile not found.');
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// view eatery profile
app.get('/api/profile/eatery/info', authenticateToken, async (req, res) => {
  console.log(req);
  try {
    const profile = await EateryProfile.findOne({
      userId: req.user.userId,
    }).exec();
    if (!profile) {
      return res.status(404).send('Profile not found.');
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

app.get('/api/profile/eatery/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    const eatery = await EateryProfile.findOne({ userId: userId })
      .select('username profileId avatar address cuisine opening_hours  ') // Only select these fields
      .exec();
    if (!eatery) {
      res.status(404).send('eatery not found');
    } else {
      res.status(200).json(eatery);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// update profile
app.put('/api/profile/user/edit', authenticateToken, async (req, res) => {
  try {
    const { username, preferences, avatar, is_subscribed } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (preferences) updateData.preferences = preferences;
    if ('avatar' in req.body) updateData.avatar = avatar;
    if ('is_subscribed' in req.body) updateData.is_subscribed = is_subscribed;
    console.log(updateData);
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updateData },
      { new: true }, // return the updated document
    ).exec();

    if (!updatedProfile) {
      return res.status(404).send('Profile not found.');
    }

    res.json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// update eatery profile
app.put('/api/profile/eatery/edit', authenticateToken, async (req, res) => {
  try {
    const {
      username,
      address,
      cuisine,
      is_public,
      opening_hours,
      avatar,
      is_subscribed,
    } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (address) updateData.address = address;
    if (cuisine) updateData.cuisine = cuisine;
    if (opening_hours) updateData.opening_hours = opening_hours;
    if ('is_public' in req.body) updateData.is_public = is_public;
    if ('avatar' in req.body) updateData.avatar = avatar;
    if ('is_subscribed' in req.body) updateData.is_subscribed = is_subscribed;

    // Get the geo-coordinates from the address if address is provided
    if (updateData.address !== '') {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${updateData.address}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();
      if (data.status === 'OK') {
        updateData.geo_coordinates = {
          type: 'Point',
          coordinates: [
            data.results[0].geometry.location.lng,
            data.results[0].geometry.location.lat,
          ],
        };
      }
    }

    const updatedProfile = await EateryProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updateData },
      { new: true }, // return the updated document
    ).exec();

    console.log('new', updatedProfile);

    if (!updatedProfile) {
      return res.status(404).send('Profile not found.');
    }

    res.json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

app.get('/api/profile/all/eatery', async (req, res) => {
  try {
    const profiles = await EateryProfile.find()
      .select('username address cuisine opening_hours')
      .exec();
    // console.log(profiles);
    if (profiles.length === 0) {
      return res.status(404).send('No eatery profiles found.');
    }
    res.json(profiles);
  } catch (error) {
    // console.error(error);
    res.status(500).send('Server error.');
  }
});

// menu add, edit, view, delete, viewall done

// add menu item
// pass
app.post('/api/menu/eatery/add', authenticateToken, async (req, res) => {
  try {
    // Check and drop the unique index on eateryId
    const { name, price, description, image } = req.body;
    const owner = req.user.userId;
    const ownerProfile = await EateryProfile.findOne({ userId: owner });
    if (!ownerProfile) {
      return res.status(403).send('Owner not found in EateryProfile.');
    }
    const menuItem = new MenuItems({
      name,
      price,
      description,
      image,
      owner: req.user.userId,
    });
    const savedMenuItem = await menuItem.save();
    res.status(201).json({
      id: savedMenuItem._id,
      message: 'Menu item added successfully.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// edit menu item
// pass
app.put('/api/menu/eatery/edit/:id', authenticateToken, async (req, res) => {
  try {
    const { name, price, description, image } = req.body;
    const menuItemId = req.params.id;
    const owner = req.user.userId;
    const ownerProfile = await EateryProfile.findOne({ userId: owner });
    if (!ownerProfile) {
      return res.status(403).send('Owner not found in EateryProfile.');
    }
    // check the owner of the menu item
    const menuItem = await MenuItems.findOne({ _id: menuItemId, owner: owner });
    if (!menuItem) {
      return res.status(404).send('Menu item not found.');
    }
    const updatedMenuItem = await MenuItems.findByIdAndUpdate(
      menuItemId,
      {
        name,
        price,
        description,
        image,
      },
      { new: true },
    ); // { new: true } option returns the updated document
    if (!updatedMenuItem) {
      return res.status(404).send('Menu item not found.');
    }
    res.status(201).json({
      id: updatedMenuItem._id,
      message: 'Menu item updated successfully.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// view all menu items under the eatery
// pass
app.get('/api/menu/eatery/info/:eateryId', async (req, res) => {
  try {
    const { eateryId } = req.params;
    const eatery = await EateryProfile.findOne({ userId: eateryId });
    if (!eatery) {
      return res.status(404).send('Eatery not found.');
    }
    const menuItems = await MenuItems.find({ owner: eateryId }).exec();
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// view menu item
// pass
app.get('/api/menu/item/info/:id', authenticateToken, async (req, res) => {
  try {
    const menuItem = await MenuItems.findOne({ _id: req.params.id }).exec();
    if (!menuItem) {
      return res.status(404).send('Menu item not found.');
    }
    res.json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// delete menu item
// pass
app.delete(
  '/api/menu/eatery/delete/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const menuItem = await MenuItems.findOne({ _id: req.params.id }).exec();
      if (!menuItem) {
        return res.status(404).send('Menu item not found.');
      }

      // Check if the current user is the owner of the menu item
      if (req.user.userId.toString() !== menuItem.owner.toString()) {
        return res.status(403).send('User is not the owner of the menu item.');
      }
      const deleteResult = await MenuItems.deleteOne({ _id: req.params.id });
      if (deleteResult.deletedCount > 0) {
        res.status(201).send('Menu item deleted successfully.');
      } else {
        res.status(404).send('No menu item found to delete.');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error.');
    }
  },
);

app.post('/api/voucher/add', authenticateToken, async (req, res) => {
  try {
    const {
      discount,
      start_time,
      end_time,
      details,
      selected_items,
      quantity,
      weeklyRepeat,
    } = req.body;
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    const setidArray = [];
    const eateryProfile = await EateryProfile.findOne({
      userId: req.user.userId,
    });
    if (!eateryProfile) {
      return res.status(403).send('User is not an eatery.');
    }

    const createVoucher = async (startTimeOffset = 0, endTimeOffset = 0) => {
      const setid = uuidv4();
      setidArray.push(setid);
      const voucher = new setVoucher({
        owner: req.user.userId,
        discount,
        start_time: new Date(startTime.getTime() + startTimeOffset),
        end_time: new Date(endTime.getTime() + endTimeOffset),
        details,
        selected_items,
        setid,
        setids: [...setidArray],
        quantity,
        remainQuantity: quantity,
        repeated: weeklyRepeat,
      });
      await voucher.save();
      return voucher;
    };

    await createVoucher();

    if (weeklyRepeat) {
      await createVoucher(7 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000);

      cron.schedule('0 6 * * 6', async () => {
        const voucher = await setVoucher.findOne({
          _id: setidArray[setidArray.length - 1],
        });
        if (!voucher || !voucher.weeklyRepeat) {
          return;
        }
        await createVoucher(14 * 24 * 60 * 60 * 1000, 14 * 24 * 60 * 60 * 1000);
      });
    }

    res.status(201).json({ setid: setidArray });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// pass
// update

app.put('/api/voucher/edit/:setid', authenticateToken, async (req, res) => {
  try {
    const {
      discount,
      start_time,
      end_time,
      details,
      selected_items,
      quantity,
      weeklyRepeat,
    } = req.body;
    const setid = req.params.setid;
    const userId = req.user.userId; // Extract userId from req.user
    const eateryProfile = await EateryProfile.findOne({ userId: userId });
    if (!eateryProfile) {
      return res.status(403).send('User is not an eatery.');
    }
    const setVouchers = await setVoucher.find({
      setids: { $elemMatch: { $eq: setid } },
      owner: userId,
    });
    for (let setVoucher of setVouchers) {
      setVoucher.discount = discount;
      setVoucher.start_time = start_time;
      setVoucher.end_time = end_time;
      setVoucher.details = details;
      setVoucher.selected_items = selected_items;
      setVoucher.quantity = quantity;
      setVoucher.remainQuantity = quantity;
      setVoucher.repeated = weeklyRepeat;
      await setVoucher.save();
    }
    if (setVouchers.length === 0) {
      return res.status(404).send('No vouchers found to edit.');
    } else {
      res.status(201).send('Vouchers updated successfully.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// pass
app.delete(
  '/api/voucher/delete/:setid',
  authenticateToken,
  async (req, res) => {
    try {
      const setid = req.params.setid;
      const userId = req.user.userId; // Assuming the userId is stored in req.user.userId
      const eateryProfile = await EateryProfile.findOne({ userId: userId });
      if (!eateryProfile) {
        return res.status(403).send('User is not an eatery.');
      }
      const setVouchers = await setVoucher.find({
        setids: { $elemMatch: { $eq: setid } },
        owner: userId,
      });
      for (let setVoucher of setVouchers) {
        if (setVoucher.repeated) {
          setVoucher.repeated = false;
          await setVoucher.save();
        }
      }
      const deleteResult = await setVoucher.deleteMany({
        _id: { $in: setVouchers.map((voucher) => voucher._id) },
      });

      // const setVouchers1 = await setVoucher.find({ setid: { $elemMatch: { $eq: setid } }, owner: userId });
      // console.log("setVouchers", setVouchers1);
      if (deleteResult.deletedCount > 0) {
        res.status(201).send('Vouchers deleted successfully.');
      } else {
        res.status(404).send('No vouchers found to delete.');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error.');
    }
  },
);

// view voucher set
// pass
app.get('/api/voucher/info/:setid', async (req, res) => {
  try {
    const setid = req.params.setid;
    const vouchers = await setVoucher
      .find({ setids: { $elemMatch: { $eq: setid } } })
      .exec();
    if (vouchers.length === 0) {
      return res.status(404).send('No vouchers found.');
    } else {
      // return the vouchers and message
      res
        .status(200)
        .json({ vouchers, message: 'Vouchers found successfully.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// get set of vouchers from the eatery, for the eatery
// pass
app.get('/api/voucher/eatery/info', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const vouchers = await setVoucher.find({ owner: userId }).exec();
    const result = [];
    for (let voucher of vouchers) {
      if (voucher.remainQuantity !== 0) {
        result.push(voucher);
      }
    }
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// get all vouchers from the eatery
app.get('/api/voucher/user/:eateryId', authenticateToken, async (req, res) => {
  try {
    // it is for user to view all vouchers
    const eateryId = req.params.eateryId;
    const vouchers = await setVoucher.find({ owner: eateryId }).exec();
    const result = [];
    for (let voucher of vouchers) {
      if (voucher.remainQuantity !== 0) {
        result.push(voucher);
      }
    }
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

function validateBSONInput(inputString) {
  const bsonPattern = /^[0-9a-fA-F]{24}$/;
  return bsonPattern.test(inputString);
}

// get single voucher
// pass
app.get(
  '/api/voucher/info/single/:hashcode',
  authenticateToken,
  async (req, res) => {
    const hashCode = req.params.hashcode;
    try {
      const voucher = await Voucher.findOne({ hashcode: hashCode }).exec();
      if (!voucher) {
        return res.status(404).send('Voucher not found.');
      }
      res.json(voucher);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error.');
    }
  },
);

// claim voucher
app.put('/api/voucher/claim/:setid', authenticateToken, async (req, res) => {
  try {
    const setid = req.params.setid;
    const email = req.user.userId;
    const existingVoucher = await Voucher.findOne({
      setid: setid,
      customer: email,
    });
    if (existingVoucher) {
      return res
        .status(404)
        .send('You have already claimed a voucher from this set.');
    }
    const voucherSet = await setVoucher.findOne({
      setid: setid,
      remainQuantity: { $gt: 0 },
    });
    if (!voucherSet) {
      return res.status(404).send('No vouchers found or no vouchers left.');
    }
    voucherSet.remainQuantity -= 1;
    await voucherSet.save();
    const voucher = new Voucher({
      owner: voucherSet.owner,
      discount: voucherSet.discount,
      start_time: voucherSet.start_time,
      end_time: voucherSet.end_time,
      details: voucherSet.details,
      selected_items: voucherSet.selected_items,
      setid: setid,
      customer: email,
      status: 'claimed',
      hashcode: uuidv4(),
    });
    await voucher.save();

    res.status(201).json({ voucher });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// redeem voucher
app.put(
  '/api/voucher/redeem/:encodedVoucherId',
  authenticateToken,
  async (req, res) => {
    try {
      const { current_time } = req.body;
      const encodedVoucherId = req.params.encodedVoucherId;
      console.log('encodedVoucherId:', encodedVoucherId);

      const voucherToRedeem = await Voucher.findOne({
        hashcode: encodedVoucherId,
        status: 'claimed',
      }).exec();

      if (!voucherToRedeem) {
        return res.status(400).send('No valid voucher found.');
      }

      const currentTime = Date.parse(new Date(current_time));
      const startTime = Date.parse(voucherToRedeem.start_time);
      const endTime = Date.parse(voucherToRedeem.end_time);

      if (!(currentTime >= startTime && currentTime <= endTime)) {
        return res.status(400).send('Voucher is not valid at this time.');
      }

      const eatery = await EateryProfile.findOne({
        userId: req.user.userId,
      }).exec();
      voucherToRedeem.redeemTime = current_time;
      voucherToRedeem.redeemLocation = eatery.address;
      voucherToRedeem.status = 'redeemed';
      await voucherToRedeem.save();
      return res.status(201).json({
        voucher: voucherToRedeem,
        message: 'Voucher redeemed successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error.');
    }
  },
);

// get all vouchers from the customer
app.get('/api/voucher/customer/info', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Assuming the userId is stored in req.user.userId
    const vouchers = await Voucher.aggregate([
      { $match: { customer: userId } },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: '$_id', // Change this line
          owner: { $first: '$owner' },
          discount: { $first: '$discount' },
          start_time: { $first: '$start_time' },
          end_time: { $first: '$end_time' },
          details: { $first: '$details' },
          selected_items: { $first: '$selected_items' },
          status: { $first: '$status' }, // Add this line
          redeemLocation: { $first: '$redeemLocation' }, // Add this line
          redeemTime: { $first: '$redeemTime' }, // Add this line
          hashcode: { $first: '$hashcode' }, // Add this line
        },
      },
    ]);
    res.json(vouchers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

app.post('/api/help', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const inputText = req.body.text;
    const profiles = await EateryProfile.find()
      .select('username address cuisine opening_hours')
      .exec();
    const prompt = `
    You are a chatbot designed specifically for an eatery management website. Your main task is to provide prompt and precise assistance to customers. Use concise language and focus on giving clear instructions. 
    The eatery information is as follows:
    ${profiles.map((profile) => `Eatery: ${profile.username}, Address: ${profile.address}, Cuisine: ${profile.cuisine}, Opening Hours: ${profile.opening_hours}`).join('\n')}

    Here are some examples of typical customer queries you might encounter:
    - "How do I make a reservation for dinner?"
    - "Where can I find the menu?"
    - "Can you help me update my contact information?"
    - "What are the hours of operation for weekends?"

    And here are the Manual:
    5.2 Manual
    5.2.1. Eatery Manual
    1. Introduction:
    Welcome to the Eatery Management System user manual. This document aims to provide comprehensive guidance on utilizing the features available to eatery owners within the system. Whether you're a small café or a bustling restaurant, this manual will walk you through the process of effectively managing your eatery's profile, menu, discount vouchers, and more.
    2. User Registration and Profile Setup:
    First, access the login page and click on the "eatery" category. If you are a new eatery owner, you can click on "join now" to register. Upon completing registration, you will be greeted with a prompt stating “Menu has no items. Please create some items.” Subsequently, navigate to the profile section to complete your eatery's profile setup. Ensure to provide comprehensive information to attract potential customers.
    3. Using Discount Vouchers:
    When customers visit your eatery within the voucher's time range, they'll present a QR code representing the discount voucher. You can open 'Redeem' and click on 'choose the QR code picture' and select the dishes the customer is enjoying. The system will automatically calculate the total price of all selected items and display it. Simply click on 'redeem' to successfully validate the discount.
    4. Adding and Managing Menu Items:
    In the profile section of the system, navigate to the "Menu" tab to begin adding and managing your menu items. Here, you can click on the "Add" button to input essential details for each menu item, including the name of the dish, a description, and its price. Once an item has been successfully added to your menu, the system will redirect you back to the main menu interface. From here, you can further refine your menu by editing details of existing items or removing them. 
    5. Creating and Managing Discount Vouchers:
    To offer discounts, click on your profile picture and navigate to the "Voucher" section. Click on "Add Voucher" to specify details such as discount percentage, time range, weekly repetition, and quantity. After creating the voucher, you can view newly created vouchers. Click the dropdown menu to see details and make edits as needed.
    5.2.2 Customer Document
    Dashboard and Registration/Login
    Initial Visit and Navigation Introduction:
    Upon visiting our website, all unregistered users are directed to the Dashboard page.
    Page layout:
    Top Navigation Bar (Navbar): Includes the site logo and user login/register links.
    Left Sidebar (Sidebar): Provides quick access links and features a button at the bottom to toggle the sidebar’s visibility.
    Main Content Area: Displays three recommended restaurants and a list of all restaurants, sorted by rating and number of reviews. 
    User Registration and Login Process:
    Click “Login” or “Sign Up” located in the upper right corner of the Navbar or at the bottom of the Sidebar.
    On the login or registration page, select the “Customer” option at the top of the page.
    Fill in the required user information (such as email, password, etc.), and you will automatically return to the Dashboard page after completing the registration or login.
    Main Page Features
    Restaurant Search:
    In the search area below the Navbar, enter the name or keywords of the restaurant you wish to search for.
    Click the “Search” button to initiate the search.
    Advanced Filtering Function:
    Click the “Set Filter” button below the search box to open the filter menu.
    In the filter menu, you can filter by cuisine, address, and distance (set using a slider).
    You can also set filters for specific opening dates of the restaurants.
    Click the “Set” button to apply the filter criteria and update the search results.
    Navigation and Page Management:
    Use pagination buttons at the bottom of the Dashboard to browse additional restaurants.
    You can select the number of restaurants displayed per page or jump directly to a specific page number.
    User Account Management
    User Profile Management
    After logging in, the navigation bar displays the word “Customer,” and your user avatar appears in the upper right corner.
    Hover over the avatar to display a dropdown menu with options including “Profile,” “Review,” “Logout.”
    In “Profile,” users can upload or change their avatar, edit their username, and set preferred cuisines.
    User Reviews and Interactions
    Submitting and Viewing Reviews:
    At the bottom of the restaurant detail page, users can enter their review and rating and click “Submit” to post.
    Once submitted, the user’s review will appear in the restaurant’s review section.
    Users can also access “Review” from the dropdown menu under their avatar to view all their past reviews.
    
    Booking and Order Management
    Voucher Booking:
    On the restaurant detail page, users can view available Vouchers, including usage times, discount strength, and detailed descriptions.
    After selecting a suitable Voucher, click the “Book” button to make a reservation.
    Once booked successfully, a confirmation message will appear at the top of the page.
    In “Order List,” view and manage all booked Vouchers, and click “View Ticket” to see the specific QR code, which needs to be presented to the merchant when used.

    Based on these examples, you should adapt your responses to suit similar queries from customers. Ensure that you always guide the user to the relevant section of the website or provide direct answers when applicable.

    Customer asked: "${inputText}"

    please Response:
`;

    console.log(prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// comment and rating for user
app.get('/api/user/comments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user_profile = await UserProfile.findOne({ userId: userId });
    if (!user_profile) {
      console.error('No profile found with the given userId');
      return;
    }
    const comments = await Comment.find({ userId: user_profile._id }).populate({
      path: 'eateryId',
      select: 'username avatar',
    });
    console.log(comments);
    // Transform the comments to include eatery username and avatar
    const transformedComments = comments.map((comment) => {
      return {
        ...comment._doc,
        eateryId: comment.eateryId._id.toString(),
        eatery: {
          _id: comment.eateryId._id,
          username: comment.eateryId.username,
          avatar: comment.eateryId.avatar,
        },
      };
    });

    res.status(200).json(transformedComments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

app.post('/api/user/comments', authenticateToken, async (req, res) => {
  try {
    let { eateryId, text, rating } = req.body;
    // eateryId is "_id"!!!
    const user_profile = await UserProfile.findOne({ userId: req.user.userId });
    if (!user_profile) {
      console.error('No profile found with the given userId');
      return;
    }
    const comment = new Comment({
      userId: user_profile._id,
      eateryId,
      text,
      rating,
    });
    // add timestamp by default
    await comment.save();
    const relatedEatery = await EateryProfile.findById(comment.eateryId);
    if (relatedEatery) {
      // recalculate the average rating
      const allComments = await Comment.find({ eateryId: comment.eateryId });
      const totalRatings = allComments.reduce(
        (acc, cur) => acc + cur.rating,
        0,
      );
      relatedEatery.rating_average = totalRatings / allComments.length;
      relatedEatery.rating_quantity = allComments.length;
      await relatedEatery.save();
    }
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error posting comment');
  }
});

app.put(
  '/api/user/comments/:commentId',
  authenticateToken,
  async (req, res) => {
    const commentId = req.params.commentId;
    const { text, rating } = req.body;
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).send('Comment not found');
      }

      if (comment.userId.toString() !== req.user.userId) {
        return res.status(403).send('Not authorized to update this comment');
      }
      comment.text = text;
      comment.rating = rating;
      comment.updatedAt = new Date();
      await comment.save();
      // update avg rating
      const relatedEatery = await EateryProfile.findById(comment.eateryId);
      if (relatedEatery) {
        // recalculate the average rating
        const allComments = await Comment.find({ eateryId: comment.eateryId });
        const totalRatings = allComments.reduce(
          (acc, cur) => acc + cur.rating,
          0,
        );
        relatedEatery.rating_average = totalRatings / allComments.length;
        relatedEatery.rating_quantity = allComments.length;
        await relatedEatery.save();
      }

      res.status(200).json(comment);
    } catch (error) {
      res.status(500).json({ message: 'Error updating comment' });
    }
  },
);

app.delete(
  '/api/user/comments/:commentId',
  authenticateToken,
  async (req, res) => {
    const commentId = req.params.commentId;
    try {
      const comment = await Comment.findOneAndDelete({ _id: commentId });
      if (!comment) {
        res.status(404).json({ message: 'No data found with this id' });
      } else {
        const relatedEatery = await EateryProfile.findById(comment.eateryId);
        if (relatedEatery) {
          // recalculate the average rating
          const allComments = await Comment.find({
            eateryId: comment.eateryId,
          });
          const totalRatings = allComments.reduce(
            (acc, cur) => acc + cur.rating,
            0,
          );
          relatedEatery.rating_average = totalRatings / allComments.length;
          relatedEatery.rating_quantity = allComments.length;
          await relatedEatery.save();
        }
        res
          .status(200)
          .json({ message: 'Data deleted successfully', data: comment });
      }
      // update avg rating
    } catch (error) {
      res.status(500).json({ message: 'Error deleting comment' });
    }
  },
);

// comment and rating for eatery
app.get('/api/eatery/comments/:eateryId', async (req, res) => {
  const id = req.params.eateryId;
  try {
    let comments = await Comment.find({ eateryId: id }).populate({
      path: 'userId',
      select: 'username avatar userId',
    });

    const eateryProfile = await EateryProfile.findOne({ _id: id });

    const modifiedComments = comments.map((comment) => {
      return {
        ...comment._doc,
        userId: comment.userId.userId.toString(),
        user: {
          _id: comment.userId._id,
          username: comment.userId.username,
          avatar: comment.userId.avatar,
        },
      };
    });

    console.log(modifiedComments);
    const data = {
      _id: id,
      rating_average: eateryProfile.rating_average,
      rating_quantity: eateryProfile.rating_quantity,
      comments: modifiedComments,
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// comment for testing
app.get('/api/comments/all', async (req, res) => {
  try {
    let comments = await Comment.find().exec();
    if (comments.length === 0) {
      return res.status(404).send('No comments found.');
    }
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// recommendation return 3 eatery profiles
app.get('/api/recommendation', async (req, res) => {
  try {
    let result = await EateryProfile.aggregate([
      { $match: { is_public: true, geo_coordinates: { $exists: true } } },
      { $sample: { size: 3 } },
    ]);
    result = result.map((eatery) => ({
      ...eatery,
      url: `https://www.yumyum.top/eateryDetails/${eatery.userId}`,
    }));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// search will return a list of eateries that match the search query, the search query can be the eatery name, cuisine, or address
app.get('/api/search/eatery', async (req, res) => {
  const {
    keywords,
    cuisineType,
    lat,
    lng,
    distance,
    date,
    startTime,
    endTime,
  } = req.query;

  let searchQuery = {};

  if (keywords && keywords.trim() !== '') {
    searchQuery = {
      $or: [
        { username: { $regex: new RegExp(keywords, 'i') } },
        { address: { $regex: new RegExp(keywords, 'i') } },
      ],
    };

    if (cuisineType) {
      if (cuisineType.length > 0 && cuisineType[0] !== '') {
        cuisineType.forEach((type) => {
          searchQuery.$or.push({ cuisine: { $regex: new RegExp(type, 'i') } });
        });
      }
    }
  }

  try {
    // search Query
    let result = [];
    result = await EateryProfile.find({
      ...searchQuery,
      is_public: true,
      geo_coordinates: { $exists: true },
    }).limit(200); // at most 200 result

    //do filter
    //distance and address
    if (lat && lng && distance && parseInt(distance) !== 50) {
      // Filter by distance
      result = result.filter((result) => {
        const distanceInMeters = geolib.getDistance(
          { latitude: lat, longitude: lng },
          {
            latitude: result.geo_coordinates.coordinates[1],
            longitude: result.geo_coordinates.coordinates[0],
          },
        );
        return distanceInMeters / 1000 <= distance; // Convert distance to kilometers
      });
    }
    // cusine type
    if (cuisineType) {
      if (cuisineType.length > 0 && cuisineType[0] !== '') {
        result = result.filter((result) => {
          // Check if the eatery's cuisine array contains any of the cuisineTypes
          return cuisineType.some((type) => result.cuisine.includes(type));
        });
      }
    }
    // opening hours
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// should always be at the end of the code
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
