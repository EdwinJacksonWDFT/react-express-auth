class User {
    constructor ({username, password, email}) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    match (username, password) {
        return this.username === username && this.password === password;
    }
}

module.exports = User;