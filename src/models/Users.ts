import { User } from "./User"

export class Users {
    users: Record<string, User>

    constructor() {
        this.users = {}
    }

    add(user: User) {
        this.users[user.socketId] = user
    }

    remove(socketId: string) {
        delete this.users[socketId]
    }

    leaveRoom(socketId: string) {
        const user = this.users[socketId]
        delete user.roomName
    }

    contains(socketId: string) {
        return socketId in this.users
    }

    getUserWithId(socketId: string) {
        return this.users[socketId]
    }

    printAll() {
        console.log("*** Users ***")
        Object.entries(this.users).map((user) => {
            console.log(JSON.stringify(user))
        })
        console.log("--- ===== ---")
    }
}
