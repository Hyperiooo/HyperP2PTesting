var peerId = "hyp-" + Math.floor(Math.random() * 1000000)
var peer = new Peer(peerId);
var nm = ""
var hosting = false
peer.on('open', function(id) {
    console.log('My peer ID is: ' + id);
});
let conxs = []

function host() {
    hosting = true
    h.get("#code").innerHTML = (window.location.toString().includes("index.html") ? window.location : window.location + "index.html") + "#" + peerId
    h.get("#content").classList.remove("hidden")
    h.get("#name").classList.add("hidden")
}

function connect() {
    nm = h.get("#nameval").value
    var val = window.location.hash.replace("#", "")
    var conn = peer.connect(val);
    conxs.push(conn)
    newConnection()
}


peer.on('connection', function(conn) {
    console.log(conn.peer + " connected")
    conxs.push(conn)
    newConnection()
});

function send() {
    var msg = new Message("message", h.get("#text").value)
    conxs.forEach(conx => {
        conx.send(msg)
    })
    h.get('#messages').innerHTML += `
        <div class="font-bold ${msg.host == "true"
    ? "text-sky-400" : ""}">${msg.name}:</div>
        <div>${msg.data}</div>
        <div class="divider"></div> 
    `
    h.get("#messages").scrollTop = h.get("#messages").scrollHeight;

}

function newConnection() {
    h.get("#content").classList.remove("hidden")
    h.get("#name").classList.add("hidden")
    conxs[conxs.length - 1]
    conxs[conxs.length - 1].on("open", e => {
        conxs[conxs.length - 1].on("data", receivedMessage)
        conxs[conxs.length - 1].send(new Message("connection"))
    })
}

function receivedMessage(msg) {
    console.log("recieved", msg)
    if (msg.type == "message") {
        h.get('#messages').innerHTML += `
        <div class="font-bold text-sky-400">${msg.host == "true"
        ? "[HOST]&nbsp;" : ""}</div>
            <div class="font-bold ${msg.host == "true"
        ? "text-sky-400" : ""}">${msg.name}:&nbsp;</div>
            <div>${msg.data}</div>
            <div class="divider"></div> 
        `

    } else if (msg.type == "connection") {
        h.get('#messages').innerHTML += `
            <div class="font-bold ${msg.host == "true"
        ? "text-sky-400" : ""}">${msg.name} joined</div>
            <div class="divider"></div> 
        `

    }
    console.log(msg.host, msg.user)
    if (hosting) {
        conxs.forEach(conx => {
            console.log(conx)
            if (conx.peer == msg.user) return
            conx.send(msg)
        })
    }
}

class Message {
    constructor(type, msg) {
        this.type = type
        this.user = peerId
        this.data = msg
        this.host = hosting ? "true" : "false"
        this.name = nm
    }
}