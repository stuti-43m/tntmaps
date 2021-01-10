// This example creates a simple polygon representing the Bermuda Triangle.
// When the user clicks on the polygon an info window opens, showing
// information about the polygon's coordinates.
import newdata from './usable_data/newdatav.js'
import locationnode from './usable_data/newdata.js'
import poptownfinal from './usable_data/poptownfinal.js'
import popvillagefinal from './usable_data/popvillagefinal.js'
let map;
let tab = 1;
let level = 1;
let infoWindow;
let formeddata = []
let populationLimitR = 0;
let populationLimitT = 0;
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
    text: '< 10K'
},
{
    id:2,
    color:'#f0f0f0',
    text: '10K - 50K'
},
{
    id:3,
    color:'#d9d9d9',
    text: '50k - 70k'
},{
    id:4,
    color:'#bdbdbd',
    text: '70K - 90K'
},{
    id:5,
    color:'#969696',
    text: '90K - 1.5L'
},{
    id:6,
    color:'#737373',
    text: '1.5L - 2.5L'
},{
    id:7,
    color:'#525252',
    text: '2.5L - 5L'
}, {
    id:8,
    color:'#252525',
    text: '5L - 8L'
},{
    id:9,
    color:'#000000',
    text: '> 8L'
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
    function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
    }
    var infowindow3 = new google.maps.InfoWindow(); 
    var rangeslider = document.getElementById("sliderRange");
    var rangeval = document.getElementById("rangeval");
    rangeslider.oninput = function() {
        console.log('val', rangeslider.value)
    }
    if(tab == 1) {
        rangeslider.setAttribute("value", populationLimitR);
        rangeval.innerHTML = populationLimitR;
    } else {
        rangeslider.setAttribute("value", populationLimitT);
        rangeval.innerHTML = populationLimitT;
    }
    var ruraldiv = document.getElementById("rural");
    ruraldiv.style.color = '#cf0c71';
    var urbandiv = document.getElementById("urban");
    urbandiv.style.color = '#858585';
    //event handlers
    rangeslider.oninput = function() {
        console.log('val', rangeslider.value);
        if(tab == 1) {
            populationLimitR = rangeslider.value
            rangeval.innerHTML = populationLimitR;
        } else {
            populationLimitT = rangeslider.value;
            rangeval.innerHTML = populationLimitT;
        }
        for(let i=0;i<165;i++) {
            recalculate(i);
            recountOutlets(i);
        }
        updateMap();
        if(level == 2) {
            redrawmarker(activemaker);
        }
    }
    ruraldiv.onclick = function() {
        tab = 1;
        ruraldiv.style.color = '#cf0c71';
        urbandiv.style.color = '#858585';
        tabhandler();
    }
    urbandiv.onclick = function() {
        tab = 2;
        urbandiv.style.color = '#cf0c71';
        ruraldiv.style.color = '#858585';
        tabhandler();
    }
    let tabhandler = () => {
        //redocolour
        if(tab == 1) {
            rangeslider.setAttribute("value", populationLimitR);
        } else {
            rangeslider.setAttribute("value", populationLimitT);
        }
        updateMap();
        //change marker sizes
        //show diff markers on click
    }
    let updateMap = () => {
        for(let i=0;i<165;i++) {
            if(newdata[i].placemap) {
                let population = 0
                if(tab == 1) {
                    population = newdata[i].ruralpopulation
                } else {
                    population = newdata[i].townpopulation
                }
                let popdata = getpopulationcolour(population);
                let colour = popdata.color;
                newdata[i].placemap.setOptions({fillColor:colour});
            }
            if(newdata[i].countCircle) {
                let circleSize = getOutletcircleSize(i);
                newdata[i].countCircle.setOptions({radius:circleSize});
            }
        }
    }
    let clickhandler = (evt,elm,index,placemap) => {
        newdata[index].click ++;
        if(newdata[index].click %2 == 1) {
            placemap.setOptions({strokeWeight: 4.5});
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
                lastpoly.setOptions({fillOpacity: 0.9});
                lastpoly.setOptions({strokeWeight: 0.5});
                lastpoly.setOptions({strokeColor:"#ffffff"});
            }
            if(lastclickedIndex) {
                newdata[lastclickedIndex].click = 0;
            }
            level = 2;
            showmarkers(evt,index,placemap);
        } else {
            level = 1;
            if(lastclicked) {
                lastclicked.style.fontWeight = 100;
                lastclicked.style.color = '#ffffff'
            }
            activemaker = null;
            map.setZoom(6.5);
            map.setCenter({ lat: 23.9734, lng: 78.6569 });
            for(let i=0;i<villagemarkerarr.length;i++) {
                villagemarkerarr[i].setMap(null);
            }
            for(let i=0;i<outletmarkerarr.length;i++) {
                outletmarkerarr[i].setMap(null);
            }
            outletmarkerarr = [];
            placemap.setOptions({fillOpacity: 0.9});
            placemap.setOptions({strokeWeight: 0.5});
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
            markedvillages = newdata[index].rurallist;
            placeupdated = true;
            previousmarker = activemaker;
            activemaker = index;
        } else {
            console.log('NO UPDATE',placeupdated,previousmarker,activemaker)
            placeupdated = false;
        }
        if(placeupdated) {
            redrawmarker(index);
        }
    }
    let redrawmarker = (index) => {
        for(let i=0;i<villagemarkerarr.length;i++) {
            villagemarkerarr[i].setMap(null);
        }
        for(let i=0;i<outletmarkerarr.length;i++) {
            outletmarkerarr[i].setMap(null);
        }
        villagemarkerarr = [];
        outletmarkerarr = []

        // add existing markers for outlets
        for(let i=0;i<locationnode[index].locationNodes.length;i++) {
            let coordinate = locationnode[index].locationNodes[i];
            //console.log('coordinate',coordinates)

            let outletCircle = new google.maps.Circle({
                strokeColor: " #00ff00",
                strokeOpacity: 1,
                strokeWeight: 0.2,
                fillColor: "#00ff00",
                fillOpacity: 0.2,
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
        let markingArr = [];
        if(tab == 1) {
            markingArr = newdata[index].rurallist;
        } else {
            markingArr = newdata[index].townlist;
        }
        for(let j=0;j<markingArr.length;j++) {
            if(markingArr[j] && markingArr[j].lat) {
                //let coordinate = potentiallocations[i];
                markingArr.neighbouringlocations = 0;
                let radius = 0.5*markingArr[j].population;
                if(radius > 5000) {
                    radius = 5000
                }
                let villageCircle = new google.maps.Circle({
                    strokeColor: "#0b5ee3",
                    strokeOpacity: 1,
                    strokeWeight: 0.5,
                    fillColor: "#0b5ee3",
                    fillOpacity: 0.4,
                    map,
                    center: {lat:markingArr[j].lat,
                    lng:markingArr[j].lng},
                    radius: radius,
                    clickable:true
                });
                villageCircle.addListener("click", () => {
                    infowindow3.setContent('<h4>Population: </h4> <p>' + markingArr[j].population + '</p> <h4>Name: </h4> <p>' +markingArr[j]['origin'] + '</p> <h4>Outlets within 15km </h4><p>' + markingArr[j].neighbouringlocations.length + '</p>')
                    console.log('VILLAGE CLICK')
                    infowindow3.setPosition(villageCircle.center);
                    infowindow3.open(map);
                });
                //villageCircle.setMap(map);
                villagemarkerarr.push(villageCircle);
                console.log('villagemarkerarr',villagemarkerarr.length,markingArr[j].lat,markingArr[j].lng)
            }
        } 
    }
    let checkdistance = (mk1, mk2) => {
        var R = 6371.0710; // Radius of the Earth in miles
        var rlat1 = mk1.lat * (Math.PI/180); // Convert degrees to radians
        var rlat2 = mk2.lat * (Math.PI/180); // Convert degrees to radians
        var difflat = rlat2-rlat1; // Radian difference (latitudes)
        var difflon = (mk2.lng-mk1.lng) * (Math.PI/180); // Radian difference (longitudes)
        var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
        return d;
    }
    let checkexistingoutlets = (distI,placeI,type) => {
        let count = 0;
        let locationArr = []
        for(let k=0;k<locationnode[distI].locationNodes.length;k++) {
            if(type == 1) {
                let t = checkdistance({lat:newdata[distI].rurallist[placeI].lat,
                    lng:newdata[distI].rurallist[placeI].lng},locationnode[distI].locationNodes[k]);
                    if(t < 15) {
                        count ++
                        locationArr.push(k);
                    }
            }
            if(type == 2) {
                let t = checkdistance({lat:newdata[distI].townlist[placeI].lat,
                    lng:newdata[distI].townlist[placeI].lng},locationnode[distI].locationNodes[k]);
                if(t < 15) {
                    count ++;
                    locationArr.push(k);
                }
            }
        }
        return {
            count: count,
            arr:locationArr
        }
    }
    let recalculate = (i) => {
        newdata[i].rurallist = [];
        newdata[i].townlist = [];
        newdata[i].ruralpopulation = 0;
        newdata[i].townpopulation = 0;
        if(newdata[i].ruralAll) {
            if(newdata[i].village == 'Bhopal') {
                console.log('recalculate',newdata[i].village,newdata[i].ruralpopulation)
            }
            for(let j=0;j<newdata[i].ruralAll.length;j++) {
                //console.log('POP',newdata[i].ruralAll[j].population,populationLimitR)
                if(parseInt(newdata[i].ruralAll[j].population) > parseInt(populationLimitR)) {
                    newdata[i].ruralpopulation = newdata[i].ruralpopulation + parseInt(newdata[i].ruralAll[j].population);
                    newdata[i].rurallist.push(newdata[i].ruralAll[j]);
                }
            }
            //console.log('RURAL',newdata[i].village,newdata[i].ruralAll.length)
        }
        if(newdata[i].urbanAll) {
            for(let j=0;j<newdata[i].urbanAll.length;j++) {
                if(parseInt(newdata[i].urbanAll[j].population) > parseInt(populationLimitT)) {
                    newdata[i].townpopulation = newdata[i].townpopulation + parseInt(newdata[i].urbanAll[j].population);
                    newdata[i].townlist.push(newdata[i].urbanAll[j]);
                }
            }
            //console.log('URBAN',newdata[i].urbanAll.length)
        }
        
    }
    let recountOutlets = (i) => {
        newdata[i].ruralOutlets = [];
        newdata[i].urbanOutlets = [];
        for(let j=0;j<newdata[i].rurallist.length;j++) {
            newdata[i].rurallist[j].neighbouringlocations = []
            let outlets = checkexistingoutlets(i,j,1);
            newdata[i].rurallist[j].neighbouringlocations = outlets.arr;
            if(newdata[i].rurallist[j].neighbouringlocations) {
                newdata[i].ruralOutlets = newdata[i].ruralOutlets.concat(outlets.arr)
            }
        }
        for(let j=0;j<newdata[i].townlist.length;j++) {
            if(newdata[i].townlist[j]) {
                newdata[i].townlist[j].neighbouringlocations = []
                let outlets = checkexistingoutlets(i,j,2);
                newdata[i].townlist[j].neighbouringlocations = outlets.arr;
                if(newdata[i].townlist[j].neighbouringlocations) {
                    newdata[i].urbanOutlets = newdata[i].ruralOutlets.concat(outlets.arr)
                }
            }
        }
        newdata[i].ruralOutlets = newdata[i].ruralOutlets.filter(onlyUnique);
        newdata[i].urbanOutlets = newdata[i].urbanOutlets.filter(onlyUnique);
    }
    let showdata = (index) => {
        let name = document.getElementById('name');
        let download = document.getElementById('download')
        let populationcount = document.getElementById('population');
        let villagesh = document.getElementById('placeheading');
        let populationh = document.getElementById('popheading');
        let villages = document.getElementById('villages');
        let existing = document.getElementById('existing');
        name.innerText = newdata[index].village;
        populationcount.innerText = newdata[index].population;
        //villages.innerText = newdata[index].villagelist.length;
        if(tab == 1) {
            villagesh.populationh = 'Rural Population';
            villagesh.innerText = 'Total Villages';
            populationcount.innerText = newdata[index].ruralpopulation;
            villages.innerText = newdata[index].rurallist.length;
        } else {
            villagesh.populationh = 'Urban Population';
            villagesh.innerText = 'Total Towns';
            populationcount.innerText = newdata[index].townpopulation;
            villages.innerText = newdata[index].townlist.length;
        }
        existing.innerText = newdata[index].existingplaces;
        download.onclick = () => {
            console.log('activemaker',activemaker)
            if(activemaker == index) {
                let data; 
                let filename = newdata[index].village;
                if(tab == 1) {
                    data = newdata[index].rurallist;
                    filename = filename+'_rural';
                } else {
                    data = newdata[index].townlist;
                    filename = filename+'_town';
                }
                exportCSVFile(headers,data,filename)
            }
        }
    }
    let getOutletcircleSize = (index) => {
        let count = 0
        let size = 0;
        if(tab == 1 && newdata[index].ruralpopulation) {
            count = (newdata[index].ruralOutlets.length/newdata[index].ruralpopulation)*1000*3000;
        }
        if(tab == 2 && newdata[index].townpopulation) {
            count = (newdata[index].urbanOutlets.length/newdata[index].townpopulation)*1000*3000;
        }
        if(count != 0) {
            count = 1000 + count
        }
        if(count > 0 && count < 10) {
            size = count;
        }
        if(count > 10 && count < 30) {
            size = count;
        }
        if(count > 30 && count < 50) {
            size = count;
        }
        if(count > 50 && count < 60) {
            size = count;
        }
        if(count > 60) {
            size = count;
        }
        if(size > 15000) {
            size = 15000 + (newdata[index].ruralOutlets.length/newdata[index].ruralpopulation)*10000;
        }
        return size;
    }
    let existingzoom1 = (latlng,index) => {
        let size = getOutletcircleSize(index);
        let opacity = 0;
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
        let element = document.getElementById("selector");
        for(let i=0;i<colormapping.length;i++) {
            let elementc = document.createElement("div");
            elementc.className = 'headerc';
            let colours = document.createElement("div");
            colours.style.backgroundColor = colormapping[i].color;
            colours.className = 'colours';
            let ctext = document.createElement("p");
            ctext.className = 'count';
            ctext.innerText = colormapping[i].text;
            elementc.appendChild(colours);
            elementc.appendChild(ctext);
            element.appendChild(elementc);
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
    function findvillages(index) {
        newdata[index].ruralpopulation = 0;
        newdata[index].rurallist = [];
        let villagearr = [];
        let removearr = []
        for(let i=0;i<popvillagefinal.length;i++) {
            if(newdata[index].village.toLowerCase() == popvillagefinal[i].origin.toLowerCase()) {
                villagearr.push(popvillagefinal[i]);
                removearr.push(i);
                newdata[index].ruralpopulation = newdata[index].ruralpopulation + parseInt(popvillagefinal[i].population);
            } else {
                if(newdata[index].village.toLowerCase() == popvillagefinal[i].bb2.toLowerCase()) {
                    villagearr.push(popvillagefinal[i]);
                    removearr.push(i);
                    newdata[index].ruralpopulation = newdata[index].ruralpopulation + parseInt(popvillagefinal[i].population);
                } else {
                    if(newdata[index].village.toLowerCase() == popvillagefinal[i].bb.toLowerCase()) {
                        villagearr.push(popvillagefinal[i]);
                        removearr.push(i);
                        newdata[index].ruralpopulation = newdata[index].ruralpopulation + parseInt(popvillagefinal[i].population);
                    }
                }
            }
        }
        newdata[index].rurallist = villagearr;
        for(let i=0;i<removearr.length;i++) {
            popvillagefinal.splice(removearr[i],1);
        }
    }
    function findtowns(index) {
        newdata[index].townpopulation = 0;
        newdata[index].townlist = [];
        let villagearr = [];
        let removearr = []
        for(let i=0;i<poptownfinal.length;i++) {
            let town = poptownfinal[i].town.replace(/ *\([^)]*\) */g, "").toLowerCase();
           // console.log('check town',town,newdata[index].village.toLowerCase());
            if(newdata[index].village.toLowerCase() == town) {
                villagearr.push(poptownfinal[i]);
                removearr.push(i);
                newdata[index].townpopulation = newdata[index].townpopulation + parseInt(poptownfinal[i].population);
            } else {
                if(newdata[index].village.toLowerCase() == poptownfinal[i].subdistrict.toLowerCase()) {
                    villagearr.push(poptownfinal[i]);
                    removearr.push(i);
                    newdata[index].townpopulation = newdata[index].townpopulation + parseInt(poptownfinal[i].population);
                } else {
                    if(newdata[index].village.toLowerCase() == poptownfinal[i].district.toLowerCase()) {
                        villagearr.push(poptownfinal[i]);
                        removearr.push(i);
                        newdata[index].townpopulation = newdata[index].townpopulation + parseInt(poptownfinal[i].population);
                    }
                }
            }
        }
        newdata[index].townlist = villagearr;
        for(let i=0;i<removearr.length;i++) {
            poptownfinal.splice(removearr[i],1);
        }
    }

    map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6.5,
    center: { lat: 23.9734, lng: 78.6569 },
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
        newdata[i].ruralAll = newdata[i].rurallist;
        newdata[i].urbanAll = newdata[i].townlist;
        newdata[i].ruralOutlets = [];
        newdata[i].urbanOutlets = [];
        newdata[i].population = 0;
        recalculate(i);
        recountOutlets(i);
       
        let population =0
        if(tab == 1) {
            population = newdata[i].ruralpopulation
        } else {
            population = newdata[i].townpopulation
        }
        let popdata = getpopulationcolour(population);
        let colour = popdata.color;
        const placemap = new google.maps.Polygon({
            paths: newval,
            strokeColor: "#d9096f",
            strokeOpacity: 0.5,
            strokeWeight: 0.5,
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
                placemap.setOptions({strokeWeight: 2.5});
                showdata(i);
            }
            //infowindow2.open(map);
        });
        google.maps.event.addListener(placemap, 'mouseout', (evt) => {
            if(i != activemaker) {
                placemap.setOptions({strokeColor:"#d9096f"});
                placemap.setOptions({strokeWeight: 0.5});
            }
        });
        google.maps.event.addListener(placemap, 'click', (evt) => {
            let elem = document.getElementById(i+"_city");
            clickhandler(evt.latLng,elem,i,placemap);
        });
        newdata[i].placemap = placemap;
        //contained villages
        if(newdata[i].existingplaces) {
            existingzoom1(latLngC,i)
        }
        //text data
    }
  // Define the LatLng coordinates for the polygon.
 
  // Construct the polygon.
  // Add a listener for the click event.
  //placemap.addListener("click", showArrays);

}
