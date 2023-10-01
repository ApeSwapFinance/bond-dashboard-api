import { Controller, All, Req, Res } from '@nestjs/common';
import { RedirectService } from './redirect.service';
import * as request from 'request';
import axios, { AxiosRequestConfig } from 'axios';
import * as https from 'https';

@Controller('redirect')
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @All('*')
  async redirect(@Req() req, @Res() res) {
    console.log('REDIRECT HIT');
    const newUrl = 'https://polygon.apeswap.dev';
    const options: AxiosRequestConfig = {
      url: newUrl,
      method: req.method,
      headers: req.headers,
      data: req.body,
      responseType: 'stream',
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    };
    try {
      const response = await axios(options);
      console.log('MADE IT');
      response.data.pipe(res);
    } catch (error) {
      console.log('FAILED');
      console.log(error);

      return res.status(500).send(error.message);
    }
  }
}
