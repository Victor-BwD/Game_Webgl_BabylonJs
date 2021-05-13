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
    constructor(dudeMesh, speed, id, scene, scaling){
        this.dudeMesh = dudeMesh;
        this.scene = scene;
        this.id = id;
        dudeMesh.Dude = this;
        if(speed){
            this.speed = speed;
        }else{
            this.speed = 1;
        }
        if(scaling){
            this.scaling = scaling;
            this.dudeMesh.scaling = new BABYLON.Vector3(this.scaling, this.scaling, this.scaling);
        }else{
            this.scaling = 1;
        }
        if(Dude.boundingBoxParameters == undefined){
            Dude.boundingBoxParameters = this.CalculateBoundingBoxParameters();
        }
        
        this.createBoundingBox();
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

    createBoundingBox(){
        var lengthX = Dude.boundingBoxParameters.lengthX;
        var lengthY = Dude.boundingBoxParameters.lengthY;
        var lengthZ = Dude.boundingBoxParameters.lengthZ;

        var bounder = new BABYLON.Mesh.CreateBox("bounder" + str(this.id), 1, this.scene);

        bounder.scaling.x = lengthX * this.scaling;
        bounder.scaling.y = lengthY * this.scaling;
        bounder.scaling.z = lengthZ * this.scaling;
    }

    CalculateBoundingBoxParameters(){
        var minX = 999999; var minY = 999999; var minZ = 999999;
        var maxX = -99999; var maxY = -999999; var maxZ = -99999;

        var children = this.dudeMesh.getChildren();

        for(var i = 0; i < children.length; i++){
            var position = new BABYLON.VertexData.ExtractFromGeometry(children[i]).position;
            if(!positions) continue;

            var index = 0;
            for(var j = index; j < positions.length; j += 3){
                if(positions[j] < minX){
                    minX = positions[j];
                }
                if(positions[j] > maxX){
                    maxX = positions[j];
                }
            }

            var index = 1;
            for(var j = index; j < positions.length; j += 3){
                if(positions[j] < minX){
                    minY = positions[j];
                }
                if(positions[j] > maxX){
                    maxY = positions[j];
                }
            }

            var index = 2;
            for(var j = index; j < positions.length; j += 3){
                if(positions[j] < minZ){
                    minZ = positions[j];
                }
                if(positions[j] > maxZ){
                    maxZ = positions[j];
                }
            }

            var _lengthX = maxX - minX;
            var _lengthY = maxY - minY;
            var _lengthZ = maxZ - minZ;

            return {lengthX : _lengthX, lengthY : _lengthY, lengthZ : _lengthZ};
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

        if(scene.dudes){//to all of the dudes come to me
            for(var q = 0; q < scene.dudes.length; q++){
                scene.dudes[q].Dude.move();
            }
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

function createHeroDude(scene){//function to create a dude
    BABYLON.SceneLoader.ImportMesh("him", "models/Dude/", "dude.babylon", scene, onDudeImported); 

    function onDudeImported(newMeshes, particleSystems, skeletons){
       newMeshes[0].position = new BABYLON.Vector3(0, 0, 5);  // The original dude
       newMeshes[0].name = "heroDude";
       var heroDude = newMeshes[0];
      
       scene.beginAnimation(skeletons[0], 0, 120, 1.0, true, 1.0);
       var hero = new Dude(heroDude, 2, -1, scene, .2);

       scene.dudes = [];
       for(var q = 0; q < 10; q++){
           scene.dudes[q] = DoClone(heroDude, skeletons, q);
           scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0);
           var temp = new Dude(scene.dudes[q], 2, q, scene, .2);
       }
     
    }
}

 function DoClone(original, skeletons, id){
     var myClone;

     var xrand = Math.floor(Math.random() * 501) - 250;
     var zrand = Math.floor(Math.random() * 501) - 250;

    myClone = original.clone("clone_" + id);
    myClone.position = new BABYLON.Vector3(xrand,0,zrand);
    if(!skeletons){
        return myClone;
    }else{
        if(!original.getChildren()){
            myClone.skeletons = skeletons[0].clone("clone_" + id + "_skeletons");
            return myClone;
        }else{
            if(skeletons.length == 1){//this means one skeleton controlling/animating all the children
                var clonedSkeleton = skeletons[0].clone("clone_" + id + "_skeleton");
                myClone.skeleton = clonedSkeleton;
                var numChildren = myClone.getChildren().length;
                for(var i = 0; i < numChildren; i++){
                    myClone.getChildren()[i].skeleton = clonedSkeleton;
                }
                return myClone;

            }else if(skeletons.length == original.getChildren().length){
                for(var i = 0; i < myClone.getChildren().length; i++){
                    myClone.getChildren()[i].skeleton = skeletons[i].clone("clone_" + id + "_skeleton_" + i);
                }
                return myClone;
            }
        }
    }
     return myClone;
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
