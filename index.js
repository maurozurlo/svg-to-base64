const fs = require('fs');
const path = require('path');
const svg2img = require('svg2img');
const btoa = require('btoa');
const chalk = require('chalk');

//svg
let replacementColor = "F2F2F2"; //Fallback color
let svgFiles = [];
//Directory
const directoryPath = path.join(__dirname, 'svgs');
const outputPath = path.join(__dirname, 'pngs');
//Output file
const outputFile = 'output.txt';
//Get the color command
if (process.argv[2] != undefined) {
    replacementColor = process.argv[2];
}else{
    console.log(`${chalk.bgRed.white("Invalid color, will use fallback color...")}`);
}

console.log(displayMsg());

function displayMsg(){
    let bgColor = "#f7f7f7";
    if(lightOrDark(`#${replacementColor.toString()}`) == 'light'){
        bgColor = "000";
    }
    return `Background color will be replaced with: ${chalk.bgHex(`${bgColor}`).hex(`#${replacementColor}`)(`${replacementColor}`)}`;
}

//Get files
fs.readdir(directoryPath, function (err, files) {
    //Handling the errors
    if (err) {
        return console.log(`${chalk.bgRed.white(`Unable to scan directory: ${err}`)}`);
    }
    //Remove output
    if (fs.existsSync('output.txt')) {
        //file exists
        console.log(`${chalk.bgYellowBright.redBright(`WARNING: Output file already exists... erasing...`)}`);
        fs.unlinkSync('output.txt')
      }
    
    //Listing files
    files.forEach(function (file) {
        if (getExtension(file) == '.svg') {
            // Convert each file
            convertToPng(file);
            svgFiles.push(file);
        }
    });
});

//Convert file
function convertToPng(file) {
    fs.readFile(`${directoryPath}/${file}`, function (err, data) {
        if (err) throw err;
        let svgString;
        svgString = data.toString().replaceAll('HEXCOD', replacementColor.toString());
        svg2img(svgString, { 'width': 66, 'height': 66 }, function (error, buffer) {
            //Output the file & convert png to Base64
            fs.writeFileSync(`${outputPath}/${file.removeExtension()}.png`, buffer, function(err){
                if(err){
                    console.log(`${chalk.bgRed.white(`An error ocurred: ${err}`)}`);
                }
            })
            if(file == svgFiles[svgFiles.length-1]){
                console.log(`${chalk.bgGreen.whiteBright("All files converted successfully to PNG, converting to Base64...")}`);
                convertToBase64();
            }
        });
    });
}

//Get all files and turn them into BASE64
function convertToBase64() {
    // Add base64 to array
    //All files are stored in svgFiles arr

    let buffer = "";
    svgFiles.forEach(function (file) {
        let dataToAppend = fs.readFileSync(`${outputPath}/${file.removeExtension()}.png`, 'base64');
        buffer += `${file}: \n ${dataToAppend} \n \n`;
    });

    fs.writeFileSync(outputFile, buffer,function(err){
        if(err){
            console.log(`Error: ${err}`);
        }
    });
    console.log(chalk.bgGreen.whiteBright(`SUCCESS: All files were converted successfully as Base64 and saved as: ${outputPath}\/${outputFile}`));
}

//Replace function
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

//Get filename without extension
String.prototype.removeExtension = function () {
    var target = this;
    return target.split('.').slice(0, -1).join('.');
}

//Get extension
function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
}

//Determine if color is dark or light
function lightOrDark(color) {

    // Variables for red, green, blue values
    var r, g, b, hsp;
    
    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        
        r = color[1];
        g = color[2];
        b = color[3];
    } 
    else {
        
        // If RGB --> Convert it to HEX: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace( 
        color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }
    
    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp>127.5) {

        return 'light';
    } 
    else {

        return 'dark';
    }
}