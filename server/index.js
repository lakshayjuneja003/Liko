import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { storage } from './Storage.js';
const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ storage: storage })

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.post('/upload', upload.single('file'), function (req, res) {
    console.log("file", req.file);
    return res.status(200).json({
      message: 'File uploaded successfully',
    });
})
app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});