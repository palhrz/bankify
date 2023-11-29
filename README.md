# Project Title

An online banking API project using NodeJS and Mysql


# Getting started
- Clone the repository
```
git clone https://github.com/palhrz/bankify.git
```
- Install dependencies
```
cd bankify
npm install
```
- Configure Mysql
add bankapp database scheme
```
sequelize db:migrate
```
- Add .env file
```
PORT=9000
TOKEN_KEY=RandomToken2023
```
- Build and run the project
```
node index.js
```
  Navigate to `http://localhost:9000`
