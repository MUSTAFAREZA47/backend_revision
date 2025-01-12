import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { User } from "../modules/user.model.js";
import { uploadOnCloudinary } from "../utils/uploadFile_Cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // check validation - mainly empty fields
  // check if user already exists: through username, email
  // check for images, mainly avatar which is required
  // check upload on cloudinary, avatar
  // create user object - create entry in db
  // remove password and refreshToken field from response
  // check for user creation
  // return response

  const { username, email, fullname, password } = req.body;
  // console.log(username, email, fullname, password);

  // checking validation
  const requiredFields = { username, email, fullname, password };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      throw new ApiError(400, `${field} is required`);
    }
  }

  // checking if user is already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, "User alread existed");
  }

  // checking if avatar file is uploaded on local server
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // console.log(avatarLocalPath);
  const coverImageLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // uploading avatar file on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log(avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // checking if avatar uploaded on cloudinary
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // creating user in database
  const user = await User.create({
    fullname,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    password,
  });

  // remove password and refreshToken field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // return response
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // return response if user register successfully
  return res.status(201).json(
    new ApiResponse(200, createdUser, "user register successfully")
  )

});

const logInUser = asyncHandler( async (req, res) => {
  // take email or username and password from user
  // find user
  // password check
  // generate access and refresh token
  // send cookies to user

  const {username, email, password} = req.body
   
  // if any field is not empty
  let requiredFields = {username, email, password}
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      throw new ApiError(400, `${field} is required`)
    }
  }

  // find user
  const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if (!user) {
    throw new ApiError(401, "User does not exist")
  }

  // check password
  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(400, "Incorrect Password")
  }

  // generate access and refresh token
  const generateAccessAndRefreshToken = async (userId) => {
    try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      // add refresh token into database
      user.refreshToken = refreshToken

      await user.save( {validateBeforeSave: false})

      return {accessToken, refreshToken}

    } catch (error) {
      throw new ApiError(500, "Something went wrong in generating access and refresh token")
    }
  }

  const {accessToken, refreshToken} = generateAccessAndRefreshToken(user._id)
  const loggedUser =  await User.findById(user._id).select("-password -refreshToken")

  // send cookies to user
   const options = {
    httpOnly: true,
    secure: true
   }

   return res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(new ApiResponse(
      200,
      {
        data: loggedUser, accessToken, refreshToken
      },
      "User logged Successfully"
    ))



})

export { registerUser, logInUser };
