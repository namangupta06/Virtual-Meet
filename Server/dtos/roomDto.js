class roomDto{
    id;
    server;
    dm;
    members;
    admin;
    createdAt;

    constructor(room) {
        this.id = room.id;
        this.server = room.server;
        this.dm = room.dm;
        this.members = room.members;
        this.admin = room.admin;
        this.createdAt = room.createdAt;
    }
}

module.exports = roomDto;