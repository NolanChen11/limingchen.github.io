let power = 0;
let isCharging = false;
let isThrown = false;
let treeGraphic;
let mountainGraphic;
let treeList = [];
let colorList = ["8785b2", "aab16c"];
let indicator;
function setup(){
    var width = windowWidth;
    var height = windowHeight/3;
    var cnv = createCanvas(width, height);
    cnv.parent('sketch-holder');
    background(255);

    s = new Seed(10,20);
    treeGraphic = createGraphics(windowWidth, height);
    
    indicator = new powerIndicator(40);
    mountains();
    for(let i = 0; i < 5; i++){
        treeList.push(new tree(random(width)));
    }
    
}
function windowResized() {
    resizeCanvas(windowWidth, height);
    tempTreeGraphic = createGraphics(windowWidth, height);
    tempTreeGraphic.image(treeGraphic,0,0);
    treeGraphic = tempTreeGraphic;
    indicator.release();
    mountains();
}

function draw() {
    background(255);
    image(mountainGraphic,0,0);
    image(treeGraphic, 0, 0);
    ellipse(mouseX, mouseY, 30,30);
    
    //fill(50);
    
    //text("Let's plant some trees on my website!", width/2, 30);
    //text(`velocity: ${s.isDead}`, 10, 60);
    
    indicator.run();
    
    if(mouseOnPower()){
        console.log("enter");
        s.addPower();
        indicator.activate = true;
    }else{
        textSize(15);
        textAlign(CENTER);
        text("Press and Hold!", mouseX,mouseY+40);
    }
    imageMode(CORNER);
    s.runSeed();
    
    
    //if the seed hits the ground, create a new seed at the start point
    //then create a tree at the x coor where the seed hits the ground. 
    if(s.isDead){
        tempX = s.position.x;
        s = new Seed(20,40);
        treeList.push(new tree(tempX));
    }


    
    
    //run the system of the tree, in case there are multiple trees
    //being created at the same time.
    for(let i = 0; i < treeList.length; i++){
        treeList[i].run();
        if(treeList[i].isDead()){//check if the tree has finished. if true, remove the tree from the list. 
            treeList.splice(i,1);
        }
    }
}

function mouseOnPower(){
    return mouseIsPressed && !s.isReleased && mouseY < height && mouseY > 0;
}


function mouseReleased(){
    if(mouseY < height && mouseY > 0){
        s.releaseSeed();
    }
    indicator.release();
}

function mountains(){
    mountainGraphic = createGraphics(windowWidth, height);
    drawMountain(80, 10);
    drawMountain(100, 30);
    drawMountain(120, 50);
    drawMountain(140, 100);
    drawMountain(190, 120);
    drawMountain(225, 140);
}
function drawMountain(greyValue, heightOffset){
    mountainGraphic.fill(greyValue);
    mountainGraphic.noStroke();
    let pointList = [];
    let pointNumber = int(random(3,5));
    for(let i = 0; i < pointNumber; i++){
        pointList.push(i * (windowWidth/pointNumber));
    }
    pointList.push(windowWidth);
    mountainGraphic.beginShape();
    mountainGraphic.vertex(0,height);
    for(let i = 0; i < pointNumber + 1; i++){
        mountainGraphic.vertex(pointList[i], random(height/3, height*2/3) + heightOffset);
    }
    mountainGraphic.vertex(windowWidth,height);
    mountainGraphic.vertex(0,height);
    mountainGraphic.endShape();
    

}


// a dot launched according to the power added to it. 
// is dead when reaches the bottom. 
class Seed{
    constructor(x, y){
        this.position = createVector(x, y);
        this.velocity = 0;
        this.power = 0;
        this.isReleased = false;
        this.isDead = false;
    }
    addPower(){
        this.power = this.power + 1;
    }
    addGravity(){
        this.velocity.add(-0.01, 0.15);
    }
    releaseSeed(){
        this.velocity = createVector(this.power/10, 0);
        this.isReleased = true;
    }
    getSeedPower(){
        return this.power;
    }
    runSeed(){
        if(this.isReleased == true){
            this.addGravity();
            this.position.add(this.velocity);
        }
        ellipse(this.position.x, this.position.y, 20, 20);
        if(this.position.y > height*3/4){
            this.isDead = true;
        }
        if(this.position.x > windowWidth || this.position.x < 0){
            this.velocity = createVector(-this.velocity.x, this.velocity.y);

        }
    }
    
}


