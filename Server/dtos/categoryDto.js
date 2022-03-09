class CategoryDto {
    id;
    roomId;
    name;
    role;
    members;

    constructor(category) {
        this.id = category.id;
        this.roomId = category.roomId;
        this.name = category.name;
        this.role = category.role;
        this.members = category.members;
    }
}

module.exports = CategoryDto;