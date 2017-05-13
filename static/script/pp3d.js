/**
 * @module pp3d
 * @author zhengxiaoyao0716
 */
; (function () {
    'use strict';

    /**
     * - Read-only properties can only be changed before loaded.
     * - Attributes can would be protected after execute some functions.
     * - Properties with setter can be adjust any time.
     */
    /** @global */
    var pp3d = (function () {
        var win = {
            size: [600, 600],
            winIndex: null,
            clearColor: 0x000000,
        };
        var camera = {
            fov: 90,
            distance: 16,
        };
        return {
            get colors() {
                return [
                    0xFF5252,  //red
                    0x4CAF50,  //green
                    0x03A9F4,  //blue
                    0xE91E63,  //pink
                    0xFFEB3B,  //yellow
                    0x3F51B5,  //indigo
                    0x000000,  //black
                    0x7F7F7F,  //grey
                    0xFFFFFF,  //white
                ];
            },
            sideLen: 16,
            get size() { return win.size; }, set size(v) { win.size = v; },
            get winIndex() { return win.winIndex; }, set winIndex(v) { win.winIndex = v; },
            get clearColor() { return win.clearColor; }, set clearColor(v) { win.clearColor = v; },
            get fov() { return camera.fov; }, set fov(v) { camera.fov = v; },
            get distance() { return camera.distance; }, set distance(v) { camera.distance = v; },
        };
    })();
    pp3d.model = window.PP3DModel || {};

    var scene = new THREE.Scene();

    var renderSence = (function () {
        var container = document.querySelector("#container");

        function newRenderer() {
            var renderer = new THREE.WebGLRenderer();
            addEventListener("load", function () { container.appendChild(renderer.domElement); });
            return renderer;
        }
        function newCamare(index) {
            var camera = new THREE.PerspectiveCamera();
            camera.lookAt(new THREE.Vector3((1 - index) % 2, 0, (2 - index) % 2));
            addEventListener("resize", function () { camera.updateProjectionMatrix(); });
            return camera;
        }
        var renderers = [newRenderer(), newRenderer(), newRenderer(), newRenderer(),];
        var cameras = [newCamare(0), newCamare(1), newCamare(2), newCamare(3)];

        /**
         * @template T
         * @param {string} name
         * @param {T[]} eachOn
         * @param onEach {function (T, number): void}
         */
        function redefineSetter(name, eachOn, onEach) {
            var setter = pp3d.__lookupSetter__(name);
            pp3d.__defineSetter__(name, function (v) { eachOn.forEach(onEach.bind(v)); setter(v); });
            pp3d[name] = pp3d[name];
        }
        redefineSetter("size", renderers, function (renderer, index) {
            renderer.setSize(this[0], this[1]);
            renderer.domElement.style.setProperty("width", "auto");
            renderer.domElement.style.setProperty("height", "auto");
        });
        redefineSetter("winIndex", renderers, function (renderer, index) {
            renderer.domElement.setAttribute("data-pp3d-size", this == index ? "maxim" : this == null ? "medium" : "hidden");
        });
        redefineSetter("clearColor", renderers, function (renderer, index) { renderer.setClearColor(this); });
        redefineSetter("fov", cameras, function (camera, index) { camera.fov = this; camera.updateProjectionMatrix(); });
        redefineSetter("distance", cameras, function (camera, index) { camera.position.set(((index - 1) % 2) * this, 0, ((index - 2) % 2) * this); });
        /*
         * [ [-1, 0, 0], [0, 0, -1], [1, 0, 0], [0, 0, 1]] // cameras
         * { -X: 0,         -Z: 1
         *   +Z: 2,         +X: 3 }  // renderers
         */
        function cameraFromIndex(index) {
            return cameras[[0, 1, 3, 2][index]];
        }
        return function () {
            pp3d.winIndex == null ?
                renderers.forEach(function (renderer, index) { renderer.render(scene, cameraFromIndex(index)); })
                : renderers[pp3d.winIndex].render(scene, cameraFromIndex(pp3d.winIndex));
        };
    })();

    (function render() {
        requestAnimationFrame(render);
        renderSence();
    })();


    // public functions.


    pp3d.resizeDistance = function (visibleLen) {
        pp3d.distance = (visibleLen / Math.tan(Math.PI * pp3d.fov / 360) + visibleLen) / 1.5;
    };

    /**
     * Note: After this function executed, pp3d.sideLen cannot be changed again.
     */
    pp3d.initModel = function (adjustDistance) {
        var sideLen = pp3d.sideLen;
        pp3d.__defineGetter__("sideLen", function () { return sideLen; });

        if (adjustDistance != false) {
            pp3d.resizeDistance(sideLen);
        }

        var group = new THREE.Group();
        scene.add(group);

        // 0, 1, 2  => -1, 0, 1  [- (3 / 2 - 0.5)]
        // 0, 1, 2, 3 => -1.5, -0.5, 0.5, 1.5  [- (4 / 2 - 0.5)]
        // position = index - (sideLen - 1) / 2
        var posFromCoord = (function () {
            var offset = (sideLen - 1) / 2;
            return function (x, y, z) {
                return Array.prototype.map.call(arguments, function (index) { return 1 * (index - offset); });
            };
        })();
        var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        /** @type {THREE.Mesh[][][]} */
        var meshs = Array.apply(null, { length: sideLen }).map(function (_, x) {
            return Array.apply(null, { length: sideLen }).map(function (_, y) {
                return Array.apply(null, { length: sideLen }).map(function (_, z) {
                    var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
                    mesh.position.set.apply(mesh.position, posFromCoord(x, y, z));
                    group.add(mesh);
                    return mesh;
                });
            });
        });

        /**
         * @param onEach {function (THREE.Mesh, number): void}
         */
        function iterMeshs(onEach) {
            for (var x = 0; x < sideLen; x++) {
                var ix = x * sideLen * sideLen;
                for (var y = 0; y < sideLen; y++) {
                    var iy = ix + y * sideLen;
                    for (var z = 0; z < sideLen; z++) {
                        onEach(meshs[x][y][z], iy + z);
                    }
                }
            }
        }

        return {
            load: function (pixs, colors) {
                colors = colors.map(function (hex) { return new THREE.Color(hex); });
                iterMeshs(function (mesh, index) {
                    if (pixs[index] != null) {
                        var mesh = mesh;
                        /** @type {THREE.MeshBasicMaterial} */
                        // @ts-ignore
                        var material = mesh.material;
                        material.color = colors[pixs[index]];
                        mesh.visible = true;
                    } else {
                        mesh.visible = false;
                    }
                });
            },
            dump: function () {
                var pixs = new Array(Math.pow(sideLen, 3));
                var colors = [];
                var colorIndexMap = {};
                iterMeshs(function (mesh, index) {
                    if (!mesh.visible) {
                        return;
                    }
                    /** @type {THREE.MeshBasicMaterial} */
                    // @ts-ignore
                    var material = mesh.material;
                    var color = material.color.getHex();
                    if (colorIndexMap[color] == null) {
                        colorIndexMap[color] = colors.length;
                        colors.push(color);
                    }
                    pixs[index] = colorIndexMap[color];
                });
                return (function (result) {
                    result.toString = function () { return result[0].toString() + "\n" + result[1].toString(); };
                    return result;
                })([pixs, colors]);
            },
            rotate: (function () {
                var vertical = new THREE.Vector3(1, 0, 0);
                var horizon = new THREE.Vector3(0, 1, 0);
                var parallel = new THREE.Vector3(0, 0, 1);
                return {
                    "vertical": function (angle) { group.rotateOnAxis(vertical, angle); },
                    "horizon": function (angle) { group.rotateOnAxis(horizon, angle); },
                    "parallel": function (angle) { group.rotateOnAxis(parallel, angle); },
                    "reset": function () {
                        group.rotation.set(0, 0, 0);
                        group.updateMatrix();
                        pp3d.resizeDistance(pp3d.sideLen);
                    },
                };
            })(),
        };
    };

    // Module defined.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = pp3d;
    } else if (typeof define === 'function' && define.amd) {
        define(function () { return pp3d; });
    } else {
        window.pp3d = pp3d;
    }
})();

