// ------ Import npm modules
// import cors    from 'cors'
import express from 'express'
import helmet from 'helmet'

const app: express.Application = express()

// ------ Initialize & Use Middle-Wares
// app.set('trust proxy', 1)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(helmet())
// app.use(cors())

// ------ Add i18n (internationalization)
// import i18n from './middlewares/i18n'
// app.use(i18n)

// TODO: Add other caching systems (like 'RabbitMQ') in the future
// ------ Socket.io Integration
// import http   from 'http'
// import socket from 'socket.io'
// const server: http.Server = new http.Server(app)
// const io: socket.Server   = socket(server)
// app.set('io', io)

// ------ Allows cross-origin domains to access this API
// import initCors from './middlewares/cors'
// app.use(initCors)

// ------ Add JWT to system globally
// import jwt from 'express-jwt'
// app.use(jwt({ secret: config.jwt.key }))

// ------ Set Rate Limiter
// import limiter from './middlewares/rate_limit'
// app.use(limiter())

// ------ Add logger to system
// import logger from './middlewares/api_log'
// app.use(logger)

// ------ Require all routes
import docsRoutes from './routes/index';
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import retailerRoutes from "./routes/retailer.route";
import serviceRoutes from "./routes/service.route";
import addressRoutes from './routes/address.route';
import orderRoutes from './routes/order.route';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1', docsRoutes);
app.use('/api/v1/retailer', retailerRoutes);
app.use('/api/v1/service', serviceRoutes);
app.use('/api/v1/address', addressRoutes);
app.use('/api/v1/orders', orderRoutes);

// ------ Add Response Transformer (& error handler) to system
// import transformer from './middlewares/transformer'
// app.use(transformer)

export default app
