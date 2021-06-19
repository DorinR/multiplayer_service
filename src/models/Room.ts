import { User } from "./User"

export class Room {
    roomName: string
    players: User[]

    constructor(roomName: string, firstPlayer: User) {
        this.roomName = roomName
        this.players = [firstPlayer]
    }
}
