export class User {
    socketId: string
    username?: string
    roomNumber?: number

    constructor(socketId: string, username?: string, roomNumber?: number) {
        this.username = username
        this.socketId = socketId
        this.roomNumber = roomNumber
    }
}
