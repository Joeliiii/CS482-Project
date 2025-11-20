/**
 * Script to create an admin user
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../model/User');
const Role = require('../model/Role');
const UserRole = require('../model/UserRole');

async function createAdmin() {
    try {
        // connect to MongoDB
        const DB_HOST = process.env.DB_HOST;
        const DB_USER = process.env.DB_USER;
        const DB_PASS = process.env.DB_PASS;
        const DB_NAME = process.env.DB_NAME_REAL;
        
        const mongoUri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // checking if admin user exists
        let adminUser = await User.findOne({ email: 'admin@ybtleague.com' });
        
        if (!adminUser) {
            // creating admin 
            const passwordHash = await bcrypt.hash('AdminPass123!', 10);
            adminUser = await User.create({
                email: 'admin@ybtleague.com',
                username: 'admin',
                passwordHash: passwordHash,
                phone: '555-0000',
                isVerified: true
            });
            console.log('Admin user created:', adminUser.email);
        } else {
            console.log('Admin user already exists');
        }

        // making sure 'admin' role exists
        let adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole) {
            adminRole = await Role.create({
                name: 'admin',
                displayName: 'Administrator'
            });
            console.log('Admin role created');
        } else {
            console.log('Admin role already exists');
        }

        // mkaing sure 'user' role exists (base role)
        let userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
            userRole = await Role.create({
                name: 'user',
                displayName: 'User'
            });
            console.log('User role created');
        }

        // assigning roles to admin user
        const existingAdminRole = await UserRole.findOne({
            userId: adminUser._id,
            roleId: adminRole._id
        });

        if (!existingAdminRole) {
            await UserRole.create({
                userId: adminUser._id,
                roleId: adminRole._id
            });
            console.log('Admin role assigned to user');
        } else {
            console.log('Admin role already assigned');
        }

        const existingUserRole = await UserRole.findOne({
            userId: adminUser._id,
            roleId: userRole._id
        });

        if (!existingUserRole) {
            await UserRole.create({
                userId: adminUser._id,
                roleId: userRole._id
            });
            console.log('User role assigned');
        }

        console.log('\nAdmin account ready!');
        console.log('Email: admin@ybtleague.com');
        console.log('Password: AdminPass123!');
        console.log('\nRemember to change the password after first login!\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createAdmin();