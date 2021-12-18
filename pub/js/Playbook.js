"use strict";

// the constructor function should instantiate any variables that
//  each Playbook instance should have a unique version of.
function Playbook() {
    this.plays = []; //array of plays
}

Playbook.prototype = {
    addPlay(play) {
        this.plays.push(play);
    },

    removePlay(play) {
        this.plays = this.plays.filter(p => p !== play);
    },
}


// houses a field and its respective tokens
function Play() {
    this.field = null; //field represents the area the tokens and indicators etc. can interact with
    this.tokens = []; //tokens that represent players, the ball etc.
    this.branches = []; //all branches within the play
    this.breakPoints = []; //all breakpoints within the play
}
    
Play.prototype =  {
    // connects field to play and viceversa
    addField(field) {
        this.field = field;
        field.play = this;
    },
    removeField() {
        this.field.play = null;
        this.field = null;
    },
    addToken(token) {
        this.tokens.push(token);
        token.play = this;
    },
    removeToken(token) {
        token.play = null;
        this.tokens = this.tokens.filter(t => t !== token);
    },
    addBreakPoint(bp) {
        this.breakPoints.push(bp);
    },
    removeBreakPoint(bp) {
        this.breakPoints = this.breakPoints.filter(b => b !== bp);
    },
    addBranch(branch) {
        this.branches.push(branch);
    },
    removeBranch(branch) {
        this.branches = this.branches.filter(b => b !== branch);
    }
}


function Field(play) {
    this.play = play; //associated play that the field is a part of
    this.id = null;
    play.addField(this)
}

Field.prototype = {
    // DOM FUNCTION
    createField(container, id, width, height, borderStyle, backgroundColor) {
        this.id = id;

        const field = document.createElement('div');
        field.id = id;
        field.style.width = width;
        field.style.height = height;
        field.style.border = borderStyle;
        field.style.backgroundColor = backgroundColor;
        field.style.position = 'relative';

        const body = container;
        body.append(field);
    },

    selectObject(e) {
        const targetClass = e.target.className;
        const targetID = e.target.id;
        let objects;

        switch (targetClass) {
            case 'playbook-token':
                objects = this.play.tokens;
                break;
            case 'playbook-branch':
                objects = this.play.branches;
                break;
            case 'playbook-breakpoint':
                objects = this.play.breakPoints;
                break;
            default:
                return null;
        }

        for (let i = 0; i < objects.length; i++) {
            if (objects[i].id === targetID) {
                return (objects[i]);
            }
        }
    },

    deleteField() {
        this.play = null;
        this.deleteFieldVisual();
    },
    deleteFieldVisual(){
        $('#' + this.id)[0].remove();
    },
    getFieldID() {
        return this.id;
    },

}


function Token(play) {
    this.play = play;
    this.path = null;
    this.id = 'token' + (play.tokens.length);
    play.addToken(this);
    this.createTokenPath();
    //this.createToken(id, color, xpos, ypos);
}

