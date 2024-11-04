import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Eatery',
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    selected_items: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      default: 'active',
    },
    setid: {
      type: String,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    redeemTime: {
      type: Date,
      default: null,
    },
    redeemLocation: {
      type: String,
      default: null,
    },
    hashcode: {
      type: String,
      default: null,
    }, 
  });
  
const Voucher = mongoose.model('Voucher', voucherSchema);

export { Voucher }
