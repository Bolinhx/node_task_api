const blacklist = new Set(); // Armazena tokens inválidos

module.exports = {
    add: (token) => blacklist.add(token),
    check: (token) => blacklist.has(token),
};
