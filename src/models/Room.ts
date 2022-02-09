export class Room {
    roomName: string
    players: string[]

    constructor(roomName: string, firstPlayerId: string) {
        this.roomName = roomName
        this.players = [firstPlayerId]
    }
}
