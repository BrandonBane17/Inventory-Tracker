const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '50mb' })); // Increase the limit if your image data is large

app.post('/save-image', (req, res) => {
  const imageData = req.body.imageBase64;
  const imagePath = path.join(__dirname, 'images', 'image.png');

  const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

  fs.writeFile(imagePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error saving the image:', err);
      res.status(500).send('Error saving the image');
    } else {
      res.send('Image saved successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});