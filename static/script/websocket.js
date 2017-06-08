; (function () {
    // @ts-ignore
    var pp3d = window.pp3d;
    var model = pp3d.initModel();
    var pet;

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
        "/screen/render": (function () {
            var animationFrame;
            var handlers = {
                "menu": function (data) { model.load(pp3d.asset.model.menu[data.name]); },
                "pet": function (data) {
                    pet = pp3d.asset.model.pet[data.name];
                    var frame = 0;
                    (function animate() {
                        pet.action.random(model, frame++);
                        animationFrame = requestAnimationFrame(animate);
                    })();
                },
                "clock": function (data) {
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
                "game": function (data) {
                    var value = data.value;
                    var actions = {
                        "U": pet.action.jump,
                        "D": pet.action.squat,
                        "L": pet.action.waggleLeft,
                        "R": pet.action.waggleRight,
                    };
                    var title = pp3d.asset.model.game[data.name];
                    var colors = title[1];

                    var frame = 0;
                    (function animate() {
                        if (title) {
                            if (frame % 10 == 0) {
                                var index = frame / 10;
                                if (index <= 6) {
                                    model.load(
                                        title[0],
                                        colors.slice(index % colors.length).concat(colors.slice(0, index % colors.length)),
                                        [0, 5, 7 + index % 2]
                                    );
                                } else if (index == 9) {
                                    title = null;
                                    frame = -1;
                                }
                            }
                        } else if (actions[value[0]](model, frame)) {
                            value = value.slice(1);
                            frame = -1;
                            if (value[0] == null) {
                                model.load(pet.stand);
                                return;
                            }
                        }
                        frame++;
                        animationFrame = requestAnimationFrame(animate);
                    })();
                },
            };
            return function (str) {
                var data = JSON.parse(str);
                var handler = (handlers)[data.type];
                if (handler) {
                    cancelAnimationFrame(animationFrame);
                    model.clean();
                    handler(data);
                }
            };
        })(),
    };
    if (location.host === "") {
        handlers["/info/get"]("%s: %s\nAuthor: %s\nAddress: %s");

        var stacks = [
            // pet
            { type: "pet", name: "PiPi" },
            // game
            { type: "none" }, { type: "none" },
            { type: "game", name: "lose", value: "DULR" },
            { type: "none" }, { type: "none" },
            { type: "game", name: "win", value: "RLUD" },
            { type: "none" }, { type: "none" },
            { type: "game", name: "pass", value: "L" },
            { type: "none" }, { type: "none" },
            { type: "game", name: "start", value: "UDLR" },
            // clock
            { type: "clock", value: "9876-05-04 03:21:" },
            // menu
            { type: "menu", name: "CLOCK" },
            { type: "menu", name: "HOME" },
            // pet
            { type: "pet", name: "PiPi" },
        ];
        function runTimeout() {
            setTimeout(function () {
                handlers["/screen/render"](JSON.stringify(stacks.pop()));
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
            handler ? handler(json["data"]) : json.event.endsWith('/emit') || console.warn("No handler for:", json);
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