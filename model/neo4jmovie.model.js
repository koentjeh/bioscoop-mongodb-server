class Movie {

    constructor(_id, title, tagline, document){
        this._id = _id;
        this.title = title;
        this.tagline = tagline;

        if (document) {
            this.description = document.description;
            this.imagePath = document.imagePath;
            this.castIds = document.castIds;
        }
    }
}

module.exports = Movie;