// <reference path="js/babylon.max.js" />

var canvas; //hold canvas
var engine; //variable of objects that will deal with the low level with GL
var scene; //contain all the objects you wish render
document.addEventListener("DOMContentLoaded", startGame); //once the page is fully loaded perfom this function

function startGame(){
    canvas = document.getElementById("renderCanvas");//get the canvas of index.html 
    engine = new BABYLON.Engine(canvas, true);//tell your engine to draw on this especific canvas
    scene = createScene();
    modifySettings();
    var tank = scene.getMeshByName("HeroTank");
    var toRender = function () {//var to keep a function to draw a screen every tick
        var yMovement = 0;
        if (tank.position.y > 2){
            yMovement = -2;
        }
        tank.moveWithCollisions(new BABYLON.Vector3(0, yMovement, 5));
        scene.render();
    }
    engine.runRenderLoop(toRender);
}

var createScene = function (){//most important function, this is called first to create a scene and start a game
    var scene = new BABYLON.Scene(engine);//create a scene object and assigned to this engine
    var ground = CreateGround(scene);//calls the function to create a ground
    var freeCamera = CreateFreeCamera(scene);
    var tank = createTank(scene);
    var followCamera = createFollowCamera(scene, tank);
    scene.activeCamera = followCamera;
    createLights(scene);
    

    

    
    return scene;
};

function CreateGround(scene){
    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/hmap1.png", 2000, 2000, 20, 0, 1000, scene, false, OnGroundCreated);//create a ground with a image
    function OnGroundCreated(){//function to create a ground specs
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);//create a var to receive a texture
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg", scene);//texture
        ground.material = groundMaterial;//ground receive a texture as material
        ground.checkCollisions = true;//collisions
    }

    return ground;
}

function createLights(scene){
    var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), scene);
    var light1 = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(-1, -1, 0), scene);
}

//function to create a camera
function CreateFreeCamera(scene){
    var camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 0, 0), scene);//create a free camera
    camera.attachControl(canvas);//control with directional arrows
    camera.position.y = 50;
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.keysUp.push(87);
    camera.keysLeft.push(65);
    camera.keysDown.push(83);
    camera.keysRight.push(68);

    return camera;
}

function createFollowCamera(scene, target){//camera to follow the tank
    var camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);
    camera.radius = 20;//how far from the object to follow
    camera.heightOffset = 4;//how high above the objects to place the camera
    camera.rotationOffSet = 100;//the viewing angle
    camera.cameraAcceleration = 0.5;//how fast to move
    camera.maxCameraSpeed = 50;//speed limit
    return camera;
}

function createTank(scene){
    var tank = new BABYLON.MeshBuilder.CreateBox("HeroTank", {height: 1, depth: 10, width: 6}, scene);
    var tankMaterial = new BABYLON.StandardMaterial("TankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial;

    tank.position.y += 2;
    return tank;
}

window.addEventListener("resize", function(){
    engine.resize();//if you resize your browser this get called and resize your engine.
});

function modifySettings(){
    scene.onPointerDown = function(){
        if(!scene.alreadyLocked){//if alreadyLocked is false so call the function requestPointerLock
            console.log("requesting");
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            canvas.requestPointerLock();
        }else{
            console.log("not requesting");//if true so dont
        }
        
    }
    //all of this to work in all types of browsers
    document.addEventListener("pointerlockchange", pointerLockListener);
    document.addEventListener("mspointerlockchange", pointerLockListener);
    document.addEventListener("mozpointerlockchange", pointerLockListener);
    document.addEventListener("webkitpointerlockchange", pointerLockListener);
    
    function pointerLockListener(){//function to see if i press mouse button
        var element = document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || document.pointerLockElement || null; //all types of browsers

        if(element){//flag
            scene.alreadyLocked = true;
        }else{
            scene.alreadyLocked = false;
        }
    }
}

