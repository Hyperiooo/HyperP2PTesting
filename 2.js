const peer = new Peer();
var currentCall;
peer.on("open", function(id) {
    document.getElementById("uuid").textContent = id;
});

async function callUser() {
    console.log("calling")
        // get the id entered by the user
    const peerId = document.querySelector("input").value; // grab the camera and mic
    document.getElementById("local-video").setAttribute('autoplay', '');
    document.getElementById("local-video").setAttribute('muted', '');
    document.getElementById("local-video").setAttribute('playsinline', '');
    document.getElementById("remote-video").setAttribute('autoplay', '');
    document.getElementById("remote-video").setAttribute('muted', '');
    document.getElementById("remote-video").setAttribute('playsinline', '')
    try {
        const stream = await navigator.mediaDevices.getUserMedia();
        handleSuccess(stream);
        e.target.disabled = true;
    } catch (e) {
        handleError(e);
    }
}

function handleSuccess(stream) {
    // switch to the video call and play the camera preview
    console.log("got video and audio")
    document.getElementById("menu").style.display = "none";
    document.getElementById("live").style.display = "block";
    document.getElementById("local-video").srcObject = stream;
    document.getElementById("local-video").play(); // make the call
    const call = peer.call(peerId, stream);
    call.on("stream", (stream) => {
        document.getElementById("remote-video").srcObject = stream;
        document.getElementById("remote-video").play();
    });
    call.on("data", (stream) => {
        document.querySelector("#remote-video").srcObject = stream;
    });
    call.on("error", (err) => {
        console.log(err);
    });
    call.on('close', () => {
            endCall()
        }) // save the close function
    currentCall = call;
}

function handleError(error) {
    console.log(error, error.name)
    if (error.name === 'OverconstrainedError') {
        const v = constraints.video;
        errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
    } else if (error.name === 'NotAllowedError') {
        errorMsg('Permissions have not been granted to use your camera and ' +
            'microphone, you need to allow the page access to your devices in ' +
            'order for the demo to work.');
    }
    errorMsg(`getUserMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
        console.error(error);
    }
}

peer.on("call", (call) => {
    if (confirm(`Accept call from ${call.peer}?`)) {
        // grab the camera and mic
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                // play the local preview
                document.querySelector("#local-video").srcObject = stream;
                document.querySelector("#local-video").play(); // answer the call
                call.answer(stream); // save the close function
                currentCall = call; // change to the video view
                document.querySelector("#menu").style.display = "none";
                document.querySelector("#live").style.display = "block";
                call.on("stream", (remoteStream) => {
                    // when we receive the remote stream, play it
                    document.getElementById("remote-video").srcObject = remoteStream;
                    document.getElementById("remote-video").play();
                });
            })
            .catch((err) => {
                console.log("Failed to get local stream:", err);
            });
    } else {
        // user rejected the call, close it
        call.close();
    }
});

function endCall() {
    // Go back to the menu
    document.querySelector("#menu").style.display = "block";
    document.querySelector("#live").style.display = "none"; // If there is no current call, return
    if (!currentCall) return; // Close the call, and reset the function
    try {
        currentCall.close();
    } catch {}
    currentCall = undefined;
}