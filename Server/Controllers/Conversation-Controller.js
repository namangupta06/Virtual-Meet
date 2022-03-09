const conversationDto = require('../dtos/conversationDto');
const conversation = require('../models/ConversationModel')
const Message = require('../models/MessageModel')

class ConversationController {

    async checkCs(req, res) {
        const { senderId, receiverId } = req.body;

        const check = await conversation.find({ members: { $all: [senderId, receiverId] } })
        if (await conversation.find({ members: { $all: [senderId, receiverId] } }).count() > 0) {
            return res.json(check)
        }
        else
            return res.json(false)

    }

    async chatApp(req, res) {

        const { senderId, receiverId } = req.body;

        try {
            const newConversation = await conversation.create({
                members: [senderId, receiverId],
            })
            return res.status(200).json(new conversationDto(newConversation))
        } catch (error) {
            res.status(500).json({ message: "Conversation error" })
        }
    }

    async getIds(req, res) {
        try {
            const Conversation = await conversation.find({
                members: { $in: [req.params.userId] }
            })
            return res.status(200).json(Conversation)
        } catch (error) {
            res.status(500).json({ message: "cannot fetch your chats" })
        }
    }

    async getConversation(req, res) {
        try {
            const data = await conversation.findById(req.params.convId);
            return res.json(data);
        } catch (error) {
            res.json({ message: error })
        }
    }

    async sendChats(req, res) {
        const newMessage = new Message(req.body)

        try {
            const savedmessage = await newMessage.save()
            return res.status(200).json(savedmessage)
        } catch (error) {
            res.status(500).json({ message: "message can't be sent" })
        }
    }

    async getChats(req, res) {
        try {
            const messages = await Message.find({
                conversationId: req.params.conversationId
            })
            return res.status(200).json(messages)
        } catch (error) {
            res.status(500).json({ message: "chats cannot be synced" })
        }
    }
}

module.exports = new ConversationController()