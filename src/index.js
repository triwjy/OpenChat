const express = require('express')
const path = require('path');

const PORT = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public');

const app = express();
app.use(express.static(publicDirPath));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
})