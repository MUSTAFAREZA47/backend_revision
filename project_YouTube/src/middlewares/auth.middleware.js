import { User } from "../modules/user.model.js";
import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import jwt from 'jsonwebtoken'


export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        // console.log("Cookies:", req.cookies);
        // console.log("Authorization Header:", req.header("Authorization"));
        // console.log(token);

        // console.log('token', token)

    
        if (!token) {
            throw new ApiError(401, "Unauthorized Request")
        }
    
       const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // console.log('decodeToken', decodeToken)
    
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user
        next()
        
    } catch (error) {
        throw new ApiError(400, "Invalid Access Token Error in VerifyJWT")
    }
})