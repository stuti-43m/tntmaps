import fs from 'fs'
import request from 'request'
import async from 'async';
import dump from './dump.js'
var x = function() {
    let i = 0;
    async.mapSeries(dump,function(location,callback) {
            i++;
            if(i < 12000) {
            let address = '';
            let cityname = location.origin.split(' ');
            let response = {}
            for(let i=0;i<cityname.length;i++) {
                address = address + cityname[i] + '+';
            }
            let cityname2 = location.bb.split(' ');
            for(let i=0;i<cityname2.length;i++) {
                address = address + cityname2[i] + '+';
            }
            address =  'https://maps.googleapis.com/maps/api/geocode/json?address='+ address + 'madhya+pradesh&key=AIzaSyCbmLJqbFrko3IXFjoVmOVqUpr4Nj4gwO8';
            console.log('address',address);
                request(address, function (error, response, bb) {
                    //console.log('BODY',bb)
                    let body = JSON.parse(bb);
                    //console.log(body)
                    if (body && body.status == 'OK') {
                        if(body.results && body.results[0] && body.results[0]['address_components']) {
                            //console.log('HUH',body.results[0]['address_components'])
                            if(body.results[0]['address_components'][0]) {
                                //console.log('YAYYYI')
                                let name = body.results[0]['address_components'][0]['long_name'].toLowerCase();
                                if(name == location.origin.toLowerCase() && body.results[0]['geometry'] && body.results[0]['geometry']['location']) {
                                    //console.log('GOT IT!',body.results[0]['geometry']['location']['lat'])
                                    location.lat = body.results[0]['geometry']['location']['lat'];
                                    location.lng = body.results[0]['geometry']['location']['lng'];
                                    var str = JSON.stringify(location, null, 4);
                                    fs.appendFile('popfinal.txt', str, function (err) {
                                        if (err) throw err;
                                        console.log('Saved!');
                                        callback()
                                      });
                                } else {
                                    console.log('NOT FOUND')
                                    callback()
                                }
                            }
                        }
                    } else {
                        console.log('FAIL!',error,body);
                        var str = JSON.stringify(location, null, 4);
                        fs.appendFile('popfinal.txt', str, function (err) {
                            if (err) throw err;
                            console.log('Saved fail!');
                          });
                        callback();
                    }
                });
            }
    })
}
x();