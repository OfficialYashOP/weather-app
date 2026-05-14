package com.weather.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // In production, restrict this to frontend URL
public class WeatherController {

    private final String WEATHER_API_KEY = "bd5e378503939ddaee76f12ad7a97608"; // Demo key
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/weather")
    public ResponseEntity<?> getWeather(@RequestParam String city) {
        if (city == null || city.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "City is required"));
        }

        try {
            String url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + WEATHER_API_KEY;
            Object response = restTemplate.getForObject(url, Object.class);
            return ResponseEntity.ok(response);
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", "Failed to fetch weather data. Please check the city name."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch weather data."));
        }
    }

    @GetMapping("/aqi")
    public ResponseEntity<?> getAqi(@RequestParam String lat, @RequestParam String lon) {
        if (lat == null || lon == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Latitude and Longitude are required"));
        }

        try {
            String url = "http://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lon + "&appid=" + WEATHER_API_KEY;
            Object response = restTemplate.getForObject(url, Object.class);
            return ResponseEntity.ok(response);
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", "Failed to fetch AQI data."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch AQI data."));
        }
    }

    @GetMapping("/allergies")
    public ResponseEntity<?> getAllergies(@RequestParam String city) {
        if (city == null || city.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "City is required"));
        }

        // Generate simulated data based on city length to keep it consistent
        int seed = city.length();
        Map<String, Object> data = new HashMap<>();
        data.put("city", city);
        
        data.put("treePollen", Map.of(
                "level", seed % 3 == 0 ? "High" : (seed % 2 == 0 ? "Medium" : "Low"),
                "index", (seed * 15) % 100
        ));
        
        data.put("grassPollen", Map.of(
                "level", seed % 4 == 0 ? "High" : (seed % 3 == 0 ? "Medium" : "Low"),
                "index", (seed * 12) % 100
        ));
        
        data.put("weedPollen", Map.of(
                "level", seed % 5 == 0 ? "High" : (seed % 4 == 0 ? "Medium" : "Low"),
                "index", (seed * 18) % 100
        ));
        
        data.put("overallRisk", seed % 3 == 0 ? "High" : "Moderate");

        return ResponseEntity.ok(data);
    }
}
