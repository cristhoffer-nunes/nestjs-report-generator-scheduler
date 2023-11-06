import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
@Catch()
export class TasksExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorMessage = exception.getResponse();

      response.status(status).json({
        message: 'An error occurred while running the service.',
        error: errorMessage,
      });
    } else if (exception instanceof Error) {
      response.status(500).json({
        message: 'Internal Server Error',
        error: exception.message,
      });
    } else {
      response.status(500).json({
        message: 'Internal Server Error',
        error: exception,
      });
    }
  }
}
