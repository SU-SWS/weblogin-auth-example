import type { NextConfig } from "next";
import dotenv from "dotenv";

// Load .env file for edge function bundling
dotenv.config();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
