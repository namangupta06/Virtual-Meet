class conversationDto {
    id;
    members;
    createdAt;

    constructor(conversation) {
        this.id = conversation.id;
        this.members = conversation.members;
        this.createdAt = conversation.createdAt;
    }
}

module.exports = conversationDto;