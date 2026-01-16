import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { connect, set, disconnect } from "mongoose";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Server as HTTPServer } from "http";
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from "@config";
import { dbConnection } from "@databases";
import { Routes } from "@interfaces/routes.interface";
import errorMiddleware from "@middlewares/error.middleware";
import { logger, stream } from "@utils/logger";
import { initializeSocket } from "@utils/socket";

class App {
  public app: express.Application;
  public server: HTTPServer;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.server = new HTTPServer(this.app);
    this.env = NODE_ENV || "development";
    this.port = PORT || 3000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeSocket();
    this.initializeErrorHandling();
  }

  public listen() {
    // Use process.env.PORT for cloud platforms (Render, Heroku, etc.)
    const port = process.env.PORT || this.port;
    this.server.listen(port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${port}`);
      logger.info(`📡 Socket.io initialized`);
      logger.info(`=================================`);
    });
  }

  public async closeDatabaseConnection(): Promise<void> {
    try {
      await disconnect();
      console.log("Disconnected from MongoDB");
    } catch (error) {
      console.error("Error closing database connection:", error);
    }
  }

  public getServer() {
    return this.server;
  }

  public getApp() {
    return this.app;
  }

  private initializeSocket() {
    initializeSocket(this.server);
    logger.info('Socket.io initialized');
  }

  private async connectToDatabase() {
    if (this.env !== "production") {
      set("debug", true);
    }

    await connect(dbConnection.url);
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    
    // CORS configuration
    const corsOptions = {
      origin: this.env === 'production' 
        ? (ORIGIN || process.env.FRONTEND_URL || '*') 
        : true, // Allow all origins in development
      credentials: CREDENTIALS || true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
    this.app.use(cors(corsOptions));
    
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'Proctoring System API',
          version: '1.0.0',
          description: 'API documentation for b2c backend',
        },
      },
      apis: ['src/docs/swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;