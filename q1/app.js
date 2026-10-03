const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const {
    body,
    validationResult
} = require("express-validator");

const app = express();

const PORT = 3000;

// ----------------------------------------------------
// VIEW ENGINE
// ----------------------------------------------------

app.set("view engine", "ejs");

// ----------------------------------------------------
// UPLOAD DIRECTORIES
// ----------------------------------------------------

const profileDir = path.join(__dirname, "uploads", "profile");
const othersDir = path.join(__dirname, "uploads", "others");

// Create folders if they don't exist
fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(othersDir, { recursive: true });

// ----------------------------------------------------
// STATIC FOLDERS
// ----------------------------------------------------

app.use(express.static(path.join(__dirname, "public")));

app.use(
    "/uploads/profile",
    express.static(profileDir)
);

app.use(
    "/uploads/others",
    express.static(othersDir)
);

// ----------------------------------------------------
// FILE VALIDATION
// ----------------------------------------------------

function fileFilter(req, file, cb) {

    const allowedTypes = /jpeg|jpg|png/;

    const extension = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mimeType = allowedTypes.test(
        file.mimetype.toLowerCase()
    );

    if (extension && mimeType) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG and PNG images are allowed."
            )
        );
    }
}

// ----------------------------------------------------
// MULTER STORAGE
// ----------------------------------------------------

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        if (file.fieldname === "profilePic") {

            cb(null, profileDir);

        } else if (file.fieldname === "otherPics") {

            cb(null, othersDir);

        } else {

            cb(new Error("Unexpected file field"));

        }
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 100000) +
            "-" +
            file.originalname;

        cb(null, uniqueName);
    }
});

// ----------------------------------------------------
// MULTER CONFIGURATION
// ----------------------------------------------------

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 6
    }

}).fields([

    {
        name: "profilePic",
        maxCount: 1
    },

    {
        name: "otherPics",
        maxCount: 5
    }

]);

// ----------------------------------------------------
// GET FORM
// ----------------------------------------------------

app.get("/", (req, res) => {

    res.render("form", {

        errors: [],

        oldData: {}

    });

});

// ----------------------------------------------------
// POST REGISTER
// ----------------------------------------------------

app.post(

    "/register",

    // ------------------------------------------------
    // FILE UPLOAD
    // ------------------------------------------------

    function (req, res, next) {

        upload(req, res, function (err) {

            if (err) {

                return res.render("form", {

                    errors: [
                        {
                            msg: err.message
                        }
                    ],

                    oldData: req.body || {}

                });

            }

            next();

        });

    },

    // ------------------------------------------------
    // VALIDATION
    // ------------------------------------------------

    [

        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required.")
            .isLength({ min: 3 })
            .withMessage(
                "Username must contain at least 3 characters."
            ),

        body("password")
            .notEmpty()
            .withMessage("Password is required.")
            .isLength({ min: 6 })
            .withMessage(
                "Password must contain at least 6 characters."
            ),

        body("confirmPassword")
            .notEmpty()
            .withMessage(
                "Confirm password is required."
            ),

        body("email")
            .trim()
            .isEmail()
            .withMessage(
                "Please enter a valid email address."
            ),

        body("gender")
            .notEmpty()
            .withMessage(
                "Please select your gender."
            ),

        body("hobbies")
            .isArray({ min: 1 })
            .withMessage(
                "Please select at least one hobby."
            )

    ],

    // ------------------------------------------------
    // CHECK VALIDATION ERRORS
    // ------------------------------------------------

    function (req, res) {

        const errors = validationResult(req);

        // ------------------------------------------------
        // PASSWORD MATCHING
        // ------------------------------------------------

        if (
            req.body.password &&
            req.body.confirmPassword &&
            req.body.password !== req.body.confirmPassword
        ) {

            errors.errors.push({

                type: "field",

                value: req.body.confirmPassword,

                msg: "Password and confirm password do not match.",

                path: "confirmPassword",

                location: "body"

            });

        }

        // ------------------------------------------------
        // PROFILE PICTURE VALIDATION
        // ------------------------------------------------

        if (
            !req.files ||
            !req.files.profilePic ||
            req.files.profilePic.length === 0
        ) {

            errors.errors.push({

                type: "field",

                msg: "Please upload a profile picture.",

                path: "profilePic",

                location: "body"

            });

        }

        // ------------------------------------------------
        // OTHER PICTURES VALIDATION
        // ------------------------------------------------

        if (
            !req.files ||
            !req.files.otherPics ||
            req.files.otherPics.length === 0
        ) {

            errors.errors.push({

                type: "field",

                msg: "Please upload at least one other picture.",

                path: "otherPics",

                location: "body"

            });

        }

        // ------------------------------------------------
        // IF VALIDATION ERRORS EXIST
        // ------------------------------------------------

        if (!errors.isEmpty()) {

            // Delete profile picture
            if (
                req.files &&
                req.files.profilePic
            ) {

                req.files.profilePic.forEach(file => {

                    fs.unlink(
                        path.join(
                            profileDir,
                            file.filename
                        ),
                        () => {}
                    );

                });

            }

            // Delete other pictures
            if (
                req.files &&
                req.files.otherPics
            ) {

                req.files.otherPics.forEach(file => {

                    fs.unlink(
                        path.join(
                            othersDir,
                            file.filename
                        ),
                        () => {}
                    );

                });

            }

            return res.render("form", {

                errors: errors.array(),

                oldData: req.body || {}

            });

        }

        // ------------------------------------------------
        // ALL DATA IS VALID
        // ------------------------------------------------

        const profilePic =
            req.files.profilePic[0];

        const otherPics =
            req.files.otherPics;

        res.render("result", {

            data: req.body,

            profilePic: profilePic,

            otherPics: otherPics

        });

    }

);

// ----------------------------------------------------
// DOWNLOAD PROFILE PICTURE
// ----------------------------------------------------

app.get(
    "/download/profile/:filename",
    (req, res) => {

        const filePath = path.join(
            profileDir,
            req.params.filename
        );

        res.download(filePath, (err) => {

            if (err) {

                if (!res.headersSent) {

                    res.status(404).send(
                        "File not found."
                    );

                }

            }

        });

    }
);

// ----------------------------------------------------
// DOWNLOAD OTHER PICTURE
// ----------------------------------------------------

app.get(
    "/download/other/:filename",
    (req, res) => {

        const filePath = path.join(
            othersDir,
            req.params.filename
        );

        res.download(filePath, (err) => {

            if (err) {

                if (!res.headersSent) {

                    res.status(404).send(
                        "File not found."
                    );

                }

            }

        });

    }
);

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});
