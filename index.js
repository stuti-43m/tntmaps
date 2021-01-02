// This example creates a simple polygon representing the Bermuda Triangle.
// When the user clicks on the polygon an info window opens, showing
// information about the polygon's coordinates.
import newdata from './newdata.js'
import existinglocations from './existinglocations.js'
import potentiallocations from './potentiallocations.js'
let map;
let infoWindow;
let markedvillages = []
let villagemarkerarr = [];
let activemaker;
let previousmarker;
let placeupdated = false;
let currenthover;
let activemarkernode;
let colormapping = [{
    id:1,
    color:'#fff5eb',
    text: '< 10000'
},
{
    id:2,
    color:'#fee6ce',
    text: '10000 - 50000'
},
{
    id:3,
    color:'#fdd0a2',
    text: '50000 - 70000'
},{
    id:4,
    color:'#fdae6b',
    text: '70000 - 90000'
},{
    id:5,
    color:'#fd8d3c',
    text: '90000 - 150000'
},{
    id:6,
    color:'#f16913',
    text: '150000 - 250000'
},{
    id:7,
    color:'#d94804',
    text: '250000 - 500000'
}, {
    id:8,
    color:'#a63603',
    text: '500000 - 800000'
},{
    id:9,
    color:'#5c0300',
    text: '> 800000'
}]
window.initMap =  function() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    center: { lat: 22.9734, lng: 78.6569 },
    mapId: "35b475419a2c287f",
  });
  createcontainers();
  for(let i=0;i<165;i++) {
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
    let population = getpopulation(newdata[i].city,newdata[i].village,i);
    let popdata = getpopulationcolour(population)
    let colour = popdata.color;
    const placemap = new google.maps.Polygon({
        paths: newval,
        strokeColor: "#000000",
        strokeOpacity: 0.8,
        strokeWeight: 0.1,
        fillColor: colour,
        fillOpacity: 0.7,
      });
    placemap.setMap(map);
    let latLngC = bounds.getCenter();

    //find existing locations
    let locationNodes = [];
    for(let i=0;i<existinglocations.length;i++) {
        let checkpoint = new google.maps.LatLng(existinglocations[i].lat,existinglocations[i].lng);
        let exists = google.maps.geometry.poly.containsLocation(
            checkpoint,
            placemap
        )
        if(exists) {
            locationNodes.push(existinglocations[i]);
            existingplaces++
        }
    }
    
    newdata[i].population = population;
    newdata[i].existingplaces = existingplaces;
    newdata[i].click = 0;
    newdata[i].locationNodes = locationNodes;
    console.log('locationNodes',newdata[i].locationNodes.length)
    let infowindow2 = new google.maps.InfoWindow({
        content: '<div> <h3 style="color:red">'+newdata[i].village+' </h3><p>'  + '</p> <div> <h4> Population: </h4><p>' +  population + '</p> <div> <h4> Existing locations: </h4><p>' +  existingplaces
    });
    //console.log('POP',colour);
    google.maps.event.addListener(placemap, 'mouseover', (evt) => {
        //infowindow.setPosition(evt.latLng); // or evt.latLng
        if(!activemaker) {
            placemap.setOptions({strokeWeight: 0.5});
            showdata(i);
        }
        //infowindow2.open(map);
    });
    google.maps.event.addListener(placemap, 'mouseout', (evt) => {
        if(i != activemaker) {
            placemap.setOptions({strokeWeight: 0.1});
        }
        if(activemaker) {
            console.log('activemarker',activemaker)
            showdata(activemaker);
        }
    });
    google.maps.event.addListener(placemap, 'click', (evt) => {
        clickhandler(evt.latLng);
    });
    let clickhandler = (evt) => {
        newdata[i].click ++;
        if(newdata[i].click %2 == 1) {
            placemap.setOptions({fillOpacity: 1});
            placemap.setOptions({strokeWeight: 0.5});
            showmarkers(evt);
        } else {
            activemaker = null;
            map.setZoom(6);
            map.setCenter({ lat: 22.9734, lng: 78.6569 });
            for(let i=0;i<villagemarkerarr.length;i++) {
                villagemarkerarr[i].setMap(null);
            }
            villagemarkerarr = [];
            placemap.setOptions({fillOpacity: 0.7});
            placemap.setOptions({strokeWeight: 0.1});
        }
    }
    //contained villages
    let showdata = (index) => {
        currenthover = i;
        let name = document.getElementById('name');
        let download = document.getElementById('download');
        let populationcount = document.getElementById('population');
        let villages = document.getElementById('villages');
        let existing = document.getElementById('existing');
        name.innerText = newdata[index].village;
        populationcount.innerText = newdata[index].population;
        villages.innerText = newdata[index].villagelist.length;
        existing.innerText = newdata[index].existingplaces;
        if(activemaker == index) {
            download.addEventListener('click',() => {
                exportCSVFile({},newdata[index].villagelist,newdata[index].village)
            })
        }
    }
    let showmarkers = (evt) => {
        map.setZoom(8);
        map.setCenter(evt);
        if(!activemaker || activemaker != i) {
            console.log('NAME',newdata[i].village)
            markedvillages = newdata[i].villagelist;
            placeupdated = true;
            previousmarker = activemaker;
            activemaker = i;
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
            villagemarkerarr = [];
            for(let j=0;j<markedvillages.length;j++) {
                if(markedvillages[j] && markedvillages[j].lat) {
                    //let coordinate = potentiallocations[i];
                    //console.log('coordinate',coordinates)
                    markedvillages[j].neighbouringlocations = 0;
                    let circle1 = {
                        path:
                        "M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0",
                        fillColor: "#02c39a",
                        fillOpacity: 0.8,
                        scale: 0.00005*markedvillages[j].population,
                        strokeColor: "#f0f3bd",
                        strokeOpacity: 0.2,
                        strokeWeight: 1,
                    };
                    
                    let marker = new google.maps.Marker({
                        position: {
                            lat:markedvillages[j].lat,
                            lng:markedvillages[j].lng
                        },
                        map,
                        icon: circle1
                    });
                    let checkdistance = (mk1, mk2) => {
                        var R = 6371.0710; // Radius of the Earth in miles
                        var rlat1 = mk1.position.lat() * (Math.PI/180); // Convert degrees to radians
                        var rlat2 = mk2.lat * (Math.PI/180); // Convert degrees to radians
                        var difflat = rlat2-rlat1; // Radian difference (latitudes)
                        var difflon = (mk2.lng-mk1.position.lng()) * (Math.PI/180); // Radian difference (longitudes)
                  
                        var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
                        if(d < 15) {
                            markedvillages[j].neighbouringlocations ++;
                        }
                      }
                    for(let k=0;k<newdata[i].locationNodes.length;k++) {
                        let t = checkdistance(marker,newdata[i].locationNodes[k])
                    }
                    infowindow3.setContent('<h4>Population: </h4> <p>' + markedvillages[j].population + '</p> <h4>Name: </h4> <p>' +markedvillages[j]['origin'] + '</p> <h4>Nearby Outlets </h4><p>' + markedvillages[j].neighbouringlocations + '</p>')
                    
                    marker.addListener("click", () => {
                        infowindow3.open(map, marker);
                    });
                    marker.setMap(map);
                    villagemarkerarr.push(marker);
                }
            } 
        }
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
        console.log('EH',existingplaces)
        if(existingplaces != 0) {
            textstring = newdata[i].village;
        } else {
            textstring = '* ' + newdata[i].village
        }
        element.appendChild(document.createTextNode(textstring));
        element.addEventListener('click',() => {
            element.clickc ++;
            clickhandler(latLngC);
        })
        parent.appendChild(element)
    }
}
  // Define the LatLng coordinates for the polygon.
 
  // Construct the polygon.
  // Add a listener for the click event.
  //placemap.addListener("click", showArrays);
  for(let i=0;i<existinglocations.length-1;i++) {
    let coordinate = existinglocations[i];
    //console.log('coordinate',coordinates)
    const image =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
    let latlng = {
        lat: coordinate.lat,
        lng: coordinate.lng,
    }
    let circle = {
        path:
          "M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0",
        fillColor: "grey",
        fillOpacity: 0.5,
        scale: 0.03,
        strokeColor: "#353635",
        strokeOpacity: 0.01,
        strokeWeight: 1,
      };
    let marker = new google.maps.Marker({
        position: latlng,
        map,
        icon: circle
      });
    marker.setOpacity(0.5);
    marker.setMap(map)
  }
  infoWindow = new google.maps.InfoWindow();
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
        elementc.appendChild(ctext)
        element.appendChild(elementc);
        let textcont = document.createElement("div");
        textcont.className = 'citycontainer';
        textcont.id = (i+1)+"_citycontainert";
        element.appendChild(textcont);
        document.getElementById('holder').appendChild(element)
    }
}
function getpopulation(city,village,key) {
    let population = 0;
    let remove = [];
    newdata[key].villagelist = [];
    for(let i=0;i<potentiallocations.length-1;i++) {
        if(potentiallocations[i].origin == village) {
            population = population + potentiallocations[i].population;
            newdata[key]['villagelist'].push(potentiallocations[i]);
            remove.push(i)
        } else {
            if(potentiallocations[i].bb2 && potentiallocations[i].bb2 == village) {
                population = population + potentiallocations[i].population;
                newdata[key]['villagelist'].push(potentiallocations[i]);
                remove.push(i)
            } else {
                if(potentiallocations[i].bb == village) {
                    population = population + potentiallocations[i].population;
                    newdata[key]['villagelist'].push(potentiallocations[i]);
                    remove.push(i)
                }
            }
        }
    }
    for(let i=0;i<remove.length;i++) {
        potentiallocations.splice(remove[i],1);
    }
    return population;
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
let headers = {
    
}
function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }
    console.log('TITLE',fileTitle,items.length)
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
