var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var youtubedl = require('youtube-dl');
var ffmpeg = require('fluent-ffmpeg');
var argv = require('minimist')(process.argv.slice(2));

// miPrograma -i [URL] --format=[audio|video]
// Ejemple: node . -i https://www.youtube.com/watch?v=Pv0PAchVGCw --format video

const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
const URL_YOUTUBE = argv.i;

if (!argv.i || (argv.format!=='audio' && argv.format!=='video')) {
  throw Error("Usage: miPrograma -i [URL] --format=[audio|video]");
  return;
}


mkdirp(DOWNLOAD_DIR, function(err) { 
  if(err) throw err;

  youtubedl.getInfo(URL_YOUTUBE, [], function(err, info) {
    if (err) throw err;  
    console.log("Preparing download...");
    const video = youtubedl(URL_YOUTUBE, ['--format=best'], { cwd: DOWNLOAD_DIR });
    const filename = info._filename;
  
    video.on('info', function(info) {
      console.log('Download started');
      console.log('filename: ' + info._filename);
      console.log('size: ' + info.size);
    });
  
    video.on('complete', function complete(info) {
      console.log('filename: ' + info._filename + ' already downloaded.');
    });
    
    video.on('end', function() {
      console.log('finished downloading!');

      if(argv.format === "audio") {
        console.log("conversion starting...");
        const videoInput = path.join(DOWNLOAD_DIR, filename);
        const tempOutput = path.join(DOWNLOAD_DIR, filename).split(".");
        tempOutput.splice(-1);
        const audioOutput = tempOutput + ".mp3";
        
        convert(videoInput, audioOutput, function(err){
          if(err) throw err;
          console.log('conversion complete');
          fs.unlinkSync(videoInput);
        });
      }
    });
  
    video.pipe(fs.createWriteStream(path.join(DOWNLOAD_DIR, filename)));
  });
});


function convert(input, output, callback) {
  ffmpeg(input)
      .output(output)
      .on('end', function() {                    
          console.log('conversion ended');
          callback(null);
      }).on('error', function(err){
          console.log('error: ', e.code, e.msg);
          callback(err);
      }).run();
}
