async function insertValidObjects(validObjects, fileName, processedFiles, sourceFolder, processedFolder, skippedFiles, moveAndDeleteFile, pool) {
    const insertPromises = validObjects.map(async (validObject) => {
      try {
        const numDSCSymbolNo = await handleDSCSymbolRetrieval(validObject, fileName, sourceFolder, processedFiles, skippedFiles, moveAndDeleteFile, pool);
        const numVesselID = await handleVesselRetrieval(validObject, fileName, sourceFolder, processedFiles, skippedFiles, moveAndDeleteFile, pool);
  
        console.log("NUM: ",numDSCSymbolNo)
        console.log("VESSEL:" ,numVesselID)
  
        const insertQuery = `INSERT INTO tblDSCSignal
          (txtMMSI, txtReportedLat, txtReportedLon, dateReceivedAt, numVesselID, numSourceID, numDSCSymbolNo, txtSubsequentCommunication, txtAcknowledgementStatus)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
        pool.query(insertQuery, [
          validObject.txtMMSI,
          validObject.txtReportedLat,
          validObject.txtReportedLon,
          validObject.dateReceivedAt,
          numVesselID,
          1,
          numDSCSymbolNo,
          validObject.txtSubsequentCommunication,
          validObject.txtAcknowledgementStatus,
        ], (insertError, insertResults) => {
          if (insertError) {
            console.error(`Error inserting data from ${fileName}:`, insertError);
            skippedFiles.push({ fileName, reason: `Error inserting data: ${insertError.message}` });
          } else {
            console.log(`Processed JSON data from ${fileName}`);
            processedFiles.push(fileName);
            moveAndDeleteFile(fileName, sourceFolder, processedFolder);
          }
        });
      } catch (error) {
        console.error(`Error inserting object ${fileName}:`, error);
        skippedFiles.push({ fileName, reason: `Error inserting object: ${error.message}` });
      }
    });
  
    await Promise.all(insertPromises);
  }
  
  async function handleVesselRetrieval(validObject, fileName, sourceFolder, processedFiles, skippedFiles, moveAndDeleteFile, pool) {
    return new Promise((resolve, reject) => {
      const selectVesselIDQuery = 'SELECT numVesselID FROM tblVessel WHERE txtMMSI = ?';
      pool.query(selectVesselIDQuery, [validObject.txtMMSI], (vesselError, vesselResults) => {
        if (vesselError || !vesselResults || vesselResults.length === 0) {
          console.log(`Vessel not found for MMSI: ${validObject.txtMMSI}. Inserting new vessel...`);
          // Insert the new vessel here
          const insertVesselQuery = 'INSERT INTO tblVessel (txtVesselName ,txtMMSI) VALUES (?, ?)';
          pool.query(insertVesselQuery, [validObject.txtMMSI, ""], (insertError, insertResults) => {
            if (insertError) {
              console.error(`Error inserting new vessel for ${validObject.txtMMSI}:`, insertError);
              skippedFiles.push({ fileName, reason: `Error inserting new vessel: ${insertError.message}` });
              moveAndDeleteFile(fileName, sourceFolder, errorFolder);
              resolve(); // Skip this object and move on to the next
            } else {
              // Retrieve the newly inserted vessel's ID and resolve with it
              const numVesselID = insertResults.insertId;
              console.log(numVesselID)
              resolve(numVesselID);
            }
          });
          // Vessel retrieval was successful as it was found in the database. numVesselID will be assigned from the Select statement
        } else {
          const numVesselID = vesselResults[0].numVesselID;
          resolve(numVesselID);
        }
      });
    });
  }
  
  
  
  async function handleDSCSymbolRetrieval(validObject, fileName, sourceFolder, processedFiles, skippedFiles, moveAndDeleteFile, pool) {
    return new Promise((resolve, reject) => {
      const selectDSCSymbolNoQuery = 'SELECT numSymbolNo FROM tblDSCSymbolNo WHERE txtNatureOfDistress COLLATE utf8mb3_general_ci = ?';
      pool.query(selectDSCSymbolNoQuery, [validObject.txtNatureOfDistress], (dscError, dscResults) => {
        if (!dscResults || dscResults.length === 0) {
          console.log(`No matching record found for ${validObject.txtNatureOfDistress}. Inserting new distress event symbol...`);
          // Insert the new Distress signal here
          const insertSymbolQuery = 'INSERT INTO tblDSCSymbolNo (txtPhasingAndFunction, txtFormatSpecifier, txtCategory, txtNatureOfDistress, txtFirstTelecommand, txtSecondTelecommand) VALUES (?, ?, ?, ?, ?, ?)';
          pool.query(insertSymbolQuery, ["", "", "", validObject.txtNatureOfDistress, "", ""], (insertError, insertResults) => {
            if (insertError) {
              console.error(`Error inserting new distress event for ${validObject.txtNatureOfDistress}:`, insertError);
              skippedFiles.push({ fileName, reason: `Error inserting new distress event: ${insertError.message}` });
              moveAndDeleteFile(fileName, sourceFolder, errorFolder);
              resolve(); // Skip this object and move on to the next
            } else {
              // Retrieve the newly inserted distress event ID and resolve with it
              const numDSCSymbolNo = insertResults.insertId;
              console.log(numDSCSymbolNo)
              resolve(numDSCSymbolNo);
            }
          });
        // Distress event retrieval was successful as it was found in the database. numDSCSymbolNo will be assigned from the Select statement
        } else {
          const numDSCSymbolNo = dscResults[0].numSymbolNo;
          resolve(numDSCSymbolNo);
        }
      });
    });
  }
  
  
  async function getS3BucketData() {
    const skippedFiles = [];
    const processedFiles = [];
    const sourceFolder = 'received_files';
    const processedFolder = 'processed_and_archived';
    const errorFolder = 'error_in_file';
  
    try {
      const listObjectsV2Response = await s3.listObjectsV2({
        Bucket: bucketName,
        Prefix: 'received_files/',
      }).promise();
      const objects = listObjectsV2Response.Contents;
  
      const processingPromises = objects.map(async (object) => {
        const params = { Bucket: bucketName, Key: object.Key };
        const stream = s3.getObject(params).createReadStream();
        const fileName = object.Key.split('/').pop();
  
        let validObjects = [];
        let fileSkipped = false;
  
        return new Promise((resolve, reject) => {
          const transformStream = new Transform({
            readableObjectMode: true,
            transform(chunk, encoding, callback) {
              try {
                const jsonData = JSON.parse(chunk.toString());
  
                for (const feature of jsonData.features) {
                  const properties = feature.properties[0];
                  const geometry = feature.geometry[0];
  
                  const missingFields = [];
                  if (!properties.self_identification) missingFields.push('self_identification');
                  if (!properties.nature_of_distress) missingFields.push('nature_of_distress');
                  if (!properties.t_sec) missingFields.push('t_sec');
                  if (!properties.subsequent_communications) missingFields.push('subsequent_communications');
                  if (!properties.acknowledgement_status) missingFields.push('acknowledgement_status');
                  if (geometry.coordinates.length < 3) missingFields.push('coordinates');
  
                  if (missingFields.length > 0) {
                    console.error(`Skipping file ${fileName} due to missing required fields: ${missingFields.join(', ')}`);
                    skippedFiles.push({ fileName, reason: `Missing required fields: ${missingFields.join(', ')} for object in array index ${validObjects.length}` });
                    moveAndDeleteFile(fileName, sourceFolder, errorFolder);
                    fileSkipped = true;
                    break; // Skip the file if any object is invalid
                  }
  
                  // Store valid objects for later insertion
                  validObjects.push({
                    txtMMSI: properties.self_identification,
                    txtReportedLat: geometry.coordinates[0],
                    txtReportedLon: geometry.coordinates[1],
                    dateReceivedAt: properties.t_sec,
                    numSourceID: 1,
                    txtSubsequentCommunication: properties.subsequent_communications,
                    txtAcknowledgementStatus: properties.acknowledgement_status,
                    txtNatureOfDistress: properties.nature_of_distress
                  });
                }
  
                if (!fileSkipped) {
                  console.log(`Parsed ${validObjects.length} valid objects from ${fileName}`);
                }
                callback();
              } catch (error) {
                console.error(`Error parsing JSON data from ${fileName}:`, error);
                skippedFiles.push({ fileName, reason: `JSON parsing error: ${error.message} for object in array index ${validObjects.length}` });
                moveAndDeleteFile(fileName, sourceFolder, errorFolder);
                callback();// Skip this object and move on to the next
              }
            }
          });
  
          pump(stream, transformStream, (err) => {
            if (err) {
              console.error(`Error processing data from ${fileName}:`, err);
              skippedFiles.push({ fileName, reason: `Error processing data: ${err.message}` });
              moveAndDeleteFile(fileName, sourceFolder, errorFolder);
            } else if (!fileSkipped && validObjects.length > 0) {
              // Insert valid objects into the database
              insertValidObjects(validObjects, fileName, processedFiles, sourceFolder, processedFolder)
                .then(() => {
                  // Check if the file is not already in processedFiles and add it
                  if (!processedFiles.includes(fileName)) {
                    processedFiles.push(fileName);
                  }
                  resolve();// Resolve the processing promise
                })
                .catch((error) => {
                  console.error(`Error inserting data from ${fileName}:`, error);
                  skippedFiles.push({ fileName, reason: `Error inserting data: ${error.message}` });
                  resolve(); // Resolve the processing promise even in case of an error
                });
            } else {
              resolve();// Resolve the processing promise if the file is skipped or has no valid objects
            }
          });
        });
      });
  
      await Promise.all(processingPromises);
  
      return ({
        ok: true,// Indicate success
        message: 'JSON processing and database insertion complete',
        skippedFiles,
        processedFiles: Array.from(new Set(processedFiles)),
      });
  
    } catch (error) {
      console.error('Error:', error);
      return {
        ok: false, // Indicate failure
        error: 'An error occurred',
      }
    }
  }