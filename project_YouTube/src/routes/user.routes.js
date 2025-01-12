import {Router} from 'express'
import { logInUser, registerUser } from '../controllers/user.controllers.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()

// register route
// adding middleware to upload file
router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
)

// login route
router.route('/login', logInUser)

export default router