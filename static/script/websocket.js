{
    if (location.host === "") {
        throw new Error("WebSocket was closed.");
    }

    var handlers = {
        "/info/get": function (data) {
            // expect: %s: %s\nAuthor: %s\nAddress: %s
            var infoPanel = document.querySelector("#infoPanel");
            data.split("\n").forEach(function (line) {
                var p = document.createElement("p");
                infoPanel.appendChild(p);
                p.textContent = line;
            });
        },
        "text": function () { console.log("Pet said 'pong'"); },
        "action": console.log,
    };

    var ws = new WebSocket("ws" + location.origin.slice(4) + "/ws");

    ws.addEventListener("open", function (e) {
        var interval = setInterval(function () { ws.send("Hello"); console.log("U said 'ping'."); }, 3000);
        ws.addEventListener("close", function (e) {
            clearInterval(interval);
        });
    });
    ws.addEventListener("message", function (e) {
        return (function (json) {
            var handler = handlers[json["event"]];
            handler ? handler(json["data"]) : console.warn("No handler for:", json);
        })(JSON.parse(e.data));
    });
}