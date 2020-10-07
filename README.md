# farming-rest

## Refactored "berba" repository to rest api

Application is separated into two parts to reduce complexity.

## Major purpose of the application is to track:

    *Where employees are farming (sector)
    *Which variety are they farming
    *How mush did they farm in total
    
## Proccess: FIRST PART
Print barcodes with metadata (sector, employee, variety), and attach them to some boxes or whatever they are farming to.
Once "boxes" are farmed, scan barcodes (SECOND PART OF THE APPLICATION), and enter the weight. Person who scans the barcodes don't need to track which
employee farmed them, because barcodes are holding those informations.
    

# FIRST PART FEATURES

## Adding:
   *employees
   *variety 
   *supervizors 
   
Logging with supervizor account allows you to use second part of aplication

## Printing barcodes
## Retrieving all barcodes data
## Removing employees
To remove the employee, you must first transfer "boxes" (barcodes) to some other employee.
If you dont have any, you need to create one, otherwise you would end up with printed barcodes that dont belong to anyone, and
yet physically available.

## Tracking data for barcodes with weight measured
## Closing day
## Retrieving data for any date that was closed
## Analyses
Showing the total for individual sector

## SECOND PART
To be able to use second part, you must login with supervizor account created in FIRST PART.

## Features
### Display barcodes
### Allows entering the weight of "boxes"
### Showing total for each employee.


### FULL ENDPOINTS DETAILS WILL BE PROVIDED AS SOON AS POSIBLE AT:
https://farming-harvesting.herokuapp.com/docs
