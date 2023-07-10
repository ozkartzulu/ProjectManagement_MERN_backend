
import User from "../models/User.js"
import generateId from "../helpers/generateid.js"
import generateJWT from "../helpers/generateJWT.js"
import { emailRegister, emailForgetPassword } from "../helpers/email.js"

const register = async (req, res) => {

    // controller the email unique
    const { email } = req.body
    const userFind = await User.findOne({ email })
    if (userFind) {
        const error = new Error('Already registered User')
        return res.status(400).json({ msg: error.message })
    }

    try {
        const user = new User(req.body)
        user.token = generateId()
        await user.save()

        // send email of confirmation
        emailRegister({
            name: user.name,
            email: user.email,
            token: user.token
        })
        res.json({msg: 'User created successfully, Review you email for confirm your account'})
    } catch (error) {
        console.log(error)
    }
}

const authentication = async (req, res) => {
    const { email, password } = req.body
    // check if the user exist
    const user = await User.findOne({ email })
    if (!user) {
        const error = new Error('The User does not exist')
        return res.status(404).json({ msg: error.message })
    }
    // check if the user is confirmed
    if (!user.confirmed) {
        const error = new Error('Your Account do not is confirmed')
        return res.status(403).json({ msg: error.message })
    }

    // check his password
    if (await user.checkPassword(password)) {
        res.json({ _id: user._id, name: user.name, email: user.email, token: generateJWT(user._id) })
    } else {
        const error = new Error('The password is incorrect')
        return res.status(403).json({ msg: error.message })
    }
}

const confirm = async (req, res) => {
    const { token } = req.params
    const userToken = await User.findOne({ token })
    if (!userToken) {
        const error = new Error('The token does not exist')
        return res.status(403).json({ msg: error.message })
    }

    try {
        userToken.confirmed = true
        userToken.token = ''
        await userToken.save()
        res.json({ msg: 'User confirmed successful' })

    } catch (error) {
        console.log(error)
    }
}

const forgetPassword = async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        const error = new Error('The User does not exist')
        res.status(404).json({ msg: error.message })
    }

    try {
        user.token = generateId()
        await user.save()
        // send email of confirmation
        emailForgetPassword({
            name: user.name,
            email: user.email,
            token: user.token
        })
        res.json({ msg: 'We have sent an email with the instructions' })
    } catch (error) {
        console.log(error)
    }
}

const forgetPasswordCheck = async (req, res) => {
    const { token } = req.params
    const tokenFound = await User.findOne({ token })
    if (tokenFound) {
        res.json({ msg: 'Token valid and user exist' })
    } else {
        const error = new Error('The Token does not exist')
        res.status(404).json({ msg: error.message })
    }
}

const newPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({ token })
    if (user) {
        user.password = password
        user.token = ''
        try {
            await user.save()
            res.json({ msg: 'Password modified correctly' })
        } catch (error) {
            console.log(error)
        }
    } else {
        const error = new Error('The User does not exist')
        res.status(404).json({ msg: error.message })
    }
}

const profile = async (req, res) => {
    const { user } = req
    res.json(user)
}

export {
    register,
    authentication,
    confirm,
    forgetPassword,
    forgetPasswordCheck,
    newPassword,
    profile
}