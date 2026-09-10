const express = require("express"); 
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = 3000;

const dataFile = path.join( 
__dirname,
"data",
"students.json"
);

let students = [];

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// 1. Custom logger middleware
app.use((req, res, next) => {
const time = new Date().toLocaleTimeString();

console.log(`${req.method} ${req.url} ${time}`);

next();
});


// 2. Enable JSON body
app.use(express.json());


// Home route
app.get("/", (req, res) => {
res.send(`
<h1>Student API in Express</h1>

<p>Welcome to the Express Student API.</p>

<h3>Available Routes:</h3>

<ul>
<li><a href="/api/students">GET /api/students</a></li>
<li><a href="/api/students/1">GET /api/students/1</a></li>
<li><a href="/api/students/random">GET /api/students/random</a></li>
<li><a href="/api/count">GET /api/count</a></li>
<li><a href="/api/students?major=IT">GET /api/students?major=IT</a></li>
<li><a href="/students">GET /students</a></li>
</ul>

<p>POST /api/students — test using Postman</p>
`);
});


// Random student
// Put this BEFORE /api/students/:id
app.get("/api/students/random", (req, res) => {
const randomIndex = Math.floor(
Math.random() * students.length
);

const randomStudent = students[randomIndex];

res.json(randomStudent);
});


// Count students
app.get("/api/count", (req, res) => {
res.json({
count: students.length
});
});


// Get all students
// Also supports ?major=IT
app.get("/api/students", (req, res) => {
const { major } = req.query;

if (major) {
const filteredStudents = students.filter(
student =>
student.major.toLowerCase() === major.toLowerCase()
);

return res.json(filteredStudents);
}

res.json(students);
});


// Get one student by ID
app.get("/api/students/:id", (req, res) => {
const { id } = req.params;

const student = students.find(
student => student.id === Number(id)
);

if (!student) {
return res.status(404).json({
error: "Student not found"
});
}

res.json(student);
});


// 2. POST - add a student
app.post("/api/students", (req, res) => {
const { name, major } = req.body;

if (!name || !major) {
return res.status(400).json({
error: "Name and major are required"
});
}

const newStudent = {
id: students.length + 1,
name: name,
major: major
};

students.push(newStudent);

res.status(201).json(newStudent);
});


// 4. Render students using EJS
app.get("/students", (req, res) => {
res.render("students", {
title: "All Students",
students: students
});
});


// 3. 404 handler
// MUST be after all routes
app.use((req, res) => {
res.status(404).json({
error: "Route not found"
});
});


// Read students.json and start server
const startServer = async () => {
try {
const text = await fs.readFile(
dataFile,
"utf-8"
);

students = JSON.parse(text);

app.listen(PORT, () => {
console.log(
`Running on http://localhost:${PORT}`
);
});

} catch (err) {
console.error(
"File error:",
err.message
);
}
};

startServer();