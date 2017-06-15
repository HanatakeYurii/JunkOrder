var y = 400,
        minX = 150,
        maxX = 700,
        beltLength = 120,
        binLength = 200,
        binBorder = 10,
        binShadow = 2,
        dist = 0,
        beltY = 0, // Dynamic!
        binY = 0, // Dynamic!
        keyY = 0,
        keySize = 80,
        binHollowY = 0,
        binHollowH = 0,
        next = 0,
        binSize = 70,
        playing = null,
        isLoaded = false,
        speed = 0,
        spaceMin = 0,
        spaceMax = 0,
        day = 1,
        checkIdx = 0,
        toNotBurn = [],
        startTime = 0,
        time = 0;
const keys = "wxcvbn";

var conveyors = [];
var bins = [];
var trashes = [];

var TrashTypes = {
    beer: ["glass", "colored glass"],
    bugKiller: ["PET", "chemicals"],
    cardboardBox: ["paper"],
    colaBottle: ["glass", "colored glass"],
    colaCan: ["metallic"],
    foamCup: ["polystyrene"],
    jar: ["glass", "colorless glass"],
    newspapers: ["paper"],
    paintSpray: ["metallic", "paper"],
    paperBag: ["paper"],
    pizzaBox: ["paper", "greasy"],
    plasticBottle: ["PET"],
    porcelainCup: ["porcelain"],
    tinnedCan: ["metallic"],
    tinnedCanBig: ["metallic"],
    washSoap: ["PET"]
};
var trashTypes = [];
for (let k in TrashTypes)
    trashTypes.push(k);

var days = [
    {bins: [{color: "#bbbbbb", types: ["glass"]}, {color: "#cc5522", types: ["paper"]}], speed: 1.3, spaceMin: 80, spaceMax: 240, time: 40}, //Level 1...
    {bins: [{color: "#bbbbbb", types: ["glass"]}, {color: "#dddd00", types: ["metallic"]}, {color: "#cc5522", types: ["paper"]}], speed: 1.4, spaceMin: 80, spaceMax: 220, time: 45},
    {bins: [{color: "#bbbbbb", types: ["colorless glass"]}, {color: "#00cc00", types: ["colored glass"]}, {color: "#dddd00", types: ["metallic"]}, {color: "#cc5522", types: ["paper"]}], speed: 1.5, spaceMin: 80, spaceMax: 200, time: 50}
];

class Trash {
    constructor(type, x = canvas.width + 100)
    {
        this.pos = x;
        this._type = type;
        this.dir = getRandomFloat(2);
        this.Image = Images[this._type];
    }
    update()
    {
        this.pos -= speed;
    }
    draw()
    {
        ctx.save();
        ctx.translate(this.pos, y);
        ctx.rotate(this.dir * Math.PI);
        ctx.drawImage(this.Image, -this.Image.width * 0.5, -this.Image.height * 0.5);
        ctx.restore();
    }
    debug()
    {
        ctx.save();
        ctx.translate(this.pos, y);
        ctx.fillStyle = "white";
        ctx.fillText(this.pos | 0, 0, 0);
        ctx.restore();
    }
}

function trashDump()
{
    if (trashes.length && trashes[0].pos < 0)
    {
        let tr = trashes.shift();
        if (TrashTypes[tr._type].some(v => toNotBurn.includes(v)))
        {
            Score.trashFailed++;
        }
        trashDump();
    }
}

