const fs = require('fs');
const path = require('path');
const https = require('https');

// Function to get elevations using Open-Elevation API (supports batch)
async function getElevationsOpenElevationBatch(itinerary) {
    try {
        // Open-Elevation API supports batch requests
        const locations = itinerary.map(point => ({
            latitude: point.latitude,
            longitude: point.longitude
        }));
        
        const postData = JSON.stringify({ locations });
        
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.open-elevation.com',
                port: 443,
                path: '/api/v1/lookup',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const response = JSON.parse(data);
                            resolve(response);
                        } catch (error) {
                            reject(new Error(`Failed to parse Open-Elevation response: ${error.message}`));
                        }
                    } else {
                        reject(new Error(`Open-Elevation HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(new Error(`Open-Elevation request failed: ${error.message}`));
            });
            
            req.write(postData);
            req.end();
        });
    } catch (error) {
        throw error;
    }
}

// Function to process batch results and format them consistently
function processBatchResults(batchResponse, itinerary) {
    const results = [];
    
    try {
        // Open-Elevation response format
        const elevations = batchResponse.results || [];
        itinerary.forEach((point, index) => {
            const elevation = elevations[index];
            results.push({
                latitude: point.latitude,
                longitude: point.longitude,
                elevation: (elevation && elevation.elevation) || null
            });
        });
    } catch (error) {
        return null;
    }
    
    return results;
}

// Main function that uses only Open-Elevation
async function getElevationsOpenElevation(itinerary) {
    try {
        const openElevationResponse = await getElevationsOpenElevationBatch(itinerary);
        const openElevationResults = processBatchResults(openElevationResponse, itinerary);
        return openElevationResults;
        
    } catch (error) {
        throw error;
    }
}

function addElevation(id, callback) {
    const indexPath = path.join(__dirname, '..', 'walks', id, 'index.json');
    const elevationPath = path.join(__dirname, '..', 'walks', id, 'elevation.json');
    
    fs.readFile(indexPath, 'utf8', (error, walkData) => {
        if (error) return callback(error,[]);
        
        try {
            const itinerary = JSON.parse(walkData).itinerary;
            getElevationsOpenElevation(itinerary)
                .then(elevationResults => {
                    fs.writeFile(elevationPath, JSON.stringify(elevationResults, null, 2), (writeError) => {
                        if (writeError) return callback(writeError,[]);
                        callback(null, elevationResults);
                    });
                })
                .catch(error => {
                    return callback(error,[]);
                });
            
        } catch (parseError) {
            return callback(parseError,[]);
        }
    });
}

function getElevation(id, requestIfNotExists, callback) {
    const filePath = path.join(__dirname, '..', 'walks', id, 'elevation.json');
    
    fs.access(filePath, fs.constants.F_OK, (accessError) => {
        if (accessError) {
            if (requestIfNotExists) {
                return addElevation(id, callback);
            } else {
                return callback(new Error(`File does not exist: ${filePath}`), []);
            }
        } else {
            fs.readFile(filePath, 'utf8', (error, walkData) => {
                if (error) return callback(error,[]);
                callback(null, JSON.parse(walkData));
            });
        }
    });
}

module.exports = {
    addElevation: addElevation,
    getElevation: getElevation,
};