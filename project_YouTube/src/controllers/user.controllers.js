import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { User } from "../modules/user.model.js";
import { uploadOnCloudinary } from "../utils/uploadFile_Cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

// generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // console.log("accessToken", accessToken)
    // console.log("refreshToken", refreshToken);

    // add refresh token into database
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong in generating access and refresh token"
    );
  }
};

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
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user register successfully"));
});

const logInUser = asyncHandler(async (req, res) => {
  // take email or username and password from user
  // find user
  // password check
  // generate access and refresh token
  // send cookies to user

  const { username, email, password } = req.body;

  // if any field is not empty

  /*
  let requiredFields = {username, email, password}
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      throw new ApiError(400, `${field} is required`)
    }
  }
  */

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  // find user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(401, "User does not exist");
  }

  // check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // console.log("accessToken", accessToken);
  // console.log("refreshToken", refreshToken);

  // send cookies to user
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          data: loggedUser,
          accessToken,
          refreshToken,
        },
        "User logged Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    req.user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", accessToken, options)
    .clearCookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "User logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // I am taking refresh Token from user cookies to find the exact user and then generate new accessToken for that user.
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const decodeToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodeToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // now checking the incomingRefreshToken that I took from user (whose accessToken is expired) cookies and the refreshToken which is saved in db of this user...
  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh Token is expired or used");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { newAccessToken, newRefreshToken } =
    await generateAccessAndRefreshToken(user?._id);

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        "New Access and Refresh Token has been generated"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {

  const {oldPassword, newPassword, confirmNewPassword} = req.body

  if (newPassword !== confirmNewPassword) {
    throw new ApiError(400, "New password and Confirm password did not match")
  }

  // finding user who wants to change the password, so we have req.user._id to find that exact user to change password.
  const user =  await User.findById(req.user?._id)

  // checking user's old password if it's correct or not, then he will be able to change password.
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Old Password")
  }

  user.password = newPassword
  await  user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "Password has been changed successfully"
    )
  )

})

const getCurrentUser = asyncHandler( async (req, res) => {

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      req.user,
      "Current user fetched successfully"
    )
  )
})

const updateUsernameAndFullname = asyncHandler ( async (req, res) => {
  const {fullname, username} = req.body

  if (!(fullname && username)) {
    throw new ApiError(400, "fullname and username is required")
  }

  const updatedUserDetails = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {fullname, username}
    },
    {new: true}
  ).select("-password, -refreshToken")

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUserDetails,
        "fullname and username has been updated"
      )
    );

}) 

const updateUserAvatar = asyncHandler ( async (req, res) => {
  // as we already inject multer middleware, so it giving access of file in req and res
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {new: true}
  ).select("-password, -refreshToken")

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Avatar changed successfully"
    )
  )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // as we already inject multer middleware, so it giving access of file in req and res
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(401, "Cover-Image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password, -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover-Image changed successfully"));
});

export {
  registerUser,
  logInUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUsernameAndFullname,
  updateUserAvatar,
  updateUserCoverImage
};
