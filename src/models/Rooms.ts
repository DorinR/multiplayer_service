import { Room } from "./Room"

export class Rooms {
    rooms: Room[]

    constructor() {
        this.rooms = []
    }

    add(room: Room) {
        this.rooms.push(room)
    }

    printAll() {
        console.log("*** Users ***")
        this.rooms.forEach((room) => {
            console.log(`*** room: ${room.roomName} ***`)
            console.log(room.players)
        })
        console.log("--- ===== ---")
    }
}
