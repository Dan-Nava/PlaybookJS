"use strict";
//////// EXAMPLE 1 ////////
const play1 = new Play();
const field1 = new Field(play1);
field1.createField($('#example-one-container')[0], 'field1', '50em', '30em', '0.5em solid black', 'green');
field1.setFieldImage( null, 'cover', 'center', 'no-repeat');

function MakeFriendlyToken(xpos, ypos) {
    const t = new Token(play1);
    t.createTokenVisual('blue', xpos, ypos, '4em', '4em', 'circle');
}
let example1_xpos = 13;
let example1_ypos = 18;
for (let i = 0; i < 5; i++){
    MakeFriendlyToken(example1_xpos + 'em', example1_ypos + 'em');
    example1_xpos += 5;
}

function createFriendlyPath(token, xpos, ypos) {
    const tokenP = token.path;
    let joint = tokenP.createPathJoint();
    joint.breakPoint.createBPVisual('rgb(0,0,0, 0.4)', xpos + 'em' , 
    ypos +  'em', '4em', '4em', 'circle');
    joint.branch.createBranchVisual('black', '12px', '12px');
}

createFriendlyPath(play1.tokens[0], 13, 8)
createFriendlyPath(play1.tokens[0].path.breakPoints[0], 8, 2)

createFriendlyPath(play1.tokens[3], 40, 6);
createFriendlyPath(play1.tokens[3].path.breakPoints[0], 30, 10)
createFriendlyPath(play1.tokens[3].path.breakPoints[1], 30, 2)
//////// END OF EXAMPLE 1 ////////

//////// EXAMPLE 2 ////////

const play2 = new Play();
const field2 = new Field(play2);
field2.createField($('#example-two-container')[0], 'field2', '65em', '39em', '0.5em solid black', 'transparent');
field2.setFieldImage( 'images/field.jpg', 'cover', 'center', 'no-repeat');

function run() {
    play1.runAnimations(500);
    animStateHandler(true);
    
}

function reset(){
    play1.resetAnimations();
    animStateHandler(false);
}

//////// EXAMPLE 1 ////////

//////// EXAMPLE 3 ////////
const play3 = new Play();
const field3 = new Field(play3);
field3.createField($('#example-three-container')[0], 'field3', '65em', '39em', '0.5em solid black', 'transparent');
field3.setFieldImage( 'images/field.jpg', 'cover', 'center', 'no-repeat');

//Select functionality
let selected = null;
let prevStyle = null;
//selection
field3.getDOMElement().addEventListener('click', select);

function select(e){ //this function does the VISUAL selection
    let previous = selected;
    let bps;

    if (previous){ //VISUAL - reverts previously selected token + path to unselected visual
       previous.getDOMElement().style.border = prevStyle;
        bps = selected.path.breakPoints;
        for (let i = 0; i < bps.length; i++){
            bps[i].toggleVisibility(false);
        }
    }

    selected = field3.selectObject(e);
    if (selected){  //VISUAL - changes selected token + path to select visual
        bps = selected.path.breakPoints;
        for (let i = 0; i < bps.length; i++){
            bps[i].toggleVisibility(true);
        }
    }

    if (selected && !(selected instanceof Branch)) { //VISUAL - changes selected token + path to select visual
       prevStyle = selected.getDOMElement().style.border;
       selected.getDOMElement().style.border = '3px solid red';
    }
}

//Delete functionality
function deleteObject() {
   
    let bpsToRemove;
    let branchesToRemove;

    if (selected === null){ //if nothing's selected ignore this
        return null;
    }

    if (selected instanceof Token){
        bpsToRemove = selected.path.breakPoints;
        branchesToRemove = selected.path.branches;

        for (let i = 0; i < bpsToRemove.length; i++) {
            let bp = bpsToRemove[i];
            bp.deleteBP();
        } 
        for (let i = 0; i < branchesToRemove.length; i++){
            let branch = branchesToRemove[i];
            branch.deleteBranch();
        }
        selected.deleteToken();
        selected = null;
        prevStyle = null; 
    }
    else if (selected instanceof BreakPoint) {
            bpsToRemove = selected.path.breakPoints
            .splice(selected.path.breakPoints.indexOf(selected));
            branchesToRemove = selected.path.branches
            .splice(selected.path.branches.indexOf(selected.leftBranch));

            for (let i = 0; i < bpsToRemove.length; i++) {
                let bp = bpsToRemove[i];
                bp.deleteBP();
            } 
            for (let i = 0; i < branchesToRemove.length; i++){
                let branch = branchesToRemove[i];
                branch.deleteBranch();
            }
            selected = null;
            prevStyle = null;
        }
    }

