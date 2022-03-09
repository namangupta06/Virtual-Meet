const CategoryModel = require("../models/CategoryModel");
const ChannelModel = require("../models/ChannelModel");
const InviteCodesModel = require("../models/InviteCodesModel");
const RoomModel = require("../models/RoomModel");
const UserRolesModel = require("../models/UserRolesModel");

class RoomService {

    async create(payload) {
        const { server, dm, members, roles } = payload;

        const room = await RoomModel.create({
            server,
            dm,
            members,
            roles
        })
        return room;
    }

    async update(data) {
        const { dm, members } = data;

        const update = await RoomModel.updateOne({ dm }, { $push: { members } })
        return update;
    }

    async getAllRooms(data) {

        const rooms = await RoomModel.find({
            members: {
                $in: [data]
            }
        })
        return rooms;
    }

    async getRoomUId(data) {
        const room = await RoomModel.findById(data)
        return room;
    }

    async updateRoomInfo(data) {
        const { Id, userId } = data;

        const room = await RoomModel.findById(Id)

        const contain = room.members.includes(userId)

        if (!contain) {
            await RoomModel.updateOne(
                { _id: Id },
                {
                    $push: {
                        members: userId
                    }
                }
            )
        }

        const updatedRoom = await RoomModel.findById(Id);
        return updatedRoom;
    }

    async deleteRoom(data) {
        const { roomId } = data;
        const room = await RoomModel.findOneAndDelete({ _id: roomId })
        await CategoryModel.deleteMany({ roomId })
        await UserRolesModel.deleteMany({ roomId })
        await InviteCodesModel.deleteMany({ roomId })
        await ChannelModel.deleteMany({ roomId })

        return room;
    }

    async updateName(data) {
        const { id, serverName } = data;

        const room = await RoomModel.updateOne(
            { _id: id },
            {
                server: serverName
            }
        )

        return room;
    }

}

module.exports = new RoomService();