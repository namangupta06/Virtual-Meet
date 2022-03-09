const CategoryDto = require("../dtos/categoryDto");
const ChannelDto = require("../dtos/channelDto");
const rolesDto = require("../dtos/rolesDto");
const RoomModel = require("../models/RoomModel");
const UserRolesModel = require("../models/UserRolesModel");
const GrpService = require("../Services/GrpService");
const RoomService = require("../Services/RoomService");

class GrpController {
    async createCat(req, res) {
        const { roomId, name, role } = req.body;

        if (!name || !role) {
            res.status(400).json({ message: "All fields are required" })
        }

        const Cat = await GrpService.CreateCat({
            roomId,
            name,
            role
        })

        return res.json(new CategoryDto(Cat));
    }

    async createRole(req, res) {
        const { roomId, userId, role } = req.body;

        if (!userId || !role) {
            res.status(400).json({ message: "UserId and roomId is required for a role" })
        }

        const user = await GrpService.createRole({
            roomId,
            userId,
            role
        })

        return res.json(new rolesDto(user))
    }

    async createChannel(req, res) {
        const { categoryId, name, type, roomId } = req.body;

        if (!categoryId || !name || !type) {
            res.status(400).json({ message: "Category id and channel name is req for a channel" })
        }

        const channel = await GrpService.createChannel({
            categoryId,
            name,
            roomId,
            type
        })

        return res.json(new ChannelDto(channel))
    }

    async getRoom(req, res) {
        const room = await GrpService.getRoom(req.params.roomId)
        const allCat = room.map((rooms) => new CategoryDto(rooms))

        return res.json(allCat)
    }

    async getChannels(req, res) {
        const channels = await GrpService.getChannels(req.params.roomId)
        const allChannels = channels.map((channel) => new ChannelDto(channel))

        return res.json(allChannels)
    }

    async generateInviteCode(req, res) {
        const { roomId } = req.body;

        const code = await GrpService.generateCode()

        const Invites = await GrpService.createCodes({
            roomId,
            code
        })

        return res.json(Invites);
    }

    async checkInviteCode(req, res) {
        const { roomId } = req.body;

        const codedet = await GrpService.getCodeData(roomId)
        return res.json(codedet);
    }

    async getAllInviteCode(req, res) {
        const { roomId } = req.body;

        const codedet = await GrpService.getAllCodeData(roomId)
        return res.json(codedet);
    }

    async verifyInvitecode(req, res) {
        const { code, userId } = req.body;

        var exptime = 604800000;

        const data = await GrpService.getCodeInfo(code);

        if (Date.now() - Date.parse(data.createdAt) > exptime) {
            await GrpService.updateCodeInfo(code)
            res.status(400).json({
                message: "Invite Code expired!"
            })
        }

        const Id = data.roomId.toString();

        const room = await RoomService.updateRoomInfo({ Id, userId });
        await GrpService.updateUsedPeople(code);

        return res.json(room)
    }

    async expireCode(req, res) {
        const { code } = req.body;
        const delCode = await GrpService.updateCodeInfo(code)

        return res.json(delCode);
    }

    async getUserRoles(req, res) {
        const { roomId, userId } = req.body;

        const user = await GrpService.getUserRoles({ roomId, userId });
        return res.json(user);
    }

    async leaveServer(req, res) {
        const { roomId, userId } = req.body;

        const update = await RoomModel.findOneAndUpdate(
            { _id: roomId },
            {
                $pull: {
                    members: userId
                }
            }
        )
        return res.json(update)
    }

    async deleteRole(req, res) {
        const { roomId, userId } = req.body;
        const del = await UserRolesModel.findOneAndDelete({ roomId }, { userId });
        return res.json(del);
    }

    async updateRole(req, res) {
        const { roomId, userId, role } = req.body;

        const user = await GrpService.updateRoles({ roomId, userId, role });
        return res.json(user);
    }

    async updateUserRole(req, res) {
        const { roomId, userId, role } = req.body;

        const user = await GrpService.updateUserRole({ roomId, userId, role });
        return res.json(user);
    }

    async getUserByRole(req, res) {
        const { roomId, role } = req.body;

        const user = await GrpService.getUserByRole({ roomId, role });
        return res.json(user);
    }

    async updateCat(req, res) {
        const { catId, name, role } = req.body;

        const cat = await GrpService.updateCat({ catId, name, role });
        return res.json(cat);
    }

    async updateChannel(req, res) {
        const { channelId, name } = req.body;

        const channel = await GrpService.updateChannel({ channelId, name });
        return res.json(channel);
    }

    async deleteCat(req, res) {
        const { catId, userId } = req.body;

        const cat = await GrpService.deleteCat({ catId, userId });
        return res.json(cat);
    }

    async deleteChannel(req, res) {
        const { channelId } = req.body;

        const channel = await GrpService.deleteChannel({ channelId });
        return res.json(channel);
    }
}

module.exports = new GrpController();