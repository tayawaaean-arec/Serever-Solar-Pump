const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./google-services.json'); // Replace with the path to your Firebase service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://solar-pump-98502-default-rtdb.firebaseio.com/', // Replace with your database URL
});

const database = admin.database();
const dataRef = database.ref('pumpData');
const pumpStatusRef = database.ref('pumpStatus');

let currentDocId = null;

// Helper function to create a new docid
const createNewDocId = async () => {
  const docRef = pumpStatusRef.push();
  return docRef.key;
};

// Subscribe to changes in the "pumpData" reference
dataRef.on('value', async (snapshot) => {
  const data = snapshot.val();
  if (data) {
    const latestKey = Object.keys(data).pop();
    const latestData = latestKey ? data[latestKey] : null;

    if (latestData) {
      const voltage = isFinite(latestData.voltage) ? parseFloat(latestData.voltage.toFixed(2)) : 0;
      const current = isFinite(latestData.current) ? parseFloat(latestData.current.toFixed(2)) : 0;
      const waterFlow = isFinite(latestData.waterFlow) ? parseFloat(latestData.waterFlow.toFixed(2)) : 0;
      const power = isFinite(latestData.power) ? parseFloat(latestData.power.toFixed(2)) : 0;

      const newPumpStatus = voltage > 0 ? 'On' : 'Off';

      console.log(`Pump Status: ${newPumpStatus}`);
      console.log(`Voltage: ${voltage}, Current: ${current}, Water Flow: ${waterFlow}, Power: ${power}`);

      if (newPumpStatus === 'On') {
        if (!currentDocId) {
          currentDocId = await createNewDocId(); // Create a new `docid` when pump starts
        }

        const currentTime = new Date();
        const formattedTime = currentTime.toTimeString().split(' ')[0]; // Extracts "HH:mm:ss"
        const formattedDate = currentTime.toISOString().split('T')[0]; // Extracts "YYYY-MM-DD"

        // Publish data under the current `docid` with separate date and time
        const entryRef = pumpStatusRef.child(currentDocId).push(); // Generate a unique key for each entry
        await entryRef.set({
          time: formattedTime,
          date: formattedDate,
          voltage,
          current,
          waterFlow,
          power,
        });

        console.log(`Data recorded under docid: ${currentDocId}`);
      } else if (newPumpStatus === 'Off') {
        currentDocId = null; // Reset `docid` when the pump stops
      }
    }
  }
}, (error) => {
  console.error('Error listening to data changes:', error);
});
