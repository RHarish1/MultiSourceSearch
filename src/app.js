import express from 'express';
import bcrypt from 'bcrypt';
import { sequelize } from './models/User.js';
import authRoutes from './routes/auth.js';


const app = express();
app.use(express.json());


await sequelize.sync();

app.use("/auth", authRoutes);

app.get('/home', (req, res) => res.send("Welcome to our app!"));
app.get('/', (req, res) => res.redirect('/signup'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));