class Actor {

    constructor(_id, name, document){
        this._id = _id;
        this.name = name;

        if (document) {
            this.bio = document.bio;
            this.dateOfBirth = document.dateOfBirth;
            this.nationality = document.nationality;
            this.imagePath = document.imagePath;
        }
    }
}

module.exports = Actor;