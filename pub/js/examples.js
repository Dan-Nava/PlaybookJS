"use strict";

const play = new Play();
const field1 = new Field();
play.addField(field1);
field1.createField($('#field-container')[0], 'field1', '70em', '37em', '0.5em solid black', 'green');
let selected = null;
let prevStyle = null;
//selection
$("#" + field1.id)[0].addEventListener('click', select);
function select(e){
    let previous = selected;
    let bps;

    if (previous){
        $('#' + previous.id)[0].style.border = prevStyle;
        bps = selected.path.breakPoints;
        for (let i = 0; i < bps.length; i++){
            bps[i].toggleVisibility(false);
        }
    }

    selected = field1.selectObject(e);
    if (selected){
        bps = selected.path.breakPoints;
        for (let i = 0; i < bps.length; i++){
            bps[i].toggleVisibility(true);
        }
    }

    if (selected instanceof Branch){selected = null;}
    if (selected) {
       prevStyle = $('#' + selected.id)[0].style.border;
       $('#' + selected.id)[0].style.border = '3px solid red';
    }
}

//this deletion will delete everything starting from the token and bp
function deleteObject() {
    let bpsToRemove;
    let branchesToRemove;

    if (selected === null){
        return null;
    }

    switch (selected.constructor.name) {
        case 'Token':
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
            break;

        case 'BreakPoint':
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
            break;
            
        default:
            return null;
    }
}

function makeToken(xpos, ypos, string){
    const t = new Token();
    play.addToken(t);
    t.createToken('token' + play.tokens.indexOf(t), 'orange', xpos, ypos);
    t.allowDrag(true);
    t.extendPathFromToken('dblclick', 'dblclick');
    if (string === undefined){
        string ='';
    }
    $('#' + t.id)[0].innerHTML = "<p><font size=5>" + string + "</font></p>";
    $('#' + t.id)[0].style.textAlign = 'center';
}

//o-line
for (let i = 0; i < 5; i++){makeToken(24 + (i*4),20, 'OL');}
makeToken(10, 20, 'WR');
makeToken(54, 20, 'WR');
makeToken(32, 24, 'QB');
makeToken(32, 28, 'RB');

//extremely jank, will need to refactor library functions to avoid this from happening
// creates 2 basic paths for both WR tokens
play.tokens[6].path.extendPath();
let bp1 = play.tokens[6].path.breakPoints[0];
$('#' + bp1.id)[0].style.top = '5em';
$('#' + bp1.id)[0].style.left = '54.5em';
bp1.extendPathFromBP('dblclick');
bp1.leftBranch.updateBranchPosition();
bp1.toggleVisibility(false);

play.tokens[5].path.extendPath();
let bp2 = play.tokens[5].path.breakPoints[0];
bp2.extendPathFromBP('dblclick');
$('#' + bp2.id)[0].style.top = '5em';
$('#' + bp2.id)[0].style.left = '10.5em';
bp2.leftBranch.updateBranchPosition();
bp2.toggleVisibility(false);

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
