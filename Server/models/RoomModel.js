const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema(
    {
        server: { type: String, required: true, unique: true },
        dm: { type: Boolean },
        members: { type: Array },
        roles: { type: Array }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Room', roomSchema);