
import Project from "../models/Project.js"
import Task from '../models/Task.js'

const addTask = async (req, res) => {
    const { project } = req.body
    const projectFound = await Project.findById(project)

    if (!projectFound) {
        const error = new Error('Project does not exist')
        return res.status(404).json({ msg: error.message })
    }

    if (projectFound.creator.toString() !== req.user._id.toString()) {
        const error = new Error('You do not authorize for this action')
        return res.status(403).json({ msg: error.message })
    }

    try {
        const taskCreated = await Task.create(req.body)
        // Save the id task to project
        projectFound.tasks.push(taskCreated._id)
        await projectFound.save()
        
        res.json(taskCreated)
    } catch (error) {
        console.log(error)
    }
}
const getTask = async (req, res) => {
    const { id } = req.params
    const taskFound = await Task.findById(id).populate('project')

    if (!taskFound?.name) {
        const error = new Error('Task does not exist')
        return res.status(404).json({ msg: error.message })
    }

    if (taskFound.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('You do not authorize for this action')
        return res.status(403).json({ msg: error.message })
    }

    res.json(taskFound)
}
const updateTask = async (req, res) => {
    const { id } = req.params
    const taskFound = await Task.findById(id).populate('project')

    if (!taskFound?.name) {
        const error = new Error('Task does not exist')
        return res.status(404).json({ msg: error.message })
    }

    if (taskFound.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('You do not authorize for this action')
        return res.status(403).json({ msg: error.message })
    }

    taskFound.name = req.body.name || taskFound.name
    taskFound.description = req.body.description || taskFound.description
    taskFound.priority = req.body.priority || taskFound.priority
    taskFound.deadline = req.body.deadline || taskFound.deadline

    try {
        const taskSaved = await taskFound.save()
        res.json(taskSaved)
    } catch (error) {
        console.log(error)
    }
}
const deleteTask = async (req, res) => {
    const { id } = req.params
    const taskFound = await Task.findById(id).populate('project')

    if (!taskFound?.name) {
        const error = new Error('Task does not exist')
        return res.status(404).json({ msg: error.message })
    }

    if (taskFound.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('You do not authorize for this action')
        return res.status(403).json({ msg: error.message })
    }

    try {
        const project = await Project.findById(taskFound.project)
        project.tasks.pull(taskFound._id)

        Promise.allSettled([await project.save(), await taskFound.deleteOne()])
        
        res.json({ msg: 'Task deleted' })
    } catch (error) {
        console.log(error)
    }

}
const changeState = async (req, res) => {
    const { id } = req.params
    const taskFound = await Task.findById(id).populate('project')

    if (!taskFound) {
        const error = new Error('Task does not exist')
        return res.status(404).json({ msg: error.message })
    }
    if (taskFound.project.creator.toString() !== req.user._id.toString() && 
    !taskFound.project.collaborators.some(collaborator => collaborator._id.toString() === req.user._id.toString())) {
        const error = new Error('You do not authorize for this action')
        return res.status(403).json({ msg: error.message })
    }

    taskFound.state = !taskFound.state
    taskFound.completed = req.user._id
    await taskFound.save()

    const taskSaved = await Task.findById(id).populate('project').populate('completed')
    res.json(taskSaved)

}

export {
    addTask,
    getTask,
    updateTask,
    deleteTask,
    changeState,
}