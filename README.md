# Retail Data viz

This project was made for an ice-cream manufacturing company in Madhya Pradesh(India). It was done to give them a sense of regions where they could increase their presence, based on the popluation density of the region(reperented by shades of grey) and their coverage(existing outlets) in those areas(represented by green dots). 

  Check it out at https://stuti-43m.github.io/tntmaps/.
### Overview
<img src="https://user-images.githubusercontent.com/75906242/104985753-aa9e1d00-59df-11eb-9fb0-8dce20cad18b.png" width="50%" style="display:inline-block;">
<img src="https://user-images.githubusercontent.com/75906242/104986001-28622880-59e0-11eb-92c0-74cf8a989fdb.png" width="50%" style="display:inline-block;">
- The map has 2 levels. One which gives and overview of the entire state and the second where one can diver deeper into an area.



### Sourcing the data 
To begin with, I only had the geolocations for the existing outlets.

- I downloaded the kml files to draw out the region boundaries on canvas.
- I downloaded the population density data at a village and town level for the state from the census website of India.
- I ran a nodejs script to read through the data to fetch the latitude and longitude data for these from the google maps api. 
- This script also allocates the the town/village into the regions present in the kml files and claculated the population of the region
- A second script is used to identifiy which regions the exisiting outlets are in. 

The final data file after running the script is an array of all the regions in the kml file. 
Below is the structure of an object in the file - 

<pre>
|-regionName
|-coordinates
|    [{
|       |-lat
|       |-lng  
|    }] 
|-totalUrbanPopulation
|-totalRuralPopulation
|-urbanList
|    [{
|       |-district
|       |-subdistrict  
|       |-town  
|       |-subdistrict  
|       |-population  
|       |-lat  
|       |-lng 
|    }]
|-ruralList
|    [{
|       |-district
|       |-subdistrict  
|       |-town  
|       |-subdistrict  
|       |-population  
|       |-lat  
|       |-lng 
|    }]
|-existingOutletsList
|    [{
|       |-lat
|       |-lng  
|    }]
|-existingOutletCount
</pre>

### Tools and Technology 
I used Javascript, Google Polyfill and Google maps API to draw out the data on the canvas and make it interactive