Token.prototype = {
    //DOM FUNCTION
    allowDrag(enable) {
        let token = $('#' + this.id)[0];
        let parent = $('#' + this.play.field.id)[0];
        let cursorX = null;
        let cursorY = null;
        let t = this;

        if (enable) {
            token.onmousedown = handleMouseDown;
        }
        else {
            token.onmousedown = null;
        }

        //handles mouse click/hold on token
        function handleMouseDown(e) {
            cursorX = e.clientX;
            cursorY = e.clientY;
            //stop moving when mouse button is no longer pressed
            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                if (t.path.branches.length > 0) {
                    t.path.branches[0].updateBranchPosition();
                }
            };
            document.onmousemove = dragToken;
        }

        //checks if token are ever out of bounds
        //unfortunately this solution only works with rectangular fields ATM
        function checkOutOfBounds() {
            if (parent.getBoundingClientRect().right < token.getBoundingClientRect().right) {
                token.style.left = (parent.clientWidth - token.offsetWidth) + 'px';
                return true;
            }
            if (parent.getBoundingClientRect().left > token.getBoundingClientRect().left) {
                token.style.left = 0 + 'px';
                return true;
            }
            if (parent.getBoundingClientRect().top > token.getBoundingClientRect().top) {
                token.style.top = 0 + 'px';
                return true;
            }
            if (parent.getBoundingClientRect().bottom < token.getBoundingClientRect().bottom) {
                token.style.top = (parent.clientHeight - token.offsetHeight) + 'px';
                return true;
            }
            return false;
        }

        //updates pos of token based on cursor (drag effect)
        function dragToken(e) {
            //diff between cursor's old pos and current pos
            let diffX = cursorX - e.clientX;
            let diffY = cursorY - e.clientY;
            //stops token from exiting field
            if (checkOutOfBounds()) {
                document.onmouseup = null;
                document.onmousemove = null;
                if (t.path.branches.length > 0) {
                    t.path.branches[0].updateBranchPosition();
                }
            }
            else {
                //updates current pos of cursor
                cursorX = e.clientX;
                cursorY = e.clientY;
                //updates pos of token
                token.style.top = (token.offsetTop - diffY) + 'px';
                token.style.left = (token.offsetLeft - diffX) + 'px';
            }
        }
    },

    //DOM FUNCTION
    createTokenVisual(color, xpos, ypos, width, height, shape) {
        //creates the token, shape will be based on user input: square, circle
        let borderRadius;
        if (shape === 'circle'){
            borderRadius = '50%'
        } else if (shape === 'square'){
            borderRadius = '0%'
        }
        const token = document.createElement('div');
        token.style = 'width:' + width + '; height:' + height + 
        '; border-radius:' + borderRadius + '; background-color:' + color + ';';
        this.setTokenVisual(token, xpos, ypos);
    },

    //DOM FCN
    setTokenVisual(token, xpos, ypos){
        token.style.top = ypos;
        token.style.left = xpos;
        token.style.position = 'absolute';
        token.style.zIndex = '2';
        token.className = 'playbook-token';
        token.id = this.id;
        
        const field = $('#' + this.play.field.id)[0];
        field.append(token);
    },

    getDOMElement(){
        return $('#' + this.id)[0];
    },

    deleteToken(){
        this.path.token = null;
        this.path = null;
        this.play = null;
        this.deleteTokenVisual();
    },

    deleteTokenVisual(){
        $('#' + this.id)[0].remove();
    },

    SetPathExtensionListener(tokenExtendPathEvent, bpExtendPathEvent, letBPDrag = true){
        let t = this;
        $('#' + t.id)[0].addEventListener(tokenExtendPathEvent, handleEvent);

        function handleEvent(){
            if (t.path.breakPoints.length === 0){
                t.path.extendPath(bpExtendPathEvent, letBPDrag);
            }
        }
    },

    //animates token along its entire path
    animateAll(array, value) {
        const token = $('#' + this.id)[0];
        const destination = $('#' + array[value].id)[0];
        let tokenX = token.offsetLeft + token.clientWidth / 2;
        let tokenY = token.offsetTop + token.clientHeight / 2;
        const destinationX = destination.offsetLeft + destination.clientWidth / 2;
        const destinationY = destination.offsetTop + destination.clientHeight / 2;
        const dx = destinationX - tokenX;
        const dy = destinationY - tokenY;

        const anim = token.animate([{ transform: 'translateX(' + dx + 'px) translateY(' + dy + 'px)' }],
            { duration: 500, easing: 'linear' });

        anim.onfinish = function () {
            token.style.transform = 'translateX(' + dx + 'px) translateY(' + dy + 'px)';
        };

        if (value < array.length - 1) {
            anim.onfinish = () => {
                token.style.transform = 'translateX(' + dx + 'px) translateY(' + dy + 'px)';
                this.animateAll(array, value + 1);
            };
        }
    },

    runAnimation() {
        let token = $('#' + this.id)[0];
        //runs animation only if token is at its initial position
        if (this.path.breakPoints.length !== 0 && token.style.transform === '') {
            this.animateAll(this.path.breakPoints, 0);
        }
    },

    resetAnimation() {
        let token = $('#' + this.id)[0];
        //this for loop accounts for reseting mid animation
        if (token.getAnimations().length !== 0) {
            for (let i = 0; i < token.getAnimations().length; i++) {
                token.getAnimations().at(-1).cancel();
            }
        }
        //reseting at the end of full animation
        token.style.transform = '';
    },

    pauseAnimation() {
        let token = $('#' + this.id)[0];
        if (token.getAnimations().length !== 0) {
            token.getAnimations().at(-1).pause();
        }   
    },

    resumeAnimation() {
        let token = $('#' + this.id)[0];
        if (token.getAnimations().length !== 0) {
            token.getAnimations().at(-1).play();
        }
    },

    createTokenPath(){ 
        const path = new Path(this, this.id + '-path');
        this.addPath(path);
    },

    addPath(path) {
        this.path = path;
    },

    removePath() {
        this.path = null;
    },
}


