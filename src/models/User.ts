export class User {
    socketId: string
    username?: string
    roomName?: string

    constructor(socketId: string, username?: string, roomName?: string) {
        this.username = username
        this.socketId = socketId
        this.roomName = roomName
    }
}
