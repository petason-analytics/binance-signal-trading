import { UserInput } from './email.type';

export const first_template = (
  user: UserInput,
  content: string,
  campaignName: string,
) => {
  return `
    <!DOCTYPE HTML
      PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
  
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
  
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
  
      <title></title>
  
      <style type="text/css">
          table,
          td {
              color: #000000;
          }
  
          @media (max-width: 480px) {
              #u_column_2 .v-col-padding {
                  padding: 30px 22px 33px !important;
              }
          }
  
          @media only screen and (min-width: 570px) {
              .u-row {
                  width: 550px !important;
              }
  
              .u-row .u-col {
                  vertical-align: top;
              }
  
              .u-row .u-col-100 {
                  width: 550px !important;
              }
  
          }
  
          @media (max-width: 570px) {
              .u-row-container {
                  max-width: 100% !important;
                  padding-left: 0px !important;
                  padding-right: 0px !important;
              }
  
              .u-row .u-col {
                  min-width: 320px !important;
                  max-width: 100% !important;
                  display: block !important;
              }
  
              .u-row {
                  width: calc(100% - 40px) !important;
              }
  
              .u-col {
                  width: 100% !important;
              }
  
              .u-col>div {
                  margin: 0 auto;
              }
          }
  
          body {
              margin: 0;
              padding: 0;
          }
  
          table,
          tr,
          td {
              vertical-align: top;
              border-collapse: collapse;
          }
  
          p {
              margin: 0;
          }
  
          .ie-container table,
          .mso-container table {
              table-layout: fixed;
          }
  
          * {
              line-height: inherit;
          }
  
          a[x-apple-data-detectors='true'] {
              color: inherit !important;
              text-decoration: none !important;
          }
      </style>
  
  
  
  </head>
  
  <body class="clean-body u_body"
      style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #3a3737;color: #000000">
  
      <table
          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #3a3737;width:100%"
          cellpadding="0" cellspacing="0">
          <tbody>
              <tr style="vertical-align: top">
                  <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
  
  
                      <div class="u-row-container" style="padding: 0px;background-color: transparent">
                          <div class="u-row"
                              style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                              <div
                                  style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  
                                  <div class="u-col u-col-100"
                                      style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
                                      <div style="width: 100% !important;">
  
                                          <div class="v-col-padding"
                                              style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  
  
                                              <table style="font-family:courier new,courier;" role="presentation"
                                                  cellpadding="0" cellspacing="0" width="100%" border="0">
                                                  <tbody>
                                                      <tr>
                                                          <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:courier new,courier;"
                                                              align="left">
  
                                                              <table width="100%" cellpadding="0" cellspacing="0"
                                                                  border="0">
                                                                  <tr>
                                                                      <td style="padding-right: 0px;padding-left: 0px;"
                                                                          align="center">
  
                                                                          <img align="center" border="0"
                                                                              src="https://www.linkpicture.com/q/image-1_22.png"
                                                                              title="Hero Image"
                                                                              style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 550px;"
                                                                              width="550" />
  
                                                                      </td>
                                                                  </tr>
                                                              </table>
  
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
  
                                          </div>
  
                                      </div>
                                  </div>
  
                              </div>
                          </div>
                      </div>
  
  
  
                      <div class="u-row-container" style="padding: 0px;background-color: transparent">
                          <div class="u-row"
                              style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                              <div
                                  style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  
                                  <div id="u_column_2" class="u-col u-col-100"
                                      style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
                                      <div
                                          style="width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                          <div class="v-col-padding"
                                              style="padding: 30px 50px 33px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 10px solid #65b87e;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  
  
                                              <table style="font-family:courier new,courier;" role="presentation"
                                                  cellpadding="0" cellspacing="0" width="100%" border="0">
                                                  <tbody>
                                                      <tr>
                                                          <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:courier new,courier;"
                                                              align="left">
  
                                                              <h1
                                                                  style="margin: 0px; line-height: 140%; text-align: left; word-wrap: break-word; font-weight: normal; font-family: courier new,courier; font-size: 22px;">
                                                                  Hello ${user.name}, thank you for subscribing ${campaignName}
                                                                  </h1>

                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
          
                                                      <table style="font-family:courier new,courier;" role="presentation"
                                                          cellpadding="0" cellspacing="0" width="100%" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:courier new,courier;"
                                                                      align="left">
          
                                                                      <div
                                                                          style="line-height: 170%; text-align: left; word-wrap: break-word;">
                                                                          <p style="font-size: 14px; line-height: 170%;"><span
                                                                                  style="font-family: 'courier new', courier; font-size: 16px; line-height: 27.2px;">${content}</p>
                                                                          <p style="font-size: 14px; line-height: 170%;">&nbsp;
                                                                          </p>
                                                                          <p style="font-size: 14px; line-height: 170%;"><span
                                                                                  style="font-family: 'courier new', courier; font-size: 16px; line-height: 27.2px;">Thank
                                                                                  you.</span></p>
                                                                          <p style="font-size: 14px; line-height: 170%;"><span
                                                                                  style="font-family: 'courier new', courier; font-size: 16px; line-height: 27.2px;">${process.env.SEND_EMAIL_lUCIS_NETWORK},</span></p>
                                                                          <p style="font-size: 14px; line-height: 170%;">
                                                                              <br /><span
                                                                                  style="font-family: 'courier new', courier; font-size: 16px; line-height: 27.2px;"><em><strong><span
                                                                                              style="line-height: 27.2px; font-size: 16px;">
                                                                                              Contact us: ${process.env.CONTACT_US}</span></strong></em></span>
                                                                          </p>
                                                                      </div>
          
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
          
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </body>
          
          </html>
    `;
};

export const verify_template = (user: UserInput) => {
  return `
    <!DOCTYPE html>
<html>

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style type="text/css">
        @media screen {
            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 400;
                src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 700;
                src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 400;
                src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 700;
                src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
            }
        }

        /* CLIENT-SPECIFIC STYLES */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
        }

        /* RESET STYLES */
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        table {
            border-collapse: collapse !important;
        }

        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* MOBILE STYLES */
        @media screen and (max-width:600px) {
            h1 {
                font-size: 32px !important;
                line-height: 32px !important;
            }
        }

        /* ANDROID CENTER FIX */
        div[style*="margin: 16px 0;"] {
            margin: 0 !important;
        }
    </style>
</head>

<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
    <!-- HIDDEN PREHEADER TEXT -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account. </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <!-- LOGO -->
        <tr>
            <td bgcolor="#FFA73B" align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#FFA73B" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                            <h1 style="font-size: 48px; font-weight: 400; margin: 2;">Hello ${user.name}!</h1> <img src=" https://img.icons8.com/clouds/100/000000/handshake.png" width="125" height="120" style="display: block; border: 0px;" />
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 3px;" bgcolor="#FFA73B"><a href="#" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #FFA73B; display: inline-block;">Confirm Account</a></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>                  
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">If you have any questions, just reply to this email—we're always happy to help out.</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">Cheers,<br>${process.env.VERIFY_EMAIL_LUCIS_NETWORK}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#FFECD1" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Need more help?</h2>
                            <p style="margin: 0;"><a href="#" target="_blank" style="color: #FFA73B;">We&rsquo;re here to help you out</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;"> <br>
                            <p style="margin: 0;">If these emails get annoying, please feel free to <a href="#" target="_blank" style="color: #111111; font-weight: 700;">unsubscribe</a>.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
    `;
};
