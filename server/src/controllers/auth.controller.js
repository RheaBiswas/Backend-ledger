const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model");

/**
 * - User Register Controller
 * - POST /api/auth/register
 */
async function userRegisterController(req, res) {
    const { email, password, name } = req.body;

    const isExists = await userModel.findOne({
        email: email
    });

    if (isExists) {
        return res.status(422).json({
            message: "User already exists with email.",
            status: "failed"
        });
    }

    const user = await userModel.create({
        email,
        password,
        name
    });

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });

    emailService.sendRegistrationEmail(
        user.email,
        user.name
    ).catch(err => console.error("Error sending registration email:", err));
}

/**
 * - User Login Controller
 * - POST /api/auth/login
 */
async function userLoginController(req, res) {
    const { email, password } = req.body;

    const user = await userModel
        .findOne({ email })
        .select("+password");

    if (!user) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });
}

/**
 * - User Logout Controller
 * - POST /api/auth/logout
 */
async function userLogoutController(req, res) {
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully"
        });
    }

    await tokenBlackListModel.create({
        token: token
    });

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json({
        message: "User logged out successfully"
    });
}

async function userForgotPasswordController(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(200).json({
                message: "If an account with that email exists, a password reset link has been sent."
            });
        }

        const crypto = require("crypto");
        const token = crypto.randomBytes(20).toString("hex");

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        emailService.sendPasswordResetEmail(user.email, user.name, token)
            .catch(error => console.error("Error sending reset password email:", error));

        return res.status(200).json({
            message: "If an account with that email exists, a password reset link has been sent."
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function userResetPasswordController(req, res) {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password should contain more than 6 characters" });
    }

    try {
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        }).select("+resetPasswordToken +resetPasswordExpires");

        if (!user) {
            return res.status(400).json({ message: "Password reset token is invalid or has expired." });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "Password has been reset successfully."
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController,
    userForgotPasswordController,
    userResetPasswordController
};