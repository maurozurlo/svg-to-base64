const fs = require('fs');
const path = require('path');
const svg2img = require('svg2img');
const btoa = require('btoa');

//svg
let replacementColor = "F2F2F2"; //Fallback color
let svgArr = [];
//Directory
const directoryPath = path.join(__dirname, 'svgs');
const outputPath = path.join(__dirname, 'pngs');
//Output file
const outputFile = 'output.txt';
//Get the color command
if (process.argv[2] != undefined) {
    replacementColor = process.argv[2];
}

console.log(`Background color will be replaced with: ${replacementColor}`);

//Get files
fs.readdir(directoryPath, function (err, files) {
    //Handling the errors
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    //Listing files
    //files.map(file)
    files.forEach(function (file) {
        if (getExtension(file) == '.svg') {
            // Convert each file
            convertToPng(file);
        }
    });
});

//Convert file
function convertToPng(file) {
    fs.readFile(`${directoryPath}/${file}`, function (err, data) {
        if (err) throw err;
        let svgString;
        svgString = data.toString().replaceAll('HEXCOD', replacementColor);

        svg2img(svgString, { 'width': 66, 'height': 66 }, function (error, buffer) {
            //Output the file
            fs.writeFileSync(`${outputPath}/${file.removeExtension()}.png`, buffer);
            //Convert png to Base64
            convertToBase64(file);
        });
    });
}

//Get all files and turn them into BASE64
function convertToBase64(file) {
    // Add base64 to array
    let amount = svgArr.length;
    let dataToAppend = "";
    svgArr.push(file.toString());
    svgArr.push(fs.readFileSync(`${outputPath}/${file.removeExtension()}.png`, 'base64'));
    dataToAppend = `${svgArr[amount]}: \n ${svgArr[amount+1]} \n \n`;
    fs.appendFileSync(outputFile, dataToAppend);
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