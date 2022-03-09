const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const RolesSchema = new Schema(
    {
        roomId: { type: Schema.Types.ObjectId, required: true },
        userId: { type: Schema.Types.ObjectId, required: true },
        role: { type: Array, required: true }
    }
)

module.exports = mongoose.model("UserRoles", RolesSchema, "User Roles");