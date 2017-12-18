class Room {

    constructor(_id, roomNumber, document){
        this._id = _id;
        this.roomNumber = roomNumber;

        if (document) {
	        this.seats = document.seats;
        }
    }
}

module.exports = Room;