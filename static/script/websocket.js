{
    if (location.host == "") {
        throw new Error("WebSocket was closed.");
    }

    var handlers = {
        "/info/get": function (data) {
            // expect: %s: %s\nAuthor: %s\nAddress: %s
            var infoPanel = document.querySelector("#infoPanel");
            data.split("\n").forEach(function(line) {
                var p = document.createElement("p");
                infoPanel.appendChild(p);
                p.textContent = line;
            });
        },
        "text": console.log,
        "action": console.log,
    };

    var ws = new WebSocket("ws://localhost:5000/ws");
    // ws.addEventListener("open", (e) => {
    //     console.log(e);
    // });
    ws.addEventListener("message", function (e) {
        return (function (json) {
            var handler = handlers[json["event"]];
            handler ? handler(json["data"]) : console.warn("No handler for:", json);
        })(JSON.parse(e.data));
    });
    // ws.addEventListener("close", (e) => {
    //     console.log(e);
    // });
    setTimeout(function () { return ws.send("Hello"); }, 1000);
}