# Project 1: Shared shopping list

## Main page
This application allows the user to manage their shopping lists. The main page consists of a link to the existent shopping lists, and a statistics section providing information about the number of shopping lists and shopping list items. Note: both the deactivated lists and the collected items are included here.

## Shopping list page
By clicking on the Lists, the user is navigated to /lists where the already existent shopping lists are shown and a form where a new shopping list can be added. By clicking on one of the shopping lists the user is navigated to /lists/<id_of_shopping_list>, where all the shopping list items of the shopping list are presented in an alphabetical order. 

## Shopping list items page
The individual shopping list items can be marked "collected", which means they will be crossed and moved to the end of the list, keeping the alphabetical order. On this page, by clicking on the "Shopping lists" button in the top-left corner, the user is navigated back to the page where the shopping lists are shown.

## Local testing
Extract the project_1_zsombor_takacs.zip and run "docker-compose up" from the root of the shopping-lists directory. The logs should show: "Listening on http://localhost:7777/". Open the URL using your favorite browser.

## Online deployment
The application was not deployed to fly.io, due to the known credit card issues.