addEventListener("load", function () {
    // @ts-ignore
    var pp3d = window.pp3d;
    // pp3d.winIndex = 0;
    var model = pp3d.initModel();
    // model.load(
    //     Array.apply(null, { length: Math.pow(pp3d.sideLen, 3) }).map(function (_, x) {
    //         // @ts-ignore
    //         return Math.random() < 0.3 ? parseInt(Math.random() * pp3d.colors.length) : undefined;
    //     }),
    //     pp3d.colors
    // );
    model.load.apply(model, pp3d.model.test);
    console.log(model.dump());
    var rotateSpeed = 0.1;
    var controls = {
        /** View control */
        "83": function () { model.rotate.reset(); }, // S
        "87": function () { model.rotate.vertical(-rotateSpeed); }, // W
        "88": function () { model.rotate.vertical(+rotateSpeed); }, // X
        "65": function () { model.rotate.horizon(-rotateSpeed); },  // A
        "68": function () { model.rotate.horizon(+rotateSpeed); },  // D
        "69": function () { model.rotate.parallel(-rotateSpeed); }, // E
        "81": function () { model.rotate.parallel(+rotateSpeed); }, // Q
        "90": function () { pp3d.distance++; },                  // Z
        "67": function () { pp3d.distance--; },                  // X
    };
    addEventListener("keydown", function (event) {
        event.stopPropagation();
        // console.log(event.keyCode);
        controls[event.keyCode] && controls[event.keyCode]();
    });
});