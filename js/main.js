// <reference path="js/babylon.max.js" />

var canvas; //hold canvas
var engine; //variable of objects that will deal with the low level with GL
var scene; //contain all the objects you wish render
var isWPressed = false;
var isSPressed = false;
var isAPressed = false;
var isDPressed = false;

document.addEventListener("DOMContentLoaded", startGame); //once the page is fully loaded perfom this function

class Dude{
    constructor(dudeMesh, speed){
        this.dudeMesh = dudeMesh;
        dudeMesh.Dude = this;
        if(speed){
            this.speed = speed;
        }else{
            this.speed = 1;
        }
        
    }

    move(){
        var tank = scene.getMeshByName("heroTank");
        var direction = tank.position.subtract(this.dudeMesh.position);
        var distance = direction.length();
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.dudeMesh.rotation.y = alpha;
        if(distance > 30){
            this.dudeMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
    }
}

function startGame(){
    canvas = document.getElementById("renderCanvas");//get the canvas of index.html 
    engine = new BABYLON.Engine(canvas, true);//tell your engine to draw on this especific canvas
    scene = createScene();
    modifySettings();
    var tank = scene.getMeshByName("heroTank");
    var toRender = function () {//var to keep a function to draw a screen every tick
        tank.move();
        var heroDude = scene.getMeshByName("heroDude");
        if(heroDude){
            heroDude.Dude.move();
        }
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
    createHeroDude(scene);
   

    
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
    var tank = new BABYLON.MeshBuilder.CreateBox("heroTank", {height: 1, depth: 10, width: 6}, scene);
    var tankMaterial = new BABYLON.StandardMaterial("TankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial;

    tank.position.y += 2;
    tank.speed = 1;
    tank.frontVector = new BABYLON.Vector3(0, 0, 1);//define a front of tank
    tank.move = function(){
        var yMovement = 0;
        if (tank.position.y > 2){
            yMovement = -2;
        }
        if(isWPressed){
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));//vector 3 to inclement 1 in each zone
        }
        if(isSPressed){
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-1*tank.speed, -1*tank.speed, -1*tank.speed));
        }
        if(isAPressed){
            tank.rotation.y -= .1;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));//rotation tank
        }
        if(isDPressed){
            tank.rotation.y += .1;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));//rotation tank
        }
    }
    return tank;
}

function createHeroDude(scene){
    BABYLON.SceneLoader.ImportMesh("him", "models/Dude/", "dude.babylon", scene, onDudeImported); 

    function onDudeImported(newMeshes, particleSystems, skeletons){
       newMeshes[0].position = new BABYLON.Vector3(0, 0, 5);  // The original dude
       newMeshes[0].name = "heroDude";
       var heroDude = newMeshes[0];
       heroDude.scaling = new BABYLON.Vector3(.2, .2, .2);
       heroDude.speed = 2;
       scene.beginAnimation(skeletons[0], 0, 120, 1.0, true, 1.0);

       var hero = new Dude(heroDude, 2);
     
    }
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

        if(element){//flag to see if mouse already locked
            scene.alreadyLocked = true;
        }else{
            scene.alreadyLocked = false;
        }
    }
}

document.addEventListener("keydown", function(event){//event listener to change the flag
    if(event.key == 'w' || event.key == 'W'){
        isWPressed = true;
    }
    if(event.key == 's' || event.key == 'S'){
        isSPressed = true;
    }
    if(event.key == 'a' || event.key == 'A'){
        isAPressed = true;
    }
    if(event.key == 'd' || event.key == 'D'){
        isDPressed = true;
    }
})

document.addEventListener("keyup", function(event){
    if(event.key == 'w' || event.key == 'W'){
        isWPressed = false;
    }
    if(event.key == 's' || event.key == 'S'){
        isSPressed = false;
    }
    if(event.key == 'a' || event.key == 'A'){
        isAPressed = false;
    }
    if(event.key == 'd' || event.key == 'D'){
        isDPressed = false;
    }
})
