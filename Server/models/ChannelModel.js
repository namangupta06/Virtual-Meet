const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ChannelSchema = new Schema(
    {
        categoryId: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        roomId: { type: Schema.Types.ObjectId },
        type: { type: String, required: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("channel", ChannelSchema, "channels");