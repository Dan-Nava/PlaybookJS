"use strict";
(function(global, document, $) {
    
    //Private functions 
    function _deleteVisual(object) {
        object.getDOMElement().remove();
    }

    function _updateBranchPosition(branch) {
        const startBP = branch.startBP.getDOMElement();
        const endBP = branch.endBP.getDOMElement();
        const startX = startBP.offsetLeft + startBP.clientWidth / 2;
        const startY = startBP.offsetTop + startBP.clientHeight / 2;
        const endX = endBP.offsetLeft + endBP.clientWidth / 2;
        const endY = endBP.offsetTop + endBP.clientHeight / 2;

        //first find length of the branch
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        //angle between the branch and X-axis
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

        const visual = branch.getDOMElement();
        visual.style.width = length + 'px';
        visual.style.left = (startBP.offsetLeft + startBP.clientWidth / 2) + 'px';
        visual.style.top = (startBP.offsetTop + startBP.clientHeight / 2) + 'px';
        visual.style.transform = 'rotate(' + angle + 'deg)';
    }

    //checks if token are ever out of bounds
    //unfortunately this solution only works with rectangular fields ATM
    function _checkOutOfBounds(token, parent) {
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
        runAnimations(duration, delay = 0, iterations = 1, easing = 'linear') {
            for (let i = 0; i < this.tokens.length; i++){
                this.tokens[i].runAnimation(duration, delay, iterations, easing);
                this.tokens[i].allowDrag(false);
                let bps = this.tokens[i].path.breakPoints;
                for (let j = 0; j < bps.length; j++){bps[j].allowDrag(false);}
            }
        },
        resetAnimations() {
            for (let i = 0; i < this.tokens.length; i++){
                this.tokens[i].resetAnimation();
                this.tokens[i].allowDrag(true);
                let bps = this.tokens[i].path.breakPoints;
                for (let j = 0; j < bps.length; j++){bps[j].allowDrag(true);}
            }
        },
        pauseAnimations() {
            for (let i = 0; i < this.tokens.length; i++){
                this.tokens[i].pauseAnimation();
            }
        },
        resumeAnimations() {
            for (let i = 0; i < this.tokens.length; i++){
                this.tokens[i].resumeAnimation();
            }
        },

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
            const field = document.createElement('div');
            field.style.width = width;
            field.style.height = height;
            field.style.border = borderStyle;
            field.style.backgroundColor = backgroundColor;
        


            this.setField(field, container, id)
        },
        setField(field, container, id) {
            this.id = id;
            field.id = id;
            field.style.position = 'relative';
            field.className='playbook-field';
            const body = container;
            body.append(field); 
        },

        setFieldImage(imageSrc, size, repeat, position) {
            const elem = this.getDOMElement();
            elem.style.backgroundImage = 'url(' + imageSrc + ')';
            elem.style.backgroundRepeat = repeat;
            elem.style.backgroundSize = size;
            elem.style.backgroundPosition = position;
        },

        //returns object of selected element
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
            _deleteVisual(this);
        },
        getDOMElement() {
            return  $('#' + this.id)[0];
        },

    }


    function Token(play) {
        this.play = play;
        this.path = null;
        this.animationInfo = {numOfAnimations: null, animationsFinished: null}
        this.id = 'token' + (play.tokens.length);
        play.addToken(this);
        this.createTokenPath();
    }

    Token.prototype = {
        //DOM FUNCTION
        allowDrag(enable) {
            let token = this.getDOMElement();
            let parent = this.play.field.getDOMElement();
            let cursorX = null;
            let cursorY = null;
            let t = this;

            if (enable) {token.onmousedown = handleMouseDown;}
            else {token.onmousedown = null;}

            //handles mouse click/hold on token
            function handleMouseDown(e) {
                cursorX = e.clientX;
                cursorY = e.clientY;
                //stop moving when mouse button is no longer pressed
                document.onmouseup = () => {
                    document.onmouseup = null;
                    document.onmousemove = null;
                    if (t.path.branches.length > 0) { _updateBranchPosition(t.path.branches[0]);}
                };
                document.onmousemove = dragToken;
            }

            //updates pos of token based on cursor (drag effect)
            function dragToken(e) {
                //diff between cursor's old pos and current pos
                let diffX = cursorX - e.clientX;
                let diffY = cursorY - e.clientY;
                //stops token from exiting field
                if (_checkOutOfBounds(token, parent)) {
                    document.onmouseup = null;
                    document.onmousemove = null;
                    if (t.path.branches.length > 0) { _updateBranchPosition(t.path.branches[0]);}
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

        setTokenImage(imageSrc, size, repeat, position) {
            const elem = this.getDOMElement();
            elem.style.backgroundImage = 'url(' + imageSrc + ')';
            elem.style.backgroundRepeat = repeat;
            elem.style.backgroundSize = size;
            elem.style.backgroundPosition = position;
        },

        getDOMElement(){
            return $('#' + this.id)[0];
        },

        setTokenPosition(x, y) {
            const token = this.getDOMElement();
            token.style.left = x;
            token.style.top = y;

            if (this.path.branches > 0){
                _updateBranchPosition(this.path.branches[0]);
            }
        },

        deleteToken(){
            this.play.removeToken(this);
            this.path.token = null;
            this.path = null;
            this.play = null;
            _deleteVisual(this);
        },

        canAddJointFromHere() {
            if (this.path.breakPoints.length === 0){
                return true
            } else {
                return false
            }
        },

        //animates token along its entire path
        animateAll(array, value, duration, delay, iterations, easing) {
            let t = this;
            const token = this.getDOMElement();
            const destination = $('#' + array[value].id)[0];
            let tokenX = token.offsetLeft + token.clientWidth / 2;
            let tokenY = token.offsetTop + token.clientHeight / 2;
            const destinationX = destination.offsetLeft + destination.clientWidth / 2;
            const destinationY = destination.offsetTop + destination.clientHeight / 2;
            const dx = destinationX - tokenX;
            const dy = destinationY - tokenY;

            const anim = token.animate([{ transform: 'translateX(' + dx + 'px) translateY(' + dy + 'px)' }],
                { duration: duration, delay: delay, iterations: iterations, easing: easing });
            anim.onfinish = function () {
                token.style.transform = 'translateX(' + dx + 'px) translateY(' + dy + 'px)';
                t.animationInfo.animationsFinished += 1;
            };

            if (value < array.length - 1) {
                anim.onfinish = () => {
                    t.animationInfo.animationsFinished += 1;
                    token.style.transform = 'translateX(' + dx + 'px) translateY(' + dy + 'px)';
                    this.animateAll(array, value + 1, duration, delay, iterations, easing);
                };
            }
        },

        currentAnimation() {
            return this.getDOMElement().getAnimations();  
        },

        runAnimation(duration, delay = 0, iterations = 1, easing = 'linear', array = this.path.breakPoints) {
            let token = this.getDOMElement();
            this.animationInfo.numOfAnimations = array.length;
            this.animationInfo.animationsFinished = 0;
            //runs animation only if token is at its initial position
            if (array.length !== 0 && token.style.transform === '') {
                this.animateAll(array, 0, duration, delay, iterations, easing);
            }
        },

        resetAnimation() {
            this.animationInfo.numOfAnimations = null;
            this.animationInfo.animationsFinished = null;
            let token =this.getDOMElement();
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
            let token = this.getDOMElement();
            if (token.getAnimations().length !== 0) {
                token.getAnimations().at(-1).pause();
            }   
        },

        resumeAnimation() {
            let token = this.getDOMElement();
            if (token.getAnimations().length !== 0) {
                token.getAnimations().at(-1).play();
            }
        },

        createTokenPath(){ 
            const path = new Path(this, this.id + '-path');
            this.path = path;
        },
        removePath() {
            this.path.deleteEntirePath();
            this.path.token = null;
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
        //We note this is the ONLY time branches + bps are made
        //this specifically only creates the js objects for 1 branch and 1 BP (no visuals)
        createPathJoint() {
            //create BP and Branch objects
            const bp = new BreakPoint(this, this.id + '-bp' + this.breakPoints.length);
            const branch = new Branch(this, this.id + '-branch' + this.branches.length);

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

            //adds BP and Branch to Path arrays
            this.addBranch(branch);
            this.addBreakPoint(bp);
            //adds BP and Branch to Play arrays
            this.token.play.addBreakPoint(bp);
            this.token.play.addBranch(branch);
            return {breakPoint: bp, branch: branch}
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

        deleteEntirePath() {
            for (let i = 0; i < this.branches.length; i++){
                this.branches[i].deleteBranch();
            }
            for (let i = 0; i < this.breakPoints.length; i){
                this.breanPoints[i].deleteBP();
            }
        }
    }


    function Branch(path, id) {
        this.id = id;
        this.path = path;
        this.startBP = null;
        this.endBP = null;
    }


    Branch.prototype = {
        createBranchVisual(color, width, height) {
            const start = this.startBP.getDOMElement();
            const branch = document.createElement('div');
            branch.style = 'width:' + width + '; height:' + height + '; background-color: ' + color + ';';
            branch.style.position = 'absolute';
            branch.style.zIndex = '1';
            branch.style.top = (start.offsetTop + start.clientHeight / 2) + 'px';
            branch.style.left = (start.offsetLeft + (start.clientWidth / 2) - 10) + 'px';
            branch.style.transformOrigin = 0 + 'px 5px';
            branch.style.transition = 'rotate 0.1s';
            branch.id = this.id;
            branch.className = 'playbook-branch';

            const field = this.path.token.play.field.getDOMElement();
            field.append(branch);
            _updateBranchPosition(this);
        },
        setBranchImage(imageSrc, size, repeat, position) {
            const elem = this.getDOMElement();
            elem.style.backgroundImage = 'url(' + imageSrc + ')';
            elem.style.backgroundRepeat = repeat;
            elem.style.backgroundSize = size;
            elem.style.backgroundPosition = position;
        },

        getDOMElement() {
            return $('#' + this.id)[0];
        },

        deleteBranch(){
            this.path.token.play.removeBranch(this);
            this.path = null;
            this.endBP = null;
            this.startBP.rightBranch = null;
            this.startBP = null;
            _deleteVisual(this);
        },

        toggleVisibility(visible){
            let branch = this.getDOMElement();
            if (!visible){
                branch.style.visibility = 'hidden';
            }
            else{
                branch.style.visibility = 'visible';
            }
        },
    }


    function BreakPoint(path, id) {
        this.id = id;
        this.path = path;
        this.leftBranch = null;
        this.rightBranch = null;
    }

    BreakPoint.prototype = {
        //DOM
        createBPVisual(color, xpos, ypos, width, height, shape) {
            // const token = this.leftBranch.startBP.getDOMElement();
            const bp = document.createElement('div');
            let borderRadius;
            if (shape === 'circle'){
                borderRadius = '50%'
            } else if (shape === 'square'){
                borderRadius = '0%'
            }
            bp.style = 'width:' + width + '; height:' + height + 
            '; border-radius:' + borderRadius + '; background-color:' + color + ';';
            bp.style.position = 'absolute';
            bp.style.zIndex = '3';
            this.setBPVisual(bp, xpos, ypos);
        },

        //DOM FCN
        setBPVisual(bp, xpos, ypos){
            bp.style.top = ypos;
            bp.style.left = xpos;
            bp.className = 'playbook-breakpoint';
            bp.id = this.id;
            
            const field = this.path.token.play.field.getDOMElement();
            field.append(bp);
        },
        setBPImage(imageSrc, size, repeat, position) {
            const elem = this.getDOMElement();
            elem.style.backgroundImage = 'url(' + imageSrc + ')';
            elem.style.backgroundRepeat = repeat;
            elem.style.backgroundSize = size;
            elem.style.backgroundPosition = position;
        },
        deleteBP(){
            this.path.token.play.removeBreakPoint(this); //removes bp from Play array
            this.path = null;
            this.rightBranch = null;
            this.leftBranch = null;
            //left branch will ALWAYS hold a value, right may not
            _deleteVisual(this);
        },

        getDOMElement(){
            return $('#' + this.id)[0];
        },

        toggleVisibility(visible){
            let bp = this.getDOMElement();
            if (!visible){
                bp.style.visibility = 'hidden';
            }
            else{
                bp.style.visibility = 'visible';
            }
        },

        canAddJointFromHere() {
            if (!this.rightBranch){
                return true
            } else {
                return false
            }
        },

        setBPPosition(x, y) {
            const bp = this.getDOMElement();
            bp.style.left = x;
            bp.style.top = y;

            _updateBranchPosition(this.leftBranch);
            if (this.rightBranch){
                _updateBranchPosition(this.rightBranch);
            }
        },

        //DOM FUNCTION
        allowDrag(enable) {
            let token = this.getDOMElement();
            let parent = this.path.token.play.field.getDOMElement();
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
                    _updateBranchPosition(t.leftBranch);
                    if (t.rightBranch !== null) { _updateBranchPosition(t.rightBranch); }
                };
                document.onmousemove = dragToken;
            }

            //updates pos of token based on cursor (drag effect)
            function dragToken(e) {
                //diff between cursor's old pos and current pos
                let diffX = cursorX - e.clientX;
                let diffY = cursorY - e.clientY;
                //stops token from exiting field
                if (_checkOutOfBounds(token, parent)) {
                    document.onmouseup = null;
                    document.onmousemove = null;
                    _updateBranchPosition(t.leftBranch);
                    if (t.rightBranch !== null) {
                        _updateBranchPosition(t.rightBranch);
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

    //add all main functions to window object
    global.Playbook = global.Playbook || Playbook
    global.Play = global.Play || Play
    global.Field = global.Field || Field
    global.Token = global.Token || Token
    global.Path = global.Path || Path
    global.Branch = global.Branch || Branch
    global.BreakPoint = global.BreakPoint || BreakPoint

})(window, window.document, $);
