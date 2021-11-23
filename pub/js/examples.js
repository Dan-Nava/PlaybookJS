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

function makeToken(){
    const t = new Token();
    play.addToken(t);
    t.createToken('token' + play.tokens.indexOf(t), 'orange');
    t.allowDrag(true);
    t.extendPathFromToken('dblclick', 'dblclick');
}

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

function unpause() {
    for (let i = 0; i < play.tokens.length; i++){
        play.tokens[i].unpauseAnimation();
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
animStateHandler(); //this just initially has the reset/pause/unpause disabled
