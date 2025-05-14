/**
 * Script to create a city user with password
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if any cities exist
    const cities = await prisma.cities.findMany();
    
    if (cities.length === 0) {
      console.log('No cities found. Creating a test city...');
      const newCity = await prisma.cities.create({
        data: {
          name: 'Austin',
          state: 'TX',
          country: 'USA',
          address: '123 Main St, Austin, TX 78701',
          zip_code: '78701',
          contact_email: 'transportation@austin.gov',
          contact_phone: '(512) 555-1234',
          website: 'https://austin.gov',
          status: 'Active'
        }
      });
      console.log('Created test city:');
      console.log(JSON.stringify(newCity, null, 2));
      
      // Create a city user with the new city
      await createCityUser(newCity.id);
    } else {
      console.log('Cities found:');
      console.log(JSON.stringify(cities, null, 2));
      
      // Create a city user with the first city
      await createCityUser(cities[0].id);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function createCityUser(cityId) {
  try {
    // Check if the test user already exists
    const existingUser = await prisma.city_users.findUnique({
      where: {
        email: 'cityadmin@example.gov'
      }
    });
    
    if (existingUser) {
      console.log('Test city user already exists:');
      console.log(JSON.stringify(existingUser, null, 2));
      return;
    }
    
    // Create a password hash
    const password = 'CityAdmin123!';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create the city user
    const newUser = await prisma.city_users.create({
      data: {
        id: uuidv4(),
        name: 'City Admin',
        email: 'cityadmin@example.gov',
        password_hash: passwordHash,
        city_id: cityId,
        role: 'admin',
        is_active: true
      }
    });
    
    console.log('Created test city user:');
    console.log(JSON.stringify(newUser, null, 2));
    console.log('\nLogin credentials:');
    console.log('Email: cityadmin@example.gov');
    console.log('Password: CityAdmin123!');
  } catch (error) {
    console.error('Error creating city user:', error);
  }
}

// Run the main function
main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