// MAKE A TOKEN
//////////////////////////////////////////////////////////////////////

function makeToken(color='orange', xpos, ypos, string, image = null){
    const token3 = new Token(play3);
    token3.createTokenVisual(color, xpos, ypos, '60px', '60px', 'square');
    if (image){token3.setTokenImage(image, 'contain', 'no-repeat', 'center');}
    token3.allowDrag(true);
    setPathExtensionListener('dblclick', token3);
    const visual = token3.getDOMElement();
    if (string === undefined){string ='';}
    visual.innerHTML = "<p><font size=5 color='blue'>" + string + "</font></p>";
    visual.style.textAlign = 'center';
}

//o-line
for (let i = 0; i < 5; i++){makeToken('transparent', 24 + (i*4) + 'em',20 + 'em', 'OL', 'images/helmet.png');}
//other players
makeToken('transparent', 10 + 'em', 20 + 'em','WR', 'images/helmet.png');
makeToken('transparent', 54 + 'em', 20 + 'em', 'WR' , 'images/helmet.png');
makeToken('transparent', 32 + 'em', 24 + 'em', 'QB', 'images/helmet.png');
makeToken('transparent', 32 + 'em', 28 + 'em', 'RB', 'images/helmet.png');

//create paths for tokens
const token1Path = play3.tokens[6].path;
let joint = token1Path.createPathJoint();
joint.breakPoint.createBPVisual('rgb(0,0,0, 0.4)','54em', '5em',
'60px', '60px', 'circle');
setPathExtensionListener('dblclick', joint.breakPoint);
joint.breakPoint.toggleVisibility(false);
joint.branch.createBranchVisual('black', '12px', '12px');
joint.breakPoint.allowDrag(true);

const tokenpath2 = play3.tokens[5].path;
joint = tokenpath2.createPathJoint();
joint.breakPoint.createBPVisual('rgb(0,0,0, 0.4)', '10em', '5em',
'60px', '60px', 'circle');
setPathExtensionListener('dblclick', joint.breakPoint);
joint.breakPoint.toggleVisibility(false);
joint.branch.createBranchVisual('black', '12px', '12px');
joint.breakPoint.allowDrag(true);

//////////////////////////////////////////////////////////////////////////

function run() {
    play3.runAnimations(500);
    animStateHandler(true);
    
}

function reset(){
    play3.resetAnimations();
    animStateHandler(false);
}

function pause() {
    play3.pauseAnimations();
}

function resume() {
    play3.resumeAnimations();
}

function animStateHandler(running) {
    let runButton = $('#run-button')[0];
    let resetButton = $('#reset-button')[0];
    let pauseButton = $('#pause-button')[0];
    let unpauseButton = $('#unpause-button')[0];
    let createButton = $('#create-button')[0];
    let deleteButton = $('#delete-button')[0];

    if (!running){
        resetButton.disabled = true;
        pauseButton.disabled = true;
        unpauseButton.disabled = true;
        runButton.disabled = false;
        createButton.disabled = false;
        deleteButton.disabled = false;
    }
    else{
        resetButton.disabled = false;
        pauseButton.disabled = false;
        unpauseButton.disabled = false;
        runButton.disabled = true;
        createButton.disabled = true;
        deleteButton.disabled = true;
    }
}
animStateHandler();

//allows to set tokens and bps to extend the path upon 'event'
function setPathExtensionListener(event, object){
    object.getDOMElement().addEventListener(event, handleEvent);
    function handleEvent(){
        if (object.canAddJointFromHere()){
            const joint = object.path.createPathJoint();
            const token = joint.branch.startBP.getDOMElement();
            joint.breakPoint.createBPVisual('rgb(0,0,0, 0.4)', token.offsetLeft + 'px', token.offsetTop + 'px',
            '60px', '60px', 'circle');
            joint.breakPoint.allowDrag(true);
            setPathExtensionListener('dblclick', joint.breakPoint);
            joint.branch.createBranchVisual('black', '12px', '12px');
        }
    }
}
//////// EXAMPLE 3 ////////
