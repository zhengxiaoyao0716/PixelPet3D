{
    var ws = new WebSocket("ws://localhost:5000/ws");
    // ws.addEventListener("open", (e) => {
    //     console.log(e);
    // });
    ws.addEventListener("message", function (e) {
        return (function (json) {
            var event = json["event"];
            var data = json["data"];
            ({
                "init": console.log,
                "text": console.log,
                "action": console.log,
            })[event](data);
        })(JSON.parse(e.data));
    });
    // ws.addEventListener("close", (e) => {
    //     console.log(e);
    // });
    setTimeout(function () { return ws.send("Hello"); }, 1000);
}