import express from 'express';
import cors from 'cors';
import issuanceRoutes from './routes/issuanceRoutes';
import { requestLogger } from './middleware/requestLogger';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
app.use(issuanceRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
