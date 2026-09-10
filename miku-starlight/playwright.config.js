import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:60000,use:{channel:'msedge',headless:true,viewport:{width:1440,height:1100}},webServer:{command:'npm run dev',url:'http://localhost:5174',reuseExistingServer:true},reporter:'list'});
