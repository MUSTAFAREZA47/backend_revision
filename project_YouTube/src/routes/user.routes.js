import {Router} from 'express'
import { logInUser, registerUser, logOutUser } from '../controllers/user.controllers.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

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
router.route('/login').post(logInUser)

// logout route added middleware to get user to logged out
router.route('/logout').post(verifyJWT, logOutUser)

export default router