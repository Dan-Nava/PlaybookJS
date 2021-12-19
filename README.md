Landing Page: https://afternoon-ocean-99848.herokuapp.com/ 
Documentation: https://afternoon-ocean-99848.herokuapp.com/Docs

Getting Started:

Note that this library utilizes JQuery, as such it must be acquired first.

On your webpage you will need both a JQuery script and a script for Playbook in this order:
    <script defer src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script defer type="text/javascript" src='js/Playbook.js'></script>

To setup a simple scenario of a Play, Field, and Token with a 1 branch path see the code below:
    const play = new Play();
    const field = new Field(play);
    field.createField($('#example-one-container')[0], 'fID', '50em', '30em', '0.5em solid black', 'green');
    const t = new Token(play);
    t.createTokenVisual('blue', 13 + 'em', 18 + 'em', '4em', '4em', 'circle');
    let joint = t.path.createPathJoint();
    joint.breakPoint.createBPVisual('rgb(0,0,0, 0.4)', 8 + 'em', 2 + 'em', '4em', '4em', 'circle');
    joint.branch.createBranchVisual('black', '12px', '12px');

The animation can then be run by using:
    play.runAnimations(500);
