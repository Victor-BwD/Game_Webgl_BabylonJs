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

var createScene = function (){
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(1, 0, 1);
    //code here
    return scene;
};

window.addEventListener("resize", function(){
    engine.resize();//if you resize your browser this get called and resize your engine.
});