var peerId = "hyp-" + Math.floor(Math.random() * 1000000)
var peer = new Peer(peerId);
var nm = ""
var hosting = false
var typing = false
var typingTimeout
peer.on('open', function(id) {
    console.log('My peer ID is: ' + id);
});
let conxs = []

function textChange() {
    clearTimeout(typingTimeout)
    if (typing == false) {
        typing = true
        typingBeginMessage()

    }
    if (window.event.keyCode === 13) {
        send()
    }
    typingTimeout = setTimeout(() => {
        typing = false
        typingEndMessage()
    }, 2000);
}

function typingBeginMessage() {
    var msg = new Message("typingStart")
    conxs.forEach(conx => {
        conx.send(msg)
    })

}

function typingEndMessage() {
    var msg = new Message("typingEnd")
    conxs.forEach(conx => {
        conx.send(msg)
    })

}

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
    typingEndMessage()
    var msg = new Message("message", h.get("#text").value)
    h.get("#text").value = ""
    conxs.forEach(conx => {
        conx.send(msg)
    })
    h.get('#messages').innerHTML += `
    <div class="flex flex-row flex-wrap shrink-0">
    <div class="font-bold text-sky-400 inline shrink-0">${msg.host == "true"
    ? "[HOST]&nbsp;" : ""}</div>
        <div class="font-bold inline shrink-0 ${msg.host == "true"
    ? "text-sky-400" : ""}">${msg.name}:&nbsp;</div>
        <div class="inline shrink-0 whitespace-normal max-w-fit break-all ">&nbsp;${msg.data}</div>
        </div>
        <div class="divider my-0"></div> 
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

var currentlyTyping = []

function receivedMessage(msg) {
    console.log("recieved", msg)
    if (msg.type == "message") {
        h.get('#messages').innerHTML += `
        <div class="flex flex-row flex-wrap shrink-0">
        <div class="font-bold text-sky-400 inline shrink-0">${msg.host == "true"
        ? "[HOST]&nbsp;" : ""}</div>
            <div class="font-bold inline shrink-0 ${msg.host == "true"
        ? "text-sky-400" : ""}">${msg.name}:&nbsp;</div>
            <div class="inline shrink-0 whitespace-normal max-w-fit break-all ">&nbsp;${msg.data}</div>
            </div>
            <div class="divider my-0"></div> 
        `

    } else if (msg.type == "connection") {
        h.get('#messages').innerHTML += `
            <div class="font-bold ${msg.host == "true"
        ? "text-sky-400" : ""}">${msg.name} joined</div>
            <div class="divider my-0"></div> 
        `

    } else if (msg.type == "typingStart") {
        currentlyTyping.push(msg.name)
        rebuildTypingUi()
    } else if (msg.type == "typingEnd") {
        currentlyTyping.splice(currentlyTyping.indexOf(msg.name), 1)
        rebuildTypingUi()
    }
    h.get("#messages").scrollTop = h.get("#messages").scrollHeight;
    console.log(msg.host, msg.user)
    if (hosting) {
        conxs.forEach(conx => {
            console.log(conx)
            if (conx.peer == msg.user) return
            conx.send(msg)
        })
    }
}

function rebuildTypingUi() {
    var names = ""
    currentlyTyping.forEach(e => {
        names += (e + " ")
    })
    h.get('#typing').innerHTML = ""
    if (currentlyTyping.length == 0) return
    h.get('#typing').innerHTML += `
        <div class="font-bold">${names} ${currentlyTyping.length > 1 ? "are" : 'is'} currently typing</div>
        <div class="divider my-0"></div> 
    `

}

class Message {
    constructor(type, msg) {
        this.type = type
        this.user = peerId
        this.data = msg || ""
        this.host = hosting ? "true" : "false"
        this.name = nm || "host"
    }
}