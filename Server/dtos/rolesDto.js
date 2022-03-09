class RolesDto{
    id;
    roomId;
    userId;
    role;

    constructor(role) {
        this.id = role.id;
        this.role = role.role;
        this.roomId = role.roomId;
        this.userId = role.userId;
    }
}

module.exports = RolesDto;