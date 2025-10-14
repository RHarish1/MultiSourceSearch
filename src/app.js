import express from 'express';
import bcrypt from 'bcrypt';
import { sequelize, User } from './models/User.js';

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

await sequelize.sync();


// req : { "username": , "password": }
app.post("/login", async (req, res) => {
    const { typedUsername, typedPassword } = req.body;
    const user = await User.findOne({
        where: {
            username: typedUsername
        }
    });
    if (!user) {
        return res.status(401).send("Retry Please!");
    }
    const match = await bcrypt.compare(typedPassword, user.password);
    if (match) {
        res.redirect("/home");
    }
    else {
        return res.status(401).send("Retry Please!");
    }
})


app.post("/signup", async (req, res) => {
    const { typedUsername, typedPassword } = req.body;
    const user = await User.findOne({
        where: {
            username: typedUsername
        }
    });
    if (user) {
        return res.status(401).send("User already exists!");
    }
    const hashedPassword = await bcrypt.hash(typedPassword, 12);
    const newUser = await User.create({ username: typedUsername, password: hashedPassword });
    res.redirect("/home");
})

app.get('/home', (req, res) => res.send("Welcome to our app!"));
app.get('/', (req, res) => res.redirect('/signup'));

app.listen(port, () => console.log(`Server running on port ${port}`));