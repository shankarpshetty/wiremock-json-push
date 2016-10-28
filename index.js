const walk    = require('walk');
const http = require('http');
const commandLineArgs = require('command-line-args');

const options = commandLineArgs([
  { name: 'host', defaultValue: 'localhost' },
  { name: 'port' },
  { name: 'dir' }
]);

if ( !options.port ) {
    console.error('No port specified, use --port');
    process.exit();
}

if ( !options.dir ) {
    console.error('No directory specified, use --dir');
    process.exit();
}

const dir =  options.dir.replace( new RegExp('([^/])(/?)$', 'ig'), '$1' );

const walker  = walk.walk( dir, { followLinks: false });

const postOptions = {
    host: options.host,
    port: options.port,
    path: '/__admin/mappings',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

walker.on('file', function(root, stat, next) {

    if ( stat.name.match( new RegExp('\.json$', 'i') ) ) {
        var jsonFile = root + '/' + stat.name;

        console.log( 'Pushing json data from ' + jsonFile );
        var jsonData = require( jsonFile );
        var postData = JSON.stringify( jsonData );

        var postRequest = http.request( postOptions, function(res) {});
        postRequest.write( postData );
        postRequest.end();
    }

    next();
});

walker.on('end', function() {
    console.log('done');
});

