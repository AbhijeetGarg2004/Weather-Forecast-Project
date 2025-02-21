import express from "express";
import axios from "axios";

const port = 3000;
const app = express();
const link = "http://api.openweathermap.org";
const key = "35ac71e35e8cd46ebc1c004d6454bef1";

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", async (req, res) => {
    try {
        const zipCode = req.query.zipCode;
        const countryCode = req.query.countryCode;

        if (!zipCode || !countryCode) {
            return res.render("index", { error: null, weather: null, temp: null, humid: null, condi: null });
        }
        
        const response = await axios.get(link + `/geo/1.0/zip?zip=${zipCode},${countryCode}&appid=${key}`);

        if (!response.data || !response.data.lat || !response.data.lon) {
            throw new Error("Invalid location. Please enter a valid ZIP code and country code.");
        }
        
        const lat = response.data.lat;
        const lon = response.data.lon;
        const loc = response.data.name;

        const response2 = await axios.get(link + `/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`);

        res.render("index.ejs", {
            weather: response2.data,
            temp: response2.data.main.temp,
            humid: response2.data.main.humidity,
            condi: response2.data.weather[0].description,
            error: null,
            location: loc
        });
    } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
        res.render("index.ejs", { error: "Failed to fetch weather data. Check ZIP code, country code, and API key." });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});