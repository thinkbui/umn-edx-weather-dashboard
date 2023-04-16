var apiKey = "f8c008ebc30e5059d679aa6a57e4b627";
var search_history = document.getElementsByClassName("search_history")[0].getElementsByTagName("ul")[0];
var qParam = "Minneapolis";

// This function makes the API call to fetch the queried city.
// If one or more matching cities are found, the geographic coordinates are
// used to fetch the weather data for the most likely city based upon how
// the response sorts them.
// If no city is found, an alert box pops up and no further call is made.
function getCityForecast(queryParam) {
  var url = new URL("https://api.openweathermap.org/geo/1.0/direct")
  url.searchParams.set("q", queryParam);
  url.searchParams.set("appid", apiKey);
  
  fetch(url.href)
  .then(function(response){
    return response.json();
  })
  .then(function(data){
    addSearchHistory(queryParam);
    if(data.length > 0){
      setCityName(data[0]["name"], data[0]["state"]);
      getForcast({lat: data[0]["lat"], lon: data[0]["lon"]});
    } else {
      alert("No city by that name could be found.");
    }
  })
}

// This adds the query to the top of the search history area.
// It is generated as a clickable link that re-runs the query.
function addSearchHistory(queryParam) {
  var aElem = document.createElement("a");
  aElem.setAttribute("href", "#");
  aElem.setAttribute("onclick", `getCityForecast("${queryParam}")`);
  aElem.textContent = queryParam;

  var liElem = document.createElement("li");
  liElem.prepend(aElem);

  search_history.prepend(liElem);
}

// Sets the display name for the queried city.
// If there is a state name, that is displayed too.
function setCityName(city_name, state_name) {
  var cityNameElem = document.getElementById("city_name");
  var cName = city_name;
  if (state_name) {
    cName += `, ${state_name}`;
  }
  cityNameElem.textContent = cName;
}

// This function makes the API call to fetch the weather forecast based
// upon geographic coordinates.
// The option to set units to imperial is hardcoded for now.
function getForcast(coord) {
  var url2 = new URL("https://api.openweathermap.org/data/2.5/forecast")
  url2.searchParams.set("lat", coord["lat"]);
  url2.searchParams.set("lon", coord["lon"]);
  url2.searchParams.set("units", "imperial");
  url2.searchParams.set("appid", apiKey);
  
  fetch(url2.href)
  .then(function(response){
    return response.json();
  })
  .then(function(data){
    processForecast(data["list"]);
  })
}

// This processes the weather data condensing 3-hour blocks into full days.
// It simply takes the max values for temperature, wind speed, and humidity
// over each 24 hour period.
// Similar logic is used to crudely determine which icon is used.
function processForecast(raw_data) {
  results = {};
  for(i=0;i<raw_data.length;i++){
    var data_date = dayjs.unix(raw_data[i]["dt"]).format("YYYYMMDD");

    var raw_icon = parseIconCode(raw_data[i]["weather"][0]["icon"]);
    var raw_temp = raw_data[i]["main"]["temp"];
    var raw_wind = raw_data[i]["wind"]["speed"];
    var raw_humidity = raw_data[i]["main"]["humidity"];

    if (results[data_date]) {
      results[data_date]["icon"] = Math.max(results[data_date]["icon"], raw_icon);
      results[data_date]["temp"] = Math.max(results[data_date]["temp"], raw_temp);
      results[data_date]["wind"] = Math.max(results[data_date]["wind"], raw_wind);
      results[data_date]["humidity"] = Math.max(results[data_date]["humidity"], raw_humidity);
    } else {
      var raw_date = dayjs.unix(raw_data[i]["dt"]).format("MM/DD/YYYY");
      results[data_date] = {"date":raw_date, "icon":raw_icon, "temp":raw_temp, "wind":raw_wind, "humidity": raw_humidity};
    }
  }
  displayForecast(results);
}

// Helper to parse an icon code as an integer for comparison purposes
function parseIconCode(code) {
  return parseInt(code);
}

// Main function to populate the page with the processed weather data
// Sorting of keys is a safeguard to ensure they are sequential
function displayForecast(forecast_data) {
  var data_dates = Object.keys(forecast_data).sort();
  var data_date_today = data_dates.shift();
  displayToday(data_date_today, forecast_data)
  displayDays(data_dates, forecast_data)
}

// Populates today's weather data in the large container
function displayToday(date, forecast_data) {
  var bfElem = document.getElementById("bf");
  displayData(bfElem, forecast_data[date], true);
}

// Populates the future weather data in the smaller containers
function displayDays(dates, forecast_data) {
  for(i=0;i<dates.length;i++){
    var sfElem = document.getElementById(`sf${i+1}`);
    displayData(sfElem, forecast_data[dates[i]], false);
  }
  setDay5Visibility(dates.length)
}

// Helper function to populate each day's weather data
function displayData(elem, data, bigIcon) {
  var dateElem = elem.getElementsByClassName("date_val")[0];
  dateElem.textContent = data["date"];

  var iconElem = elem.getElementsByTagName("img")[0];
  iconElem.src = iconSrc(data["icon"], bigIcon);

  var tempElem = elem.getElementsByClassName("temp_val")[0];
  tempElem.textContent = Math.round(data["temp"]);

  var windElem = elem.getElementsByClassName("wind_val")[0];
  windElem.textContent = Math.round(data["wind"]);

  var humidityElem = elem.getElementsByClassName("humidity_val")[0];
  humidityElem.textContent = Math.round(data["humidity"]);
}

// Builds the icon URL based upon code and size
function iconSrc(code, bigIcon) {
  var iconSize = bigIcon ? "@2x" : "";
  return `https://openweathermap.org/img/wn/${iconCodePad(code)}d${iconSize}.png`
}

// Ensures the icon URL builder uses 2-digit code
function iconCodePad(code) {
  return code.toString().padStart(2,'0');
}

// Sets the visibility of the 5th day of the forecast depending on whether
// data for it is present
function setDay5Visibility(forecast_length) {
  var sf5Elem = document.getElementById("sf5");
  var visibility = forecast_length == 5 ? "visible" : "hidden";
  sf5Elem.setAttribute("style", `visibility:${visibility}`);
}

document.getElementById("search_btn").addEventListener("click", function(event){
  event.preventDefault();
  var search_text = document.getElementById("search_input").value;
  clearForm();
  getCityForecast(search_text);
})

// Resets the search form when a query is performed
function clearForm() {
  document.getElementById("search_input").value = "";
}

getCityForecast(qParam);
