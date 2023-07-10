
import Project from "../models/Project.js"
import User from "../models/User.js"

const getProjects = async (req, res) => {
    // const projects = await Project.find().where('creator').equals(req.user).select('-tasks')
    const projects = await Project.find({
        $or: [
            {collaborators: {$in: req.user}},
            {creator: {$in: req.user}},
        ]
    }).select('-tasks')
    res.json(projects)
}
const getProject = async (req, res) => {
    const { id } = req.params
    try {
        const project = await Project.findById(id)
            .populate({path: 'tasks', populate: {path: 'completed', select: 'name'}})
            .populate('collaborators', 'name email')
        if (!project) {
            const error = new Error('The project does not exist')
            return res.status(404).json({ msg: error.message })
        }

        if (req.user._id.toString() !== project.creator.toString() && 
        !project.collaborators.some(collaborator => collaborator._id.toString() === req.user._id.toString())) {
            const error = new Error('You do not have permission for view this project')
            return res.status(401).json({ msg: error.message })
        }
        // const tasks = await Task.find().where('project').equals(project._id)
        res.json(project)
    } catch (error) {
        const er = new Error('An error occurred')
        return res.status(401).json({ msg: er.message })
    }
}

const newProject = async (req, res) => {
    const project = new Project(req.body)
    project.creator = req.user._id
    try {
        const projectCreated = await project.save()
        res.json(projectCreated)
    } catch (error) {
        console.log(error)
    }
}
const editProject = async (req, res) => {
    const { id } = req.params
    try {
        const project = await Project.findById(id)
        if (!project) {
            const error = new Error('The project does not exist')
            return res.status(404).json({ msg: error.message })
        }

        if (req.user._id.toString() !== project.creator.toString()) {
            const error = new Error('You do not have permission for view this project')
            return res.status(401).json({ msg: error.message })
        }

        project.name = req.body.name || project.name
        project.description = req.body.description || project.description
        project.deadline = req.body.deadline || project.deadline
        project.client = req.body.client || project.client

        try {
            const projectSaved = await project.save()
            res.json(projectSaved)
        } catch (error) {
            console.log(error)
        }

    } catch (error) {
        const er = new Error('An error occurred')
        return res.status(401).json({ msg: er.message })
    }
}
const deleteProject = async (req, res) => {
    const { id } = req.params
    try {
        const project = await Project.findById(id)
        if (!project) {
            const error = new Error('The project does not exist')
            return res.status(404).json({ msg: error.message })
        }

        if (req.user._id.toString() !== project.creator.toString()) {
            const error = new Error('You do not have permission for view this project')
            return res.status(401).json({ msg: error.message })
        }

        try {
            await project.deleteOne()
            res.json({ msg: 'Project deleted' })
        } catch (error) {
            console.log(error)
        }

    } catch (error) {
        const er = new Error('An error occurred')
        return res.status(401).json({ msg: er.message })
    }
}
const searchCollaborator = async (req, res) => {
    const {email} = req.body
    const user = await User.findOne({email}).select('-confirmed -createdAt -password -token -updatedAt -__v')
    if(!user){
        const error = new Error('User not found')
        return res.status(404).json({msg: error.message})
    }

    res.json(user)
}
const addCollaborator = async (req, res) => { 
    const project = await Project.findById(req.params.id)
    if(!project){
        const error = new Error('Project not found')
        return res.status(404).json({msg: error.message})
    }
    if(project.creator.toString() !== req.user._id.toString()){
        const error = new Error('Action not valid')
        return res.status(401).json({msg: error.message})
    }

    const {email} = req.body
    const user = await User.findOne({email}).select('-confirmed -createdAt -password -token -updatedAt -__v')
    if(!user){
        const error = new Error('User not found')
        return res.status(404).json({msg: error.message})
    }

    // the project creator can not be collaborator
    if(project.creator.toString() === user._id.toString()){
        const error = new Error('Project creator can not be Collaborator')
        return res.status(404).json({msg: error.message})
    }

    // Check if it already exists in the project
    if(project.collaborators.includes(user._id)){
        const error = new Error('The user already belongs to project')
        return res.status(404).json({msg: error.message})
    }

    // It ok, it can add to collaborators
    project.collaborators.push(user._id)
    await project.save()
    res.json({msg: 'Collaborator added successfully'})

}
const deleteCollaborator = async (req, res) => {
    const project = await Project.findById(req.params.id)
    if(!project){
        const error = new Error('Project not found')
        return res.status(404).json({msg: error.message})
    }
    if(project.creator.toString() !== req.user._id.toString()){
        const error = new Error('Action not valid')
        return res.status(401).json({msg: error.message})
    }

    // It ok, it can remove of collaborators
    project.collaborators.pull(req.body.id)
    await project.save()
    res.json({msg: 'Collaborator deleted successfully'})
}


export {
    getProjects,
    getProject,
    newProject,
    editProject,
    deleteProject,
    addCollaborator,
    deleteCollaborator,
    searchCollaborator
}

