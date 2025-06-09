import { Controller, Get, Render } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller()
export class DashboardController {

  @Get('dashboard')
  @Render('dashboard')
  @ApiExcludeEndpoint()
  getDashboard() {
    return { title: 'Monitoring Dashboard' };
  }

  @Get()
  @ApiOperation({ summary: 'Redirección al dashboard principal' })
  @ApiResponse({ status: 302, description: 'Redirecciona a /dashboard' })
  redirectToDashboard() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta http-equiv="refresh" content="0; url=/dashboard">
        <title>Monitoring Dashboard</title>
      </head>
      <body>
        <p>Redirigiendo al <a href="/dashboard">Dashboard de Monitoreo</a>...</p>
      </body>
      </html>
    `;
  }
} 