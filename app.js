const express = require("express");
const path = require("path");
const multer = require("multer");
const { body, validationResult } = require("express-validator");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Create storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// File validation
const fileFilter = function (req, file, cb) {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG and PNG images are allowed."));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});


// Display registration form
app.get("/", function (req, res) {
    res.render("form", {
        errors: [],
        oldData: {}
    });
});


// Registration route
app.post(
    "/register",

    upload.fields([
        {
            name: "profilePic",
            maxCount: 1
        },
        {
            name: "otherPics",
            maxCount: 5
        }
    ]),

    [
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLength({ min: 3 })
            .withMessage("Username must contain at least 3 characters"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must contain at least 6 characters"),

        body("confirmPassword")
            .notEmpty()
            .withMessage("Confirm password is required")
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Passwords do not match");
                }

                return true;
            }),

        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Enter a valid email address"),

        body("gender")
            .notEmpty()
            .withMessage("Please select gender"),

        body("hobbies")
            .custom((value) => {
                if (!value) {
                    throw new Error("Please select at least one hobby");
                }

                return true;
            })
    ],

    function (req, res) {

        const errors = validationResult(req);

        let errorList = errors.array();

        // Check profile picture
        if (!req.files || !req.files.profilePic) {
            errorList.push({
                path: "profilePic",
                msg: "Please upload a profile picture"
            });
        }

        // Check other pictures
        if (!req.files || !req.files.otherPics) {
            errorList.push({
                path: "otherPics",
                msg: "Please upload at least one other picture"
            });
        }

        if (errorList.length > 0) {

            res.render("form", {
                errors: errorList,
                oldData: req.body
            });

            return;
        }

        const profilePic = req.files.profilePic[0];

        const otherPics = req.files.otherPics;

        res.render("result", {
            data: req.body,
            profilePic: profilePic,
            otherPics: otherPics
        });
    }
);


// Download route
app.get("/download/:filename", function (req, res) {

    const filePath = path.join(__dirname, "uploads", req.params.filename);

    res.download(filePath, function (err) {

        if (err) {
            res.status(404).send("File not found");
        }

    });
});


// Error handling for file upload
app.use(function (err, req, res, next) {

    if (err instanceof multer.MulterError) {

        return res.render("form", {
            errors: [
                {
                    path: "file",
                    msg: "File is too large or too many files were uploaded."
                }
            ],
            oldData: req.body
        });
    }

    if (err) {

        return res.render("form", {
            errors: [
                {
                    path: "file",
                    msg: err.message
                }
            ],
            oldData: req.body
        });
    }

    next(err);
});


app.listen(3000, function () {
    console.log("Server started on http://localhost:3000");
});