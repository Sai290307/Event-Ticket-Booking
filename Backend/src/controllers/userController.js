import User from "../models/user.js";

export async function createUser(req, res) {
  try {
    const { name, email, city, preferences, firebaseUid } = req.body;
    
    const user = await User.create({
      name,
      email,
      city,
      preferences,
      firebaseUid
    });
    
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    res.status(500).json({ message: err.message });
  }
}

export async function getUsers(req, res) {
  try {
    const { email, password } = req.query;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Check if user exists by email
export async function checkUser(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Return exists status
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get user by Firebase UID
export async function getUserByFirebaseUid(req, res) {
  try {
    const { firebaseUid } = req.params;

    if (!firebaseUid) {
      return res.status(400).json({ message: "Firebase UID is required" });
    }

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
