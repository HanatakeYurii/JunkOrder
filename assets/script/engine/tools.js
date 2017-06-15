// Moz random
function getRandomInt(min, max = 0)
{
    if (max < min)
    {
        let temp = min;
        min = max;
        max = temp;
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min, max = 0)
{
    if (max < min)
    {
        let temp = min;
        min = max;
        max = temp;
    }
    return (Math.random() * (max-min)) + min;
}



function lastOf(array)
{
    if (array.length)
    {
        return array[array.length-1];
    }
    return null;
}
