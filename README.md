# GeoCadastre

GeoCadastre is a simple web tool to look at land parcels in the Aisne (02) area of France. You can use it to see different pieces of land on a map and find out basic information about them.

## Main Features

* Click on the map to see land details like the ID and the area size.
* View the company name and SIREN number for each parcel.
* The map automatically moves to show you the right area when it loads.
* Dark and modern design that works on different screen sizes.
* Connects a local database to the web so the map data stays fast and accurate.

## Tools Used

* Frontend: React and Leaflet for the map.
* Backend: Node.js and Express to handle data.
* Database: PostgreSQL and PostGIS to manage land shapes.
* Connection: ngrok to link the local database to the live website.

## How it Works

The project uses a special setup to handle large amounts of land data. Since the land map files are very big, they are stored in a local database on a computer. We then use a tool called ngrok to create a safe bridge between that computer and the website hosted on Vercel. This way, the website can show thousands of parcels quickly without needing expensive cloud storage.

## Setup Instructions

### What you need
* Node.js installed
* PostgreSQL with the PostGIS extension
* An ngrok account

### Steps to run it locally
1. Get the code and install dependencies by running npm install in the main folder.
2. Setup the database by running the schema file found in the database folder.
3. Create a simple .env file in the backend folder with your database login details.
4. Start the backend with npm run dev and then start ngrok on port 3001.
5. In the frontend folder, set your VITE_API_URL to the link provided by ngrok.

## Data Source

The land data comes from the French government (Etalab Cadastre). It has been cleaned and organized to make it easy to view in this app.

## Notes

The backend runs on a local computer using ngrok instead of a cloud database because land data is very large and complex. This is a common way to test professional mapping tools without high costs.

This project was built by Ali Nawaz.
