Landing Page: https://afternoon-ocean-99848.herokuapp.com/ 
Documentation: https://afternoon-ocean-99848.herokuapp.com/Docs

    <div id='info-text'><b> Getting Started: </b></div>
    
    <p>Note that this library utilizes JQuery, as such it must be acquired first.</p>
    <p class='doc-text'>On your webpage you will need both a JQuery script and a script for Playbook in this order:</p>
    <code class='code-container'>
        <p class='doc-text'>&ltscript defer src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"&gt&lt/script&gt</p> 
        <p class='doc-text'>&ltscript defer type="text/javascript" src='js/Playbook.js'&gt&lt/script&gt</p>
    </code>
    
    <p>To setup a simple scenario of a Play, Field, and Token with a 1 branch path see the code below:</p>
    <code class='code-container'>
    <div>const play = new Play();</div>
    <div>const field = new Field(play);</div>
    <div>field.createField($('#example-one-container')[0], 'fID', '50em', '30em', '0.5em solid black', 'green');</div>
    <br>
    <div>const t = new Token(play);</div>
    <div>t.createTokenVisual('blue', 13 + 'em', 18 + 'em', '4em', '4em', 'circle');</div>
    <br>
    <div>let joint = t.path.createPathJoint();</div>
    <div>joint.breakPoint.createBPVisual('rgb(0,0,0, 0.4)', 8 + 'em', 2 + 'em', '4em', '4em', 'circle');</div>
    <div>joint.branch.createBranchVisual('black', '12px', '12px');</div>
    <br>
    <div>//The animation can then be run by using:</div>
    <div>play.runAnimations(500);</div>
    </code>
