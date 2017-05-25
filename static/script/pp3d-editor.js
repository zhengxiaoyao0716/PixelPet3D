/**
* @module editor
* @author zhengxiaoyao0716
*/
; (function () {
    'use strict';
    var editor = {};

    var palettePanel = document.querySelector("#palettePanel");
    // @ts-ignore
    var pp3d = window.pp3d;
    pp3d.winIndex = 2;
    var model = pp3d.initModel(true, true);
    var cursor = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.BoxGeometry(1, 1, 1)),
        new THREE.LineBasicMaterial({ color: 0x333333, opacity: 0.5, transparent: true })
    );
    model.helper.add(cursor);

    // raycaster
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var camera = pp3d.getCamera(pp3d.winIndex);
    var frameHandle;
    function onMouseMove(e) {
        cancelAnimationFrame(frameHandle);
        frameHandle = requestAnimationFrame(function () {
            if (e instanceof MouseEvent) {
                mouse.x = (e.clientX / Math.min(pp3d.container.clientWidth, pp3d.size[0])) * 2 - 1;
                mouse.y = -(e.clientY / Math.min(pp3d.container.clientHeight, pp3d.size[1])) * 2 + 1;
            }
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(model.meshes.children);
            if (!intersects.length) {
                return;
            }
            for (var index in intersects) {
                var intersect = intersects[index];
                var mesh = intersects[index].object;
                /** @type {THREE.Material} */
                // @ts-ignore
                var material = mesh.material;
                if (material && material.visible) {
                    cursor.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
                    // @ts-ignore
                    cursor.minusMode || cursor.position.add(intersect.face.normal);
                    return;
                }
            }
            var intersect = intersects[intersects.length - 1];
            var mesh = intersect.object;
            // @ts-ignore
            var material = mesh.material;
            if (material) {
                cursor.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
            }
        });
    }

    // palette
    var palette = (function () {
        var current = 0;
        /** @type {number[]} */
        var colors = [];
        var palette = {
            get currentIndex() { return current; }, set currentIndex(index) {
                palettePanel.children.item(current).classList.remove("select");
                if (index < 0) {
                    current = colors.length - 1;
                } else if (index >= colors.length) {
                    current = 0;
                } else {
                    current = index;
                }
                palettePanel.children.item(current).classList.add("select");
            },
            get current() { return colors[current]; },
            push: function (color) {
                var piece = document.createElement("i");
                palettePanel.insertBefore(piece, palettePanel.lastChild);
                piece.style.backgroundColor = "#" + new THREE.Color(color).getHexString();
                piece.addEventListener("click", function () { palette.currentIndex = colors.indexOf(color); });
                piece.addEventListener("contextmenu", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!confirm("从调色板上移除？")) {
                        return;
                    }
                    piece.remove();
                    var index = colors.indexOf(color);
                    colors = colors.filter(function (_, i) { return i != index; });
                    palette.currentIndex = 0;
                });
                colors.push(color);
            },
        };
        pp3d.colors.forEach(function (color) { palette.push(color); });
        palette.currentIndex = 0;
        return palette;
    })();

    // controller
    (function () {
        var autoMoveCursor;
        pp3d.container.addEventListener('mousemove', function (e) {
            onMouseMove(e);
            autoMoveCursor = onMouseMove;
        }, false);
        var controls = {
            "38": function () { cursor.position.z--; autoMoveCursor = controls["38"]; },  // Up
            "40": function () { cursor.position.z++; autoMoveCursor = controls["40"]; },  // Down
            "37": function () { cursor.position.x--; autoMoveCursor = controls["37"]; },  // Left
            "39": function () { cursor.position.x++; autoMoveCursor = controls["39"]; },  // Right
            "33": function () { cursor.position.y++; autoMoveCursor = controls["33"]; },  // PageUp
            "34": function () { cursor.position.y--; autoMoveCursor = controls["34"]; },  // PageDown
            // "16": function() { cursor.position.y++; },  // Shift
            // "17": function() { cursor.position.y--; },  // Control
            // @ts-ignore
            "18": function () { cursor.minusMode = true; },  // Alt
        };
        var keyupControls = {
            // @ts-ignore
            "18": function () { cursor.minusMode = false; },  // Alt
        };
        addEventListener("keydown", function (e) { controls[e.keyCode] && controls[e.keyCode](); });
        addEventListener("keyup", function (e) { keyupControls[e.keyCode] && keyupControls[e.keyCode](); });
        pp3d.container.addEventListener("click", function (e) {
            e.stopPropagation();
            e.preventDefault();
            // @ts-ignore
            model.set(cursor.position, cursor.minusMode ? null : palette.current);
            autoMoveCursor();
        });
        [pp3d.container, palettePanel].forEach(function (div) { div.addEventListener("mousewheel", function (e) { palette.currentIndex += e.deltaY / 100; }); });
        palettePanel.lastChild.addEventListener("click", function () {
            var value = prompt("请输入RGP色值（hex）", "0xffffff");
            if (!value) {
                return;
            }
            var color = parseInt(value);
            isNaN(color) ? alert("无效的输入") : palette.push(color);
        });
    })();

    editor.save = function () {
        var data = model.dump();
        var str = "pp3d.asset.model.test = (\n    '" + data[0] + "\\n" + data[1] + "'\n).split('\\n').map(function (s) { return s.split(',').map(function (v) { return v == '' ? undefined : parseInt(v); }); });";
        console.log(str);
        return str;
    };

    // Module defined.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = editor;
    } else if (typeof define === 'function' && define.amd) {
        define(function () { return editor; });
    } else {
        window.editor = editor;
    }
})();