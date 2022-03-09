const UserModel = require("../models/UserModel");

class UserService {

    async findUser(data) {
        const user = await UserModel.findOne(data)
        return user;
    }

    async createUser(data) {
        const user = await UserModel.create(data)
        return user
    }

    async findUserId(data) {
        const user = await UserModel.findById(data)
        return user
    }

}

module.exports = new UserService();