//created when a seed is dead. An ellipse drawn from the bottom to the top. 
//die until it reaches its lifespan. 
class tree{
    constructor(x){
        this.branchList = [];
        this.position = createVector(x, height);
        this.velocity = createVector(random(-0.1,0.1), -1.5);
        this.lifespan = int(random(140,200));
        this.age = 0;
        this.radius = 10;
    }
    run(){
        treeGraphic.noStroke();
        treeGraphic.fill(0);

        this.age = this.age + 1;
        this.position.add(this.velocity);
        treeGraphic.ellipse(this.position.x, this.position.y, this.radius, this.radius);
        this.updateVelocity();
        this.updateRadius();

        this.runBranch();

    }
    updateRadius(){
        this.radius = 13 - ((this.age*10)/this.lifespan);
    }
    updateVelocity(){
        this.velocity = createVector(this.velocity.x + random(-0.1,0.1), this.velocity.y + random(-0.1,0.1));
    }
    runBranch(){
        if(this.age > this.lifespan/2 && int(random(2)) == 1){
            this.branchList.push(new branch(this.position.x, this.position.y ,this.age, this.lifespan));
        }
        for(let i = 0; i < this.branchList.length; i++){
            console.log(this.branchList.length);
            this.branchList[i].run();
            if(this.branchList[i].isDead()){
                this.branchList.pop(i);
            }
        }
    }
    isDead(){
        return this.age > this.lifespan;
    }
}

//class branch objects are created after a tree object reaches its half age. (age/2)
// the radius depends on tree's age/lifespan.
class branch{
    constructor(x, y, treeAge, treeLife){
        this.position = createVector(x, y);
        this.velocity = createVector(random(-1,1),random(-0.2,0.2));
        this.lifespan = int(random(80,100));
        this.age = 0;
        this.radius = 10 * (treeLife - treeAge) / treeLife;
        this.originalRadius = this.radius;
    }
    run(){
        treeGraphic.fill(0,0,0);
        this.age = this.age + 1;
        this.position.add(this.velocity);
        treeGraphic.ellipse(this.position.x, this.position.y, this.radius, this.radius);
        this.updateVelocity();
        this.updateRadius();
        this.drawFruit();
    }
    updateVelocity(){
        this.velocity = createVector(this.velocity.x + random(-0.2,0.2), this.velocity.y + random(-0.2,0.2));
    }
    isDead(){
        return this.age > this.lifespan;
    }
    updateRadius(){
        this.radius = this.originalRadius - ((this.age * this.originalRadius) / this.lifespan);
    }
    drawFruit(){
        if(int(random(10)) == 1){
            let randomRadius = random(3,10);
            treeGraphic.ellipse(this.position.x, this.position.y + randomRadius/2, randomRadius, randomRadius);
        }
    }

}

//is used to indicate how much power is added to the seed launcher.
//x, y, radius.
class powerIndicator{
    constructor(r){
        this.drawGraphic = createGraphics(windowWidth,height);
        this.position = createVector(mouseX,mouseY);
        this.radius = r;
        this.layer = 0;
        this.angle = 0;
        this.activate = false;
        this.powerCount = 0;

        this.switchMouseSize = false;
    }
    run(){
        
        
        if(this.activate){
            ellipse(mouseX, mouseY, 30, 30);
            this.drawGraphic.fill(0);
            this.drawGraphic.ellipse(windowWidth/2 + (this.radius + this.layer*15) * cos(this.angle), height/2 + (this.radius + this.layer*15) * sin(this.angle), 10, 10);
            imageMode(CENTER);
            image(this.drawGraphic, mouseX, mouseY);
            this.angle = this.angle + 0.1;
            this.powerCount++;
            if(this.powerCount % 80 == 0 && this.powerCount != 0){
                this.layer++;
            }
        }else{
            this.drawMouse();
        }
        
    }
    release(){
        this.activate = false;
        this.drawGraphic = createGraphics(windowWidth, height);
        this.powerCount = 0;
        this.layer = 0;
    }
    drawMouse(){
        fill(0);
        noStroke();
        if(frameCount % 20 == 0){
            this.switchMouseSize = !this.switchMouseSize;
        }
        if(this.switchMouseSize){
            ellipse(mouseX, mouseY, 20, 20);
        }else{
            ellipse(mouseX, mouseY, 40, 40)
        }

    }
    
}
