import { Room } from "./Room"
import Chance from "chance"
import { Socket } from "socket.io"
import { FnAddUserToRoom } from "src"
import { User } from "./User"
const chance = new Chance()

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

type RoomsType = "public" | "private"

export class Rooms {
    rooms: Record<string, Room>
    type: RoomsType

    constructor(type: RoomsType) {
        this.rooms = {}
        this.type = type
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
        if (room) {
            const updatedPlayersList = room.players.filter((player) => player !== userSocketId)
            if (updatedPlayersList.length === 0) {
                delete this.rooms[roomName]
            } else {
                this.rooms[roomName] = new Room(roomName, updatedPlayersList[0])
            }
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

    /**
     * 2 possibilities
     * 1. User will be added to half-empty room
     * 2. If no such room exists, new room will be created and user added to that room
     */
    joinOnlineGame(socket: Socket, username: string, addUserToRoom: FnAddUserToRoom, user: User) {
        // find half-empty room
        const allExistingRooms = Object.values(this.rooms)
        let roomToJoin: string | null = null
        for (let room of allExistingRooms) {
            if (room.players.length === 1) {
                roomToJoin = room.roomName
            }
        }
        if (!roomToJoin) {
            roomToJoin = this.getUnusedRoomName()
        }

        addUserToRoom(user, username, roomToJoin, socket, this)
        return roomToJoin
    }

    generateTentativeRoomName = () => {
        return `${chance.first().toLowerCase()}-${chance.integer({ min: 1, max: 1000 })}`
    }

    getUnusedRoomName = () => {
        while (true) {
            let tentativeRoomName: string = this.generateTentativeRoomName()
            if (!(tentativeRoomName in this.rooms)) {
                return tentativeRoomName
            }
        }
    }

    printAll() {
        console.log(`*** ${this.type} rooms ***`)
        Object.entries(this.rooms).forEach((room) => {
            console.log(JSON.stringify(room))
        })
        console.log("--- ===== ---")
    }
}