class Bin {
    constructor(color, width, types, key)
    {
        this.color = color;
        this.width = width;
        this.types = types;
        this._keyChar = key;
        this._keyCode = Input.KeyBoard.charToKeyCode(key);
        this.opened = false;
        this.x = 0;
        conveyors[0] -= this.width;
    }
    update()
    {
        if (Input.KeyBoard.Pushed[this._keyCode])
        {
            this.opened = true;
            var dumped = checkTrash(this.x, this.x + this.width);
            for (let trash of dumped)
            {
                if (!TrashTypes[trash._type].some(v => this.types.includes(v)))
                {
                    Score.trashFailed++;
                }
            }
        } else
        {
            this.opened = false;
        }
    }
    draw()
    {
        this.x = dist;
        ctx.save();
        // Metal
        ctx.fillStyle = Patterns["trak2_holes2c"];
        ctx.fillRect(this.x, binY, this.width, binLength);
        let offset = (this.width - keySize) * 0.5;
        ctx.fillRect(this.x + offset, keyY, keySize, keySize);

        // Color blend
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, binY, this.width, binLength);
        ctx.fillRect(this.x + offset, keyY, keySize, keySize);

        ctx.restore();
        ctx.save();
        // Hollow
        ctx.fillStyle = "black";
        ctx.fillRect(this.x + binBorder, binHollowY, this.width - binBorder * 2, binHollowH);

        ctx.fillStyle = Patterns["conveyorbelt"];
        ctx.translate(0, beltY);
        if (this.opened)
        {
            ctx.fillRect(this.x, 0, binBorder - 4, beltLength);
            ctx.fillRect(this.x + (this.width - (binBorder - 4)), 0, binBorder - 4, beltLength);
        } else
        {
            ctx.fillRect(this.x, 0, this.width, beltLength);
        }

        ctx.restore();
        ctx.save();
        // Shadow
        ctx.strokeStyle = "black";
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = binShadow;
        ctx.strokeRect(this.x, binY, this.width, binLength);
        ctx.strokeRect(this.x + offset, keyY, keySize, keySize);

        ctx.restore();

        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "white";
        ctx.fillStyle = "black";
        ctx.font = "70px arial";
        ctx.textAlign = "center";
        ctx.strokeText(this._keyChar, this.x + this.width * 0.5, keyY + this.width * 0.5);
        if (this.opened)
        {
            ctx.fillText(this._keyChar, this.x + this.width * 0.5, keyY + this.width * 0.5);
        }
        ctx.restore();
    }
}

var Incinerator = {

    height: 256,
    width: 256,
    x: -172,
    fireBorder: 23,
    fireWidth: 75,
    firePower: 100,
    ticks: getRandomInt(3, 9),
    draw() // OK (but can be enhanced on fire)
    {
        this.ticks--;
        if (this.ticks < 1)
        {
            this.ticks = getRandomInt(3, 9);
            if (this.firePower === 100)
            {
                this.firePower -= getRandomInt(0, 40);
            } else
            {
                this.firePower = 100;
            }
        }
        let incY = y - this.height * 0.5;
        // Metal
        ctx.save();
        ctx.fillStyle = Patterns["trak2_gr81d"];
        ctx.translate(this.x, incY);
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();
        // Fire
        ctx.save();
        ctx.globalAlpha = this.firePower * 0.01;
        ctx.fillStyle = Gradients["fire"];
        ctx.globalCompositeOperation = "lighter";
        ctx.fillRect(this.x + this.width, incY + this.fireBorder, this.fireWidth, this.height - this.fireBorder * 2);
        ctx.restore();
    }
}
;
function checkTrash(minY, maxY)
{
    var tab = [];
    while (checkIdx < trashes.length && trashes[checkIdx].pos < minY)
    {
        checkIdx++;
    }
    while (checkIdx < trashes.length && trashes[checkIdx].pos <= maxY)
    {
        tab.push(trashes.splice(checkIdx, 1)[0]);
        checkIdx++;
    }
    return tab;
}

