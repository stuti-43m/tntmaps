// This example creates a simple polygon representing the Bermuda Triangle.
// When the user clicks on the polygon an info window opens, showing
// information about the polygon's coordinates.
import newdata from './newdata.js'
let map;
let infoWindow;
let markedvillages = []
let villagemarkerarr = [];
let outletmarkerarr = [];
let outletcount = [];
let counthidden = false;
let activemaker;
let previousmarker;
let placeupdated = false;
let currenthover;
let activemarkernode;
let lastclicked;
let lastpoly;
let currentclicked;
let lastclickedIndex;
let downloadarr = [];
let colormapping = [{
    id:1,
    color:'#ffffff',
    text: '< 10000'
},
{
    id:2,
    color:'#f0f0f0',
    text: '10000 - 50000'
},
{
    id:3,
    color:'#d9d9d9',
    text: '50000 - 70000'
},{
    id:4,
    color:'#bdbdbd',
    text: '70000 - 90000'
},{
    id:5,
    color:'#969696',
    text: '90000 - 150000'
},{
    id:6,
    color:'#737373',
    text: '150000 - 250000'
},{
    id:7,
    color:'#525252',
    text: '250000 - 500000'
}, {
    id:8,
    color:'#252525',
    text: '500000 - 800000'
},{
    id:9,
    color:'#000000',
    text: '> 800000'
}]
let headers = {
    origin: "Village",
    bb: "Block",
    bb2: "District",
    population:"population",
    lat:"Lat",
    lng:"Lng",
    neighbouringlocations:"Nearby outlets"
}
window.initMap =  function() {
    let clickhandler = (evt,elm,index,placemap) => {
        newdata[index].click ++;
        if(newdata[index].click %2 == 1) {
            placemap.setOptions({fillOpacity: 1});
            placemap.setOptions({strokeWeight: 1});
            placemap.setOptions({strokeColor:"#0b5ee3"});
            if(newdata[index].countCircle) {
                newdata[index].countCircle.setOptions({fillOpacity:0});
                newdata[index].countCircle.setOptions({strokeOpacity:0});
            }
            if(elm) {
                elm.style.color = '#f0f3bd'
                elm.style.fontWeight = 1000;
            }
            if(lastclicked) {
                lastclicked.style.fontWeight = 100;
                lastclicked.style.color = '#ffffff';
            }
            if(lastpoly) {
                lastpoly.setOptions({fillOpacity: 0.7});
                lastpoly.setOptions({strokeWeight: 0.1});
                lastpoly.setOptions({strokeColor:"#ffffff"});
            }
            if(lastclickedIndex) {
                newdata[lastclickedIndex].click = 0;
            }
            showmarkers(evt,index,placemap);
        } else {
            if(lastclicked) {
                lastclicked.style.fontWeight = 100;
                lastclicked.style.color = '#ffffff'
            }
            activemaker = null;
            map.setZoom(6.9);
            map.setCenter({ lat: 23.9734, lng: 78.6569 });
            for(let i=0;i<villagemarkerarr.length;i++) {
                villagemarkerarr[i].setMap(null);
            }
            for(let i=0;i<outletmarkerarr.length;i++) {
                outletmarkerarr[i].setMap(null);
            }
            outletmarkerarr = [];
            placemap.setOptions({fillOpacity: 0.7});
            placemap.setOptions({strokeWeight: 0.1});
            placemap.setOptions({strokeColor:"#ffffff"});
            if(newdata[index].countCircle) {
                newdata[index].countCircle.setOptions({fillOpacity:0.4});
                newdata[index].countCircle.setOptions({strokeOpacity:1});
            }
        }

        //hide count markers
        if(!activemaker) {
            for(let i=0;i<outletcount.length;i++) {
                outletcount[i].setOptions({fillOpacity: 0.4})
                outletcount[i].setOptions({strokeOpacity: 1})
            }
            counthidden = false;
        } else {
            if(!counthidden) {
                for(let i=0;i<outletcount.length;i++) {
                    outletcount[i].setOptions({fillOpacity: 0})
                    outletcount[i].setOptions({strokeOpacity: 0})
                }
                counthidden = true;
            }
        }
        lastclickedIndex = index;
        lastclicked = elm;
        lastpoly = placemap;
    }
    infoWindow = new google.maps.InfoWindow(); 
    let showmarkers = (evt,index,placemap) => {
        map.setZoom(10);
        map.setCenter(evt);
        if(!activemaker || activemaker != index) {
            console.log('NAME',newdata[index].village)
            markedvillages = newdata[index].villagelist;
            placeupdated = true;
            previousmarker = activemaker;
            activemaker = index;
        } else {
            console.log('NO UPDATE',placeupdated,previousmarker,activemaker)
            placeupdated = false;
        }
        if(placeupdated) {
            let infowindow3 = new google.maps.InfoWindow({
            });
            showdata(activemaker);
            if(activemarkernode) {
                activemarkernode.setOptions({fillOpacity: 0.7});
                activemarkernode.setOptions({strokeWeight: 0.1});
            }
            activemarkernode = placemap;
            //placemap.setOptions({strokeWeight: 0.5});
            for(let i=0;i<villagemarkerarr.length;i++) {
                villagemarkerarr[i].setMap(null);
            }
            for(let i=0;i<outletmarkerarr.length;i++) {
                outletmarkerarr[i].setMap(null);
            }
            villagemarkerarr = [];
            outletmarkerarr = []

            // add existing markers for outlets
            for(let i=0;i<newdata[index].locationNodes.length;i++) {
                let coordinate = newdata[index].locationNodes[i];
                //console.log('coordinate',coordinates)

                let outletCircle = new google.maps.Circle({
                    strokeColor: " #00ff00",
                    strokeOpacity: 1,
                    strokeWeight: 0.2,
                    fillColor: "#00ff00",
                    fillOpacity: 0.4,
                    map,
                    center: {
                        lat: coordinate.lat,
                        lng: coordinate.lng,
                    },
                    radius: 600,
                    clickable:true
                });
                //marker.setMap(map)
                outletmarkerarr.push(outletCircle)
            }

            //add village markers for district
            for(let j=0;j<newdata[index].villagelist.length;j++) {
                if(newdata[index].villagelist[j] && newdata[index].villagelist[j].lat) {
                    //let coordinate = potentiallocations[i];
                    //console.log('coordinate',coordinates)
                    newdata[index].villagelist[j].neighbouringlocations = 0;
                    let villageCircle = new google.maps.Circle({
                        strokeColor: "#0b5ee3",
                        strokeOpacity: 1,
                        strokeWeight: 0.5,
                        fillColor: "#0b5ee3",
                        fillOpacity: 0.4,
                        map,
                        center: {lat:markedvillages[j].lat,
                        lng:markedvillages[j].lng},
                        radius: 0.5*newdata[index].villagelist[j].population,
                        clickable:true
                    });
                    let checkdistance = (mk1, mk2) => {
                        var R = 6371.0710; // Radius of the Earth in miles
                        var rlat1 = mk1.lat * (Math.PI/180); // Convert degrees to radians
                        var rlat2 = mk2.lat * (Math.PI/180); // Convert degrees to radians
                        var difflat = rlat2-rlat1; // Radian difference (latitudes)
                        var difflon = (mk2.lng-mk1.lng) * (Math.PI/180); // Radian difference (longitudes)
                    
                        var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
                        if(d < 15) {
                            newdata[index].villagelist[j].neighbouringlocations ++;
                        }
                    }
                    for(let k=0;k<newdata[index].locationNodes.length;k++) {
                        let t = checkdistance({lat:markedvillages[j].lat,
                            lng:markedvillages[j].lng},newdata[index].locationNodes[k])
                    }
                    
                    
                    villageCircle.addListener("click", () => {
                        infowindow3.setContent('<h4>Population: </h4> <p>' + newdata[index].villagelist[j].population + '</p> <h4>Name: </h4> <p>' +newdata[index].villagelist[j]['origin'] + '</p> <h4>Outlets within 15km </h4><p>' + markedvillages[j].neighbouringlocations + '</p>')
                        console.log('VILLAGE CLICK')
                        infowindow3.setPosition(villageCircle.center);
                        infowindow3.open(map);
                    });
                    //villageCircle.setMap(map);
                    villagemarkerarr.push(villageCircle);
                }
            } 

            
        }
    }
    let showdata = (index) => {
        let name = document.getElementById('name');
        let download = document.getElementById('download')
        let populationcount = document.getElementById('population');
        let villages = document.getElementById('villages');
        let existing = document.getElementById('existing');
        name.innerText = newdata[index].village;
        populationcount.innerText = newdata[index].population;
        villages.innerText = newdata[index].villagelist.length;
        existing.innerText = newdata[index].existingplaces;
        if(activemaker == index) {
                download.onclick = () => {
                exportCSVFile(headers,newdata[index].villagelist,newdata[index].village)
            }
        }
    }
    let existingzoom1 = (count,latlng,index) => {
        let opacity = 0;
        let size = 0
        if(count > 0 && count < 50) {
            opacity = 1
            size = count * 200;
        }
        if(count > 50 && count < 100) {
            opacity = 1
            size = count * 40;
        }
        if(count > 100 && count < 500) {
            opacity = 1
            size = count * 40;
        }
        if(count > 500 && count < 1000) {
            opacity = 1
            size = count * 10;
        }
        if(count > 1000) {
            opacity = 1
            size = count * 7;
        }
        let cityCircle = new google.maps.Circle({
            strokeColor: "#00ff00",
            strokeOpacity: 1,
            strokeWeight: 0.5,
            fillColor: "#00ff00",
            fillOpacity: 0.4,
            map,
            center: latlng,
            radius: size
        });
        newdata[index].countCircle = cityCircle;
        outletcount.push(cityCircle);
    }
    function createcontainers() {
        for(let i=0;i<colormapping.length;i++) {
            let element = document.createElement("div");
            element.className = 'selector';
            element.id = (i+1)+"_picker";
            let elementc = document.createElement("div");
            elementc.style.backgroundColor = colormapping[i].color;
            elementc.className = 'headerc';
            let ctext = document.createElement("p");
            ctext.className = 'count';
            ctext.innerText = colormapping[i].text;
            element.appendChild(ctext)
            element.appendChild(elementc);
            let textcont = document.createElement("div");
            textcont.className = 'citycontainer';
            textcont.id = (i+1)+"_citycontainert";
            element.appendChild(textcont);
            document.getElementById('holder').appendChild(element)
        }
    }
    function getpopulationcolour(population) {
        if(population<10000) {
            return colormapping[0]
        }
        if(10000<population && population<50000) {
            return colormapping[1]
        }
        if(50000<population && population<70000) {
            return colormapping[2]
        }
        if(70000<population && population<90000) {
            return colormapping[3]
        }
        if(90000<population && population<150000) {
            return colormapping[4]
        }
        if(150000<population && population<250000) {
            return colormapping[5]
        }
        if(250000<population && population<500000) {
            return colormapping[6]
        }
        if(500000<population && population<800000) {
            return colormapping[7]
        }
        if(population>=800000) {
            return colormapping[8]
        }
    }
    function downloaddata() {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([JSON.stringify(downloadarr, null, 2)], {
            type: "text/plain"
        }));
        a.setAttribute("download", "data.txt");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    function exportCSVFile(headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }
        console.log('TITLE',fileTitle,items[1])
        // Convert Object to JSON
        var jsonObject = JSON.stringify(items);

        var array = typeof jsonObject != 'object' ? JSON.parse(jsonObject) : jsonObject;
        var csv = '';

        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {
                if (line != '') line += ','

                line += array[i][index];
            }

            csv += line + '\r\n';
        }

        var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, exportedFilenmae);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilenmae);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }



    map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6.9,
    center: { lat: 23.9734, lng: 78.6569 },
    mapId: "35b475419a2c287f",
    });

    createcontainers();
    for(let i=0;i<165;i++) {
        let newObj = {}
        let place = newdata[i].coordinate;
        let newval = [];
        let bounds = new google.maps.LatLngBounds();
        let existingplaces = 0;
        for(let i=0 ;i<place.length;i++) {
            var newobj = {
                lng:place[i].lat,
                lat:place[i].lng
            }
            newval.push(newobj);
            bounds.extend(newobj);
        }
        let population = newdata[i].population;
        let popdata = getpopulationcolour(population)
        let colour = popdata.color;
        const placemap = new google.maps.Polygon({
            paths: newval,
            strokeColor: "#000000",
            strokeOpacity: 0.8,
            strokeWeight: 0.1,
            fillColor: colour,
            fillOpacity: 0.9,
        });
        placemap.setMap(map);
        let latLngC = bounds.getCenter();
        newdata[i].click = 0;
        //find existing locations
        google.maps.event.addListener(placemap, 'mouseover', (evt) => {
            //infowindow.setPosition(evt.latLng); // or evt.latLng
            if(!activemaker) {
                placemap.setOptions({strokeColor:"#0896fc"});
                placemap.setOptions({strokeWeight: 0.9});
                showdata(i);
            }
            //infowindow2.open(map);
        });
        google.maps.event.addListener(placemap, 'mouseout', (evt) => {
            if(i != activemaker) {
                placemap.setOptions({strokeColor:"##000000"});
                placemap.setOptions({strokeWeight: 0.1});
            }
        });
        google.maps.event.addListener(placemap, 'click', (evt) => {
            let elem = document.getElementById(i+"_city");
            console.log('elem',elem,i+"_city")
            clickhandler(evt.latLng,elem,i,placemap);
        });
        //contained villages
        if(newdata[i].existingplaces) {
            existingzoom1(newdata[i].existingplaces,latLngC,i)
        }
        //text data
        if(population > 0) {
            let element = document.createElement("div");
            let parentid = popdata.id + '_citycontainert';
            let parent  = document.getElementById(parentid);
            element.className = 'city';
            element.id = i+"_city";
            element.clickc = 0;
            let textstring = '';
            if(newdata[i].existingplaces != 0) {
                textstring = newdata[i].village;
            } else {
                textstring = '* ' + newdata[i].village
            }
            element.appendChild(document.createTextNode(textstring));
            element.addEventListener('click',() => {
                element.clickc ++;
                clickhandler(latLngC,element,i,placemap);
            })
            parent.appendChild(element)
        }
    }
  // Define the LatLng coordinates for the polygon.
 
  // Construct the polygon.
  // Add a listener for the click event.
  //placemap.addListener("click", showArrays);

}
