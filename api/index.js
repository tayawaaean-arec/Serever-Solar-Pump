const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../config/google-services.json'); // Ensure this file is in the same directory as this script
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://solar-pump-98502-default-rtdb.firebaseio.com/', // Replace with your database URL
});

const database = admin.database();
const dataRef = database.ref('pumpData');
const pumpStatusRef = database.ref('pumpStatus');

let currentDocId = null;

const createNewDocId = async () => {
  const docRef = pumpStatusRef.push();
  return docRef.key;
};

// Listen to Firebase changes
dataRef.on(
  'value',
  async (snapshot) => {
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
            currentDocId = await createNewDocId();
          }

          const currentTime = new Date();
          const formattedTime = currentTime.toTimeString().split(' ')[0];
          const formattedDate = currentTime.toISOString().split('T')[0];

          const entryRef = pumpStatusRef.child(currentDocId).push();
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
          currentDocId = null;
        }
      }
    }
  },
  (error) => {
    console.error('Error listening to data changes:', error);
  }
);

// Export the handler for Vercel
module.exports = (req, res) => {
  res.status(200).send('Firebase Node.js server is running');
};