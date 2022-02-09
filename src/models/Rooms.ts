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
        this.rooms[room.roomName] = room
    }

    remove(roomId: string) {
        delete this.rooms[roomId]
    }

    exists(roomName: string) {
        return this.rooms.hasOwnProperty(roomName)
    }

    getRoomByRoomName(roomName: string) {
        if (!this.exists(roomName)) {
            return
        }
        return this.rooms[roomName]
    }

    isRoomJoinable(roomName: string): IsRoomJoinableResponse {
        const room: Room = this.rooms[roomName]
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

    removeUserFromRoom(roomName: string, userSocketId: string) {
        const room = this.rooms[roomName]
        const updatedPlayersList = room.players.filter((player) => player !== userSocketId)
        if (updatedPlayersList.length === 0) {
            delete this.rooms[roomName]
        } else {
            this.rooms[roomName] = new Room(roomName, updatedPlayersList[0])
        }
    }

    addUserToRoom(roomName: string, userSocketId: string): AddUserResponse {
        if (roomName in this.rooms) {
            if (this.rooms[roomName].players.length > 1) {
                return {
                    error: {
                        message: "Room already full",
                    },
                }
            } else {
                this.rooms[roomName].players.push(userSocketId)
                return {
                    room: this.rooms[roomName],
                }
            }
        } else {
            const room = new Room(roomName, userSocketId)
            this.rooms[roomName] = room
            return {
                room: this.rooms[roomName],
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
