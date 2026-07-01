const express = require("express")
const authController = require("../controllers/auth.controller")

const router = express.Router()


/* POST /api/auth/register */
router.post("/register", authController.userRegisterController)


/* POST /api/auth/login */
router.post("/login",authController.userLoginController)

/**
 * - POST /api/auth/logout
 */
router.post("/logout", authController.userLogoutController)


/* POST /api/auth/forgot-password */
router.post("/forgot-password", authController.userForgotPasswordController)


/* POST /api/auth/reset-password */
router.post("/reset-password", authController.userResetPasswordController)


module.exports = router