function Path(token, id) {
    this.id = id;
    this.token = token; //token it belongs to
    this.branches = [];
    this.breakPoints = [];
}

Path.prototype = {
    //we note this is the ONLY time branches + bps are made
    //triggerEvent refers to how breakpoints will extend 
    extendPath(bpExtendPathEvent, letBPDrag) {

        //create BP and Branch objects
        const bp = new BreakPoint(this);
        const branch = new Branch(this);

        //add BP & branch to arrays
        if (this.branches.length === 0) { //empty so, startBP is the token
            branch.startBP = this.token;
        }
        else { branch.startBP = this.breakPoints.at(-1); }

        branch.endBP = bp; //assigns new BP to the endBP of new branch

        if (this.breakPoints.length > 0) { //not empty so update latest bp
            this.breakPoints.at(-1).rightBranch = branch;
        }

        bp.leftBranch = branch; //assigns new branch to leftbranch of new BP

        this.addBranch(branch);
        this.addBreakPoint(bp);

        // create BP and Branch visuals
        bp.createBreakPoint(this.id + '-bp' + this.breakPoints.indexOf(bp), branch.startBP);
        bp.allowDrag(letBPDrag);
        bp.setExtendPathListener(bpExtendPathEvent, true);
        branch.createBranch(this.id + '-branch' + this.branches.indexOf(branch));

        //Adds bp and branch to arrays of all bps and branches in play object
        this.token.play.addBreakPoint(bp);
        this.token.play.addBranch(branch);
    },

    addBreakPoint(bp) {
        this.breakPoints.push(bp);
    },
    removeBreakPoint(bp) {
        this.breakPoints = this.breakPoints.filter(b => b !== bp);
    },
    addBranch(branch) {
        this.branches.push(branch);
    },
    removeBranch(branch) {
        this.branches = this.branches.filter(b => b !== branch);
    },
}


function Branch(path) {
    this.id = null;
    this.path = path;
    this.startBP = null;
    this.endBP = null;
}

Branch.prototype = {
    createBranch(id) {
        const start = $('#' + this.startBP.id)[0];
        const branch = document.createElement('div');
        branch.style = 'width: 20px; height: 10px; background-color: black;';
        branch.style.position = 'absolute';
        branch.style.zIndex = '1';
        branch.style.top = (start.offsetTop + start.clientHeight / 2) + 'px';
        branch.style.left = (start.offsetLeft + (start.clientWidth / 2) - 10) + 'px';
        branch.style.transformOrigin = 0 + 'px 5px';
        branch.style.transition = 'rotate 0.1s';
        branch.id = id;
        branch.className = 'playbook-branch';
        this.id = id;

        const field = $('#' + this.path.token.play.field.id)[0];
        field.append(branch);
        this.updateBranchPosition();
    },
    updateBranchPosition() {
        const startBP = $('#' + this.startBP.id)[0];
        const endBP = $('#' + this.endBP.id)[0];
        const startX = startBP.offsetLeft + startBP.clientWidth / 2;
        const startY = startBP.offsetTop + startBP.clientHeight / 2;
        const endX = endBP.offsetLeft + endBP.clientWidth / 2;
        const endY = endBP.offsetTop + endBP.clientHeight / 2;

        //first find length of the branch
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        //angle between the branch and X-axis
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

        $('#' + this.id)[0].style.width = length + 'px';
        $('#' + this.id)[0].style.left = (startBP.offsetLeft + startBP.clientWidth / 2) + 'px';
        $('#' + this.id)[0].style.top = (startBP.offsetTop + startBP.clientHeight / 2) + 'px';
        $('#' + this.id)[0].style.transform = 'rotate(' + angle + 'deg)';
    },

    deleteBranch(){
        this.path = null;
        this.endBP = null;
        this.startBP.rightBranch = null;
        this.startBP = null;
        this.deleteBranchVisual();
    },

    deleteBranchVisual() {
        $('#' + this.id)[0].remove();
    },

    toggleVisibility(visible){
        let branch = $('#' + this.id)[0];

        if (!visible){
            branch.style.visibility = 'hidden';
        }
        else{
            branch.style.visibility = 'visible';
        }
    },
}


