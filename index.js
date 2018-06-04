var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var youtubedl = require('youtube-dl');


const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
const URL_YOUTUBE = process.argv[2];

if (!URL_YOUTUBE) {
  throw Error("HACE FALTA URL!!");
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
    });
  
    video.pipe(fs.createWriteStream(path.join(DOWNLOAD_DIR, filename)));
  });
});


