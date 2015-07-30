"use strict";

function webglAvailable() {
    try {
        var canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

var scene  = new THREE.Scene();
var width  = window.innerWidth;
var height = window.innerHeight;

var renderer, camera;

var vertices = 8;

var path = new THREE.Curves.TorusKnot();
var tube = new THREE.TubeGeometry(path, 300, 3, vertices, true);
var geometry = new THREE.TubeGeometry(path, 300, 2.98, vertices, true);

function setSwitch(event) {
    var mode = event.target.id;
    var other = (mode === 'switch-on') ? 'off' : 'on';
    document.getElementById(mode).style.display = 'none';
    document.getElementById('switch-' + other).style.display = 'block';
    if ('on' === other) {
        wallMaterial.transparent = true;
        wallMaterial.opacity = 0.9;
    } else {
        wallMaterial.transparent = false;
    }
}

if (webglAvailable()) {

    renderer = new THREE.WebGLRenderer({antialias: true});
    camera   = new THREE.PerspectiveCamera(80, width / height, 1, 1000);

    var wallMaterial = new THREE.LineBasicMaterial({ 
        color       : 0x000000,
        side        : THREE.BackSide,
        transparent : false
    });
    
    var wall = new THREE.Mesh(tube, wallMaterial);
    scene.add(wall); 
    
    // -----------------------------------------------------------------------------
    
    var len = geometry.vertices.length;
    
    var lineMaterial = new THREE.LineBasicMaterial({ 
        linewidth    : 2,
        vertexColors : THREE.VertexColors
    });
    
    var rainbow = new Rainbow();
    rainbow.setSpectrum('#00b2dc', '#000000', '#ff1928', '#000000', '#ff1928', '#ffff20', '#ff1928', '#00b2dc');
    rainbow.setNumberRange(0, len); 
    
    var offsets = [0, 200, 400, 1000, 800, 750, 500, 1000, 0];
    
    for (var i = 0; i < len; i += vertices) {
        var colors = [];
        for (var j = 0; j < 9; j++) {
            colors.push(new THREE.Color(parseInt(rainbow.colourAt((i * 4 + offsets[j]) % len), 16)));
        }
        var lineGeo = new THREE.Geometry();
        lineGeo.colors = colors;
        for (var j = 0; j < vertices; j++) {
            lineGeo.vertices.push(geometry.vertices[i + j]);
        }
        lineGeo.vertices.push(geometry.vertices[i]);
        var line = new THREE.Line(lineGeo, lineMaterial);
        scene.add(line);
    }
    
    // -----------------------------------------------------------------------------
    
    var starMaterial = new THREE.PointCloudMaterial({
        size: 1.5,
        color: 0xffffff
    });
    
    var starGeometry = new THREE.Geometry();
    
    var r = 300;
    for (var p = 0; p < 2000; p++) {
        var theta   = Math.PI * Math.random(),
            phi = 2 * Math.PI * Math.random(),
            x = r * Math.sin(theta) * Math.cos(phi),
            y = r * Math.sin(theta) * Math.sin(phi),
            z = r * Math.cos(theta);
        starGeometry.vertices.push(new THREE.Vector3(x, y, z));
    }
    
    var stars = new THREE.PointCloud(starGeometry, starMaterial);
    scene.add(stars); 

    // -----------------------------------------------------------------------------
    
    document.getElementById('switch-on').addEventListener('click', setSwitch);
    document.getElementById('switch-off').addEventListener('click', setSwitch);

} else {

    renderer = new THREE.CanvasRenderer();
    camera   = new THREE.PerspectiveCamera(80, width / height, 1, 25);

    var len = geometry.vertices.length;
    
    var lineMaterial = new THREE.LineBasicMaterial({ 
        linewidth    : 2,
        vertexColors : THREE.VertexColors
    });
    
    var rainbow = new Rainbow();
    rainbow.setSpectrum('#00b2dc', '#000000', '#ff1928', '#000000', '#ff1928', '#ffff20', '#ff1928', '#00b2dc');
    rainbow.setNumberRange(0, len); 
    
    var offsets = [0, 200, 400, 1000, 800, 750, 500, 1000, 0];
    
    for (var i = 0; i < len; i += vertices) {
        var colors = [];
        for (var j = 0; j < 9; j++) {
            colors.push(new THREE.Color(parseInt(rainbow.colourAt((i * 4 + offsets[j]) % len), 16)));
        }
        var lineGeo = new THREE.Geometry();
        lineGeo.colors = colors;
        for (var j = 0; j < vertices; j++) {
            lineGeo.vertices.push(geometry.vertices[i + j]);
        }
        lineGeo.vertices.push(geometry.vertices[i]);
        var line = new THREE.Line(lineGeo, lineMaterial);
        scene.add(line);
    }
    
    // -----------------------------------------------------------------------------

    document.getElementById('switch-off').style.display = 'none';

}

function onWindowResize() {
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

onWindowResize();
window.addEventListener('resize', onWindowResize, false);

document.getElementById('main').appendChild(renderer.domElement);

// -----------------------------------------------------------------------------

function render() {
    requestAnimationFrame(render);
    var time = Date.now();
    var looptime = 180000;
    var t = (time % looptime) / looptime;
    var pos = tube.parameters.path.getPointAt(t);
    var point = tube.parameters.path.getPointAt((t + 5 / tube.parameters.path.getLength()) % 1);
    camera.position.set(pos.x,pos.y,pos.z);
    camera.lookAt(point)
    renderer.render(scene, camera);
}

render();

