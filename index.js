
// const express = require('express')
import express from 'express'
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import cors from 'cors'

import userRoutes from './routes/userRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

const app = express()
app.use(express.json())
dotenv.config()
connectDB()

// cors
const whitelist = [process.env.FRONTEND_URL1,process.env.FRONTEND_URL2]
const corsOption = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)){
            // allow request api
            callback(null, true)
        }else{
            // do not allow
            callback(new Error('CORS Error'))
        }
    }
}
app.use(cors(corsOption))

// routers
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

const PORT = process.env.PORT || 4000

const server = app.listen(PORT, () => {
    console.log(`server run port ${PORT}`)
})

// Socket.io
import { Server } from 'socket.io'

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL2,
    },
})

io.on('connection', (socket) => {
    // console.log('Connected to socket.io')

    // Define the events of socket.io
   socket.on('send project', (id) => {
    socket.join(id)
   })

   socket.on('new task', (task) => {
    const project = task.project
    socket.to(project).emit('task added', task)
   })

   socket.on('delete task', (task) => {
    const project = task.project
    socket.to(project).emit('task deleted', task)
   })

   socket.on('update task', (taskUpdated) =>{
    const project = taskUpdated.project._id
    socket.to(project).emit('task updated', taskUpdated)
   })

   socket.on('complete task', (taskCompleted) => {
    const project = taskCompleted.project._id
    socket.to(project).emit('task completed', taskCompleted)
   })
})