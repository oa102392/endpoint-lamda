const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

const app = require('../path/to/your/app'); // Update with the correct path to your app

// Group tests for GET /api/get_vessel_name endpoint
describe('GET /api/get_vessel_name', () => {
    // Test successful retrieval of vessel name for valid numVesselID
    it('should return the vessel name for a valid numVesselID', async () => {
        const numVesselID = 1;
        const res = await chai.request(app).get(`/api/get_vessel_name?numVesselID=${numVesselID}`);

        // Check response status and body
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('txtVesselName', 'OCEAN MARINER');
    });

    // Test response for invalid numVesselID
    it('should return an error for an invalid numVesselID', async () => {
        const invalidID = 'invalid_id';
        const res = await chai.request(app).get(`/api/get_vessel_name?numVesselID=${invalidID}`);

        // Check for error status and error message
        expect(res).to.have.status(400); // Adjust the status code based on your error handling
        expect(res.body).to.have.property('error');
    });

    // Test response when numVesselID is missing from the query
    it('should return an error when numVesselID is missing', async () => {
        const res = await chai.request(app).get('/api/get_vessel_name');

        // Check for error status and error message
        expect(res).to.have.status(400); // Adjust the status code based on your error handling
        expect(res.body).to.have.property('error');
    });

    // Test response for non-existent vessel
    it('should return an error if the vessel is not found', async () => {
        const nonExistentID = 9999;
        const res = await chai.request(app).get(`/api/get_vessel_name?numVesselID=${nonExistentID}`);

        // Check for not found status and error message
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('error', 'Vessel not found');
    });

    // Additional tests can be added here for other scenarios
});
