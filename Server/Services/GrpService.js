const CategoryModel = require("../models/CategoryModel");
const UserRolesModel = require("../models/UserRolesModel");
const ChannelModel = require("../models/ChannelModel")

const crypto = require('crypto');
const InviteCodesModel = require("../models/InviteCodesModel");
const RoomModel = require("../models/RoomModel");

class GrpService {
    async CreateCat(data) {
        const { roomId, name, role } = data;

        const cat = await CategoryModel.create({
            roomId,
            name,
            role
        })

        return cat;
    }

    async createRole(data) {
        const { roomId, userId, role } = data;

        const user = await UserRolesModel.create({
            roomId,
            userId,
            role
        })

        return user;
    }

    async createChannel(data) {
        const { categoryId, name, type, roomId } = data;

        const channel = await ChannelModel.create({
            categoryId,
            name,
            roomId,
            type
        })

        return channel;
    }

    async getRoom(data) {
        const roomId = data;

        const room = await CategoryModel.find({ roomId })

        return room;
    }

    async getChannels(data) {
        const roomId = data;

        const channel = await ChannelModel.find({ roomId })

        return channel;
    }

    async generateCode() {
        const code = crypto.randomInt(100000, 999999)
        return code;
    }

    async createCodes(data) {
        const { roomId, code } = data;

        const Invites = await InviteCodesModel.create({
            roomId,
            code,
            expired: false,
            used: 0
        })

        return Invites;
    }

    async getCodeData(data) {
        const roomId = data;
        const codeInfo = await InviteCodesModel.find({ roomId, expired: false })
        return codeInfo;
    }

    async getAllCodeData(data) {
        const roomId = data;
        const codeInfo = await InviteCodesModel.find({ roomId })
        return codeInfo;
    }

    async getCodeInfo(data) {
        const code = data;

        const CodeInfo = await InviteCodesModel.findOne({ code });
        return CodeInfo;
    }

    async updateCodeInfo(data) {
        const code = data;

        await InviteCodesModel.findOneAndUpdate({ code }, { expired: true });
    }

    async getUserRoles(data) {
        const { roomId, userId } = data;

        const user = await UserRolesModel.find({ roomId, userId });
        return user;
    }

    async updateUsedPeople(data) {
        const code = data;

        await InviteCodesModel.findOneAndUpdate(
            {
                code
            },
            {
                $inc: {
                    used: 1
                }
            }
        )
    }

    async updateRoles(data) {
        const { roomId, userId, role } = data;

        const user = await UserRolesModel.find({ roomId, userId });

        const room = await RoomModel.findOne({ _id: roomId })

        if (!room.roles.includes(role))
            await RoomModel.updateOne({ _id: roomId }, { $push: { roles: role } })

        if (!user[0].role.includes(role)) {
            const userrole = await UserRolesModel.updateOne(
                {
                    _id: user[0]._id.toString()
                },
                {
                    $push: {
                        role
                    }
                }
            )
            return userrole;
        }
    }

    async updateUserRole(data) {
        const { roomId, userId, role } = data;

        const user = await UserRolesModel.find({ roomId, userId });

        if (user[0].role.includes(role)) {
            const userrole = await UserRolesModel.updateOne(
                {
                    _id: user[0]._id.toString()
                },
                {
                    $pull: {
                        role
                    }
                }
            )
            return userrole;
        }
    }

    async getUserByRole(data) {
        const { roomId, role } = data;

        const user = await UserRolesModel.find({ roomId, role: { $all: [role] } });
        return user;
    }

    async updateCat(data) {
        const { catId, name, role } = data;

        const cat = await CategoryModel.updateMany(
            { _id: catId },
            {
                $set: {
                    role,
                    name
                }
            }
        )
        return cat;
    }

    async updateChannel(data) {
        const { channelId, name } = data;

        const channel = await ChannelModel.updateOne({ _id: channelId }, { $set: { name } });
        return channel;
    }

    async deleteCat(data) {
        const { catId, userId } = data;

        const category = await CategoryModel.findOne({ _id: catId });

        const user = await UserRolesModel.find({ roomId: category.roomId.toString(), userId });

        if (user[0].role.includes(category.role)) {
            await UserRolesModel.updateOne(
                {
                    _id: user[0]._id.toString()
                },
                { $pull: { role: category.role } }
            )
        }
        await RoomModel.updateOne({ _id: category.roomId.toString() }, { $pull: { roles: category.role } })

        const cat = await CategoryModel.findOneAndDelete({ _id: catId });
        await ChannelModel.findOneAndDelete({ categoryId: catId })
        return cat;
    }

    async deleteChannel(data) {
        const { channelId } = data;

        const channel = await ChannelModel.findOneAndDelete({ _id: channelId });
        return channel;
    }
}

module.exports = new GrpService();