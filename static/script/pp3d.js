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
        function notInitError() { throw Error('Wait for initialise.'); }
        var win = {
            size: [600, 600],
            winIndex: null,
            clearColor: 0x000000,
            lightDistance: 16,
        };
        var camera = {
            fov: 90,
            distance: 16,
        };
        var model = {};
        return {
            get container() { return document.querySelector("#container"); },
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
            get lightDistance() { return win.lightDistance; }, set lightDistance(v) { win.lightDistance = v; },
            /** @type {THREE.Scene} */
            get scene() { return notInitError(); },
            /** @param {number} index @return {THREE.Camera} */
            getCamera: function (index) { notInitError(); },
            /** @param {number} visibleLen */
            adjustDistance: function (visibleLen) { notInitError(); },
            /** @param {boolean} adjustDistance @param {boolean} drawGrid */
            initModel: function (adjustDistance, drawGrid) { notInitError(); },
            get asset() { return { get model() { return model; }, }; }
        };
    })();

    var scene = new THREE.Scene();
    pp3d.__defineGetter__('scene', function () { return scene; });
    scene.fog = new THREE.Fog(0xffffff);
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));

    var renderScene = (function () {
        function newRenderer() {
            var renderer = new THREE.WebGLRenderer();
            addEventListener("load", function () { pp3d.container.appendChild(renderer.domElement); });
            return renderer;
        }
        function newCamare(index) {
            var camera = new THREE.PerspectiveCamera();
            addEventListener("resize", function () { camera.updateProjectionMatrix(); });
            return camera;
        }
        function newSpotLight(index) {
            var spotLight = new THREE.SpotLight(0xffffff, 1, 0, 0.3, 0.3, 1);
            scene.add(spotLight);
            return spotLight;
        }
        var renderers = [newRenderer(), newRenderer(), newRenderer(), newRenderer(),];
        var cameras = [newCamare(0), newCamare(1), newCamare(2), newCamare(3)];
        var spotLights = [newSpotLight(0), newSpotLight(1), newSpotLight(2), newSpotLight(3)];
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
        redefineSetter("winIndex", cameras, function (camera, index) {
            camera.lookAt(new THREE.Vector3((1 - index) % 2, 0, (2 - index) % 2));
            if (this == null) {
                camera.rotateZ((Math.PI / 2) * index + Math.PI * 3 / 4);
            }
        });
        redefineSetter("clearColor", renderers, function (renderer, index) { renderer.setClearColor(this); });
        redefineSetter("fov", cameras, function (camera, index) { camera.fov = this; camera.updateProjectionMatrix(); });
        redefineSetter("distance", cameras, function (camera, index) { camera.position.set(((index - 1) % 2) * this, 0, ((index - 2) % 2) * this); });
        redefineSetter("lightDistance", spotLights, function (spotLight, index) {
            spotLight.position.set(((index << 1) % 4 - 1) * this << 1, this, (((index << 1) - 3) % 2) * this << 1);
        });

        /*
         * [ [-1, 0, 0], [0, 0, -1], [1, 0, 0], [0, 0, 1]] // cameras
         * { -X: 0,         -Z: 1
         *   +Z: 2,         +X: 3 }  // renderers
         */
        pp3d.getCamera = function (index) {
            return cameras[[0, 1, 3, 2][index]];
        };
        return function () {
            pp3d.winIndex == null ?
                renderers.forEach(function (renderer, index) { renderer.render(scene, pp3d.getCamera(index)); })
                : renderers[pp3d.winIndex].render(scene, pp3d.getCamera(pp3d.winIndex));
        };
    })();

    (function render() {
        requestAnimationFrame(render);
        renderScene();
    })();


    // public functions.


    pp3d.adjustDistance = function (visibleLen) {
        pp3d.distance = (visibleLen / Math.tan(Math.PI * pp3d.fov / 360) + visibleLen) / 1.5;
    };

    /**
     * Note: After this function executed, pp3d.sideLen cannot be changed again.
     * @param {boolean} [adjustDistance=true]
     * @param {boolean} [drawGrid=false]
     */
    pp3d.initModel = function (adjustDistance, drawGrid) {
        var sideLen = pp3d.sideLen;
        pp3d.__defineGetter__("sideLen", function () { return sideLen; });
        pp3d.__defineSetter__("sideLen", function () { throw new Error("Can't change sideLen after model initialized."); });

        if (adjustDistance != false) {
            pp3d.adjustDistance(sideLen);
        }
        pp3d.lightDistance = sideLen * 0.8;

        // controller
        (function () {
            var verticalVector = new THREE.Vector3(1, 0, 0);
            var horizonVector = new THREE.Vector3(0, 1, 0);
            var parallelVector = new THREE.Vector3(0, 0, 1);
            function vertical(angle) { scene.rotateOnAxis(verticalVector, angle); }
            function horizon(angle) { scene.rotateOnAxis(horizonVector, angle); }
            function parallel(angle) { scene.rotateOnAxis(parallelVector, angle); }
            var gravityZ = -9.8;
            function setRotation(x, y, z) {
                scene.rotation.set(gravityZ > 0 ? Math.PI : 0, y, z);
                scene.updateMatrix();
                pp3d.adjustDistance(pp3d.sideLen);
            }
            addEventListener('devicemotion', function (e) {
                if (e.accelerationIncludingGravity) {
                    // var x = e.accelerationIncludingGravity.x;
                    // var y = e.accelerationIncludingGravity.y;
                    var z = e.accelerationIncludingGravity.z;
                    if (z != null) {
                        gravityZ = z;
                        setRotation(0, 0, 0);
                    }
                }
            });

            var rotateSpeed = 0.1;
            var controls = {
                /** View control */
                "83": function () { setRotation(0, 0, 0); }, // S
                "87": function () { vertical(-rotateSpeed); }, // W
                "88": function () { vertical(+rotateSpeed); }, // X
                "65": function () { horizon(-rotateSpeed); },  // A
                "68": function () { horizon(+rotateSpeed); },  // D
                "69": function () { parallel(-rotateSpeed); }, // E
                "81": function () { parallel(+rotateSpeed); }, // Q
                "90": function () { pp3d.distance++; },                  // Z
                "67": function () { pp3d.distance--; },                  // X
            };
            addEventListener("keydown", function (event) {
                event.stopPropagation();
                // console.log(event.keyCode);
                controls[event.keyCode] && controls[event.keyCode]();
            });
        })();

        // 0, 1, 2  => -1, 0, 1  [- (3 / 2 - 0.5)]
        // 0, 1, 2, 3 => -1.5, -0.5, 0.5, 1.5  [- (4 / 2 - 0.5)]
        // position = index - (sideLen - 1) / 2
        var offset = (sideLen - 1) / 2;
        function posFromCoord(x, y, z) {
            return Array.prototype.map.call(arguments, function (coord) { return coord - offset; });
        }
        function coordFromPos(x, y, z) {
            return Array.prototype.map.call(arguments, function (pos) { return pos + offset; });
        }
        var start = posFromCoord(0)[0] - 0.5;
        var end = posFromCoord(sideLen)[0] - 0.5;

        var floor = new THREE.Mesh(
            new THREE.CylinderGeometry(sideLen * 0.8, sideLen * 0.9, sideLen >> 2, 32),
            new THREE.MeshPhongMaterial({ color: 0x999999 })
        );
        scene.add(floor);
        floor.position.setY(start - (sideLen >> 3));

        var helperGroup = new THREE.Group();
        scene.add(helperGroup);
        if (drawGrid) {
            // Bottom grids
            (function () {
                var gridHelper = new THREE.GridHelper(sideLen, sideLen, 0x666666, 0x333333);
                gridHelper.position.y = start + 0.1;
                helperGroup.add(gridHelper);
            })();
            // Top grids
            (function () {
                var gridHelper = new THREE.GridHelper(sideLen, 1, 0x666666, 0x333333);
                gridHelper.position.y = end;
                helperGroup.add(gridHelper);
            })();
            // Around lines
            (function () {
                var geometry = new THREE.Geometry();
                geometry.vertices.push.apply(
                    geometry.vertices,
                    [
                        // [start, start, start], [start, end, start],
                        [start, start, end], [start, end, end],
                        [end, start, start], [end, end, start],
                        [end, start, end], [end, end, end],
                    ].map(function (pos) { return new THREE.Vector3(pos[0], pos[1], pos[2]); }));
                var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x333333 }));
                helperGroup.add(line);
                var axisHelper = new THREE.AxisHelper(sideLen * 1.2);
                axisHelper.position.set(start, start, start);
                helperGroup.add(axisHelper);
            })();
        }

        var meshesGroup = new THREE.Group();
        scene.add(meshesGroup);
        var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        /** @type {THREE.Mesh[][][]} */
        var meshes = Array.apply(null, { length: sideLen }).map(function (_, x) {
            return Array.apply(null, { length: sideLen }).map(function (_, y) {
                return Array.apply(null, { length: sideLen }).map(function (_, z) {
                    var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial());
                    meshesGroup.add(mesh);
                    mesh.position.set.apply(mesh.position, posFromCoord(x, y, z));
                    mesh.material.visible = false;
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
                        onEach(meshes[x][y][z], iy + z);
                    }
                }
            }
        }

        return {
            get helper() { return helperGroup; },
            get meshes() { return meshesGroup; },
            /**
             * @param {number[] | THREE.Vector3} coordOrPos
             */
            set: function (coordOrPos, color, mark) {
                var coord = coordOrPos instanceof THREE.Vector3 ? coordFromPos(coordOrPos.x, coordOrPos.y, coordOrPos.z) : coordOrPos;
                var mesh = coord.reduce(function (meshes, coord) {
                    return meshes && meshes[coord];
                }, meshes);
                if (!mesh) {
                    return;
                }
                if (color != null) {
                    /** @type {THREE.MeshBasicMaterial} */
                    // @ts-ignore
                    var material = mesh.material;
                    material.color.setHex(color);
                    mesh.material.visible = true;
                } else {
                    mesh.material.visible = false;
                }
                if (mark) {
                    var box = new THREE.BoxHelper(mesh, color);
                    meshesGroup.add(box);
                    // @ts-ignore
                    mesh.box = box;
                } else {
                    meshesGroup.remove(box);
                }
            },
            load: function (pixs, colors) {
                iterMeshs(function (mesh, index) {
                    if (pixs[index] != null) {
                        /** @type {THREE.MeshBasicMaterial} */
                        // @ts-ignore
                        var material = mesh.material;
                        material.color.setHex(colors[pixs[index]]);
                        mesh.material.visible = true;
                    } else {
                        mesh.material.visible = false;
                    }
                });
            },
            dump: function () {
                var pixs = new Array(Math.pow(sideLen, 3));
                var colors = [];
                var colorIndexMap = {};
                iterMeshs(function (mesh, index) {
                    if (!mesh.material.visible) {
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