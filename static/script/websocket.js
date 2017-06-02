; (function () {
    // @ts-ignore
    var pp3d = window.pp3d;
    var model = pp3d.initModel();
    addEventListener("load", function () {
        model.load(pp3d.asset.model.test[0]);
        console.log(model.dump());
    });

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
        "/screen/render": function (data) {
            var handler = ({
                "menu": function (data) { model.load(pp3d.asset.model.menu[data.name]); },
                "clock": function (data) {
                    model.clean();
                    Array.prototype.forEach.call(data.value.slice(0, 4), function (v, i) {
                        model.load(pp3d.asset.model.number[v][0], [pp3d.colors[i % 2]], [i << 2, 9, 11], 'xyz', true);
                    });
                    Array.prototype.forEach.call(data.value.slice(5, 7) + data.value.slice(8, 10), function (v, i) {
                        model.load(pp3d.asset.model.number[v][0], [pp3d.colors[i % 2 + 2]], [i << 2, 0, 0], 'xyz', true);
                    });
                    Array.prototype.forEach.call(data.value.slice(11, 13) + data.value.slice(14, 16), function (v, i) {
                        model.load(pp3d.asset.model.number[v][0], [pp3d.colors[i % 2 + 4]], [(i << 2) - 1, 0, -1], 'xzY', true);
                    });
                },
                "pet": function (data) { model.load(pp3d.asset.model.test[0]); },
            })[data.type];
            handler && handler(data);
        },
    };
    if (location.host === "") {
        handlers["/info/get"]("%s: %s\nAuthor: %s\nAddress: %s");

        var stacks = [
            { type: "pet" },
            { type: "clock", value: "9876-05-04 03:21:" },
            { type: "menu", name: "CLOCK" },
            { type: "menu", name: "HOME" },
        ];
        function runTimeout() {
            setTimeout(function () {
                handlers["/screen/render"](stacks.pop());
                stacks.length && runTimeout();
            }, 1000);
        }
        addEventListener("load", runTimeout);

        throw new Error("WebSocket was closed.");
    }

    var ws = new WebSocket("ws" + location.origin.slice(4) + "/ws");

    ws.addEventListener("open", function (e) {
        // var interval = setInterval(function () { ws.send("Hello"); console.log("U said 'ping'."); }, 3000);
        // ws.addEventListener("close", function (e) {
        //     clearInterval(interval);
        // });
    });
    ws.addEventListener("message", function (e) {
        return (function (json) {
            var handler = handlers[json["event"]];
            handler ? handler(json["data"]) : console.warn("No handler for:", json);
        })(JSON.parse(e.data));
    });

    addEventListener("load", function () {
        var controlPanel = document.querySelector("#controlPanel");
        ["center", "up", "down", "left", "right"].forEach(function (button) {
            controlPanel.querySelector("#" + button).addEventListener("click", function (e) {
                ws.send("/control/" + button);
            });
        });
    });
})();