const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

const app = require('../path/to/your/app'); // Adjust this to the actual path

// Test suite for POST /api/visualize_waypoints
describe('POST /api/visualize_waypoints', () => {
    // Test with default filters
    it('should return all waypoints for default filters', async () => {
        const requestBody = {
            "vessel": "All Vessels of Interest",
            "source": "All Sources",
            "distress": ["All Natures of Distress"],
            "startDate": 1670966010705,
            "endDate": 1702502010705
        };
        
        const res = await chai.request(app).post('/api/visualize_waypoints').send(requestBody);
        
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
    });

    // Test for specific vessel filter
    it('should filter waypoints by a specific vessel', async () => {
        const requestBody = {
            "vessel": "303304000", // Assuming this is a valid vessel MMSI
            "source": "All Sources",
            "distress": ["All Natures of Distress"],
            "startDate": 1670966010705,
            "endDate": 1702502010705
        };
        
        const res = await chai.request(app).post('/api/visualize_waypoints').send(requestBody);
        
        expect(res).to.have.status(200);
        expect(res.body).to.satisfy((waypoints) => waypoints.every(wp => wp.txtMMSI === "303304000"));
    });

    // Test for specific source filter
    it('should filter waypoints by a specific source', async () => {
        const requestBody = {
            "vessel": "All Vessels of Interest",
            "source": "Iridium Constellation", // Assuming this is a valid source
            "distress": ["All Natures of Distress"],
            "startDate": 1670966010705,
            "endDate": 1702502010705
        };
        
        const res = await chai.request(app).post('/api/visualize_waypoints').send(requestBody);
        
        expect(res).to.have.status(200);
        expect(res.body).to.satisfy((waypoints) => waypoints.every(wp => wp.txtSourceName === "Iridium Constellation"));
    });

    // Test for specific distress filter
    it('should filter waypoints by a specific nature of distress', async () => {
        const requestBody = {
            "vessel": "All Vessels of Interest",
            "source": "All Sources",
            "distress": ["Fire, explosion"], // Assuming this is a valid distress type
            "startDate": 1670966010705,
            "endDate": 1702502010705
        };
        
        const res = await chai.request(app).post('/api/visualize_waypoints').send(requestBody);
        
        expect(res).to.have.status(200);
        expect(res.body).to.satisfy((waypoints) => waypoints.every(wp => wp.txtNatureOfDistress === "Fire, explosion"));
    });

    // Test for handling invalid date range
    it('should return an error for an invalid date range', async () => {
        const requestBody = {
            "vessel": "All Vessels of Interest",
            "source": "All Sources",
            "distress": ["All Natures of Distress"],
            "startDate": 1702502010705, // End date before start date
            "endDate": 1670966010705
        };
        
        const res = await chai.request(app).post('/api/visualize_waypoints').send(requestBody);
        
        expect(res).to.have.status(400); // Assuming your API validates date ranges and returns 400 for invalid ranges
        expect(res.body).to.have.property('error');
    });

    // Test for missing body parameters (assuming API requires all parameters)
    it('should return an error when required body parameters are missing', async () => {
        const requestBody = {}; // Missing all parameters
        
        const res = await chai.request(app).post('/api/visualize_waypoints').send(requestBody);
        
        expect(res).to.have.status(400); // Assuming your API checks for required parameters and returns 400 if missing
        expect(res.body).to.have.property('error');
    });

    // Additional test scenarios can include more specific cases as needed
});