function BreakPoint(path) {
    this.id = null;
    this.path = path;
    this.leftBranch = null;
    this.rightBranch = null;
}

BreakPoint.prototype = {
    //DOM
    createBreakPoint(id, token) {
        const bp = document.createElement('div');
        bp.style = 'width: 40px; height: 40px; border-radius: 50%; background-color: rgb(0,0,0, 0.4);';
        bp.style.position = 'absolute';
        bp.style.zIndex = '3';
        bp.style.top = $('#' + token.id)[0].offsetTop + 'px';
        bp.style.left = $('#' + token.id)[0].offsetLeft + 'px';

        bp.id = id;
        this.id = id;
        bp.className = 'playbook-breakpoint';

        const field = $('#' + this.path.token.play.field.id)[0];
        field.append(bp);
    },

    deleteBP(){
        this.path = null;
        this.rightBranch = null;
        this.leftBranch = null;
        //left branch will ALWAYS hold a value, right may not
        this.deleteBPVisual();
    },

    deleteBPVisual(){
        $('#' + this.id)[0].remove();
    },

    getDOMElement(){
        return $('#' + this.id)[0];
    },

    toggleVisibility(visible){
        let bp = $('#' + this.id)[0];
        if (!visible){
            bp.style.visibility = 'hidden';
        }
        else{
            bp.style.visibility = 'visible';
        }
    },

    setExtendPathListener(ExtendPathEvent = null, letBPDrag) {
        if (ExtendPathEvent === null) {
            return;
        }
        $('#' + this.id)[0].addEventListener(ExtendPathEvent, handleEvent);
        let t = this;
        function handleEvent() {
            if (t.rightBranch === null) {
                t.path.extendPath(ExtendPathEvent, letBPDrag);
            }
        }
    },

    setBPPosition(x, y) {
        const bp = this.getDOMElement();
        bp.style.left = x;
        bp.style.top = y;

        this.leftBranch.updateBranchPosition();
        if (this.rightBranch){
            this.rightBranch.updateBranchPosition();
        }
    },

    //DOM FUNCTION
    allowDrag(enable) {
        let token = $('#' + this.id)[0];
        let parent = $('#' + this.path.token.play.field.id)[0];
        let cursorX = null;
        let cursorY = null;
        let t = this;

        if (enable) {
            token.onmousedown = handleMouseDown;
        }
        else {
            token.onmousedown = null;
        }

        //handles mouse click/hold on token
        function handleMouseDown(e) {
            cursorX = e.clientX;
            cursorY = e.clientY;
            //stop moving when mouse button is no longer pressed
            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                t.leftBranch.updateBranchPosition();
                if (t.rightBranch !== null) { t.rightBranch.updateBranchPosition(); }
            };
            document.onmousemove = dragToken;
        }

        //checks if token are ever out of bounds
        //unfortunately this solution only works with rectangular fields ATM
        function checkOutOfBounds() {
            if (parent.getBoundingClientRect().right < token.getBoundingClientRect().right) {
                token.style.left = (parent.clientWidth - token.offsetWidth) + 'px';
                return true;
            }
            if (parent.getBoundingClientRect().left > token.getBoundingClientRect().left) {
                token.style.left = 0 + 'px';
                return true;
            }
            if (parent.getBoundingClientRect().top > token.getBoundingClientRect().top) {
                token.style.top = 0 + 'px';
                return true;
            }
            if (parent.getBoundingClientRect().bottom < token.getBoundingClientRect().bottom) {
                token.style.top = (parent.clientHeight - token.offsetHeight) + 'px';
                return true;
            }
            return false;
        }

        //updates pos of token based on cursor (drag effect)
        function dragToken(e) {
            //diff between cursor's old pos and current pos
            let diffX = cursorX - e.clientX;
            let diffY = cursorY - e.clientY;
            //stops token from exiting field
            if (checkOutOfBounds()) {
                document.onmouseup = null;
                document.onmousemove = null;
                t.leftBranch.updateBranchPosition();
                if (t.rightBranch !== null) {
                    t.rightBranch.updateBranchPosition();
                }
            }
            else {
                //updates current pos of cursor
                cursorX = e.clientX;
                cursorY = e.clientY;
                //updates pos of token
                token.style.top = (token.offsetTop - diffY) + 'px';
                token.style.left = (token.offsetLeft - diffX) + 'px';
            }
        }
    },
}