function startLevel(nb)
{
    startTime = Date.now();
    toNotBurn = [];
    speed = days[nb - 1].speed;
    spaceMin = days[nb - 1].spaceMin;
    spaceMax = days[nb - 1].spaceMax;
    // Creating bins
    bins = [];
    for (let i = 0; i < days[nb - 1].bins.length; i++)
    {
        let template = days[nb - 1].bins[i];
        toNotBurn.push(...template.types);
        bins.push(new Bin(template.color, 120, template.types, keys[i]));
    }
    conveyors = [maxX - (minX + bins.length * binSize)];
    for (let i = 0; i < bins.length; i++)
    {
        let idx = getRandomInt(conveyors.length);
        let dist = conveyors[idx];
        let diff = getRandomInt(dist);
        conveyors.splice(idx, 1, diff, dist - diff);
    }
    conveyors[0] += minX;
    conveyors[conveyors.length - 1] += 1000 - maxX;

}

var Level = {
    dayOn: false,
    update: function ()
    {
        checkIdx = 0;
        trashDump();
        for (let trash of trashes)
        {
            trash.update();
        }

        for (let bin of bins)
        {
            bin.update();
        }
        if (this.dayOn)
        {
            time = days[day - 1].time * 10 - (Date.now() - startTime) * 0.01 | 0;
            var tmp = lastOf(trashes);
            if (!tmp || (canvas.width + 70) - tmp.pos >= next)
            {
                trashes.push(new Trash(trashTypes[getRandomInt(trashTypes.length)], canvas.width + 70));
                Score.trashTotal++;
                next = getRandomInt(spaceMin, spaceMax);
            }
            if (time < 0)
            {
                time = 0;
                this.dayOn = false;
            }

        }
        if (!trashes.length)
        {
            startTime = Date.now();
            playing = Score;
        }
    },
    render: function ()
    {

        beltY = y - beltLength * 0.5;
        binY = y - binLength * 0.5;
        binHollowY = binY + binBorder;
        binHollowH = binLength - binBorder * 2;

        // BG
        ctx.save();
        ctx.fillStyle = Patterns["trak2_plate2b"];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Belts & bins
        ctx.save();
        dist = 0;
        ctx.translate(0, beltY);
        ctx.fillStyle = Patterns["conveyorbelt"];
        ctx.fillRect(0, 0, canvas.width, beltLength);
        ctx.restore();

        dist += conveyors[0];
        for (let i = 1; i < conveyors.length; i++)
        {
            bins[i - 1].draw();
            dist += bins[i - 1].width;
//        ctx.fillStyle = Patterns["conveyorbelt.png"];
//        ctx.fillRect(dist, beltY, conveyors[i], 120);
            dist += conveyors[i];
        }

        for (let trash of trashes)
        {
            trash.draw();
        }

        ctx.save();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "black";
        ctx.globalAlpha = 0.6;
        ctx.translate(-15, -56);
        ctx.strokeRect(0, 0, 256, 256);
        ctx.restore();

        ctx.save();
        // Metal
        ctx.fillStyle = Patterns["trak2_panel2f"];
        ctx.translate(-15, -56);
        ctx.fillRect(0, 0, 256, 256);
        ctx.restore();

        Incinerator.draw();

        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.fillStyle = Patterns["tex_molten_iron_a_256"];
        ctx.font = "40px arial";
        ctx.textBaseline = "top";
        ctx.strokeText("Day " + day, 20, 20);
        ctx.fillText("Day " + day, 20, 20);
        ctx.strokeText(Score.trashFailed + " failed", 20, 70);
        ctx.fillText(Score.trashFailed + " failed", 20, 70);
        let h = time / 60 | 0;
        let m = time % 60;
        if (m < 10)
            m = "0" + m;
        ctx.strokeText("Left: " + h + ":" + m, 20, 120);
        ctx.fillText("Left: " + h + ":" + m, 20, 120);
        ctx.restore();

        ctx.save();
        ctx.translate(900, 0);
        ctx.scale(0.5, 0.5);
        ctx.drawImage(Images["paper-plain"], 0, -200);
        ctx.scale(2, 2);
        let drawX = 40, drawY = 20;
        for (let bin of bins)
        {
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = bin.color;
            ctx.fillRect(drawX, drawY, 50, 30);
            ctx.globalAlpha = 0.9;
            drawX += 80;
            ctx.fillStyle = "black";
            ctx.textBaseline = "top";
            ctx.font = "bold 24px Calibri";
            for (let type of bin.types)
            {
                ctx.fillText(type, drawX, drawY);
                drawY += 14;
            }
            drawX -= 80;
            drawY += 40;
        }
        ctx.restore();
    }
};
var Title = {
    status: 100,
    starting: false,
    update: function ()
    {
        if (this.starting)
        {
            this.status -= 2;
            console.log(this.status);
            if (this.status <= 0)
            {
                this.status = 0;
                playing = Level;
                Level.dayOn = true;
            }
        } else if (Input.KeyBoard.Pushed[13])
        {
            this.starting = true;
            day = 1;
            startLevel(day);
        }
    },
    render: function ()
    {
        if (this.starting)
        {
            Level.render();
        }
        
        ctx.save();
        ctx.globalAlpha = (this.status > 100) ? 1 : this.status * 0.01;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 150px Calibri";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("Junk Order", canvas.width * 0.5, canvas.height * 0.5);

        ctx.restore();
        if (!this.starting)
        {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.font = "bold 30px Calibri";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            Button.render();
            ctx.restore();
        } 
    }
};

