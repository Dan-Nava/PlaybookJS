"use strict";

const play = new Play();
const field1 = new Field(play);
field1.createField($('#field-container')[0], 'field1', '65em', '39em', '0.5em solid black', 'transparent');
field1.setFieldImage( 'images/field.jpg', 'cover', 'center', 'no-repeat');
////SELECTION & DELETION CODE///////
let selected = null;
let prevStyle = null;
//selection
field1.getDOMElement().addEventListener('click', select);
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

    selected = field1.selectObject(e);
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

//this deletion will delete everything starting from the token and bp
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
            bp.path.token.play.removeBreakPoint(bp);
            bp.deleteBP();
        } 
        for (let i = 0; i < branchesToRemove.length; i++){
            let branch = branchesToRemove[i];
            branch.path.token.play.removeBranch(branch);
            branch.deleteBranch();
        }
        selected.play.removeToken(selected);
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
                bp.path.token.play.removeBreakPoint(bp);
                bp.deleteBP();
            } 
            for (let i = 0; i < branchesToRemove.length; i++){
                let branch = branchesToRemove[i];
                branch.path.token.play.removeBranch(branch);
                branch.deleteBranch();
            }
            selected = null;
            prevStyle = null;
        }
    }

// MAKE A TOKEN
//////////////////////////////////////////////////////////////////////

function makeToken(color, xpos, ypos, string, image = null){
    const t = new Token(play);
    t.createTokenVisual(color, xpos, ypos, '60px', '60px', 'square');
    if (image){t.setTokenImage(image, 'contain', 'no-repeat', 'center');}
    t.allowDrag(true); //only use if want user interactivity
    setPathExtensionListener('dblclick', t); //only use if want user interactivity
    const visual = t.getDOMElement();
    if (string === undefined){
        string ='';
    }
    visual.innerHTML = "<p><font size=5 color='blue'>" + string + "</font></p>";
    visual.style.textAlign = 'center';
}

//o-line
for (let i = 0; i < 5; i++){makeToken('orange', 24 + (i*4) + 'em',20 + 'em', 'OL');}
makeToken('transparent', 10 + 'em', 20 + 'em','', 'images/helmet.png');
makeToken('orange', 54 + 'em', 20 + 'em', 'WR');
makeToken('orange', 32 + 'em', 24 + 'em', 'QB');
makeToken('orange', 32 + 'em', 28 + 'em', 'RB');

//create paths for tokens
//////////////////////////////////////////////////////////////////////

const token1Path = play.tokens[6].path;
let joint = token1Path.createPathJoint();
joint.breakPoint.createBPVisual('rgb(0,0,0, 0.4)','54.5em', '5em',
'60px', '60px', 'circle');
setPathExtensionListener('dblclick', joint.breakPoint);
joint.breakPoint.toggleVisibility(false);
joint.branch.createBranchVisual('black', '12px', '12px');
joint.breakPoint.allowDrag(true);

const tokenpath2 = play.tokens[5].path;
joint = tokenpath2.createPathJoint();
joint.breakPoint.createBPVisual('rgb(0,0,0, 0.4)', '10.5em', '5em',
'60px', '60px', 'circle');
setPathExtensionListener('dblclick', joint.breakPoint);
joint.breakPoint.toggleVisibility(false);
joint.branch.createBranchVisual('black', '12px', '12px');
joint.breakPoint.allowDrag(true);

//////////////////////////////////////////////////////////////////////////

function run() {
    play.runAnimations(500);
    animStateHandler(true);
    
}

function reset(){
    play.resetAnimations();
    animStateHandler(false);
}

function pause() {
    play.pauseAnimations();
}

function resume() {
    play.resumeAnimations();
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
