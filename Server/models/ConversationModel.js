const mongoose = require("mongoose")
const schema = mongoose.Schema;

const ConversationSchema = new schema(
    {
        members: { type: Array }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("conversation", ConversationSchema, "conversations");