const mongoose = require("mongoose")
const schema = mongoose.Schema;

const MessageSchema = new schema(
    {
        conversationId: { type: schema.Types.ObjectId },
        sender: { type: String },
        senderName: { type: String },
        message: { type: String }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Message", MessageSchema, "Messages");