var Score = {
    status: 0,
    trashTotal: 0,
    trashFailed: 0,
    goingDark: true,
    update: function ()
    {
        if (this.goingDark && (this.status || Date.now() - startTime > 1000) && this.status < 100)
        {
            this.status += 2;
            if (this.status >= 100)
            {
                this.status === 100;
                startTime = Date.now();
            }
        }


        if (!this.goingDark)
        {
            this.status -= 2;
            if (this.status <= 0)
            {
                this.status = 0;
                this.goingDark = true;
                playing = Level;
                Level.dayOn = true;
            }
        }
    },
    render: function ()
    {
        if (this.status < 100)
        {
            Level.render();
        }
        ctx.save();
        ctx.globalAlpha = (this.status > 100) ? 1 : this.status * 0.01;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        if (this.status >= 100)
        {
            if (this.goingDark && Date.now() - startTime > 1000)
            {
                this.status++;
                startTime = Date.now();

            }
            ctx.save();
            ctx.fillStyle = "white";
            ctx.font = "bold 50px Calibri";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            switch (this.status - 100)
            {
                default:
                case 3:
                    if (day < days.length)
                    {
                        Button.render();
                        if (Input.KeyBoard.Pushed[13])
                        {
                            this.goingDark = false;
                            day++;
                            startLevel(day);
                            this.status = 100;
                        }
                    } else
                    {
                        ctx.fillText("Press F5 to play again", canvas.width * 0.5, 600);
                    }

                case 2:
                    ctx.fillText("Failed: " + this.trashFailed, canvas.width * 0.5, 400);
                case 1:
                    ctx.fillText("Junk: " + this.trashTotal, canvas.width * 0.5, 300);
                case 0:
                    ctx.fillText("Day: " + day, canvas.width * 0.5, 200);
                    break;
            }
            ctx.restore();
        }
    }
};

var Button = {
    power: 100,
    goingUp: true,
    step: 1,
    render: function ()
    {
        if (this.power >= 100) // Max
        {
            this.goingUp = false;
            this.power = 100;
        } else if (this.power <= 20) // Min
        {
            this.goingUp = true;
            this.power = 20;
        }
        if (this.goingUp) // Up
        {
            this.power += this.step;
        } else // Down
        {
            this.power -= this.step;
        }
        ctx.globalAlpha = this.power * 0.01;
        ctx.fillText("-Press Enter-", canvas.width * 0.5, 600);
        ctx.globalAlpha = 1;
    }
};
function credits()
{
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Calibri";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("Junk Order by Bastien Declaye", canvas.width - 5, canvas.height - (2 + 12 + 2));
    ctx.fillText("2017 - Development version 0.2", canvas.width - 5, canvas.height - 2);
    ctx.restore();
}