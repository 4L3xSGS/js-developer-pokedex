import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e',use:{baseURL:'http://localhost:4173',viewport:{width:1440,height:1100},trace:'retain-on-failure'},webServer:{command:'npm start',url:'http://localhost:4173',reuseExistingServer:!process.env.CI}});
