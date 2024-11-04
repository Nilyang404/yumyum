import mongoose from 'mongoose';
const setVoucherSchema = new mongoose.Schema({
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
    setid: {
        type: String,
        required: true,
    },
    setids: {
        type: Array,
        required: true,
    },
    repeated : {
        type: Boolean,
        default: false,
    },
    quantity: {
        type: Number,
        required: true,
    },
    remainQuantity: {
        type: Number,
        required: true,
    },

});
const setVoucher = mongoose.model('setVoucher', setVoucherSchema);
export { setVoucher }