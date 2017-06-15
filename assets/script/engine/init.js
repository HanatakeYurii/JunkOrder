var inci;

/* ---------------------------
 * - REQUEST ANIMATION FRAME -
 * ---------------------------
 */

window.RequestAnimationFrame = (function ()
{
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (_callback, _element)
            {
                window.setTimeout(_callback, 1000 / 60);
            };
})();


/* ---------
 * - INPUT -
 * ---------
 */

if (Engine.useKeyboard)
{
    Input.KeyBoard.enable();
}
if (Engine.useMouse)
{
    Input.KeyBoard.enable();
}


/* ----------
 * - CANVAS -
 * ----------
 */

var canvas = document.getElementById('canvas');
if (!canvas)
{
    canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    document.body.appendChild(canvas);
}
canvas.style.background = "#eeeeee";
canvas.style.display = "block";
canvas.style.margin = "0 auto";
var ctx = canvas.getContext("2d");


/* ----------
 * - IMAGES -
 * ----------
 */

var Images = {};
var Patterns = {};
var Gradients = {};
var imagesLoaded = 0;

var imageFolder = "assets/graphics/";
var imagesPath = ["beer",
    "bugKiller",
    "cardboardBox",
    "colaBottle",
    "colaCan",
    "foamCup",
    "jar",
    "newspapers",
    "paintSpray",
    "paperBag",
    "pizzaBox",
    "plasticBottle",
    "porcelainCup",
    "tinnedCan",
    "tinnedCanBig",
    "washSoap",

    "conveyorzipper",
    "paper-plain"];

var patternsPath = ["conveyorbelt",
    "trak2_plate2b",
    "trak2_holes2c",
    "trak2_gr81d",
    "trak2_panel2f",
    "tex_molten_iron_a_256"];

Gradients["fire"] = ctx.createLinearGradient(85, 195, 160, 195);
Gradients["fire"].addColorStop("0", "yellow");
Gradients["fire"].addColorStop("0.5", "red");
Gradients["fire"].addColorStop("1", "black");

/* -----------
 * - LOADING -
 * -----------
 */

function init()
{
    console.log("Starting loading...");
    loadImages();
}

function loadImages()
{
    var paths = imagesPath.concat(patternsPath);
    for (let i = 0; i < paths.length; i++)
    {
        let name = paths[i];
        Images[name] = new Image();
        Images[name].src = imageFolder + name + ".png";
        Images[name].onload = function ()
        {
            imagesLoaded++;
            if (imagesLoaded === paths.length)
            {
                // All Image are Loaded
                console.log("All " + imagesLoaded + " images loaded");
                loadPatterns();
            }
        };
    }
}

function loadPatterns()
{
    for (let i = 0; i < patternsPath.length; i++)
    {
        let name = patternsPath[i];
        Patterns[name] = ctx.createPattern(Images[name], 'repeat');
    }
    console.log("All " + patternsPath.length + " patterns loaded");
    loaded();
}

/* ----------
 * - LOADED -
 * ----------
 */

function loaded()
{
    console.log("Done loading! Starting...");
    keyY = canvas.height - (20 + keySize);
    let onTitle = true;

    playing = Title;
    run();
}

function run()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    playing.update();
    playing.render();
    credits();
    RequestAnimationFrame(run);
}

init();