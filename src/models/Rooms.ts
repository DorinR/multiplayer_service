import { Room } from "./Room"

type AddUserResponse = {
    room?: Room
    error?: {
        message: string
    }
}

type IsRoomJoinableResponse = {
    isJoinable: boolean
    message?: string
}

export class Rooms {
    rooms: Record<number, Room>

    constructor() {
        this.rooms = {}
    }

    add(room: Room) {
        this.rooms[room.roomNumber] = room
    }

    remove(roomId: string) {
        delete this.rooms[roomId]
    }

    exists(roomNumber: number) {
        return this.rooms.hasOwnProperty(roomNumber)
    }

    getRoomByRoomNumber(roomNumber: number) {
        if (!this.exists(roomNumber)) {
            return
        }
        return this.rooms[roomNumber]
    }

    isRoomJoinable(roomNumber: string): IsRoomJoinableResponse {
        const room: Room = this.rooms[roomNumber]
        if (!room) {
            return {
                isJoinable: false,
                message: "Room does not exist",
            }
        }
        if (room.players.length > 1) {
            return {
                isJoinable: false,
                message: "Room is full",
            }
        } else {
            return {
                isJoinable: true,
            }
        }
    }

    removeUserFromRoom(roomNumber: number, userSocketId: string) {
        const room = this.rooms[roomNumber]
        const updatedPlayersList = room.players.filter((player) => player !== userSocketId)
        if (updatedPlayersList.length === 0) {
            delete this.rooms[roomNumber]
        } else {
            this.rooms[roomNumber] = new Room(roomNumber, updatedPlayersList[0])
        }
    }

    addUserToRoom(roomNumber: number, userSocketId: string): AddUserResponse {
        if (roomNumber in this.rooms) {
            if (this.rooms[roomNumber].players.length > 1) {
                return {
                    error: {
                        message: "Room already full",
                    },
                }
            } else {
                this.rooms[roomNumber].players.push(userSocketId)
                return {
                    room: this.rooms[roomNumber],
                }
            }
        } else {
            const room = new Room(roomNumber, userSocketId)
            this.rooms[roomNumber] = room
            return {
                room: this.rooms[roomNumber],
            }
        }
    }

    printAll() {
        console.log("*** Rooms ***")
        Object.entries(this.rooms).forEach((room) => {
            console.log(JSON.stringify(room))
        })
        console.log("--- ===== ---")
    }
}
