# Retail Data viz

This project was made for an ice-cream manufacturing company in Madhya Pradesh(India). It was done to give them a sense of regions where they could increase their presence, based on the popluation density of the region and the data of existing outlets. 

### Overview

### Sourcing the data 
To begin with, I only had the geolocations for the existing outlets.

- I downloaded the kml files to draw out the region boundaries on canvas from here (store it in )
- I downloaded the population density data at a village and town level for the state from the census website of India and converted it to json (store it in )
- I fetched the latitude and longitude data for these from the google maps api. (run is using).  This data gets stored in ../. 
- This script also places the the town/village in the regions present in the kml files. 
- The second script(.js) identifies which regions the exisiting outlets are in and now that we have the towns/villages categorised in their respective regions. The scripts also calculates the total population o each region.

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


