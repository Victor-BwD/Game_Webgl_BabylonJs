// <reference path="js/babylon.max.js" />

var canvas; //hold canvas
var engine; //variable of objects that will deal with the low level with GL
var scene; //contain all the objects you wish render
document.addEventListener("DOMContentLoaded", startGame); //once the page is fully loaded perfom this function

function startGame(){
    canvas = document.getElementById("renderCanvas");//get the canvas of index.html 
    engine = new BABYLON.Engine(canvas, true);//tell your engine to draw on this especific canvas
    scene = createScene();
    engine.runRenderLoop(function(){//draw a scene multiple times when any change happened 
        scene.render();
    });
}

var createScene = function (){//most important function, this is called first to create a scene and start a game
    var scene = new BABYLON.Scene(engine);//create a scene object and assigned to this engine
    scene.clearColor = new BABYLON.Color3(1, 0, 1);//color of the scene
    var sphere = BABYLON.Mesh.CreateSphere("mySphere", 32, 2, scene);
    var ground = BABYLON.Mesh.CreateGround("myGround", 20, 20, 50, scene);
    var camera = new BABYLON.FreeCamera("myCamera", new BABYLON.Vector3(0, 1,-10), scene);
    camera.attachControl(canvas);
    var light = new BABYLON.PointLight("myPointLight", new BABYLON.Vector3(0, 10, 0), scene);
    light.intensity = .5;
    light.diffuse = new BABYLON.Color3(1, 0, 0);
    return scene;
};

window.addEventListener("resize", function(){
    engine.resize();//if you resize your browser this get called and resize your engine.
});