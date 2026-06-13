declare module 'serverless-http' {
  import { Handler } from 'http';
  import { Express } from 'express';
  interface Options {
    binary?: string[];
  }
  export default function serverless(
    app: Express | Handler,
    options?: Options
  ): Handler;
}
