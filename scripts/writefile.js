import fs from 'fs'
import request from 'request'
import async from 'async';
import potentiallocations from './potentiallocations.js'
import village from './village.js'
let count = 0;
var x = function() {
    let i = 0;
    async.mapSeries(village,function(location,callback) {
            i++;
            let exists = false;
            let address = '';
            console.log('vv',village.length)
            if(i > 44943) {
                for(let j=0;j < potentiallocations.length;j++) {
                    if((potentiallocations[j].origin == location.origin) && potentiallocations[j].lat && !exists) {
                        console.log('exists');
                        location.lat = potentiallocations[j].lat;
                        location.lng = potentiallocations[j].lng;
                        exists = true;
                        let str = JSON.stringify(location, null, 4);
                        fs.appendFile('popfinal.txt', str, function (err) {
                            if (err) throw err;
                            console.log('Saved exists!');
                            callback()
                        });
                    }
                }
                if(!exists) {
                    console.log('calling')
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
            } else {
                callback(null);
            }
            
    })
}
x();