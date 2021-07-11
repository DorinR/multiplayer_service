export class Room {
    roomNumber: number
    players: string[]

    constructor(roomNumber: number, firstPlayerId: string) {
        this.roomNumber = roomNumber
        this.players = [firstPlayerId]
    }
}
