class ChannelDto {
    id;
    categoryId;
    roomId;
    name;
    type;

    constructor(channel) {
        this.id = channel.id;
        this.categoryId = channel.categoryId;
        this.roomId = channel.roomId;
        this.name = channel.name;
        this.type = channel.type;
    }
}

module.exports = ChannelDto;