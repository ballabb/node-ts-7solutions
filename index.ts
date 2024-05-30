import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

interface User {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  ip: string;
  address: {
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    country: string;
  };
  macAddress: string;
  university: string;
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company: {
    department: string;
    name: string;
    title: string;
    address: {
      address: string;
      city: string;
      state: string;
      stateCode: string;
      postalCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      country: string;
    };
  };
  ein: string;
  ssn: string;
  userAgent: string;
  crypto: {
    coin: string;
    wallet: string;
    network: string;
  };
  role: string;
}

interface Data {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

function groupByDepartment(data: Data) {
  const departmentSummary: any = {};

  data.users.forEach(user => {
    const { department } = user.company;
    if (!departmentSummary[department]) {
      departmentSummary[department] = {
        male: 0,
        female: 0,
        ageRange: { min: Infinity, max: -Infinity },
        hair: {},
        addressUser: {}
      };
    }

    const summary = departmentSummary[department];

    if (user.gender === 'male') summary.male += 1;
    if (user.gender === 'female') summary.female += 1;

    summary.ageRange.min = Math.min(summary.ageRange.min, user.age);
    summary.ageRange.max = Math.max(summary.ageRange.max, user.age);

    const hairColor = user.hair.color;
    if (!summary.hair[hairColor]) summary.hair[hairColor] = 0;
    summary.hair[hairColor] += 1;

    const fullName = `${user.firstName}${user.lastName}`;
    summary.addressUser[fullName] = user.address.postalCode;
  });

  for (const dept in departmentSummary) {
    departmentSummary[dept].ageRange = `${departmentSummary[dept].ageRange.min}-${departmentSummary[dept].ageRange.max}`;
  }

  return departmentSummary;
}

app.get("/", async (req: Request, res: Response) => {
  const data = await axios.get("https://dummyjson.com/users").then((response: any) => {
    return response.data
  });
  const groupedByDepartment = await groupByDepartment(data)
  res.send(groupedByDepartment);
});

app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});