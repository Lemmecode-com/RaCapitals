import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import AdminUser from '../models/AdminUser.js'

export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const admin = await AdminUser.findOne({ username })

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash)

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      token,
      admin: { username: admin.username }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const verify = (req, res) => {
  return res.status(200).json({
    valid: true,
    username: req.admin.username
  })
}