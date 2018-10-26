const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

/**
 * Allows a user to login using email and password. Returns their JWT to the client.
 */
module.exports.login = async function (req, res) {
    // Using the email located on the request body, query the database and
    // get the user's data
    const user = await db.User.findOne({
        where: {
            email: req.body.email
        }
    });

    // If the user doesn't exist, send a status code of 401 (Unauthorized)
    // and let them know that their email is invalid
    if (!user) {
        return res.status(401).json({
            field: 'email',
            message: 'Invalid email'
        });
    }

    // Compare the hashed password from the database and the password located on
    // the request body using bcrypt
    const passwordsMatch = await bcrypt.compare(req.body.password, user.password);

    // If the passwords do not match, then send a status code of 401 (Unauthorized)
    // and let the user know that the given passwords do not match
    if (!passwordsMatch) {
        return res.status(400).json({
            field: 'password',
            message: 'Invalid password'
        });
    }

    // If the email and password are valid, then extract the necessary data from
    // the user's database entry and create a JWT based on this data
    const {
        createdAt,
        email,
        username,
        updatedAt
    } = user;
    const token = jwt.sign({
        createdAt,
        email,
        username,
        updatedAt
    }, process.env.JWT_SECRET);

    // Send the token to the client
    return res.json({
        token
    });
}

/**
 * Registers a new user, returns the new user's JWT to the client
 */
module.exports.register = async function (req, res) {
    // Queries the database for an already-existing user with the given email
    let user = await db.User.findOne({
        where: {
            email: req.body.email
        }
    });

    // If said user already exists, then send a status code of 400 (Bad Request)
    // and send a message saying that the email is already taken
    if (user) {
        return res.status(400).json({
            field: 'email',
            message: 'Email already taken'
        });
    }

    // If the user doesn't already exist, create a new user based on the provided
    // data in the request body, and hash the given password
    user = await db.User.create({
        ...req.body,
        password: await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT_ROUNDS, 10))
    });

    // Retrieve the newly-created user from the database and extract the below
    // properties from the user's object. These properties will be accessible
    // from the decoded JWT
    user = user.get();
    const {
        createdAt,
        email,
        username,
        updatedAt
    } = user;

    // "Sign" the user object using the extracted data and the `JWT_SECRET`
    // environment variable. This is what creates the JWT.
    const token = jwt.sign({
        createdAt,
        email,
        username,
        updatedAt
    }, process.env.JWT_SECRET);

    // Send the token to the client
    return res.json({
        token
    });
}

/**
 * Verifies a user's token based on the `Authorization` header provided.
 * Sends the user's decoded data to the client.
 */
module.exports.verify = async function (req, res) {
    // Extract the token from the header
    // We need the 7th character onwards (the header looks like `bearer XXXXX`)
    const token = req.headers.authorization.slice(7).trim();

    // If the token was not provided, then send a status of 401 (Unauthorized)
    if (!token || token === 'null') {
        return res.status(401).json({
            message: 'No token provided'
        });
    }

    // If the token was provided, decode it
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // Send the decoded data to the client
    return res.json(decoded);
}