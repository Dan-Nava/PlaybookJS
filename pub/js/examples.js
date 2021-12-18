"use strict";

const play = new Play();
const field1 = new Field(play);
// play.addField(field1);
field1.createField($('#field-container')[0], 'field1', '70em', '37em', '0.5em solid black', 'green');

////SELECTION & DELETION CODE///////
let selected = null;
let prevStyle = null;
//selection
// $("#" + field1.id)[0].addEventListener('click', select);

$("#" + field1.id)[0].addEventListener('click', select);;
function select(e){ //this function does the VISUAL selection
    let previous = selected;
    let bps;

    if (previous){ //VISUAL - reverts previously selected token + path to unselected visual
        $('#' + previous.id)[0].style.border = prevStyle;
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

    if (selected instanceof Branch){selected = null;}
    if (selected) { //VISUAL - changes selected token + path to select visual
       prevStyle = $('#' + selected.id)[0].style.border;
       $('#' + selected.id)[0].style.border = '3px solid red';
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

function makeToken(xpos, ypos, string){
    const t = new Token(play);
    t.createTokenVisual('orange', xpos, ypos, '60px', '60px', 'circle');
    t.allowDrag(true); //only use if want user interactivity
    t.SetPathExtensionListener('dblclick', 'dblclick', true); //only use if want user interactivity
    const visual = t.getDOMElement();
    if (string === undefined){
        string ='';
    }
    visual.innerHTML = "<p><font size=5>" + string + "</font></p>";
    visual.style.textAlign = 'center';
    return t.id;
}

//o-line
for (let i = 0; i < 5; i++){makeToken(24 + (i*4) + 'em',20 + 'em', 'OL');}
makeToken(10 + 'em', 20 + 'em', 'WW');
makeToken(54 + 'em', 20 + 'em', 'WR');
makeToken(32 + 'em', 24 + 'em', 'QB');
makeToken(32 + 'em', 28 + 'em', 'RB');

//////////////////////////////////////////////////////////////////////

const token1Path = play.tokens[6].path;
token1Path.extendPath('dblclick', true);
let bp1 = token1Path.breakPoints[0];
bp1.setExtendPathListener('dblclick', true);
bp1.setBPPosition('54.5em', '5em');
token1Path.extendPath('dblclick', true);
let bp12 = token1Path.breakPoints[1];
bp12.setBPPosition('45.5em', '5em');

play.tokens[5].path.extendPath('dblclick', false);
let bp2 = play.tokens[5].path.breakPoints[0];
bp2.setExtendPathListener('dblclick', false);
bp2.setBPPosition('10.5em', '5em');

//////////////////////////////////////////////////////////////////////////

function run() {
    for (let i = 0; i < play.tokens.length; i++){
        play.tokens[i].runAnimation();
        play.tokens[i].allowDrag(false);
        let bps = play.tokens[i].path.breakPoints;
        for (let j = 0; j < bps.length; j++){bps[j].allowDrag(false);}
    }
    animStateHandler(true);
}

function reset(){
    for (let i = 0; i < play.tokens.length; i++){
        play.tokens[i].resetAnimation();
        play.tokens[i].allowDrag(true);
        let bps = play.tokens[i].path.breakPoints;
        for (let j = 0; j < bps.length; j++){bps[j].allowDrag(true);}
    }
    animStateHandler(false);
}

function pause() {
    for (let i = 0; i < play.tokens.length; i++){
        play.tokens[i].pauseAnimation();
    }
}

function resume() {
    for (let i = 0; i < play.tokens.length; i++){
        play.tokens[i].resumeAnimation();
    }
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
