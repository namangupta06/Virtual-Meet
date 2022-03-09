const roomDto = require("../dtos/roomDto");
const RoomService = require("../Services/RoomService");

class RoomsController {

    async create(req, res) {
        const { server, dm, members, roles } = req.body;

        if (!server || !members) {
            return res.status(400).json({ message: "server details are required" });
        }

        const room = await RoomService.create({
            server,
            dm,
            members,
            roles
        })

        res.json(new roomDto(room))
    }

    async updateRoom(req, res) {
        const { dm, members } = req.body;

        const update = await RoomService.update({
            dm,
            members
        })

        return res.json(update)
    }

    async getRooms(req, res) {

        try {

            const rooms = await RoomService.getAllRooms(req.params.userId)
            const allRooms = rooms.map((room) => new roomDto(room))
            return res.json(allRooms)

        } catch (error) {
            res.status(400).json(error)
        }

    }

    async getRoomId(req, res) {
        try {
            const room = await RoomService.getRoomUId(req.params.roomId)
            return res.json(room)
        } catch (error) {
            res.status(400).json(error)
        }
    }

    async updateName(req, res) {
        const { id, serverName } = req.body;
        try {
            const room = await RoomService.updateName({ id, serverName });
            return res.json(room)
        } catch (error) {
            res.status(400).json(error)
        }
    }

    async deleteRoom(req, res) {
        const { roomId } = req.body;
        const room = await RoomService.deleteRoom({roomId})

        return res.json(room);
    }

}

module.exports = new RoomsController();