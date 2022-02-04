import { Controller, Get, Res } from '@nestjs/common';

import { Readable } from 'stream';
import { Transform as Json2CsvTransform } from 'json2csv';
import { randEmail, randFirstName, randUuid } from '@ngneat/falso';

@Controller()
export class AppController {
  @Get()
  getData(@Res() res) {
    // Built in Nodejs readable stream, this is our pass through that will stream one from to another
    const input = new Readable({ objectMode: true });
    input._read = () => {};

    // Setting up json2csv for our output csv file
    const fields = ['id', 'firstName', 'email'];
    const opts = { fields };
    const json2csvTransform = new Json2CsvTransform(opts, { objectMode: true });

    // Need to make sure our response has the right headers so the browser can download the file
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=data.csv',
    });

    // We are piping our `input` (which is our passthrough) into the json2csv transformer
    const csvOutputStream = input.pipe(json2csvTransform);

    /*
     * We now have a stream that will be emitting data for a csv object. This can now be streamed into anything we want
     * For example you could use the AWS S3 SDK and pipe the stream into an S3 object within a bucket
     */

    // outputting the csv stream to the response object
    csvOutputStream.pipe(res);

    for (let i = 0; i < 100; i++) {
      // Add data to our input stream which will then go through the json2csv transformer stream then into the response
      input.push({
        id: randUuid(),
        firstName: randFirstName(),
        email: randEmail(),
      });
    }

    // end the stream
    input.push(null);
  }
}
