import { User } from "./User"

export class Users {
    users: User[]
    usersIds: string[]

    constructor() {
        this.users = []
        this.usersIds = []
    }

    add(user: User) {
        if (!this.usersIds.includes(user.socketId)) {
            this.users.push(user)
            this.usersIds.push(user.socketId)
        }
    }

    remove(socketId: string) {
        if (!this.usersIds.includes(socketId)) {
            return
        }
        this.users = this.users.filter((user) => user.socketId !== socketId)
        this.usersIds = this.usersIds.filter((socketId) => socketId !== socketId)
    }

    printAll() {
        console.log("*** Users ***")
        this.users.forEach((user) => {
            console.log(user.username)
        })
        console.log("--- ===== ---")
    }
}
